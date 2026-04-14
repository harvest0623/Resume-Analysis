import { ResumeData, MatchResult, ComparisonResult } from "@/types/resume";

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

    async analyzeResume(id: string, filename: string): Promise<ResumeData> {
        const response = await fetch(`${API_BASE}/resume/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, filename }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Analysis failed");
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

    async compareResumes(resumeIds: string[]): Promise<ComparisonResult> {
        const response = await fetch(`${API_BASE}/resume/compare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ resumeIds }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Comparison failed");
        }

        return response.json();
    },

    async matchResumes(jobDescription: string, requirements: string): Promise<{ matches: MatchResult[] }> {
        const response = await fetch(`${API_BASE}/match`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ jobDescription, requirements }),
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
};
