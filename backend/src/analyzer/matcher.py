from typing import Dict, Any, List, Optional
import re


class Matcher:
    def __init__(self, job_description: str, requirements: str, filters: Optional[Dict[str, Any]] = None):
        self.job_description = job_description
        self.requirements = requirements
        self.filters = filters or {}
        self.keywords = self.extract_keywords()
        self.required_skills = self.filters.get('requiredSkills', [])

    def extract_keywords(self) -> List[str]:
        text = self.job_description + " " + self.requirements
        common_keywords = [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
            'Node.js', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Swift', 'Kotlin',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'Machine Learning', 'Deep Learning',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'REST API', 'GraphQL',
            'Spring Boot', 'Django', 'FastAPI', 'Flask', 'Express', 'Next.js',
            'Nuxt', 'Vite', 'Webpack', 'Jenkins', 'Terraform', 'Ansible',
            'TensorFlow', 'PyTorch', 'Spark', 'Hadoop', 'Flink', 'Kafka',
            'RabbitMQ', 'Elasticsearch', 'Figma', 'Sketch'
        ]

        found_keywords = []
        for keyword in common_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
                found_keywords.append(keyword)

        # 合并用户指定的技能
        for skill_item in self.required_skills:
            skill_name = skill_item.get('name', '') if isinstance(skill_item, dict) else str(skill_item)
            if skill_name and skill_name not in found_keywords:
                found_keywords.append(skill_name)

        return found_keywords if found_keywords else ['Python', 'JavaScript', 'React']

    def _parse_years(self, work_years: str) -> float:
        if work_years == '未知' or not work_years:
            return 0
        year_match = work_years.replace('年', '').replace(' ', '')
        if '-' in year_match:
            try:
                start, end = map(int, year_match.split('-'))
                return (start + end) / 2
            except (ValueError, TypeError):
                return 0
        else:
            try:
                return float(year_match)
            except (ValueError, TypeError):
                return 0

    def _get_education_rank(self, education: str) -> int:
        """返回学历等级数值，越大越高"""
        ranks = {'博士': 5, '硕士': 4, '本科': 3, '大专': 2, '高中': 1}
        return ranks.get(education, 0)

    def check_filter_pass(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """检查简历是否通过筛选条件，返回是否通过及未通过原因"""
        passed = True
        reasons = []

        if not self.filters:
            return {'passed': True, 'reasons': []}

        # 工作经验筛选
        exp_range = self.filters.get('experienceRange', {})
        if exp_range:
            work_years = resume_data.get('background', {}).get('workYears', '未知')
            years = self._parse_years(work_years)
            min_exp = exp_range.get('min', 0)
            max_exp = exp_range.get('max', 20)
            if years < min_exp:
                passed = False
                reasons.append(f'工作年限不足：要求{min_exp}年以上，当前{work_years}')
            if years > max_exp and max_exp < 20:
                passed = False
                reasons.append(f'工作年限超出：要求{max_exp}年以下')

        # 学历筛选
        edu_level = self.filters.get('educationLevel', '不限')
        if edu_level and edu_level != '不限':
            education = resume_data.get('background', {}).get('education', '未知')
            edu_ranks = {'大专': 2, '本科': 3, '硕士': 4, '博士': 5}
            required_rank = edu_ranks.get(edu_level, 0)
            actual_rank = self._get_education_rank(education)
            if actual_rank < required_rank:
                passed = False
                reasons.append(f'学历不符：要求{edu_level}及以上，当前{education}')

        # 行业背景筛选
        industries = self.filters.get('industryBackground', [])
        if industries:
            resume_text = resume_data.get('analysis', '') + ' '.join(
                resume_data.get('background', {}).get('projects', [])
            )
            industry_keywords = {
                '互联网/IT': ['互联网', 'IT', '软件', '技术', '开发', '前端', '后端', '全栈'],
                '金融': ['金融', '银行', '证券', '基金', '保险', '金融科技', 'FinTech'],
                '教育': ['教育', '在线教育', '教学', '培训', 'EdTech'],
                '医疗健康': ['医疗', '健康', '医药', '生物', '临床', '医疗信息化'],
                '电商': ['电商', '电子商务', '零售', '购物', '商城'],
                '人工智能': ['AI', '人工智能', '机器学习', '深度学习', 'NLP', 'CV', '大模型'],
                '游戏': ['游戏', 'Unity', 'Unreal', '游戏引擎', '游戏开发'],
                '企业服务': ['企业服务', 'SaaS', 'CRM', 'ERP', 'OA', 'B2B'],
                '汽车': ['汽车', '车联网', '自动驾驶', '智能座舱'],
                '制造业': ['制造', '工业', '智能制造', 'IoT', '物联网'],
                '房地产': ['房地产', '地产', 'PropTech'],
                '媒体/内容': ['媒体', '内容', '新媒体', '短视频', '直播'],
                '物流/供应链': ['物流', '供应链', '仓储', '配送'],
                '零售': ['零售', '新零售', 'POS', '会员系统'],
                '咨询': ['咨询', '管理咨询', '战略咨询', 'IT咨询'],
            }
            matched_industry = False
            for ind in industries:
                kw_list = industry_keywords.get(ind, [ind])
                if any(kw in resume_text for kw in kw_list):
                    matched_industry = True
                    break
            if not matched_industry:
                passed = False
                reasons.append(f'行业背景不符：要求{"、".join(industries)}相关经验')

        # 技能要求筛选（用户指定的技能必须包含）
        if self.required_skills:
            resume_skills = [s.lower() for s in resume_data.get('skills', [])]
            missing_skills = []
            for skill_item in self.required_skills:
                skill_name = skill_item.get('name', '') if isinstance(skill_item, dict) else str(skill_item)
                weight = skill_item.get('weight', 1) if isinstance(skill_item, dict) else 1
                if weight >= 3:  # 权重>=3的技能为必须
                    if skill_name.lower() not in resume_skills:
                        missing_skills.append(skill_name)
            if missing_skills:
                passed = False
                reasons.append(f'缺少必须技能：{", ".join(missing_skills)}')

        # 项目经历筛选
        min_projects = self.filters.get('minProjectCount', 0)
        if min_projects > 0:
            projects = resume_data.get('background', {}).get('projects', [])
            if isinstance(projects, list) and len(projects) < min_projects:
                passed = False
                reasons.append(f'项目经历不足：要求{min_projects}个以上，当前{len(projects)}个')

        return {'passed': passed, 'reasons': reasons}

    def calculate_skills_match(self, resume_skills: List[str]) -> float:
        if not resume_skills or resume_skills[0] == '未检测到技能':
            return 30

        # 结合用户指定的带权重技能
        all_keywords = list(self.keywords)
        skill_weights = {}
        for skill_item in self.required_skills:
            name = skill_item.get('name', '') if isinstance(skill_item, dict) else str(skill_item)
            weight = skill_item.get('weight', 1) if isinstance(skill_item, dict) else 1
            if name and name not in all_keywords:
                all_keywords.append(name)
            if name:
                skill_weights[name.lower()] = weight

        if not all_keywords:
            return 50

        score = 0
        max_score = 0
        for keyword in all_keywords:
            w = skill_weights.get(keyword.lower(), 1)
            max_score += w
            if keyword.lower() in [s.lower() for s in resume_skills]:
                score += w

        return min(round((score / max_score) * 100, 1), 100) if max_score > 0 else 50

    def calculate_experience_match(self, work_years: str) -> float:
        experience_keywords = ['3年', '5年', '经验', '工作经历']
        has_requirement = any(keyword in self.requirements for keyword in experience_keywords)

        if not has_requirement and not self.filters.get('experienceRange'):
            return 70

        avg_years = self._parse_years(work_years)
        if avg_years == 0:
            return 50

        # 如果有筛选条件，根据范围匹配
        exp_range = self.filters.get('experienceRange', {})
        if exp_range:
            min_exp = exp_range.get('min', 0)
            max_exp = exp_range.get('max', 20)
            if min_exp <= avg_years <= max_exp:
                return 90 + min((avg_years - min_exp) * 2, 10)
            elif avg_years < min_exp:
                return max(30, 70 - (min_exp - avg_years) * 15)
            else:
                return max(60, 90 - (avg_years - max_exp) * 5)

        if avg_years >= 5:
            return 90
        elif avg_years >= 3:
            return 75
        elif avg_years >= 1:
            return 60
        else:
            return 45

    def calculate_education_match(self, education: str) -> float:
        education_scores = {
            '博士': 95,
            '硕士': 85,
            '本科': 75,
            '大专': 55,
            '高中': 40,
            '未知': 50
        }
        base_score = education_scores.get(education, 50)

        # 有学历筛选条件时，根据要求调整
        edu_level = self.filters.get('educationLevel', '不限')
        if edu_level and edu_level != '不限':
            edu_ranks = {'大专': 2, '本科': 3, '硕士': 4, '博士': 5}
            required_rank = edu_ranks.get(edu_level, 0)
            actual_rank = self._get_education_rank(education)
            if actual_rank >= required_rank:
                return min(base_score + 10, 100)
            else:
                return max(base_score - 20, 20)
        return base_score

    def calculate_industry_match(self, resume_data: Dict[str, Any]) -> float:
        """计算行业匹配度"""
        industries = self.filters.get('industryBackground', [])
        if not industries:
            return 70  # 无行业要求时默认

        resume_text = resume_data.get('analysis', '') + ' '.join(
            resume_data.get('background', {}).get('projects', [])
        )
        industry_keywords = {
            '互联网/IT': ['互联网', 'IT', '软件', '技术', '开发', '前端', '后端', '全栈'],
            '金融': ['金融', '银行', '证券', '基金', '保险', '金融科技'],
            '教育': ['教育', '在线教育', '教学', '培训'],
            '医疗健康': ['医疗', '健康', '医药', '生物', '临床'],
            '电商': ['电商', '电子商务', '零售', '购物', '商城'],
            '人工智能': ['AI', '人工智能', '机器学习', '深度学习', 'NLP', 'CV'],
            '游戏': ['游戏', 'Unity', 'Unreal', '游戏引擎'],
            '企业服务': ['企业服务', 'SaaS', 'CRM', 'ERP'],
            '汽车': ['汽车', '车联网', '自动驾驶'],
            '制造业': ['制造', '工业', '智能制造', 'IoT'],
            '房地产': ['房地产', '地产'],
            '媒体/内容': ['媒体', '内容', '新媒体', '短视频'],
            '物流/供应链': ['物流', '供应链', '仓储'],
            '零售': ['零售', '新零售', 'POS'],
            '咨询': ['咨询', '管理咨询', '战略咨询'],
        }

        matched = 0
        for ind in industries:
            kw_list = industry_keywords.get(ind, [ind])
            if any(kw in resume_text for kw in kw_list):
                matched += 1

        return round((matched / len(industries)) * 100, 1) if industries else 70

    def calculate_project_match(self, resume_data: Dict[str, Any]) -> float:
        """计算项目经历匹配度"""
        projects = resume_data.get('background', {}).get('projects', [])
        project_count = len(projects) if isinstance(projects, list) else 0
        min_projects = self.filters.get('minProjectCount', 0)

        if min_projects == 0:
            if project_count >= 3:
                return 90
            elif project_count >= 1:
                return 70
            return 50

        if project_count >= min_projects + 2:
            return 95
        elif project_count >= min_projects:
            return 80
        elif project_count >= min_projects - 1:
            return 50
        return 30

    def calculate_overall_match(self, skills_match: float, experience_match: float,
                                education_match: float, industry_match: float = 70,
                                project_match: float = 70) -> float:
        weights = self.filters.get('weights', {})
        w = {
            'skills': weights.get('skills', 0.35),
            'experience': weights.get('experience', 0.25),
            'education': weights.get('education', 0.15),
            'industry': weights.get('industry', 0.15),
            'projects': weights.get('projects', 0.10),
        }
        total_weight = sum(w.values())
        if total_weight == 0:
            total_weight = 1
            w = {k: 0.2 for k in w}

        overall = (
            skills_match * w['skills'] +
            experience_match * w['experience'] +
            education_match * w['education'] +
            industry_match * w['industry'] +
            project_match * w['projects']
        ) / total_weight

        return round(overall, 1)

    def generate_highlights(self, resume_data: Dict[str, Any]) -> List[str]:
        highlights = []

        skills = resume_data.get('skills', [])
        matching_skills = [skill for skill in skills if skill in self.keywords]
        if matching_skills:
            highlights.append(f"技能匹配：掌握 {', '.join(matching_skills[:4])}")

        work_years = resume_data.get('background', {}).get('workYears', '未知')
        if work_years != '未知':
            highlights.append(f"工作经验：{work_years}")

        education = resume_data.get('background', {}).get('education', '未知')
        if education != '未知':
            highlights.append(f"学历背景：{education}")

        # 行业匹配亮点
        industry_match = self.calculate_industry_match(resume_data)
        if industry_match >= 80:
            industries = self.filters.get('industryBackground', [])
            if industries:
                highlights.append(f"行业经验：具有{industries[0]}相关背景")

        # 项目经历亮点
        projects = resume_data.get('background', {}).get('projects', [])
        if isinstance(projects, list) and len(projects) >= 3:
            highlights.append(f"项目丰富：拥有{len(projects)}个项目经历")

        return highlights if highlights else ['候选人基本符合岗位要求']

    def match_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        skills = resume_data.get('skills', [])
        work_years = resume_data.get('background', {}).get('workYears', '未知')
        education = resume_data.get('background', {}).get('education', '未知')

        # 检查筛选条件
        filter_result = self.check_filter_pass(resume_data)

        skills_match = self.calculate_skills_match(skills)
        experience_match = self.calculate_experience_match(work_years)
        education_match = self.calculate_education_match(education)
        industry_match = self.calculate_industry_match(resume_data)
        project_match = self.calculate_project_match(resume_data)

        overall_match = self.calculate_overall_match(
            skills_match, experience_match, education_match, industry_match, project_match
        )

        highlights = self.generate_highlights(resume_data)

        return {
            'matchScore': overall_match,
            'details': {
                'skillsMatch': skills_match,
                'experienceMatch': experience_match,
                'educationMatch': education_match,
                'industryMatch': industry_match,
                'projectMatch': project_match,
            },
            'highlights': highlights,
            'filterPassed': filter_result['passed'],
            'rejectReasons': filter_result['reasons'],
        }
