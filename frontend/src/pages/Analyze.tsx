import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
    Loader2, RefreshCcw, User, Phone, Mail, MapPin, Briefcase, 
    GraduationCap, FileText, CheckCircle, XCircle, Sparkles, Brain,
    Upload, CloudUpload, FileUp, Zap, ArrowRight, BarChart3,
    Target, Clock, Star, TrendingUp, Award, Lightbulb, ChevronRight, Code
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ScoreChart from "@/components/ScoreChart";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

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
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center space-x-2">{children}</span>
        </button>
    );
};

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ 
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ 
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ 
                    x: [0, 60, 0],
                    y: [0, -80, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
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
                    className="absolute rounded-full bg-blue-500/10 dark:bg-blue-400/10"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
                    animate={{ 
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ 
                        duration: particle.duration, 
                        repeat: Infinity, 
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

const SkillTag = ({ skill, index }: { skill: string; index: number }) => (
    <motion.span
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.03 * index, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, y: -2 }}
        className="group relative inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/60 dark:border-blue-700/40 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 cursor-default transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-purple-400/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
        <span className="relative">{skill}</span>
    </motion.span>
);

const ScoreBar = ({ label, score, icon: Icon, gradient }: { label: string; score: number; icon: any; gradient: string }) => {
    const width = useMotionValue(0);
    const springWidth = useSpring(width, { stiffness: 100, damping: 30 });
    const displayWidth = useTransform(springWidth, v => `${v}%`);
    
    useEffect(() => {
        width.set(score);
    }, [score, width]);
    
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <div className="flex items-center space-x-3 flex-1 ml-4">
                <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                        style={{ width: displayWidth }}
                    />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${
                    score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 
                    score >= 60 ? 'text-amber-600 dark:text-amber-400' : 
                    'text-red-600 dark:text-red-400'
                }`}>
                    {score}
                </span>
            </div>
        </div>
    );
};

export default function Analyze() {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analysisStage, setAnalysisStage] = useState<'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete'>('idle');
    const [result, setResult] = useState<ResumeData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [useCoze, setUseCoze] = useState(false);
    const [recentUploads, setRecentUploads] = useState<Array<{name: string; time: string; score?: number}>>([]);
    const { addResume, setCurrentResume } = useResumeStore();

    useEffect(() => {
        if (location.state?.resumeId) {
            const loadResume = async () => {
                try {
                    const resume = await api.getResume(location.state.resumeId);
                    setResult(resume);
                    setAnalysisStage('complete');
                } catch (err) {
                    console.error("Failed to load resume:", err);
                }
            };
            loadResume();
        }
    }, [location.state]);

    useEffect(() => {
        const stored = localStorage.getItem('recentUploads');
        if (stored) setRecentUploads(JSON.parse(stored));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') {
            handleFileSelect(file);
        } else {
            setError("请上传 PDF 格式的文件");
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleFileSelect = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            setError("文件大小不能超过 10MB");
            return;
        }
        setSelectedFile(file);
        setError(null);
        setResult(null);
        setAnalysisStage('uploading');
        setUploadProgress(0);
        await analyzeResume(file);
    };

    const analyzeResume = async (file: File) => {
        try {
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) { clearInterval(progressInterval); return 90; }
                    return prev + 10;
                });
            }, 200);

            setAnalysisStage('parsing');
            const uploadResult = await api.uploadResume(file);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            setAnalysisStage('analyzing');

            const analysisResult = await api.analyzeResume(uploadResult.id, uploadResult.filename, useCoze);
            
            setResult(analysisResult);
            setAnalysisStage('complete');
            addResume(analysisResult);
            setCurrentResume(analysisResult);

            const newUpload = {
                name: file.name,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                score: analysisResult.scores.overall
            };
            const updatedUploads = [newUpload, ...recentUploads].slice(0, 5);
            setRecentUploads(updatedUploads);
            localStorage.setItem('recentUploads', JSON.stringify(updatedUploads));
        } catch (err) {
            setError(err instanceof Error ? err.message : "分析失败，请重试");
            setAnalysisStage('idle');
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setResult(null);
        setError(null);
        setAnalysisStage('idle');
        setUploadProgress(0);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 60) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreGlow = (score: number) => {
        if (score >= 80) return "shadow-emerald-500/20";
        if (score >= 60) return "shadow-amber-500/20";
        return "shadow-red-500/20";
    };

    const features = [
        { icon: Zap, title: "智能解析", desc: "AI 自动识别简历关键信息", gradient: "from-amber-400 to-orange-500" },
        { icon: Target, title: "精准评分", desc: "多维度综合评估简历质量", gradient: "from-blue-400 to-indigo-500" },
        { icon: Lightbulb, title: "优化建议", desc: "提供针对性的改进方案", gradient: "from-emerald-400 to-teal-500" },
        { icon: TrendingUp, title: "趋势分析", desc: "行业对标与竞争力分析", gradient: "from-purple-400 to-pink-500" }
    ];

    const analysisSteps = [
        { stage: 'uploading', label: '上传文件', icon: Upload },
        { stage: 'parsing', label: '解析文档', icon: FileText },
        { stage: 'analyzing', label: 'AI 分析', icon: Brain },
        { stage: 'complete', label: '分析完成', icon: CheckCircle }
    ];

    const scoreDimensions = [
        { label: '技能匹配', score: result?.scores.skills || 0, icon: Code, gradient: "from-blue-500 to-indigo-500" },
        { label: '工作经验', score: result?.scores.experience || 0, icon: Briefcase, gradient: "from-emerald-500 to-teal-500" },
        { label: '教育背景', score: result?.scores.education || 0, icon: GraduationCap, gradient: "from-purple-500 to-pink-500" }
    ];

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
                    {/* Hero Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Brain className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                                简历智能分析
                            </span>
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            上传 PDF 简历，AI 自动解析并深度分析候选人信息
                            <br className="hidden sm:block" />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">提供精准评分与优化建议</span>
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="max-w-4xl mx-auto">
                                    {/* Mode Selector */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mb-10"
                                    >
                                        <div className="flex items-center justify-center">
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
                                                        <Zap className="w-4 h-4" />
                                                        <span>规则分析</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${!useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>快速</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setUseCoze(true)}
                                                        className={`relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                            useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        <span>AI 智能分析</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>精准</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <motion.p
                                            key={useCoze ? 'coze' : 'rule'}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
                                        >
                                            {useCoze 
                                                ? "✨ Coze AI 模式：利用先进的大语言模型进行深度分析，提供更精准的评分和建议"
                                                : "⚡ 规则模式：基于预设规则的快速分析，响应更快，适合批量处理"}
                                        </motion.p>
                                    </motion.div>

                                    {/* Upload Area */}
                                    <GlassCard delay={0.6} className="p-2">
                                        <motion.div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => analysisStage === 'idle' && fileInputRef.current?.click()}
                                            className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer ${
                                                isDragging 
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]' 
                                                    : analysisStage !== 'idle'
                                                        ? 'border-transparent bg-gray-50/50 dark:bg-gray-900/50'
                                                        : 'border-gray-200/60 dark:border-gray-700/40 hover:border-blue-400/60 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                                            }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileInput}
                                                className="hidden"
                                            />
                                            
                                            {analysisStage === 'idle' ? (
                                                <div className="p-16 text-center">
                                                    <motion.div
                                                        animate={{ y: isDragging ? -15 : 0 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-3xl mb-8 relative"
                                                    >
                                                        <CloudUpload className={`w-12 h-12 ${isDragging ? 'text-blue-600 scale-110' : 'text-blue-500'} transition-all duration-300`} />
                                                        <motion.div
                                                            className="absolute inset-0 rounded-3xl border-2 border-blue-400/30"
                                                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                    </motion.div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                                        {isDragging ? "释放文件开始上传" : "拖放简历文件到这里"}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                                                        或者 <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline decoration-2 underline-offset-2">点击浏览文件</span>
                                                    </p>
                                                    <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 dark:text-gray-500">
                                                        <span className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                            <FileText className="w-4 h-4" />
                                                            <span>支持 PDF 格式</span>
                                                        </span>
                                                        <span className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                                            <Upload className="w-4 h-4" />
                                                            <span>最大 10MB</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8">
                                                    {/* Progress Steps */}
                                                    <div className="flex items-center justify-between mb-8 px-4">
                                                        {analysisSteps.map((step, index) => {
                                                            const stepIndex = analysisSteps.findIndex(s => s.stage === analysisStage);
                                                            const isActive = analysisStage === step.stage;
                                                            const isComplete = stepIndex > index;
                                                            const StepIcon = step.icon;
                                                            
                                                            return (
                                                                <div key={step.stage} className="flex items-center">
                                                                    <motion.div 
                                                                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                                        className={`flex items-center space-x-3 ${
                                                                            isActive ? 'text-blue-600 dark:text-blue-400' : 
                                                                            isComplete ? 'text-emerald-600 dark:text-emerald-400' : 
                                                                            'text-gray-400 dark:text-gray-500'
                                                                        }`}
                                                                    >
                                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                                            isActive 
                                                                                ? 'bg-blue-100 dark:bg-blue-900/40 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30' 
                                                                                : isComplete 
                                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 shadow-lg shadow-emerald-500/20' 
                                                                                    : 'bg-gray-100 dark:bg-gray-800'
                                                                        }`}>
                                                                            {isActive ? (
                                                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                                            ) : isComplete ? (
                                                                                <CheckCircle className="w-6 h-6" />
                                                                            ) : (
                                                                                <StepIcon className="w-6 h-6" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-semibold hidden sm:block">{step.label}</span>
                                                                    </motion.div>
                                                                    {index < analysisSteps.length - 1 && (
                                                                        <div className="w-16 sm:w-24 h-1 mx-3 rounded-full overflow-hidden bg-gray-200/50 dark:bg-gray-700/50">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: isComplete ? '100%' : '0%' }}
                                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* File Info Card */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center space-x-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-5 border border-white/30 dark:border-gray-700/30"
                                                    >
                                                        <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                                            <FileText className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                                                                {selectedFile?.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                                                            </p>
                                                        </div>
                                                        {analysisStage === 'complete' && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 200 }}
                                                            >
                                                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                                            </motion.div>
                                                        )}
                                                    </motion.div>

                                                    {/* Progress Bar */}
                                                    {analysisStage !== 'complete' && (
                                                        <div className="mt-6">
                                                            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                                                <span>
                                                                    {analysisStage === 'uploading' ? '正在上传...' : 
                                                                     analysisStage === 'parsing' ? '正在解析文档...' : 
                                                                     '正在进行 AI 分析...'}
                                                                </span>
                                                                <span className="text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                                                            </div>
                                                            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${uploadProgress}%` }}
                                                                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full relative"
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </GlassCard>

                                    {/* Error Display */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                className="mt-6 p-5 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-2xl flex items-center space-x-4"
                                            >
                                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
                                                </div>
                                                <button
                                                    onClick={() => setError(null)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Features Grid */}
                                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-5">
                                        {features.map((feature, index) => (
                                            <motion.div
                                                key={feature.title}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 + 0.1 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
                                                <div className="relative z-10">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                                                        <feature.icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Recent Uploads */}
                                    {recentUploads.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.1 }}
                                            className="mt-12"
                                        >
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <span>最近分析</span>
                                            </h3>
                                            <GlassCard className="overflow-hidden divide-y divide-gray-100/50 dark:divide-gray-700/30">
                                                {recentUploads.map((upload, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="flex items-center justify-between p-5 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-red-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{upload.name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{upload.time}</p>
                                                            </div>
                                                        </div>
                                                        {upload.score && (
                                                            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                                                upload.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                                                upload.score >= 60 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                                                                'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {upload.score} 分
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </GlassCard>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Result Header */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 space-y-4 sm:space-y-0">
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
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">分析完成</h2>
                                            <div className="flex items-center space-x-3 mt-2">
                                                {result.aiProvider === 'coze' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20">
                                                        <Sparkles className="w-3 h-3 mr-1.5" />
                                                        Coze AI
                                                    </span>
                                                )}
                                                {result.aiProvider === 'rule' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                                                        <Zap className="w-3 h-3 mr-1.5" />
                                                        规则分析
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <GlowButton
                                            variant="secondary"
                                            onClick={() => navigate('/export', { state: { resumeId: result.id } })}
                                            className="px-5 py-3"
                                        >
                                            <FileUp className="w-4 h-4" />
                                            <span>导出报告</span>
                                        </GlowButton>
                                        <GlowButton
                                            onClick={reset}
                                            className="px-5 py-3"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            <span>再分析一份</span>
                                        </GlowButton>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Score Section */}
                                    <div className="lg:col-span-1">
                                        <GlassCard className="p-8 sticky top-24">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 text-center">
                                                综合评分
                                            </h3>
                                            <div className="relative">
                                                <ScoreChart scores={result.scores} />
                                                <motion.div
                                                    className="absolute inset-0 rounded-full"
                                                    style={{
                                                        background: `radial-gradient(circle, ${result.scores.overall >= 80 ? 'rgba(16,185,129,0.1)' : result.scores.overall >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'})`
                                                    }}
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                />
                                            </div>
                                            
                                            <div className="mt-10 space-y-5">
                                                {scoreDimensions.map((dim) => (
                                                    <ScoreBar key={dim.label} {...dim} />
                                                ))}
                                            </div>
                                            
                                            <div className="mt-8 pt-6 border-t border-gray-100/50 dark:border-gray-700/30">
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">综合评价</p>
                                                    <p className={`text-3xl font-bold ${getScoreColor(result.scores.overall)}`}>
                                                        {result.scores.overall}
                                                        <span className="text-lg ml-1">分</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {result.scores.overall >= 90 ? '优秀' : result.scores.overall >= 80 ? '良好' : result.scores.overall >= 70 ? '中等' : result.scores.overall >= 60 ? '及格' : '待提升'}
                                                    </p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Details Section */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Basic Info */}
                                        <GlassCard delay={0.2} className="p-8">
                                            <div className="flex items-center space-x-4 mb-8">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <User className="w-7 h-7 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">基本信息</h3>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-5">
                                                {[
                                                    { icon: User, label: '姓名', value: result.basicInfo.name },
                                                    { icon: Phone, label: '电话', value: result.basicInfo.phone },
                                                    { icon: Mail, label: '邮箱', value: result.basicInfo.email },
                                                    { icon: MapPin, label: '地址', value: result.basicInfo.address || '未填写' }
                                                ].map((item, index) => (
                                                    <motion.div
                                                        key={item.label}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 * index }}
                                                        className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/30 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                                            <item.icon className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{item.value}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* Job Info */}
                                        <GlassCard delay={0.3} className="p-8">
                                            <div className="flex items-center space-x-4 mb-8">
                                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                    <Briefcase className="w-7 h-7 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">求职信息</h3>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-5">
                                                {[
                                                    { label: '求职意向', value: result.jobInfo.position },
                                                    { label: '期望薪资', value: result.jobInfo.expectedSalary },
                                                    { label: '工作年限', value: result.background.workYears },
                                                    { label: '学历背景', value: result.background.education }
                                                ].map((item, index) => (
                                                    <motion.div
                                                        key={item.label}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 * index }}
                                                        className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-white/30 dark:border-gray-700/20"
                                                    >
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{item.label}</p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{item.value || '未填写'}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* Skills */}
                                        <GlassCard delay={0.4} className="p-8">
                                            <div className="flex items-center space-x-4 mb-8">
                                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <Award className="w-7 h-7 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">技能标签</h3>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3">
                                                {result.skills.map((skill, index) => (
                                                    <SkillTag key={index} skill={skill} index={index} />
                                                ))}
                                            </div>
                                        </GlassCard>

                                        {/* Analysis Report */}
                                        {result.analysis && (
                                            <GlassCard delay={0.5} className="p-8">
                                                <div className="flex items-center space-x-4 mb-8">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                                        <BarChart3 className="w-7 h-7 text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">分析报告</h3>
                                                </div>
                                                <div className="prose prose-gray dark:prose-invert max-w-none">
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap text-base">
                                                        {result.analysis}
                                                    </p>
                                                </div>
                                            </GlassCard>
                                        )}

                                        {/* Suggestions */}
                                        {result.suggestions?.length > 0 && (
                                            <GlassCard delay={0.6} className="p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
                                                <div className="flex items-center space-x-4 mb-8">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                        <Lightbulb className="w-7 h-7 text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">优化建议</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {result.suggestions.map((suggestion, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 * index }}
                                                            className="flex items-start space-x-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                                                        >
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{suggestion}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </GlassCard>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
