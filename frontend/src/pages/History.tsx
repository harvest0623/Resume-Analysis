import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Trash2,
    RefreshCcw,
    FileText,
    LayoutGrid,
    List,
    ArrowUpDown,
    Users,
    Award,
    Clock,
    ChevronDown,
    X,
    BarChart3,
    Briefcase,
    History as HistoryIcon,
    CheckSquare,
    Square,
    GitCompare,
    Filter,
    Check,
    Inbox,
    Sparkles,
    Eye,
    Star,
    Download,
    LayoutList,
    TrendingUp,
    Tag,
    Plus,
    ArrowUp,
    ChevronUp,
    GripVertical,
    Pencil,
    GraduationCap,
    Calendar,
    Zap,
    Upload,
    Brain,
    Cloud,
    Activity,
    FileJson,
    FileSpreadsheet,
    Bookmark,
    Share2,
    Target,
    Trophy,
    Lightbulb,
    PieChart,
    Layers,
    GitBranch,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ResumeCard from "@/components/ResumeCard";
import ResumePreviewPanel from "@/components/ResumePreviewPanel";
import { api, ensureProfileRegistered } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

/* ==================== 类型 ==================== */

type SortKey = "newest" | "oldest" | "score-high" | "score-low" | "name";
type ScoreFilter = "all" | "high" | "medium" | "low" | "90+" | "80+" | "70+" | "60+";
type ViewMode = "grid" | "list";
type TimeFilter = "all" | "today" | "week" | "month" | "3months" | "6months" | "year";
type DensityMode = "comfortable" | "compact";

/* ---- 标签系统类型 ---- */
interface TagDef {
    id: string;
    name: string;
    color: string; // tailwind color class for bg
    textColor: string;
    borderColor: string;
}
type ResumeTagMap = Record<string, string[]>; // resumeId -> tagIds

const PRESET_TAG_COLORS: { color: string; textColor: string; borderColor: string }[] = [
    { color: "bg-violet-100 dark:bg-violet-900/30", textColor: "text-violet-700 dark:text-violet-300", borderColor: "border-violet-200 dark:border-violet-800/40" },
    { color: "bg-emerald-100 dark:bg-emerald-900/30", textColor: "text-emerald-700 dark:text-emerald-300", borderColor: "border-emerald-200 dark:border-emerald-800/40" },
    { color: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-700 dark:text-amber-300", borderColor: "border-amber-200 dark:border-amber-800/40" },
    { color: "bg-sky-100 dark:bg-sky-900/30", textColor: "text-sky-700 dark:text-sky-300", borderColor: "border-sky-200 dark:border-sky-800/40" },
    { color: "bg-rose-100 dark:bg-rose-900/30", textColor: "text-rose-700 dark:text-rose-300", borderColor: "border-rose-200 dark:border-rose-800/40" },
    { color: "bg-indigo-100 dark:bg-indigo-900/30", textColor: "text-indigo-700 dark:text-indigo-300", borderColor: "border-indigo-200 dark:border-indigo-800/40" },
    { color: "bg-cyan-100 dark:bg-cyan-900/30", textColor: "text-cyan-700 dark:text-cyan-300", borderColor: "border-cyan-200 dark:border-cyan-800/40" },
    { color: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-700 dark:text-orange-300", borderColor: "border-orange-200 dark:border-orange-800/40" },
];

const DEFAULT_TAGS: TagDef[] = [
    { id: "tag-urgent", name: "紧急", ...PRESET_TAG_COLORS[3] },
    { id: "tag-interview", name: "待面试", ...PRESET_TAG_COLORS[1] },
    { id: "tag-offer", name: "已发Offer", ...PRESET_TAG_COLORS[0] },
    { id: "tag-reject", name: "不合适", ...PRESET_TAG_COLORS[4] },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "最新优先" },
    { key: "oldest", label: "最早优先" },
    { key: "score-high", label: "评分最高" },
    { key: "score-low", label: "评分最低" },
    { key: "name", label: "姓名排序" },
];

const SCORE_FILTER_OPTIONS: { key: ScoreFilter; label: string; dot: string }[] = [
    { key: "all", label: "全部", dot: "bg-gray-400" },
    { key: "high", label: "优秀 (80+)", dot: "bg-emerald-500" },
    { key: "medium", label: "良好 (60-79)", dot: "bg-amber-500" },
    { key: "low", label: "待改进 (<60)", dot: "bg-red-500" },
];

const TIME_FILTER_OPTIONS: { key: TimeFilter; label: string }[] = [
    { key: "all", label: "全部时间" },
    { key: "week", label: "本周" },
    { key: "month", label: "本月" },
    { key: "3months", label: "近3月" },
];

/* ==================== 动画变体 ==================== */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.2 } },
};

/* ==================== 背景 & 粒子 ==================== */

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-blue-400/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

const ParticleField = () => {
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                duration: Math.random() * 10 + 10,
                delay: Math.random() * 5,
            })),
        []
    );
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-emerald-500/10 dark:bg-emerald-400/10"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

/* ==================== Toast 通知 ==================== */

interface ToastData {
    id: number;
    message: string;
    type: "success" | "error" | "info";
}

function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: ToastData[];
    onRemove: (id: number) => void;
}) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 80, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl border text-sm font-medium ${
                            t.type === "success"
                                ? "bg-emerald-50/95 dark:bg-emerald-900/50 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200"
                                : t.type === "error"
                                ? "bg-red-50/95 dark:bg-red-900/50 border-red-200/60 dark:border-red-800/40 text-red-800 dark:text-red-200"
                                : "bg-sky-50/95 dark:bg-sky-900/50 border-sky-200/60 dark:border-sky-800/40 text-sky-800 dark:text-sky-200"
                        }`}
                    >
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>{t.message}</span>
                        <button
                            onClick={() => onRemove(t.id)}
                            className="ml-2 p-0.5 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ==================== 统计卡片 ==================== */

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
    delay,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: "easeOut" }}
            className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/20 rounded-2xl p-4 flex items-center gap-4 overflow-hidden hover:-translate-y-0.5 transition-transform duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className={`relative w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="relative min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </motion.div>
    );
}

/* ==================== 分数分布迷你柱状图 ==================== */

