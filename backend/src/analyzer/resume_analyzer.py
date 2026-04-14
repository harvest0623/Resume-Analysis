import random
from typing import Dict, Any, List


class ResumeAnalyzer:
    def __init__(self, extracted_data: Dict[str, Any]):
        self.data = extracted_data

    def calculate_skill_score(self) -> int:
        skills = self.data.get('skills', [])
        if not skills or skills[0] == '未检测到技能':
            return 40
        
        skill_count = len(skills)
        base_score = min(skill_count * 8, 80)
        
        premium_skills = ['Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Go', 'Rust']
        premium_count = sum(1 for skill in skills if skill in premium_skills)
        bonus = min(premium_count * 5, 20)
        
        return min(base_score + bonus, 100)

    def calculate_experience_score(self) -> int:
        work_years = self.data.get('background', {}).get('workYears', '未知')
        
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
        
        if avg_years >= 10:
            return 95
        elif avg_years >= 7:
            return 85
        elif avg_years >= 5:
            return 75
        elif avg_years >= 3:
            return 65
        elif avg_years >= 1:
            return 55
        else:
            return 45

    def calculate_education_score(self) -> int:
        education = self.data.get('background', {}).get('education', '未知')
        
        education_scores = {
            '博士': 95,
            '硕士': 85,
            '本科': 75,
            '大专': 60,
            '高中': 45,
            '未知': 55
        }
        
        return education_scores.get(education, 55)

    def calculate_overall_score(self, skill_score: int, experience_score: int, education_score: int) -> int:
        weights = {
            'skills': 0.4,
            'experience': 0.35,
            'education': 0.25
        }
        
        overall = (
            skill_score * weights['skills'] +
            experience_score * weights['experience'] +
            education_score * weights['education']
        )
        
        return round(overall)

    def generate_analysis(self, scores: Dict[str, int]) -> str:
        skill_score = scores['skills']
        experience_score = scores['experience']
        education_score = scores['education']
        overall = scores['overall']
        
        analyses = []
        
        if overall >= 85:
            analyses.append("该候选人综合表现优秀，具有很强的竞争力。")
        elif overall >= 70:
            analyses.append("该候选人综合表现良好，符合大部分岗位要求。")
        elif overall >= 60:
            analyses.append("该候选人综合表现一般，需要进一步考察。")
        else:
            analyses.append("该候选人综合表现有待提高，建议谨慎考虑。")
        
        if skill_score >= 80:
            analyses.append("技能方面非常突出，掌握多种主流技术栈。")
        elif skill_score >= 60:
            analyses.append("技能方面较为全面，具备基础的技术能力。")
        else:
            analyses.append("技能方面需要加强，建议补充相关技术学习。")
        
        if experience_score >= 80:
            analyses.append("工作经验丰富，能够快速适应新环境。")
        elif experience_score >= 60:
            analyses.append("有一定的工作经验，具备基本的职业素养。")
        else:
            analyses.append("工作经验相对较少，需要更多实践机会。")
        
        if education_score >= 80:
            analyses.append("教育背景优秀，学习能力较强。")
        elif education_score >= 60:
            analyses.append("教育背景良好，具备基本的知识体系。")
        else:
            analyses.append("教育背景一般，但实际工作能力更为重要。")
        
        return " ".join(analyses)

    def analyze(self) -> Dict[str, Any]:
        skill_score = self.calculate_skill_score()
        experience_score = self.calculate_experience_score()
        education_score = self.calculate_education_score()
        overall_score = self.calculate_overall_score(skill_score, experience_score, education_score)
        
        scores = {
            'overall': overall_score,
            'skills': skill_score,
            'experience': experience_score,
            'education': education_score
        }
        
        analysis = self.generate_analysis(scores)
        
        return {
            'scores': scores,
            'analysis': analysis
        }
