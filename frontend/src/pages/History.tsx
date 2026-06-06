import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
    SlidersHorizontal,
    BarChart3,
    Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

/* ==================== 排序与筛选 ==================== */

type SortKey = "newest" | "oldest" | "score-high" | "score-low" | "name";
type ScoreFilter = "all" | "high" | "medium" | "low";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "最新优先" },
    { key: "oldest", label: "最早优先" },
    { key: "score-high", label: "评分最高" },
    { key: "score-low", label: "评分最低" },
    { key: "name", label: "姓名排序" },
];

const SCORE_FILTER_OPTIONS: { key: ScoreFilter; label: string; color: string }[] = [
    { key: "all", label: "全部", color: "text-gray-600 dark:text-gray-300" },
    { key: "high", label: "优秀 (80+)", color: "text-emerald-600 dark:text-emerald-400" },
    { key: "medium", label: "良好 (60-79)", color: "text-amber-600 dark:text-amber-400" },
    { key: "low", label: "待改进 (<60)", color: "text-red-600 dark:text-red-400" },
];

/* ==================== 动画变体 ==================== */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -8,
        transition: { duration: 0.2 },
    },
};

/* ==================== 统计卡片组件 ==================== */

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
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </motion.div>
    );
}

/* ==================== 列表视图行组件 ==================== */

function ResumeListRow({
    resume,
    onDelete,
}: {
    resume: ResumeData;
    onDelete: (id: string) => void;
}) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (score >= 60) return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
        return "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400";
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    const getInitials = (name: string) => {
        return name.split("").slice(0, 1).join("").toUpperCase();
    };

    return (
        <motion.div
            variants={itemVariants}
            layout
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 p-4 sm:p-5"
        >
            <div className="flex items-center gap-4 sm:gap-6">
                {/* 头像 */}
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {getInitials(resume.basicInfo.name)}
                </div>

                {/* 主信息 */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                    {/* 姓名和岗位 */}
                    <div className="sm:col-span-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {resume.basicInfo.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {resume.jobInfo.position || "未知岗位"}
                        </p>
                    </div>

                    {/* 联系方式 */}
                    <div className="hidden sm:block min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {resume.basicInfo.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {resume.basicInfo.phone}
                        </p>
                    </div>

                    {/* 背景 */}
                    <div className="hidden sm:block min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {resume.background.education}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {resume.background.workYears}工作经验
                        </p>
                    </div>

                    {/* 分数和日期 */}
                    <div className="flex items-center gap-3 sm:justify-end">
                        <div className="flex-1 sm:hidden">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                                </div>
                                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(resume.scores.overall)}`}
                                        style={{ width: `${resume.scores.overall}%` }}
                                    />
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${getScoreColor(resume.scores.overall)}`}>
                                {resume.scores.overall}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(resume.id);
                            }}
                            className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="删除"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ==================== 主页面 ==================== */

