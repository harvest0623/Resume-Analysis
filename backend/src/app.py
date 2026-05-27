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
from storage.history_store import HistoryStore

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
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


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _analyze_single_resume(resume_id, filename, use_coze):
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

    history_store.add(resume_data)
    return resume_data


def _process_batch_task(batch_id, file_tasks, use_coze):
    with batch_tasks_lock:
        batch_tasks[batch_id]['status'] = 'processing'
        batch_tasks[batch_id]['totalCount'] = len(file_tasks)

    def process_one(file_task):
        resume_id = file_task['id']
        filename = file_task['filename']
        try:
            with batch_tasks_lock:
                batch_tasks[batch_id]['currentProcessing'].append(resume_id)

            result = _analyze_single_resume(resume_id, filename, use_coze)

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
    resume_id = data.get('id')
    use_coze = data.get('useCoze', False)  # 是否使用 Coze AI 分析

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

        # 根据选择使用不同的分析方式
        if use_coze:
            try:
                # 使用 Coze AI 分析
                coze_result = coze_analyzer.analyze_resume(
                    resume_text=text,
                    basic_info=extracted_data.get('basicInfo', {})
                )

                # 合并 Coze 分析结果和提取的数据
                analysis_result = {
                    'scores': coze_result.get('scores', {}),
                    'analysis': coze_result.get('analysis', ''),
                    'suggestions': coze_result.get('suggestions', []),
                    'aiProvider': 'coze'
                }

                # 如果 Coze 没有返回部分数据，用规则补充
                if 'skills' not in analysis_result.get('scores', {}):
                    analyzer = ResumeAnalyzer(extracted_data)
                    rule_result = analyzer.analyze()
                    analysis_result['scores'] = {
                        **rule_result['scores'],
                        **analysis_result['scores']
                    }

            except Exception as e:
                # Coze 分析失败，回退到规则分析
                print(f"Coze analysis failed, falling back to rules: {e}")
                analyzer = ResumeAnalyzer(extracted_data)
                analysis_result = analyzer.analyze()
                analysis_result['aiProvider'] = 'rule'
                analysis_result['cozeError'] = str(e)
        else:
            # 使用规则分析（默认）
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

        history_store.add(resume_data)

        return jsonify(resume_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/resume/<resume_id>', methods=['GET'])
def get_resume(resume_id):
    resume = history_store.get(resume_id)
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
        args=(batch_id, file_tasks, use_coze),
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
    resume_ids = data.get('resumeIds', [])
    
    if len(resume_ids) != 2:
        return jsonify({'error': 'Exactly two resume IDs are required'}), 400
    
    resume1 = history_store.get(resume_ids[0])
    resume2 = history_store.get(resume_ids[1])
    
    if not resume1 or not resume2:
        return jsonify({'error': 'One or both resumes not found'}), 404
    
    score1 = resume1.get('scores', {}).get('overall', 0)
    score2 = resume2.get('scores', {}).get('overall', 0)
    
    diff = abs(score1 - score2)
    
    strengths = {
        resume_ids[0]: [],
        resume_ids[1]: []
    }
    
    weaknesses = {
        resume_ids[0]: [],
        resume_ids[1]: []
    }
    
    if score1 > score2:
        strengths[resume_ids[0]].append('综合评分较高')
        weaknesses[resume_ids[1]].append('综合评分较低')
    elif score2 > score1:
        strengths[resume_ids[1]].append('综合评分较高')
        weaknesses[resume_ids[0]].append('综合评分较低')
    
    if resume1.get('scores', {}).get('skills', 0) > resume2.get('scores', {}).get('skills', 0):
        strengths[resume_ids[0]].append('技能评分较高')
        weaknesses[resume_ids[1]].append('技能评分较低')
    else:
        strengths[resume_ids[1]].append('技能评分较高')
        weaknesses[resume_ids[0]].append('技能评分较低')
    
    recommendation = ""
    if diff >= 20:
        recommendation = f"{resume1.get('basicInfo', {}).get('name', '候选人1')} 明显优于另一候选人"
    elif diff >= 10:
        recommendation = f"{resume1.get('basicInfo', {}).get('name', '候选人1')} 略优于另一候选人"
    else:
        recommendation = "两位候选人实力相当，建议进一步考察"
    
    return jsonify({
        'resumes': [resume1, resume2],
        'comparison': {
            'overallDiff': diff,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'recommendation': recommendation
        }
    })


@app.route('/api/match', methods=['POST'])
def match_resumes():
    data = request.get_json()
    job_description = data.get('jobDescription', '')
    requirements = data.get('requirements', '')
    
    matcher = Matcher(job_description, requirements)
    all_resumes = history_store.get_all()
    
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
    keyword = request.args.get('keyword', '')
    if keyword:
        resumes = history_store.search(keyword)
    else:
        resumes = history_store.get_all()
    
    resumes.sort(key=lambda x: x.get('uploadedAt', ''), reverse=True)
    return jsonify(resumes)


@app.route('/api/history/<resume_id>', methods=['DELETE'])
def delete_history(resume_id):
    success = history_store.delete(resume_id)
    if success:
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{resume_id}.pdf")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Resume not found'}), 404


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)