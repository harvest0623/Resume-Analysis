import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime


class HistoryStore:
    """用户隔离的历史记录存储，所有操作均需传入 user_id"""
    
    def __init__(self, storage_path: str = "data/history.json"):
        self.storage_path = storage_path
        # 数据结构：{ user_id: { resume_id: resume_data } }
        self._data: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._ensure_storage_dir()
        self._load_from_disk()

    def _ensure_storage_dir(self):
        dir_path = os.path.dirname(self.storage_path)
        if dir_path and not os.path.exists(dir_path):
            os.makedirs(dir_path)

    def _load_from_disk(self):
        """从磁盘加载数据，兼容旧版全域存储格式自动迁移"""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    raw = json.load(f)
                
                # 新格式：{ user_id: { resume_id: resume_data } }
                if 'resumes' in raw and not self._is_new_format(raw):
                    # 旧格式迁移：将所有 resume 归入默认 "legacy" 用户
                    old_resumes = raw.get('resumes', {})
                    self._data = {'__legacy__': old_resumes}
                    self._save_to_disk()
                    print(f"HistoryStore: 已迁移 {len(old_resumes)} 条旧记录到 legacy 用户")
                elif self._is_new_format(raw):
                    # 已经是新格式
                    self._data = raw
                else:
                    self._data = raw
            except Exception as e:
                print(f"Error loading history: {e}")
                self._data = {}

    @staticmethod
    def _is_new_format(raw: dict) -> bool:
        """判断是否已经是按用户隔离的新格式"""
        if not raw:
            return False
        if 'resumes' in raw:
            # 旧格式：{ "resumes": { resume_id: data } }
            # 检查 resumes 的值是否是一个 resume 记录（有 id/basicInfo 等字段）
            resumes_val = raw['resumes']
            if resumes_val:
                first_key = next(iter(resumes_val))
                first_val = resumes_val[first_key]
                # 新格式下 resumes 的 value 是另一个 dict of resume 记录
                # 旧格式下 resumes 的 value 直接是 resume 数据
                if isinstance(first_val, dict) and ('resumes' in first_val or 'basicInfo' in first_val or 'scores' in first_val):
                    return False  # 旧格式
            return False
        # 新格式：{ user_id: { resume_id: data } }
        if not raw:
            return True
        first_key = next(iter(raw))
        first_val = raw[first_key]
        return isinstance(first_val, dict) and not ('basicInfo' in first_val or 'scores' in first_val)

    def _save_to_disk(self):
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(self._data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving history: {e}")

    def _ensure_user(self, user_id: str):
        """确保用户数据空间存在"""
        if user_id not in self._data:
            self._data[user_id] = {}

    # ─── 公开 API ───

    def add(self, user_id: str, resume: Dict[str, Any]) -> str:
        """添加简历到指定用户的数据空间"""
        if not user_id:
            raise ValueError("user_id is required for data isolation")
        
        resume_id = resume.get('id')
        if not resume_id:
            resume_id = f"resume_{int(datetime.now().timestamp())}"
            resume['id'] = resume_id
        
        self._ensure_user(user_id)
        self._data[user_id][resume_id] = resume
        self._save_to_disk()
        return resume_id

    def get(self, user_id: str, resume_id: str) -> Optional[Dict[str, Any]]:
        """获取指定用户的指定简历"""
        if not user_id:
            return None
        return self._data.get(user_id, {}).get(resume_id)

    def get_all(self, user_id: str) -> List[Dict[str, Any]]:
        """获取指定用户的所有简历"""
        if not user_id:
            return []
        return list(self._data.get(user_id, {}).values())

    def delete(self, user_id: str, resume_id: str) -> bool:
        """删除指定用户的指定简历"""
        if not user_id:
            return False
        user_data = self._data.get(user_id, {})
        if resume_id in user_data:
            del user_data[resume_id]
            self._save_to_disk()
            return True
        return False

    def clear(self, user_id: str = None) -> None:
        """清空数据：指定用户则清该用户，否则清全部"""
        if user_id:
            self._data.pop(user_id, None)
        else:
            self._data = {}
        self._save_to_disk()

    def search(self, user_id: str, keyword: str) -> List[Dict[str, Any]]:
        """在指定用户的数据中搜索简历"""
        if not user_id:
            return []
        
        results = []
        keyword_lower = keyword.lower()
        
        for resume in self._data.get(user_id, {}).values():
            name = resume.get('basicInfo', {}).get('name', '').lower()
            email = resume.get('basicInfo', {}).get('email', '').lower()
            position = resume.get('jobInfo', {}).get('position', '').lower()
            
            if (keyword_lower in name or 
                keyword_lower in email or 
                keyword_lower in position):
                results.append(resume)
        
        return results