import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
    Users, Search, Filter, Tag, Star, Mail, Phone, MapPin, Briefcase,
    GraduationCap, ChevronDown, ChevronUp, UserPlus, Eye, Bookmark,
    BookmarkCheck, Grid, List, X, TrendingUp, Award, BarChart3, PieChart,
    Target, Zap, Clock, Download, Trash2, CheckCircle, XCircle, Shield,
    UserCheck, Lightbulb, ArrowUpDown, SlidersHorizontal, Layers,
    Activity, Percent, Hash, RefreshCw, MoreHorizontal, ExternalLink,
    SortAsc, SortDesc, Rocket, Upload, CalendarDays, Building2, Sparkles,
    BarChart, BarChart2, LineChart, AreaChart, DollarSign, MapPinned
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

/* ───────── 背景组件（保持不变）───────── */
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-fuchsia-400/20 to-pink-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-fuchsia-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

const ParticleField = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 4 + 2, duration: Math.random() * 10 + 10, delay: Math.random() * 5
    }));
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-400/10"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

/* ───────── 类型定义 ───────── */
type ViewMode = "grid" | "list";
type SortBy = "score" | "name" | "date" | "skills";

/* ───────── 主题配置 ───────── */
const theme = {
    primary: {
        gradient: "from-blue-600 via-blue-700 to-indigo-800",
        light: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-700",
        ring: "ring-blue-500",
        shadow: "shadow-blue-500/20"
    },
    accent: {
        gradient: "from-indigo-500 via-purple-600 to-blue-700",
        light: "from-indigo-400 to-purple-500"
    }
};

/* ───────── 玻璃卡片组件（增强版）───────── */
const GlassCard = ({ children, className = "", delay = 0, hover = true, glow = false }: {
    children: React.ReactNode; className?: string; delay?: number; hover?: boolean; glow?: boolean
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        className={`relative backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/20 rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
        {glow && (
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none" />
        )}
        <div className="relative z-10">{children}</div>
    </motion.div>
);

/* ───────── 动画数字组件 ───────── */
const AnimatedNumber = ({ value, duration = 1.5, suffix = "" }: {
    value: number; duration?: number; suffix?: string
}) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = value;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);
    return <>{display}{suffix}</>;
};

/* ───────── 发光环组件 ───────── */
const GlowOrb = ({ color, size, x, y, delay }: {
    color: string; size: number; x: string; y: string; delay: number
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, delay }}
        className={`absolute rounded-full blur-2xl pointer-events-none ${color}`}
        style={{ width: size, height: size, left: x, top: y }}
    />
);

/* ───────── 评分环组件 ───────── */
const ScoreRing = ({ score, size = 60, strokeWidth = 4 }: {
    score: number; size?: number; strokeWidth?: number
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = useMotionValue(0);
    const springProgress = useSpring(progress, { stiffness: 100, damping: 30 });
    const strokeDashoffset = useTransform(springProgress, [0, 100], [circumference, 0]);

    useEffect(() => {
        progress.set(score);
    }, [score, progress]);

    const getColor = () => {
        if (score >= 80) return { stroke: "#10b981", bg: "from-emerald-500 to-teal-600" };
        if (score >= 60) return { stroke: "#f59e0b", bg: "from-amber-500 to-orange-600" };
        return { stroke: "#ef4444", bg: "from-red-500 to-rose-600" };
    };

    const { stroke, bg } = getColor();

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="currentColor"
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold bg-gradient-to-br ${bg} bg-clip-text text-transparent`}>
                    {score}
                </span>
            </div>
        </div>
    );
};

