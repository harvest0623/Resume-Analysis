import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ScoreChart from "@/components/ScoreChart";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

type Phase = "upload" | "processing" | "results";

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
    return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
    if (score >= 60) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
    return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
}

function exportToCSV(results: ResumeData[]) {
    const headers = [
        "姓名", "电话", "邮箱", "地址", "求职意向", "期望薪资",
        "工作年限", "学历", "技能", "综合评分", "技能评分", "经验评分", "学历评分", "分析方式",
    ];

    const rows = results.map((r) => [
        r.basicInfo?.name || "",
        r.basicInfo?.phone || "",
        r.basicInfo?.email || "",
        r.basicInfo?.address || "",
        r.jobInfo?.position || "",
        r.jobInfo?.expectedSalary || "",
        r.background?.workYears || "",
        r.background?.education || "",
        (r.skills || []).join("; "),
        r.scores?.overall ?? "",
        r.scores?.skills ?? "",
        r.scores?.experience ?? "",
        r.scores?.education ?? "",
        r.aiProvider === "coze" ? "Coze AI" : "规则分析",
    ]);

    const BOM = "\uFEFF";
    const csvContent =
        BOM +
        [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

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

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { addResume } = useResumeStore();

    const validateFile = (file: File): string | null => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `不支持的文件格式（仅支持 PDF）`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `文件过大（最大 ${MAX_FILE_SIZE / (1024 * 1024)}MB）`;
        }
        return null;
    };

    const addFiles = useCallback((newFiles: File[]) => {
        const valid: LocalFile[] = [];
        const errors: { filename: string; error: string }[] = [];

        newFiles.forEach((file) => {
            const err = validateFile(file);
            if (err) {
                errors.push({ filename: file.name, error: err });
            } else {
                valid.push({
                    file,
                    localId: Math.random().toString(36).substr(2, 9),
                });
            }
        });

        setLocalFiles((prev) => [...prev, ...valid]);
        if (errors.length > 0) {
            setUploadErrors((prev) => [...prev, ...errors]);
        }
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
        addFiles(Array.from(e.dataTransfer.files));
    }, [addFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    }, [addFiles]);

    const removeLocalFile = (localId: string) => {
        setLocalFiles((prev) => prev.filter((f) => f.localId !== localId));
    };

    const clearAll = () => {
        setLocalFiles([]);
        setUploadErrors([]);
    };

    const startBatchProcess = async () => {
        if (localFiles.length === 0) return;

        setPhase("processing");
        setUploadErrors([]);

        try {
            const uploadResult = await api.batchUpload(localFiles.map((lf) => lf.file));

            if (uploadResult.errors.length > 0) {
                setUploadErrors(uploadResult.errors);
            }

            if (uploadResult.uploaded.length === 0) {
                setPhase("upload");
                return;
            }

            const batchResult = await api.batchAnalyze(
                uploadResult.uploaded.map((u) => ({ id: u.id, filename: u.filename })),
                useCoze
            );

            setBatchId(batchResult.batchId);
            setTotalCount(batchResult.totalCount);
            setCompletedCount(0);
            setFailedCount(0);
        } catch (err) {
            setUploadErrors((prev) => [
                ...prev,
                { filename: "系统", error: err instanceof Error ? err.message : "启动批量分析失败" },
            ]);
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
            } catch (err) {
                console.error("Poll error:", err);
            }
        }, POLL_INTERVAL);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [batchId, phase, addResume]);

    const sortedResults = [...results]
        .filter((r) => r.scores?.overall >= filterMinScore)
        .sort((a, b) => {
            const aVal = a.scores?.[sortField] ?? 0;
            const bVal = b.scores?.[sortField] ?? 0;
            return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        });

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.scores?.overall ?? 0), 0) / results.length)
        : 0;

    const resetAll = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("upload");
        setLocalFiles([]);
        setUploadErrors([]);
        setBatchId(null);
        setTotalCount(0);
        setCompletedCount(0);
        setFailedCount(0);
        setCurrentProcessing([]);
        setBatchErrors([]);
        setResults([]);
        setDetailResume(null);
        setSortField("overall");
        setSortOrder("desc");
        setFilterMinScore(0);
    };

    const progressPercent = totalCount > 0 ? Math.round(((completedCount + failedCount) / totalCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />

                {detailResume ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {detailResume.basicInfo?.name || detailResume.filename} - 分析详情
                                </h2>
                                {detailResume.aiProvider === "coze" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Coze AI
                                    </span>
                                )}
                                {detailResume.aiProvider === "rule" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        <Brain className="w-3 h-3 mr-1" />
                                        规则分析
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setDetailResume(null)}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                <X className="w-5 h-5" />
                                <span>返回列表</span>
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">综合评分</h3>
                                    <ScoreChart scores={detailResume.scores} />
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">基本信息</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">姓名</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{detailResume.basicInfo?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">电话</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{detailResume.basicInfo?.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{detailResume.basicInfo?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">地址</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{detailResume.basicInfo?.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">求职信息</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">求职意向</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{detailResume.jobInfo?.position}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">期望薪资</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{detailResume.jobInfo?.expectedSalary}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">工作年限</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{detailResume.background?.workYears}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">学历背景</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{detailResume.background?.education}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">技能标签</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(detailResume.skills || []).map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-medium rounded-lg border border-blue-100 dark:border-blue-800"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI 分析报告</h3>
                                    </div>
                                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {detailResume.analysis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                批量简历分析
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                一次性上传多份简历，系统将自动进行批量分析
                            </p>
                        </div>

                        {phase === "upload" && (
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">选择分析方式</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {useCoze ? "Coze AI 智能分析（更精准）" : "规则分析（快速响应）"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setUseCoze(!useCoze)}
                                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                                                useCoze ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                                                    useCoze ? "translate-x-7" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {useCoze
                                            ? "✨ Coze AI 模式：利用先进的大语言模型进行深度分析，提供更精准的评分和建议"
                                            : "⚡ 规则模式：基于预设规则的快速分析，响应更快"}
                                    </p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                                        isDragging
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        拖放 PDF 文件到此处
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        或点击选择文件（支持多选，最多 50 个，单文件最大 10MB）
                                    </p>
                                </motion.div>

                                {uploadErrors.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                                    {uploadErrors.length} 个文件验证失败
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setUploadErrors([])}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {uploadErrors.map((err, i) => (
                                                <p key={i} className="text-xs text-red-600 dark:text-red-400">
                                                    {err.filename}: {err.error}
                                                </p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {localFiles.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mt-8"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                已选择 {localFiles.length} 个文件
                                            </h3>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={clearAll}
                                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    清空
                                                </button>
                                                <button
                                                    onClick={startBatchProcess}
                                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                    <span>开始批量分析</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 overflow-hidden max-h-80 overflow-y-auto">
                                            {localFiles.map((lf) => (
                                                <div
                                                    key={lf.localId}
                                                    className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                >
                                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                        <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {lf.file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatFileSize(lf.file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeLocalFile(lf.localId)}
                                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {phase === "processing" && (
                            <div className="max-w-4xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="text-center mb-8">
                                        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            正在批量分析...
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            请勿关闭页面，系统正在处理您的简历
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                总体进度
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {completedCount + failedCount} / {totalCount}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{progressPercent}%</span>
                                            <div className="flex items-center space-x-4">
                                                {completedCount > 0 && (
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        ✓ 成功 {completedCount}
                                                    </span>
                                                )}
                                                {failedCount > 0 && (
                                                    <span className="text-red-600 dark:text-red-400">
                                                        ✗ 失败 {failedCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {currentProcessing.length > 0 && (
                                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                                正在处理：
                                            </p>
                                            <div className="space-y-1">
                                                {currentProcessing.map((id) => (
                                                    <div key={id} className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span className="truncate">{id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {batchErrors.length > 0 && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                                失败记录：
                                            </p>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {batchErrors.map((err, i) => (
                                                    <div key={i} className="flex items-start space-x-2 text-xs">
                                                        <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-red-600 dark:text-red-400">
                                                            {err.filename}: {err.error}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}

                        {phase === "results" && (
                            <div className="max-w-6xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <BarChart3 className="w-8 h-8 text-emerald-500" />
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">批量分析完成</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    成功 {completedCount} 份
                                                    {failedCount > 0 && `，失败 ${failedCount} 份`}
                                                    {results.length > 0 && `，平均分 ${avgScore}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => exportToCSV(sortedResults)}
                                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>导出 CSV</span>
                                            </button>
                                            <button
                                                onClick={resetAll}
                                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span>重新分析</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{results.length}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">分析总数</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
                                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {results.filter((r) => r.scores?.overall >= 80).length}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">优秀 (≥80)</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
                                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                {results.filter((r) => r.scores?.overall >= 60 && r.scores?.overall < 80).length}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">良好 (60-79)</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
                                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                                {results.filter((r) => r.scores?.overall < 60).length}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">待提升 (&lt;60)</p>
                                        </div>
                                    </div>

                                    {batchErrors.length > 0 && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                                    {batchErrors.length} 个文件处理失败
                                                </p>
                                            </div>
                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                {batchErrors.map((err, i) => (
                                                    <p key={i} className="text-xs text-red-600 dark:text-red-400">
                                                        {err.filename}: {err.error}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
                                            {(["overall", "skills", "experience", "education"] as SortField[]).map((field) => (
                                                <button
                                                    key={field}
                                                    onClick={() => toggleSort(field)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                        sortField === field
                                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {field === "overall" ? "综合" : field === "skills" ? "技能" : field === "experience" ? "经验" : "学历"}
                                                    {sortField === field && (sortOrder === "desc" ? " ↓" : " ↑")}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-auto">
                                            <Filter className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">最低分：</span>
                                            <select
                                                value={filterMinScore}
                                                onChange={(e) => setFilterMinScore(Number(e.target.value))}
                                                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value={0}>全部</option>
                                                <option value={60}>≥60</option>
                                                <option value={70}>≥70</option>
                                                <option value={80}>≥80</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        候选人
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        综合
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        技能
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        经验
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        学历
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        分析方式
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        操作
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedResults.map((resume, index) => (
                                                    <motion.tr
                                                        key={resume.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-white text-sm font-semibold">
                                                                        {(resume.basicInfo?.name || "?")[0]}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                                        {resume.basicInfo?.name || "未知"}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {resume.jobInfo?.position || resume.filename}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-bold ${getScoreBgColor(resume.scores?.overall ?? 0)}`}>
                                                                {resume.scores?.overall ?? "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-sm font-medium ${getScoreColor(resume.scores?.skills ?? 0)}`}>
                                                                {resume.scores?.skills ?? "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-sm font-medium ${getScoreColor(resume.scores?.experience ?? 0)}`}>
                                                                {resume.scores?.experience ?? "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-sm font-medium ${getScoreColor(resume.scores?.education ?? 0)}`}>
                                                                {resume.scores?.education ?? "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {resume.aiProvider === "coze" ? (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                    Coze AI
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                                    <Brain className="w-3 h-3 mr-1" />
                                                                    规则
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => setDetailResume(resume)}
                                                                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                <span>详情</span>
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {sortedResults.length === 0 && results.length > 0 && (
                                        <div className="text-center py-12">
                                            <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">没有符合筛选条件的结果</p>
                                            <button
                                                onClick={() => setFilterMinScore(0)}
                                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                清除筛选
                                            </button>
                                        </div>
                                    )}

                                    {results.length === 0 && (
                                        <div className="text-center py-12">
                                            <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">没有成功分析的简历</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
