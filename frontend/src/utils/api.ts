import { ResumeData, MatchResult, ExtendedMatchResult, ComparisonResult, EnhancedComparisonResult, ComparisonConfig, BatchUploadResult, BatchTaskStatus, BatchTaskResults, MatchFilters } from "@/types/resume";
import { getCurrentProfileId, initDevice, migrateLegacyUserId, createProfile, getAllProfiles, saveAllProfiles, switchProfile, Profile } from "@/utils/userProfile";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const PROFILE_ID_HEADER = "X-Profile-Id";

/**
 * 获取当前档案 ID（如果不存在则使用默认导入档案）
 * 持久化在 localStorage，重启项目后自动恢复
 *
 * 注意：默认档案 ID "prof_legacy_imported" 是后端预设的"导入区"，
 *       用于承载用户在数据隔离前上传的旧简历。
 *       用户首次访问后，可以创建自己的档案（profileId 会基于机器指纹重新生成）。
 */
function getProfileId(): string {
    // 首次访问：从旧的随机 userId 迁移（如果有）
    migrateLegacyUserId();

    // 确保 deviceId 已生成
    initDevice();

    // 如果没有当前档案，使用默认导入档案
    let profileId = getCurrentProfileId();
    if (!profileId) {
        // 用后端预设的"导入区"profileId，让用户立刻能看到自己之前的旧数据
        const DEFAULT_IMPORT_PROFILE = "prof_legacy_imported";
        const profile: Profile = {
            id: DEFAULT_IMPORT_PROFILE,
            name: "导入的旧数据",
            deviceId: initDevice(),
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
        };
        // 把这个默认档案保存到 localStorage
        const profiles = getAllProfiles();
        const existing = profiles.find(p => p.id === DEFAULT_IMPORT_PROFILE);
        if (!existing) {
            profiles.push(profile);
            saveAllProfiles(profiles);
        }
        switchProfile(DEFAULT_IMPORT_PROFILE);
        profileId = DEFAULT_IMPORT_PROFILE;
    }
    return profileId;
}

/**
 * 封装的 fetch，自动在所有请求中注入 X-Profile-Id 请求头
 * 后端根据此 header 实现用户数据隔离
 * 同时异步触发档案注册，让后端知道当前用户的 ID 并执行旧数据迁移
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const currentPid = getProfileId();

    // 避免递归：注册接口本身不要触发注册
    const isRegisterCall = url.includes("/profiles/register");
    if (!isRegisterCall && !_registeredProfiles.has(currentPid)) {
        // 异步触发注册，不阻塞当前请求
        ensureProfileRegistered(currentPid).catch(() => {});
    }

    const headers = new Headers(options.headers || {});
    // 自动注入档案 ID
    headers.set(PROFILE_ID_HEADER, currentPid);

    // 如果是 FormData body，不要设置 Content-Type（让浏览器自动处理 multipart boundary）
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...options, headers });
}

// 记录已注册过的 profileId（避免重复请求）
const _registeredProfiles = new Set<string>();

export const api = {
    async healthCheck(): Promise<{ status: string; message: string }> {
        const response = await apiFetch(`${API_BASE}/health`);
        return response.json();
    },

    async registerProfile(profileId: string): Promise<{ success: boolean; profileId: string }> {
        const response = await apiFetch(`${API_BASE}/profiles/register`, {
            method: "POST",
            body: JSON.stringify({ profileId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Profile registration failed");
        }
        _registeredProfiles.add(profileId);
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
            body: JSON.stringify({ resumeIds, config, jobDescription, requirements, useCoze }),
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
        basicInfo: { name: string; phone: string; email: string; targetPosition: string; workYears: string; };
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

// 同一时间只允许一个 registerProfile 请求
let _registrationInFlight: Promise<void> | null = null;

/**
 * 确保后端知道当前档案存在（首次访问时调用）
 * 这会触发后端的旧数据自动迁移
 */
export async function ensureProfileRegistered(profileId?: string): Promise<void> {
    const pid = profileId || getProfileId();
    if (_registeredProfiles.has(pid)) return;

    // 同一时间只允许一个注册请求
    if (_registrationInFlight) {
        return _registrationInFlight;
    }

    _registrationInFlight = (async () => {
        try {
            await api.registerProfile(pid);
        } catch (e) {
            console.warn("Failed to register profile:", e);
        } finally {
            _registrationInFlight = null;
        }
    })();
    return _registrationInFlight;
}

/** 导出 getProfileId 供其他模块使用 */
export { getProfileId };
