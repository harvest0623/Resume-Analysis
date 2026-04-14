import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, RefreshCcw, CheckCircle, ArrowRight, TrendingUp, TrendingDown, Equal, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData, ComparisonResult } from "@/types/resume";

export default function Compare() {
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
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

    const toggleResume = (id: string) => {
        if (selectedResumes.includes(id)) {
            setSelectedResumes(selectedResumes.filter((r) => r !== id));
        } else if (selectedResumes.length < 2) {
            setSelectedResumes([...selectedResumes, id]);
        }
    };

    const handleCompare = async () => {
        if (selectedResumes.length !== 2) return;

        setIsComparing(true);
        try {
            const result = await api.compareResumes(selectedResumes);
            setComparisonResult(result);
        } catch (err) {
            console.error("Comparison failed:", err);
        } finally {
            setIsComparing(false);
        }
    };

    const reset = () => {
        setSelectedResumes([]);
        setComparisonResult(null);
    };

    const getScoreIcon = (score1: number, score2: number, index: number) => {
        if (score1 === score2) return <Equal className="w-5 h-5 text-gray-400" />;
        if ((index === 0 && score1 > score2) || (index === 1 && score2 > score1)) {
            return <TrendingUp className="w-5 h-5 text-emerald-500" />;
        }
        return <TrendingDown className="w-5 h-5 text-red-500" />;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50";
        if (score >= 60) return "text-amber-600 bg-amber-50";
        return "text-red-600 bg-red-50";
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
                            简历对比分析
                        </h1>
                        <p className="text-lg text-gray-600">
                            选择两份简历进行对比，帮助您做出更好的招聘决策
                        </p>
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
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-gray-600">
                                            已选择 {selectedResumes.length}/2 份简历
                                        </p>
                                        {selectedResumes.length === 2 && (
                                            <button
                                                onClick={handleCompare}
                                                disabled={isComparing}
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                {isComparing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        <span>对比中...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Users className="w-5 h-5" />
                                                        <span>开始对比</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
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
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">暂无可对比的简历</p>
                                        <p className="text-sm text-gray-400">请先上传并分析一些简历</p>
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
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <h2 className="text-2xl font-bold text-gray-900">对比完成</h2>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                        <span>重新对比</span>
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                    {comparisonResult.resumes.map((resume, index) => (
                                        <motion.div
                                            key={resume.id}
                                            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        候选人 {index + 1}
                                                    </h3>
                                                    {comparisonResult.comparison.strengths[resume.id]?.length > 0 && (
                                                        <div className="flex items-center space-x-1 text-emerald-600">
                                                            <Trophy className="w-5 h-5" />
                                                            <span className="text-sm font-medium">优势明显</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center mb-6">
                                                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${getScoreColor(resume.scores.overall)}`}>
                                                        <span className="text-3xl font-bold">{resume.scores.overall}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-2">综合评分</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="font-semibold text-gray-900 text-lg">{resume.basicInfo.name}</p>
                                                    <p className="text-gray-600">{resume.jobInfo.position}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>{resume.background.education}</span>
                                                        <span>•</span>
                                                        <span>{resume.background.workYears}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">评分对比</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: "综合评分", key: "overall" },
                                            { label: "技能评分", key: "skills" },
                                            { label: "经验评分", key: "experience" },
                                            { label: "学历评分", key: "education" },
                                        ].map((item) => (
                                            <div key={item.key} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">{item.label}</span>
                                                    <div className="flex items-center space-x-2">
                                                        {getScoreIcon(
                                                            comparisonResult.resumes[0].scores[item.key as keyof ResumeData["scores"]],
                                                            comparisonResult.resumes[1].scores[item.key as keyof ResumeData["scores"]],
                                                            0
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-500">
                                                                {comparisonResult.resumes[0].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold">
                                                                {comparisonResult.resumes[0].scores[item.key as keyof ResumeData["scores"]]}
                                                            </span>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${comparisonResult.resumes[0].scores[item.key as keyof ResumeData["scores"]]}%` }}
                                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-semibold">
                                                                {comparisonResult.resumes[1].scores[item.key as keyof ResumeData["scores"]]}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {comparisonResult.resumes[1].basicInfo.name}
                                                            </span>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${comparisonResult.resumes[1].scores[item.key as keyof ResumeData["scores"]]}%` }}
                                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {comparisonResult.resumes.map((resume, index) => (
                                        <div key={resume.id} className="space-y-6">
                                            {comparisonResult.comparison.strengths[resume.id]?.length > 0 && (
                                                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                                                    <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center space-x-2">
                                                        <TrendingUp className="w-5 h-5" />
                                                        <span>优势</span>
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.strengths[resume.id].map((strength, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-emerald-700">
                                                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {comparisonResult.comparison.weaknesses[resume.id]?.length > 0 && (
                                                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                                                    <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                                                        <TrendingDown className="w-5 h-5" />
                                                        <span>劣势</span>
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.weaknesses[resume.id].map((weakness, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-red-700">
                                                                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{weakness}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <Trophy className="w-6 h-6 text-purple-600" />
                                        <span>AI 推荐建议</span>
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed">
                                        {comparisonResult.comparison.recommendation}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
