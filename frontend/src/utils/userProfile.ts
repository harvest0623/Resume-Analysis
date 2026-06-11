/**
 * 本地用户档案管理
 * 实现方案：机器指纹 + 用户名（不依赖随机 userId）
 *   - 机器指纹：根据浏览器/系统特征生成，同一台电脑始终一致
 *   - 用户名：用户自己设置的"档案名"（如"我的工作"、"学习用"）
 *   - profileId = 机器指纹_用户名哈希
 *   - 持久化：用户名、当前档案 id 都存 localStorage
 *   - 重启/刷新后能自动恢复当前档案
 */

const STORAGE_KEY_PROFILE_ID = "resume_analysis_current_profile_id";
const STORAGE_KEY_PROFILE_NAME = "resume_analysis_current_profile_name";
const STORAGE_KEY_ALL_PROFILES = "resume_analysis_profiles";
const STORAGE_KEY_DEVICE_ID = "resume_analysis_device_id";

/* ──────────── 设备指纹：稳定唯一标识本机 ──────────── */

/**
 * 生成稳定且唯一的设备指纹
 * 基于多个浏览器/系统特征，组合后哈希
 * 同一台电脑同一浏览器始终返回相同 ID
 */
function generateDeviceFingerprint(): string {
    const components: string[] = [];

    try {
        // 1. 浏览器核心信息
        components.push(navigator.userAgent || "");
        components.push(navigator.language || "");
        components.push((navigator.languages || []).join(","));

        // 2. 屏幕与窗口
        components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
        components.push(`${window.devicePixelRatio || 1}`);
        components.push(`${window.innerWidth}x${window.innerHeight}`);

        // 3. 时区
        components.push(new Date().getTimezoneOffset().toString());
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "");

        // 4. 平台
        components.push(navigator.platform || "");
        components.push((navigator as any).cookieEnabled ? "1" : "0");

        // 5. 硬件并发
        components.push((navigator.hardwareConcurrency || 0).toString());
        components.push((navigator as any).deviceMemory?.toString() || "0");

        // 6. Canvas 指纹（GPU 渲染差异）
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = 200;
                canvas.height = 50;
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.fillStyle = "#f60";
                ctx.fillRect(0, 0, 200, 50);
                ctx.fillStyle = "#069";
                ctx.fillText("Resume-Analysis-FP", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("Resume-Analysis-FP", 4, 17);
                components.push(canvas.toDataURL());
            }
        } catch (_) {
            // 忽略 canvas 错误
        }
    } catch (_) {
        // 忽略
    }

    return hashString(components.join("|"));
}

/** 简单稳定哈希（djb2） */
function hashString(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    // 转为 36 进制字符串，并保证长度
    return Math.abs(hash).toString(36).padStart(8, "0") +
           Math.abs(hash * 31).toString(36).padStart(8, "0");
}

/* ──────────── 档案接口 ──────────── */

export interface Profile {
    id: string;                // profileId，例 "dev_abc123_我的工作_a1b2c3d4"
    name: string;              // 用户档案名（显示用）
    deviceId: string;          // 所属设备指纹
    createdAt: string;         // ISO 时间
    lastUsedAt: string;        // ISO 时间
}

function generateProfileId(deviceId: string, name: string): string {
    // 设备指纹 + 用户名哈希 = profileId
    // 即使重装，deviceId 不变 + name 相同 → 同样的 profileId
    return `prof_${deviceId.slice(0, 12)}_${hashString(name.trim().toLowerCase())}`;
}

/* ──────────── 公开 API ──────────── */

/** 初始化（确保有 deviceId） */
export function initDevice(): string {
    let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!deviceId) {
        deviceId = `dev_${generateDeviceFingerprint()}`;
        localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);
    }
    return deviceId;
}

/** 获取所有本地档案 */
export function getAllProfiles(): Profile[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_ALL_PROFILES);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveAllProfiles(profiles: Profile[]): void {
    localStorage.setItem(STORAGE_KEY_ALL_PROFILES, JSON.stringify(profiles));
}

/** 获取当前激活的档案 ID（可能为 null，表示未设置） */
export function getCurrentProfileId(): string | null {
    return localStorage.getItem(STORAGE_KEY_PROFILE_ID);
}

/** 获取当前激活的档案 */
export function getCurrentProfile(): Profile | null {
    const id = getCurrentProfileId();
    if (!id) return null;
    return getAllProfiles().find(p => p.id === id) || null;
}

/** 创建一个新档案并切换到它 */
export function createProfile(name: string): Profile {
    const trimmed = (name || "").trim();
    if (!trimmed) {
        throw new Error("档案名不能为空");
    }
    if (trimmed.length > 32) {
        throw new Error("档案名不能超过 32 个字符");
    }

    const deviceId = initDevice();
    const profile: Profile = {
        id: generateProfileId(deviceId, trimmed),
        name: trimmed,
        deviceId,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
    };

    // 如果同名档案已存在，切换到那个；否则创建新的
    const profiles = getAllProfiles();
    const existing = profiles.find(p => p.id === profile.id);
    if (existing) {
        existing.lastUsedAt = new Date().toISOString();
        saveAllProfiles(profiles);
        switchProfile(existing.id);
        return existing;
    }

    profiles.push(profile);
    saveAllProfiles(profiles);
    switchProfile(profile.id);
    return profile;
}

/** 切换到指定档案（仅本机的档案可切换） */
export function switchProfile(profileId: string): Profile | null {
    const profiles = getAllProfiles();
    const target = profiles.find(p => p.id === profileId);
    if (!target) return null;

    target.lastUsedAt = new Date().toISOString();
    saveAllProfiles(profiles);

    localStorage.setItem(STORAGE_KEY_PROFILE_ID, target.id);
    localStorage.setItem(STORAGE_KEY_PROFILE_NAME, target.name);
    return target;
}

/** 删除一个档案（后端数据不会自动删除） */
export function deleteProfile(profileId: string): boolean {
    const profiles = getAllProfiles();
    const idx = profiles.findIndex(p => p.id === profileId);
    if (idx === -1) return false;

    profiles.splice(idx, 1);
    saveAllProfiles(profiles);

    // 如果删的是当前档案，清除当前档案
    if (getCurrentProfileId() === profileId) {
        localStorage.removeItem(STORAGE_KEY_PROFILE_ID);
        localStorage.removeItem(STORAGE_KEY_PROFILE_NAME);
    }
    return true;
}

/** 兼容旧版本：从旧的随机 userId 迁移到档案系统 */
export function migrateLegacyUserId(): string | null {
    const LEGACY_KEY = "resume_analysis_user_id";
    const legacyId = localStorage.getItem(LEGACY_KEY);
    if (!legacyId) return null;

    // 把旧 userId 重命名为一个新档案名"默认档案"
    // （用户在 UI 上看到的就是这个名字，可后续修改）
    const profile = createProfile("默认档案");
    localStorage.removeItem(LEGACY_KEY);
    return profile.id;
}
