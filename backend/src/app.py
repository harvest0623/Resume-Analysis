import os
import uuid
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from parser.pdf_parser import PDFParser
from parser.text_extractor import TextExtractor
from analyzer.resume_analyzer import ResumeAnalyzer
from analyzer.coze_analyzer import CozeAnalyzer
from analyzer.matcher import Matcher
from analyzer.advanced_matcher import AdvancedMatcher, ComparisonConfig, create_custom_config, validate_config
from storage.history_store import HistoryStore

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-User-Id"]
    }
})

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

history_store = HistoryStore()
batch_tasks = {}
batch_tasks_lock = threading.Lock()

resume_analyzer = ResumeAnalyzer
coze_analyzer = CozeAnalyzer()

MAX_BATCH_CONCURRENCY = 3
MAX_BATCH_FILES = 50
MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024


def _get_user_id():
    """从请求头中提取用户标识，未提供时返回默认值"""
    return request.headers.get('X-User-Id', 'default')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _analyze_single_resume(resume_id, filename, user_id, use_coze):
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume_id}.pdf")

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Resume file not found: {resume_id}")

    parser = PDFParser(pdf_path)
    text = parser.get_text()
    lines = parser.get_lines()

    extractor = TextExtractor(text, lines)
    extracted_data = extractor.extract_all()

    if use_coze:
        try:
            coze_result = coze_analyzer.analyze_resume(
                resume_text=text,
                basic_info=extracted_data.get('basicInfo', {})
            )
            analysis_result = {
                'scores': coze_result.get('scores', {}),
                'analysis': coze_result.get('analysis', ''),
                'suggestions': coze_result.get('suggestions', []),
                'aiProvider': 'coze'
            }
            if 'skills' not in analysis_result.get('scores', {}):
                analyzer = ResumeAnalyzer(extracted_data)
                rule_result = analyzer.analyze()
                analysis_result['scores'] = {
                    **rule_result['scores'],
                    **analysis_result['scores']
                }
        except Exception as e:
            print(f"Coze analysis failed for {resume_id}, falling back to rules: {e}")
            analyzer = ResumeAnalyzer(extracted_data)
            analysis_result = analyzer.analyze()
            analysis_result['aiProvider'] = 'rule'
            analysis_result['cozeError'] = str(e)
    else:
        analyzer = ResumeAnalyzer(extracted_data)
        analysis_result = analyzer.analyze()
        analysis_result['aiProvider'] = 'rule'

    resume_data = {
        'id': resume_id,
        'filename': filename,
        'uploadedAt': datetime.now().isoformat(),
        **extracted_data,
        **analysis_result
    }

    history_store.add(user_id, resume_data)
    return resume_data


def _process_batch_task(batch_id, user_id, file_tasks, use_coze):
    with batch_tasks_lock:
        batch_tasks[batch_id]['status'] = 'processing'
        batch_tasks[batch_id]['totalCount'] = len(file_tasks)

    def process_one(file_task):
        resume_id = file_task['id']
        filename = file_task['filename']
        try:
            with batch_tasks_lock:
                batch_tasks[batch_id]['currentProcessing'].append(resume_id)

            result = _analyze_single_resume(resume_id, filename, user_id, use_coze)

            with batch_tasks_lock:
                batch_tasks[batch_id]['completedCount'] += 1
                batch_tasks[batch_id]['results'].append(result)
                batch_tasks[batch_id]['currentProcessing'].remove(resume_id)

            return result
        except Exception as e:
            with batch_tasks_lock:
                batch_tasks[batch_id]['failedCount'] += 1
                batch_tasks[batch_id]['errors'].append({
                    'id': resume_id,
                    'filename': filename,
                    'error': str(e)
                })
                if resume_id in batch_tasks[batch_id]['currentProcessing']:
                    batch_tasks[batch_id]['currentProcessing'].remove(resume_id)
            return None

    with ThreadPoolExecutor(max_workers=MAX_BATCH_CONCURRENCY) as executor:
        futures = {executor.submit(process_one, ft): ft for ft in file_tasks}
        for future in as_completed(futures):
            future.result()

    with batch_tasks_lock:
        batch_tasks[batch_id]['status'] = 'completed'
        batch_tasks[batch_id]['completedAt'] = datetime.now().isoformat()


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})


