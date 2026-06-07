import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileText, CheckCircle, XCircle, Loader2, Trash2, ArrowRight,
    AlertCircle, Brain, Sparkles, Download, User, Phone, Mail, MapPin,
    Briefcase, GraduationCap, ArrowUpDown, Filter, X, Eye, BarChart3,
    LayoutGrid, List, ChevronRight, Zap, Clock, TrendingUp, Target, Award,
    Layers, CloudUpload, Cpu, FileUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ScoreChart from "@/components/ScoreChart";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

type Phase = "upload" | "processing" | "results";
type ViewMode = "table" | "grid";

interface LocalFile {
    file: File;
    localId: string;
}

type SortField = "overall" | "skills" | "experience" | "education";
type SortOrder = "asc" | "desc";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf"];
const POLL_INTERVAL = 1000;

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
}

function getScoreHex(score: number): string {
    if (score >= 80) return "#059669";
    if (score >= 60) return "#d97706";
    return "#e11d48";
}

function getScoreBgColor(score: number): string {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
    if (score >= 60) return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20";
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20";
}

function getScoreLabel(score: number): string {
    if (score >= 80) return "优秀";
    if (score >= 60) return "良好";
    return "待提升";
}

function exportToCSV(results: ResumeData[]) {
    const headers = [
        "姓名", "电话", "邮箱", "地址", "求职意向", "期望薪资",
        "工作年限", "学历", "技能", "综合评分", "技能评分", "经验评分", "学历评分", "分析方式",
    ];
    const rows = results.map((r) => [
        r.basicInfo?.name || "", r.basicInfo?.phone || "", r.basicInfo?.email || "",
        r.basicInfo?.address || "", r.jobInfo?.position || "", r.jobInfo?.expectedSalary || "",
        r.background?.workYears || "", r.background?.education || "",
        (r.skills || []).join("; "), r.scores?.overall ?? "", r.scores?.skills ?? "",
        r.scores?.experience ?? "", r.scores?.education ?? "",
        r.aiProvider === "coze" ? "Coze AI" : "规则分析",
    ]);
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `批量分析结果_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/* ───────── 背景系统 ───────── */
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-teal-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-cyan-400/20 rounded-full blur-3xl"
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
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-cyan-500/10 dark:bg-cyan-400/10"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
};

/* ───────── 通用组件 ───────── */
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
        primary: "bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5",
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

export default function Batch() {
    const [phase, setPhase] = useState<Phase>("upload");
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [useCoze, setUseCoze] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<{ filename: string; error: string }[]>([]);

    const [batchId, setBatchId] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [failedCount, setFailedCount] = useState(0);
    const [currentProcessing, setCurrentProcessing] = useState<string[]>([]);
    const [batchErrors, setBatchErrors] = useState<{ id: string; filename: string; error: string }[]>([]);

    const [results, setResults] = useState<ResumeData[]>([]);
    const [sortField, setSortField] = useState<SortField>("overall");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [filterMinScore, setFilterMinScore] = useState<number>(0);
    const [detailResume, setDetailResume] = useState<ResumeData | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { addResume } = useResumeStore();

    const validateFile = (file: File): string | null => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) return "不支持的文件格式（仅支持 PDF）";
        if (file.size > MAX_FILE_SIZE) return `文件过大（最大 ${MAX_FILE_SIZE / (1024 * 1024)}MB）`;
        return null;
    };

    const addFiles = useCallback((newFiles: File[]) => {
        const valid: LocalFile[] = [];
        const errors: { filename: string; error: string }[] = [];
        newFiles.forEach((file) => {
            const err = validateFile(file);
            if (err) errors.push({ filename: file.name, error: err });
            else valid.push({ file, localId: Math.random().toString(36).substr(2, 9) });
        });
        setLocalFiles((prev) => [...prev, ...valid]);
        if (errors.length > 0) setUploadErrors((prev) => [...prev, ...errors]);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); }, [addFiles]);
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); }, [addFiles]);
    const removeLocalFile = (localId: string) => setLocalFiles((prev) => prev.filter((f) => f.localId !== localId));
    const clearAll = () => { setLocalFiles([]); setUploadErrors([]); };

    const startBatchProcess = async () => {
        if (localFiles.length === 0) return;
        setPhase("processing");
        setUploadErrors([]);
        try {
            const uploadResult = await api.batchUpload(localFiles.map((lf) => lf.file));
            if (uploadResult.errors.length > 0) setUploadErrors(uploadResult.errors);
            if (uploadResult.uploaded.length === 0) { setPhase("upload"); return; }
            const batchResult = await api.batchAnalyze(
                uploadResult.uploaded.map((u) => ({ id: u.id, filename: u.filename })), useCoze
            );
            setBatchId(batchResult.batchId);
            setTotalCount(batchResult.totalCount);
            setCompletedCount(0);
            setFailedCount(0);
        } catch (err) {
            setUploadErrors((prev) => [...prev, { filename: "系统", error: err instanceof Error ? err.message : "启动批量分析失败" }]);
            setPhase("upload");
        }
    };

    useEffect(() => {
        if (!batchId || phase !== "processing") return;
        pollRef.current = setInterval(async () => {
            try {
                const status = await api.getBatchStatus(batchId);
                setCompletedCount(status.completedCount);
                setFailedCount(status.failedCount);
                setCurrentProcessing(status.currentProcessing);
                setBatchErrors(status.errors);
                if (status.status === "completed") {
                    if (pollRef.current) clearInterval(pollRef.current);
                    const resultData = await api.getBatchResults(batchId);
                    setResults(resultData.results);
                    resultData.results.forEach((r) => addResume(r));
                    setPhase("results");
                }
            } catch (err) { console.error("Poll error:", err); }
        }, POLL_INTERVAL);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [batchId, phase, addResume]);

    const sortedResults = [...results]
        .filter((r) => r.scores?.overall >= filterMinScore)
        .sort((a, b) => {
            const aVal = a.scores?.[sortField] ?? 0;
            const bVal = b.scores?.[sortField] ?? 0;
            return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
        else { setSortField(field); setSortOrder("desc"); }
    };

    const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.scores?.overall ?? 0), 0) / results.length) : 0;

    const resetAll = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("upload"); setLocalFiles([]); setUploadErrors([]); setBatchId(null);
        setTotalCount(0); setCompletedCount(0); setFailedCount(0);
        setCurrentProcessing([]); setBatchErrors([]); setResults([]);
        setDetailResume(null); setSortField("overall"); setSortOrder("desc");
        setFilterMinScore(0); setViewMode("table");
    };

    const progressPercent = totalCount > 0 ? Math.round(((completedCount + failedCount) / totalCount) * 100) : 0;

    const sortLabels: Record<SortField, string> = { overall: "综合", skills: "技能", experience: "经验", education: "学历" };

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />
                <AnimatePresence mode="wait">
                    {detailResume ? (
                        <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            <DetailHeader resume={detailResume} onBack={() => setDetailResume(null)} />
                            <DetailContent resume={detailResume} />
                        </motion.div>
                    ) : (
                        <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <PageHeader phase={phase} />
                            {phase === "upload" && (
                                <UploadPhase
                                    localFiles={localFiles} isDragging={isDragging} useCoze={useCoze}
                                    uploadErrors={uploadErrors} onToggleCoze={() => setUseCoze(!useCoze)}
                                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                    onFileSelect={handleFileSelect} onRemoveFile={removeLocalFile}
                                    onClearAll={clearAll} onStart={startBatchProcess}
                                    onDismissErrors={() => setUploadErrors([])}
                                />
                            )}
                            {phase === "processing" && (
                                <ProcessingPhase
                                    progressPercent={progressPercent} totalCount={totalCount}
                                    completedCount={completedCount} failedCount={failedCount}
                                    currentProcessing={currentProcessing} batchErrors={batchErrors}
                                />
                            )}
                            {phase === "results" && (
                                <ResultsPhase
                                    results={results} sortedResults={sortedResults}
                                    completedCount={completedCount} failedCount={failedCount}
                                    avgScore={avgScore} batchErrors={batchErrors}
                                    sortField={sortField} sortOrder={sortOrder}
                                    filterMinScore={filterMinScore} viewMode={viewMode}
                                    sortLabels={sortLabels} onToggleSort={toggleSort}
                                    onFilterChange={setFilterMinScore} onViewModeChange={setViewMode}
                                    onExport={() => exportToCSV(sortedResults)} onReset={resetAll}
                                    onViewDetail={setDetailResume}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

/* ───────── 页面头部 ───────── */
function PageHeader({ phase }: { phase: Phase }) {
    return (
        <div className="text-center mb-12">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 rounded-3xl shadow-2xl shadow-cyan-500/30 mb-8 relative"
            >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                <Layers className="w-10 h-10 text-white relative z-10" />
                <motion.div
                    className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            >
                <span className="bg-gradient-to-r from-gray-900 via-cyan-800 to-teal-800 dark:from-white dark:via-cyan-200 dark:to-teal-200 bg-clip-text text-transparent">
                    {phase === "upload" && "批量简历分析"}
                    {phase === "processing" && "正在分析中"}
                    {phase === "results" && "分析完成"}
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
                {phase === "upload" && "上传多份简历，AI 自动解析并生成专业分析报告"}
                {phase === "processing" && "请耐心等待，系统正在逐份解析您的简历"}
                {phase === "results" && "以下是所有简历的分析结果汇总"}
            </motion.p>
        </div>
    );
}

/* ───────── 上传阶段 ───────── */
function UploadPhase({ localFiles, isDragging, useCoze, uploadErrors, onToggleCoze, onDragOver, onDragLeave, onDrop, onFileSelect, onRemoveFile, onClearAll, onStart, onDismissErrors }: {
    localFiles: LocalFile[]; isDragging: boolean; useCoze: boolean;
    uploadErrors: { filename: string; error: string }[];
    onToggleCoze: () => void;
    onDragOver: (e: React.DragEvent) => void; onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void; onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (id: string) => void; onClearAll: () => void; onStart: () => void;
    onDismissErrors: () => void;
}) {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Mode Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }} className="mb-10"
            >
                <div className="flex items-center justify-center">
                    <div className="relative p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5">
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-xl shadow-md"
                            animate={{ x: useCoze ? '100%' : '0%' }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            style={{
                                left: 4,
                                right: 4,
                                width: 'calc(50% - 4px)',
                                background: useCoze ? 'linear-gradient(to right, #22d3ee, #67e8f9)' : 'linear-gradient(to right, #0e7490, #0891b2)',
                            }}
                        />
                        <div className="relative flex">
                            <button onClick={() => onToggleCoze()} disabled={useCoze === false}
                                className={`relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${!useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                <Zap className="w-4 h-4" />
                                <span>规则分析</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${!useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>快速</span>
                            </button>
                            <button onClick={() => onToggleCoze()} disabled={useCoze === true}
                                className={`relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                                <Sparkles className="w-4 h-4" />
                                <span>AI 智能分析</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>精准</span>
                            </button>
                        </div>
                    </div>
                </div>
                <motion.p key={useCoze ? 'coze' : 'rule'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {useCoze ? "✨ Coze AI 模式：利用大语言模型进行深度分析，提供更精准的评分和建议" : "⚡ 规则模式：基于预设规则快速分析，响应更快，适合批量处理"}
                </motion.p>
            </motion.div>

            {/* Upload Area */}
            <GlassCard delay={0.6}>
                <motion.div
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                        className={`relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer ${
                            isDragging ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20 scale-[1.02]' : 'border-gray-200/60 dark:border-gray-700/40 hover:border-cyan-400/60 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10'
                        }`}
                    >
                    <input type="file" accept=".pdf" multiple onChange={onFileSelect} className="hidden" id="batch-file-input" />
                    <label htmlFor="batch-file-input" className="block cursor-pointer">
                        <div className="p-16 text-center">
                            <motion.div
                                animate={{ y: isDragging ? -15 : 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 rounded-3xl mb-8 relative"
                            >
                                <CloudUpload className={`w-12 h-12 ${isDragging ? 'text-cyan-600 scale-110' : 'text-cyan-500'} transition-all duration-300`} />
                                <motion.div
                                    className="absolute inset-0 rounded-3xl border-2 border-cyan-400/30"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {isDragging ? "释放文件开始上传" : "拖放简历文件到这里"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                                或者 <span className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline decoration-2 underline-offset-2">点击浏览文件</span>
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
                                <span className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                    <FileUp className="w-4 h-4" />
                                    <span>支持多选</span>
                                </span>
                            </div>
                        </div>
                    </label>
                </motion.div>
            </GlassCard>

            {/* Error messages */}
            <AnimatePresence>
                {uploadErrors.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="mt-6 p-5 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-2xl">
                        <div className="flex items-center space-x-4 mb-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-red-800 dark:text-red-300 font-semibold">上传错误</p>
                            </div>
                            <button onClick={onDismissErrors} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                        <ul className="space-y-1.5 ml-14">
                            {uploadErrors.map((err, i) => (
                                <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start space-x-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                    <span><span className="font-medium">{err.filename}</span>：{err.error}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File list */}
            <AnimatePresence>
                {localFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="mt-6">
                        <GlassCard>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                        <FileText className="w-5 h-5 text-cyan-500" />
                                        <span>已选择 {localFiles.length} 个文件</span>
                                    </h3>
                                    <button onClick={onClearAll} className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center space-x-1 transition-colors">
                                        <Trash2 className="w-4 h-4" /><span>清空</span>
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    <AnimatePresence>
                                        {localFiles.map((lf) => (
                                            <motion.div key={lf.localId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700/60 transition-colors group border border-white/30 dark:border-gray-700/30">
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{lf.file.name}</span>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(lf.file.size)}</span>
                                                </div>
                                                <button onClick={() => onRemoveFile(lf.localId)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-gray-400 hover:text-rose-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <GlowButton onClick={onStart} className="w-full mt-5 py-4 text-base">
                                    <Zap className="w-5 h-5" />
                                    <span>开始批量分析</span>
                                    <ArrowRight className="w-5 h-5" />
                                </GlowButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ───────── 处理中阶段 ───────── */
function ProcessingPhase({ progressPercent, totalCount, completedCount, failedCount, currentProcessing, batchErrors }: {
    progressPercent: number; totalCount: number; completedCount: number; failedCount: number;
    currentProcessing: string[]; batchErrors: { id: string; filename: string; error: string }[];
}) {
    return (
        <div className="max-w-2xl mx-auto">
            <GlassCard delay={0.2}>
                <div className="p-10 text-center">
                    {/* Central processing icon with pulsing glow */}
                    <div className="relative w-28 h-28 mx-auto mb-8">
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute inset-2 rounded-full border-2 border-teal-400/30"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-300/50 dark:border-cyan-600/50"
                        />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Cpu className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">分析进行中</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">已完成 {completedCount} / {totalCount} 份简历</p>

                    {/* Progress bar */}
                    <div className="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden mb-6">
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>

                    <div className="flex justify-center space-x-8 text-sm mb-8">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-gray-600 dark:text-gray-300">成功 <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-gray-600 dark:text-gray-300">失败 <span className="font-bold text-rose-600 dark:text-rose-400">{failedCount}</span></span>
                        </div>
                    </div>

                    {/* Currently processing */}
                    <AnimatePresence>
                        {currentProcessing.length > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">正在处理</p>
                                {currentProcessing.map((name, i) => (
                                    <motion.div key={name + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-center space-x-3 py-2 px-4 rounded-xl bg-cyan-50/80 dark:bg-cyan-900/20 border border-cyan-100/50 dark:border-cyan-800/30">
                                        <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                                        <span className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">{name}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {batchErrors.length > 0 && (
                        <div className="mt-6 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">处理异常</p>
                            {batchErrors.map((err) => (
                                <div key={err.id} className="text-xs text-red-500">{err.filename}：{err.error}</div>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}

/* ───────── 结果阶段 ───────── */
function ResultsPhase({ results, sortedResults, completedCount, failedCount, avgScore, batchErrors, sortField, sortOrder, filterMinScore, viewMode, sortLabels, onToggleSort, onFilterChange, onViewModeChange, onExport, onReset, onViewDetail }: {
    results: ResumeData[]; sortedResults: ResumeData[]; completedCount: number; failedCount: number; avgScore: number;
    batchErrors: { id: string; filename: string; error: string }[];
    sortField: SortField; sortOrder: SortOrder; filterMinScore: number; viewMode: ViewMode;
    sortLabels: Record<SortField, string>;
    onToggleSort: (field: SortField) => void; onFilterChange: (v: number) => void; onViewModeChange: (v: ViewMode) => void;
    onExport: () => void; onReset: () => void; onViewDetail: (r: ResumeData) => void;
}) {
    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { icon: Layers, label: "总数", value: results.length, unit: "份简历", gradient: "from-cyan-500 to-teal-600", color: "text-gray-900 dark:text-white", glow: "shadow-cyan-500/20" },
                    { icon: CheckCircle, label: "成功", value: completedCount, unit: "份完成", gradient: "from-emerald-500 to-teal-600", color: "text-emerald-600 dark:text-emerald-400", glow: "shadow-emerald-500/20" },
                    { icon: Target, label: "平均分", value: avgScore, unit: "综合评分", gradient: "from-amber-500 to-orange-600", color: "text-amber-600 dark:text-amber-400", glow: "shadow-amber-500/20" },
                    { icon: XCircle, label: "失败", value: failedCount, unit: "份异常", gradient: "from-rose-500 to-pink-600", color: "text-rose-600 dark:text-rose-400", glow: "shadow-rose-500/20" },
                ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-400">{stat.label}</span>
                            </div>
                            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-400 mt-1">{stat.unit}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Toolbar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-white/30 dark:border-gray-700/30 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">排序</span>
                        {( ["overall", "skills", "experience", "education"] as SortField[] ).map((field) => (
                            <button key={field} onClick={() => onToggleSort(field)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${sortField === field ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25" : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50"}`}>
                                {sortLabels[field]}
                                {sortField === field && (sortOrder === "desc" ? " ↓" : " ↑")}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">最低分 {filterMinScore}</span>
                            <input type="range" min={0} max={100} value={filterMinScore} onChange={(e) => onFilterChange(Number(e.target.value))}
                                className="w-24 accent-cyan-500" />
                        </div>
                        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-lg p-0.5 border border-gray-200/50 dark:border-gray-700/50">
                            <button onClick={() => onViewModeChange("table")} className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow-sm text-cyan-500" : "text-gray-400"}`}>
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => onViewModeChange("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-cyan-500" : "text-gray-400"}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                        <GlowButton onClick={onExport} className="px-4 py-2 text-xs">
                            <Download className="w-3.5 h-3.5" /><span>导出 CSV</span>
                        </GlowButton>
                        <button onClick={onReset} className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            {viewMode === "table" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/30 dark:border-gray-700/30 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">姓名</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">求职意向</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">工作年限</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">学历</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">综合评分</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">分析方式</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {sortedResults.map((resume, idx) => (
                                        <motion.tr key={resume.id || idx} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/20 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                        {resume.basicInfo?.name?.charAt(0) || "?"}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{resume.basicInfo?.name || "未知"}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{resume.jobInfo?.position || "-"}</td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{resume.background?.workYears || "-"}</td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{resume.background?.education || "-"}</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${getScoreBgColor(resume.scores?.overall ?? 0)}`}>
                                                    {resume.scores?.overall ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${resume.aiProvider === "coze" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                                                    {resume.aiProvider === "coze" ? "Coze AI" : "规则分析"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => onViewDetail(resume)} className="inline-flex items-center space-x-1 text-cyan-500 hover:text-cyan-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-3.5 h-3.5" /><span>详情</span>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {sortedResults.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>没有符合条件的结果</p>
                        </div>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {sortedResults.map((resume, idx) => (
                            <motion.div key={resume.id || idx} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * idx, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => onViewDetail(resume)}
                                className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg shadow-gray-900/5 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent" />
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                {resume.basicInfo?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{resume.basicInfo?.name || "未知"}</p>
                                                <p className="text-xs text-gray-500">{resume.jobInfo?.position || "无求职意向"}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${getScoreBgColor(resume.scores?.overall ?? 0)}`}>
                                            {resume.scores?.overall ?? 0}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {[
                                            { label: "技能", score: resume.scores?.skills ?? 0, color: "bg-cyan-500" },
                                            { label: "经验", score: resume.scores?.experience ?? 0, color: "bg-emerald-500" },
                                            { label: "学历", score: resume.scores?.education ?? 0, color: "bg-teal-500" },
                                        ].map((dim) => (
                                            <div key={dim.label} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">{dim.label}</span>
                                                <div className="flex-1 mx-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }} />
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{dim.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100/50 dark:border-gray-700/50">
                                        <span className="text-xs text-gray-400">{resume.background?.workYears} · {resume.background?.education}</span>
                                        <span className="text-xs text-cyan-500 font-medium flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                                            <span>查看详情</span><ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {batchErrors.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-5 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 rounded-2xl">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">处理异常 ({batchErrors.length})</p>
                    {batchErrors.map((err) => (
                        <div key={err.id} className="text-xs text-red-600 dark:text-red-400">{err.filename}：{err.error}</div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

/* ───────── 详情页面 ───────── */
function DetailHeader({ resume, onBack }: { resume: ResumeData; onBack: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button onClick={onBack} className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /><span>返回列表</span>
            </button>
            <GlassCard>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {resume.basicInfo?.name?.charAt(0) || "?"}
                    </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{resume.basicInfo?.name || "未知"}</h2>
                            <p className="text-sm text-gray-500">{resume.jobInfo?.position || "无求职意向"} · {resume.background?.workYears || "-"} · {resume.background?.education || "-"}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-extrabold" style={{ color: getScoreHex(resume.scores?.overall ?? 0) }}>{resume.scores?.overall ?? 0}</p>
                        <p className="text-xs text-gray-400">综合评分</p>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function DetailContent({ resume }: { resume: ResumeData }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <GlassCard>
                    <div className="p-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <User className="w-4 h-4 text-cyan-500" /><span>基本信息</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: Phone, value: resume.basicInfo?.phone },
                                { icon: Mail, value: resume.basicInfo?.email },
                                { icon: MapPin, value: resume.basicInfo?.address },
                                { icon: Briefcase, value: resume.jobInfo?.expectedSalary },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                                    <item.icon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.value || "-"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="p-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-cyan-500" /><span>技能</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(resume.skills || []).map((skill, i) => (
                                <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.03 * i }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200/60 dark:border-cyan-700/40 text-cyan-700 dark:text-cyan-300 text-xs font-medium transition-all cursor-default"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                            {(resume.skills || []).length === 0 && <span className="text-sm text-gray-400">未提取到技能</span>}
                        </div>
                    </div>
                </GlassCard>

                {resume.analysis && (
                    <GlassCard>
                        <div className="p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-cyan-500" /><span>AI 评价</span>
                        </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{resume.analysis}</p>
                        </div>
                    </GlassCard>
                )}
            </div>

            <div className="space-y-6">
                <GlassCard>
                    <div className="p-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">评分详情</h3>
                        <div className="flex justify-center mb-4">
                            <ScoreChart scores={resume.scores ?? { overall: 0, skills: 0, experience: 0, education: 0 }} />
                        </div>
                        <div className="space-y-3">
                            {([
                                { key: "skills" as const, label: "技能", gradient: "from-cyan-500 to-teal-500" },
                                { key: "experience" as const, label: "经验", gradient: "from-emerald-500 to-teal-500" },
                                { key: "education" as const, label: "学历", gradient: "from-sky-500 to-cyan-500" },
                            ]).map((dim) => (
                                <div key={dim.key}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">{dim.label}</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{resume.scores?.[dim.key] ?? 0}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${resume.scores?.[dim.key] ?? 0}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${dim.gradient}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">分析信息</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">分析方式</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{resume.aiProvider === "coze" ? "Coze AI" : "规则引擎"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">分析时间</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleString() : "-"}</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    );
}