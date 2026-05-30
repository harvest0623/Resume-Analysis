from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import re
from collections import defaultdict


class SkillProficiency(Enum):
    BEGINNER = 1
    INTERMEDIATE = 2
    ADVANCED = 3
    EXPERT = 4


class SkillCategory(Enum):
    FRONTEND = "frontend"
    BACKEND = "backend"
    DATABASE = "database"
    DEVOPS = "devops"
    MOBILE = "mobile"
    AI_ML = "ai_ml"
    DATA = "data"
    SECURITY = "security"
    DESIGN = "design"
    OTHER = "other"


@dataclass
class SkillConfig:
    name: str
    category: SkillCategory
    base_weight: float = 1.0
    proficiency_multiplier: Dict[SkillProficiency, float] = field(default_factory=lambda: {
        SkillProficiency.BEGINNER: 0.6,
        SkillProficiency.INTERMEDIATE: 0.8,
        SkillProficiency.ADVANCED: 1.0,
        SkillProficiency.EXPERT: 1.2
    })
    related_skills: List[str] = field(default_factory=list)


@dataclass
class IndustrySkillMapping:
    industry: str
    core_skills: List[str]
    important_skills: List[str]
    bonus_skills: List[str]


@dataclass
class ComparisonConfig:
    skills_weight: float = 0.45
    experience_weight: float = 0.30
    education_weight: float = 0.25
    skill_match_threshold: float = 0.6
    experience_years_weight: float = 0.4
    project_quality_weight: float = 0.3
    position_match_weight: float = 0.3
    education_level_weight: float = 0.5
    major_match_weight: float = 0.3
    university_rank_weight: float = 0.2


@dataclass
class EnhancedComparisonResult:
    overall_score: float
    skills_score: float
    experience_score: float
    education_score: float
    skill_details: Dict[str, Any]
    experience_details: Dict[str, Any]
    education_details: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    priority_analysis: Dict[str, float]


