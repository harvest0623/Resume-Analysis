import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, Check, Trash2, X, ShieldCheck, HardDrive, AlertCircle } from "lucide-react";
import {
    Profile,
    getAllProfiles,
    getCurrentProfile,
    createProfile,
    switchProfile,
    deleteProfile,
} from "@/utils/userProfile";
import { api } from "@/utils/api";

interface ProfileManagerProps {
    open: boolean;
    onClose: () => void;
    onProfileChanged?: () => void;
}

/**
 * 用户档案管理弹窗
 *  - 列出本机所有档案
 *  - 创建新档案（用户自定义名字）
 *  - 切换档案
 *  - 删除档案
 */
export default function ProfileManager({ open, onClose, onProfileChanged }: ProfileManagerProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [current, setCurrent] = useState<Profile | null>(null);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const reload = () => {
        setProfiles(getAllProfiles());
        setCurrent(getCurrentProfile());
    };

    useEffect(() => {
        if (open) reload();
    }, [open]);

    const handleCreate = async () => {
        setError("");
        const name = newName.trim();
        if (!name) {
            setError("档案名不能为空");
            return;
        }
        if (name.length > 32) {
            setError("档案名不能超过 32 字符");
            return;
        }
        try {
            setBusy(true);
            const profile = createProfile(name);
            // 通知后端
            await api.registerProfile(profile.id);
            setNewName("");
            reload();
            onProfileChanged?.();
        } catch (e: any) {
            setError(e.message || "创建失败");
        } finally {
            setBusy(false);
        }
    };

    const handleSwitch = async (profile: Profile) => {
        if (profile.id === current?.id) return;
        try {
            setBusy(true);
            switchProfile(profile.id);
            await api.registerProfile(profile.id);
            reload();
            onProfileChanged?.();
        } catch (e: any) {
            setError(e.message || "切换失败");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (profile: Profile) => {
        if (!confirm(`确认删除档案「${profile.name}」？\n（不会删除已上传的 PDF 文件，但后端数据仍会保留）`)) {
            return;
        }
        try {
            setBusy(true);
            deleteProfile(profile.id);
            reload();
            onProfileChanged?.();
        } catch (e: any) {
            setError(e.message || "删除失败");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    用户档案管理
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 安全说明 */}
                        <div className="px-4 pt-3 pb-2 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                            <span>
                                每个档案的数据独立存储在本机，路径权限仅本人可访问。
                                切换档案将看到不同的历史记录。
                            </span>
                        </div>

                        {/* 列表 */}
                        <div className="px-4 py-2 max-h-80 overflow-y-auto">
                            {profiles.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    暂无档案，请创建一个
                                </div>
                            ) : (
                                <ul className="space-y-1">
                                    {profiles.map(p => (
                                        <li
                                            key={p.id}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                                p.id === current?.id
                                                    ? "bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-700"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <button
                                                className="flex-1 text-left"
                                                onClick={() => handleSwitch(p)}
                                                disabled={busy}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">
                                                        {p.name}
                                                    </span>
                                                    {p.id === current?.id && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded">
                                                            当前
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {p.id.slice(0, 30)}...
                                                </div>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {p.id === current?.id ? (
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(p)}
                                                        className="p-1 text-gray-400 hover:text-red-500"
                                                        title="删除档案"
                                                        disabled={busy}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* 创建 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                    placeholder="新档案名（如：求职、考研）"
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    maxLength={32}
                                    disabled={busy}
                                />
                                <button
                                    onClick={handleCreate}
                                    disabled={busy || !newName.trim()}
                                    className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    创建
                                </button>
                            </div>
                            {error && (
                                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* 底部说明 */}
                        <div className="px-4 pb-4 text-xs text-gray-400 flex items-start gap-2">
                            <HardDrive className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>
                                数据存储位置：<code className="text-gray-500">backend/src/data/users/&lt;profileId&gt;/</code>
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