@app.route('/api/resume/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        save_filename = f"{file_id}.pdf"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], save_filename)
        file.save(save_path)
        
        resume_id = file_id
        
        return jsonify({
            'id': resume_id,
            'filename': filename,
            'status': 'uploaded'
        })


@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    user_id = _get_user_id()
    resume_id = data.get('id')
    use_coze = data.get('useCoze', False)

    if not resume_id:
        return jsonify({'error': 'Resume ID is required'}), 400

    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume_id}.pdf")

    if not os.path.exists(pdf_path):
        return jsonify({'error': 'Resume file not found'}), 404

    try:
        parser = PDFParser(pdf_path)
        text = parser.get_text()
        lines = parser.get_lines()

        extractor = TextExtractor(text, lines)
        extracted_data = extractor.extract_all()

        if use_coze:
            try:
                coze_result = coze_analyzer.analyze_resume(
                    resume_text=text,
                    basic_info=extracted_data.get('basicInfo', {})
                )
                analysis_result = {
                    'scores': coze_result.get('scores', {}),
                    'analysis': coze_result.get('analysis', ''),
                    'suggestions': coze_result.get('suggestions', []),
                    'aiProvider': 'coze'
                }
                if 'skills' not in analysis_result.get('scores', {}):
                    analyzer = ResumeAnalyzer(extracted_data)
                    rule_result = analyzer.analyze()
                    analysis_result['scores'] = {
                        **rule_result['scores'],
                        **analysis_result['scores']
                    }
            except Exception as e:
                print(f"Coze analysis failed, falling back to rules: {e}")
                analyzer = ResumeAnalyzer(extracted_data)
                analysis_result = analyzer.analyze()
                analysis_result['aiProvider'] = 'rule'
                analysis_result['cozeError'] = str(e)
        else:
            analyzer = ResumeAnalyzer(extracted_data)
            analysis_result = analyzer.analyze()
            analysis_result['aiProvider'] = 'rule'

        resume_data = {
            'id': resume_id,
            'filename': data.get('filename', 'unknown.pdf'),
            'uploadedAt': datetime.now().isoformat(),
            **extracted_data,
            **analysis_result
        }

        history_store.add(user_id, resume_data)

        return jsonify(resume_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/resume/<resume_id>', methods=['GET'])
def get_resume(resume_id):
    user_id = _get_user_id()
    resume = history_store.get(user_id, resume_id)
    if resume:
        return jsonify(resume)
    else:
        return jsonify({'error': 'Resume not found'}), 404


@app.route('/api/resume/batch/upload', methods=['POST'])
def batch_upload():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('files')

    if not files or len(files) == 0:
        return jsonify({'error': 'No files selected'}), 400

    if len(files) > MAX_BATCH_FILES:
        return jsonify({'error': f'Too many files. Maximum is {MAX_BATCH_FILES}'}), 400

    uploaded = []
    errors = []

    for file in files:
        if file.filename == '':
            errors.append({'filename': 'unknown', 'error': 'Empty filename'})
            continue

        if not allowed_file(file.filename):
            errors.append({'filename': file.filename, 'error': 'Only PDF files are allowed'})
            continue

        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_SINGLE_FILE_SIZE:
            errors.append({'filename': file.filename, 'error': f'File too large. Maximum is {MAX_SINGLE_FILE_SIZE // (1024*1024)}MB'})
            continue

        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        save_filename = f"{file_id}.pdf"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], save_filename)
        file.save(save_path)

        uploaded.append({
            'id': file_id,
            'filename': filename,
            'status': 'uploaded'
        })

    return jsonify({
        'uploaded': uploaded,
        'errors': errors,
        'total': len(files),
        'successCount': len(uploaded),
        'errorCount': len(errors)
    })


