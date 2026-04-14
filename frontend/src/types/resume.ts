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
