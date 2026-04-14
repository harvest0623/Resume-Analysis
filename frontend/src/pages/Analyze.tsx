import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCcw, User, Phone, Mail, MapPin, Briefcase, GraduationCap, FileText, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResumeUploader from "@/components/ResumeUploader";
import ScoreChart from "@/components/ScoreChart";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

export default function Analyze() {
    const location = useLocation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ResumeData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { addResume, setCurrentResume } = useResumeStore();

    useEffect(() => {
        if (location.state?.resumeId) {
            const loadResume = async () => {
                try {
                    const resume = await api.getResume(location.state.resumeId);
                    setResult(resume);
                } catch (err) {
                    console.error("Failed to load resume:", err);
                }
            };
            loadResume();
        }
    }, [location.state]);

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setError(null);
        setResult(null);
        await analyzeResume(file);
    };

    const analyzeResume = async (file: File) => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const uploadResult = await api.uploadResume(file);
            const analysisResult = await api.analyzeResume(uploadResult.id, uploadResult.filename);
            
            setResult(analysisResult);
            addResume(analysisResult);
            setCurrentResume(analysisResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : "分析失败，请重试");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setSelectedFile(null);
        setResult(null);
        setError(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            简历智能分析
                        </h1>
                        <p className="text-lg text-gray-600">
                            上传 PDF 简历，AI 自动解析并分析候选人信息
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="max-w-3xl mx-auto">
                                    <ResumeUploader
                                        onFileSelect={handleFileSelect}
                                        disabled={isAnalyzing}
                                    />
                                    
                                    {isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8 text-center"
                                        >
                                            <div className="inline-flex items-center space-x-3 bg-white px-8 py-4 rounded-2xl shadow-lg">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                <div className="text-left">
                                                    <p className="font-semibold text-gray-900">正在分析简历...</p>
                                                    <p className="text-sm text-gray-500">请稍候，这可能需要几秒钟</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-4"
                                        >
                                            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-red-800 font-semibold">分析失败</p>
                                                <p className="text-red-600">{error}</p>
                                            </div>
                                            <button
                                                onClick={() => setError(null)}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <h2 className="text-2xl font-bold text-gray-900">分析完成</h2>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                        <span>再分析一份</span>
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                                                综合评分
                                            </h3>
                                            <ScoreChart scores={result.scores} />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">基本信息</h3>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3">
                                                        <User className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">姓名</p>
                                                            <p className="font-semibold text-gray-900">{result.basicInfo.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Phone className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">电话</p>
                                                            <p className="font-semibold text-gray-900">{result.basicInfo.phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Mail className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">邮箱</p>
                                                            <p className="font-semibold text-gray-900">{result.basicInfo.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <MapPin className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">地址</p>
                                                            <p className="font-semibold text-gray-900">{result.basicInfo.address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                                    <Briefcase className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">求职信息</h3>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">求职意向</p>
                                                    <p className="font-semibold text-gray-900">{result.jobInfo.position}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">期望薪资</p>
                                                    <p className="font-semibold text-gray-900">{result.jobInfo.expectedSalary}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">工作年限</p>
                                                    <p className="font-semibold text-gray-900">{result.background.workYears}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">学历背景</p>
                                                    <p className="font-semibold text-gray-900">{result.background.education}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">技能标签</h3>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3">
                                                {result.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium rounded-lg border border-blue-100"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                    <GraduationCap className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900">AI 分析报告</h3>
                                            </div>
                                            
                                            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.analysis}
                                                </p>
                                            </div>
                                        </div>
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