@app.route('/api/resume/batch/analyze', methods=['POST'])
def batch_analyze():
    data = request.get_json()
    user_id = _get_user_id()
    file_tasks = data.get('files', [])
    use_coze = data.get('useCoze', False)

    if not file_tasks:
        return jsonify({'error': 'No files to analyze'}), 400

    batch_id = str(uuid.uuid4())

    with batch_tasks_lock:
        batch_tasks[batch_id] = {
            'id': batch_id,
            'status': 'pending',
            'useCoze': use_coze,
            'totalCount': len(file_tasks),
            'completedCount': 0,
            'failedCount': 0,
            'results': [],
            'errors': [],
            'currentProcessing': [],
            'createdAt': datetime.now().isoformat(),
            'completedAt': None
        }

    thread = threading.Thread(
        target=_process_batch_task,
        args=(batch_id, user_id, file_tasks, use_coze),
        daemon=True
    )
    thread.start()

    return jsonify({
        'batchId': batch_id,
        'status': 'pending',
        'totalCount': len(file_tasks)
    })


@app.route('/api/batch/<batch_id>/status', methods=['GET'])
def get_batch_status(batch_id):
    with batch_tasks_lock:
        task = batch_tasks.get(batch_id)

    if not task:
        return jsonify({'error': 'Batch task not found'}), 404

    return jsonify({
        'id': task['id'],
        'status': task['status'],
        'totalCount': task['totalCount'],
        'completedCount': task['completedCount'],
        'failedCount': task['failedCount'],
        'currentProcessing': task['currentProcessing'],
        'errors': task['errors'],
        'createdAt': task['createdAt'],
        'completedAt': task['completedAt']
    })


@app.route('/api/batch/<batch_id>/results', methods=['GET'])
def get_batch_results(batch_id):
    with batch_tasks_lock:
        task = batch_tasks.get(batch_id)

    if not task:
        return jsonify({'error': 'Batch task not found'}), 404

    return jsonify({
        'id': task['id'],
        'status': task['status'],
        'totalCount': task['totalCount'],
        'completedCount': task['completedCount'],
        'failedCount': task['failedCount'],
        'results': task['results'],
        'errors': task['errors'],
        'createdAt': task['createdAt'],
        'completedAt': task['completedAt']
    })


