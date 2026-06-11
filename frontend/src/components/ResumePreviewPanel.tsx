import { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Phone,
    Mail,
    Briefcase,
    GraduationCap,
    Calendar,
    Award,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Sparkles,
    Bot,
    Star,
    MapPin,
    TrendingUp,
    Zap,
    BookOpen,
    GitCompare,
} from "lucide-react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewPanelProps {
    resume: ResumeData | null;
    isOpen: boolean;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
    isFavorited?: boolean;
    onToggleFavorite?: (id: string) => void;
}

/* ---- 分数环形图 ---- */
function ScoreRing({ score, size = 64, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
    const gradientId = `ring-grad-${size}`;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-100 dark:stroke-gray-700" />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    stroke={`url(#${gradientId})`}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-bold ${score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                    {score}
                </span>
            </div>
            {score >= 80 && (
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
            )}
        </div>
    );
}

/* ---- 子分数进度条 ---- */
function SubScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
    const color =
        value >= 80
            ? { bar: "from-emerald-400 to-teal-400", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
            : value >= 60
            ? { bar: "from-amber-400 to-orange-400", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" }
            : { bar: "from-red-400 to-rose-400", text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" };

    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color.text}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
                    <span className={`text-xs font-semibold ${color.text}`}>{value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${color.bar}`}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ResumePreviewPanel({
    resume,
    isOpen,
    onClose,
    onPrev,
    onNext,
    hasPrev = false,
    hasNext = false,
    isFavorited = false,
    onToggleFavorite,
}: ResumePreviewPanelProps) {
    /* ---- ESC 关闭 ---- */
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    /* ---- 阻止背景滚动 ---- */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!resume) return null;
    const isAI = resume.aiProvider === "coze";
    const isHighScore = resume.scores.overall >= 80;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* 面板 */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 35 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* 顶部装饰条 */}
                        <div className={`h-1 w-full bg-gradient-to-r ${isHighScore ? "from-emerald-500 via-teal-500 to-cyan-500" : resume.scores.overall >= 60 ? "from-amber-500 via-orange-500 to-yellow-500" : "from-red-500 via-rose-500 to-pink-500"}`} />

                        {/* 头部 */}
                        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">简历预览</h2>
                            </div>
                            <div className="flex items-center gap-1">
                                {onToggleFavorite && (
                                    <button
                                        onClick={() => onToggleFavorite(resume.id)}
                                        className={`p-2 rounded-xl transition-all duration-200 ${
                                            isFavorited
                                                ? "text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                                                : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        }`}
                                        title={isFavorited ? "取消收藏" : "收藏"}
                                    >
                                        <Star className={`w-4.5 h-4.5 ${isFavorited ? "fill-current" : ""}`} />
                                    </button>
                                )}
                                <Link
                                    to="/analyze"
                                    state={{ resumeId: resume.id }}
                                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                    title="查看完整分析"
                                >
                                    <ExternalLink className="w-4.5 h-4.5" />
                                </Link>
                            </div>
                        </div>

                        {/* 内容区域 */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            <div className="p-6 space-y-6">
                                {/* 候选人信息 */}
                                <div className="flex items-start gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg ${
                                        isHighScore
                                            ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/25"
                                            : resume.scores.overall >= 60
                                            ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
                                            : "bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/25"
                                    }`}>
                                        {resume.basicInfo.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                                {resume.basicInfo.name}
                                            </h3>
                                            {isFavorited && (
                                                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                                            {resume.jobInfo.position || "未知岗位"}
                                            {resume.jobInfo.expectedSalary && ` · ${resume.jobInfo.expectedSalary}`}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {isAI ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-md border border-violet-200/60 dark:border-violet-800/40">
                                                    <Sparkles className="w-3 h-3" />AI 分析
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs rounded-md border border-sky-200/60 dark:border-sky-800/40">
                                                    <Bot className="w-3 h-3" />规则分析
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(resume.uploadedAt).toLocaleDateString("zh-CN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <ScoreRing score={resume.scores.overall} size={64} />
                                </div>

                                {/* 联系信息 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.basicInfo.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.basicInfo.phone}</span>
                                    </div>
                                    {resume.basicInfo.address && (
                                        <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl col-span-2">
                                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.basicInfo.address}</span>
                                        </div>
                                    )}
                                </motion.div>

                                {/* 背景信息 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="space-y-3"
                                >
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <BookOpen className="w-4 h-4 text-emerald-500" />背景信息
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2.5 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/60 dark:border-emerald-800/20">
                                            <GraduationCap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">学历</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{resume.background.education}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 p-3 bg-sky-50/50 dark:bg-sky-900/10 rounded-xl border border-sky-100/60 dark:border-sky-800/20">
                                            <Briefcase className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">工作经验</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{resume.background.workYears}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {resume.background.university && (
                                        <div className="flex items-center gap-2.5 p-3 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100/60 dark:border-violet-800/20">
                                            <GraduationCap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">毕业院校</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {resume.background.university}
                                                    {resume.background.major && ` · ${resume.background.major}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* 评分详情 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-3"
                                >
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />评分明细
                                    </h4>
                                    <div className="space-y-3.5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <SubScoreBar label="技能匹配" value={resume.scores.skills} icon={Zap} />
                                        <SubScoreBar label="经验匹配" value={resume.scores.experience} icon={Briefcase} />
                                        <SubScoreBar label="学历匹配" value={resume.scores.education} icon={Award} />
                                    </div>
                                </motion.div>

                                {/* 技能标签 */}
                                {resume.skills.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="space-y-3"
                                    >
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Sparkles className="w-4 h-4 text-emerald-500" />技能标签
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {resume.skills.map((skill, i) => {
                                                const tier = i < 2 ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40"
                                                    : i < 4 ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40"
                                                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-600/40";
                                                return (
                                                    <span key={i} className={`px-2.5 py-1 text-xs rounded-lg border ${tier} font-medium`}>
                                                        {skill}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* 分析摘要 */}
                                {resume.analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="space-y-3"
                                    >
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Sparkles className="w-4 h-4 text-emerald-500" />分析摘要
                                        </h4>
                                        <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100/60 dark:border-emerald-800/20 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {resume.analysis.length > 300 ? resume.analysis.slice(0, 300) + "..." : resume.analysis}
                                        </div>
                                    </motion.div>
                                )}

                                {/* 改进建议 */}
                                {resume.suggestions && resume.suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="space-y-3"
                                    >
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            <Award className="w-4 h-4 text-amber-500" />改进建议
                                        </h4>
                                        <div className="space-y-2">
                                            {resume.suggestions.map((suggestion, i) => (
                                                <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100/60 dark:border-amber-800/20">
                                                    <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* 底部操作栏 */}
                        <div className="relative border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={onPrev}
                                    disabled={!hasPrev}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="上一个"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="下一个"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/compare"
                                    state={{ resumeId: resume.id }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                                >
                                    <GitCompare className="w-3.5 h-3.5" />对比
                                </Link>
                                <Link
                                    to="/analyze"
                                    state={{ resumeId: resume.id }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />完整分析
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}