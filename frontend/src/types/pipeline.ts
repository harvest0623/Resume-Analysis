/** 招聘漏斗阶段 */
export interface PipelineStage {
    id: string;
    name: string;
    count: number;
    icon: string;
    color: string;
    bgColor: string;
    conversionRate: number;
    /** 阶段排序 */
    order: number;
}

/** 候选人状态 */
export type CandidateStatus =
    | 'pending'      // 待处理
    | 'screening'    // 筛选中
    | 'interviewing' // 面试中
    | 'offered'      // 已发Offer
    | 'hired'        // 已入职
    | 'rejected'     // 已拒绝
    | 'withdrawn';   // 已撤回

/** 候选人信息 */
export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    currentStage: string;
    status: CandidateStatus;
    appliedAt: string;
    updatedAt: string;
    resumeId?: string;
    resumeUrl?: string;
    score?: number;
    notes?: string;
    tags?: string[];
    /** 面试官 */
    interviewer?: string;
    /** 面试时间 */
    interviewTime?: string;
    /** Offer薪资 */
    offerSalary?: string;
    /** 入职日期 */
    hireDate?: string;
}

/** 时间维度 */
export type TimeDimension = 'day' | 'week' | 'month' | 'quarter';

/** 筛选条件 */
export interface PipelineFilters {
    /** 时间维度 */
    timeDimension: TimeDimension;
    /** 开始日期 */
    startDate?: string;
    /** 结束日期 */
    endDate?: string;
    /** 部门 */
    department?: string;
    /** 职位 */
    position?: string;
    /** 状态 */
    status?: CandidateStatus;
    /** 搜索关键词 */
    keyword?: string;
}

/** 漏斗统计数据 */
export interface FunnelData {
    stageId: string;
    stageName: string;
    count: number;
    percentage: number;
    conversionRate: number;
    avgDays: number;
}

/** 趋势数据 */
export interface TrendData {
    date: string;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
}

/** 部门统计 */
export interface DepartmentStats {
    department: string;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    conversionRate: number;
    avgDays: number;
}

/** 漏斗配置 */
export interface PipelineConfig {
    id: string;
    name: string;
    stages: PipelineStage[];
    isDefault: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

/** 用户角色 */
export type UserRole = 'hr' | 'recruiter' | 'manager' | 'admin';

/** 权限配置 */
export interface RolePermissions {
    canViewPipeline: boolean;
    canEditCandidates: boolean;
    canBulkUpdate: boolean;
    canExportData: boolean;
    canConfigureStages: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
}

/** 角色权限映射 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    hr: {
        canViewPipeline: true,
        canEditCandidates: true,
        canBulkUpdate: false,
        canExportData: true,
        canConfigureStages: false,
        canManageUsers: false,
        canViewAnalytics: true,
    },
    recruiter: {
        canViewPipeline: true,
        canEditCandidates: true,
        canBulkUpdate: true,
        canExportData: true,
        canConfigureStages: false,
        canManageUsers: false,
        canViewAnalytics: true,
    },
    manager: {
        canViewPipeline: true,
        canEditCandidates: true,
        canBulkUpdate: true,
        canExportData: true,
        canConfigureStages: false,
        canManageUsers: false,
        canViewAnalytics: true,
    },
    admin: {
        canViewPipeline: true,
        canEditCandidates: true,
        canBulkUpdate: true,
        canExportData: true,
        canConfigureStages: true,
        canManageUsers: true,
        canViewAnalytics: true,
    },
};

/** 默认漏斗阶段配置 */
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
    {
        id: 'applied',
        name: '简历筛选',
        count: 0,
        icon: 'FileText',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        conversionRate: 100,
        order: 1,
    },
    {
        id: 'screening',
        name: '初筛',
        count: 0,
        icon: 'Users',
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        conversionRate: 0,
        order: 2,
    },
    {
        id: 'written',
        name: '笔试',
        count: 0,
        icon: 'PenTool',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        conversionRate: 0,
        order: 3,
    },
    {
        id: 'interview',
        name: '面试',
        count: 0,
        icon: 'UserCheck',
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        conversionRate: 0,
        order: 4,
    },
    {
        id: 'offer',
        name: 'Offer',
        count: 0,
        icon: 'Handshake',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        conversionRate: 0,
        order: 5,
    },
    {
        id: 'hired',
        name: '入职',
        count: 0,
        icon: 'Briefcase',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        conversionRate: 0,
        order: 6,
    },
];