@app.route('/api/resume/compare', methods=['POST'])
def compare_resumes():
    data = request.get_json()
    user_id = _get_user_id()
    resume_ids = data.get('resumeIds', [])
    config_data = data.get('config', {})
    use_coze = data.get('useCoze', False)
    
    if len(resume_ids) < 2 or len(resume_ids) > 5:
        return jsonify({'error': '需要选择2-5份简历进行比较'}), 400
    
    resumes = []
    for rid in resume_ids:
        resume = history_store.get(user_id, rid)
        if not resume:
            return jsonify({'error': f'简历 {rid} 未找到'}), 404
        resumes.append(resume)
    
    config = None
    if config_data:
        try:
            config = create_custom_config(
                skills_weight=config_data.get('skillsWeight', 0.45),
                experience_weight=config_data.get('experienceWeight', 0.30),
                education_weight=config_data.get('educationWeight', 0.25),
                skill_match_threshold=config_data.get('skillMatchThreshold', 0.6),
                experience_years_weight=config_data.get('experienceYearsWeight', 0.4),
                project_quality_weight=config_data.get('projectQualityWeight', 0.3),
                position_match_weight=config_data.get('positionMatchWeight', 0.3),
                education_level_weight=config_data.get('educationLevelWeight', 0.5),
                major_match_weight=config_data.get('majorMatchWeight', 0.3),
                university_rank_weight=config_data.get('universityRankWeight', 0.2)
            )
            is_valid, message = validate_config(config)
            if not is_valid:
                return jsonify({'error': f'Invalid configuration: {message}'}), 400
        except Exception as e:
            return jsonify({'error': f'Invalid configuration: {str(e)}'}), 400
    
    job_description = data.get('jobDescription', '')
    requirements = data.get('requirements', '')
    
    if use_coze:
        try:
            resume_texts = []
            for resume in resumes:
                pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume['id']}.pdf")
                if os.path.exists(pdf_path):
                    parser = PDFParser(pdf_path)
                    text = parser.get_text()
                else:
                    text = resume.get('analysis', '')
                
                resume_texts.append({
                    "id": resume['id'],
                    "text": text,
                    "basic_info": resume.get('basicInfo', {}),
                    "background": resume.get('background', {}),
                    "skills": resume.get('skills', [])
                })
            
            config_dict = None
            if config:
                config_dict = {
                    "skills_weight": config.skills_weight,
                    "experience_weight": config.experience_weight,
                    "education_weight": config.education_weight
                }
            
            coze_result = coze_analyzer.compare_resumes(
                resumes=resume_texts,
                job_description=job_description,
                requirements=requirements,
                config=config_dict
            )
            
            if 'resumes' in coze_result and 'results' in coze_result and 'comparison' in coze_result:
                coze_result['resumes'] = resumes
                return jsonify(coze_result)
            
            matcher = AdvancedMatcher(job_description, requirements, config)
            result = matcher.compare_multiple_resumes(resumes)
            result['aiProvider'] = 'coze'
            result['cozeResult'] = coze_result
            return jsonify(result)
        except Exception as e:
            print(f"Coze comparison failed, falling back to rules: {e}")
    
    matcher = AdvancedMatcher(job_description, requirements, config)
    result = matcher.compare_multiple_resumes(resumes)
    result['aiProvider'] = 'rule'
    
    return jsonify(result)


@app.route('/api/resume/compare/config', methods=['GET'])
def get_comparison_config():
    default_config = ComparisonConfig()
    return jsonify({
        'skillsWeight': default_config.skills_weight,
        'experienceWeight': default_config.experience_weight,
        'educationWeight': default_config.education_weight,
        'skillMatchThreshold': default_config.skill_match_threshold,
        'experienceYearsWeight': default_config.experience_years_weight,
        'projectQualityWeight': default_config.project_quality_weight,
        'positionMatchWeight': default_config.position_match_weight,
        'educationLevelWeight': default_config.education_level_weight,
        'majorMatchWeight': default_config.major_match_weight,
        'universityRankWeight': default_config.university_rank_weight
    })


@app.route('/api/resume/compare/validate-config', methods=['POST'])
def validate_comparison_config():
    data = request.get_json()
    
    try:
        config = create_custom_config(
            skills_weight=data.get('skillsWeight', 0.45),
            experience_weight=data.get('experienceWeight', 0.30),
            education_weight=data.get('educationWeight', 0.25),
            skill_match_threshold=data.get('skillMatchThreshold', 0.6),
            experience_years_weight=data.get('experienceYearsWeight', 0.4),
            project_quality_weight=data.get('projectQualityWeight', 0.3),
            position_match_weight=data.get('positionMatchWeight', 0.3),
            education_level_weight=data.get('educationLevelWeight', 0.5),
            major_match_weight=data.get('majorMatchWeight', 0.3),
            university_rank_weight=data.get('universityRankWeight', 0.2)
        )
        is_valid, message = validate_config(config)
        return jsonify({
            'valid': is_valid,
            'message': message
        })
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': str(e)
        }), 400


