import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  CheckCircle,
  ArrowRight,
  RefreshCcw,
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  BookOpen,
  Bot,
  Settings,
  Award,
  Star,
  Loader2,
  Brain,
  Clock,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

interface SuggestionCategory {
    title: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    suggestions: string[];
}

type OptimizationMethod = "rule" | "coze";

// ============ 设计系统组件 ============

const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl overflow-hidden ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

const ParticleField = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
    }));
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-orange-500/10 dark:bg-orange-400/10"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

const ScoreBadge = ({ score }: { score: number }) => {
    const getStyles = () => {
        if (score >= 80) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" };
        if (score >= 60) return { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" };
        return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/20" };
    };
    const s = getStyles();
    return (
        <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold ${s.bg} ${s.text} ring-1 ${s.ring}`}>
            <Star className="w-3.5 h-3.5" />
            <span>{score} 分</span>
        </span>
    );
};

// ============ 页面主体 ============

// 数字递增动画组件
const CountUp = ({ target, duration = 800 }: { target: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const steps = 20;
        const increment = target / steps;
        const stepDuration = duration / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepDuration);
        return () => clearInterval(timer);
    }, [target, duration]);

    return <span ref={ref}>{count}</span>;
};

export default function Optimize() {
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [optimizationMethod, setOptimizationMethod] = useState<OptimizationMethod>("rule");
    const { resumes, setResumes } = useResumeStore();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getHistory();
                setResumes(history);
            } catch (err) {
                console.error("Failed to load history:", err);
            }
        };
        loadHistory();
    }, [setResumes]);

    const generateSuggestions = async (resume: ResumeData) => {
        setIsGenerating(true);
        setSelectedResume(resume);
        setSuggestions([]);

        if (optimizationMethod === "rule") {
            generateRuleSuggestions(resume);
        } else {
            await generateCozeSuggestions(resume);
        }
    };

    const generateRuleSuggestions = (resume: ResumeData) => {
        setTimeout(() => {
            const categories: SuggestionCategory[] = [];

            const skillSuggestions: string[] = [];
            if (resume.skills.length < 5) {
                skillSuggestions.push("建议增加更多相关技能标签，目前技能数量较少");
            }
            if (!resume.skills.some((s) => s.toLowerCase().includes("项目"))) {
                skillSuggestions.push("考虑添加项目管理或团队协作相关技能");
            }
            if (resume.scores.skills < 70) {
                skillSuggestions.push("技能部分得分较低，建议补充更多硬技能和软技能");
            }
            if (skillSuggestions.length > 0) {
                categories.push({
                    title: "技能优化",
                    icon: Target,
                    color: "bg-blue-500",
                    gradient: "from-blue-500 to-indigo-600",
                    suggestions: skillSuggestions,
                });
            }

            const expSuggestions: string[] = [];
            if (resume.scores.experience < 70) {
                expSuggestions.push("工作经验描述可以更加详细，突出具体成果和贡献");
            }
            if (resume.background.projects.length < 2) {
                expSuggestions.push("建议增加更多项目经历，展示实际工作能力");
            }
            expSuggestions.push("使用 STAR 法则（情境-任务-行动-结果）描述工作经历");
            categories.push({
                title: "经验描述",
                icon: TrendingUp,
                color: "bg-emerald-500",
                gradient: "from-emerald-500 to-teal-600",
                suggestions: expSuggestions,
            });

            const eduSuggestions: string[] = [];
            if (resume.scores.education < 70) {
                eduSuggestions.push("教育背景信息可以更加完整，包括学校、专业、学位等");
            }
            eduSuggestions.push("如有相关证书或培训经历，建议补充");
            eduSuggestions.push("GPA 或排名如果优秀，建议添加");
            categories.push({
                title: "教育背景",
                icon: BookOpen,
                color: "bg-purple-500",
                gradient: "from-purple-500 to-pink-600",
                suggestions: eduSuggestions,
            });

            const formatSuggestions: string[] = [];
            if (!resume.basicInfo.email) {
                formatSuggestions.push("缺少邮箱信息，这是HR联系您的重要方式");
            }
            if (!resume.basicInfo.phone) {
                formatSuggestions.push("缺少联系电话，建议补充");
            }
            if (!resume.basicInfo.address) {
                formatSuggestions.push("建议添加所在城市，方便HR判断地域匹配度");
            }
            formatSuggestions.push("简历排版建议简洁清晰，突出重点信息");
            categories.push({
                title: "格式完善",
                icon: FileText,
                color: "bg-amber-500",
                gradient: "from-amber-500 to-orange-600",
                suggestions: formatSuggestions,
            });

            if (resume.scores.overall < 60) {
                categories.push({
                    title: "整体提升",
                    icon: AlertTriangle,
                    color: "bg-red-500",
                    gradient: "from-red-500 to-rose-600",
                    suggestions: [
                        "整体评分较低，建议全面优化简历内容",
                        "可以参考目标岗位的JD，针对性调整简历",
                        "建议找专业人士或使用AI工具进行简历润色",
                    ],
                });
            }

            setSuggestions(categories);
            setIsGenerating(false);
        }, 1500);
    };

    const generateCozeSuggestions = async (resume: ResumeData) => {
        try {
            const result = await api.optimizeResume(resume.id);

            const categories: SuggestionCategory[] = [];

            if (result.analysis) {
                categories.push({
                    title: "AI 综合分析",
                    icon: Brain,
                    color: "bg-violet-500",
                    gradient: "from-violet-500 to-purple-600",
                    suggestions: [result.analysis],
                });
            }

            if (result.suggestions && result.suggestions.length > 0) {
                categories.push({
                    title: "AI 优化建议",
                    icon: Sparkles,
                    color: "bg-cyan-500",
                    gradient: "from-cyan-500 to-blue-600",
                    suggestions: result.suggestions,
                });
            }

            if (result.categories && result.categories.length > 0) {
                result.categories.forEach((cat: any) => {
                    if (cat.title && cat.suggestions) {
                        categories.push({
                            title: cat.title,
                            icon: Bot,
                            color: "bg-violet-500",
                            gradient: "from-violet-500 to-purple-600",
                            suggestions: Array.isArray(cat.suggestions) ? cat.suggestions : [cat.suggestions],
                        });
                    }
                });
            }

            if (categories.length === 0) {
                categories.push({
                    title: "AI 分析结果",
                    icon: Bot,
                    color: "bg-violet-500",
                    gradient: "from-violet-500 to-purple-600",
                    suggestions: ["Coze AI 分析完成，暂无具体建议"],
                });
            }

            setSuggestions(categories);
        } catch (error) {
            console.error("Coze optimization failed:", error);
            setSuggestions([{
                title: "分析失败",
                icon: AlertTriangle,
                color: "bg-red-500",
                gradient: "from-red-500 to-rose-600",
                suggestions: ["Coze AI 优化建议生成失败，请检查配置或稍后重试"],
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const reset = () => {
        setSelectedResume(null);
        setSuggestions([]);
    };

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* ============ Hero Header ============ */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-3xl shadow-2xl shadow-orange-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Lightbulb className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-amber-800 to-orange-800 dark:from-white dark:via-amber-200 dark:to-orange-200 bg-clip-text text-transparent">
                                简历优化建议
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            选择一份简历，AI 深度分析并生成个性化优化建议
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent font-semibold">让您的简历更具竞争力</span>
                        </motion.p>
                    </div>

                    {/* ============ 优化方式选择器 ============ */}
                    {!selectedResume && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mb-10"
                        >
                            <div className="flex items-center justify-center">
                                <div className="relative p-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5">
                                    <motion.div
                                        className="absolute top-1.5 bottom-1.5 rounded-xl shadow-lg"
                                        animate={{ x: optimizationMethod === "coze" ? "100%" : "0%" }}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                        style={{
                                            left: 4,
                                            right: 4,
                                            width: "calc(50% - 4px)",
                                            background: optimizationMethod === "coze"
                                                ? "linear-gradient(to right, #fb923c, #fdba74)"
                                                : "linear-gradient(to right, #c2410c, #ea580c)",
                                        }}
                                    />
                                    <div className="relative flex">
                                        <button
                                            onClick={() => setOptimizationMethod("rule")}
                                            className={`relative z-10 flex items-center space-x-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                optimizationMethod === "rule"
                                                    ? "text-white"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>规则式优化</span>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${optimizationMethod === "rule" ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"}`}>快速</span>
                                        </button>
                                        <button
                                            onClick={() => setOptimizationMethod("coze")}
                                            className={`relative z-10 flex items-center space-x-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                optimizationMethod === "coze"
                                                    ? "text-white"
                                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                        >
                                            <Bot className="w-4 h-4" />
                                            <span>Coze AI 优化</span>
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${optimizationMethod === "coze" ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"}`}>精准</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <motion.p
                                key={optimizationMethod}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
                            >
                                {optimizationMethod === "coze"
                                    ? "✨ Coze AI 模式：利用先进的大语言模型进行深度分析，提供更精准的个性化建议"
                                    : "⚡ 规则模式：基于预设规则的快速分析，响应更快，适合快速获取标准化建议"}
                            </motion.p>
                        </motion.div>
                    )}

                    {/* ============ 主内容区域 ============ */}
                    <AnimatePresence mode="wait">
                        {!selectedResume ? (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="max-w-5xl mx-auto">
                                    {resumes.length > 0 ? (
                                        <>
                                            <div className="text-center mb-8">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    点击任意简历开始生成优化建议
                                                </p>
                                            </div>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                {resumes.slice(0, 6).map((resume, idx) => (
                                                    <motion.div
                                                        key={resume.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.6 + idx * 0.08 }}
                                                        whileHover={{ y: -8, scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => generateSuggestions(resume)}
                                                        className="group relative cursor-pointer"
                                                    >
                                                        {/* hover 渐变边框光晕 */}
                                                        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-amber-400/0 via-orange-400/0 to-red-400/0 group-hover:from-amber-400/30 group-hover:via-orange-400/30 group-hover:to-red-400/30 transition-all duration-500 blur-[1px]" />

                                                        {/* 卡片 */}
                                                        <div className="relative h-full backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/10 group-hover:shadow-2xl group-hover:shadow-orange-500/10 dark:group-hover:shadow-orange-500/5 transition-all duration-500 overflow-hidden">
                                                            {/* 内部柔光 */}
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl pointer-events-none" />
                                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:via-amber-500/5 group-hover:to-red-500/5 transition-all duration-500" />

                                                            {/* 内容 */}
                                                            <div className="relative z-10 p-5">
                                                                {/* 头部：头像 + 分数 */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <motion.div
                                                                        whileHover={{ rotate: [0, -5, 5, 0] }}
                                                                        transition={{ duration: 0.4 }}
                                                                        className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/30 transition-all duration-300"
                                                                    >
                                                                        {resume.basicInfo.name.charAt(0)}
                                                                    </motion.div>
                                                                    <ScoreBadge score={resume.scores.overall} />
                                                                </div>

                                                                {/* 姓名 + 岗位 */}
                                                                <div className="mb-4">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                                            {resume.basicInfo.name}
                                                                        </h3>
                                                                        {resume.jobInfo.expectedSalary && (
                                                                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/50 dark:border-amber-500/20">
                                                                                {resume.jobInfo.expectedSalary}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {resume.jobInfo.position || "未知岗位"}
                                                                    </p>
                                                                </div>

                                                                {/* 信息行 */}
                                                                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <Award className="w-3.5 h-3.5" />
                                                                        <span>{resume.background.education || "未知"}</span>
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        <span>{resume.background.workYears || "未知"}</span>
                                                                    </span>
                                                                </div>

                                                                {/* 子评分条 */}
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    {[
                                                                        { label: "技能", score: resume.scores.skills },
                                                                        { label: "经验", score: resume.scores.experience },
                                                                        { label: "学历", score: resume.scores.education },
                                                                    ].map((item) => (
                                                                        <div key={item.label} className="flex items-center gap-1.5 flex-1">
                                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 w-5">{item.label}</span>
                                                                            <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                                                <motion.div
                                                                                    className="h-full rounded-full"
                                                                                    style={{
                                                                                        width: `${item.score}%`,
                                                                                        background: item.score >= 80
                                                                                            ? "linear-gradient(to right, #10b981, #34d399)"
                                                                                            : item.score >= 60
                                                                                                ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                                                                                                : "linear-gradient(to right, #ef4444, #f87171)",
                                                                                    }}
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${item.score}%` }}
                                                                                    transition={{ delay: 0.7 + idx * 0.08, duration: 0.6 }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* 技能标签 */}
                                                                {resume.skills && resume.skills.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                                                        {resume.skills.slice(0, 3).map((skill, si) => (
                                                                            <span key={si} className="px-2 py-0.5 text-[11px] rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                        {resume.skills.length > 3 && (
                                                                            <span className="px-2 py-0.5 text-[11px] rounded-md text-gray-400 dark:text-gray-500">
                                                                                +{resume.skills.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* 操作区域 */}
                                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform duration-200">
                                                                                获取优化建议
                                                                            </span>
                                                                            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                                                                                <Calendar className="w-3 h-3" />
                                                                                {new Date(resume.uploadedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                                                            <ArrowRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors duration-300" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            {resumes.length > 6 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1 }}
                                                    className="mt-10 text-center"
                                                >
                                                    <a
                                                        href="/home/history"
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <span>查看全部 {resumes.length} 份简历</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </a>
                                                </motion.div>
                                            )}
                                        </>
                                    ) : (
                                        <GlassCard className="p-16 text-center overflow-hidden relative">
                                            {/* 空状态背景光晕 */}
                                            <motion.div
                                                className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/5 to-orange-400/5 blur-3xl"
                                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                            />
                                            <div className="relative z-10">
                                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl mb-8">
                                                    <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                                    暂无可优化的简历
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                                                    请先上传并分析一些简历
                                                </p>
                                                <a
                                                    href="/home/analyze"
                                                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300"
                                                >
                                                    <span>上传简历</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </GlassCard>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="suggestions"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="max-w-5xl mx-auto">
                                    {/* ============ 结果头部 ============ */}
                                    <GlassCard delay={0.2} className="mb-8 border-l-4 border-l-orange-500 relative overflow-hidden">
                                        {/* 背景装饰光晕 */}
                                        <motion.div
                                            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/10 via-orange-400/10 to-transparent blur-2xl"
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        />
                                        <motion.div
                                            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br from-orange-400/8 to-red-400/8 blur-2xl"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                                        />
                                        <div className="p-6 sm:p-8">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="relative"
                                                    >
                                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-orange-500/20">
                                                            {selectedResume.basicInfo.name.charAt(0)}
                                                        </div>
                                                        <motion.div
                                                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md"
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                            <Star className="w-3 h-3 text-white" />
                                                        </motion.div>
                                                    </motion.div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                                {selectedResume.basicInfo.name} 的优化建议
                                                            </h2>
                                                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${
                                                                optimizationMethod === "coze"
                                                                    ? "bg-gradient-to-r from-violet-500 to-purple-600"
                                                                    : "bg-gradient-to-r from-amber-500 to-orange-600"
                                                            }`}>
                                                                {optimizationMethod === "coze" ? (
                                                                    <><Sparkles className="w-3 h-3" /><span>AI</span></>
                                                                ) : (
                                                                    <><Settings className="w-3 h-3" /><span>规则</span></>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center space-x-1">
                                                                <Target className="w-3.5 h-3.5" />
                                                                <span>{selectedResume.jobInfo.position}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <Star className="w-3.5 h-3.5 text-amber-400" />
                                                                <span>当前评分: {selectedResume.scores.overall}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            const newMethod = optimizationMethod === "rule" ? "coze" : "rule";
                                                            setOptimizationMethod(newMethod);
                                                            generateSuggestions(selectedResume);
                                                        }}
                                                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                        <span>切换为{optimizationMethod === "rule" ? "Coze AI" : "规则式"}优化</span>
                                                    </button>
                                                    <button
                                                        onClick={reset}
                                                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                                        <span>选择其他简历</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {/* ============ 加载/结果展示 ============ */}
                                    {isGenerating ? (
                                        <GlassCard delay={0.3} className="p-16 text-center relative overflow-hidden">
                                            {/* 加载背景光晕 */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-orange-400/5 to-red-400/5"
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl mb-8 relative"
                                            >
                                                <Loader2 className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                                AI 正在分析...
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                                {optimizationMethod === "coze"
                                                    ? "正在调用 Coze AI 工作流，深度分析您的简历"
                                                    : "正在基于规则引擎分析，生成标准化优化建议"}
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                正在为 <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedResume.basicInfo.name}</span> 生成优化建议
                                            </p>
                                            <div className="mt-8 flex items-center justify-center space-x-2">
                                                {[0, 1, 2].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2.5 h-2.5 rounded-full bg-orange-500"
                                                        animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                                    />
                                                ))}
                                            </div>
                                            {/* 进度条 */}
                                            <div className="mt-8 max-w-xs mx-auto">
                                                <div className="h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full"
                                                        animate={{ width: ["0%", "60%", "85%", "92%"] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.7, 1] }}
                                                    />
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ) : (
                                        <div>
                                            {/* 统计摘要栏 */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="mb-6"
                                            >
                                                <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/10 overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                                                    {/* 背景光晕 */}
                                                    <motion.div
                                                        className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-2xl"
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                                                        transition={{ duration: 3, repeat: Infinity }}
                                                    />
                                                    <div className="relative z-10 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center space-x-4">
                                                            <motion.div
                                                                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
                                                                animate={{ boxShadow: ["0 4px 12px rgba(251,146,60,0.2)", "0 6px 20px rgba(251,146,60,0.4)", "0 4px 12px rgba(251,146,60,0.2)"] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            >
                                                                <Sparkles className="w-5 h-5 text-white" />
                                                            </motion.div>
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">优化分析完成</p>
                                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                                    共 <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"><CountUp target={suggestions.reduce((sum, c) => sum + c.suggestions.length, 0)} /></span> 条建议
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-6">
                                                            {suggestions.map((cat, idx) => (
                                                                <motion.div
                                                                    key={cat.title}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                                                    className="flex items-center space-x-2"
                                                                >
                                                                    <motion.div
                                                                        className={`w-3 h-3 rounded-full bg-gradient-to-br ${cat.gradient}`}
                                                                        animate={{ scale: [1, 1.3, 1] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                                                                    />
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{cat.title}</span>
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white"><CountUp target={cat.suggestions.length} duration={600} /></span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* 建议卡片列表 */}
                                            <div className="space-y-5">
                                            {suggestions.map((category, index) => {
                                                const Icon = category.icon;
                                                return (
                                                    <motion.div
                                                        key={category.title}
                                                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ delay: 0.35 + index * 0.12, type: "spring", stiffness: 100 }}
                                                        whileHover={{ y: -4 }}
                                                    >
                                                        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 dark:shadow-black/10 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                                                            
                                                            {/* hover 光扫效果 */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                                            
                                                            {/* hover 背景渐变 */}
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity duration-500`} />
                                                            
                                                            {/* 渐变色条 */}
                                                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.gradient} group-hover:h-2 transition-all duration-300`} />
                                                            
                                                            <div className="relative z-10 p-6 sm:p-8">
                                                                <div className="flex items-center space-x-4 mb-6">
                                                                    <motion.div
                                                                        className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                                                                        whileHover={{ rotate: [0, -5, 5, 0] }}
                                                                        transition={{ duration: 0.4 }}
                                                                    >
                                                                        <Icon className="w-6 h-6 text-white" />
                                                                    </motion.div>
                                                                    <div>
                                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                                            {category.title}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            <CountUp target={category.suggestions.length} duration={500} /> 条建议
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-3">
                                                                    {category.suggestions.map((suggestion, i) => (
                                                                        <motion.li
                                                                            key={i}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: 0.45 + index * 0.12 + i * 0.06, type: "spring", stiffness: 120 }}
                                                                            className="flex items-start space-x-3.5 group/item"
                                                                        >
                                                                            <motion.div
                                                                                className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center mt-0.5 shadow-sm group-hover/item:scale-110 transition-transform duration-200`}
                                                                                whileHover={{ scale: 1.2 }}
                                                                            >
                                                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                                            </motion.div>
                                                                            <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                                                                                {suggestion}
                                                                            </span>
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}

                                            {/* 提示卡片 */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + suggestions.length * 0.1 }}
                                            >
                                                <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 p-6 sm:p-8 overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                                                    <div className="relative z-10 flex items-start space-x-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                                                            <Lightbulb className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                                温馨提示
                                                            </h3>
                                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                                以上建议基于 {optimizationMethod === "coze" ? "Coze AI" : "规则引擎"} 分析生成，仅供参考。
                                                                建议根据目标岗位的具体要求，有针对性地优化简历内容。
                                                                同时，保持简历真实、简洁、突出重点是最重要的原则。
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}