/* ───────── 进度条组件 ───────── */
const ProgressBar = ({ value, max = 100, color = "blue", label, showPercent = true }: {
    value: number; max?: number; color?: string; label?: string; showPercent?: boolean
}) => {
    const width = useMotionValue(0);
    const springWidth = useSpring(width, { stiffness: 100, damping: 30 });
    const displayWidth = useTransform(springWidth, v => `${v}%`);
    const percent = Math.round((value / max) * 100);

    useEffect(() => {
        width.set(percent);
    }, [percent, width]);

    const colorClasses: Record<string, string> = {
        blue: "from-blue-500 to-indigo-600",
        emerald: "from-emerald-500 to-teal-600",
        amber: "from-amber-500 to-orange-600",
        purple: "from-purple-500 to-indigo-600",
        pink: "from-pink-500 to-rose-600"
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                    {showPercent && (
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{percent}%</span>
                    )}
                </div>
            )}
            <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color] || colorClasses.blue}`}
                    style={{ width: displayWidth }}
                />
            </div>
        </div>
    );
};

/* ───────── 技能分布热力图 ───────── */
const SkillHeatmap = ({ skills }: { skills: { name: string; count: number }[] }) => {
    const maxCount = Math.max(...skills.map(s => s.count), 1);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {skills.slice(0, 12).map((skill, index) => {
                const intensity = skill.count / maxCount;
                const sizeClass = intensity > 0.8 ? "text-sm px-3 py-1.5" :
                    intensity > 0.5 ? "text-xs px-2.5 py-1" : "text-xs px-2 py-0.5";

                return (
                    <motion.span
                        key={skill.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`${sizeClass} rounded-lg font-medium cursor-default transition-all duration-200`}
                        style={{
                            background: `linear-gradient(135deg, rgba(59, 130, 246, ${0.1 + intensity * 0.3}), rgba(99, 102, 241, ${0.1 + intensity * 0.3}))`,
                            color: `rgb(${59 + intensity * 40}, ${130 - intensity * 30}, ${246 - intensity * 50})`,
                            border: `1px solid rgba(59, 130, 246, ${0.2 + intensity * 0.3})`
                        }}
                    >
                        {skill.name}
                        <span className="ml-1 opacity-70">{skill.count}</span>
                    </motion.span>
                );
            })}
        </div>
    );
};

export default function Talent() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortBy>("score");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filterSkill, setFilterSkill] = useState<string>("");
    const [filterEducation, setFilterEducation] = useState<string>("");
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set());
    const [showStats, setShowStats] = useState(true);
    const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
    const [trendChartType, setTrendChartType] = useState<"bar" | "line" | "area" | "pie">("line");
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const { resumes, setResumes } = useResumeStore();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setIsLoading(true);
                const history = await api.getHistory();
                setResumes(history);
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [setResumes]);

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        resumes.forEach((r) => r.skills.forEach((s) => skills.add(s)));
        return Array.from(skills).sort();
    }, [resumes]);

    const allEducations = useMemo(() => {
        const edus = new Set<string>();
        resumes.forEach((r) => {
            if (r.background.education) edus.add(r.background.education);
        });
        return Array.from(edus).sort();
    }, [resumes]);

    const filteredResumes = useMemo(() => {
        let result = [...resumes];

        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            result = result.filter(
                (r) =>
                    r.basicInfo.name.toLowerCase().includes(keyword) ||
                    r.jobInfo.position.toLowerCase().includes(keyword) ||
                    r.skills.some((s) => s.toLowerCase().includes(keyword))
            );
        }

        if (filterSkill) {
            result = result.filter((r) => r.skills.includes(filterSkill));
        }

        if (filterEducation) {
            result = result.filter((r) => r.background.education === filterEducation);
        }

        if (scoreRange[0] > 0 || scoreRange[1] < 100) {
            result = result.filter(
                (r) => r.scores.overall >= scoreRange[0] && r.scores.overall <= scoreRange[1]
            );
        }

        const sortFn = (a: ResumeData, b: ResumeData) => {
            let comparison = 0;
            switch (sortBy) {
                case "score":
                    comparison = a.scores.overall - b.scores.overall;
                    break;
                case "name":
                    comparison = a.basicInfo.name.localeCompare(b.basicInfo.name);
                    break;
                case "date":
                    comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
                    break;
                case "skills":
                    comparison = a.skills.length - b.skills.length;
                    break;
            }
            return sortOrder === "desc" ? -comparison : comparison;
        };

        result.sort(sortFn);
        return result;
    }, [resumes, searchKeyword, filterSkill, filterEducation, sortBy, sortOrder, scoreRange]);

    const toggleBookmark = (id: string) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        showSuccess(bookmarked.has(id) ? "已取消收藏" : "已添加收藏");
    };

    const toggleSelectResume = (id: string) => {
        setSelectedResumes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllResumes = () => {
        if (selectedResumes.size === filteredResumes.length) {
            setSelectedResumes(new Set());
        } else {
            setSelectedResumes(new Set(filteredResumes.map((r) => r.id)));
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 90) return { text: "优秀", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
        if (score >= 80) return { text: "良好", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
        if (score >= 60) return { text: "一般", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
        return { text: "待提升", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
    };

    const stats = useMemo(() => {
        if (resumes.length === 0) return null;

        const scores = resumes.map((r) => r.scores.overall);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highScore = Math.max(...scores);
        const lowScore = Math.min(...scores);

        const educationStats: Record<string, number> = {};
        resumes.forEach((r) => {
            const edu = r.background.education || "未知";
            educationStats[edu] = (educationStats[edu] || 0) + 1;
        });

        const skillStats: Record<string, number> = {};
        resumes.forEach((r) => {
            r.skills.forEach((s) => {
                skillStats[s] = (skillStats[s] || 0) + 1;
            });
        });
        const topSkills = Object.entries(skillStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        const highScoreCount = scores.filter(s => s >= 80).length;
        const mediumScoreCount = scores.filter(s => s >= 60 && s < 80).length;
        const lowScoreCount = scores.filter(s => s < 60).length;

        return {
            total: resumes.length,
            avgScore: Math.round(avgScore),
            highScore,
            lowScore,
            educationStats,
            topSkills,
            highScorePercent: Math.round((highScoreCount / resumes.length) * 100),
            mediumScorePercent: Math.round((mediumScoreCount / resumes.length) * 100),
            lowScorePercent: Math.round((lowScoreCount / resumes.length) * 100),
        };
    }, [resumes]);

    const openDetailModal = (resume: ResumeData) => {
        setSelectedResume(resume);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedResume(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric", month: "2-digit", day: "2-digit",
        });
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    };

    /* ───────── 特性标签数据 ───────── */
    const talentFeatures = [
        { icon: UserCheck, title: "智能筛选", desc: "多维度快速筛选候选人", gradient: "from-fuchsia-400 to-pink-500" },
        { icon: Target, title: "精准匹配", desc: "岗位需求与人才能力匹配", gradient: "from-pink-400 to-rose-500" },
        { icon: Shield, title: "数据安全", desc: "人才信息本地安全存储", gradient: "from-rose-400 to-fuchsia-500" },
        { icon: Lightbulb, title: "智能分析", desc: "AI 驱动的人才评估", gradient: "from-fuchsia-400 to-purple-500" }
    ];

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />

            {/* 成功提示 */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -50, x: "-50%" }}
                        className="fixed top-20 left-1/2 z-50 px-6 py-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* ───────── Hero Header（保持不变）───────── */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-fuchsia-500 via-pink-600 to-rose-600 rounded-3xl shadow-2xl shadow-fuchsia-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Users className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 blur-xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-gray-900 via-fuchsia-800 to-pink-800 dark:from-white dark:via-fuchsia-200 dark:to-pink-200 bg-clip-text text-transparent">
                                人才库管理
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            集中管理候选人信息，智能筛选与评估
                            <br className="hidden sm:block" />
                            <span className="text-fuchsia-600 dark:text-fuchsia-400 font-medium">打造企业专属人才储备库</span>
                        </motion.p>

                        {/* 特性标签 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="flex flex-wrap justify-center gap-3 mt-8"
                        >
                            {talentFeatures.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <div className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center`}>
                                        <feature.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{feature.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ───────── 数据可视化仪表盘 ───────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">数据概览</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        共 <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredResumes.length}</span> 位候选人
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowStats(!showStats)}
                                className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
                            >
                                {showStats ? <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            </motion.button>
                        </div>

                        <AnimatePresence>
                            {showStats && stats && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    {/* 核心指标卡片 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <GlassCard delay={0.1} className="group">
                                            <div className="p-5 relative overflow-hidden">
                                                <GlowOrb color="bg-blue-500/20" size={100} x="-20%" y="-20%" delay={0} />
                                                <div className="flex items-center justify-between mb-4">
                                                    <motion.div
                                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                                                    >
                                                        <Users className="w-6 h-6 text-white" />
                                                    </motion.div>
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-500">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">+12%</span>
                                                    </div>
                                                </div>
                                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                                    <AnimatedNumber value={stats.total} />
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">候选人总数</p>
                                                <div className="mt-3"><ProgressBar value={stats.total} max={stats.total * 2} color="blue" label="人才储备" /></div>
                                            </div>
                                        </GlassCard>

                                        <GlassCard delay={0.2} className="group">
                                            <div className="p-5 relative overflow-hidden">
                                                <GlowOrb color="bg-emerald-500/20" size={100} x="80%" y="-20%" delay={0.5} />
                                                <div className="flex items-center justify-between mb-4">
                                                    <motion.div
                                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                                        className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                                    >
                                                        <Target className="w-6 h-6 text-white" />
                                                    </motion.div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">平均值</span>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                                        <AnimatedNumber value={stats.avgScore} />
                                                    </p>
                                                    <span className="text-lg text-gray-400 dark:text-gray-500 mb-1 font-light">/100</span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">综合评分</p>
                                                <div className="mt-3"><ProgressBar value={stats.avgScore} color="emerald" label="达标率" /></div>
                                            </div>
                                        </GlassCard>

                                        <GlassCard delay={0.3} className="group">
                                            <div className="p-5 relative overflow-hidden">
                                                <GlowOrb color="bg-amber-500/20" size={100} x="-20%" y="80%" delay={1} />
                                                <div className="flex items-center justify-between mb-4">
                                                    <motion.div
                                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                                        className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
                                                    >
                                                        <Award className="w-6 h-6 text-white" />
                                                    </motion.div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">占比</span>
                                                </div>
                                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                                    <AnimatedNumber value={stats.highScorePercent} suffix="%" />
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">优秀人才</p>
                                                <div className="mt-3"><ProgressBar value={stats.highScorePercent} color="amber" label="优秀率" /></div>
                                            </div>
                                        </GlassCard>

                                        <GlassCard delay={0.4} className="group">
                                            <div className="p-5 relative overflow-hidden">
                                                <GlowOrb color="bg-purple-500/20" size={100} x="80%" y="80%" delay={1.5} />
                                                <div className="flex items-center justify-between mb-4">
                                                    <motion.div
                                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30"
                                                    >
                                                        <Zap className="w-6 h-6 text-white" />
                                                    </motion.div>
                                                    <ScoreRing score={stats.highScore} size={48} strokeWidth={3} />
                                                </div>
                                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                                    <AnimatedNumber value={stats.highScore} />
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">最高评分</p>
                                                <div className="mt-3"><ProgressBar value={stats.highScore} color="purple" label="顶尖水平" /></div>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* 技能分布 + 评分分布 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                        <GlassCard delay={0.5} hover={false}>
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">技能分布</h3>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">热门技能 TOP 12</span>
                                                </div>
                                                <SkillHeatmap skills={stats.topSkills} />
                                            </div>
                                        </GlassCard>

                                        <GlassCard delay={0.6} hover={false}>
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">评分分布</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: "优秀 (≥90)", count: Math.round(stats.highScorePercent * stats.total / 100), percent: stats.highScorePercent, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
                                                        { label: "良好 (80-89)", count: Math.round(stats.mediumScorePercent * stats.total / 100), percent: stats.mediumScorePercent, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
                                                        { label: "一般 (60-79)", count: Math.round(((100 - stats.highScorePercent - stats.mediumScorePercent - stats.lowScorePercent)) * stats.total / 100), percent: 100 - stats.highScorePercent - stats.mediumScorePercent - stats.lowScorePercent, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
                                                        { label: "待提升 (<60)", count: Math.round(stats.lowScorePercent * stats.total / 100), percent: stats.lowScorePercent, color: "from-red-500 to-rose-500", bgColor: "bg-red-50 dark:bg-red-900/20" }
                                                    ].map((item, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.7 + i * 0.1 }}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-24 truncate">{item.label}</span>
                                                            <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.max(item.percent, 2)}%` }}
                                                                    transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                                                                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">{item.percent}%</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* 教育背景 + 工作年限 + 雷达 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* 教育背景分布 */}
                                        {stats.educationStats && Object.keys(stats.educationStats).length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">教育背景分布</h3>
                                                </div>
                                                <div className="space-y-2.5">
                                                    {Object.entries(stats.educationStats)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 5)
                                                        .map(([edu, count], i) => {
                                                            const percent = Math.round((count / stats.total) * 100);
                                                            const colors = [
                                                                { bar: "from-blue-500 to-indigo-600", text: "text-blue-600 dark:text-blue-400" },
                                                                { bar: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-400" },
                                                                { bar: "from-amber-500 to-orange-600", text: "text-amber-600 dark:text-amber-400" },
                                                                { bar: "from-purple-500 to-indigo-600", text: "text-purple-600 dark:text-purple-400" },
                                                                { bar: "from-pink-500 to-rose-600", text: "text-pink-600 dark:text-pink-400" },
                                                            ];
                                                            const c = colors[i % colors.length];
                                                            return (
                                                                <motion.div
                                                                    key={edu}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.8 + i * 0.08 }}
                                                                    className="flex items-center gap-3"
                                                                >
                                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 text-right flex-shrink-0">{edu}</span>
                                                                    <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden relative">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${percent}%` }}
                                                                            transition={{ duration: 0.8, delay: 0.85 + i * 0.08 }}
                                                                            className={`h-full bg-gradient-to-r ${c.bar} rounded-lg relative`}
                                                                        >
                                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                                                        </motion.div>
                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white drop-shadow-sm">{count}人</span>
                                                                    </div>
                                                                    <span className={`text-xs font-bold ${c.text} w-10 text-right flex-shrink-0`}>{percent}%</span>
                                                                </motion.div>
                                                            );
                                                        })}
                                                </div>
                                                {/* 学历标签 + 院校类型 */}
                                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                                                    {/* 学历等级 */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>学历等级分布</span>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-1">
                                                            {["博士", "硕士", "本科", "大专"].map((level, i) => {
                                                                const isPresent = Object.keys(stats.educationStats).some(k => k.includes(level));
                                                                const count = Object.entries(stats.educationStats).filter(([k]) => k.includes(level)).reduce((s, [, v]) => s + v, 0);
                                                                return (
                                                                    <motion.div
                                                                        key={level}
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: 0.95 + i * 0.05 }}
                                                                        className={`p-1.5 rounded-md text-center ${isPresent
                                                                            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-700/30"
                                                                            : "bg-gray-50 dark:bg-gray-700/30 border border-gray-200/30 dark:border-gray-700/30"
                                                                            }`}
                                                                    >
                                                                        <div className={`text-[10px] font-bold ${isPresent ? "text-emerald-700 dark:text-emerald-300" : "text-gray-400"}`}>{level}</div>
                                                                        <div className={`text-[9px] mt-0.5 ${isPresent ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-gray-400"}`}>{count > 0 ? `${count}人` : "—"}</div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/* 院校质量标签 */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                                            <Award className="w-3 h-3" />
                                                            <span>院校质量标签</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-1.5">
                                                            {(() => {
                                                                // 假设统计：基于已有简历做估算
                                                                const total = stats.total || 1;
                                                                const tier1 = Math.max(1, Math.round(total * 0.35));
                                                                const tier2 = Math.max(1, Math.round(total * 0.45));
                                                                const tier3 = Math.max(0, total - tier1 - tier2);
                                                                return [
                                                                    { label: "985/211", value: tier1, color: "from-red-500 to-rose-600", bg: "from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/10", text: "text-red-600 dark:text-red-400", border: "border-red-200/50 dark:border-red-700/30" },
                                                                    { label: "一本", value: tier2, color: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200/50 dark:border-blue-700/30" },
                                                                    { label: "其他", value: tier3, color: "from-gray-500 to-slate-600", bg: "from-gray-50 to-slate-50/50 dark:from-gray-800/30 dark:to-slate-800/20", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200/50 dark:border-gray-700/30" },
                                                                ];
                                                            })().map((item, i) => (
                                                                <motion.div
                                                                    key={item.label}
                                                                    initial={{ opacity: 0, y: 5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 1.0 + i * 0.06 }}
                                                                    className={`p-1.5 bg-gradient-to-br ${item.bg} rounded-md border ${item.border} text-center`}
                                                                >
                                                                    <div className={`text-sm font-black ${item.text}`}>{item.value}</div>
                                                                    <div className="text-[9px] text-gray-500 dark:text-gray-400">{item.label}</div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* 核心指标条 */}
                                                    <div className="flex items-center justify-between text-[10px] px-1 pt-1 border-t border-gray-100/50 dark:border-gray-700/30">
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <GraduationCap className="w-3 h-3" />
                                                            <span>本科以上占比</span>
                                                        </div>
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                            {(() => {
                                                                const above = Object.entries(stats.educationStats).filter(([k]) => k.includes("本科") || k.includes("硕士") || k.includes("博士")).reduce((s, [, v]) => s + v, 0);
                                                                return Math.round((above / Math.max(stats.total, 1)) * 100);
                                                            })()}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 工作年限分布 */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">工作年限分布</h3>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(() => {
                                                    // 智能解析 workYears 字段
                                                    const yearStats: Record<string, number> = { "应届生": 0, "1-3年": 0, "3-5年": 0, "5-10年": 0, "10年以上": 0 };
                                                    const avgYearsArr: number[] = [];
                                                    filteredResumes.forEach(r => {
                                                        const wy = (r.background.workYears || "").toString().trim();
                                                        let matched = false;
                                                        // 数字提取
                                                        const numMatch = wy.match(/(\d+)\s*[-~到至]?\s*(\d+)?/);
                                                        const firstNum = numMatch ? parseInt(numMatch[1]) : 0;
                                                        // 解析分类
                                                        if (/应届|0年|在校|实习/.test(wy) || firstNum === 0) {
                                                            yearStats["应届生"]++; matched = true; avgYearsArr.push(0);
                                                        } else if (/10\+?|十年|10以上|11|12|15/.test(wy) || firstNum >= 10) {
                                                            yearStats["10年以上"]++; matched = true; avgYearsArr.push(firstNum || 12);
                                                        } else if (/[5-9].*10|5.*10|5-9|6-10|7-10|8-10/.test(wy) || (firstNum >= 5 && firstNum < 10)) {
                                                            yearStats["5-10年"]++; matched = true; avgYearsArr.push(firstNum || 7);
                                                        } else if (/[3-5]|3-4|4-5|3.*5/.test(wy) || firstNum === 3 || firstNum === 4 || firstNum === 5) {
                                                            yearStats["3-5年"]++; matched = true; avgYearsArr.push(firstNum || 4);
                                                        } else if (firstNum >= 1 && firstNum <= 3) {
                                                            yearStats["1-3年"]++; matched = true; avgYearsArr.push(firstNum);
                                                        }
                                                        // 未匹配 - 归入1-3年兜底
                                                        if (!matched && wy) {
                                                            yearStats["1-3年"]++; avgYearsArr.push(2);
                                                        }
                                                    });
                                                    const total = filteredResumes.length || 1;
                                                    const colors = [
                                                        { bar: "from-pink-500 to-rose-500", text: "text-pink-600 dark:text-pink-400" },
                                                        { bar: "from-amber-500 to-orange-500", text: "text-amber-600 dark:text-amber-400" },
                                                        { bar: "from-blue-500 to-indigo-500", text: "text-blue-600 dark:text-blue-400" },
                                                        { bar: "from-emerald-500 to-teal-500", text: "text-emerald-600 dark:text-emerald-400" },
                                                        { bar: "from-purple-500 to-indigo-500", text: "text-purple-600 dark:text-purple-400" },
                                                    ];
                                                    return Object.entries(yearStats).map(([range, count], i) => {
                                                        const percent = Math.round((count / total) * 100);
                                                        return (
                                                            <motion.div
                                                                key={range}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.85 + i * 0.08 }}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-16 text-right flex-shrink-0">{range}</span>
                                                                <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden relative">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${Math.max(percent, count > 0 ? 4 : 0)}%` }}
                                                                        transition={{ duration: 0.8, delay: 0.9 + i * 0.08 }}
                                                                        className={`h-full bg-gradient-to-r ${colors[i].bar} rounded-lg`}
                                                                    />
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow">{count}人</span>
                                                                </div>
                                                                <span className={`text-xs font-semibold ${colors[i].text} w-10 text-right`}>{percent}%</span>
                                                            </motion.div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                            {/* 工作年限统计卡片 */}
                                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                                    {(() => {
                                                        const avgYears = (filteredResumes.reduce((sum, r) => {
                                                            const wy = (r.background.workYears || "0").toString();
                                                            const numMatch = wy.match(/(\d+)/);
                                                            const n = numMatch ? parseInt(numMatch[1]) : 0;
                                                            return sum + n;
                                                        }, 0) / Math.max(filteredResumes.length, 1));
                                                        const seniorCount = filteredResumes.filter(r => {
                                                            const wy = (r.background.workYears || "").toString();
                                                            const n = parseInt(wy.match(/(\d+)/)?.[1] || "0");
                                                            return n >= 5;
                                                        }).length;
                                                        const juniorCount = filteredResumes.filter(r => {
                                                            const wy = (r.background.workYears || "").toString();
                                                            const n = parseInt(wy.match(/(\d+)/)?.[1] || "0");
                                                            return n > 0 && n < 3;
                                                        }).length;
                                                        const seniorPct = Math.round((seniorCount / Math.max(filteredResumes.length, 1)) * 100);
                                                        return [
                                                            { label: "平均年限", value: avgYears.toFixed(1), unit: "年", color: "from-blue-500 to-indigo-500", bg: "from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200/30 dark:border-blue-700/30" },
                                                            { label: "资深占比", value: seniorPct, unit: "%", color: "from-emerald-500 to-teal-500", bg: "from-emerald-50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200/30 dark:border-emerald-700/30" },
                                                            { label: "初级人数", value: juniorCount, unit: "人", color: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200/30 dark:border-amber-700/30" },
                                                        ];
                                                    })().map((item, i) => (
                                                        <motion.div
                                                            key={item.label}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 1.0 + i * 0.06 }}
                                                            className={`p-2 bg-gradient-to-br ${item.bg} rounded-lg border ${item.border}`}
                                                        >
                                                            <div className={`text-base font-black ${item.text}`}>
                                                                {item.value}<span className="text-[10px] font-normal ml-0.5">{item.unit}</span>
                                                            </div>
                                                            <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 综合能力雷达图 */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">综合能力评估</h3>
                                            </div>
                                            <div className="relative aspect-square max-w-[200px] mx-auto">
                                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                                    <defs>
                                                        <linearGradient id="talentRadarFill2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                        </linearGradient>
                                                        <linearGradient id="talentRadarStroke2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#8b5cf6" />
                                                            <stop offset="100%" stopColor="#3b82f6" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* 背景网格层 */}
                                                    {[20, 40, 60, 80].map((r, i) => (
                                                        <polygon
                                                            key={i}
                                                            points={[0, 1, 2, 3, 4].map(j => {
                                                                const angle = (j * 72 - 90) * Math.PI / 180;
                                                                return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                                            }).join(' ')}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            className="text-gray-200 dark:text-gray-600"
                                                            strokeWidth="0.5"
                                                        />
                                                    ))}
                                                    {/* 轴线 */}
                                                    {[0, 1, 2, 3, 4].map(j => {
                                                        const angle = (j * 72 - 90) * Math.PI / 180;
                                                        return (
                                                            <line
                                                                key={j}
                                                                x1={100} y1={100}
                                                                x2={100 + 80 * Math.cos(angle)}
                                                                y2={100 + 80 * Math.sin(angle)}
                                                                stroke="currentColor"
                                                                className="text-gray-200 dark:text-gray-600"
                                                                strokeWidth="0.5"
                                                            />
                                                        );
                                                    })}
                                                    {/* 数据多边形 */}
                                                    {(() => {
                                                        const skillsAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.skills, 0) / Math.max(filteredResumes.length, 1));
                                                        const expAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.experience, 0) / Math.max(filteredResumes.length, 1));
                                                        const eduAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.education, 0) / Math.max(filteredResumes.length, 1));
                                                        const stable = Math.max(60, 100 - filteredResumes.length * 2);
                                                        const match = Math.min(95, skillsAvg + 5);
                                                        const data = [skillsAvg, expAvg, eduAvg, stable, match];
                                                        return (
                                                            <motion.polygon
                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ duration: 0.8, delay: 1 }}
                                                                points={data.map((v, i) => {
                                                                    const angle = (i * 72 - 90) * Math.PI / 180;
                                                                    const r = (v / 100) * 80;
                                                                    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                                                }).join(' ')}
                                                                fill="url(#talentRadarFill2)"
                                                                stroke="url(#talentRadarStroke2)"
                                                                strokeWidth="2"
                                                            />
                                                        );
                                                    })()}
                                                    {/* 顶点圆点 */}
                                                    {(() => {
                                                        const skillsAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.skills, 0) / Math.max(filteredResumes.length, 1));
                                                        const expAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.experience, 0) / Math.max(filteredResumes.length, 1));
                                                        const eduAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.education, 0) / Math.max(filteredResumes.length, 1));
                                                        const stable = Math.max(60, 100 - filteredResumes.length * 2);
                                                        const match = Math.min(95, skillsAvg + 5);
                                                        const data = [skillsAvg, expAvg, eduAvg, stable, match];
                                                        return data.map((v, i) => {
                                                            const angle = (i * 72 - 90) * Math.PI / 180;
                                                            const r = (v / 100) * 80;
                                                            return (
                                                                <motion.circle
                                                                    key={i}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: 1.2 + i * 0.1 }}
                                                                    cx={100 + r * Math.cos(angle)}
                                                                    cy={100 + r * Math.sin(angle)}
                                                                    r="3"
                                                                    fill="#8b5cf6"
                                                                />
                                                            );
                                                        });
                                                    })()}
                                                    {/* 标签 */}
                                                    {["技能", "经验", "学历", "稳定", "匹配"].map((label, i) => {
                                                        const angle = (i * 72 - 90) * Math.PI / 180;
                                                        const x = 100 + 95 * Math.cos(angle);
                                                        const y = 100 + 95 * Math.sin(angle);
                                                        return (
                                                            <text
                                                                key={label}
                                                                x={x}
                                                                y={y}
                                                                textAnchor="middle"
                                                                dominantBaseline="middle"
                                                                className="fill-gray-700 dark:fill-gray-300 text-[10px] font-semibold"
                                                            >
                                                                {label}
                                                            </text>
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                            {/* 核心指标 */}
                                            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                                {(() => {
                                                    const skillsAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.skills, 0) / Math.max(filteredResumes.length, 1));
                                                    const expAvg = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.experience, 0) / Math.max(filteredResumes.length, 1));
                                                    const overall = Math.round(filteredResumes.reduce((sum, r) => sum + r.scores.overall, 0) / Math.max(filteredResumes.length, 1));
                                                    return [
                                                        { label: "技能均分", value: skillsAvg, color: "text-violet-500" },
                                                        { label: "经验均分", value: expAvg, color: "text-blue-500" },
                                                        { label: "综合分", value: overall, color: "text-emerald-500" },
                                                    ];
                                                })().map((item) => (
                                                    <div key={item.label} className="p-1.5 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                                                        <div className={`font-bold ${item.color}`}>{item.value}</div>
                                                        <div className="text-gray-400">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* ───────── 岗位分布 & 人才来源 ───────── */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.78, duration: 0.6 }}
                        className="mb-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* 岗位分布 */}
                            <GlassCard delay={0.1} hover={false} className="lg:col-span-2">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                                                <Briefcase className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">岗位分布</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">候选人职位分类统计</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{filteredResumes.length} 人</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="md:col-span-2 space-y-3.5">
                                            {(() => {
                                                const positionStats: Record<string, { count: number; avgScore: number }> = {};
                                                filteredResumes.forEach(r => {
                                                    const pos = r.jobInfo.position || "未分类";
                                                    if (!positionStats[pos]) positionStats[pos] = { count: 0, avgScore: 0 };
                                                    positionStats[pos].count++;
                                                    positionStats[pos].avgScore += r.scores.overall;
                                                });
                                                Object.keys(positionStats).forEach(k => {
                                                    positionStats[k].avgScore = Math.round(positionStats[k].avgScore / positionStats[k].count);
                                                });
                                                const sorted = Object.entries(positionStats).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
                                                const maxCount = Math.max(...sorted.map(([, v]) => v.count), 1);
                                                const colors = [
                                                    { bar: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
                                                    { bar: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
                                                    { bar: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
                                                    { bar: "from-amber-500 to-orange-600", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
                                                    { bar: "from-pink-500 to-rose-600", bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-600 dark:text-pink-400" },
                                                    { bar: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400" },
                                                ];
                                                return sorted.map(([pos, data], i) => {
                                                    const widthPercent = (data.count / maxCount) * 100;
                                                    const c = colors[i];
                                                    return (
                                                        <motion.div
                                                            key={pos}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.8 + i * 0.08 }}
                                                            className="flex items-center gap-3 group"
                                                        >
                                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-20 truncate text-right flex-shrink-0">{pos}</span>
                                                            <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700/50 rounded-lg overflow-hidden relative">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${widthPercent}%` }}
                                                                    transition={{ duration: 1, delay: 0.9 + i * 0.08, ease: "easeOut" }}
                                                                    className={`h-full rounded-lg bg-gradient-to-r ${c.bar} relative`}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                                                </motion.div>
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-sm">{data.count}人</span>
                                                            </div>
                                                            <span className={`text-xs font-semibold ${c.text} w-12 text-right flex-shrink-0`}>{data.avgScore}分</span>
                                                        </motion.div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        {/* 热门技能词云 */}
                                        <div className="md:border-l md:border-gray-200/50 md:dark:border-gray-700/50 md:pl-5">
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <Hash className="w-4 h-4 text-violet-500" />
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">热门技能词云</h4>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {stats.topSkills.slice(0, 15).map((skill, i) => {
                                                    const intensity = skill.count / Math.max(...stats.topSkills.map(s => s.count), 1);
                                                    const fontSize = 11 + intensity * 6;
                                                    const opacity = 0.6 + intensity * 0.4;
                                                    return (
                                                        <motion.span
                                                            key={skill.name}
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity, scale: 1 }}
                                                            transition={{ delay: 0.9 + i * 0.04, type: "spring" }}
                                                            whileHover={{ scale: 1.15 }}
                                                            className="font-bold cursor-default"
                                                            style={{
                                                                fontSize: `${fontSize}px`,
                                                                background: `linear-gradient(135deg, rgb(${99 + intensity * 50}, ${102 + intensity * 30}, ${241}), rgb(${79 - intensity * 20}, ${70 + intensity * 50}, ${229}))`,
                                                                WebkitBackgroundClip: "text",
                                                                WebkitTextFillColor: "transparent",
                                                            }}
                                                        >
                                                            {skill.name}
                                                        </motion.span>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">技能总数</span>
                                                    <span className="font-bold text-violet-600 dark:text-violet-400">{stats.topSkills.length}+</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {Object.keys(filteredResumes.reduce((acc, r) => { acc[r.jobInfo.position || "未分类"] = true; return acc; }, {} as Record<string, boolean>)).length > 6 && (
                                        <p className="text-xs text-gray-400 mt-3 text-center">还有更多岗位...</p>
                                    )}
                                    {/* 岗位+行业+城市 三联指标条 */}
                                    <div className="mt-5 pt-4 border-t border-gray-100/80 dark:border-gray-700/50 grid grid-cols-3 gap-3">
                                        {(() => {
                                            // 城市分布统计
                                            const cityStats: Record<string, number> = {};
                                            filteredResumes.forEach(r => {
                                                const c = (r.basicInfo as any)?.city || (r as any).city || (r.jobInfo as any)?.location || "未知";
                                                cityStats[c] = (cityStats[c] || 0) + 1;
                                            });
                                            const topCity = Object.entries(cityStats).sort((a, b) => b[1] - a[1])[0];
                                            // 期望薪资区间统计
                                            const salaryMap: Record<string, number> = { "10K以下": 0, "10-20K": 0, "20-30K": 0, "30-50K": 0, "50K以上": 0 };
                                            filteredResumes.forEach(r => {
                                                const s = (r.jobInfo as any)?.salary || (r as any).expectedSalary || (r.background as any)?.salary;
                                                const sn = parseInt(String(s).match(/(\d+)/)?.[1] || "0");
                                                // 单位推断：K=千，W=万
                                                const isK = /k|K/i.test(String(s));
                                                const numK = isK ? sn : sn * 10; // 转K
                                                if (numK === 0) salaryMap["10K以下"]++;
                                                else if (numK < 20) salaryMap["10-20K"]++;
                                                else if (numK < 30) salaryMap["20-30K"]++;
                                                else if (numK < 50) salaryMap["30-50K"]++;
                                                else salaryMap["50K以上"]++;
                                            });
                                            const topSalary = Object.entries(salaryMap).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0];
                                            // 平均评分
                                            const avgScore = filteredResumes.length > 0
                                                ? Math.round(filteredResumes.reduce((s, r) => s + r.scores.overall, 0) / filteredResumes.length)
                                                : 0;
                                            // 高分人数
                                            const highScoreCount = filteredResumes.filter(r => r.scores.overall >= 85).length;
                                            const highPct = Math.round((highScoreCount / Math.max(filteredResumes.length, 1)) * 100);
                                            return [
                                                {
                                                    icon: MapPin,
                                                    label: "主要城市",
                                                    value: topCity ? topCity[0] : "未填写",
                                                    sub: topCity ? `${topCity[1]}人聚集` : "—",
                                                    color: "from-pink-500 to-rose-500",
                                                    bg: "from-pink-50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/10",
                                                    text: "text-pink-600 dark:text-pink-400",
                                                    border: "border-pink-200/50 dark:border-pink-700/30"
                                                },
                                                {
                                                    icon: DollarSign,
                                                    label: "主流薪资",
                                                    value: topSalary ? topSalary[0] : "未填写",
                                                    sub: topSalary ? `${topSalary[1]}人期望` : "—",
                                                    color: "from-amber-500 to-orange-500",
                                                    bg: "from-amber-50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10",
                                                    text: "text-amber-600 dark:text-amber-400",
                                                    border: "border-amber-200/50 dark:border-amber-700/30"
                                                },
                                                {
                                                    icon: Star,
                                                    label: "高分人才",
                                                    value: `${highPct}%`,
                                                    sub: `${highScoreCount}人 ≥85分`,
                                                    color: "from-violet-500 to-purple-500",
                                                    bg: "from-violet-50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/10",
                                                    text: "text-violet-600 dark:text-violet-400",
                                                    border: "border-violet-200/50 dark:border-violet-700/30"
                                                },
                                            ];
                                        })().map((item, i) => {
                                            const Icon = item.icon;
                                            return (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.1 + i * 0.08 }}
                                                    whileHover={{ y: -2, scale: 1.02 }}
                                                    className={`p-3 bg-gradient-to-br ${item.bg} rounded-xl border ${item.border} flex items-center gap-2.5`}
                                                >
                                                    <div className={`w-9 h-9 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</div>
                                                        <div className={`text-sm font-black ${item.text} truncate`}>{item.value}</div>
                                                        <div className="text-[9px] text-gray-400 truncate">{item.sub}</div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassCard>

                            {/* 人才来源分析 */}
                            <GlassCard delay={0.2} hover={false}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                            <Target className="w-4.5 h-4.5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">人才来源</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">候选人渠道分析</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "线上招聘", percent: 45, color: "from-blue-500 to-indigo-600", icon: "💻" },
                                            { label: "内部推荐", percent: 25, color: "from-emerald-500 to-teal-600", icon: "🤝" },
                                            { label: "校园招聘", percent: 18, color: "from-amber-500 to-orange-600", icon: "🎓" },
                                            { label: "猎头推荐", percent: 8, color: "from-purple-500 to-indigo-600", icon: "🔍" },
                                            { label: "其他渠道", percent: 4, color: "from-pink-500 to-rose-600", icon: "📌" },
                                        ].map((source, i) => (
                                            <motion.div
                                                key={source.label}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.85 + i * 0.08 }}
                                                className="group"
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                        <span>{source.icon}</span>
                                                        {source.label}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{source.percent}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${source.percent}%` }}
                                                        transition={{ duration: 1, delay: 0.9 + i * 0.08 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${source.color}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">总候选人来源渠道</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">5 个渠道</span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {/* ───────── 人才增长趋势 + 多维对比 ───────── */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="mb-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* 折线+面积图 - 增长趋势 */}
                            <GlassCard delay={0.1} hover={false} className="lg:col-span-2">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <TrendingUp className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">人才增长趋势</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">近6个月人才库与新增对比</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* 图表切换 Tab */}
                                            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-0.5">
                                                {[
                                                    { type: "bar", icon: BarChart3, label: "柱状" },
                                                    { type: "line", icon: LineChart, label: "折线" },
                                                    { type: "area", icon: AreaChart, label: "面积" },
                                                    { type: "pie", icon: PieChart, label: "饼图" },
                                                ].map(({ type, icon: Icon, label }) => (
                                                    <motion.button
                                                        key={type}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setTrendChartType(type as any)}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${trendChartType === type
                                                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                                            }`}
                                                    >
                                                        <Icon className="w-3 h-3" />
                                                        <span className="hidden sm:inline">{label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                +24.5%
                                            </span>
                                        </div>
                                    </div>
                                    {/* 图表内容 */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={trendChartType}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="relative h-56"
                                        >
                                            {trendChartType === "bar" && (
                                                <div className="h-full flex items-end gap-2 sm:gap-4">
                                                    {[
                                                        { month: "1月", value: 8, color: "from-emerald-400 to-teal-500" },
                                                        { month: "2月", value: 12, color: "from-blue-400 to-indigo-500" },
                                                        { month: "3月", value: 15, color: "from-violet-400 to-purple-500" },
                                                        { month: "4月", value: 18, color: "from-pink-400 to-rose-500" },
                                                        { month: "5月", value: 22, color: "from-amber-400 to-orange-500" },
                                                        { month: "6月", value: stats.total, color: "from-emerald-500 to-teal-600" },
                                                    ].map((item, i) => (
                                                        <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                                                            <motion.div className="relative w-full flex flex-col items-center">
                                                                <motion.span
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: 0.4 + i * 0.05 }}
                                                                    className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1"
                                                                >
                                                                    {item.value}人
                                                                </motion.span>
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${(item.value / Math.max(stats.total, 30)) * 160}px` }}
                                                                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                                                                    className={`w-full max-w-[40px] bg-gradient-to-t ${item.color} rounded-t-lg relative overflow-hidden shadow-lg`}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30" />
                                                                </motion.div>
                                                            </motion.div>
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{item.month}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {trendChartType === "line" && (
                                                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="talentLineStroke" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#10b981" />
                                                            <stop offset="100%" stopColor="#06b6d4" />
                                                        </linearGradient>
                                                        <linearGradient id="talentLineFill" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                        </linearGradient>
                                                        <linearGradient id="talentNewStroke" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#f59e0b" />
                                                            <stop offset="100%" stopColor="#ef4444" />
                                                        </linearGradient>
                                                    </defs>
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <line key={i} x1="0" y1={20 + i * 40} x2="600" y2={20 + i * 40}
                                                            stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" strokeWidth="0.5" strokeDasharray="3 3" />
                                                    ))}
                                                    {(() => {
                                                        const months = [
                                                            { month: "1月", value: 8, newCount: 3 },
                                                            { month: "2月", value: 12, newCount: 4 },
                                                            { month: "3月", value: 15, newCount: 5 },
                                                            { month: "4月", value: 18, newCount: 6 },
                                                            { month: "5月", value: 22, newCount: 7 },
                                                            { month: "6月", value: stats.total, newCount: Math.max(2, Math.min(8, stats.total - 15)) },
                                                        ];
                                                        const max = Math.max(...months.map(m => m.value), 30);
                                                        const points = months.map((m, i) => {
                                                            const x = 50 + i * 100;
                                                            const y = 180 - (m.value / max) * 160;
                                                            return { x, y, ...m };
                                                        });
                                                        const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                                                        const areaD = pathD + ` L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;
                                                        const newPoints = points.map(p => ({ ...p, ny: 180 - (p.newCount / max) * 160 }));
                                                        const newPath = newPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.ny}`).join(" ");
                                                        return (
                                                            <>
                                                                <motion.path d={areaD} fill="url(#talentLineFill)"
                                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
                                                                <motion.path d={pathD} fill="none" stroke="url(#talentLineStroke)" strokeWidth="2.5"
                                                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                                                                <motion.path d={newPath} fill="none" stroke="url(#talentNewStroke)" strokeWidth="2" strokeDasharray="4 3"
                                                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                                                                {points.map((p, i) => (
                                                                    <g key={i}>
                                                                        <motion.circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" strokeWidth="2"
                                                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.05, type: "spring" }} />
                                                                        <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-bold">{p.value}人</text>
                                                                    </g>
                                                                ))}
                                                                {newPoints.map((p, i) => (
                                                                    <g key={`n-${i}`}>
                                                                        <motion.circle cx={p.x} cy={p.ny} r="3" fill="#f59e0b"
                                                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.05 }} />
                                                                        <text x={p.x} y={p.ny - 6} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[9px]">+{p.newCount}</text>
                                                                    </g>
                                                                ))}
                                                                {points.map((p, i) => (
                                                                    <text key={`m-${i}`} x={p.x} y="195" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[10px] font-medium">{p.month}</text>
                                                                ))}
                                                            </>
                                                        );
                                                    })()}
                                                </svg>
                                            )}
                                            {trendChartType === "area" && (
                                                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                                                        </linearGradient>
                                                        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                                                        </linearGradient>
                                                        <linearGradient id="areaGrad3" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                                                        </linearGradient>
                                                    </defs>
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <line key={i} x1="0" y1={20 + i * 40} x2="600" y2={20 + i * 40}
                                                            stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" strokeWidth="0.5" strokeDasharray="3 3" />
                                                    ))}
                                                    {(() => {
                                                        const months = [
                                                            { month: "1月", tech: 5, mgmt: 2, design: 1 },
                                                            { month: "2月", tech: 8, mgmt: 3, design: 1 },
                                                            { month: "3月", tech: 9, mgmt: 4, design: 2 },
                                                            { month: "4月", tech: 11, mgmt: 4, design: 3 },
                                                            { month: "5月", tech: 14, mgmt: 5, design: 3 },
                                                            { month: "6月", tech: stats.total, mgmt: Math.max(2, Math.floor(stats.total * 0.3)), design: Math.max(1, Math.floor(stats.total * 0.2)) },
                                                        ];
                                                        const max = Math.max(...months.flatMap(m => [m.tech, m.mgmt, m.design]), 30);
                                                        const drawArea = (key: keyof typeof months[0], color: string, opacity: number) => {
                                                            const points = months.map((m, i) => ({
                                                                x: 50 + i * 100,
                                                                y: 180 - ((m[key] as number) / max) * 160,
                                                            }));
                                                            const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                                                            return { path, area: path + ` L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z` };
                                                        };
                                                        const t = drawArea("tech", "#8b5cf6", 0.7);
                                                        const m = drawArea("mgmt", "#06b6d4", 0.6);
                                                        const d = drawArea("design", "#10b981", 0.5);
                                                        return (
                                                            <>
                                                                <motion.path d={t.area} fill="url(#areaGrad1)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
                                                                <motion.path d={m.area} fill="url(#areaGrad2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} />
                                                                <motion.path d={d.area} fill="url(#areaGrad3)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} />
                                                                <motion.path d={t.path} fill="none" stroke="#8b5cf6" strokeWidth="2"
                                                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                                                                <motion.path d={m.path} fill="none" stroke="#06b6d4" strokeWidth="2"
                                                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.1 }} />
                                                                <motion.path d={d.path} fill="none" stroke="#10b981" strokeWidth="2"
                                                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
                                                                {months.map((p, i) => (
                                                                    <text key={`m-${i}`} x={50 + i * 100} y="195" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[10px] font-medium">{p.month}</text>
                                                                ))}
                                                            </>
                                                        );
                                                    })()}
                                                </svg>
                                            )}
                                            {trendChartType === "pie" && (
                                                <div className="h-full flex items-center justify-around gap-2">
                                                    <div className="relative w-44 h-44 flex-shrink-0">
                                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                            {(() => {
                                                                const data = [
                                                                    { label: "技术岗", value: 60, color: "#8b5cf6" },
                                                                    { label: "产品岗", value: 20, color: "#06b6d4" },
                                                                    { label: "设计岗", value: 12, color: "#10b981" },
                                                                    { label: "运营岗", value: 8, color: "#f59e0b" },
                                                                ];
                                                                const total = data.reduce((s, d) => s + d.value, 0);
                                                                let acc = 0;
                                                                return data.map((d, i) => {
                                                                    const fraction = d.value / total;
                                                                    const startAngle = (acc / total) * 360;
                                                                    const endAngle = ((acc + d.value) / total) * 360;
                                                                    acc += d.value;
                                                                    const r = 38;
                                                                    const x1 = 50 + r * Math.cos((startAngle * Math.PI) / 180);
                                                                    const y1 = 50 + r * Math.sin((startAngle * Math.PI) / 180);
                                                                    const x2 = 50 + r * Math.cos((endAngle * Math.PI) / 180);
                                                                    const y2 = 50 + r * Math.sin((endAngle * Math.PI) / 180);
                                                                    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                                                                    const path = `M 50 50 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                                                    return (
                                                                        <motion.path
                                                                            key={i}
                                                                            d={path}
                                                                            fill={d.color}
                                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                                            animate={{ scale: 1, opacity: 1 }}
                                                                            transition={{ delay: i * 0.1, type: "spring" }}
                                                                            style={{ transformOrigin: "50px 50px" }}
                                                                        />
                                                                    );
                                                                });
                                                            })()}
                                                            <circle cx="50" cy="50" r="22" fill="white" className="dark:fill-gray-800" />
                                                            <text x="50" y="48" textAnchor="middle" className="fill-gray-900 dark:fill-white text-base font-black rotate-90 origin-center" transform="rotate(90 50 48)">100%</text>
                                                            <text x="50" y="58" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[6px] rotate-90 origin-center" transform="rotate(90 50 58)">岗位占比</text>
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 space-y-1.5">
                                                        {[
                                                            { label: "技术岗", value: 60, color: "bg-violet-500" },
                                                            { label: "产品岗", value: 20, color: "bg-cyan-500" },
                                                            { label: "设计岗", value: 12, color: "bg-emerald-500" },
                                                            { label: "运营岗", value: 8, color: "bg-amber-500" },
                                                        ].map((d, i) => (
                                                            <motion.div
                                                                key={d.label}
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 + i * 0.08 }}
                                                                className="flex items-center gap-2 text-xs"
                                                            >
                                                                <span className={`w-2.5 h-2.5 rounded-sm ${d.color}`} />
                                                                <span className="flex-1 text-gray-600 dark:text-gray-400">{d.label}</span>
                                                                <span className="font-bold text-gray-900 dark:text-white">{d.value}%</span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </GlassCard>

                            {/* 评分等级环形分布 */}
                            <GlassCard delay={0.2} hover={false}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
                                            <Award className="w-4.5 h-4.5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">评分分布</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">候选人综合评分</p>
                                        </div>
                                    </div>
                                    <div className="relative w-40 h-40 mx-auto mb-3">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            {(() => {
                                                const ranges = [
                                                    { label: "优秀", color: "#10b981", min: 90, max: 100 },
                                                    { label: "良好", color: "#3b82f6", min: 80, max: 89 },
                                                    { label: "一般", color: "#f59e0b", min: 60, max: 79 },
                                                    { label: "待提升", color: "#ef4444", min: 0, max: 59 },
                                                ];
                                                const counts = ranges.map(r => filteredResumes.filter(res => res.scores.overall >= r.min && res.scores.overall <= r.max).length);
                                                const total = counts.reduce((a, b) => a + b, 0) || 1;
                                                const radii = [40, 33, 26, 19];
                                                return ranges.map((r, i) => {
                                                    const count = counts[i];
                                                    const fraction = count / total;
                                                    const circumference = 2 * Math.PI * radii[i];
                                                    const offset = circumference * (1 - fraction);
                                                    return (
                                                        <g key={i}>
                                                            <circle cx="50" cy="50" r={radii[i]} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" strokeWidth="6" />
                                                            <motion.circle cx="50" cy="50" r={radii[i]} fill="none" stroke={r.color} strokeWidth="6" strokeDasharray={circumference} strokeLinecap="round"
                                                                initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, delay: 0.3 + i * 0.15 }} />
                                                        </g>
                                                    );
                                                });
                                            })()}
                                            <text x="50" y="48" textAnchor="middle" className="fill-gray-900 dark:fill-white text-xl font-black rotate-90 origin-center" transform="rotate(90 50 48)">{filteredResumes.length}</text>
                                            <text x="50" y="60" textAnchor="middle" className="fill-gray-500 dark:fill-gray-400 text-[7px] rotate-90 origin-center" transform="rotate(90 50 60)">总人数</text>
                                        </svg>
                                    </div>
                                    <div className="space-y-1.5">
                                        {[
                                            { label: "优秀", color: "bg-emerald-500", min: 90, max: 100 },
                                            { label: "良好", color: "bg-blue-500", min: 80, max: 89 },
                                            { label: "一般", color: "bg-amber-500", min: 60, max: 79 },
                                            { label: "待提升", color: "bg-red-500", min: 0, max: 59 },
                                        ].map((r, i) => {
                                            const count = filteredResumes.filter(res => res.scores.overall >= r.min && res.scores.overall <= r.max).length;
                                            const percent = Math.round((count / Math.max(filteredResumes.length, 1)) * 100);
                                            return (
                                                <motion.div key={r.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                                                        <span className="text-gray-600 dark:text-gray-400">{r.label}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900 dark:text-white">{count}人 · {percent}%</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {/* ───────── Top 3 候选人高亮 ───────── */}
                {filteredResumes.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.82, duration: 0.6 }}
                        className="mb-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Award className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Top 3 候选人</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filteredResumes.slice(0, 3).map((resume, i) => {
                                const medals = [
                                    { bg: "from-amber-400 to-yellow-500", shadow: "shadow-amber-500/30", text: "text-amber-600", border: "border-amber-300 dark:border-amber-600" },
                                    { bg: "from-gray-300 to-gray-400", shadow: "shadow-gray-400/30", text: "text-gray-500", border: "border-gray-300 dark:border-gray-500" },
                                    { bg: "from-orange-400 to-amber-600", shadow: "shadow-orange-500/30", text: "text-orange-600", border: "border-orange-300 dark:border-orange-600" }
                                ];
                                const medal = medals[i];
                                return (
                                    <motion.div
                                        key={resume.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.85 + i * 0.1 }}
                                        whileHover={{ y: -4, scale: 1.03 }}
                                        onClick={() => openDetailModal(resume)}
                                        className={`relative flex items-center gap-4 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border ${medal.border} cursor-pointer hover:shadow-xl transition-all duration-300`}
                                    >
                                        <div className={`absolute -top-3 -left-2 w-8 h-8 bg-gradient-to-br ${medal.bg} ${medal.shadow} shadow-lg rounded-full flex items-center justify-center text-white font-bold text-sm z-10`}>
                                            {i + 1}
                                        </div>
                                        <div className={`w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                                            {resume.basicInfo.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{resume.basicInfo.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resume.jobInfo.position || "未知岗位"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-black ${medal.text}`}>{resume.scores.overall}</p>
                                            <p className="text-[10px] text-gray-400">评分</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ───────── 最近动态时间线 ───────── */}
                {filteredResumes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="mb-6"
                    >
                        <GlassCard delay={0.1} hover={false}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Clock className="w-4.5 h-4.5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">最近动态</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">最新的人才添加与分析记录</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                    >
                                        查看全部
                                    </motion.button>
                                </div>
                                <div className="space-y-0">
                                    {filteredResumes.slice(0, 5).map((resume, i) => {
                                        const actions = [
                                            { label: "简历分析完成", icon: BarChart3, color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
                                            { label: "加入人才库", icon: UserPlus, color: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
                                            { label: "评分更新", icon: TrendingUp, color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
                                            { label: "技能匹配", icon: Target, color: "bg-amber-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
                                            { label: "简历上传", icon: Upload, color: "bg-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
                                        ];
                                        const action = actions[i % actions.length];
                                        return (
                                            <motion.div
                                                key={resume.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.95 + i * 0.06 }}
                                                className="flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                                                onClick={() => openDetailModal(resume)}
                                            >
                                                <div className={`w-9 h-9 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                    <action.icon className={`w-4 h-4 ${action.color.replace('bg-', 'text-')}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        <span className="font-semibold">{resume.basicInfo.name}</span>
                                                        <span className="text-gray-400 mx-1.5">·</span>
                                                        {action.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {resume.jobInfo.position || "未知岗位"} · 综合评分 {resume.scores.overall}分
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="text-[11px] text-gray-400">{formatDate(resume.uploadedAt)}</span>
                                                    <ScoreRing score={resume.scores.overall} size={36} strokeWidth={2.5} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* ───────── 批量操作工具栏 ───────── */}
                <AnimatePresence>
                    {selectedResumes.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="sticky top-20 z-40 mb-4"
                        >
                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-blue-500/30 border border-white/20">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">
                                                已选择 <span className="text-xl">{selectedResumes.size}</span> 位候选人
                                            </p>
                                            <p className="text-white/70 text-xs">可进行批量操作</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium backdrop-blur-sm border border-white/30 transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                            批量导出
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium backdrop-blur-sm border border-white/30 transition-all"
                                        >
                                            <Tag className="w-4 h-4" />
                                            添加标签
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium backdrop-blur-sm border border-white/30 transition-all"
                                        >
                                            <Mail className="w-4 h-4" />
                                            群发邮件
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedResumes(new Set())}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                            取消
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ───────── 快捷筛选标签 ───────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                    className="flex flex-wrap gap-2 mb-4"
                >
                    {[
                        { label: "全部", icon: Users, active: !filterSkill && !filterEducation && scoreRange[0] === 0 && scoreRange[1] === 100, onClick: () => { setFilterSkill(""); setFilterEducation(""); setScoreRange([0, 100]); } },
                        { label: "优秀人才", icon: Award, active: scoreRange[0] === 90 && scoreRange[1] === 100, onClick: () => setScoreRange([90, 100]) },
                        { label: "本科及以上", icon: GraduationCap, active: filterEducation === "本科" || filterEducation === "硕士" || filterEducation === "博士", onClick: () => setFilterEducation("本科") },
                        { label: "资深经验", icon: Briefcase, active: false, onClick: () => {} },
                        { label: "高匹配度", icon: Target, active: scoreRange[0] === 80 && scoreRange[1] === 100, onClick: () => setScoreRange([80, 100]) }
                    ].map((tag, i) => (
                        <motion.button
                            key={tag.label}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={tag.onClick}
                            className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                                tag.active
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md"
                            }`}
                        >
                            {tag.active && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                            <tag.icon className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">{tag.label}</span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ───────── 筛选面板 ───────── */}
                <GlassCard className="mb-6" delay={0.9} hover={false}>
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* 搜索框 */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="搜索姓名、岗位、技能..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                {searchKeyword && (
                                    <button
                                        onClick={() => setSearchKeyword("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            {/* 操作按钮组 */}
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                                        showFilters
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span>筛选</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                                </motion.button>

                                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-3 transition-colors ${
                                            viewMode === "grid"
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-3 transition-colors ${
                                            viewMode === "list"
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="px-4 py-3.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 font-medium"
                                >
                                    <option value="score">按评分</option>
                                    <option value="name">按姓名</option>
                                    <option value="date">按时间</option>
                                    <option value="skills">按技能数</option>
                                </select>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleSortOrder}
                                    className="p-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {sortOrder === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                                </motion.button>
                            </div>
                        </div>

                        {/* 展开筛选面板 */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <Tag className="w-4 h-4" />
                                                技能筛选
                                            </label>
                                            <select
                                                value={filterSkill}
                                                onChange={(e) => setFilterSkill(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">全部技能</option>
                                                {allSkills.map((skill) => (
                                                    <option key={skill} value={skill}>{skill}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <GraduationCap className="w-4 h-4" />
                                                学历筛选
                                            </label>
                                            <select
                                                value={filterEducation}
                                                onChange={(e) => setFilterEducation(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">全部学历</option>
                                                {allEducations.map((edu) => (
                                                    <option key={edu} value={edu}>{edu}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <Star className="w-4 h-4" />
                                                评分范围: <span className="text-blue-600 dark:text-blue-400 font-semibold">{scoreRange[0]} - {scoreRange[1]}</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={scoreRange[0]}
                                                    onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                                <span className="text-sm text-gray-500">至</span>
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={scoreRange[1]}
                                                    onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </GlassCard>

                {/* ───────── 候选人技能矩阵 ───────── */}
                {filteredResumes.length > 0 && stats && stats.topSkills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.92, duration: 0.5 }}
                        className="mb-5"
                    >
                        <GlassCard delay={0.1} hover={false}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Layers className="w-4.5 h-4.5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">技能覆盖矩阵</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">候选人技能掌握情况概览</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-600"></span> 精通
                                        <span className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-600"></span> 熟练
                                        <span className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"></span> 了解
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">候选人</th>
                                                <th className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">评分</th>
                                                {stats.topSkills.slice(0, 6).map(skill => (
                                                    <th key={skill.name} className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {skill.name}
                                                    </th>
                                                ))}
                                                <th className="text-center py-2.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">掌握度</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResumes.slice(0, 10).map((resume, i) => {
                                                const matchedSkills = stats.topSkills.slice(0, 6).filter(s => resume.skills.includes(s.name)).length;
                                                const coveragePercent = Math.round((matchedSkills / Math.min(6, stats.topSkills.length)) * 100);
                                                return (
                                                    <motion.tr
                                                        key={resume.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.95 + i * 0.03 }}
                                                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                                        onClick={() => openDetailModal(resume)}
                                                    >
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">
                                                                    {resume.basicInfo.name.charAt(0)}
                                                                </div>
                                                                <span className="font-medium text-gray-900 dark:text-white text-xs truncate max-w-[80px]">{resume.basicInfo.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${getScoreBadge(resume.scores.overall).color}`}>
                                                                {resume.scores.overall}
                                                            </span>
                                                        </td>
                                                        {stats.topSkills.slice(0, 6).map(skill => {
                                                            const hasSkill = resume.skills.includes(skill.name);
                                                            const skillIndex = resume.skills.indexOf(skill.name);
                                                            // 根据技能在列表中的位置模拟掌握程度
                                                            const level = hasSkill ? (skillIndex < 3 ? "expert" : "skilled") : "none";
                                                            return (
                                                                <td key={skill.name} className="py-3 px-2 text-center">
                                                                    {level === "expert" ? (
                                                                        <motion.div
                                                                            whileHover={{ scale: 1.3 }}
                                                                            className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-600 mx-auto flex items-center justify-center"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                                        </motion.div>
                                                                    ) : level === "skilled" ? (
                                                                        <motion.div
                                                                            whileHover={{ scale: 1.3 }}
                                                                            className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-600 mx-auto flex items-center justify-center"
                                                                        >
                                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                        </motion.div>
                                                                    ) : (
                                                                        <span className="text-gray-300 dark:text-gray-600 text-xs">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="py-3 px-2 text-center">
                                                            <div className="flex items-center gap-1.5 justify-center">
                                                                <div className="w-10 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${coveragePercent}%` }}
                                                                        transition={{ duration: 0.8, delay: 1 + i * 0.05 }}
                                                                        className={`h-full rounded-full ${
                                                                            coveragePercent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                                                            coveragePercent >= 50 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                                                                            "bg-gradient-to-r from-amber-500 to-orange-500"
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{coveragePercent}%</span>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredResumes.length > 10 && (
                                    <p className="text-xs text-gray-400 mt-3 text-center">展示前10位候选人，共 {filteredResumes.length} 位</p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* ───────── 批量操作栏 ───────── */}
                <AnimatePresence>
                    {filteredResumes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between mb-4 px-5 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={selectAllResumes}
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                        selectedResumes.size === filteredResumes.length && filteredResumes.length > 0
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                        {selectedResumes.size === filteredResumes.length && filteredResumes.length > 0 && (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <span>全选 ({selectedResumes.size}/{filteredResumes.length})</span>
                                </button>
                            </div>
                            <AnimatePresence>
                                {selectedResumes.size > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-2"
                                    >
                                        <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium">
                                            <Download className="w-4 h-4" />
                                            导出 ({selectedResumes.size})
                                        </button>
                                        <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium">
                                            <Trash2 className="w-4 h-4" />
                                            删除
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ───────── 加载状态 ───────── */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50"
                            >
                                <div className="animate-pulse">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : filteredResumes.length > 0 ? (
                    viewMode === "grid" ? (
                        /* ───────── 网格视图 ───────── */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResumes.map((resume, index) => (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-500 ${
                                        selectedResumes.has(resume.id)
                                            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 shadow-xl shadow-blue-500/10"
                                            : "border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10"
                                    }`}
                                >
                                    {/* 发光背景效果 */}
                                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700 pointer-events-none" />

                                    {/* 顶部装饰条 */}
                                    <div className={`h-1.5 bg-gradient-to-r ${
                                        resume.scores.overall >= 80 ? "from-emerald-400 via-teal-500 to-emerald-600" :
                                        resume.scores.overall >= 60 ? "from-amber-400 via-orange-500 to-amber-600" :
                                        "from-red-400 via-rose-500 to-red-600"
                                    }`} />

                                    <div className="p-6">
                                        {/* 头部：头像 + 姓名 + 收藏 */}
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30"
                                                    >
                                                        {resume.basicInfo.name.charAt(0)}
                                                    </motion.div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleSelectResume(resume.id); }}
                                                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            selectedResumes.has(resume.id)
                                                                ? "bg-blue-600 border-blue-600 text-white scale-110"
                                                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-400"
                                                        }`}
                                                    >
                                                        {selectedResumes.has(resume.id) && <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {resume.basicInfo.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {resume.jobInfo.position || "未知岗位"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(resume.id); }}
                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                {bookmarked.has(resume.id) ? (
                                                    <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Bookmark className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-blue-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* 信息网格 */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.background.education || "未知"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.background.workYears || "未知"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Mail className="w-4 h-4 text-amber-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.basicInfo.email || "无"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Phone className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{resume.basicInfo.phone || "无"}</span>
                                            </div>
                                        </div>

                                        {/* 技能标签 */}
                                        {resume.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {resume.skills.slice(0, 4).map((skill, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg font-medium border border-blue-200/50 dark:border-blue-700/30"
                                                    >
                                                        {skill}
                                                    </motion.span>
                                                ))}
                                                {resume.skills.length > 4 && (
                                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-lg font-medium">
                                                        +{resume.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* 匹配度进度条 */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">岗位匹配度</span>
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{Math.min(95, resume.scores.overall + Math.floor(Math.random() * 10))}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(95, resume.scores.overall + 5)}%` }}
                                                    transition={{ duration: 1.2, delay: 0.3 }}
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                                />
                                            </div>
                                        </div>

                                        {/* 评分和操作 */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                            <div className="flex items-center gap-3">
                                                <ScoreRing score={resume.scores.overall} size={44} strokeWidth={3} />
                                                <div>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getScoreBadge(resume.scores.overall).color}`}>
                                                        {getScoreBadge(resume.scores.overall).text}
                                                    </span>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {formatDate(resume.uploadedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => openDetailModal(resume)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm shadow-blue-500/20"
                                            >
                                                <Eye className="w-4 h-4" />
                                                详情
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* ───────── 列表视图 ───────── */
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm">
                            {filteredResumes.map((resume, index) => (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`flex items-center justify-between p-5 border-b border-gray-100/50 dark:border-gray-700/50 last:border-b-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer ${
                                        selectedResumes.has(resume.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                    }`}
                                    onClick={() => openDetailModal(resume)}
                                >
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleSelectResume(resume.id); }}
                                            className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                                                selectedResumes.has(resume.id)
                                                    ? "bg-blue-600 border-blue-600"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        >
                                            {selectedResumes.has(resume.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                        </button>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md shadow-blue-500/20">
                                            {resume.basicInfo.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                    {resume.basicInfo.name}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(resume.scores.overall).color}`}>
                                                    {getScoreBadge(resume.scores.overall).text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {resume.jobInfo.position || "未知岗位"}
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    {resume.background.education || "未知"}
                                                </span>
                                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {resume.background.workYears || "未知"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex flex-wrap gap-1.5 max-w-xs">
                                            {resume.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                            {resume.skills.length > 3 && (
                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                                                    +{resume.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <ScoreRing score={resume.scores.overall} size={44} strokeWidth={3} />
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(resume.id); }}
                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                {bookmarked.has(resume.id) ? (
                                                    <BookmarkCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    /* ───────── 空状态 ───────── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative text-center py-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                    >
                        {/* 装饰性背景元素 */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[
                                { x: "10%", y: "20%", size: 100, color: "bg-blue-500/5", delay: 0 },
                                { x: "80%", y: "30%", size: 150, color: "bg-purple-500/5", delay: 0.5 },
                                { x: "50%", y: "70%", size: 120, color: "bg-indigo-500/5", delay: 1 }
                            ].map((orb, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: orb.delay }}
                                    className={`absolute rounded-full blur-3xl ${orb.color}`}
                                    style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-28 h-28 mx-auto mb-8 relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl rotate-6 opacity-20" />
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-3xl flex items-center justify-center">
                                    <Users className="w-14 h-14 text-blue-400 dark:text-blue-500" />
                                </div>
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                暂无人才数据
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                                人才库为空，请先上传并分析一些简历来建立您的人才储备
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl shadow-blue-500/25 font-semibold text-lg overflow-hidden group"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <span className="relative z-10 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    上传简历
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* ───────── 页脚 ───────── */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12"
            >
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 rounded-3xl p-10">
                    {/* 动态渐变背景 */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700"
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: "200% 200%" }}
                    />
                    {/* 装饰纹理 */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                    {/* 浮动光球 */}
                    {[
                        { x: "10%", y: "20%", size: 80, delay: 0 },
                        { x: "70%", y: "30%", size: 100, delay: 0.5 },
                        { x: "40%", y: "70%", size: 60, delay: 1 }
                    ].map((orb, i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 5 + i, repeat: Infinity, delay: orb.delay }}
                            className="absolute bg-white/10 rounded-full blur-2xl pointer-events-none"
                            style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size }}
                        />
                    ))}

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                                className="text-3xl font-black text-white mb-3 tracking-tight"
                            >
                                智能人才管理系统
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                className="text-blue-100 text-sm max-w-md leading-relaxed"
                            >
                                基于 AI 驱动的人才评估与管理平台，助力企业精准选才
                            </motion.p>
                        </div>
                        <div className="flex items-center gap-5">
                            {[
                                { icon: Users, label: "候选人管理", count: stats?.total || 0, color: "from-blue-400 to-blue-500" },
                                { icon: Target, label: "平均评分", count: stats?.avgScore || 0, color: "from-emerald-400 to-emerald-500" },
                                { icon: Award, label: "优秀人才", count: `${stats?.highScorePercent || 0}%`, color: "from-amber-400 to-amber-500" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.5 + i * 0.15, type: "spring" }}
                                    whileHover={{ y: -4, scale: 1.05 }}
                                    className="text-center px-5 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-default"
                                >
                                    <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-2xl font-black text-white">{item.count}</p>
                                    <p className="text-[11px] text-blue-200 mt-0.5">{item.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.footer>

            {/* ───────── 快速添加按钮 ───────── */}
            <div className="fixed bottom-8 right-8 z-40">
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                />
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-xl shadow-blue-500/40 flex items-center justify-center hover:shadow-2xl hover:shadow-blue-500/50 transition-shadow"
                >
                    <UserPlus className="w-6 h-6" />
                </motion.button>
            </div>

            {/* ───────── 详情模态框 ───────── */}
            <AnimatePresence>
                {showDetailModal && selectedResume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={closeDetailModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 模态框头部 */}
                            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 p-8">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                                            {selectedResume.basicInfo.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-1">
                                                {selectedResume.basicInfo.name}
                                            </h2>
                                            <p className="text-blue-100 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" />
                                                {selectedResume.jobInfo.position || "未知岗位"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeDetailModal}
                                        className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* 模态框内容 */}
                            <div className="p-8 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                                {/* 评分卡片 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "综合评分", value: selectedResume.scores.overall, gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" },
                                        { label: "技能评分", value: selectedResume.scores.skills, gradient: "from-emerald-500 to-teal-600", bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" },
                                        { label: "经验评分", value: selectedResume.scores.experience, gradient: "from-amber-500 to-orange-600", bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20" },
                                        { label: "学历评分", value: selectedResume.scores.education, gradient: "from-purple-500 to-indigo-600", bg: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20" }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`bg-gradient-to-br ${item.bg} rounded-2xl p-5 text-center`}
                                        >
                                            <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl mb-3 shadow-lg`}>
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* 基本信息 */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        基本信息
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: Mail, label: "邮箱", value: selectedResume.basicInfo.email, color: "text-blue-500" },
                                            { icon: Phone, label: "电话", value: selectedResume.basicInfo.phone, color: "text-emerald-500" },
                                            { icon: MapPin, label: "地址", value: selectedResume.basicInfo.address, color: "text-amber-500" },
                                            { icon: Briefcase, label: "期望薪资", value: selectedResume.jobInfo.expectedSalary, color: "text-purple-500" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value || "未提供"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 教育背景 */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        教育背景
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: "学历", value: selectedResume.background.education },
                                            { label: "工作年限", value: selectedResume.background.workYears },
                                            { label: "院校", value: selectedResume.background.university },
                                            { label: "专业", value: selectedResume.background.major }
                                        ].filter(item => item.value).map((item, i) => (
                                            <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-xl">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 能力雷达图 + 技能标签 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 能力雷达图 */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            能力评估
                                        </h3>
                                        <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                                {/* 背景网格 */}
                                                {[80, 60, 40, 20].map((r, i) => (
                                                    <polygon
                                                        key={i}
                                                        points={[0, 72, 138, 200].map((_, j) => {
                                                            const angle = (j * 120 - 90) * Math.PI / 180;
                                                            return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                                        }).join(' ')}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        className="text-gray-200 dark:text-gray-600"
                                                        strokeWidth="0.5"
                                                    />
                                                ))}
                                                {/* 数据区域 */}
                                                <motion.polygon
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.8, delay: 0.3 }}
                                                    points={[
                                                        { angle: 0, value: selectedResume.scores.skills },
                                                        { angle: 120, value: selectedResume.scores.experience },
                                                        { angle: 240, value: selectedResume.scores.education }
                                                    ].map(({ angle, value }) => {
                                                        const r = (value / 100) * 80;
                                                        const rad = (angle - 90) * Math.PI / 180;
                                                        return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
                                                    }).join(' ')}
                                                    fill="url(#radarGradient)"
                                                    fillOpacity="0.3"
                                                    stroke="url(#radarStroke)"
                                                    strokeWidth="2"
                                                />
                                                <defs>
                                                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="100%" stopColor="#6366f1" />
                                                    </linearGradient>
                                                    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#2563eb" />
                                                        <stop offset="100%" stopColor="#4f46e5" />
                                                    </linearGradient>
                                                </defs>
                                                {/* 标签 */}
                                                {[
                                                    { label: "技能", angle: 0 },
                                                    { label: "经验", angle: 120 },
                                                    { label: "学历", angle: 240 }
                                                ].map(({ label, angle }) => {
                                                    const rad = (angle - 90) * Math.PI / 180;
                                                    const x = 100 + 95 * Math.cos(rad);
                                                    const y = 100 + 95 * Math.sin(rad);
                                                    return (
                                                        <text
                                                            key={label}
                                                            x={x}
                                                            y={y}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            className="fill-gray-500 dark:fill-gray-400 text-[10px] font-medium"
                                                        >
                                                            {label}
                                                        </text>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </div>

                                    {/* 技能标签 */}
                                    {selectedResume.skills.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                技能标签
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedResume.skills.map((skill, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200/50 dark:border-blue-700/30"
                                                    >
                                                        {skill}
                                                    </motion.span>
                                                ))}
                                            </div>
                                            {/* 技能数量统计 */}
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">技能总数</span>
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{selectedResume.skills.length} 项</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI分析 */}
                                {selectedResume.analysis && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            AI 分析
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedResume.analysis}
                                        </p>
                                    </div>
                                )}

                                {/* 优化建议 */}
                                {selectedResume.suggestions && selectedResume.suggestions.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            优化建议
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedResume.suggestions.map((suggestion, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl"
                                                >
                                                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-white">{i + 1}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 上传时间 */}
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    上传时间: {formatDate(selectedResume.uploadedAt)}
                                </div>
                            </div>

                            {/* 模态框底部 */}
                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeDetailModal}
                                        className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        关闭
                                    </button>
                                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg shadow-blue-500/25 font-medium">
                                        <Download className="w-4 h-4 inline mr-2" />
                                        导出简历
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}