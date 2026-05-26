import { useState, useCallback } from "react";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

interface FileWithStatus {
    file: File;
    id: string;
    status: "pending" | "uploading" | "analyzing" | "done" | "error";
    result?: ResumeData;
    error?: string;
}

export default function Batch() {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { addResume } = useResumeStore();

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
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            (f) => f.type === "application/pdf"
        );
        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(
                (f) => f.type === "application/pdf"
            );
            addFiles(selectedFiles);
        }
    }, []);

    const addFiles = (newFiles: File[]) => {
        const filesWithStatus: FileWithStatus[] = newFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            status: "pending",
        }));
        setFiles((prev) => [...prev, ...filesWithStatus]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearAll = () => {
        setFiles([]);
    };

    const processFiles = async () => {
        setIsProcessing(true);
        const pendingFiles = files.filter((f) => f.status === "pending");

        for (const fileWithStatus of pendingFiles) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileWithStatus.id ? { ...f, status: "uploading" } : f
                )
            );

            try {
                const uploadResult = await api.uploadResume(fileWithStatus.file);

                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileWithStatus.id ? { ...f, status: "analyzing" } : f
                    )
                );

                const result = await api.analyzeResume(
                    uploadResult.id,
                    uploadResult.filename,
                    false
                );

                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileWithStatus.id
                            ? { ...f, status: "done", result }
                            : f
                    )
                );
                addResume(result);
            } catch (err) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileWithStatus.id
                            ? {
                                ...f,
                                status: "error",
                                error: err instanceof Error ? err.message : "处理失败",
                            }
                            : f
                    )
                );
            }
        }

        setIsProcessing(false);
    };

    const getStatusIcon = (status: FileWithStatus["status"]) => {
        switch (status) {
            case "pending":
                return <FileText className="w-5 h-5 text-gray-400" />;
            case "uploading":
            case "analyzing":
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case "done":
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusText = (file: FileWithStatus) => {
        switch (file.status) {
            case "pending":
                return "等待处理";
            case "uploading":
                return "上传中...";
            case "analyzing":
                return "分析中...";
            case "done":
                return `评分: ${file.result?.scores.overall}`;
            case "error":
                return file.error;
        }
    };

    const doneCount = files.filter((f) => f.status === "done").length;
    const errorCount = files.filter((f) => f.status === "error").length;
    const pendingCount = files.filter((f) => f.status === "pending").length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            批量分析
                        </h1>
                        <p className="text-lg text-gray-600">
                            一次性上传多份简历，系统将自动进行批量分析
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 hover:border-gray-400"
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
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700 mb-2">
                                拖放 PDF 文件到此处
                            </p>
                            <p className="text-gray-500">
                                或点击选择文件（支持多选）
                            </p>
                        </motion.div>

                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            已选择 {files.length} 个文件
                                        </h3>
                                        {doneCount > 0 && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                                                完成 {doneCount}
                                            </span>
                                        )}
                                        {errorCount > 0 && (
                                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                                                失败 {errorCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={clearAll}
                                            disabled={isProcessing}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            清空
                                        </button>
                                        {pendingCount > 0 && (
                                            <button
                                                onClick={processFiles}
                                                disabled={isProcessing}
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>处理中...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowRight className="w-5 h-5" />
                                                        <span>开始批量分析</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    <AnimatePresence>
                                        {files.map((file) => (
                                            <motion.div
                                                key={file.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                        {getStatusIcon(file.status)}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {file.file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span
                                                            className={`text-sm ${
                                                                file.status === "done"
                                                                    ? "text-emerald-600 font-medium"
                                                                    : file.status === "error"
                                                                    ? "text-red-600"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {getStatusText(file)}
                                                        </span>
                                                        {file.status === "pending" && (
                                                            <button
                                                                onClick={() => removeFile(file.id)}
                                                                disabled={isProcessing}
                                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600" />
                                            <p className="text-sm text-blue-700">
                                                正在处理中，请勿关闭页面...
                                            </p>
                                        </div>
                                        <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${((doneCount + errorCount) / files.length) * 100}%`,
                                                }}
                                                className="h-full bg-blue-600 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {doneCount > 0 && !isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-center"
                                    >
                                        <p className="text-lg font-semibold text-gray-900 mb-4">
                                            批量分析完成！成功 {doneCount} 份
                                            {errorCount > 0 && `，失败 ${errorCount} 份`}
                                        </p>
                                        <a
                                            href="/home/history"
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <span>查看历史记录</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
