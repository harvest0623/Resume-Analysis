from typing import Dict, Any, List
import re


class Matcher:
    def __init__(self, job_description: str, requirements: str):
        self.job_description = job_description
        self.requirements = requirements
        self.keywords = self.extract_keywords()

    def extract_keywords(self) -> List[str]:
        text = self.job_description + " " + self.requirements
        common_keywords = [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
            'Node.js', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Swift', 'Kotlin',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'Machine Learning', 'Deep Learning',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'REST API', 'GraphQL'
        ]
        
        found_keywords = []
        for keyword in common_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
                found_keywords.append(keyword)
        
        return found_keywords if found_keywords else ['Python', 'JavaScript', 'React']

    def calculate_skills_match(self, resume_skills: List[str]) -> float:
        if not resume_skills or resume_skills[0] == '未检测到技能':
            return 30
        
        match_count = sum(1 for skill in resume_skills if skill in self.keywords)
        total_keywords = len(self.keywords)
        
        if total_keywords == 0:
            return 50
        
        return min((match_count / total_keywords) * 100, 100)

    def calculate_experience_match(self, work_years: str) -> float:
        experience_keywords = ['3年', '5年', '经验', '工作经历']
        has_requirement = any(keyword in self.requirements for keyword in experience_keywords)
        
        if not has_requirement:
            return 70
        
        if work_years == '未知':
            return 50
        
        year_match = work_years.replace('年', '')
        if '-' in year_match:
            try:
                start, end = map(int, year_match.split('-'))
                avg_years = (start + end) / 2
            except:
                avg_years = 3
        else:
            try:
                avg_years = float(year_match)
            except:
                avg_years = 3
        
        if avg_years >= 5:
            return 90
        elif avg_years >= 3:
            return 75
        elif avg_years >= 1:
            return 60
        else:
            return 45

    def calculate_education_match(self, education: str) -> float:
        education_keywords = ['本科', '硕士', '学历', '学位']
        has_requirement = any(keyword in self.requirements for keyword in education_keywords)
        
        if not has_requirement:
            return 70
        
        education_scores = {
            '博士': 95,
            '硕士': 85,
            '本科': 75,
            '大专': 55,
            '高中': 40,
            '未知': 50
        }
        
        return education_scores.get(education, 50)

    def calculate_overall_match(self, skills_match: float, experience_match: float, education_match: float) -> float:
        weights = {
            'skills': 0.5,
            'experience': 0.3,
            'education': 0.2
        }
        
        overall = (
            skills_match * weights['skills'] +
            experience_match * weights['experience'] +
            education_match * weights['education']
        )
        
        return round(overall, 1)

    def generate_highlights(self, resume_data: Dict[str, Any]) -> List[str]:
        highlights = []
        
        skills = resume_data.get('skills', [])
        matching_skills = [skill for skill in skills if skill in self.keywords]
        
        if matching_skills:
            highlights.append(f"技能匹配：掌握 {', '.join(matching_skills[:3])}")
        
        work_years = resume_data.get('background', {}).get('workYears', '未知')
        if work_years != '未知':
            highlights.append(f"工作经验：{work_years}")
        
        education = resume_data.get('background', {}).get('education', '未知')
        if education != '未知':
            highlights.append(f"学历背景：{education}")
        
        return highlights if highlights else ['候选人基本符合岗位要求']

    def match_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        skills = resume_data.get('skills', [])
        work_years = resume_data.get('background', {}).get('workYears', '未知')
        education = resume_data.get('background', {}).get('education', '未知')
        
        skills_match = self.calculate_skills_match(skills)
        experience_match = self.calculate_experience_match(work_years)
        education_match = self.calculate_education_match(education)
        overall_match = self.calculate_overall_match(skills_match, experience_match, education_match)
        
        highlights = self.generate_highlights(resume_data)
        
        return {
            'matchScore': overall_match,
            'details': {
                'skillsMatch': skills_match,
                'experienceMatch': experience_match,
                'educationMatch': education_match
            },
            'highlights': highlights
        }
