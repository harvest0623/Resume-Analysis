import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCcw, CheckCircle, Users, Target, Zap, ArrowUp, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { MatchResult, ResumeData } from "@/types/resume";

export default function Match() {
    const [jobDescription, setJobDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [isMatching, setIsMatching] = useState(false);
    const [matchResults, setMatchResults] = useState<(MatchResult & { resume?: ResumeData })[]>([]);
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

    const handleMatch = async () => {
        if (!jobDescription.trim() && !requirements.trim()) return;
        if (resumes.length === 0) return;

        setIsMatching(true);
        try {
            const result = await api.matchResumes(jobDescription, requirements);
            
            const resultsWithResume = result.matches.map((match) => ({
                ...match,
                resume: resumes.find((r) => r.id === match.resumeId),
            }));
            
            setMatchResults(resultsWithResume);
        } catch (err) {
            console.error("Matching failed:", err);
        } finally {
            setIsMatching(false);
        }
    };

    const reset = () => {
        setJobDescription("");
        setRequirements("");
        setMatchResults([]);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-red-600 bg-red-50 border-red-200";
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
                            岗位智能匹配
                        </h1>
                        <p className="text-lg text-gray-600">
                            输入岗位要求，AI 自动匹配最合适的候选人
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {matchResults.length === 0 ? (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900">岗位描述</h3>
                                        </div>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="请输入岗位描述，例如：我们正在寻找一位有经验的前端工程师..."
                                            rows={8}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                        />
                                    </div>

                                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                <Target className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900">技能要求</h3>
                                        </div>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            placeholder="请输入技能要求，例如：React、TypeScript、3年以上工作经验..."
                                            rows={8}
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={handleMatch}
                                        disabled={isMatching || resumes.length === 0}
                                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isMatching ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>匹配中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                <span>开始匹配</span>
                                            </>
                                        )}
                                    </button>
                                    {(jobDescription || requirements) && (
                                        <button
                                            onClick={reset}
                                            className="inline-flex items-center space-x-2 px-6 py-4 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <RefreshCcw className="w-5 h-5" />
                                            <span>重置</span>
                                        </button>
                                    )}
                                </div>

                                {resumes.length === 0 && (
                                    <div className="mt-8 text-center py-12 bg-white rounded-2xl border border-gray-200">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">暂无可匹配的简历</p>
                                        <p className="text-sm text-gray-400">请先上传并分析一些简历</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <h2 className="text-2xl font-bold text-gray-900">匹配完成</h2>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                        <span>重新匹配</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {matchResults.map((match, index) => {
                                        if (!match.resume) return null;
                                        
                                        return (
                                            <motion.div
                                                key={match.resumeId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center space-x-4">
                                                                    {index === 0 && (
                                                                        <div className="flex items-center space-x-1 text-amber-500">
                                                                            <Zap className="w-5 h-5" />
                                                                            <span className="text-sm font-semibold">最佳匹配</span>
                                                                        </div>
                                                                    )}
                                                                    <div className={`px-4 py-2 rounded-xl border-2 font-bold text-lg ${getScoreColor(match.matchScore)}`}>
                                                                        {match.matchScore}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="mb-4">
                                                                <ResumeCard
                                                                    resume={match.resume}
                                                                    showActions={false}
                                                                />
                                                            </div>

                                                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                                {[
                                                                    { label: "技能匹配", score: match.details.skillsMatch },
                                                                    { label: "经验匹配", score: match.details.experienceMatch },
                                                                    { label: "学历匹配", score: match.details.educationMatch },
                                                                ].map((item, i) => (
                                                                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                                                                        <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                                                                        <p className={`text-2xl font-bold ${getScoreColor(item.score).split(" ")[0]}`}>
                                                                            {item.score}%
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">匹配亮点</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {match.highlights.map((highlight, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm"
                                                                        >
                                                                            <ArrowUp className="w-4 h-4" />
                                                                            <span>{highlight}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
