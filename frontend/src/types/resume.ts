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

export interface EnhancedComparisonResult {
    resumes: [ResumeData, ResumeData];
    results: [{
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
    }, {
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
    }];
    comparison: {
        overallDiff: number;
        strengths: { [key: string]: string[] };
        weaknesses: { [key: string]: string[] };
        recommendation: string;
        priorityWeights: Record<string, number>;
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