function ScoreDistributionChart({
    high,
    medium,
    low,
    total,
}: {
    high: number;
    medium: number;
    low: number;
    total: number;
}) {
    if (total === 0) return null;
    const hPct = (high / total) * 100;
    const mPct = (medium / total) * 100;
    const lPct = (low / total) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/20 rounded-2xl p-4 sm:p-5 overflow-hidden col-span-2 lg:col-span-2"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">分数分布</span>
                </div>
                <div className="flex items-end gap-4 h-16">
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">{low}</span>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(lPct, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            className="w-full max-w-[48px] bg-gradient-to-t from-red-400 to-red-300 rounded-t-lg"
                        />
                        <span className="text-[10px] text-gray-400">&lt;60</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{medium}</span>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(mPct, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
                            className="w-full max-w-[48px] bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg"
                        />
                        <span className="text-[10px] text-gray-400">60-79</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{high}</span>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(hPct, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                            className="w-full max-w-[48px] bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg"
                        />
                        <span className="text-[10px] text-gray-400">80+</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ==================== 列表视图行 ==================== */

function ResumeListRow({
    resume,
    onDelete,
    selectMode = false,
    selected = false,
    onToggleSelect,
    isFavorited = false,
    onToggleFavorite,
    density = "comfortable",
}: {
    resume: ResumeData;
    onDelete: (id: string) => void;
    selectMode?: boolean;
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
    isFavorited?: boolean;
    onToggleFavorite?: (id: string) => void;
    density?: DensityMode;
}) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (score >= 60) return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
        return "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400";
    };
    const getScoreBarColor = (score: number) => {
        if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-teal-500";
        if (score >= 60) return "bg-gradient-to-r from-amber-500 to-orange-500";
        return "bg-gradient-to-r from-red-500 to-rose-500";
    };
    const getInitials = (name: string) => name.split("").slice(0, 1).join("").toUpperCase();
    const isAI = resume.aiProvider && resume.aiProvider !== "rule";
    const compact = density === "compact";

    return (
        <motion.div
            variants={itemVariants}
            layout
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
            onClick={() => {
                if (selectMode) onToggleSelect?.(resume.id);
            }}
            className={`group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border ${
                selected
                    ? "border-emerald-400 dark:border-emerald-500 shadow-lg shadow-emerald-500/10"
                    : "border-white/20 dark:border-gray-700/30"
            } shadow-md rounded-2xl ${compact ? "p-2.5 sm:p-3" : "p-3.5 sm:p-4"} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${selectMode ? "cursor-pointer" : ""}`}
        >
            <div className={`absolute top-0 left-0 right-0 ${compact ? "h-0.5" : "h-0.5"} bg-gradient-to-r ${getScoreBarColor(resume.scores.overall)} opacity-80`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className={`relative flex items-center gap-3 sm:gap-4 ${compact ? "" : ""}`}>
                {selectMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(resume.id); }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                            selected ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white" : "bg-white/95 dark:bg-gray-700/95 border border-gray-300 dark:border-gray-600"
                        }`}
                    >
                        {selected && <Check className="w-3.5 h-3.5" />}
                    </motion.div>
                )}

                <div className={`${compact ? "w-8 h-8 sm:w-9 sm:h-9 text-xs" : "w-10 h-10 sm:w-11 sm:h-11 text-sm"} bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm shadow-emerald-500/20`}>
                    {getInitials(resume.basicInfo.name)}
                </div>

                {compact ? (
                    /* 紧凑布局 */
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{resume.basicInfo.name}</p>
                            {isFavorited && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                            <span className="text-xs text-gray-400 truncate hidden sm:inline">{resume.jobInfo.position || "未知岗位"}</span>
                            <span className="text-xs text-gray-400 hidden md:inline">{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden hidden sm:block">
                                <div className={`h-full rounded-full ${getScoreBarColor(resume.scores.overall)}`} style={{ width: `${resume.scores.overall}%` }} />
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getScoreColor(resume.scores.overall)}`}>{resume.scores.overall}</span>
                            {!selectMode && (
                                <Link to={`/analyze`} state={{ resumeId: resume.id }} onClick={(e) => e.stopPropagation()} className="p-1 text-gray-300 dark:text-gray-600 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="查看详情"><Eye className="w-3.5 h-3.5" /></Link>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }} className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ) : (
                    /* 舒适布局 */
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                        <div className="sm:col-span-3 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{resume.basicInfo.name}</p>
                                {isFavorited && <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                                {isAI ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex-shrink-0">
                                        <Sparkles className="w-2.5 h-2.5" />AI
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0">规则</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resume.jobInfo.position || "未知岗位"}</p>
                        </div>
                        <div className="hidden sm:block sm:col-span-3 min-w-0">
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{resume.basicInfo.email}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{resume.basicInfo.phone}</p>
                        </div>
                        <div className="hidden sm:block sm:col-span-3 min-w-0">
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{resume.background.education}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">{resume.background.workYears}工作经验</p>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-3 sm:justify-end">
                            <div className="hidden sm:flex flex-col items-end gap-1 w-20">
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                                </div>
                                <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${getScoreBarColor(resume.scores.overall)}`} style={{ width: `${resume.scores.overall}%` }} />
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${getScoreColor(resume.scores.overall)}`}>{resume.scores.overall}</span>
                            {!selectMode && (
                                <Link to={`/analyze`} state={{ resumeId: resume.id }} onClick={(e) => e.stopPropagation()} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="查看详情"><Eye className="w-4 h-4" /></Link>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="删除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ==================== 空状态 ==================== */

function EmptyState({
    searchKeyword,
    scoreFilter,
    onClear,
}: {
    searchKeyword: string;
    scoreFilter: ScoreFilter;
    onClear: () => void;
}) {
    const hasFilter = searchKeyword || scoreFilter !== "all";
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-20 sm:py-24 relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="relative w-24 h-24 mx-auto mb-7">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-xl" />
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 rounded-3xl flex items-center justify-center shadow-inner">
                        {hasFilter ? <Search className="w-10 h-10 text-emerald-500 dark:text-emerald-400" /> : <Inbox className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />}
                    </div>
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {searchKeyword ? "未找到匹配的简历" : scoreFilter !== "all" ? "该筛选条件下暂无记录" : "暂无历史记录"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-7 max-w-md mx-auto leading-relaxed">
                    {searchKeyword ? `没有找到包含 "${searchKeyword}" 的简历，请尝试其他关键词` : scoreFilter !== "all" ? "当前分数范围内暂无记录，尝试切换其他筛选条件" : "上传并分析第一份简历后，所有记录将自动保存在这里"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {hasFilter ? (
                        <button onClick={onClear} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200">
                            <X className="w-4 h-4" />清除所有筛选
                        </button>
                    ) : (
                        <Link to="/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200">
                            <FileText className="w-4 h-4" />立即上传简历
                        </Link>
                    )}
                    {hasFilter && (
                        <Link to="/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 transition-colors">
                            <FileText className="w-4 h-4" />继续上传
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ==================== 主页面 ==================== */

/* ---- 骨架屏 ---- */
function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
    if (viewMode === "list") {
        return (
            <div className="flex flex-col gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3" />
                            </div>
                            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl p-5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 absolute top-0 left-0 right-0" />
                    <div className="space-y-4 mt-2">
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-16" />
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded" />
                            ))}
                        </div>
                        <div className="space-y-1.5">
                            {Array.from({ length: 3 }).map((_, k) => (
                                <div key={k} className="flex items-center gap-2">
                                    <div className="w-6 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full" />
                                    <div className="w-6 h-3 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ---- 标签管理器弹窗 ---- */
function TagManagerModal({
    tags,
    onAddTag,
    onDeleteTag,
    onClose,
}: {
    tags: TagDef[];
    onAddTag: (name: string, colorIdx: number) => void;
    onDeleteTag: (id: string) => void;
    onClose: () => void;
}) {
    const [newName, setNewName] = useState("");
    const [selectedColor, setSelectedColor] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = () => {
        if (!newName.trim()) return;
        onAddTag(newName.trim(), selectedColor);
        setNewName("");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
            >
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500" />管理标签
                    </h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
                    {/* 现有标签 */}
                    {tags.length > 0 && (
                        <div className="space-y-2">
                            {tags.map((tag) => (
                                <div key={tag.id} className="flex items-center gap-2">
                                    {editingId === tag.id ? (
                                        <>
                                            <input
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") { onDeleteTag(tag.id); if (editName.trim()) onAddTag(editName.trim(), PRESET_TAG_COLORS.findIndex(c => c.color === tag.color)); setEditingId(null); }
                                                    if (e.key === "Escape") setEditingId(null);
                                                }}
                                                className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40 outline-none"
                                            />
                                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border ${tag.color} ${tag.textColor} ${tag.borderColor}`}>
                                                {tag.name}
                                            </span>
                                            <button
                                                onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                                                className="p-1 text-gray-400 hover:text-emerald-500 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                title="编辑"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteTag(tag.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="删除"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 新增 */}
                    <div className="space-y-2.5">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">新建标签</p>
                        <div className="flex gap-2">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                                placeholder="标签名称"
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 outline-none"
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newName.trim()}
                                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {/* 颜色选择 */}
                        <div className="flex flex-wrap gap-1.5">
                            {PRESET_TAG_COLORS.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedColor(i)}
                                    className={`w-7 h-7 rounded-lg border-2 transition-all ${c.color} ${selectedColor === i ? "ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-gray-800 border-emerald-500 scale-110" : "border-transparent hover:scale-105"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function HistoryPage() {
    /* ---- 状态 ---- */
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>("newest");
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [densityMode, setDensityMode] = useState<DensityMode>("comfortable");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchDeleting, setBatchDeleting] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const toastCounter = useRef(0);
    const { resumes, setResumes, removeResume, removeResumes } = useResumeStore();
    const sortRef = useRef<HTMLDivElement>(null);

    /* ---- 预览面板 ---- */
    const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const previewResume = useMemo(() => resumes.find((r) => r.id === previewResumeId) || null, [resumes, previewResumeId]);

    /* ---- 标签系统 ---- */
    const [tags, setTags] = useState<TagDef[]>(() => {
        try {
            const saved = localStorage.getItem("resume-tags");
            return saved ? JSON.parse(saved) : DEFAULT_TAGS;
        } catch { return DEFAULT_TAGS; }
    });

    /* ---- 保存的筛选预设 ---- */
    interface FilterPreset { id: string; name: string; scoreFilter: ScoreFilter; timeFilter: TimeFilter; tagFilter: string | null; showFavoritesOnly: boolean; searchKeyword: string; }
    const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
        try {
            const saved = localStorage.getItem("resume-filter-presets");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [showPresetModal, setShowPresetModal] = useState(false);
    const [presetName, setPresetName] = useState("");

    /* ---- 多格式导出弹窗 ---- */
    const [showExportModal, setShowExportModal] = useState(false);
    type ExportFormat = "csv" | "json" | "excel";
    const handleExport = (format: ExportFormat) => {
        if (format === "csv") { handleExportCSV(); setShowExportModal(false); return; }
        if (processedResumes.length === 0) { showToast("没有可导出的数据", "info"); return; }
        if (format === "json") {
            const data = JSON.stringify(processedResumes, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `resumes_${Date.now()}.json`;
            a.click(); URL.revokeObjectURL(url);
            showToast(`已导出 ${processedResumes.length} 条 JSON 数据`, "success");
        } else {
            // Excel/TSV 格式
            const headers = ["姓名", "岗位", "分数", "电话", "邮箱", "学历", "工作年限", "学校", "上传时间"];
            const rows = processedResumes.map((r) => [
                r.basicInfo.name, r.jobInfo.position || "", r.scores.overall, r.basicInfo.phone || "",
                r.basicInfo.email || "", r.background.education || "", r.background.workYears || "",
                r.background.university || "", new Date(r.uploadedAt).toLocaleString("zh-CN"),
            ]);
            const tsv = [headers, ...rows].map((row) => row.map((cell) => `${cell}`).join("\t")).join("\n");
            // 添加 UTF-8 BOM
            const blob = new Blob(["\ufeff" + tsv], { type: "application/vnd.ms-excel" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `resumes_${Date.now()}.xls`;
            a.click(); URL.revokeObjectURL(url);
            showToast(`已导出 ${processedResumes.length} 条 Excel 数据`, "success");
        }
        setShowExportModal(false);
    };

    const saveFilterPreset = () => {
        if (!presetName.trim()) { showToast("请输入预设名称", "info"); return; }
        const newPreset: FilterPreset = { id: Date.now().toString(), name: presetName.trim(), scoreFilter, timeFilter, tagFilter, showFavoritesOnly, searchKeyword };
        const updated = [...filterPresets, newPreset];
        setFilterPresets(updated);
        localStorage.setItem("resume-filter-presets", JSON.stringify(updated));
        setShowPresetModal(false);
        setPresetName("");
        showToast("筛选预设已保存", "success");
    };

    const applyFilterPreset = (preset: FilterPreset) => {
        setScoreFilter(preset.scoreFilter); setTimeFilter(preset.timeFilter); setTagFilter(preset.tagFilter); setShowFavoritesOnly(preset.showFavoritesOnly); setSearchKeyword(preset.searchKeyword);
        showToast(`已应用预设: ${preset.name}`, "info");
    };

    const deleteFilterPreset = (id: string) => {
        const updated = filterPresets.filter((p) => p.id !== id);
        setFilterPresets(updated);
        localStorage.setItem("resume-filter-presets", JSON.stringify(updated));
    };
    const [resumeTags, setResumeTags] = useState<ResumeTagMap>(() => {
        try {
            const saved = localStorage.getItem("resume-tag-map");
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [showTagManager, setShowTagManager] = useState(false);

    // 持久化标签
    useEffect(() => { localStorage.setItem("resume-tags", JSON.stringify(tags)); }, [tags]);
    useEffect(() => { localStorage.setItem("resume-tag-map", JSON.stringify(resumeTags)); }, [resumeTags]);

    const addTag = useCallback((name: string, colorIdx: number) => {
        const c = PRESET_TAG_COLORS[colorIdx];
        const id = `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setTags((prev) => [...prev, { id, name, ...c }]);
    }, []);
    const deleteTag = useCallback((id: string) => {
        setTags((prev) => prev.filter((t) => t.id !== id));
        setResumeTags((prev) => { const n = { ...prev }; Object.keys(n).forEach((k) => { n[k] = n[k].filter((tid) => tid !== id); if (n[k].length === 0) delete n[k]; }); return n; });
    }, []);

    const assignTag = useCallback((resumeId: string, tagId: string) => {
        setResumeTags((prev) => {
            const current = prev[resumeId] || [];
            const has = current.includes(tagId);
            return { ...prev, [resumeId]: has ? current.filter((t) => t !== tagId) : [...current, tagId] };
        });
    }, []);

    /* ---- 吸顶工具栏 ---- */
    const [isToolbarSticky, setIsToolbarSticky] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const toolbarSentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = toolbarSentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsToolbarSticky(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    /* ---- 回到顶部 ---- */
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ---- 键盘焦点 ---- */
    const [focusedIndex, setFocusedIndex] = useState(-1);

    /* ---- Toast 辅助 ---- */
    const showToast = useCallback((message: string, type: ToastData["type"] = "success") => {
        const id = ++toastCounter.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }, []);
    const removeToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

    /* ---- 搜索去抖 ---- */
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKeyword(searchKeyword), 300);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    /* ---- 加载数据 ---- */
    const loadHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            await ensureProfileRegistered();
            const history = await api.getHistory(debouncedKeyword || undefined);
            setResumes(history);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, setResumes]);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    /* ---- 点击外部关闭下拉 ---- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ---- 键盘快捷键 ---- */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 如果焦点在输入框内，不处理
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            if (e.key === "Escape") {
                if (showExportModal) { setShowExportModal(false); return; }
                if (showPresetModal) { setShowPresetModal(false); return; }
                if (showPreview) { setShowPreview(false); return; }
                if (showTagManager) { setShowTagManager(false); return; }
                if (selectMode) { setSelectMode(false); setSelectedIds(new Set()); return; }
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "a" && selectMode) {
                e.preventDefault();
                setSelectedIds(new Set(processedResumes.map((r) => r.id)));
                return;
            }

            // 方向键导航（非编辑模式下）
            if (processedResumes.length > 0 && !showPreview && !showTagManager) {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev + 1) % processedResumes.length);
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev - 1 + processedResumes.length) % processedResumes.length);
                } else if (e.key === "Enter" && focusedIndex >= 0) {
                    e.preventDefault();
                    const resume = processedResumes[focusedIndex];
                    if (resume) {
                        if (selectMode) {
                            toggleSelect(resume.id);
                        } else {
                            setPreviewResumeId(resume.id);
                            setShowPreview(true);
                        }
                    }
                } else if (e.key === " " && focusedIndex >= 0 && selectMode) {
                    e.preventDefault();
                    const resume = processedResumes[focusedIndex];
                    if (resume) toggleSelect(resume.id);
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    /* ---- 单条删除 ---- */
    const handleDelete = useCallback(async (id: string) => {
        try {
            await api.deleteHistory(id);
            removeResume(id);
            setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
            setFavoriteIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
            setResumeTags((prev) => { const n = { ...prev }; delete n[id]; return n; });
            if (previewResumeId === id) { setShowPreview(false); setPreviewResumeId(null); }
            showToast("已删除", "success");
        } catch (err) {
            console.error("Failed to delete:", err);
            showToast("删除失败", "error");
        }
    }, [removeResume, showToast, previewResumeId]);

    /* ---- 批量删除 ---- */
    const handleBatchDelete = useCallback(async () => {
        if (selectedIds.size === 0) return;
        setBatchDeleting(true);
        const idsArray = Array.from(selectedIds);
        try {
            await Promise.all(idsArray.map((id) => api.deleteHistory(id).catch(() => null)));
            removeResumes(idsArray);
            const count = idsArray.length;
            setSelectedIds(new Set());
            setSelectMode(false);
            setFavoriteIds((prev) => { const n = new Set(prev); idsArray.forEach((id) => n.delete(id)); return n; });
            setResumeTags((prev) => { const n = { ...prev }; idsArray.forEach((id) => delete n[id]); return n; });
            showToast(`已删除 ${count} 条记录`, "success");
        } catch (err) {
            showToast("批量删除失败", "error");
        } finally {
            setBatchDeleting(false);
        }
    }, [selectedIds, removeResumes, showToast]);

    /* ---- 收藏切换 ---- */
    const toggleFavorite = useCallback((id: string) => {
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    /* ---- 排序 + 筛选 + 收藏 + 时间 ---- */
    const processedResumes = useMemo(() => {
        let result = [...resumes];

        // 时间段筛选
        if (timeFilter !== "all") {
            const now = new Date();
            const cutoff = new Date();
            if (timeFilter === "today") cutoff.setHours(0, 0, 0, 0);
            else if (timeFilter === "week") cutoff.setDate(now.getDate() - 7);
            else if (timeFilter === "month") cutoff.setMonth(now.getMonth() - 1);
            else if (timeFilter === "3months") cutoff.setMonth(now.getMonth() - 3);
            else if (timeFilter === "6months") cutoff.setMonth(now.getMonth() - 6);
            else if (timeFilter === "year") cutoff.setFullYear(now.getFullYear() - 1);
            result = result.filter((r) => new Date(r.uploadedAt) >= cutoff);
        }

        // 分数筛选
        if (scoreFilter === "high") result = result.filter((r) => r.scores.overall >= 80);
        else if (scoreFilter === "medium") result = result.filter((r) => r.scores.overall >= 60 && r.scores.overall < 80);
        else if (scoreFilter === "low") result = result.filter((r) => r.scores.overall < 60);
        else if (scoreFilter === "90+") result = result.filter((r) => r.scores.overall >= 90);
        else if (scoreFilter === "80+") result = result.filter((r) => r.scores.overall >= 80);
        else if (scoreFilter === "70+") result = result.filter((r) => r.scores.overall >= 70);
        else if (scoreFilter === "60+") result = result.filter((r) => r.scores.overall >= 60);

        // 收藏筛选
        if (showFavoritesOnly) result = result.filter((r) => favoriteIds.has(r.id));

        // 标签筛选
        if (tagFilter) result = result.filter((r) => (resumeTags[r.id] || []).includes(tagFilter));

        // 排序
        switch (sortBy) {
            case "newest": result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()); break;
            case "oldest": result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()); break;
            case "score-high": result.sort((a, b) => b.scores.overall - a.scores.overall); break;
            case "score-low": result.sort((a, b) => a.scores.overall - b.scores.overall); break;
            case "name": result.sort((a, b) => a.basicInfo.name.localeCompare(b.basicInfo.name, "zh-CN")); break;
        }
        return result;
    }, [resumes, sortBy, scoreFilter, timeFilter, showFavoritesOnly, favoriteIds, tagFilter, resumeTags]);

    const previewIndex = useMemo(() => previewResumeId ? processedResumes.findIndex((r) => r.id === previewResumeId) : -1, [processedResumes, previewResumeId]);

    /* ---- 导出 CSV ---- */
    const handleExportCSV = useCallback(() => {
        const idsToExport = selectMode ? Array.from(selectedIds) : processedResumes.map((r) => r.id);
        if (idsToExport.length === 0) { showToast("无数据可导出", "info"); return; }
        const data = processedResumes.filter((r) => idsToExport.includes(r.id));
        const header = "姓名,邮箱,电话,岗位,学历,工作经验,综合评分,上传日期\n";
        const rows = data.map((r) =>
            `"${r.basicInfo.name}","${r.basicInfo.email}","${r.basicInfo.phone}","${r.jobInfo.position || ""}","${r.background.education}","${r.background.workYears}",${r.scores.overall},"${new Date(r.uploadedAt).toLocaleDateString("zh-CN")}"`
        ).join("\n");
        const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `简历导出_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`已导出 ${data.length} 条记录`, "success");
    }, [selectMode, selectedIds, processedResumes, showToast]);

    /* ---- 多选 ---- */
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    }, []);
    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === processedResumes.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(processedResumes.map((r) => r.id)));
    }, [processedResumes, selectedIds]);

    /* ---- 统计 ---- */
    const stats = useMemo(() => {
        if (resumes.length === 0) return null;
        const scores = resumes.map((r) => r.scores.overall);
        const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
        const highCount = scores.filter((s) => s >= 80).length;
        const mediumCount = scores.filter((s) => s >= 60 && s < 80).length;
        const lowCount = scores.filter((s) => s < 60).length;
        const positions = new Set(resumes.map((r) => r.jobInfo.position).filter(Boolean));
        return { total: resumes.length, avg, max: Math.max(...scores), highCount, mediumCount, lowCount, positionCount: positions.size };
    }, [resumes]);

    const hasAnyFilter = searchKeyword || scoreFilter !== "all" || timeFilter !== "all" || showFavoritesOnly || tagFilter !== null;

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                    {/* ======== Hero 头部 ======== */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <HistoryIcon className="w-10 h-10 text-white relative z-10" />
                            <motion.div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">历史记录</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            统一管理所有分析过的简历记录，支持搜索、筛选与排序
                            <br className="hidden sm:block" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">高效检索候选人信息</span>
                        </motion.p>
                    </div>

                    {/* ======== 统计概览 + 分布图 ======== */}
                    {stats && !isLoading && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
                            <StatCard icon={Users} label="总记录数" value={stats.total} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-900/30" delay={0} />
                            <StatCard icon={BarChart3} label="平均分" value={stats.avg} color="text-teal-600 dark:text-teal-400" bgColor="bg-teal-50 dark:bg-teal-900/30" delay={0.05} />
                            <StatCard icon={Award} label="优秀简历" value={stats.highCount} color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-900/30" delay={0.1} />
                            <StatCard icon={Briefcase} label="覆盖岗位" value={stats.positionCount} color="text-sky-600 dark:text-sky-400" bgColor="bg-sky-50 dark:bg-sky-900/30" delay={0.15} />
                            <StatCard icon={TrendingUp} label="最高分" value={stats.max || 0} color="text-rose-600 dark:text-rose-400" bgColor="bg-rose-50 dark:bg-rose-900/30" delay={0.18} />
                            <div className="col-span-2 md:col-span-1">
                                <ScoreDistributionChart high={stats.highCount} medium={stats.mediumCount} low={stats.lowCount} total={stats.total} />
                            </div>
                        </div>
                    )}

                    {/* ======== 功能模块区域 ======== */}
                    {!isLoading && resumes.length > 0 && (
                        <>
                            {/* ======== 第一行：数据可视化仪表盘 + 快速操作 ======== */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                {/* 综合分析仪表盘 */}
                                {(() => {
                                    const scores = resumes.map((r) => r.scores.overall);
                                    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                                    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
                                    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
                                    const medianScore = scores.length > 0 ? (scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]) : 0;
                                    const stdDev = scores.length > 0 ? Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - avgScore, 2), 0) / scores.length) : 0;

                                    // 分数段分布
                                    const scoreRanges = [
                                        { label: "90-100", count: resumes.filter((r) => r.scores.overall >= 90).length, color: "from-emerald-400 to-emerald-600", glow: "rgba(16,185,129,0.3)" },
                                        { label: "80-89", count: resumes.filter((r) => r.scores.overall >= 80 && r.scores.overall < 90).length, color: "from-teal-400 to-teal-600", glow: "rgba(20,184,166,0.3)" },
                                        { label: "70-79", count: resumes.filter((r) => r.scores.overall >= 70 && r.scores.overall < 80).length, color: "from-sky-400 to-sky-600", glow: "rgba(56,189,248,0.3)" },
                                        { label: "60-69", count: resumes.filter((r) => r.scores.overall >= 60 && r.scores.overall < 70).length, color: "from-amber-400 to-amber-600", glow: "rgba(251,191,36,0.3)" },
                                        { label: "<60", count: resumes.filter((r) => r.scores.overall < 60).length, color: "from-red-400 to-red-600", glow: "rgba(239,68,68,0.3)" },
                                    ];
                                    const maxRange = Math.max(...scoreRanges.map((r) => r.count)) || 1;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                                        >
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                                        <TrendingUp className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">综合分析仪表盘</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">多维度数据洞察</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-2 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg font-medium">{resumes.length} 份简历</span>
                                                </div>
                                            </div>

                                            {/* 核心指标 */}
                                            <div className="grid grid-cols-4 gap-3 mb-5">
                                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 text-center">
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">平均分</p>
                                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{avgScore}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-3 text-center">
                                                    <p className="text-[10px] text-violet-600 dark:text-violet-400 mb-1">最高分</p>
                                                    <p className="text-xl font-bold text-violet-700 dark:text-violet-300">{maxScore}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 text-center">
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-1">中位数</p>
                                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{medianScore}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-3 text-center">
                                                    <p className="text-[10px] text-sky-600 dark:text-sky-400 mb-1">标准差</p>
                                                    <p className="text-xl font-bold text-sky-700 dark:text-sky-300">{stdDev.toFixed(1)}</p>
                                                </div>
                                            </div>

                                            {/* 分数段分布 */}
                                            <div className="mb-2">
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">分数段分布</p>
                                                <div className="flex items-end gap-2 h-20">
                                                    {scoreRanges.map((range) => (
                                                        <div key={range.label} className="flex-1 flex flex-col items-center gap-1.5">
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${Math.max((range.count / maxRange) * 100, range.count > 0 ? 20 : 0)}%` }}
                                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                                className="w-full bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500 rounded-t-md relative group cursor-pointer"
                                                                style={{ background: `linear-gradient(to top, ${range.glow}, ${range.glow.replace("0.3", "0.1")})` }}
                                                            >
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                    {range.count} 人
                                                                </div>
                                                            </motion.div>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{range.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 底部统计条 */}
                                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100/60 dark:border-gray-700/40">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">优秀</span>
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stats?.highCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">良好</span>
                                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{stats?.mediumCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">待提升</span>
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">{stats?.lowCount || 0}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* 快速操作 + 高级统计 */}
                                <div className="flex flex-col gap-4">
                                    {/* 快速操作面板 */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                                    >
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                                <Zap className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">快捷操作</h3>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">常用功能入口</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => document.getElementById("import-area")?.click()}
                                                className="flex items-center gap-2 px-3 py-2.5 bg-blue-50/70 dark:bg-blue-900/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 rounded-xl transition-colors group"
                                            >
                                                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">批量导入</span>
                                            </button>
                                            <button
                                                onClick={() => setShowExportModal(true)}
                                                className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50/70 dark:bg-emerald-900/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 rounded-xl transition-colors group"
                                            >
                                                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">导出数据</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectMode(true)}
                                                className="flex items-center gap-2 px-3 py-2.5 bg-violet-50/70 dark:bg-violet-900/20 hover:bg-violet-100/70 dark:hover:bg-violet-900/30 rounded-xl transition-colors group"
                                            >
                                                <CheckSquare className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">批量选择</span>
                                            </button>
                                            <button
                                                onClick={() => { setShowTagManager(true); }}
                                                className="flex items-center gap-2 px-3 py-2.5 bg-amber-50/70 dark:bg-amber-900/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 rounded-xl transition-colors group"
                                            >
                                                <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">标签管理</span>
                                            </button>
                                        </div>
                                        {/* 隐藏的文件导入 input */}
                                        <input
                                            id="import-area"
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length === 0) return;
                                                showToast(`已选择 ${files.length} 个文件`, "info");
                                            }}
                                        />
                                    </motion.div>

                                    {/* 收藏概览 */}
                                    {(() => {
                                        const favCount = favoriteIds.size;
                                        const recentFavs = resumes.filter((r) => favoriteIds.has(r.id)).slice(0, 3);
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5 flex-1"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                                            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">我的收藏</h3>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{favCount} 条收藏</p>
                                                        </div>
                                                    </div>
                                                    {favCount > 0 && (
                                                        <button onClick={() => { setShowFavoritesOnly(true); setTagFilter(null); setScoreFilter("all"); setTimeFilter("all"); }} className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">
                                                            查看全部
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    {recentFavs.length > 0 ? recentFavs.map((r) => (
                                                        <div key={r.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/70 dark:bg-gray-700/30 hover:bg-gray-100/70 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => { setPreviewResumeId(r.id); setShowPreview(true); }}>
                                                            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                                                                {r.basicInfo.name.slice(0, 1)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.basicInfo.name}</p>
                                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{r.jobInfo.position || "未填写"}</p>
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${r.scores.overall >= 80 ? "text-emerald-600 dark:text-emerald-400" : r.scores.overall >= 60 ? "text-amber-600 dark:text-amber-400" : "text-gray-500"}`}>{r.scores.overall}分</span>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-4 text-[11px] text-gray-400 dark:text-gray-500">
                                                            <Star className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                                                            <p>暂无收藏</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* ======== 第二行：四项统计模块 ======== */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* 岗位分布 */}
                                {(() => {
                                    const positionCount: Record<string, number> = {};
                                    resumes.forEach((r) => { const pos = r.jobInfo.position || "未填写"; positionCount[pos] = (positionCount[pos] || 0) + 1; });
                                    const topPositions = Object.entries(positionCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
                                    const maxCount = topPositions.length > 0 ? topPositions[0][1] : 1;
                                    return topPositions.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                                                <div><h4 className="text-xs font-semibold text-gray-900 dark:text-white">岗位分布</h4><p className="text-[10px] text-gray-500 dark:text-gray-400">Top {topPositions.length}</p></div>
                                            </div>
                                            <div className="space-y-2">
                                                {topPositions.map(([pos, count]) => (
                                                    <div key={pos} className="flex items-center gap-2">
                                                        <span className="text-[11px] text-gray-600 dark:text-gray-300 w-16 truncate">{pos}</span>
                                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full" />
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 w-4 text-right">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* 学历分布 */}
                                {(() => {
                                    const eduCount: Record<string, number> = {};
                                    resumes.forEach((r) => { const edu = r.background.education || "未知"; eduCount[edu] = (eduCount[edu] || 0) + 1; });
                                    const sortedEdu = Object.entries(eduCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
                                    const total = resumes.length || 1;
                                    return sortedEdu.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                                                <div><h4 className="text-xs font-semibold text-gray-900 dark:text-white">学历分布</h4><p className="text-[10px] text-gray-500 dark:text-gray-400">候选人学历</p></div>
                                            </div>
                                            <div className="space-y-2">
                                                {sortedEdu.map(([edu, count]) => {
                                                    const pct = Math.round((count / total) * 100);
                                                    return (
                                                        <div key={edu} className="flex items-center gap-2">
                                                            <span className="text-[11px] text-gray-600 dark:text-gray-300 w-12 truncate">{edu}</span>
                                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className={`h-full rounded-full ${pct >= 40 ? "bg-indigo-500" : pct >= 20 ? "bg-indigo-400" : "bg-indigo-300 dark:bg-indigo-600"}`} />
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 w-6 text-right">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* 时间趋势 */}
                                {(() => {
                                    const now = new Date();
                                    const counts: Record<string, number> = { "7天内": 0, "8-14天": 0, "15-30天": 0, "30天前": 0 };
                                    resumes.forEach((r) => { const d = new Date(r.uploadedAt); const diff = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)); if (diff <= 7) counts["7天内"]++; else if (diff <= 14) counts["8-14天"]++; else if (diff <= 30) counts["15-30天"]++; else counts["30天前"]++; });
                                    const maxCount = Math.max(...Object.values(counts)) || 1;
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" /></div>
                                                <div><h4 className="text-xs font-semibold text-gray-900 dark:text-white">上传趋势</h4><p className="text-[10px] text-gray-500 dark:text-gray-400">近30天分布</p></div>
                                            </div>
                                            <div className="flex items-end justify-between gap-1.5 h-16">
                                                {Object.entries(counts).map(([label, count]) => (
                                                    <div key={label} className="flex-1 flex flex-col items-center gap-1">
                                                        <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((count / maxCount) * 100, count > 0 ? 30 : 0)}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full bg-gradient-to-t from-sky-400 to-sky-300 dark:from-sky-600 dark:to-sky-500 rounded-t-md min-h-[4px]" />
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500">{label.split("-")[0]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* 工作经验分布 */}
                                {(() => {
                                    const expCount: Record<string, number> = {};
                                    resumes.forEach((r) => { const exp = r.background.workYears || "未知"; expCount[exp] = (expCount[exp] || 0) + 1; });
                                    const sortedExp = Object.entries(expCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
                                    const total = resumes.length || 1;
                                    return sortedExp.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                                                <div><h4 className="text-xs font-semibold text-gray-900 dark:text-white">经验分布</h4><p className="text-[10px] text-gray-500 dark:text-gray-400">工作年限</p></div>
                                            </div>
                                            <div className="space-y-2">
                                                {sortedExp.map(([exp, count]) => {
                                                    const pct = Math.round((count / total) * 100);
                                                    return (
                                                        <div key={exp} className="flex items-center gap-2">
                                                            <span className="text-[11px] text-gray-600 dark:text-gray-300 w-10 truncate">{exp}年</span>
                                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className={`h-full rounded-full ${pct >= 40 ? "bg-teal-500" : pct >= 20 ? "bg-teal-400" : "bg-teal-300 dark:bg-teal-600"}`} />
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 w-6 text-right">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </div>
                        </>
                    )}

                    {/* ======== 高级搜索筛选面板 ======== */}
                    {!isLoading && resumes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                        <Filter className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">高级筛选</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">多维度精准筛选</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowPresetModal(true)}
                                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium flex items-center gap-1"
                                    >
                                        <Bookmark className="w-3 h-3" />
                                        保存当前筛选
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <button
                                        onClick={() => { setScoreFilter("all"); setTimeFilter("all"); setShowFavoritesOnly(false); setTagFilter(null); setSearchKeyword(""); }}
                                        className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium flex items-center gap-1"
                                    >
                                        <RefreshCcw className="w-3 h-3" />
                                        重置
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* 分数筛选 */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Award className="w-3 h-3" />
                                        分数筛选
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={scoreFilter}
                                            onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
                                            className="w-full px-3 py-2.5 text-xs bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 dark:focus:border-rose-500 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            <option value="all">全部分数</option>
                                            <option value="high">优秀 (≥80分)</option>
                                            <option value="medium">良好 (60-79分)</option>
                                            <option value="low">待提升 (&lt;60分)</option>
                                            <option value="90+">90分以上</option>
                                            <option value="80+">80分以上</option>
                                            <option value="70+">70分以上</option>
                                            <option value="60+">60分以上</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* 时间筛选 */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        时间范围
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={timeFilter}
                                            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                                            className="w-full px-3 py-2.5 text-xs bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 dark:focus:border-rose-500 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            <option value="all">全部时间</option>
                                            <option value="today">今天</option>
                                            <option value="week">近7天</option>
                                            <option value="month">近30天</option>
                                            <option value="3months">近3个月</option>
                                            <option value="6months">近6个月</option>
                                            <option value="year">近1年</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* 标签筛选 */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" />
                                        标签筛选
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={tagFilter || ""}
                                            onChange={(e) => setTagFilter(e.target.value || null)}
                                            className="w-full px-3 py-2.5 text-xs bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 dark:focus:border-rose-500 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200"
                                        >
                                            <option value="">全部标签</option>
                                            {tags.map((tag) => (
                                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* 收藏筛选 */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Star className="w-3 h-3" />
                                        收藏状态
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                                                showFavoritesOnly
                                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-500/20"
                                                    : "text-gray-600 dark:text-gray-300 border-gray-200/60 dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-current" : ""}`} />
                                            {showFavoritesOnly ? "已收藏" : "仅收藏"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 活跃筛选指示器 */}
                            {(scoreFilter !== "all" || timeFilter !== "all" || tagFilter !== null || showFavoritesOnly || searchKeyword) && (
                                <div className="mt-3 pt-3 border-t border-gray-100/60 dark:border-gray-700/40">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">活跃条件：</span>
                                        {scoreFilter !== "all" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-md">
                                                分数: {scoreFilter}
                                                <button onClick={() => setScoreFilter("all")} className="ml-1 hover:text-emerald-700"><X className="w-2.5 h-2.5" /></button>
                                            </span>
                                        )}
                                        {timeFilter !== "all" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] rounded-md">
                                                时间: {timeFilter}
                                                <button onClick={() => setTimeFilter("all")} className="ml-1 hover:text-sky-700"><X className="w-2.5 h-2.5" /></button>
                                            </span>
                                        )}
                                        {tagFilter && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] rounded-md">
                                                标签: {tags.find((t) => t.id === tagFilter)?.name || tagFilter}
                                                <button onClick={() => setTagFilter(null)} className="ml-1 hover:text-violet-700"><X className="w-2.5 h-2.5" /></button>
                                            </span>
                                        )}
                                        {showFavoritesOnly && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] rounded-md">
                                                仅收藏
                                                <button onClick={() => setShowFavoritesOnly(false)} className="ml-1 hover:text-amber-700"><X className="w-2.5 h-2.5" /></button>
                                            </span>
                                        )}
                                        {searchKeyword && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-md">
                                                搜索: {searchKeyword}
                                                <button onClick={() => setSearchKeyword("")} className="ml-1 hover:text-gray-800"><X className="w-2.5 h-2.5" /></button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* 已保存的预设 */}
                            {filterPresets.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100/60 dark:border-gray-700/40">
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">已保存的预设：</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {filterPresets.map((preset) => (
                                            <span key={preset.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 text-rose-600 dark:text-rose-400 text-[11px] rounded-lg border border-rose-200/50 dark:border-rose-700/30 hover:shadow-sm transition-all">
                                                <button onClick={() => applyFilterPreset(preset)} className="flex items-center gap-1 font-medium">
                                                    <Target className="w-3 h-3" />
                                                    {preset.name}
                                                </button>
                                                <button onClick={() => deleteFilterPreset(preset.id)} className="ml-1 opacity-60 hover:opacity-100 hover:text-red-500">
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ======== 智能洞察 + 技能词云 + 活动时间线 ======== */}
                    {!isLoading && resumes.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            {/* 智能 AI 洞察模块 */}
                            {(() => {
                                const total = resumes.length;
                                const scores = resumes.map((r) => r.scores.overall);
                                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);
                                const high = scores.filter((s) => s >= 80).length;
                                const insights: { type: "success" | "warning" | "info"; text: string }[] = [];

                                if (high / total >= 0.5) insights.push({ type: "success", text: `优秀简历占比 ${Math.round((high / total) * 100)}%，候选人整体质量优秀` });
                                else if (high / total >= 0.3) insights.push({ type: "info", text: `优秀简历占比 ${Math.round((high / total) * 100)}%，候选人质量良好` });
                                else insights.push({ type: "warning", text: `优秀简历占比仅 ${Math.round((high / total) * 100)}%，建议扩大筛选范围` });

                                if (avg >= 75) insights.push({ type: "success", text: `平均分达 ${avg} 分，候选人综合能力突出` });
                                else if (avg >= 60) insights.push({ type: "info", text: `平均分为 ${avg} 分，整体处于中等水平` });
                                else insights.push({ type: "warning", text: `平均分仅 ${avg} 分，建议关注简历质量` });

                                const recentWeek = resumes.filter((r) => Date.now() - new Date(r.uploadedAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
                                if (recentWeek > 0) insights.push({ type: "info", text: `本周新增 ${recentWeek} 份简历，${recentWeek >= 3 ? "招聘活跃度高" : "保持稳定"}` });

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                                    >
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                                                <Brain className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI 智能洞察</h3>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">基于简历数据的智能分析</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            {insights.map((ins, idx) => {
                                                const colorMap = {
                                                    success: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/30 text-emerald-700 dark:text-emerald-300",
                                                    warning: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/30 text-amber-700 dark:text-amber-300",
                                                    info: "from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200/50 dark:border-sky-700/30 text-sky-700 dark:text-sky-300",
                                                };
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.55 + idx * 0.1 }}
                                                        className={`p-2.5 rounded-xl bg-gradient-to-br border text-[11px] leading-relaxed ${colorMap[ins.type]}`}
                                                    >
                                                        <span className="font-medium">{ins.text}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })()}

                            {/* 热门技能词云 */}
                            {(() => {
                                const skillCount: Record<string, number> = {};
                                resumes.forEach((r) => {
                                    (r.skills || []).forEach((s) => {
                                        skillCount[s] = (skillCount[s] || 0) + 1;
                                    });
                                });
                                const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 12);
                                const maxSkill = topSkills.length > 0 ? topSkills[0][1] : 1;
                                const colorPalette = [
                                    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
                                    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
                                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                                    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                                    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                                    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
                                ];
                                return topSkills.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.55 }}
                                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                                    <Cloud className="w-4.5 h-4.5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">热门技能</h3>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Top {topSkills.length} 高频技能</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {topSkills.map(([skill, count], idx) => {
                                                const ratio = count / maxSkill;
                                                const sizeClass = ratio > 0.8 ? "text-sm px-3 py-1.5" : ratio > 0.5 ? "text-xs px-2.5 py-1" : "text-[11px] px-2 py-0.5";
                                                return (
                                                    <motion.span
                                                        key={skill}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.6 + idx * 0.04 }}
                                                        className={`inline-flex items-center gap-1 rounded-lg font-medium ${sizeClass} ${colorPalette[idx % colorPalette.length]}`}
                                                    >
                                                        {skill}
                                                        <span className="opacity-60 text-[10px]">{count}</span>
                                                    </motion.span>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ) : null;
                            })()}

                            {/* 最近活动时间线 */}
                            {(() => {
                                const recentItems = [...resumes]
                                    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                                    .slice(0, 5);
                                const typeColor: Record<string, string> = {
                                    "high": "bg-emerald-500",
                                    "medium": "bg-amber-500",
                                    "low": "bg-red-500",
                                };
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 shadow-lg shadow-gray-900/5"
                                    >
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <Activity className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">最近活动</h3>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">最新上传动态</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-700" />
                                            <div className="space-y-2.5">
                                                {recentItems.map((r, idx) => {
                                                    const level = r.scores.overall >= 80 ? "high" : r.scores.overall >= 60 ? "medium" : "low";
                                                    const timeAgo = (() => {
                                                        const diff = Date.now() - new Date(r.uploadedAt).getTime();
                                                        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                                                        if (days === 0) return "今天";
                                                        if (days === 1) return "昨天";
                                                        if (days < 7) return `${days}天前`;
                                                        if (days < 30) return `${Math.floor(days / 7)}周前`;
                                                        return `${Math.floor(days / 30)}月前`;
                                                    })();
                                                    return (
                                                        <motion.div
                                                            key={r.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.65 + idx * 0.08 }}
                                                            className="flex items-start gap-3 relative cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
                                                            onClick={() => { setPreviewResumeId(r.id); setShowPreview(true); }}
                                                        >
                                                            <div className={`w-3.5 h-3.5 rounded-full ${typeColor[level]} ring-4 ring-white dark:ring-gray-800 mt-0.5 flex-shrink-0 relative z-10`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.basicInfo.name} · {r.jobInfo.position || "未填写"}</p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{timeAgo} · {r.scores.overall} 分</p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>
                    )}

                    {/* ======== 工具栏（吸顶） ======== */}
                    {/* 哨兵元素：用于检测滚动位置 */}
                    <div ref={toolbarSentinelRef} className="h-0" />

                    <div
                        ref={toolbarRef}
                        className={`relative transition-all duration-300 ${
                            isToolbarSticky
                                ? "sticky top-4 z-40 backdrop-blur-xl bg-white/85 dark:bg-gray-800/85 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 rounded-3xl p-3 sm:p-4 mb-6 scale-[0.98]"
                                : "backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-4 sm:p-5 mb-6"
                        } overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                        <div className="relative">
                            {/* 搜索 + 操作按钮 */}
                            <div className={`flex items-center gap-2 ${isToolbarSticky ? "mb-0" : "mb-4"}`}>
                                {isToolbarSticky && (
                                    <div className="hidden sm:flex items-center gap-2 mr-2 flex-shrink-0">
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                            <HistoryIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {resumes.length} 条记录
                                        </span>
                                    </div>
                                )}
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="text" placeholder="搜索候选人姓名、邮箱、岗位或技能..."
                                        value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                                        className={`w-full pl-11 pr-10 ${isToolbarSticky ? "py-2.5 text-xs" : "py-3 text-sm"} bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                                    />
                                    {searchKeyword && (
                                        <button onClick={() => setSearchKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                {resumes.length > 0 && (
                                    <button
                                        onClick={() => { if (selectMode) { setSelectMode(false); setSelectedIds(new Set()); } else { setSelectMode(true); } }}
                                        className={`flex items-center gap-1.5 ${isToolbarSticky ? "px-2.5 py-2.5 text-[11px]" : "px-3 py-3 text-xs"} font-medium rounded-xl border transition-all duration-200 ${
                                            selectMode ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/20" : "text-gray-600 dark:text-gray-300 border-gray-200/60 dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{selectMode ? "退出" : "多选"}</span>
                                    </button>
                                )}
                            </div>

                            {/* 筛选行 */}
                            {!isToolbarSticky && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {/* 分数筛选 */}
                                <div className="flex items-center gap-1.5 mr-1">
                                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">分数：</span>
                                </div>
                                {SCORE_FILTER_OPTIONS.map((opt) => (
                                    <button key={opt.key} onClick={() => setScoreFilter(opt.key)}
                                        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            scoreFilter === opt.key ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20" : "text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-600/50"
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} ${scoreFilter === opt.key ? "bg-white/80" : ""}`} />
                                        {opt.label}
                                    </button>
                                ))}

                                <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1 hidden sm:block" />

                                {/* 时间段快捷筛选 */}
                                {TIME_FILTER_OPTIONS.map((opt) => (
                                    <button key={opt.key} onClick={() => setTimeFilter(opt.key)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            timeFilter === opt.key ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/20" : "text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-600/50"
                                        }`}
                                    >
                                        <Clock className="w-3 h-3" />
                                        {opt.label}
                                    </button>
                                ))}

                                <div className="flex-1" />

                                {/* 收藏筛选 */}
                                <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                        showFavoritesOnly ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20" : "text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-600/50"
                                    }`}
                                    title="只看收藏"
                                >
                                    <Star className={`w-3 h-3 ${showFavoritesOnly ? "fill-white" : ""}`} />
                                    <span className="hidden sm:inline">收藏</span>
                                </button>

                                {/* 标签筛选 */}
                                {tags.length > 0 && (
                                    <>
                                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 hidden sm:block" />
                                        {tags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                                                    tagFilter === tag.id
                                                        ? `${tag.color} ${tag.textColor} ${tag.borderColor} shadow-sm`
                                                        : "text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80 border-gray-200/60 dark:border-gray-600/50"
                                                }`}
                                                title={`筛选标签: ${tag.name}`}
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setShowTagManager(true)}
                                            className="p-1.5 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-dashed border-gray-200 dark:border-gray-600 transition-colors"
                                            title="管理标签"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}

                                {/* 排序 */}
                                <div className="relative" ref={sortRef}>
                                    <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg border border-gray-200/60 dark:border-gray-600/50 transition-colors">
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sortBy)?.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showSortDropdown && (
                                            <motion.div initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-1.5 w-44 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl z-20 py-1.5 overflow-hidden">
                                                {SORT_OPTIONS.map((opt) => (
                                                    <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSortDropdown(false); }}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${sortBy === opt.key ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"}`}
                                                    >
                                                        {sortBy === opt.key ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5" />}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* 视图切换 */}
                                <div className="flex items-center bg-gray-100/80 dark:bg-gray-700/50 rounded-lg p-0.5">
                                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`} title="网格视图"><LayoutGrid className="w-4 h-4" /></button>
                                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === "list" ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`} title="列表视图"><List className="w-4 h-4" /></button>
                                </div>

                                {/* 列表密度 (仅列表模式) */}
                                {viewMode === "list" && (
                                    <button onClick={() => setDensityMode(densityMode === "comfortable" ? "compact" : "comfortable")} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg border border-gray-200/60 dark:border-gray-600/50 transition-colors" title={densityMode === "comfortable" ? "紧凑模式" : "舒适模式"}>
                                        <LayoutList className="w-4 h-4" />
                                    </button>
                                )}

                                {/* 导出 */}
                                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg border border-gray-200/60 dark:border-gray-600/50 transition-colors" title={selectMode ? "导出所选" : "导出全部"}>
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{selectMode && selectedIds.size > 0 ? `导出(${selectedIds.size})` : "导出"}</span>
                                </button>

                                {/* 刷新 */}
                                <button onClick={loadHistory} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg border border-gray-200/60 dark:border-gray-600/50 transition-colors disabled:opacity-50">
                                    <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                                    <span className="hidden sm:inline">刷新</span>
                                </button>
                            </div>
                            )}
                        </div>
                    </div>

                    {/* ======== 活跃条件条 ======== */}
                    <AnimatePresence>
                        {(selectMode || hasAnyFilter) && (
                            <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.25 }} className="mb-5 overflow-hidden">
                                <div className="flex flex-wrap items-center gap-2 px-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">活跃条件：</span>
                                    {searchKeyword && (
                                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                            关键词：{searchKeyword}
                                            <button onClick={() => setSearchKeyword("")} className="hover:text-emerald-900 dark:hover:text-emerald-100"><X className="w-3 h-3" /></button>
                                        </motion.span>
                                    )}
                                    {scoreFilter !== "all" && (
                                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                            分数：{SCORE_FILTER_OPTIONS.find((o) => o.key === scoreFilter)?.label}
                                            <button onClick={() => setScoreFilter("all")} className="hover:text-emerald-900 dark:hover:text-emerald-100"><X className="w-3 h-3" /></button>
                                        </motion.span>
                                    )}
                                    {timeFilter !== "all" && (
                                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-sky-50/80 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">
                                            {TIME_FILTER_OPTIONS.find((o) => o.key === timeFilter)?.label}
                                            <button onClick={() => setTimeFilter("all")} className="hover:text-sky-900 dark:hover:text-sky-100"><X className="w-3 h-3" /></button>
                                        </motion.span>
                                    )}
                                    {showFavoritesOnly && (
                                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                            <Star className="w-3 h-3 fill-current" />仅收藏
                                            <button onClick={() => setShowFavoritesOnly(false)} className="hover:text-amber-900 dark:hover:text-amber-100"><X className="w-3 h-3" /></button>
                                        </motion.span>
                                    )}
                                    {tagFilter && (() => {
                                        const tag = tags.find((t) => t.id === tagFilter);
                                        return tag ? (
                                            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${tag.color} ${tag.textColor} ${tag.borderColor}`}>
                                                <Tag className="w-3 h-3" />{tag.name}
                                                <button onClick={() => setTagFilter(null)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                                            </motion.span>
                                        ) : null;
                                    })()}
                                    {selectMode && selectedIds.size > 0 && (
                                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-teal-50/80 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                                            <CheckSquare className="w-3 h-3" />已选 {selectedIds.size} 项
                                        </motion.span>
                                    )}

                                    <div className="flex-1" />

                                    {selectMode && selectedIds.size > 0 && (
                                        <div className="flex items-center gap-2">
                                            {selectedIds.size === 2 && (
                                                <Link to="/compare" state={{ resumeIds: Array.from(selectedIds) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg shadow-md shadow-emerald-500/20 transition-all">
                                                    <GitCompare className="w-3.5 h-3.5" />对比所选
                                                </Link>
                                            )}
                                            <button onClick={handleBatchDelete} disabled={batchDeleting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg shadow-md shadow-red-500/20 transition-all disabled:opacity-50">
                                                {batchDeleting ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}批量删除
                                            </button>
                                            <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200/60 dark:border-gray-600/50 shadow-sm transition-colors">
                                                <Download className="w-3.5 h-3.5" />导出所选
                                            </button>
                                        </div>
                                    )}

                                    {hasAnyFilter && (
                                        <button onClick={() => { setSearchKeyword(""); setScoreFilter("all"); setTimeFilter("all"); setShowFavoritesOnly(false); setTagFilter(null); }} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <X className="w-3 h-3" />全部清除
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ======== 结果行 ======== */}
                    {!isLoading && processedResumes.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-4 px-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                共 <span className="font-semibold text-gray-700 dark:text-gray-200">{resumes.length}</span> 条
                                {processedResumes.length !== resumes.length && (
                                    <span>，筛选 <span className="font-semibold text-gray-700 dark:text-gray-200">{processedResumes.length}</span> 条</span>
                                )}
                                {selectMode && <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500">(Space 选中 · Ctrl+A 全选 · Esc 退出)</span>}
                            </p>
                            <div className="flex items-center gap-2">
                                {!selectMode && processedResumes.length > 0 && (
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:inline">方向键导航 · Enter 预览</span>
                                )}
                                {selectMode && (
                                    <button onClick={toggleSelectAll} className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2.5 py-1 rounded-lg transition-colors">
                                        {selectedIds.size === processedResumes.length && processedResumes.length > 0 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                        {selectedIds.size === processedResumes.length && processedResumes.length > 0 ? "取消全选" : "全选当前"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ======== 内容 ======== */}
                    {isLoading ? (
                        <LoadingSkeleton viewMode={viewMode} />
                    ) : processedResumes.length > 0 ? (
                        viewMode === "grid" ? (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                <AnimatePresence mode="popLayout">
                                    {processedResumes.map((resume, idx) => (
                                        <motion.div
                                            key={resume.id}
                                            variants={itemVariants}
                                            layout
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            onClick={() => {
                                                if (selectMode) toggleSelect(resume.id);
                                                else { setPreviewResumeId(resume.id); setShowPreview(true); setFocusedIndex(idx); }
                                            }}
                                            className={`relative rounded-2xl transition-all duration-200 ${
                                                selectMode ? "cursor-pointer" : "cursor-pointer"
                                            } ${
                                                focusedIndex === idx
                                                    ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 scale-[1.02]"
                                                    : selectedIds.has(resume.id)
                                                    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900"
                                                    : ""
                                            }`}
                                        >
                                            <ResumeCard
                                                resume={resume}
                                                onDelete={handleDelete}
                                                isFavorited={favoriteIds.has(resume.id)}
                                                onToggleFavorite={toggleFavorite}
                                                resumeTags={(resumeTags[resume.id] || []).map((tid) => tags.find((t) => t.id === tid)).filter(Boolean) as TagDef[]}
                                                allTags={tags}
                                                onAssignTag={assignTag}
                                            />
                                            {selectMode && (
                                                <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                                                    className={`absolute top-3 left-3 w-6 h-6 rounded-md flex items-center justify-center z-30 shadow-md ${selectedIds.has(resume.id) ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white" : "bg-white/95 dark:bg-gray-800/95 border border-gray-300 dark:border-gray-600"}`}
                                                >
                                                    {selectedIds.has(resume.id) && <Check className="w-4 h-4" />}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
                                <AnimatePresence mode="popLayout">
                                    {processedResumes.map((resume, idx) => (
                                        <div
                                            key={resume.id}
                                            onClick={() => {
                                                if (!selectMode) { setPreviewResumeId(resume.id); setShowPreview(true); setFocusedIndex(idx); }
                                            }}
                                            className={focusedIndex === idx && !selectMode ? "ring-2 ring-emerald-400 rounded-2xl" : ""}
                                        >
                                            <ResumeListRow
                                                resume={resume}
                                                onDelete={handleDelete}
                                                selectMode={selectMode}
                                                selected={selectedIds.has(resume.id)}
                                                onToggleSelect={toggleSelect}
                                                isFavorited={favoriteIds.has(resume.id)}
                                                onToggleFavorite={toggleFavorite}
                                                density={densityMode}
                                            />
                                        </div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )
                    ) : (
                        <EmptyState searchKeyword={searchKeyword} scoreFilter={scoreFilter} onClear={() => { setSearchKeyword(""); setScoreFilter("all"); setTimeFilter("all"); setShowFavoritesOnly(false); setTagFilter(null); }} />
                    )}
                </motion.div>

                {/* ======== 简历列表下方：简历对比工具 + 批量操作 + 数据洞察 ======== */}
                {!isLoading && processedResumes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 space-y-6"
                    >
                        {/* 第一行：简历对比工具 */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 shadow-lg shadow-gray-900/5">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <GitCompare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">简历对比工具</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">从下方选择 2-3 份简历进行多维度对比</p>
                                    </div>
                                </div>
                                <Link
                                    to="/compare"
                                    className="text-[11px] px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg font-medium transition-colors"
                                >
                                    前往对比页 →
                                </Link>
                            </div>

                            {/* 已选简历展示 */}
                            {selectedIds.size > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {processedResumes.filter((r) => selectedIds.has(r.id)).map((r) => (
                                            <motion.div
                                                key={r.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-200/50 dark:border-indigo-700/30"
                                            >
                                                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-md flex items-center justify-center text-white text-[10px] font-bold">
                                                    {r.basicInfo.name.slice(0, 1)}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{r.basicInfo.name}</span>
                                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{r.scores.overall}分</span>
                                                <button
                                                    onClick={() => { const next = new Set(selectedIds); next.delete(r.id); setSelectedIds(next); }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100/60 dark:border-gray-700/40">
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">已选 {selectedIds.size} 份，可对比 2-3 份</span>
                                        <button
                                            onClick={() => setSelectedIds(new Set())}
                                            className="text-[11px] text-gray-400 hover:text-gray-600 ml-auto"
                                        >
                                            清空选择
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>点击简历卡片右上角的复选框选择要对比的简历</p>
                                    <p className="text-[11px] mt-1">提示：选择 2 份简历可获得最佳对比效果</p>
                                </div>
                            )}
                        </div>

                        {/* 第二行：批量操作面板 + 数据洞察总结 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 批量操作面板 */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 shadow-lg shadow-gray-900/5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                        <Layers className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">批量操作</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">对多份简历执行批量操作</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        onClick={() => { if (selectMode) { setSelectMode(false); setSelectedIds(new Set()); } else { setSelectMode(true); } }}
                                        className="flex items-center gap-2.5 p-3 bg-violet-50/70 dark:bg-violet-900/20 hover:bg-violet-100/70 dark:hover:bg-violet-900/30 rounded-xl transition-colors group"
                                    >
                                        <CheckSquare className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">{selectMode ? "退出多选" : "进入多选"}</p>
                                            <p className="text-[10px] text-violet-500 dark:text-violet-400">{selectMode ? "取消当前选择" : "选择多条记录"}</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setShowTagManager(true)}
                                        className="flex items-center gap-2.5 p-3 bg-amber-50/70 dark:bg-amber-900/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 rounded-xl transition-colors group"
                                    >
                                        <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">标签管理</p>
                                            <p className="text-[10px] text-amber-500 dark:text-amber-400">管理自定义标签</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="flex items-center gap-2.5 p-3 bg-emerald-50/70 dark:bg-emerald-900/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 rounded-xl transition-colors group"
                                    >
                                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">快速导出</p>
                                            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">导出 CSV 文件</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedIds.size === processedResumes.length) setSelectedIds(new Set());
                                            else setSelectedIds(new Set(processedResumes.map((r) => r.id)));
                                        }}
                                        disabled={processedResumes.length === 0}
                                        className="flex items-center gap-2.5 p-3 bg-sky-50/70 dark:bg-sky-900/20 hover:bg-sky-100/70 dark:hover:bg-sky-900/30 rounded-xl transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {selectedIds.size === processedResumes.length && processedResumes.length > 0 ? <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" /> : <Square className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />}
                                        <div className="text-left">
                                            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">{selectedIds.size === processedResumes.length && processedResumes.length > 0 ? "取消全选" : "全选当前"}</p>
                                            <p className="text-[10px] text-sky-500 dark:text-sky-400">{selectedIds.size}/{processedResumes.length} 已选</p>
                                        </div>
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100/60 dark:border-gray-700/40 flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">快捷键：Ctrl+A 全选 · Esc 退出</span>
                                </div>
                            </div>

                            {/* 数据洞察总结 */}
                            {(() => {
                                const total = processedResumes.length;
                                const scores = processedResumes.map((r) => r.scores.overall);
                                const avg = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
                                const high = scores.filter((s) => s >= 80).length;
                                const medium = scores.filter((s) => s >= 60 && s < 80).length;
                                const low = scores.filter((s) => s < 60).length;
                                const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
                                const mediumPct = total > 0 ? Math.round((medium / total) * 100) : 0;
                                const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

                                // 找出最高分和最低分简历
                                const topResume = processedResumes.reduce((max, r) => r.scores.overall > max.scores.overall ? r : max, processedResumes[0]);
                                const bottomResume = processedResumes.reduce((min, r) => r.scores.overall < min.scores.overall ? r : min, processedResumes[0]);

                                return (
                                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 shadow-lg shadow-gray-900/5">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">数据洞察总结</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">当前筛选结果关键指标</p>
                                            </div>
                                        </div>

                                        {/* 分数分布条 */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                                                <span className="text-gray-500 dark:text-gray-400">分数分布</span>
                                                <span className="font-medium text-gray-700 dark:text-gray-200">平均 {avg} 分</span>
                                            </div>
                                            <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                {high > 0 && <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${highPct}%` }} title={`优秀 ${high} 人`} />}
                                                {medium > 0 && <div className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all" style={{ width: `${mediumPct}%` }} title={`良好 ${medium} 人`} />}
                                                {low > 0 && <div className="bg-gradient-to-r from-red-400 to-red-500 transition-all" style={{ width: `${lowPct}%` }} title={`待提升 ${low} 人`} />}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] mt-1.5">
                                                <span className="text-emerald-600 dark:text-emerald-400">● 优秀 {highPct}%</span>
                                                <span className="text-amber-600 dark:text-amber-400">● 良好 {mediumPct}%</span>
                                                <span className="text-red-600 dark:text-red-400">● 待提升 {lowPct}%</span>
                                            </div>
                                        </div>

                                        {/* 极值简历 */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50/60 dark:bg-emerald-900/20 rounded-xl cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 transition-colors" onClick={() => { setPreviewResumeId(topResume.id); setShowPreview(true); }}>
                                                <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">最高分</p>
                                                    <p className="text-xs text-gray-900 dark:text-white truncate">{topResume.basicInfo.name} · {topResume.jobInfo.position || "未填写"}</p>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{topResume.scores.overall}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-2.5 bg-amber-50/60 dark:bg-amber-900/20 rounded-xl cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-colors" onClick={() => { setPreviewResumeId(bottomResume.id); setShowPreview(true); }}>
                                                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">待提升</p>
                                                    <p className="text-xs text-gray-900 dark:text-white truncate">{bottomResume.basicInfo.name} · {bottomResume.jobInfo.position || "未填写"}</p>
                                                </div>
                                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{bottomResume.scores.overall}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 第三行：候选人能力雷达 */}
                        {(() => {
                            // 计算当前结果集各维度平均分
                            const total = processedResumes.length;
                            if (total === 0) return null;

                            const avgSkills = Math.round(processedResumes.reduce((s, r) => s + (r.scores.skills || 0), 0) / total);
                            const avgExp = Math.round(processedResumes.reduce((s, r) => s + (r.scores.experience || 0), 0) / total);
                            const avgEdu = Math.round(processedResumes.reduce((s, r) => s + (r.scores.education || 0), 0) / total);
                            const avgOverall = Math.round(processedResumes.reduce((s, r) => s + (r.scores.overall || 0), 0) / total);

                            const dimensions = [
                                { label: "综合", value: avgOverall, color: "from-violet-400 to-purple-500" },
                                { label: "技能", value: avgSkills, color: "from-sky-400 to-blue-500" },
                                { label: "经验", value: avgExp, color: "from-emerald-400 to-teal-500" },
                                { label: "学历", value: avgEdu, color: "from-amber-400 to-orange-500" },
                            ];

                            return (
                                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 shadow-lg shadow-gray-900/5">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                                                <PieChart className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">候选人能力雷达</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">基于 {total} 份简历的各维度平均得分</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* 可视化条形图 */}
                                        <div className="space-y-3">
                                            {dimensions.map((dim) => (
                                                <div key={dim.label}>
                                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                                        <span className="font-medium text-gray-600 dark:text-gray-300">{dim.label}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{dim.value} / 100</span>
                                                    </div>
                                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${dim.value}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                            className={`h-full bg-gradient-to-r ${dim.color} rounded-full`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 雷达图替代：环形图 */}
                                        <div className="flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-3 w-full">
                                                {dimensions.map((dim) => {
                                                    const circumference = 2 * Math.PI * 28;
                                                    const offset = circumference - (dim.value / 100) * circumference;
                                                    const colorMap: Record<string, string> = {
                                                        "综合": "stroke-violet-500",
                                                        "技能": "stroke-sky-500",
                                                        "经验": "stroke-emerald-500",
                                                        "学历": "stroke-amber-500",
                                                    };
                                                    return (
                                                        <div key={dim.label} className="flex flex-col items-center p-2 bg-gray-50/60 dark:bg-gray-700/30 rounded-xl">
                                                            <div className="relative w-16 h-16">
                                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                                                                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
                                                                    <motion.circle
                                                                        cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round"
                                                                        className={colorMap[dim.label]}
                                                                        strokeDasharray={circumference}
                                                                        initial={{ strokeDashoffset: circumference }}
                                                                        animate={{ strokeDashoffset: offset }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{dim.value}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{dim.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </main>

            {/* ======== 快速预览面板 ======== */}
            <ResumePreviewPanel
                resume={previewResume}
                isOpen={showPreview}
                onClose={() => { setShowPreview(false); setFocusedIndex(-1); }}
                onPrev={() => {
                    if (previewIndex > 0) {
                        const next = processedResumes[previewIndex - 1];
                        setPreviewResumeId(next.id);
                        setFocusedIndex(previewIndex - 1);
                    }
                }}
                onNext={() => {
                    if (previewIndex < processedResumes.length - 1) {
                        const next = processedResumes[previewIndex + 1];
                        setPreviewResumeId(next.id);
                        setFocusedIndex(previewIndex + 1);
                    }
                }}
                hasPrev={previewIndex > 0}
                hasNext={previewIndex < processedResumes.length - 1}
                isFavorited={previewResumeId ? favoriteIds.has(previewResumeId) : false}
                onToggleFavorite={toggleFavorite}
            />

            {/* ======== 标签管理器 ======== */}
            <AnimatePresence>
                {showTagManager && (
                    <TagManagerModal
                        tags={tags}
                        onAddTag={addTag}
                        onDeleteTag={deleteTag}
                        onClose={() => setShowTagManager(false)}
                    />
                )}
            </AnimatePresence>

            {/* ======== 导出格式选择弹窗 ======== */}
            <AnimatePresence>
                {showExportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowExportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">选择导出格式</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">将导出当前筛选结果 ({processedResumes.length} 条)</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/30 transition-colors group">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">CSV 格式</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">逗号分隔值，Excel 可直接打开</p>
                                    </div>
                                </button>

                                <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/30 transition-colors group">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Excel 格式 (.xls)</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">制表符分隔，支持中文编码</p>
                                    </div>
                                </button>

                                <button onClick={() => handleExport("json")} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-violet-50/50 dark:bg-violet-900/20 hover:bg-violet-100/70 dark:hover:bg-violet-900/30 border border-violet-200/50 dark:border-violet-700/30 transition-colors group">
                                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileJson className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">JSON 格式</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">完整数据结构，适合二次开发</p>
                                    </div>
                                </button>
                            </div>

                            <button onClick={() => setShowExportModal(false)} className="mt-4 w-full py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">取消</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ======== 保存筛选预设弹窗 ======== */}
            <AnimatePresence>
                {showPresetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowPresetModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                    <Bookmark className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">保存筛选预设</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">将当前筛选条件保存为预设</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">预设名称</label>
                                <input
                                    type="text"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="例如：本周优秀简历"
                                    className="w-full px-3.5 py-2.5 text-sm bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    onKeyDown={(e) => e.key === "Enter" && saveFilterPreset()}
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4 p-3 bg-gray-50/70 dark:bg-gray-700/30 rounded-xl">
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">当前条件：</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {scoreFilter !== "all" && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">分数: {scoreFilter}</span>}
                                    {timeFilter !== "all" && <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded">时间: {timeFilter}</span>}
                                    {tagFilter && <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded">标签: {tags.find((t) => t.id === tagFilter)?.name || tagFilter}</span>}
                                    {showFavoritesOnly && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">仅收藏</span>}
                                    {searchKeyword && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">关键词: {searchKeyword}</span>}
                                    {scoreFilter === "all" && timeFilter === "all" && !tagFilter && !showFavoritesOnly && !searchKeyword && <span className="text-[10px] text-gray-400">无筛选条件</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowPresetModal(false)} className="flex-1 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">取消</button>
                                <button onClick={saveFilterPreset} className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/30 transition-all">保存预设</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ======== 回到顶部 ======== */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all backdrop-blur-xl"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}