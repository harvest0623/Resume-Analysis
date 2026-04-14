import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime


class HistoryStore:
    def __init__(self, storage_path: str = "data/history.json"):
        self.storage_path = storage_path
        self.resumes: Dict[str, Dict[str, Any]] = {}
        self._ensure_storage_dir()
        self._load_from_disk()

    def _ensure_storage_dir(self):
        dir_path = os.path.dirname(self.storage_path)
        if dir_path and not os.path.exists(dir_path):
            os.makedirs(dir_path)

    def _load_from_disk(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.resumes = data.get('resumes', {})
            except Exception as e:
                print(f"Error loading history: {e}")
                self.resumes = {}

    def _save_to_disk(self):
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump({'resumes': self.resumes}, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving history: {e}")

    def add(self, resume: Dict[str, Any]) -> str:
        resume_id = resume.get('id')
        if not resume_id:
            resume_id = f"resume_{int(datetime.now().timestamp())}"
            resume['id'] = resume_id
        
        self.resumes[resume_id] = resume
        self._save_to_disk()
        return resume_id

    def get(self, resume_id: str) -> Optional[Dict[str, Any]]:
        return self.resumes.get(resume_id)

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self.resumes.values())

    def delete(self, resume_id: str) -> bool:
        if resume_id in self.resumes:
            del self.resumes[resume_id]
            self._save_to_disk()
            return True
        return False

    def clear(self) -> None:
        self.resumes = {}
        self._save_to_disk()

    def search(self, keyword: str) -> List[Dict[str, Any]]:
        results = []
        keyword_lower = keyword.lower()
        
        for resume in self.resumes.values():
            name = resume.get('basicInfo', {}).get('name', '').lower()
            email = resume.get('basicInfo', {}).get('email', '').lower()
            position = resume.get('jobInfo', {}).get('position', '').lower()
            
            if (keyword_lower in name or 
                keyword_lower in email or 
                keyword_lower in position):
                results.append(resume)
        
        return results
