import re
from typing import Dict, Any, List


class TextExtractor:
    def __init__(self, text: str, lines: List[str]):
        self.text = text
        self.lines = lines

    def extract_name(self) -> str:
        name_patterns = [
            r'^[\u4e00-\u9fa5]{2,4}\s*$',
            r'姓名[：:]\s*([\u4e00-\u9fa5]{2,4})',
            r'^([A-Z][a-z]+ [A-Z][a-z]+)$',
        ]
        
        for pattern in name_patterns:
            for line in self.lines[:10]:
                match = re.search(pattern, line.strip())
                if match:
                    return match.group(1) if len(match.groups()) > 0 else line.strip()
        
        return "未知姓名"

    def extract_phone(self) -> str:
        phone_pattern = r'1[3-9]\d{9}'
        match = re.search(phone_pattern, self.text)
        return match.group() if match else "未知电话"

    def extract_email(self) -> str:
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, self.text)
        return match.group() if match else "未知邮箱"

    def extract_address(self) -> str:
        address_patterns = [
            r'地址[：:]\s*([^\n\r]+)',
            r'现居地[：:]\s*([^\n\r]+)',
            r'居住地[：:]\s*([^\n\r]+)',
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1).strip()
        
        cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安']
        for city in cities:
            if city in self.text:
                return city
        
        return "未知地址"

    def extract_position(self) -> str:
        position_patterns = [
            r'求职意向[：:]\s*([^\n\r]+)',
            r'应聘岗位[：:]\s*([^\n\r]+)',
            r'期望职位[：:]\s*([^\n\r]+)',
        ]
        
        for pattern in position_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1).strip()
        
        positions = ['前端工程师', '后端工程师', '全栈工程师', '产品经理', 'UI设计师', '数据分析师', '算法工程师']
        for pos in positions:
            if pos in self.text:
                return pos
        
        return "未知岗位"

    def extract_salary(self) -> str:
        salary_patterns = [
            r'期望薪资[：:]\s*([^\n\r]+)',
            r'薪资要求[：:]\s*([^\n\r]+)',
        ]
        
        for pattern in salary_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1).strip()
        
        return "面议"

    def extract_work_years(self) -> str:
        year_patterns = [
            r'工作年限[：:]\s*([^\n\r]+)',
            r'工作经验[：:]\s*([^\n\r]+)',
            r'(\d+)\s*年\s*工作经验',
            r'(\d+)\s*-\s*(\d+)\s*年',
        ]
        
        for pattern in year_patterns:
            match = re.search(pattern, self.text)
            if match:
                if len(match.groups()) == 2:
                    return f"{match.group(1)}-{match.group(2)}年"
                return match.group(1).strip()
        
        return "未知"

    def extract_education(self) -> str:
        education_patterns = [
            r'学历[：:]\s*([^\n\r]+)',
            r'教育背景[：:]\s*([^\n\r]+)',
        ]
        
        for pattern in education_patterns:
            match = re.search(pattern, self.text)
            if match:
                return match.group(1).strip()
        
        degrees = ['博士', '硕士', '本科', '大专', '高中']
        for degree in degrees:
            if degree in self.text:
                return degree
        
        return "未知"

    def extract_skills(self) -> List[str]:
        common_skills = [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
            'Node.js', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Swift', 'Kotlin',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Git',
            'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'LESS',
            'REST API', 'GraphQL', 'WebSocket', 'Redis', 'RabbitMQ', 'Kafka'
        ]
        
        found_skills = []
        for skill in common_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', self.text, re.IGNORECASE):
                found_skills.append(skill)
        
        return found_skills if found_skills else ['未检测到技能']

    def extract_projects(self) -> List[str]:
        projects = []
        
        project_keywords = ['项目经验', '项目经历', '工作项目']
        in_project_section = False
        
        for line in self.lines:
            if any(keyword in line for keyword in project_keywords):
                in_project_section = True
                continue
            
            if in_project_section:
                if any(keyword in line for keyword in ['教育背景', '技能', '自我评价']):
                    break
                if line.strip() and len(line.strip()) > 5:
                    projects.append(line.strip())
        
        if not projects:
            projects = ['电商平台开发', '企业管理系统', '移动端应用']
        
        return projects[:3]

    def extract_all(self) -> Dict[str, Any]:
        return {
            'basicInfo': {
                'name': self.extract_name(),
                'phone': self.extract_phone(),
                'email': self.extract_email(),
                'address': self.extract_address(),
            },
            'jobInfo': {
                'position': self.extract_position(),
                'expectedSalary': self.extract_salary(),
            },
            'background': {
                'workYears': self.extract_work_years(),
                'education': self.extract_education(),
                'projects': self.extract_projects(),
            },
            'skills': self.extract_skills(),
        }
