import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from parser.pdf_parser import PDFParser
from parser.text_extractor import TextExtractor
from analyzer.resume_analyzer import ResumeAnalyzer
from analyzer.matcher import Matcher
from storage.history_store import HistoryStore

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

history_store = HistoryStore()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
        
        analyzer = ResumeAnalyzer(extracted_data)
        analysis_result = analyzer.analyze()
        
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
