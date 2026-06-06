import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, RefreshCcw, CheckCircle, ArrowRight, TrendingUp, TrendingDown, Trophy, Settings, ChevronDown, ChevronUp, Briefcase, GraduationCap, Code, Target, Sparkles, Zap, Crown, XCircle, Brain, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ResumeCard from "@/components/ResumeCard";
import AnimatedScoreRing from "@/components/AnimatedScoreRing";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData, EnhancedComparisonResult, ComparisonConfig } from "@/types/resume";

/* ───────── 复用 Analyze 风格组件 ───────── */
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

const GlowButton = ({ children, onClick, variant = "primary", className = "", disabled = false }: {
    children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; className?: string; disabled?: boolean
}) => {
    const baseClass = "relative group overflow-hidden rounded-2xl font-semibold transition-all duration-300";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5",
        secondary: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700",
        ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center space-x-2">{children}</span>
        </button>
    );
};

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

export default function Compare() {
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<EnhancedComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { resumes, setResumes } = useResumeStore();
    const [showConfig, setShowConfig] = useState(false);
    const [useCoze, setUseCoze] = useState(false);
    const [config, setConfig] = useState<ComparisonConfig>({
        skillsWeight: 0.45,
        experienceWeight: 0.30,
        educationWeight: 0.25,
        skillMatchThreshold: 0.6,
        experienceYearsWeight: 0.4,
        projectQualityWeight: 0.3,
        positionMatchWeight: 0.3,
        educationLevelWeight: 0.5,
        majorMatchWeight: 0.3,
        universityRankWeight: 0.2
    });
    const [jobDescription, setJobDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        skills: true,
        experience: true,
        education: true
    });

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

    const toggleResume = (id: string) => {
        if (selectedResumes.includes(id)) {
            setSelectedResumes(selectedResumes.filter((r) => r !== id));
        } else if (selectedResumes.length < 5) {
            setSelectedResumes([...selectedResumes, id]);
        }
    };

    const handleCompare = async () => {
        if (selectedResumes.length < 2) return;

        setIsComparing(true);
        setError(null);
        try {
            const result = await api.compareResumes(
                selectedResumes,
                showConfig ? config : undefined,
                jobDescription,
                requirements,
                useCoze
            );
            if (result && result.resumes && result.results && result.comparison) {
                setComparisonResult(result);
            } else {
                throw new Error("返回数据格式错误");
            }
        } catch (err: any) {
            console.error("Comparison failed:", err);
            setError(err.message || "对比分析失败，请稍后重试");
        } finally {
            setIsComparing(false);
        }
    };

    const reset = () => {
        setSelectedResumes([]);
        setComparisonResult(null);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleConfigChange = (key: keyof ComparisonConfig, value: number) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetConfig = () => {
        setConfig({
            skillsWeight: 0.45,
            experienceWeight: 0.30,
            educationWeight: 0.25,
            skillMatchThreshold: 0.6,
            experienceYearsWeight: 0.4,
            projectQualityWeight: 0.3,
            positionMatchWeight: 0.3,
            educationLevelWeight: 0.5,
            majorMatchWeight: 0.3,
            universityRankWeight: 0.2
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    };

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-3xl shadow-2xl shadow-indigo-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Users className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                                简历对比分析
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            选择2-5份简历进行智能对比，多维度评估助您精准决策
                            <br className="hidden sm:block" />
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">AI 驱动的智能招聘决策</span>
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!comparisonResult ? (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-8">
                                    <GlassCard className="p-8 mb-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                已选择 {selectedResumes.length}/5 份简历（至少选择2份）
                                            </p>
                                            <div className="flex items-center space-x-3">
                                                <GlowButton
                                                    onClick={() => setShowConfig(!showConfig)}
                                                    variant="secondary"
                                                    className="px-4 py-2.5 text-sm"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>配置规则</span>
                                                    {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </GlowButton>
                                                {selectedResumes.length >= 2 && (
                                                    <GlowButton
                                                        onClick={handleCompare}
                                                        variant="primary"
                                                        disabled={isComparing}
                                                        className="px-8 py-3.5"
                                                    >
                                                        {isComparing ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                <span>智能分析中...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {useCoze ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                                                <span>{useCoze ? 'AI 对比' : '规则对比'}（{selectedResumes.length}份）</span>
                                                            </>
                                                        )}
                                                    </GlowButton>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center mb-6">
                                            <div className="relative p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5">
                                                <motion.div
                                                    className="absolute top-1 bottom-1 rounded-xl shadow-md"
                                                    animate={{ x: useCoze ? '100%' : '0%' }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                                    style={{
                                                        left: 4,
                                                        right: 'calc(50% + 4px)',
                                                        background: useCoze
                                                            ? 'linear-gradient(to right, #9333ea, #ec4899)'
                                                            : 'linear-gradient(to right, #2563eb, #4f46e5)',
                                                    }}
                                                />
                                                <div className="relative flex">
                                                    <button
                                                        onClick={() => setUseCoze(false)}
                                                        className={`relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                            !useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <Code className="w-4 h-4" />
                                                        <span>规则分析</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setUseCoze(true)}
                                                        className={`relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                            useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        <span>AI 智能分析</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            className="mb-6 p-5 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-2xl flex items-center space-x-4"
                                        >
                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
                                                <p className="text-red-600 dark:text-red-500 text-xs mt-1">已自动切换到规则分析模式</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <AnimatePresence>
                                        {showConfig && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-6 overflow-hidden"
                                            >
                                                <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-3xl p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">自定义规则配置</h3>
                                                        <button
                                                            onClick={resetConfig}
                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            重置默认
                                                        </button>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">岗位描述</h4>
                                                            <textarea
                                                                value={jobDescription}
                                                                onChange={(e) => setJobDescription(e.target.value)}
                                                                placeholder="输入岗位描述，帮助更精准地评估匹配度..."
                                                                className="w-full p-3 border border-gray-200/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">岗位要求</h4>
                                                            <textarea
                                                                value={requirements}
                                                                onChange={(e) => setRequirements(e.target.value)}
                                                                placeholder="输入具体要求，如技能、经验、学历等..."
                                                                className="w-full p-3 border border-gray-200/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">维度权重配置</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">技能权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.skillsWeight * 100}
                                                                    onChange={(e) => handleConfigChange('skillsWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.skillsWeight * 100)}%</span>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">经验权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.experienceWeight * 100}
                                                                    onChange={(e) => handleConfigChange('experienceWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.experienceWeight * 100)}%</span>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">学历权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.educationWeight * 100}
                                                                    onChange={(e) => handleConfigChange('educationWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.educationWeight * 100)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">工作年限权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.experienceYearsWeight * 100}
                                                                onChange={(e) => handleConfigChange('experienceYearsWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.experienceYearsWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">项目质量权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.projectQualityWeight * 100}
                                                                onChange={(e) => handleConfigChange('projectQualityWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.projectQualityWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">学历层次权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.educationLevelWeight * 100}
                                                                onChange={(e) => handleConfigChange('educationLevelWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.educationLevelWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">专业匹配权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.majorMatchWeight * 100}
                                                                onChange={(e) => handleConfigChange('majorMatchWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.majorMatchWeight * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {resumes.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {resumes.map((resume) => (
                                            <ResumeCard
                                                key={resume.id}
                                                resume={resume}
                                                selectable
                                                selected={selectedResumes.includes(resume.id)}
                                                onSelect={toggleResume}
                                                showActions={false}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-3xl">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">暂无可对比的简历</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">请先上传并分析一些简历</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center space-x-5">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 100 }}
                                            className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 relative"
                                        >
                                            <CheckCircle className="w-7 h-7 text-white" />
                                            <motion.div
                                                className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">对比完成</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">共 {comparisonResult.resumes.length} 份简历参与对比</p>
                                        </div>
                                    </div>
                                    <GlowButton onClick={reset} variant="secondary" className="px-6 py-3">
                                        <RefreshCcw className="w-5 h-5" />
                                        <span>重新对比</span>
                                    </GlowButton>
                                </div>

                                {comparisonResult.comparison.ranking && (
                                    <GlassCard className="p-8 mb-8" delay={0.1}>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                                <Crown className="w-5 h-5 text-white" />
                                            </div>
                                            <span>候选人排名</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {comparisonResult.comparison.ranking.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.15 }}
                                                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                                                        index === 0
                                                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 shadow-md shadow-amber-500/10'
                                                            : 'bg-white/60 dark:bg-gray-700/40 backdrop-blur hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                                                            index === 0
                                                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                                                : index === 1
                                                                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                                        }`}>
                                                            {item.rank}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-white text-lg">{item.name}</span>
                                                        {index === 0 && (
                                                            <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                                                                推荐
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-2xl font-bold ${index === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {item.score}<span className="text-sm font-normal ml-1">分</span>
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}

                                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                    {comparisonResult.resumes.map((resume, index) => {
                                        const isWinner = comparisonResult.comparison.ranking?.[index]?.rank === 1;
                                        const score = comparisonResult.results[index].matchScore;
                                        return (
                                            <motion.div
                                                key={resume.id}
                                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ delay: index * 0.12, type: "spring" }}
                                            >
                                                <GlassCard className={`p-6 h-full ${isWinner ? 'ring-2 ring-indigo-400/30' : ''}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {resume.basicInfo.name}
                                                        </h3>
                                                        {comparisonResult.comparison.ranking && (
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                isWinner
                                                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                            }`}>
                                                                {isWinner ? '第1名' : `第${comparisonResult.comparison.ranking[index]?.rank || index + 1}名`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-center mb-4">
                                                        <AnimatedScoreRing
                                                            score={score}
                                                            size={110}
                                                            strokeWidth={7}
                                                            isWinner={isWinner}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <p className="text-gray-600 dark:text-gray-400">{resume.jobInfo.position}</p>
                                                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                                                            <span>{resume.background.education}</span>
                                                            <span>•</span>
                                                            <span>{resume.background.workYears}</span>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <GlassCard className="p-8 mb-8" delay={0.2}>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                            <Target className="w-4 h-4 text-white" />
                                        </div>
                                        <span>评分对比</span>
                                    </h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: "技能评分", key: "skills" },
                                            { label: "经验评分", key: "experience" },
                                            { label: "学历评分", key: "education" },
                                        ].map((item) => (
                                            <div key={item.key} className="space-y-3">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                                                {comparisonResult.results.map((result, idx) => (
                                                    <div key={idx} className="flex items-center space-x-3">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-20 truncate">
                                                            {comparisonResult.resumes[idx].basicInfo.name}
                                                        </span>
                                                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.key === 'skills' ? result.details.skillsMatch : item.key === 'experience' ? result.details.experienceMatch : result.details.educationMatch}%` }}
                                                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                                className={`h-full rounded-full ${idx === 0 ? 'from-indigo-500 to-blue-500' : idx === 1 ? 'from-purple-500 to-pink-500' : idx === 2 ? 'from-cyan-500 to-teal-500' : idx === 3 ? 'from-pink-500 to-rose-500' : 'from-rose-500 to-red-500'}`}
                                                                style={{
                                                                    backgroundImage: `linear-gradient(90deg, ${
                                                                        idx === 0 ? '#6366f1, #3b82f6' :
                                                                        idx === 1 ? '#a855f7, #ec4899' :
                                                                        idx === 2 ? '#06b6d4, #14b8a6' :
                                                                        idx === 3 ? '#ec4899, #f43f5e' :
                                                                        '#f43f5e, #ef4444'
                                                                    }, ${
                                                                        idx === 0 ? '#6366f1, #3b82f6' :
                                                                        idx === 1 ? '#a855f7, #ec4899' :
                                                                        idx === 2 ? '#06b6d4, #14b8a6' :
                                                                        idx === 3 ? '#ec4899, #f43f5e' :
                                                                        '#f43f5e, #ef4444'
                                                                    })`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold w-12 text-right">
                                                            {item.key === 'skills' ? result.details.skillsMatch : item.key === 'experience' ? result.details.experienceMatch : result.details.educationMatch}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                    <GlassCard className="p-6" delay={0.3}>
                                        <button
                                            onClick={() => toggleSection('skills')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                                    <Code className="w-4 h-4 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">技能分析</h4>
                                            </div>
                                            {expandedSections.skills ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {expandedSections.skills && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {result.details.skillsMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.skillsMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-blue-500 rounded-full"
                                                            />
                                                        </div>
                                                        {result.skillsDetails.matched.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {result.skillsDetails.matched.slice(0, 5).map((skill, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                                        {skill.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </GlassCard>

                                    <GlassCard className="p-6" delay={0.4}>
                                        <button
                                            onClick={() => toggleSection('experience')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                                                    <Briefcase className="w-4 h-4 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">经验分析</h4>
                                            </div>
                                            {expandedSections.experience ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {expandedSections.experience && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-amber-600">
                                                                {result.details.experienceMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.experienceMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-amber-500 rounded-full"
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            工作年限：{result.experienceDetails.years}年 | 
                                                            岗位匹配：{result.experienceDetails.positionMatch}分
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </GlassCard>

                                    <GlassCard className="p-6" delay={0.5}>
                                        <button
                                            onClick={() => toggleSection('education')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                                    <GraduationCap className="w-4 h-4 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">学历分析</h4>
                                            </div>
                                            {expandedSections.education ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {expandedSections.education && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-emerald-600">
                                                                {result.details.educationMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.educationMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-emerald-500 rounded-full"
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            学历层次：{comparisonResult.resumes[index].background.education}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </GlassCard>
                                </div>

                                {comparisonResult.comparison.priorityWeights && (
                                    <GlassCard className="p-6 mb-8" delay={0.6}>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                                                <Target className="w-4 h-4 text-white" />
                                            </div>
                                            <span>权重分配</span>
                                        </h4>
                                        <div className="flex items-center space-x-4">
                                            {Object.entries(comparisonResult.comparison.priorityWeights).map(([key, value]) => (
                                                <div key={key} className="flex-1">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {Math.round(value * 100)}%
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {key === 'skills' ? '技能' : key === 'experience' ? '经验' : '学历'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {comparisonResult.resumes.map((resume, index) => (
                                        <div key={resume.id} className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2 text-lg">
                                                <span>{resume.basicInfo.name}</span>
                                                {comparisonResult.comparison.ranking && comparisonResult.comparison.ranking[index]?.rank === 1 && (
                                                    <Crown className="w-5 h-5 text-amber-500" />
                                                )}
                                            </h4>
                                            {comparisonResult.comparison.strengths[resume.id]?.length > 0 && (
                                                <div className="backdrop-blur-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl p-4 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300">
                                                    <h5 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                                        </div>
                                                        <span>优势</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.strengths[resume.id].map((strength, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-emerald-700">
                                                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {comparisonResult.comparison.weaknesses[resume.id]?.length > 0 && (
                                                <div className="backdrop-blur-xl bg-red-50/60 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-4 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300">
                                                    <h5 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                                                            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                                        </div>
                                                        <span>劣势</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.weaknesses[resume.id].map((weakness, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-red-700">
                                                                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{weakness}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {comparisonResult.results && comparisonResult.results[index].highlights.length > 0 && (
                                                <div className="backdrop-blur-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-4 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
                                                    <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                        <span>亮点</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.results[index].highlights.map((highlight, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-blue-700">
                                                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{highlight}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <GlassCard className="p-8 mt-8" delay={0.7}>
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <span>AI 推荐建议</span>
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {comparisonResult.comparison.recommendation}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
