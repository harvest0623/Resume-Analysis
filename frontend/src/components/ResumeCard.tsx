import { useState, useRef, useEffect } from "react";
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
    MoreVertical,
    Copy,
    Check,
    Star,
    Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface TagDef {
    id: string;
    name: string;
    color: string;
    textColor: string;
    borderColor: string;
}

interface ResumeCardProps {
    resume: ResumeData;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (id: string) => void;
    isFavorited?: boolean;
    onToggleFavorite?: (id: string) => void;
    resumeTags?: TagDef[];
    allTags?: TagDef[];
    onAssignTag?: (resumeId: string, tagId: string) => void;
}

export default function ResumeCard({
    resume,
    onDelete,
    showActions = true,
    selectable = false,
    selected = false,
    onSelect,
    isFavorited = false,
    onToggleFavorite,
    resumeTags = [],
    allTags = [],
    onAssignTag,
}: ResumeCardProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showMenu]);

    const getScoreColor = (score: number) => {
        if (score >= 80)
            return {
                text: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-900/30",
                ring: "stroke-emerald-500",
                gradient: "from-emerald-500 to-teal-500",
            };
        if (score >= 60)
            return {
                text: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-900/30",
                ring: "stroke-amber-500",
                gradient: "from-amber-500 to-orange-500",
            };
        return {
            text: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/30",
            ring: "stroke-red-500",
            gradient: "from-red-500 to-rose-500",
        };
    };

    const getInitials = (name: string) => {
        return name.split("").slice(0, 1).join("").toUpperCase();
    };

    const scoreColors = getScoreColor(resume.scores.overall);
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
                group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${selectable ? "cursor-pointer" : ""}
                ${
                    selected
                        ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800 shadow-lg shadow-emerald-500/20"
                        : "border-white/40 dark:border-gray-700/60 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-xl hover:shadow-emerald-500/10"
                }
                backdrop-blur-xl bg-white/70 dark:bg-gray-800/70
            `}
            onClick={() => selectable && onSelect?.(resume.id)}
        >
            {/* 顶部装饰条 + 玻璃高光 */}
            <div
                className={`h-1 w-full bg-gradient-to-r ${scoreColors.gradient} opacity-90`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

            <div className="relative p-5 sm:p-6">
                {/* 头部：头像 + 基本信息 + 分数 */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-emerald-500/25">
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
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {resume.aiProvider === "coze" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50/80 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-md border border-violet-100/80 dark:border-violet-800/40">
                            <Sparkles className="w-3 h-3" />
                            AI 分析
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50/80 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs rounded-md border border-sky-100/80 dark:border-sky-800/40">
                            <Bot className="w-3 h-3" />
                            规则分析
                        </span>
                    )}

                    {/* 自定义标签 */}
                    {resumeTags.map((tag) => (
                        <span
                            key={tag.id}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md border ${tag.color} ${tag.textColor} ${tag.borderColor}`}
                        >
                            <Tag className="w-2.5 h-2.5" />
                            {tag.name}
                        </span>
                    ))}
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
                            <span className="text-xs text-gray-400 dark:text-gray-500 w-6 flex-shrink-0">
                                {item.label}
                            </span>
                            <div className="flex-1 h-1.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                    className={`h-full rounded-full ${
                                        item.value >= 80
                                            ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                                            : item.value >= 60
                                            ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                            : "bg-gradient-to-r from-red-400 to-rose-400"
                                    }`}
                                />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right flex-shrink-0">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 技能标签 */}
                {resume.skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {resume.skills.slice(0, 4).map((skill, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.03 * index, type: "spring", stiffness: 200 }}
                                    whileHover={{ y: -2 }}
                                    className="px-2 py-0.5 bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-xs rounded-md border border-gray-200/60 dark:border-gray-600/50"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                            {resume.skills.length > 4 && (
                                <span className="px-2 py-0.5 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-md border border-emerald-100/80 dark:border-emerald-800/30">
                                    +{resume.skills.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 底部：日期 + 操作 */}
                <div className="flex items-center justify-between pt-3.5 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    {showActions && (
                        <div className="flex items-center gap-1">
                            <Link
                                to={`/analyze`}
                                state={{ resumeId: resume.id }}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                                title="查看详情"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">查看</span>
                            </Link>

                            {onDelete && (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(!showMenu);
                                        }}
                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="更多操作"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    <AnimatePresence>
                                        {showMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                                transition={{ duration: 0.15 }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 bottom-full mb-1.5 w-36 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl z-20 py-1.5 overflow-hidden"
                                            >
                                                <Link
                                                    to={`/analyze`}
                                                    state={{ resumeId: resume.id }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    查看详情
                                                </Link>
                                                <Link
                                                    to={`/compare`}
                                                    state={{ resumeId: resume.id }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    参与对比
                                                </Link>

                                                {/* 标签分配 */}
                                                {allTags.length > 0 && onAssignTag && (
                                                    <>
                                                        <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-0.5" />
                                                        <div className="px-3 py-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium">标签</div>
                                                        {allTags.map((tag) => {
                                                            const assigned = resumeTags.some((rt) => rt.id === tag.id);
                                                            return (
                                                                <button
                                                                    key={tag.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onAssignTag(resume.id, tag.id);
                                                                        setShowMenu(false);
                                                                    }}
                                                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                                                                        assigned
                                                                            ? `${tag.textColor} hover:bg-gray-50 dark:hover:bg-gray-700/60`
                                                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                                                    }`}
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full border ${assigned ? tag.color : "border-gray-300 dark:border-gray-600"}`} />
                                                                    {tag.name}
                                                                    {assigned && <Check className="w-3 h-3 ml-auto" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </>
                                                )}

                                                <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-0.5" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(false);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    删除
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                        className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-5 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">确认删除？</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                            删除后无法恢复该记录
                        </p>
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
                                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg transition-colors shadow-sm"
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
