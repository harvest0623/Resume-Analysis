import { Candidate, FunnelData, DepartmentStats, PipelineStage } from '@/types/pipeline';

/** 格式化数字 */
export const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

/** 格式化百分比 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/** 格式化日期 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

/** 格式化相对时间 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(dateString);
};

/** 获取状态标签 */
export const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: '待处理',
        screening: '筛选中',
        interviewing: '面试中',
        offered: '已发Offer',
        hired: '已入职',
        rejected: '已拒绝',
        withdrawn: '已撤回',
    };
    return labels[status] || status;
};

/** 获取状态颜色 */
export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        pending: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        screening: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        interviewing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        offered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        withdrawn: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

/** 导出为CSV */
export const exportToCSV = (data: Record<string, any>[], filename: string): void => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value);
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
};

/** 导出漏斗数据 */
export const exportFunnelData = (
    funnelData: FunnelData[],
    candidates: Candidate[],
    selectedStage?: string | null
): void => {
    // 导出漏斗概览
    const funnelExport = funnelData.map(item => ({
        '阶段': item.stageName,
        '人数': item.count,
        '占比': formatPercentage(item.percentage),
        '转化率': formatPercentage(item.conversionRate),
        '平均天数': item.avgDays,
    }));

    exportToCSV(funnelExport, '漏斗概览');

    // 如果选择了特定阶段，导出该阶段候选人
    if (selectedStage) {
        const stageCandidates = candidates.filter(c => c.currentStage === selectedStage);
        if (stageCandidates.length > 0) {
            const candidateExport = stageCandidates.map(c => ({
                '姓名': c.name,
                '邮箱': c.email,
                '电话': c.phone,
                '职位': c.position,
                '部门': c.department,
                '状态': getStatusLabel(c.status),
                '评分': c.score || '-',
                '投递时间': formatDate(c.appliedAt),
                '更新时间': formatDate(c.updatedAt),
            }));

            exportToCSV(candidateExport, `候选人_${selectedStage}`);
        }
    }
};

/** 导出全量数据 */
export const exportFullData = (
    funnelData: FunnelData[],
    candidates: Candidate[],
    departmentStats: DepartmentStats[]
): void => {
    // 导出候选人详情
    const candidateExport = candidates.map(c => ({
        '姓名': c.name,
        '邮箱': c.email,
        '电话': c.phone,
        '职位': c.position,
        '部门': c.department,
        '当前阶段': c.currentStage,
        '状态': getStatusLabel(c.status),
        '评分': c.score || '-',
        '投递时间': formatDate(c.appliedAt),
        '更新时间': formatDate(c.updatedAt),
        '标签': c.tags?.join('; ') || '',
        '备注': c.notes || '',
    }));

    exportToCSV(candidateExport, '候选人全量数据');

    // 导出部门统计
    const deptExport = departmentStats.map(d => ({
        '部门': d.department,
        '投递数': d.applied,
        '筛选数': d.screening,
        '面试数': d.interview,
        'Offer数': d.offer,
        '入职数': d.hired,
        '转化率': formatPercentage(d.conversionRate),
        '平均天数': d.avgDays,
    }));

    exportToCSV(deptExport, '部门统计');
};

/** 筛选候选人 */
export const filterCandidates = (
    candidates: Candidate[],
    stageId?: string | null,
    keyword?: string
): Candidate[] => {
    let filtered = [...candidates];

    if (stageId) {
        filtered = filtered.filter(c => c.currentStage === stageId);
    }

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(lowerKeyword) ||
            c.email.toLowerCase().includes(lowerKeyword) ||
            c.position.toLowerCase().includes(lowerKeyword) ||
            c.department.toLowerCase().includes(lowerKeyword)
        );
    }

    return filtered;
};

/** 分页 */
export const paginate = <T>(data: T[], page: number, pageSize: number): T[] => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
};

/** 计算转化率 */
export const calculateConversionRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return (current / previous) * 100;
};

/** 生成随机ID */
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15);
};
