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