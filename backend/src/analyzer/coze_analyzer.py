import os
import json
import requests
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


class CozeAnalyzer:
    def __init__(self):
        self.analyze_api_key = os.getenv('COZE_API_KEY_ANALYZE') or os.getenv('COZE_API_KEY')
        self.analyze_workflow_url = os.getenv('COZE_WORKFLOW_URL_ANALYZE') or os.getenv('COZE_WORKFLOW_URL')
        self.compare_api_key = os.getenv('COZE_API_KEY_COMPARE') or os.getenv('COZE_API_KEY')
        self.compare_workflow_url = os.getenv('COZE_WORKFLOW_URL_COMPARE')
        self.optimize_api_key = os.getenv('COZE_API_KEY_OPTIMIZE') or os.getenv('COZE_API_KEY')
        self.optimize_workflow_url = os.getenv('COZE_WORKFLOW_URL_OPTIMIZE')
        self.generate_api_key = os.getenv('COZE_API_KEY_GENERATE')
        self.generate_workflow_url = os.getenv('COZE_WORKFLOW_URL_GENERATE')

    def analyze_resume(self, resume_text: str, basic_info: dict = None) -> dict:
        if not self.analyze_api_key or not self.analyze_workflow_url:
            raise ValueError("请配置 COZE_API_KEY_ANALYZE 和 COZE_WORKFLOW_URL_ANALYZE 环境变量")

        info = basic_info or {}
        input_data = {
            "resume_text": resume_text,
            "basic_info": {
                "name": info.get('name', ''),
                "phone": info.get('phone', ''),
                "email": info.get('email', '')
            }
        }

        try:
            response = requests.post(
                self.analyze_workflow_url,
                headers={
                    "Authorization": f"Bearer {self.analyze_api_key}",
                    "Content-Type": "application/json"
                },
                json=input_data,
                timeout=60
            )

            if response.status_code == 200:
                result = response.json()
                return self._parse_coze_result(result)
            else:
                raise Exception(f"Coze API 调用失败: {response.status_code} - {response.text}")

        except requests.exceptions.Timeout:
            raise Exception("Coze API 请求超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Coze API 请求错误: {str(e)}")

    def compare_resumes(
        self,
        resumes: List[Dict[str, Any]],
        job_description: str = "",
        requirements: str = "",
        config: Optional[Dict[str, float]] = None
    ) -> dict:
        if not self.compare_api_key or not self.compare_workflow_url:
            raise ValueError("请配置 COZE_API_KEY_COMPARE 和 COZE_WORKFLOW_URL_COMPARE 环境变量")

        if len(resumes) < 2 or len(resumes) > 5:
            raise ValueError("需要2-5份简历进行比较")

        default_config = {
            "skills_weight": 0.45,
            "experience_weight": 0.30,
            "education_weight": 0.25
        }
        if config:
            default_config.update(config)

        input_data = {
            "resumes": resumes,
            "job_description": job_description,
            "requirements": requirements,
            "config": default_config
        }

        try:
            response = requests.post(
                self.compare_workflow_url,
                headers={
                    "Authorization": f"Bearer {self.compare_api_key}",
                    "Content-Type": "application/json"
                },
                json=input_data,
                timeout=120
            )

            if response.status_code == 200:
                result = response.json()
                return self._parse_compare_result(result, resumes)
            else:
                raise Exception(f"Coze Compare API 调用失败: {response.status_code} - {response.text}")

        except requests.exceptions.Timeout:
            raise Exception("Coze Compare API 请求超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Coze Compare API 请求错误: {str(e)}")

    def _parse_coze_result(self, coze_response: dict) -> dict:
        if 'data' in coze_response:
            data = coze_response['data']
        elif 'output' in coze_response:
            data = coze_response['output']
        elif 'result' in coze_response:
            data = coze_response['result']
        else:
            data = coze_response

        scores = {
            'overall': data.get('overall_score', data.get('overall', 70)),
            'skills': data.get('skills_score', data.get('skills', 70)),
            'experience': data.get('experience_score', data.get('experience', 70)),
            'education': data.get('education_score', data.get('education', 70))
        }

        analysis = data.get('analysis', data.get('comment', data.get('summary', '')))
        suggestions = data.get('suggestions', data.get('recommendations', []))

        return {
            'scores': scores,
            'analysis': analysis,
            'suggestions': suggestions,
            'coze_result': data
        }

    def _parse_compare_result(self, coze_response: dict, resumes: List[Dict[str, Any]] = None) -> dict:
        if 'data' in coze_response:
            data = coze_response['data']
        elif 'output' in coze_response:
            data = coze_response['output']
        elif 'result' in coze_response:
            data = coze_response['result']
        else:
            data = coze_response

        if 'resumes' in data and 'results' in data and 'comparison' in data:
            return data

        results = []
        if 'results' in data and isinstance(data['results'], list):
            for i, result in enumerate(data['results']):
                results.append({
                    'matchScore': result.get('matchScore', result.get('score', 70)),
                    'details': {
                        'skillsMatch': result.get('skillsMatch', result.get('skills_score', 70)),
                        'experienceMatch': result.get('experienceMatch', result.get('experience_score', 70)),
                        'educationMatch': result.get('educationMatch', result.get('education_score', 70)),
                        'priorityWeights': result.get('priorityWeights', {'skills': 0.45, 'experience': 0.30, 'education': 0.25})
                    },
                    'skillsDetails': result.get('skillsDetails', {
                        'matched': [],
                        'unmatched': [],
                        'bonus': [],
                        'category_scores': {},
                        'base_score': 0,
                        'bonus_score': 0,
                        'category_bonus': 0,
                        'industry': '互联网'
                    }),
                    'experienceDetails': result.get('experienceDetails', {
                        'years': 0,
                        'years_score': 0,
                        'position_match': 0,
                        'project_score': 0,
                        'total_score': 0
                    }),
                    'educationDetails': result.get('educationDetails', {
                        'education_level': 0,
                        'major_match': 0,
                        'university_rank': 0,
                        'total_score': 0
                    }),
                    'highlights': result.get('highlights', ['AI 分析完成'])
                })
        
        if not results and resumes:
            for i, resume in enumerate(resumes):
                score = data.get(f'resume_{i}_score', data.get(f'score_{i}', 70))
                results.append({
                    'matchScore': score,
                    'details': {
                        'skillsMatch': data.get(f'resume_{i}_skills', 70),
                        'experienceMatch': data.get(f'resume_{i}_experience', 70),
                        'educationMatch': data.get(f'resume_{i}_education', 70),
                        'priorityWeights': {'skills': 0.45, 'experience': 0.30, 'education': 0.25}
                    },
                    'skillsDetails': {
                        'matched': [],
                        'unmatched': [],
                        'bonus': [],
                        'category_scores': {},
                        'base_score': 0,
                        'bonus_score': 0,
                        'category_bonus': 0,
                        'industry': '互联网'
                    },
                    'experienceDetails': {
                        'years': 0,
                        'years_score': 0,
                        'position_match': 0,
                        'project_score': 0,
                        'total_score': 0
                    },
                    'educationDetails': {
                        'education_level': 0,
                        'major_match': 0,
                        'university_rank': 0,
                        'total_score': 0
                    },
                    'highlights': data.get(f'resume_{i}_highlights', ['AI 分析完成'])
                })

        if not results:
            scores = data.get('scores', [])
            if isinstance(scores, list):
                for i, score in enumerate(scores):
                    if isinstance(score, dict):
                        results.append({
                            'matchScore': score.get('overall', score.get('total', 70)),
                            'details': {
                                'skillsMatch': score.get('skills', 70),
                                'experienceMatch': score.get('experience', 70),
                                'educationMatch': score.get('education', 70),
                                'priorityWeights': {'skills': 0.45, 'experience': 0.30, 'education': 0.25}
                            },
                            'skillsDetails': {'matched': [], 'unmatched': [], 'bonus': [], 'category_scores': {}, 'base_score': 0, 'bonus_score': 0, 'category_bonus': 0, 'industry': '互联网'},
                            'experienceDetails': {'years': 0, 'years_score': 0, 'position_match': 0, 'project_score': 0, 'total_score': 0},
                            'educationDetails': {'education_level': 0, 'major_match': 0, 'university_rank': 0, 'total_score': 0},
                            'highlights': ['AI 分析完成']
                        })

        ranking = []
        if results:
            sorted_indices = sorted(range(len(results)), key=lambda i: results[i]['matchScore'], reverse=True)
            for rank, idx in enumerate(sorted_indices, 1):
                name = resumes[idx].get('basic_info', {}).get('name', f'候选人{rank}') if resumes else f'候选人{rank}'
                ranking.append({
                    'id': resumes[idx].get('id', f'resume_{idx}') if resumes else f'resume_{idx}',
                    'name': name,
                    'rank': rank,
                    'score': results[idx]['matchScore']
                })

        strengths = {}
        weaknesses = {}
        if results and resumes:
            best_score = max(r['matchScore'] for r in results)
            for i, resume in enumerate(resumes):
                rid = resume.get('id', f'resume_{i}')
                strengths[rid] = []
                weaknesses[rid] = []
                current_score = results[i]['matchScore']
                if current_score == best_score:
                    strengths[rid].append(f"综合匹配度最高（{current_score}分）")
                elif best_score - current_score >= 10:
                    weaknesses[rid].append(f"综合匹配度较低（{current_score}分 vs 最高{best_score}分）")

        top_name = ranking[0]['name'] if ranking else '候选人'
        top_score = ranking[0]['score'] if ranking else 0
        if len(ranking) > 1:
            second_score = ranking[1]['score']
            diff = top_score - second_score
            if diff >= 15:
                recommendation = f"强烈推荐 {top_name}（{top_score}分），与其他候选人差距明显"
            elif diff >= 8:
                recommendation = f"推荐 {top_name}（{top_score}分），具有一定优势"
            else:
                recommendation = f"前几位候选人实力相近，当前 {top_name} 略有优势（{top_score}分）"
        else:
            recommendation = f"AI 分析完成，{top_name} 得分 {top_score}分"

        return {
            'resumes': resumes or [],
            'results': results,
            'comparison': {
                'overallDiff': round(max(r['matchScore'] for r in results) - min(r['matchScore'] for r in results), 1) if results else 0,
                'strengths': strengths,
                'weaknesses': weaknesses,
                'recommendation': recommendation,
                'priorityWeights': {'skills': 0.45, 'experience': 0.30, 'education': 0.25},
                'ranking': ranking
            }
        }

    def optimize_resume(self, resume_text: str, basic_info: dict = None) -> dict:
        if not self.optimize_api_key or not self.optimize_workflow_url:
            raise ValueError("请配置 COZE_API_KEY_OPTIMIZE 和 COZE_WORKFLOW_URL_OPTIMIZE 环境变量")

        info = basic_info or {}
        input_data = {
            "resume_text": resume_text,
            "basic_info": {
                "name": info.get('name', ''),
                "phone": info.get('phone', ''),
                "email": info.get('email', '')
            }
        }

        try:
            response = requests.post(
                self.optimize_workflow_url,
                headers={
                    "Authorization": f"Bearer {self.optimize_api_key}",
                    "Content-Type": "application/json"
                },
                json=input_data,
                timeout=90
            )

            if response.status_code == 200:
                result = response.json()
                return self._parse_optimize_result(result)
            else:
                raise Exception(f"Coze Optimize API 调用失败: {response.status_code} - {response.text}")

        except requests.exceptions.Timeout:
            raise Exception("Coze Optimize API 请求超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Coze Optimize API 请求错误: {str(e)}")

    def _parse_optimize_result(self, coze_response: dict) -> dict:
        if 'data' in coze_response:
            data = coze_response['data']
        elif 'output' in coze_response:
            data = coze_response['output']
        elif 'result' in coze_response:
            data = coze_response['result']
        else:
            data = coze_response

        analysis = data.get('analysis', data.get('summary', data.get('comment', '')))
        suggestions = data.get('suggestions', data.get('recommendations', data.get('tips', [])))
        categories = data.get('categories', [])

        if not isinstance(suggestions, list):
            suggestions = [str(suggestions)] if suggestions else []

        return {
            'analysis': analysis,
            'suggestions': suggestions,
            'categories': categories,
            'coze_result': data
        }

    def batch_analyze(self, resumes: list) -> list:
        results = []
        for resume in resumes:
            try:
                result = self.analyze_resume(
                    resume.get('text', ''),
                    resume.get('basic_info', {})
                )
                results.append(result)
            except Exception as e:
                results.append({
                    'error': str(e),
                    'scores': {
                        'overall': 0,
                        'skills': 0,
                        'experience': 0,
                        'education': 0
                    },
                    'analysis': 'AI 分析失败',
                    'suggestions': []
                })
        return results

    def generate_resume(self, resume_data: dict) -> dict:
        """根据用户输入生成简历内容"""
        if not self.generate_api_key or not self.generate_workflow_url:
            raise ValueError("请配置 COZE_API_KEY_GENERATE 和 COZE_WORKFLOW_URL_GENERATE 环境变量")

        # 构建输入数据
        input_data = {
            "basic_info": {
                "name": resume_data.get('name', ''),
                "phone": resume_data.get('phone', ''),
                "email": resume_data.get('email', ''),
                "target_position": resume_data.get('targetPosition', ''),
                "work_years": resume_data.get('workYears', '')
            },
            "education": {
                "education": resume_data.get('education', ''),
                "school": resume_data.get('school', ''),
                "major": resume_data.get('major', '')
            },
            "experience": {
                "work_experience": resume_data.get('workExperience', ''),
                "internship_experience": resume_data.get('internshipExperience', ''),
                "projects": resume_data.get('projects', '')
            },
            "skills": resume_data.get('skills', []),
            "blog": resume_data.get('blog', ''),
            "self_intro": resume_data.get('selfIntro', ''),
            "custom_modules": resume_data.get('customModules', [])
        }

        try:
            response = requests.post(
                self.generate_workflow_url,
                headers={
                    "Authorization": f"Bearer {self.generate_api_key}",
                    "Content-Type": "application/json"
                },
                json=input_data,
                timeout=90
            )

            if response.status_code == 200:
                result = response.json()
                return self._parse_generate_result(result)
            else:
                raise Exception(f"Coze 生成简历 API 调用失败: {response.status_code} - {response.text}")

        except requests.exceptions.Timeout:
            raise Exception("Coze API 请求超时，请稍后重试")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Coze API 请求错误: {str(e)}")

    def _parse_generate_result(self, coze_response: dict) -> dict:
        """解析 Coze 生成简历的返回结果"""
        if 'data' in coze_response:
            data = coze_response['data']
        elif 'output' in coze_response:
            data = coze_response['output']
        elif 'result' in coze_response:
            data = coze_response['result']
        else:
            data = coze_response

        sections = data.get('sections', [])
        summary = data.get('summary', '')

        # 确保 sections 格式正确
        parsed_sections = []
        for section in sections:
            if isinstance(section, dict):
                parsed_sections.append({
                    'title': section.get('title', ''),
                    'content': section.get('content', ''),
                    'order': section.get('order', len(parsed_sections) + 1)
                })

        return {
            'sections': parsed_sections,
            'summary': summary
        }
