import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    Trash2,
    ArrowRight,
    AlertCircle,
    Brain,
    Sparkles,
    Download,
    User,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    GraduationCap,
    ArrowUpDown,
    Filter,
    X,
    Eye,
    BarChart3,
    LayoutGrid,
    List,
    ChevronRight,
    Zap,
    Clock,
    TrendingUp,
    Target,
    Award,
    Layers,
    Hexagon,
    Cpu,
    Orbit,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ScoreChart from "@/components/ScoreChart";
import ParticleBackground from "@/components/ParticleBackground";
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

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 gradient-mesh relative overflow-hidden">
            <ParticleBackground />
            <Navbar />
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <BackButton />
                <AnimatePresence mode="wait">
                    {detailResume ? (
                        <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            <DetailHeader resume={detailResume} onBack={() => setDetailResume(null)} />
                            <DetailContent resume={detailResume} />
                        </motion.div>
                    ) : (
                        <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            <PageHeader phase={phase} />

                            {phase === "upload" && (
                                <UploadPhase
                                    localFiles={localFiles} isDragging={isDragging} useCoze={useCoze}
                                    uploadErrors={uploadErrors}
                                    onToggleCoze={() => setUseCoze(!useCoze)}
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
                                    sortLabels={sortLabels}
                                    onToggleSort={toggleSort}
                                    onFilterChange={setFilterMinScore}
                                    onViewModeChange={setViewMode}
                                    onExport={() => exportToCSV(sortedResults)}
                                    onReset={resetAll}
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

function PageHeader({ phase }: { phase: Phase }) {
    return (
        <div className="text-center mb-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-full glass-card glow-indigo mb-6"
            >
                <Hexagon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-widest uppercase">
                    {phase === "upload" ? "Step 1 · 文件上传" : phase === "processing" ? "Step 2 · 智能分析" : "Step 3 · 分析结果"}
                </span>
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-extrabold mb-4"
            >
                <span className="shimmer-text">
                    {phase === "upload" && "批量简历分析"}
                    {phase === "processing" && "正在分析中"}
                    {phase === "results" && "分析完成"}
                </span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed"
            >
                {phase === "upload" && "上传多份简历，AI 将自动解析并生成专业分析报告"}
                {phase === "processing" && "请耐心等待，系统正在逐份解析您的简历"}
                {phase === "results" && "以下是所有简历的分析结果汇总"}
            </motion.p>
        </div>
    );
}

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
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Engine Toggle Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card-elevated rounded-2xl p-6 glow-indigo"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${useCoze ? "bg-gradient-to-br from-violet-500 to-indigo-600 glow-purple" : "bg-gray-100 dark:bg-gray-700"}`}>
                            {useCoze ? <Sparkles className="w-6 h-6 text-white" /> : <Brain className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900 dark:text-white">分析引擎</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {useCoze ? "Coze AI 深度分析" : "规则引擎快速分析"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onToggleCoze}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${useCoze ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/40" : "bg-gray-200 dark:bg-gray-600"}`}>
                        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md ${useCoze ? "left-[30px]" : "left-0.5"}`} />
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    {useCoze ? "利用大语言模型进行语义级深度分析，评分更精准，建议更具体" : "基于预设规则引擎进行结构化分析，响应速度快，结果稳定"}
                </p>
            </motion.div>

            {/* Upload Dropzone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                className={`relative rounded-2xl transition-all duration-500 cursor-pointer group overflow-hidden ${isDragging ? "scale-[1.02]" : ""}`}
            >
                {/* Animated border background */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <div className="absolute inset-[-2px] rounded-[18px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-spin" style={{ animationDuration: "3s" }} />
                </div>

                <div className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${isDragging ? "border-transparent bg-indigo-50/80 dark:bg-indigo-500/20" : "border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40 hover:border-indigo-400 dark:hover:border-indigo-500"}`}>
                    <input type="file" accept=".pdf" multiple onChange={onFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="relative px-8 py-20 text-center">
                        {/* Floating particles around upload icon */}
                        <div className="relative inline-block mb-6">
                            <motion.div
                                animate={isDragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center glow-indigo animate-glow-pulse"
                            >
                                <Upload className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                            </motion.div>
                            {/* Orbiting dots */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-indigo-400 glow-indigo" />
                            </motion.div>
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-8px]"
                            >
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-purple-400 glow-purple" />
                            </motion.div>
                        </div>

                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            {isDragging ? "释放文件以上传" : "拖放简历文件至此处"}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            或 <span className="text-indigo-500 font-semibold">点击浏览文件</span> · 支持多选 · PDF 格式 · 单文件最大 10MB
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Error messages */}
            <AnimatePresence>
                {uploadErrors.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="glass-card rounded-2xl p-5 border-l-4 border-rose-400 glow-pink">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">上传错误</span>
                            </div>
                            <button onClick={onDismissErrors} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-4 h-4" /></button>
                        </div>
                        <ul className="space-y-1.5">
                            {uploadErrors.map((err, i) => (
                                <li key={i} className="text-sm text-rose-600 dark:text-rose-400 flex items-start space-x-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
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
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                        className="glass-card-elevated rounded-2xl p-6 glow-indigo">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                <span>已选择 {localFiles.length} 个文件</span>
                            </h3>
                            <button onClick={onClearAll} className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center space-x-1 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /><span>清空</span>
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            <AnimatePresence>
                                {localFiles.map((lf) => (
                                    <motion.div key={lf.localId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors group">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-indigo-500" />
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
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onStart}
                            className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow flex items-center justify-center space-x-2"
                        >
                            <Zap className="w-4 h-4" />
                            <span>开始批量分析</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ProcessingPhase({ progressPercent, totalCount, completedCount, failedCount, currentProcessing, batchErrors }: {
    progressPercent: number; totalCount: number; completedCount: number; failedCount: number;
    currentProcessing: string[]; batchErrors: { id: string; filename: string; error: string }[];
}) {
    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-elevated rounded-3xl p-10 text-center glow-indigo relative overflow-hidden"
            >
                {/* Scan line effect */}
                <div className="absolute inset-0 scan-line pointer-events-none opacity-30" />

                {/* Central processing icon with ripple */}
                <div className="relative w-28 h-28 mx-auto mb-8">
                    <div className="ripple-ring absolute inset-0" />
                    <div className="ripple-ring absolute inset-0" />
                    <div className="ripple-ring absolute inset-0" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-2 border-dashed border-indigo-300 dark:border-indigo-600"
                    />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-purple">
                        <Cpu className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 neon-text">分析进行中</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">已完成 {completedCount} / {totalCount} 份简历</p>

                {/* Progress bar with shimmer */}
                <div className="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden mb-6">
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded-full progress-shimmer"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                    {/* Glow overlay on progress */}
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/20 to-transparent" style={{ left: `${progressPercent - 10}%` }} />
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

                {/* Currently processing files */}
                <AnimatePresence>
                    {currentProcessing.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="space-y-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">正在处理</p>
                            {currentProcessing.map((name, i) => (
                                <motion.div key={name + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-center space-x-3 py-2 px-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10">
                                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                    <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {batchErrors.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">处理异常</p>
                        {batchErrors.map((err) => (
                            <div key={err.id} className="text-xs text-rose-500">{err.filename}：{err.error}</div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

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
            <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-5 glow-indigo card-3d">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">总数</span>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{results.length}</p>
                    <p className="text-xs text-gray-400 mt-1">份简历</p>
                </motion.div>
                <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-5 glow-purple card-3d">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">成功</span>
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">份完成</p>
                </motion.div>
                <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-5 glow-cyan card-3d">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">平均分</span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{avgScore}</p>
                    <p className="text-xs text-gray-400 mt-1">综合评分</p>
                </motion.div>
                <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-5 glow-pink card-3d">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">失败</span>
                    </div>
                    <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{failedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">份异常</p>
                </motion.div>
            </motion.div>

            {/* Toolbar */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card-elevated rounded-2xl p-4 glow-indigo">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">排序</span>
                        {( ["overall", "skills", "experience", "education"] as SortField[] ).map((field) => (
                            <button key={field} onClick={() => onToggleSort(field)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortField === field ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
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
                                className="w-24 accent-indigo-500" />
                        </div>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                            <button onClick={() => onViewModeChange("table")} className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-500" : "text-gray-400"}`}>
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => onViewModeChange("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-500" : "text-gray-400"}`}>
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={onExport} className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow">
                            <Download className="w-3.5 h-3.5" /><span>导出 CSV</span>
                        </button>
                        <button onClick={onReset} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            {viewMode === "table" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-elevated rounded-2xl overflow-hidden glow-indigo">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
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
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
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
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${resume.aiProvider === "coze" ? "bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                                                    {resume.aiProvider === "coze" ? "Coze AI" : "规则分析"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => onViewDetail(resume)} className="inline-flex items-center space-x-1 text-indigo-500 hover:text-indigo-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {sortedResults.map((resume, idx) => (
                            <motion.div key={resume.id || idx} layout variants={fadeUp}
                                className="glass-card-elevated rounded-2xl p-5 glow-indigo card-3d cursor-pointer group"
                                onClick={() => onViewDetail(resume)}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold glow-purple">
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
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">技能</span>
                                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${resume.scores?.skills ?? 0}%` }} />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{resume.scores?.skills ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">经验</span>
                                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${resume.scores?.experience ?? 0}%` }} />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{resume.scores?.experience ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">学历</span>
                                        <div className="flex-1 mx-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${resume.scores?.education ?? 0}%` }} />
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{resume.scores?.education ?? 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-400">{resume.background?.workYears} · {resume.background?.education}</span>
                                    <span className="text-xs text-indigo-500 font-medium flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                                        <span>查看详情</span><ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {batchErrors.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5 border-l-4 border-rose-400 glow-pink">
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2">处理异常 ({batchErrors.length})</p>
                    {batchErrors.map((err) => (
                        <div key={err.id} className="text-xs text-rose-600 dark:text-rose-400">{err.filename}：{err.error}</div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

function DetailHeader({ resume, onBack }: { resume: ResumeData; onBack: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button onClick={onBack} className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /><span>返回列表</span>
            </button>
            <div className="glass-card-elevated rounded-2xl p-6 glow-indigo">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold glow-purple">
                            {resume.basicInfo?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{resume.basicInfo?.name || "未知"}</h2>
                            <p className="text-sm text-gray-500">{resume.jobInfo?.position || "无求职意向"} · {resume.background?.workYears || "-"} · {resume.background?.education || "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <p className="text-3xl font-extrabold" style={{ color: getScoreHex(resume.scores?.overall ?? 0) }}>{resume.scores?.overall ?? 0}</p>
                            <p className="text-xs text-gray-400">综合评分</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function DetailContent({ resume }: { resume: ResumeData }) {
    return (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
                <div className="glass-card-elevated rounded-2xl p-6 glow-indigo">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <User className="w-4 h-4 text-indigo-500" /><span>基本信息</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{resume.basicInfo?.phone || "-"}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{resume.basicInfo?.email || "-"}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{resume.basicInfo?.address || "-"}</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{resume.jobInfo?.expectedSalary || "-"}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card-elevated rounded-2xl p-6 glow-indigo">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500" /><span>技能</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(resume.skills || []).map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                        {(resume.skills || []).length === 0 && <span className="text-sm text-gray-400">未提取到技能</span>}
                    </div>
                </div>

                {resume.analysis && (
                    <div className="glass-card-elevated rounded-2xl p-6 glow-indigo">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" /><span>AI 评价</span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{resume.analysis}</p>
                    </div>
                )}
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-6">
                <div className="glass-card-elevated rounded-2xl p-6 glow-purple">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">评分详情</h3>
                    <div className="flex justify-center mb-4">
                        <ScoreChart scores={resume.scores ?? { overall: 0, skills: 0, experience: 0, education: 0 }} />
                    </div>
                    <div className="space-y-3">
                        {(["skills", "experience", "education"] as const).map((key) => (
                            <div key={key}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">{key === "skills" ? "技能" : key === "experience" ? "经验" : "学历"}</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{resume.scores?.[key] ?? 0}</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${resume.scores?.[key] ?? 0}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full rounded-full" style={{ backgroundColor: getScoreHex(resume.scores?.[key] ?? 0) }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card-elevated rounded-2xl p-5 glow-cyan">
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
            </motion.div>
        </motion.div>
    );
}
