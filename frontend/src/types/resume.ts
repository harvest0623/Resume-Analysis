export interface ResumeData {
    id: string;
    filename: string;
    uploadedAt: string;
    basicInfo: {
        name: string;
        phone: string;
        email: string;
        address: string;
    };
    jobInfo: {
        position: string;
        expectedSalary: string;
    };
    background: {
        workYears: string;
        education: string;
        projects: string[];
        major?: string;
        university?: string;
    };
    skills: string[];
    scores: {
        overall: number;
        skills: number;
        experience: number;
        education: number;
    };
    analysis: string;
    suggestions?: string[];
    aiProvider?: 'coze' | 'rule';
    cozeError?: string;
}

export interface MatchResult {
    resumeId: string;
    matchScore: number;
    details: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
    };
    highlights: string[];
}

export interface ComparisonResult {
    resumes: [ResumeData, ResumeData];
    comparison: {
        overallDiff: number;
        strengths: { [key: string]: string[] };
        weaknesses: { [key: string]: string[] };
        recommendation: string;
    };
}

export interface ComparisonConfig {
    skillsWeight: number;
    experienceWeight: number;
    educationWeight: number;
    skillMatchThreshold: number;
    experienceYearsWeight: number;
    projectQualityWeight: number;
    positionMatchWeight: number;
    educationLevelWeight: number;
    majorMatchWeight: number;
    universityRankWeight: number;
}

export interface SkillDetail {
    name: string;
    weight: number;
    proficiency: string;
    score: number;
}

export interface SkillsDetails {
    matched: SkillDetail[];
    unmatched: string[];
    bonus: string[];
    categoryScores: Record<string, number[]>;
    baseScore: number;
    bonusScore: number;
    categoryBonus: number;
    industry: string;
}

export interface ExperienceDetails {
    years: number;
    yearsScore: number;
    positionMatch: number;
    projectScore: number;
    totalScore: number;
}

export interface EducationDetails {
    educationLevel: number;
    majorMatch: number;
    universityRank: number;
    totalScore: number;
}

export interface SingleResumeComparisonResult {
    matchScore: number;
    details: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        priorityWeights: Record<string, number>;
    };
    skillsDetails: SkillsDetails;
    experienceDetails: ExperienceDetails;
    educationDetails: EducationDetails;
    highlights: string[];
}

export interface EnhancedComparisonResult {
    resumes: ResumeData[];
    results: SingleResumeComparisonResult[];
    comparison: {
        overallDiff: number;
        strengths: { [key: string]: string[] };
        weaknesses: { [key: string]: string[] };
        recommendation: string;
        priorityWeights: Record<string, number>;
        ranking?: { id: string; name: string; rank: number; score: number }[];
    };
}

export interface BatchUploadResult {
    uploaded: { id: string; filename: string; status: string }[];
    errors: { filename: string; error: string }[];
    total: number;
    successCount: number;
    errorCount: number;
}

export interface BatchTaskStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed';
    totalCount: number;
    completedCount: number;
    failedCount: number;
    currentProcessing: string[];
    errors: { id: string; filename: string; error: string }[];
    createdAt: string;
    completedAt: string | null;
}

export interface BatchTaskResults extends BatchTaskStatus {
    results: ResumeData[];
}

// ========== 岗位匹配筛选相关类型 ==========

/** 筛选条件 */
export interface MatchFilters {
    /** 工作经验年限范围 */
    experienceRange: { min: number; max: number };
    /** 最低学历要求 */
    educationLevel: '不限' | '大专' | '本科' | '硕士' | '博士';
    /** 行业背景 */
    industryBackground: string[];
    /** 要求技能（带权重） */
    requiredSkills: { name: string; weight: number }[];
    /** 最少项目经历数 */
    minProjectCount: number;
    /** 各维度权重 */
    weights: {
        skills: number;
        experience: number;
        education: number;
        industry: number;
        projects: number;
    };
}

/** 筛选模板 */
export interface FilterTemplate {
    id: string;
    name: string;
    filters: MatchFilters;
    jobDescription: string;
    requirements: string;
    createdAt: string;
}

/** 筛选预览统计 */
export interface FilterPreview {
    totalCandidates: number;
    filteredCount: number;
    scoreDistribution: { range: string; count: number }[];
    topSkills: { skill: string; count: number }[];
}

/** 扩展的匹配结果 */
export interface ExtendedMatchResult extends MatchResult {
    resume?: ResumeData;
    details: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        industryMatch: number;
        projectMatch: number;
    };
    filterPassed: boolean;
    rejectReasons: string[];
}

export const DEFAULT_FILTERS: MatchFilters = {
    experienceRange: { min: 0, max: 20 },
    educationLevel: '不限',
    industryBackground: [],
    requiredSkills: [],
    minProjectCount: 0,
    weights: {
        skills: 0.35,
        experience: 0.25,
        education: 0.15,
        industry: 0.15,
        projects: 0.10,
    },
};

export const INDUSTRY_OPTIONS = [
    '互联网/IT', '金融', '教育', '医疗健康', '电商',
    '人工智能', '游戏', '企业服务', '汽车', '制造业',
    '房地产', '媒体/内容', '物流/供应链', '零售', '咨询',
];

export const EDUCATION_OPTIONS = ['不限', '大专', '本科', '硕士', '博士'] as const;

export const SKILL_PRESETS: Record<string, string[]> = {
    '前端开发': ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Webpack', 'Vite', 'Tailwind'],
    '后端开发': ['Java', 'Python', 'Go', 'Node.js', 'Spring Boot', 'Django', 'FastAPI', 'gRPC', 'REST API'],
    '数据/算法': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Spark', 'SQL', 'Pandas'],
    '移动开发': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android'],
    '运维/DevOps': ['Docker', 'Kubernetes', 'Linux', 'AWS', 'Azure', 'CI/CD', 'Terraform', 'Jenkins'],
    '产品/设计': ['Figma', 'Sketch', 'Axure', '数据分析', '用户研究', '产品设计'],
};