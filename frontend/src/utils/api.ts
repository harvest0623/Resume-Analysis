import { ResumeData, MatchResult, ExtendedMatchResult, ComparisonResult, EnhancedComparisonResult, ComparisonConfig, BatchUploadResult, BatchTaskStatus, BatchTaskResults, MatchFilters } from "@/types/resume";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const USER_ID_KEY = "resume_analysis_user_id";

/** 获取或生成持久化的用户标识（存储在 localStorage 中） */
function getUserId(): string {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        // 生成唯一的用户标识：时间戳 + 随机数
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
}

/**
 * 封装的 fetch，自动在所有请求中注入 X-User-Id 请求头
 * 实现前端层面的用户数据隔离
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    // 自动注入用户标识
    headers.set("X-User-Id", getUserId());

    // 如果是 FormData body，不要设置 Content-Type（让浏览器自动处理 multipart boundary）
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...options, headers });
}

export const api = {
    async healthCheck(): Promise<{ status: string; message: string }> {
        const response = await apiFetch(`${API_BASE}/health`);
        return response.json();
    },

    async uploadResume(file: File): Promise<{ id: string; filename: string; status: string }> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiFetch(`${API_BASE}/resume/upload`, {
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
        const response = await apiFetch(`${API_BASE}/resume/analyze`, {
            method: "POST",
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

        const response = await apiFetch(`${API_BASE}/resume/batch/upload`, {
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
        const response = await apiFetch(`${API_BASE}/resume/batch/analyze`, {
            method: "POST",
            body: JSON.stringify({ files, useCoze }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Batch analysis failed");
        }

        return response.json();
    },

    async getBatchStatus(batchId: string): Promise<BatchTaskStatus> {
        const response = await apiFetch(`${API_BASE}/batch/${batchId}/status`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get batch status");
        }

        return response.json();
    },

    async getBatchResults(batchId: string): Promise<BatchTaskResults> {
        const response = await apiFetch(`${API_BASE}/batch/${batchId}/results`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get batch results");
        }

        return response.json();
    },

    async getResume(id: string): Promise<ResumeData> {
        const response = await apiFetch(`${API_BASE}/resume/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Resume not found");
        }
        return response.json();
    },

    async compareResumes(resumeIds: string[], config?: ComparisonConfig, jobDescription?: string, requirements?: string, useCoze: boolean = false): Promise<EnhancedComparisonResult> {
        const response = await apiFetch(`${API_BASE}/resume/compare`, {
            method: "POST",
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
        const response = await apiFetch(`${API_BASE}/resume/compare/config`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to get config");
        }
        return response.json();
    },

    async validateComparisonConfig(config: ComparisonConfig): Promise<{ valid: boolean; message: string }> {
        const response = await apiFetch(`${API_BASE}/resume/compare/validate-config`, {
            method: "POST",
            body: JSON.stringify(config),
        });
        return response.json();
    },

    async matchResumes(jobDescription: string, requirements: string, filters?: any, useCoze: boolean = false): Promise<{ matches: any[] }> {
        const response = await apiFetch(`${API_BASE}/match`, {
            method: "POST",
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

        const response = await apiFetch(url.toString());
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch history");
        }
        return response.json();
    },

    async optimizeResume(id: string): Promise<{ id: string; analysis: string; suggestions: string[]; categories: any[]; aiProvider: string }> {
        const response = await apiFetch(`${API_BASE}/resume/optimize`, {
            method: "POST",
            body: JSON.stringify({ id }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Optimization failed");
        }

        return response.json();
    },

    async deleteHistory(id: string): Promise<{ success: boolean }> {
        const response = await apiFetch(`${API_BASE}/history/${id}`, {
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
        const response = await apiFetch(`${API_BASE}/resume/generate`, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Generate failed");
        }

        return response.json();
    },
};

/** 导出 getUserId 供其他模块使用（如需要显示当前用户信息） */
export { getUserId };