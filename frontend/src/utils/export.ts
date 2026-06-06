import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ResumeData } from '@/types/resume';

// 扩展 jsPDF 类型以支持 autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ExportConfig {
    format: ExportFormat;
    filename: string;
    dateRange: string;
    selectedFields: string[];
    includeHeader: boolean;
    customTitle?: string;
}

export interface ExportHistoryItem {
    id: string;
    name: string;
    format: ExportFormat;
    date: string;
    size: string;
    status: 'completed' | 'failed';
}

// 可导出的字段配置
export const EXPORT_FIELDS = [
    { id: 'name', label: '姓名', category: '基本信息' },
    { id: 'phone', label: '电话', category: '基本信息' },
    { id: 'email', label: '邮箱', category: '基本信息' },
    { id: 'position', label: '应聘职位', category: '基本信息' },
    { id: 'expectedSalary', label: '期望薪资', category: '基本信息' },
    { id: 'workYears', label: '工作年限', category: '背景信息' },
    { id: 'education', label: '学历', category: '背景信息' },
    { id: 'major', label: '专业', category: '背景信息' },
    { id: 'university', label: '学校', category: '背景信息' },
    { id: 'skills', label: '技能', category: '技能信息' },
    { id: 'overallScore', label: '综合评分', category: '评分信息' },
    { id: 'skillsScore', label: '技能评分', category: '评分信息' },
    { id: 'experienceScore', label: '经验评分', category: '评分信息' },
    { id: 'educationScore', label: '教育评分', category: '评分信息' },
    { id: 'analysis', label: '分析结果', category: '分析信息' },
    { id: 'uploadDate', label: '上传日期', category: '系统信息' },
];

// 生成默认文件名
export function generateFilename(template: string, format: ExportFormat): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    
    const ext = format === 'xlsx' ? '.xlsx' : format === 'csv' ? '.csv' : '.pdf';
    
    return template
        .replace('{date}', dateStr)
        .replace('{time}', timeStr)
        .replace('{timestamp}', `${dateStr}_${timeStr}`) + ext;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 准备导出数据
function prepareExportData(
    resumes: ResumeData[],
    selectedFields: string[]
): Record<string, any>[] {
    return resumes.map(resume => {
        const row: Record<string, any> = {};
        
        selectedFields.forEach(fieldId => {
            switch (fieldId) {
                case 'name':
                    row['姓名'] = resume.basicInfo.name;
                    break;
                case 'phone':
                    row['电话'] = resume.basicInfo.phone;
                    break;
                case 'email':
                    row['邮箱'] = resume.basicInfo.email;
                    break;
                case 'position':
                    row['应聘职位'] = resume.jobInfo.position;
                    break;
                case 'expectedSalary':
                    row['期望薪资'] = resume.jobInfo.expectedSalary;
                    break;
                case 'workYears':
                    row['工作年限'] = resume.background.workYears;
                    break;
                case 'education':
                    row['学历'] = resume.background.education;
                    break;
                case 'major':
                    row['专业'] = resume.background.major || '-';
                    break;
                case 'university':
                    row['学校'] = resume.background.university || '-';
                    break;
                case 'skills':
                    row['技能'] = resume.skills.join(', ');
                    break;
                case 'overallScore':
                    row['综合评分'] = resume.scores.overall;
                    break;
                case 'skillsScore':
                    row['技能评分'] = resume.scores.skills;
                    break;
                case 'experienceScore':
                    row['经验评分'] = resume.scores.experience;
                    break;
                case 'educationScore':
                    row['教育评分'] = resume.scores.education;
                    break;
                case 'analysis':
                    row['分析结果'] = resume.analysis;
                    break;
                case 'uploadDate':
                    row['上传日期'] = new Date(resume.uploadedAt).toLocaleDateString('zh-CN');
                    break;
            }
        });
        
        return row;
    });
}

// 导出为 Excel
export async function exportToExcel(
    resumes: ResumeData[],
    config: ExportConfig
): Promise<{ success: boolean; filename: string; size: string }> {
    try {
        const data = prepareExportData(resumes, config.selectedFields);
        const ws = XLSX.utils.json_to_sheet(data);
        
        // 设置列宽
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length * 2, 10)
        }));
        ws['!cols'] = colWidths;
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '简历数据');
        
        // 如果有分析数据，添加统计表
        if (resumes.length > 0) {
            const statsData = [
                { '统计项': '候选人总数', '数值': resumes.length },
                { '统计项': '平均综合评分', '数值': (resumes.reduce((sum, r) => sum + r.scores.overall, 0) / resumes.length).toFixed(1) },
                { '统计项': '最高评分', '数值': Math.max(...resumes.map(r => r.scores.overall)) },
                { '统计项': '最低评分', '数值': Math.min(...resumes.map(r => r.scores.overall)) },
            ];
            const statsWs = XLSX.utils.json_to_sheet(statsData);
            statsWs['!cols'] = [{ wch: 15 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, statsWs, '统计概览');
        }
        
        const filename = generateFilename(config.filename, 'xlsx');
        XLSX.writeFile(wb, filename);
        
        // 估算文件大小
        const estimatedSize = data.length * 200;
        
        return {
            success: true,
            filename,
            size: formatFileSize(estimatedSize)
        };
    } catch (error) {
        console.error('Excel export failed:', error);
        throw new Error('Excel导出失败: ' + (error as Error).message);
    }
}