class AdvancedMatcher:
    def __init__(self, job_description: str = "", requirements: str = "", 
                 config: Optional[ComparisonConfig] = None):
        self.job_description = job_description
        self.requirements = requirements
        self.config = config or ComparisonConfig()
        self.skill_configs = self._init_skill_configs()
        self.industry_mappings = self._init_industry_mappings()
        self.extracted_keywords = self._extract_keywords()
        self.detected_industry = self._detect_industry()

    def _init_skill_configs(self) -> Dict[str, SkillConfig]:
        configs = {}
        
        frontend_skills = [
            ("React", SkillCategory.FRONTEND, 1.2),
            ("Vue", SkillCategory.FRONTEND, 1.1),
            ("Angular", SkillCategory.FRONTEND, 1.0),
            ("Next.js", SkillCategory.FRONTEND, 1.1),
            ("TypeScript", SkillCategory.FRONTEND, 1.15),
            ("JavaScript", SkillCategory.FRONTEND, 1.0),
            ("HTML", SkillCategory.FRONTEND, 0.8),
            ("CSS", SkillCategory.FRONTEND, 0.8),
            ("Tailwind", SkillCategory.FRONTEND, 0.9),
            ("Webpack", SkillCategory.FRONTEND, 0.9),
            ("Vite", SkillCategory.FRONTEND, 0.9),
        ]
        
        backend_skills = [
            ("Node.js", SkillCategory.BACKEND, 1.1),
            ("Python", SkillCategory.BACKEND, 1.1),
            ("Java", SkillCategory.BACKEND, 1.1),
            ("Go", SkillCategory.BACKEND, 1.15),
            ("Rust", SkillCategory.BACKEND, 1.2),
            ("C++", SkillCategory.BACKEND, 1.0),
            ("C#", SkillCategory.BACKEND, 1.0),
            ("PHP", SkillCategory.BACKEND, 0.9),
            ("Ruby", SkillCategory.BACKEND, 0.95),
            ("Express", SkillCategory.BACKEND, 1.0),
            ("Django", SkillCategory.BACKEND, 1.0),
            ("Flask", SkillCategory.BACKEND, 0.95),
            ("Spring", SkillCategory.BACKEND, 1.05),
        ]
        
        database_skills = [
            ("MySQL", SkillCategory.DATABASE, 1.0),
            ("PostgreSQL", SkillCategory.DATABASE, 1.05),
            ("MongoDB", SkillCategory.DATABASE, 1.0),
            ("Redis", SkillCategory.DATABASE, 1.1),
            ("Elasticsearch", SkillCategory.DATABASE, 1.05),
            ("Oracle", SkillCategory.DATABASE, 0.95),
            ("SQL Server", SkillCategory.DATABASE, 0.9),
        ]
        
        devops_skills = [
            ("Docker", SkillCategory.DEVOPS, 1.1),
            ("Kubernetes", SkillCategory.DEVOPS, 1.2),
            ("AWS", SkillCategory.DEVOPS, 1.1),
            ("Azure", SkillCategory.DEVOPS, 1.05),
            ("GCP", SkillCategory.DEVOPS, 1.05),
            ("CI/CD", SkillCategory.DEVOPS, 1.0),
            ("Jenkins", SkillCategory.DEVOPS, 0.95),
            ("GitLab CI", SkillCategory.DEVOPS, 0.95),
            ("Linux", SkillCategory.DEVOPS, 0.9),
            ("Nginx", SkillCategory.DEVOPS, 0.9),
            ("Terraform", SkillCategory.DEVOPS, 1.05),
        ]
        
        ai_ml_skills = [
            ("Machine Learning", SkillCategory.AI_ML, 1.2),
            ("Deep Learning", SkillCategory.AI_ML, 1.25),
            ("TensorFlow", SkillCategory.AI_ML, 1.1),
            ("PyTorch", SkillCategory.AI_ML, 1.15),
            ("NLP", SkillCategory.AI_ML, 1.1),
            ("Computer Vision", SkillCategory.AI_ML, 1.1),
            ("Data Analysis", SkillCategory.AI_ML, 1.0),
            ("Pandas", SkillCategory.AI_ML, 0.95),
            ("Scikit-learn", SkillCategory.AI_ML, 1.0),
        ]
        
        mobile_skills = [
            ("Swift", SkillCategory.MOBILE, 1.1),
            ("Kotlin", SkillCategory.MOBILE, 1.1),
            ("React Native", SkillCategory.MOBILE, 1.05),
            ("Flutter", SkillCategory.MOBILE, 1.1),
            ("iOS", SkillCategory.MOBILE, 1.0),
            ("Android", SkillCategory.MOBILE, 1.0),
        ]
        
        all_skills = frontend_skills + backend_skills + database_skills + devops_skills + ai_ml_skills + mobile_skills
        
        related_skills_map = {
            "React": ["Vue", "Angular", "Next.js", "TypeScript"],
            "Vue": ["React", "Angular", "Nuxt.js"],
            "Python": ["Django", "Flask", "FastAPI"],
            "Java": ["Spring", "Spring Boot"],
            "Docker": ["Kubernetes", "CI/CD"],
            "Kubernetes": ["Docker", "AWS", "Azure"],
            "AWS": ["Azure", "GCP", "Docker"],
            "Machine Learning": ["Deep Learning", "Python", "TensorFlow", "PyTorch"],
            "Deep Learning": ["Machine Learning", "TensorFlow", "PyTorch"],
        }
        
        for name, category, weight in all_skills:
            related = related_skills_map.get(name, [])
            configs[name] = SkillConfig(
                name=name,
                category=category,
                base_weight=weight,
                related_skills=related
            )
        
        return configs

    def _init_industry_mappings(self) -> Dict[str, IndustrySkillMapping]:
        return {
            "互联网": IndustrySkillMapping(
                industry="互联网",
                core_skills=["JavaScript", "TypeScript", "React", "Vue", "Node.js", "Python", "Java"],
                important_skills=["Docker", "Kubernetes", "AWS", "Redis", "MongoDB", "MySQL"],
                bonus_skills=["GraphQL", "Microservices", "CI/CD", "Agile"]
            ),
            "金融科技": IndustrySkillMapping(
                industry="金融科技",
                core_skills=["Java", "Python", "MySQL", "Redis", "Spring"],
                important_skills=["Docker", "Kubernetes", "AWS", "Security", "Blockchain"],
                bonus_skills=["Risk Management", "Compliance", "Data Analysis"]
            ),
            "人工智能": IndustrySkillMapping(
                industry="人工智能",
                core_skills=["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
                important_skills=["NLP", "Computer Vision", "Data Analysis", "Pandas", "Scikit-learn"],
                bonus_skills=["Research", "Publications", "PhD"]
            ),
            "移动开发": IndustrySkillMapping(
                industry="移动开发",
                core_skills=["Swift", "Kotlin", "React Native", "Flutter"],
                important_skills=["iOS", "Android", "REST API", "Git"],
                bonus_skills=["UI/UX", "App Store", "Performance Optimization"]
            ),
            "数据工程": IndustrySkillMapping(
                industry="数据工程",
                core_skills=["Python", "SQL", "Spark", "Hadoop", "Kafka"],
                important_skills=["AWS", "Airflow", "Data Modeling", "ETL"],
                bonus_skills=["Data Governance", "Data Quality", "Real-time Processing"]
            ),
        }

    def _extract_keywords(self) -> List[str]:
        text = self.job_description + " " + self.requirements
        found_keywords = []
        
        for skill_name in self.skill_configs:
            if re.search(r'\b' + re.escape(skill_name) + r'\b', text, re.IGNORECASE):
                found_keywords.append(skill_name)
        
        return found_keywords if found_keywords else ["Python", "JavaScript"]

    def _detect_industry(self) -> str:
        text = self.job_description.lower()
        
        industry_keywords = {
            "互联网": ["互联网", "web", "网站", "电商平台", "社交", "saas"],
            "金融科技": ["金融", "银行", "支付", "区块链", "fintech"],
            "人工智能": ["人工智能", "ai", "机器学习", "深度学习", "算法"],
            "移动开发": ["移动", "app", "ios", "android", "移动端"],
            "数据工程": ["数据", "大数据", "数据仓库", "数据平台", "etl"],
        }
        
        for industry, keywords in industry_keywords.items():
            if any(kw in text for kw in keywords):
                return industry
        
        return "互联网"

    def calculate_skill_proficiency(self, skill_name: str, context: str = "") -> SkillProficiency:
        skill_lower = skill_name.lower()
        context_lower = context.lower()
        
        expert_patterns = [r'专家', r'精通', r'深入', r'资深', r'架构', r'expert', r'master']
        advanced_patterns = r'熟练|熟悉|掌握|advanced|proficient'
        intermediate_patterns = r'了解|使用过|基础|intermediate'
        
        for pattern in expert_patterns:
            if re.search(pattern, context_lower):
                return SkillProficiency.EXPERT
        
        if re.search(advanced_patterns, context_lower):
            return SkillProficiency.ADVANCED
        
        if re.search(intermediate_patterns, context_lower):
            return SkillProficiency.INTERMEDIATE
        
        return SkillProficiency.INTERMEDIATE

    def calculate_skills_match(self, resume_skills: List[str], context: str = "") -> Tuple[float, Dict[str, Any]]:
        if not resume_skills or resume_skills[0] == '未检测到技能':
            return 30.0, {"matched": [], "unmatched": [], "bonus": [], "category_scores": {}}
        
        matched_skills = []
        unmatched_skills = []
        bonus_skills = []
        category_scores = defaultdict(list)
        
        industry_mapping = self.industry_mappings.get(self.detected_industry)
        
        for skill in resume_skills:
            skill_config = self.skill_configs.get(skill)
            
            if skill in self.extracted_keywords:
                proficiency = self.calculate_skill_proficiency(skill, context)
                weight = skill_config.base_weight if skill_config else 1.0
                proficiency_mult = skill_config.proficiency_multiplier.get(proficiency, 1.0) if skill_config else 1.0
                
                category = skill_config.category.value if skill_config else "other"
                category_scores[category].append(weight * proficiency_mult)
                
                matched_skills.append({
                    "name": skill,
                    "weight": weight,
                    "proficiency": proficiency.name,
                    "score": weight * proficiency_mult
                })
            else:
                unmatched_skills.append(skill)
                
                if industry_mapping:
                    if skill in industry_mapping.bonus_skills:
                        bonus_skills.append(skill)
        
        if industry_mapping:
            for skill in resume_skills:
                if skill in industry_mapping.core_skills and skill not in [m["name"] for m in matched_skills]:
                    weight = self.skill_configs[skill].base_weight if skill in self.skill_configs else 1.0
                    category_scores["core"].append(weight * 0.8)
                    bonus_skills.append(skill)
        
        base_score = min(len(matched_skills) / max(len(self.extracted_keywords), 1) * 80, 80)
        
        bonus_score = min(len(bonus_skills) * 3, 15)
        
        category_bonus = 0
        if industry_mapping:
            core_matched = sum(1 for s in matched_skills if s["name"] in industry_mapping.core_skills)
            core_ratio = core_matched / max(len(industry_mapping.core_skills), 1)
            category_bonus = core_ratio * 5
        
        total_score = min(base_score + bonus_score + category_bonus, 100)
        
        details = {
            "matched": matched_skills,
            "unmatched": unmatched_skills,
            "bonus": bonus_skills,
            "category_scores": dict(category_scores),
            "base_score": base_score,
            "bonus_score": bonus_score,
            "category_bonus": category_bonus,
            "industry": self.detected_industry
        }
        
        return round(total_score, 1), details

    def calculate_experience_match(self, work_years: str, position: str = "", 
                                   projects: List[str] = None) -> Tuple[float, Dict[str, Any]]:
        if work_years == '未知':
            return 50.0, {"years": 0, "position_match": 0, "project_score": 0}
        
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
            years_score = 100
        elif avg_years >= 7:
            years_score = 90
        elif avg_years >= 5:
            years_score = 80
        elif avg_years >= 3:
            years_score = 70
        elif avg_years >= 2:
            years_score = 60
        elif avg_years >= 1:
            years_score = 50
        else:
            years_score = 35
        
        position_score = self._calculate_position_match(position)
        
        project_score = self._calculate_project_quality(projects or [])
        
        total_score = (
            years_score * self.config.experience_years_weight +
            position_score * self.config.position_match_weight +
            project_score * self.config.project_quality_weight
        )
        
        details = {
            "years": avg_years,
            "years_score": years_score,
            "position_match": position_score,
            "project_score": project_score,
            "total_score": round(total_score, 1)
        }
        
        return round(total_score, 1), details

    def _calculate_position_match(self, position: str) -> float:
        if not position:
            return 50.0
        
        position_lower = position.lower()
        
        level_scores = {
            "cto": 100, "技术总监": 95, "架构师": 90,
            "高级": 85, "资深": 85, "senior": 85,
            "中级": 70, "中级": 70, "mid": 70,
            "初级": 55, "junior": 55, "实习": 40
        }
        
        for keyword, score in level_scores.items():
            if keyword in position_lower:
                return score
        
        return 70.0

    def _calculate_project_quality(self, projects: List[str]) -> float:
        if not projects:
            return 50.0
        
        score = 50.0
        
        quality_indicators = {
            "主导": 15, "负责": 12, "核心": 12,
            "优化": 10, "重构": 10, "架构设计": 15,
            "性能提升": 12, "用户增长": 12, "营收": 10,
            "百万": 8, "千万": 10, "亿": 15,
            "团队": 8, "管理": 10, "带领": 12
        }
        
        for project in projects:
            project_lower = project.lower()
            for indicator, bonus in quality_indicators.items():
                if indicator in project_lower:
                    score += bonus
                    break
        
        return min(score, 100.0)

    def calculate_education_match(self, education: str, major: str = "", 
                                  university: str = "") -> Tuple[float, Dict[str, Any]]:
        education_scores = {
            '博士': 100,
            '硕士': 85,
            '本科': 75,
            '大专': 55,
            '高中': 40,
            '未知': 50
        }
        
        education_level = 50.0
        for key, score in education_scores.items():
            if key in education:
                education_level = score
                break
        
        major_score = self._calculate_major_match(major)
        
        university_score = self._calculate_university_rank(university)
        
        total_score = (
            education_level * self.config.education_level_weight +
            major_score * self.config.major_match_weight +
            university_score * self.config.university_rank_weight
        )
        
        details = {
            "education_level": education_level,
            "major_match": major_score,
            "university_rank": university_score,
            "total_score": round(total_score, 1)
        }
        
        return round(total_score, 1), details

    def _calculate_major_match(self, major: str) -> float:
        if not major:
            return 50.0
        
        major_lower = major.lower()
        
        tech_majors = [
            "计算机", "软件工程", "信息技术", "人工智能", "数据科学",
            "电子工程", "通信工程", "自动化", "数学", "统计学"
        ]
        
        related_majors = [
            "信息管理", "电子商务", "物联网", "网络工程", "信息安全"
        ]
        
        for tech_major in tech_majors:
            if tech_major in major_lower:
                return 95.0
        
        for related_major in related_majors:
            if related_major in major_lower:
                return 80.0
        
        return 60.0

    def _calculate_university_rank(self, university: str) -> float:
        if not university:
            return 50.0
        
        university_lower = university.lower()
        
        tier1 = ["清华", "北大", "浙大", "复旦", "上交", "中科院", "中国科学技术大学"]
        tier2 = ["985", "211", "双一流", "重点大学"]
        tier3 = ["一本", "本科院校"]
        
        for uni in tier1:
            if uni in university_lower:
                return 100.0
        
        for keyword in tier2:
            if keyword in university_lower:
                return 85.0
        
        for keyword in tier3:
            if keyword in university_lower:
                return 70.0
        
        return 60.0

    def calculate_priority_weights(self) -> Dict[str, float]:
        priorities = {}
        
        text = self.job_description.lower()
        
        if any(kw in text for kw in ["算法", "机器学习", "深度学习", "ai"]):
            priorities = {
                "skills": 0.50,
                "experience": 0.30,
                "education": 0.20
            }
        elif any(kw in text for kw in ["架构", "技术总监", "cto", "资深"]):
            priorities = {
                "skills": 0.35,
                "experience": 0.45,
                "education": 0.20
            }
        elif any(kw in text for kw in ["研究", "博士", "科研"]):
            priorities = {
                "skills": 0.25,
                "experience": 0.25,
                "education": 0.50
            }
        else:
            priorities = {
                "skills": self.config.skills_weight,
                "experience": self.config.experience_weight,
                "education": self.config.education_weight
            }
        
        return priorities

    def match_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        skills = resume_data.get('skills', [])
        work_years = resume_data.get('background', {}).get('workYears', '未知')
        education = resume_data.get('background', {}).get('education', '未知')
        position = resume_data.get('jobInfo', {}).get('position', '')
        projects = resume_data.get('background', {}).get('projects', [])
        major = resume_data.get('background', {}).get('major', '')
        university = resume_data.get('background', {}).get('university', '')
        
        skills_match, skills_details = self.calculate_skills_match(skills)
        experience_match, experience_details = self.calculate_experience_match(work_years, position, projects)
        education_match, education_details = self.calculate_education_match(education, major, university)
        
        priorities = self.calculate_priority_weights()
        
        overall_match = (
            skills_match * priorities['skills'] +
            experience_match * priorities['experience'] +
            education_match * priorities['education']
        )
        
        highlights = self._generate_highlights(resume_data, skills_details, experience_details, education_details)
        
        return {
            'matchScore': round(overall_match, 1),
            'details': {
                'skillsMatch': skills_match,
                'experienceMatch': experience_match,
                'educationMatch': education_match,
                'priorityWeights': priorities
            },
            'skillsDetails': skills_details,
            'experienceDetails': experience_details,
            'educationDetails': education_details,
            'highlights': highlights
        }

    def _generate_highlights(self, resume_data: Dict[str, Any], 
                            skills_details: Dict, experience_details: Dict, 
                            education_details: Dict) -> List[str]:
        highlights = []
        
        matched_skills = skills_details.get('matched', [])
        if matched_skills:
            skill_names = [s['name'] for s in matched_skills[:3]]
            highlights.append(f"核心技能匹配：{', '.join(skill_names)}")
        
        if skills_details.get('bonus'):
            highlights.append(f"行业加分技能：{', '.join(skills_details['bonus'][:2])}")
        
        years = experience_details.get('years', 0)
        if years >= 5:
            highlights.append(f"经验丰富：{years}年工作经验")
        elif years >= 3:
            highlights.append(f"工作年限：{years}年")
        
        if experience_details.get('project_score', 0) >= 70:
            highlights.append("项目经验丰富，有主导项目经验")
        
        education_level = education_details.get('education_level', 0)
        if education_level >= 85:
            highlights.append("学历优秀：硕士及以上")
        
        university_rank = education_details.get('university_rank', 0)
        if university_rank >= 85:
            highlights.append("名校背景")
        
        return highlights if highlights else ['候选人基本符合岗位要求']

    def compare_resumes(self, resume1: Dict[str, Any], resume2: Dict[str, Any]) -> Dict[str, Any]:
        result1 = self.match_resume(resume1)
        result2 = self.match_resume(resume2)
        
        strengths = {
            resume1.get('id', 'resume1'): [],
            resume2.get('id', 'resume2'): []
        }
        weaknesses = {
            resume1.get('id', 'resume1'): [],
            resume2.get('id', 'resume2'): []
        }
        
        score1 = result1['matchScore']
        score2 = result2['matchScore']
        
        if score1 > score2 + 5:
            strengths[resume1.get('id', 'resume1')].append(f"综合匹配度更高（{score1} vs {score2}）")
            weaknesses[resume2.get('id', 'resume2')].append(f"综合匹配度较低（{score2} vs {score1}）")
        elif score2 > score1 + 5:
            strengths[resume2.get('id', 'resume2')].append(f"综合匹配度更高（{score2} vs {score1}）")
            weaknesses[resume1.get('id', 'resume1')].append(f"综合匹配度较低（{score1} vs {score2}）")
        
        skills1 = result1['details']['skillsMatch']
        skills2 = result2['details']['skillsMatch']
        if skills1 > skills2 + 10:
            strengths[resume1.get('id', 'resume1')].append(f"技能匹配度更高（{skills1} vs {skills2}）")
            weaknesses[resume2.get('id', 'resume2')].append(f"技能匹配度较低（{skills2} vs {skills1}）")
        elif skills2 > skills1 + 10:
            strengths[resume2.get('id', 'resume2')].append(f"技能匹配度更高（{skills2} vs {skills1}）")
            weaknesses[resume1.get('id', 'resume1')].append(f"技能匹配度较低（{skills1} vs {skills2}）")
        
        exp1 = result1['details']['experienceMatch']
        exp2 = result2['details']['experienceMatch']
        if exp1 > exp2 + 10:
            strengths[resume1.get('id', 'resume1')].append(f"工作经验更丰富（{exp1} vs {exp2}）")
            weaknesses[resume2.get('id', 'resume2')].append(f"工作经验相对不足（{exp2} vs {exp1}）")
        elif exp2 > exp1 + 10:
            strengths[resume2.get('id', 'resume2')].append(f"工作经验更丰富（{exp2} vs {exp1}）")
            weaknesses[resume1.get('id', 'resume1')].append(f"工作经验相对不足（{exp1} vs {exp2}）")
        
        edu1 = result1['details']['educationMatch']
        edu2 = result2['details']['educationMatch']
        if edu1 > edu2 + 10:
            strengths[resume1.get('id', 'resume1')].append(f"学历背景更优（{edu1} vs {edu2}）")
            weaknesses[resume2.get('id', 'resume2')].append(f"学历背景相对较低（{edu2} vs {edu1}）")
        elif edu2 > edu1 + 10:
            strengths[resume2.get('id', 'resume2')].append(f"学历背景更优（{edu2} vs {edu1}）")
            weaknesses[resume1.get('id', 'resume1')].append(f"学历背景相对较低（{edu1} vs {edu2}）")
        
        diff = abs(score1 - score2)
        if diff >= 20:
            name1 = resume1.get('basicInfo', {}).get('name', '候选人1')
            recommendation = f"{name1} 明显更适合该岗位"
        elif diff >= 10:
            name1 = resume1.get('basicInfo', {}).get('name', '候选人1')
            recommendation = f"{name1} 略微更适合该岗位"
        elif diff >= 5:
            recommendation = "两位候选人实力相近，建议进一步面试考察"
        else:
            recommendation = "两位候选人匹配度相当，建议综合考虑其他因素"
        
        return {
            'resumes': [resume1, resume2],
            'results': [result1, result2],
            'comparison': {
                'overallDiff': round(diff, 1),
                'strengths': strengths,
                'weaknesses': weaknesses,
                'recommendation': recommendation,
                'priorityWeights': result1['details']['priorityWeights']
            }
        }


def create_custom_config(skills_weight: float = 0.45, experience_weight: float = 0.30,
                         education_weight: float = 0.25, **kwargs) -> ComparisonConfig:
    config = ComparisonConfig(
        skills_weight=skills_weight,
        experience_weight=experience_weight,
        education_weight=education_weight
    )
    
    for key, value in kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)
    
    return config


def validate_config(config: ComparisonConfig) -> Tuple[bool, str]:
    total_weight = config.skills_weight + config.experience_weight + config.education_weight
    if abs(total_weight - 1.0) > 0.01:
        return False, f"权重总和必须为1.0，当前为{total_weight}"
    
    if not (0 <= config.skills_weight <= 1):
        return False, "技能权重必须在0-1之间"
    if not (0 <= config.experience_weight <= 1):
        return False, "经验权重必须在0-1之间"
    if not (0 <= config.education_weight <= 1):
        return False, "教育权重必须在0-1之间"
    
    return True, "配置有效"