import json
import os
import re
import stat
import shutil
from typing import Dict, Any, List, Optional, Set
from datetime import datetime


class HistoryStore:
    """
    按用户档案隔离的本地历史记录存储
    每个 profile 有独立目录：data/users/<profile_id>/history.json
    目录权限设为 0o700（仅本人可访问），文件权限 0o600
    """

    # 允许的 profile_id 字符（防止路径注入）
    SAFE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_]{1,64}$")

    def __init__(self, base_dir: str = "data/users"):
        self.base_dir = base_dir
        # 已加载到内存的档案集合（区分"未加载"和"已加载但是空"）
        self._loaded: Set[str] = set()
        self._data: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._ensure_base_dir()

    def _ensure_base_dir(self):
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)
            try:
                os.chmod(self.base_dir, stat.S_IRWXU)
            except Exception:
                pass

    def _safe_profile_id(self, profile_id: str) -> str:
        """验证 profile_id 防止路径注入"""
        if not profile_id or not self.SAFE_ID_PATTERN.match(profile_id):
            raise ValueError("Invalid profile_id")
        return profile_id

    def _profile_dir(self, profile_id: str) -> str:
        pid = self._safe_profile_id(profile_id)
        return os.path.join(self.base_dir, pid)

    def _history_file(self, profile_id: str) -> str:
        return os.path.join(self._profile_dir(profile_id), "history.json")

    def _uploads_dir(self, profile_id: str) -> str:
        return os.path.join(self._profile_dir(profile_id), "uploads")

    def _load_profile(self, profile_id: str) -> Dict[str, Dict[str, Any]]:
        """加载某个档案的历史（首次访问时从磁盘读取）"""
        if profile_id in self._loaded:
            return self._data[profile_id]

        path = self._history_file(profile_id)
        loaded: Dict[str, Dict[str, Any]] = {}

        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # 兼容：旧格式 {resumes: {...}} → 扁平化
                if 'resumes' in data and isinstance(data.get('resumes'), dict):
                    first_v = next(iter(data['resumes'].values()), None)
                    if isinstance(first_v, dict) and 'basicInfo' in first_v:
                        loaded = data['resumes']
                    else:
                        loaded = data
                else:
                    loaded = data or {}
            except Exception as e:
                print(f"Error loading profile {profile_id}: {e}")
                loaded = {}

        self._data[profile_id] = loaded
        self._loaded.add(profile_id)
        return loaded

    def _save_profile(self, profile_id: str):
        """保存某个档案到磁盘"""
        pid = self._safe_profile_id(profile_id)
        pdir = self._profile_dir(pid)
        if not os.path.exists(pdir):
            os.makedirs(pdir)
            try:
                os.chmod(pdir, stat.S_IRWXU)
            except Exception:
                pass

        path = self._history_file(pid)
        data = self._data.get(pid, {})
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            try:
                os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
            except Exception:
                pass
        except Exception as e:
            print(f"Error saving profile {pid}: {e}")

    def _ensure_uploads_dir(self, profile_id: str) -> str:
        """确保档案的 uploads 目录存在，返回路径"""
        pid = self._safe_profile_id(profile_id)
        udir = self._uploads_dir(pid)
        if not os.path.exists(udir):
            os.makedirs(udir)
            try:
                os.chmod(udir, stat.S_IRWXU)
            except Exception:
                pass
        return udir

    # ─── 公开 API ───

    def get_uploads_dir(self, profile_id: str) -> str:
        return self._ensure_uploads_dir(profile_id)

    def add(self, profile_id: str, resume: Dict[str, Any]) -> str:
        """添加简历到指定档案的数据空间"""
        self._safe_profile_id(profile_id)

        resume_id = resume.get('id')
        if not resume_id:
            resume_id = f"resume_{int(datetime.now().timestamp())}"
            resume['id'] = resume_id

        data = self._load_profile(profile_id)
        data[resume_id] = resume
        self._save_profile(profile_id)
        return resume_id

    def get(self, profile_id: str, resume_id: str) -> Optional[Dict[str, Any]]:
        if not profile_id or not resume_id:
            return None
        self._safe_profile_id(profile_id)
        data = self._load_profile(profile_id)
        return data.get(resume_id)

    def get_all(self, profile_id: str) -> List[Dict[str, Any]]:
        if not profile_id:
            return []
        self._safe_profile_id(profile_id)
        data = self._load_profile(profile_id)
        return list(data.values())

    def delete(self, profile_id: str, resume_id: str) -> bool:
        if not profile_id or not resume_id:
            return False
        self._safe_profile_id(profile_id)
        data = self._load_profile(profile_id)
        if resume_id in data:
            del data[resume_id]
            self._save_profile(profile_id)
            return True
        return False

    def search(self, profile_id: str, keyword: str) -> List[Dict[str, Any]]:
        if not profile_id:
            return []
        self._safe_profile_id(profile_id)
        keyword_lower = keyword.lower()

        results = []
        for resume in self._load_profile(profile_id).values():
            name = resume.get('basicInfo', {}).get('name', '').lower()
            email = resume.get('basicInfo', {}).get('email', '').lower()
            position = resume.get('jobInfo', {}).get('position', '').lower()
            if (keyword_lower in name or
                keyword_lower in email or
                keyword_lower in position):
                results.append(resume)
        return results

    def list_profiles(self) -> List[str]:
        """列出所有档案 ID"""
        if not os.path.exists(self.base_dir):
            return []
        result = []
        for entry in os.listdir(self.base_dir):
            if self.SAFE_ID_PATTERN.match(entry) and os.path.isdir(os.path.join(self.base_dir, entry)):
                result.append(entry)
        return result

    def profile_exists(self, profile_id: str) -> bool:
        try:
            self._safe_profile_id(profile_id)
        except ValueError:
            return False
        return os.path.isdir(self._profile_dir(profile_id))

    def get_profile_pdf_path(self, profile_id: str, resume_id: str) -> str:
        udir = self._ensure_uploads_dir(profile_id)
        return os.path.join(udir, f"{resume_id}.pdf")

    def cleanup_orphan_uploads(self, profile_id: str, valid_resume_ids: set):
        udir = self._uploads_dir(profile_id)
        if not os.path.exists(udir):
            return
        for fname in os.listdir(udir):
            if fname.endswith('.pdf'):
                rid = fname[:-4]
                if rid not in valid_resume_ids:
                    try:
                        os.remove(os.path.join(udir, fname))
                    except Exception:
                        pass

    # ─── 兼容 ───

    def clear(self, profile_id: str = None) -> None:
        if profile_id:
            self._safe_profile_id(profile_id)
            pdir = self._profile_dir(profile_id)
            if os.path.exists(pdir):
                shutil.rmtree(pdir, ignore_errors=True)
            self._data.pop(profile_id, None)
            self._loaded.discard(profile_id)