// 导出为 CSV
export async function exportToCSV(
    resumes: ResumeData[],
    config: ExportConfig
): Promise<{ success: boolean; filename: string; size: string }> {
    try {
        const data = prepareExportData(resumes, config.selectedFields);
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const filename = generateFilename(config.filename, 'csv');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        
        return {
            success: true,
            filename,
            size: formatFileSize(blob.size)
        };
    } catch (error) {
        console.error('CSV export failed:', error);
        throw new Error('CSV导出失败: ' + (error as Error).message);
    }
}

// 导出为 PDF
export async function exportToPDF(
    resumes: ResumeData[],
    config: ExportConfig
): Promise<{ success: boolean; filename: string; size: string }> {
    try {
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // 添加标题
        doc.setFontSize(18);
        doc.text(config.customTitle || '简历分析报告', 14, 20);
        
        // 添加生成时间
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 14, 28);
        doc.text(`候选人数量: ${resumes.length}`, 14, 34);
        
        // 准备表格数据
        const tableData = resumes.map(resume => {
            const row: string[] = [];
            config.selectedFields.forEach(fieldId => {
                switch (fieldId) {
                    case 'name': row.push(resume.basicInfo.name); break;
                    case 'phone': row.push(resume.basicInfo.phone); break;
                    case 'email': row.push(resume.basicInfo.email); break;
                    case 'position': row.push(resume.jobInfo.position); break;
                    case 'expectedSalary': row.push(resume.jobInfo.expectedSalary); break;
                    case 'workYears': row.push(resume.background.workYears); break;
                    case 'education': row.push(resume.background.education); break;
                    case 'major': row.push(resume.background.major || '-'); break;
                    case 'university': row.push(resume.background.university || '-'); break;
                    case 'skills': row.push(resume.skills.join(', ')); break;
                    case 'overallScore': row.push(String(resume.scores.overall)); break;
                    case 'skillsScore': row.push(String(resume.scores.skills)); break;
                    case 'experienceScore': row.push(String(resume.scores.experience)); break;
                    case 'educationScore': row.push(String(resume.scores.education)); break;
                    case 'analysis': row.push(resume.analysis.substring(0, 50) + '...'); break;
                    case 'uploadDate': row.push(new Date(resume.uploadedAt).toLocaleDateString('zh-CN')); break;
                }
            });
            return row;
        });
        
        const headers = config.selectedFields.map(fieldId => {
            const field = EXPORT_FIELDS.find(f => f.id === fieldId);
            return field ? field.label : fieldId;
        });
        
        // 添加表格
        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
            margin: { top: 40 },
        });
        
        const filename = generateFilename(config.filename, 'pdf');
        doc.save(filename);
        
        // 估算PDF大小
        const estimatedSize = resumes.length * 500 + 50000;
        
        return {
            success: true,
            filename,
            size: formatFileSize(estimatedSize)
        };
    } catch (error) {
        console.error('PDF export failed:', error);
        throw new Error('PDF导出失败: ' + (error as Error).message);
    }
}

// 主导出函数
export async function exportData(
    resumes: ResumeData[],
    config: ExportConfig
): Promise<{ success: boolean; filename: string; size: string }> {
    if (resumes.length === 0) {
        throw new Error('没有可导出的数据');
    }
    
    switch (config.format) {
        case 'xlsx':
            return exportToExcel(resumes, config);
        case 'csv':
            return exportToCSV(resumes, config);
        case 'pdf':
            return exportToPDF(resumes, config);
        default:
            throw new Error('不支持的导出格式');
    }
}

// 导出历史记录管理
const HISTORY_KEY = 'export_history';

export function getExportHistory(): ExportHistoryItem[] {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function addToExportHistory(item: ExportHistoryItem): void {
    const history = getExportHistory();
    history.unshift(item);
    // 只保留最近20条记录
    if (history.length > 20) {
        history.pop();
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearExportHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
}

// 导出模板管理
const TEMPLATES_KEY = 'export_templates';

export interface ExportTemplate {
    id: string;
    name: string;
    config: Omit<ExportConfig, 'filename'>;
    createdAt: string;
}

export function getExportTemplates(): ExportTemplate[] {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveExportTemplate(template: ExportTemplate): void {
    const templates = getExportTemplates();
    templates.unshift(template);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteExportTemplate(id: string): void {
    const templates = getExportTemplates().filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
