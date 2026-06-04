import { ResumeData, MatchResult, ExtendedMatchResult, ComparisonResult, EnhancedComparisonResult, ComparisonConfig, BatchUploadResult, BatchTaskStatus, BatchTaskResults, MatchFilters } from "@/types/resume";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const api = {
    async healthCheck(): Promise<{ status: string; message: string }> {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    },

    async uploadResume(file: File): Promise<{ id: string; filename: string; status: string }> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/resume/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Upload failed");
        }

        return response.json();
    },

    async analyzeResume(id: string, filename: string, useCoze: boolean = false): Promise<ResumeData> {
        const response = await fetch(`${API_BASE}/resume/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, filename, useCoze }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Analysis failed");
        }

        return response.json();
    },

    async batchUpload(files: File[]): Promise<BatchUploadResult> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await fetch(`${API_BASE}/resume/batch/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Batch upload failed");
        }

        return response.json();
    },

    async batchAnalyze(files: { id: string; filename: string }[], useCoze: boolean = false): Promise<{ batchId: string; status: string; totalCount: number }> {
        const response = await fetch(`${API_BASE}/resume/batch/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ files, useCoze }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Batch analysis failed");
        }

        return response.json();
    },

    async getBatchStatus(batchId: string): Promise<BatchTaskStatus> {
        const response = await fetch(`${API_BASE}/batch/${batchId}/status`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get batch status");
        }

        return response.json();
    },

    async getBatchResults(batchId: string): Promise<BatchTaskResults> {
        const response = await fetch(`${API_BASE}/batch/${batchId}/results`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get batch results");
        }

        return response.json();
    },

    async getResume(id: string): Promise<ResumeData> {
        const response = await fetch(`${API_BASE}/resume/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Resume not found");
        }
        return response.json();
    },

    async compareResumes(resumeIds: string[], config?: ComparisonConfig, jobDescription?: string, requirements?: string, useCoze: boolean = false): Promise<EnhancedComparisonResult> {
        const response = await fetch(`${API_BASE}/resume/compare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                resumeIds,
                config,
                jobDescription,
                requirements,
                useCoze
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Comparison failed");
        }

        return response.json();
    },

    async getComparisonConfig(): Promise<ComparisonConfig> {
        const response = await fetch(`${API_BASE}/resume/compare/config`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get config");
        }
        return response.json();
    },

    async validateComparisonConfig(config: ComparisonConfig): Promise<{ valid: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/resume/compare/validate-config`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
        });
        return response.json();
    },

    async matchResumes(jobDescription: string, requirements: string, filters?: any, useCoze: boolean = false): Promise<{ matches: any[] }> {
        const response = await fetch(`${API_BASE}/match`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ jobDescription, requirements, filters, useCoze }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Matching failed");
        }

        return response.json();
    },

    async getHistory(keyword?: string): Promise<ResumeData[]> {
        const url = new URL(`${API_BASE}/history`);
        if (keyword) {
            url.searchParams.append("keyword", keyword);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch history");
        }
        return response.json();
    },

    async optimizeResume(id: string): Promise<{ id: string; analysis: string; suggestions: string[]; categories: any[]; aiProvider: string }> {
        const response = await fetch(`${API_BASE}/resume/optimize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Optimization failed");
        }

        return response.json();
    },

    async deleteHistory(id: string): Promise<{ success: boolean }> {
        const response = await fetch(`${API_BASE}/history/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Delete failed");
        }

        return response.json();
    },

    async generateResume(data: {
        basicInfo: {
            name: string;
            phone: string;
            email: string;
            targetPosition: string;
            workYears: string;
        };
        education: string;
        school: string;
        major: string;
        workExperience: string;
        internshipExperience: string;
        projects: string;
        skills: string[];
        blog: string;
        selfIntro: string;
        customModules: { title: string; fields: { label: string; value: string }[] }[];
    }): Promise<{ success: boolean; sections: { title: string; content: string; order: number }[]; summary: string }> {
        const response = await fetch(`${API_BASE}/resume/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Generate failed");
        }

        return response.json();
    },
};