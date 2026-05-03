import os
import json
import requests
from dotenv import load_dotenv

# 加载 .env 文件，从项目根目录加载
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))


class CozeAnalyzer:
    def __init__(self):
        self.api_key = os.getenv('COZE_API_KEY')
        self.workflow_url = os.getenv('COZE_WORKFLOW_URL')

    def analyze_resume(self, resume_text: str, basic_info: dict = None) -> dict:
        """
        调用 Coze 工作流分析简历

        Args:
            resume_text: 简历文本内容
            basic_info: 基本信息字典（姓名、邮箱、电话等）

        Returns:
            dict: 包含分析结果的字典
        """
        if not self.api_key or not self.workflow_url:
            raise ValueError("请配置 COZE_API_KEY 和 COZE_WORKFLOW_URL 环境变量")

        # 构建发送给 Coze 工作流的输入
        info = basic_info or {}
        input_data = {
            "resume_text": resume_text,
            "basic_info": json.dumps(info),
            "name": info.get('name', ''),
            "phone": info.get('phone', ''),
            "email": info.get('email', '')
        }

        try:
            # 调用 Coze 工作流 API
            response = requests.post(
                self.workflow_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
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

    def _parse_coze_result(self, coze_response: dict) -> dict:
        """
        解析 Coze 工作流返回的结果

        Args:
            coze_response: Coze API 返回的原始数据

        Returns:
            dict: 标准化后的分析结果
        """
        # 根据 Coze 工作流的实际返回格式进行解析
        # 以下是一个示例解析逻辑，请根据实际的 Coze 工作流输出格式进行调整

        if 'data' in coze_response:
            data = coze_response['data']
        elif 'output' in coze_response:
            data = coze_response['output']
        elif 'result' in coze_response:
            data = coze_response['result']
        else:
            data = coze_response

        # 提取评分
        scores = {
            'overall': data.get('overall_score', data.get('overall', 70)),
            'skills': data.get('skills_score', data.get('skills', 70)),
            'experience': data.get('experience_score', data.get('experience', 70)),
            'education': data.get('education_score', data.get('education', 70))
        }

        # 提取分析报告
        analysis = data.get('analysis', data.get('comment', data.get('summary', '')))

        # 提取建议
        suggestions = data.get('suggestions', data.get('recommendations', []))

        return {
            'scores': scores,
            'analysis': analysis,
            'suggestions': suggestions,
            'coze_result': data  # 保留原始数据以便调试
        }

    def batch_analyze(self, resumes: list) -> list:
        """
        批量分析简历

        Args:
            resumes: 包含简历文本和基本信息的列表
            [
                {"text": "...", "basic_info": {...}},
                ...
            ]

        Returns:
            list: 分析结果列表
        """
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