import { useState, useEffect } from "react";
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
    suggestions: string[];
}

export default function Optimize() {
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
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

    const generateSuggestions = (resume: ResumeData) => {
        setIsGenerating(true);
        setSelectedResume(resume);

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
                    color: "from-blue-500 to-indigo-600",
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
                color: "from-emerald-500 to-teal-600",
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
                color: "from-purple-500 to-pink-600",
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
                color: "from-amber-500 to-orange-600",
                suggestions: formatSuggestions,
            });

            if (resume.scores.overall < 60) {
                categories.push({
                    title: "整体提升",
                    icon: AlertTriangle,
                    color: "from-red-500 to-rose-600",
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

    const reset = () => {
        setSelectedResume(null);
        setSuggestions([]);
    };

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
                            简历优化建议
                        </h1>
                        <p className="text-lg text-gray-600">
                            选择一份简历，获取 AI 生成的优化建议
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!selectedResume ? (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="max-w-4xl mx-auto">
                                    {resumes.length > 0 ? (
                                        <>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {resumes.slice(0, 6).map((resume) => (
                                                    <motion.div
                                                        key={resume.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        whileHover={{ y: -4 }}
                                                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200"
                                                        onClick={() => generateSuggestions(resume)}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                                {resume.basicInfo.name.charAt(0)}
                                                            </div>
                                                            <div
                                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                                    resume.scores.overall >= 80
                                                                        ? "text-emerald-600 bg-emerald-50"
                                                                        : resume.scores.overall >= 60
                                                                        ? "text-amber-600 bg-amber-50"
                                                                        : "text-red-600 bg-red-50"
                                                                }`}
                                                            >
                                                                {resume.scores.overall} 分
                                                            </div>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {resume.basicInfo.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mb-4">
                                                            {resume.jobInfo.position || "未知岗位"}
                                                        </p>
                                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                                            <span>{resume.background.education}</span>
                                                            <span>{resume.background.workYears}</span>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="text-sm text-blue-600 font-medium">
                                                                获取优化建议
                                                            </span>
                                                            <ArrowRight className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            {resumes.length > 6 && (
                                                <div className="mt-8 text-center">
                                                    <a
                                                        href="/home/history"
                                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                                    >
                                                        <span>查看全部简历</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                暂无可优化的简历
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                请先上传并分析一些简历
                                            </p>
                                            <a
                                                href="/home/analyze"
                                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                                            >
                                                <span>上传简历</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="suggestions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                                {selectedResume.basicInfo.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {selectedResume.basicInfo.name} 的优化建议
                                                </h2>
                                                <p className="text-gray-500">
                                                    {selectedResume.jobInfo.position} · 当前评分: {selectedResume.scores.overall}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={reset}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <RefreshCcw className="w-5 h-5" />
                                            <span>选择其他简历</span>
                                        </button>
                                    </div>

                                    {isGenerating ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-16"
                                        >
                                            <div className="inline-flex items-center space-x-3 bg-white px-8 py-6 rounded-2xl shadow-lg">
                                                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                                                <div className="text-left">
                                                    <p className="font-semibold text-gray-900">AI 正在分析...</p>
                                                    <p className="text-sm text-gray-500">生成个性化优化建议</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-6">
                                            {suggestions.map((category, index) => {
                                                const Icon = category.icon;
                                                return (
                                                    <motion.div
                                                        key={category.title}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                                                    >
                                                        <div className="flex items-center space-x-3 mb-6">
                                                            <div
                                                                className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}
                                                            >
                                                                <Icon className="w-6 h-6 text-white" />
                                                            </div>
                                                            <h3 className="text-xl font-semibold text-gray-900">
                                                                {category.title}
                                                            </h3>
                                                        </div>
                                                        <ul className="space-y-4">
                                                            {category.suggestions.map((suggestion, i) => (
                                                                <motion.li
                                                                    key={i}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: index * 0.1 + i * 0.05 }}
                                                                    className="flex items-start space-x-3"
                                                                >
                                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-gray-700">{suggestion}</span>
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </motion.div>
                                                );
                                            })}

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
                                            >
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <Lightbulb className="w-6 h-6 text-blue-600" />
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        温馨提示
                                                    </h3>
                                                </div>
                                                <p className="text-gray-700">
                                                    以上建议基于 AI 分析生成，仅供参考。建议根据目标岗位的具体要求，
                                                    有针对性地优化简历内容。同时，保持简历真实、简洁、突出重点是最重要的原则。
                                                </p>
                                            </motion.div>
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
