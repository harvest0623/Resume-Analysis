import { useState } from "react";
import { ResumeData } from "@/types/resume";
import {
    Phone,
    Mail,
    Briefcase,
    GraduationCap,
    Calendar,
    Trash2,
    Eye,
    AlertTriangle,
    Sparkles,
    Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface ResumeCardProps {
    resume: ResumeData;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (id: string) => void;
}

export default function ResumeCard({
    resume,
    onDelete,
    showActions = true,
    selectable = false,
    selected = false,
    onSelect,
}: ResumeCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", ring: "stroke-emerald-500" };
        if (score >= 60) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", ring: "stroke-amber-500" };
        return { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30", ring: "stroke-red-500" };
    };

    const getInitials = (name: string) => {
        return name.split("").slice(0, 1).join("").toUpperCase();
    };

    const scoreColors = getScoreColor(resume.scores.overall);

    // SVG 圆环进度
    const circleRadius = 18;
    const circumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circumference - (resume.scores.overall / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
                group relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${selectable ? "cursor-pointer" : ""}
                ${selected
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg shadow-blue-500/10"
                    : "border-gray-100 dark:border-gray-700/80 hover:border-blue-200 dark:hover:border-blue-700/60 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/30"
                }
            `}
            onClick={() => selectable && onSelect?.(resume.id)}
        >
            {/* 顶部装饰条 */}
            <div className={`h-1 w-full ${resume.scores.overall >= 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : resume.scores.overall >= 60 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-red-400 to-red-500"} opacity-80`} />

            <div className="p-5 sm:p-6">
                {/* 头部：头像 + 基本信息 + 分数 */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm shadow-blue-500/20">
                            {getInitials(resume.basicInfo.name)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate leading-tight mb-0.5">
                                {resume.basicInfo.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {resume.jobInfo.position || "未知岗位"}
                            </p>
                        </div>
                    </div>

                    {/* 分数圆环 */}
                    <div className="relative flex-shrink-0">
                        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r={circleRadius}
                                fill="none"
                                strokeWidth="4"
                                className="stroke-gray-100 dark:stroke-gray-700"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r={circleRadius}
                                fill="none"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className={`${scoreColors.ring} transition-all duration-700`}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-xs font-bold ${scoreColors.text} leading-none`}>
                                {resume.scores.overall}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 分析来源标识 */}
                <div className="flex items-center gap-1.5 mb-3">
                    {resume.aiProvider === "coze" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs rounded-md border border-violet-100 dark:border-violet-800/40">
                            <Sparkles className="w-3 h-3" />
                            AI 分析
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs rounded-md border border-sky-100 dark:border-sky-800/40">
                            <Bot className="w-3 h-3" />
                            规则分析
                        </span>
                    )}
                </div>

                {/* 信息网格 */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{resume.basicInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{resume.basicInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{resume.background.education}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{resume.background.workYears}工作经验</span>
                    </div>
                </div>

                {/* 子分数条 */}
                <div className="mb-4 space-y-1.5">
                    {[
                        { label: "技能", value: resume.scores.skills },
                        { label: "经验", value: resume.scores.experience },
                        { label: "学历", value: resume.scores.education },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500 w-6 flex-shrink-0">{item.label}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                    className={`h-full rounded-full ${
                                        item.value >= 80 ? "bg-emerald-400" : item.value >= 60 ? "bg-amber-400" : "bg-red-400"
                                    }`}
                                />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right flex-shrink-0">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* 技能标签 */}
                {resume.skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {resume.skills.slice(0, 4).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-xs rounded-md border border-gray-100 dark:border-gray-600/50"
                                >
                                    {skill}
                                </span>
                            ))}
                            {resume.skills.length > 4 && (
                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 text-xs rounded-md border border-blue-100 dark:border-blue-800/30">
                                    +{resume.skills.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 底部：日期 + 操作 */}
                <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    {showActions && (
                        <div className="flex items-center gap-1">
                            <Link
                                to={`/home/analyze`}
                                state={{ resumeId: resume.id }}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                title="查看详情"
                            >
                                <Eye className="w-4 h-4" />
                            </Link>
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                    title="删除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 删除确认浮层 */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-5 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">确认删除？</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">删除后无法恢复该记录</p>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    onDelete?.(resume.id);
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                删除
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