@app.route('/api/resume/optimize', methods=['POST'])
def optimize_resume():
    data = request.get_json()
    user_id = _get_user_id()
    resume_id = data.get('id')
    
    if not resume_id:
        return jsonify({'error': 'Resume ID is required'}), 400
    
    resume = history_store.get(user_id, resume_id)
    if not resume:
        return jsonify({'error': 'Resume not found'}), 404
    
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume_id}.pdf")
    
    resume_text = ""
    if os.path.exists(pdf_path):
        try:
            parser = PDFParser(pdf_path)
            resume_text = parser.get_text()
        except Exception as e:
            print(f"Failed to parse PDF: {e}")
            resume_text = resume.get('analysis', '')
    else:
        resume_text = resume.get('analysis', '')
    
    try:
        coze_result = coze_analyzer.optimize_resume(
            resume_text=resume_text,
            basic_info=resume.get('basicInfo', {})
        )
        
        return jsonify({
            'id': resume_id,
            'analysis': coze_result.get('analysis', ''),
            'suggestions': coze_result.get('suggestions', []),
            'categories': coze_result.get('categories', []),
            'aiProvider': 'coze-optimize'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/match', methods=['POST'])
def match_resumes():
    data = request.get_json()
    user_id = _get_user_id()
    job_description = data.get('jobDescription', '')
    requirements = data.get('requirements', '')
    filters = data.get('filters', None)
    use_coze = data.get('useCoze', False)

    if use_coze:
        try:
            all_resumes = history_store.get_all(user_id)
            resumes_for_coze = []
            for resume in all_resumes:
                resumes_for_coze.append({
                    'id': resume.get('id', ''),
                    'text': resume.get('text', ''),
                    'basic_info': resume.get('basicInfo', {}),
                    'background': resume.get('background', {}),
                    'skills': resume.get('skills', [])
                })

            coze_result = coze_analyzer.match_resumes(
                resumes=resumes_for_coze,
                job_description=job_description,
                requirements=requirements,
                filters=filters
            )
            return jsonify(coze_result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        matcher = Matcher(job_description, requirements, filters)
        all_resumes = history_store.get_all(user_id)

        matches = []
        for resume in all_resumes:
            match_result = matcher.match_resume(resume)
            matches.append({
                'resumeId': resume.get('id'),
                **match_result
            })

        matches.sort(key=lambda x: x['matchScore'], reverse=True)
        return jsonify({'matches': matches})


@app.route('/api/history', methods=['GET'])
def get_history():
    user_id = _get_user_id()
    keyword = request.args.get('keyword', '')
    if keyword:
        resumes = history_store.search(user_id, keyword)
    else:
        resumes = history_store.get_all(user_id)
    
    resumes.sort(key=lambda x: x.get('uploadedAt', ''), reverse=True)
    return jsonify(resumes)


@app.route('/api/history/<resume_id>', methods=['DELETE'])
def delete_history(resume_id):
    user_id = _get_user_id()
    success = history_store.delete(user_id, resume_id)
    if success:
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume_id}.pdf")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Resume not found'}), 404


@app.route('/api/resume/generate', methods=['POST'])
def generate_resume():
    """AI 生成简历"""
    data = request.get_json()

    if not data:
        return jsonify({'error': '请提供简历数据'}), 400

    # 验证必填字段
    basic_info = data.get('basicInfo', {})
    if not basic_info.get('name'):
        return jsonify({'error': '姓名为必填项'}), 400
    if not basic_info.get('email'):
        return jsonify({'error': '邮箱为必填项'}), 400

    try:
        # 调用 Coze API 生成简历
        resume_data = {
            'name': basic_info.get('name', ''),
            'phone': basic_info.get('phone', ''),
            'email': basic_info.get('email', ''),
            'targetPosition': basic_info.get('targetPosition', ''),
            'workYears': basic_info.get('workYears', ''),
            'education': data.get('education', ''),
            'school': data.get('school', ''),
            'major': data.get('major', ''),
            'workExperience': data.get('workExperience', ''),
            'internshipExperience': data.get('internshipExperience', ''),
            'projects': data.get('projects', ''),
            'skills': data.get('skills', []),
            'blog': data.get('blog', ''),
            'selfIntro': data.get('selfIntro', ''),
            'customModules': data.get('customModules', [])
        }

        result = coze_analyzer.generate_resume(resume_data)

        return jsonify({
            'success': True,
            'sections': result.get('sections', []),
            'summary': result.get('summary', '')
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'生成简历失败: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)