export default function HistoryPage() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>("newest");
    const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const { resumes, setResumes, removeResume } = useResumeStore();
    const sortRef = useRef<HTMLDivElement>(null);

    /* ---------- 搜索去抖 ---------- */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    /* ---------- 加载数据 ---------- */
    const loadHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const history = await api.getHistory(debouncedKeyword || undefined);
            setResumes(history);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, setResumes]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    /* ---------- 点击外部关闭下拉 ---------- */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------- 删除 ---------- */
    const handleDelete = useCallback(async (id: string) => {
        try {
            await api.deleteHistory(id);
            removeResume(id);
        } catch (err) {
            console.error("Failed to delete resume:", err);
        }
    }, [removeResume]);

    /* ---------- 排序和筛选 ---------- */
    const processedResumes = useMemo(() => {
        let result = [...resumes];

        // 按分数筛选
        if (scoreFilter === "high") result = result.filter((r) => r.scores.overall >= 80);
        else if (scoreFilter === "medium") result = result.filter((r) => r.scores.overall >= 60 && r.scores.overall < 80);
        else if (scoreFilter === "low") result = result.filter((r) => r.scores.overall < 60);

        // 排序
        switch (sortBy) {
            case "newest":
                result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
                break;
            case "score-high":
                result.sort((a, b) => b.scores.overall - a.scores.overall);
                break;
            case "score-low":
                result.sort((a, b) => a.scores.overall - b.scores.overall);
                break;
            case "name":
                result.sort((a, b) => a.basicInfo.name.localeCompare(b.basicInfo.name, "zh-CN"));
                break;
        }

        return result;
    }, [resumes, sortBy, scoreFilter]);

    /* ---------- 统计数据 ---------- */
    const stats = useMemo(() => {
        if (resumes.length === 0) return null;
        const scores = resumes.map((r) => r.scores.overall);
        const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
        const highCount = scores.filter((s) => s >= 80).length;
        const positions = new Set(resumes.map((r) => r.jobInfo.position).filter(Boolean));
        return { total: resumes.length, avg, highCount, positionCount: positions.size };
    }, [resumes]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <BackButton />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* ======== 页头 ======== */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1.5">
                                历史记录
                            </h1>
                            <p className="text-base text-gray-500 dark:text-gray-400">
                                管理您所有分析过的简历记录
                            </p>
                        </div>
                        <button
                            onClick={loadHistory}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-all duration-200 shadow-sm self-start sm:self-auto"
                        >
                            <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            <span>刷新</span>
                        </button>
                    </div>

                    {/* ======== 统计概览 ======== */}
                    {stats && !isLoading && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            <StatCard
                                icon={Users}
                                label="总记录数"
                                value={stats.total}
                                color="text-blue-600 dark:text-blue-400"
                                bgColor="bg-blue-50 dark:bg-blue-900/30"
                                delay={0}
                            />
                            <StatCard
                                icon={BarChart3}
                                label="平均分"
                                value={stats.avg}
                                color="text-violet-600 dark:text-violet-400"
                                bgColor="bg-violet-50 dark:bg-violet-900/30"
                                delay={0.05}
                            />
                            <StatCard
                                icon={Award}
                                label="优秀简历"
                                value={stats.highCount}
                                color="text-emerald-600 dark:text-emerald-400"
                                bgColor="bg-emerald-50 dark:bg-emerald-900/30"
                                delay={0.1}
                            />
                            <StatCard
                                icon={Briefcase}
                                label="覆盖岗位"
                                value={stats.positionCount}
                                color="text-amber-600 dark:text-amber-400"
                                bgColor="bg-amber-50 dark:bg-amber-900/30"
                                delay={0.15}
                            />
                        </div>
                    )}

                    {/* ======== 搜索和工具栏 ======== */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 mb-6">
                        {/* 搜索框 */}
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="搜索候选人姓名、邮箱、岗位或技能..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* 筛选和视图控制 */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* 分数筛选标签 */}
                            <div className="flex items-center gap-1.5 mr-1">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">筛选：</span>
                            </div>
                            {SCORE_FILTER_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setScoreFilter(opt.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                        scoreFilter === opt.key
                                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}

                            <div className="flex-1" />

                            {/* 排序下拉 */}
                            <div className="relative" ref={sortRef}>
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                >
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sortBy)?.label}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {showSortDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1.5 overflow-hidden"
                                        >
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => {
                                                        setSortBy(opt.key);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                        sortBy === opt.key
                                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 font-medium"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 视图切换 */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${
                                        viewMode === "grid"
                                            ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                    title="网格视图"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${
                                        viewMode === "list"
                                            ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    }`}
                                    title="列表视图"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ======== 结果数量提示 ======== */}
                    {!isLoading && resumes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between mb-4"
                        >
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                共 <span className="font-semibold text-gray-700 dark:text-gray-200">{resumes.length}</span> 条记录
                                {scoreFilter !== "all" && processedResumes.length !== resumes.length && (
                                    <span>
                                        ，筛选显示 <span className="font-semibold text-gray-700 dark:text-gray-200">{processedResumes.length}</span> 条
                                    </span>
                                )}
                            </p>
                        </motion.div>
                    )}

                    {/* ======== 内容区域 ======== */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="relative w-14 h-14 mx-auto mb-5">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/40" />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">正在加载历史记录...</p>
                            </div>
                        </div>
                    ) : processedResumes.length > 0 ? (
                        viewMode === "grid" ? (
                            /* ---- 网格视图 ---- */
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
                            >
                                <AnimatePresence mode="popLayout">
                                    {processedResumes.map((resume) => (
                                        <motion.div
                                            key={resume.id}
                                            variants={itemVariants}
                                            layout
                                            exit="exit"
                                        >
                                            <ResumeCard
                                                resume={resume}
                                                onDelete={handleDelete}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            /* ---- 列表视图 ---- */
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col gap-2.5"
                            >
                                <AnimatePresence mode="popLayout">
                                    {processedResumes.map((resume) => (
                                        <ResumeListRow
                                            key={resume.id}
                                            resume={resume}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )
                    ) : (
                        /* ---- 空状态 ---- */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                {searchKeyword || scoreFilter !== "all" ? (
                                    <Search className="w-9 h-9 text-gray-300 dark:text-gray-600" />
                                ) : (
                                    <FileText className="w-9 h-9 text-gray-300 dark:text-gray-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {searchKeyword
                                    ? "未找到匹配的简历"
                                    : scoreFilter !== "all"
                                    ? "该筛选条件下暂无记录"
                                    : "暂无历史记录"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                {searchKeyword
                                    ? "请尝试使用其他关键词搜索，或检查输入是否正确"
                                    : scoreFilter !== "all"
                                    ? "尝试切换其他筛选条件查看更多记录"
                                    : "上传并分析简历后，记录将显示在这里"}
                            </p>
                            {(searchKeyword || scoreFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchKeyword("");
                                        setScoreFilter("all");
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    清除所有筛选
                                </button>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
