import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    User,
    Briefcase,
    GraduationCap,
    Code,
    FileText,
    Download,
    Copy,
    RefreshCcw,
    Wand2,
    ChevronRight,
    Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

interface ResumeSection {
    title: string;
    content: string;
}

export default function Generate() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResume, setGeneratedResume] = useState<ResumeSection[] | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        targetPosition: "",
        workYears: "",
        education: "",
        school: "",
        major: "",
        skills: "",
        workExperience: "",
        projects: "",
        selfIntro: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const sections: ResumeSection[] = [
                {
                    title: "个人信息",
                    content: `姓名：${formData.name}\n电话：${formData.phone}\n邮箱：${formData.email}`,
                },
                {
                    title: "求职意向",
                    content: `目标岗位：${formData.targetPosition}\n工作年限：${formData.workYears}`,
                },
                {
                    title: "教育背景",
                    content: `${formData.school} | ${formData.major} | ${formData.education}`,
                },
                {
                    title: "专业技能",
                    content: formData.skills
                        .split(",")
                        .map((s) => `• ${s.trim()}`)
                        .join("\n"),
                },
                {
                    title: "工作经历",
                    content: formData.workExperience || "暂无工作经历",
                },
                {
                    title: "项目经验",
                    content: formData.projects || "暂无项目经验",
                },
                {
                    title: "自我评价",
                    content: formData.selfIntro || "暂无自我评价",
                },
            ];

            setGeneratedResume(sections);
            setIsGenerating(false);
        }, 2000);
    };

    const steps = [
        { id: 1, title: "基本信息", icon: User },
        { id: 2, title: "教育背景", icon: GraduationCap },
        { id: 3, title: "技能经验", icon: Code },
        { id: 4, title: "生成简历", icon: Sparkles },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI 驱动</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            AI 生成简历
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
                            填写基本信息，AI 为您生成专业的简历内容
                        </p>
                    </div>

                    <div className="flex items-center justify-center mb-12">
                        {steps.map((s, index) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.id} className="flex items-center">
                                    <button
                                        onClick={() => setStep(s.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                                            step === s.id
                                                ? "bg-blue-600 text-white"
                                                : step > s.id
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 dark:text-gray-500"
                                        }`}
                                    >
                                        {step > s.id ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                        <span className="hidden sm:inline font-medium">{s.title}</span>
                                    </button>
                                    {index < steps.length - 1 && (
                                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-2" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    基本信息
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            姓名
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="请输入您的姓名"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            手机号码
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="请输入手机号码"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            电子邮箱
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="请输入电子邮箱"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            目标岗位
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.targetPosition}
                                            onChange={(e) => handleInputChange("targetPosition", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="例如：前端工程师"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            工作年限
                                        </label>
                                        <select
                                            value={formData.workYears}
                                            onChange={(e) => handleInputChange("workYears", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">请选择</option>
                                            <option value="应届生">应届生</option>
                                            <option value="1年以下">1年以下</option>
                                            <option value="1-3年">1-3年</option>
                                            <option value="3-5年">3-5年</option>
                                            <option value="5-10年">5-10年</option>
                                            <option value="10年以上">10年以上</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    教育背景
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            最高学历
                                        </label>
                                        <select
                                            value={formData.education}
                                            onChange={(e) => handleInputChange("education", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">请选择</option>
                                            <option value="高中">高中</option>
                                            <option value="大专">大专</option>
                                            <option value="本科">本科</option>
                                            <option value="硕士">硕士</option>
                                            <option value="博士">博士</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            毕业院校
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.school}
                                            onChange={(e) => handleInputChange("school", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="请输入毕业院校"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            专业
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.major}
                                            onChange={(e) => handleInputChange("major", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="请输入专业名称"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    技能与经验
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            技能标签（用逗号分隔）
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.skills}
                                            onChange={(e) => handleInputChange("skills", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="例如：React, TypeScript, Node.js, Python"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            工作经历
                                        </label>
                                        <textarea
                                            value={formData.workExperience}
                                            onChange={(e) => handleInputChange("workExperience", e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请描述您的工作经历..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            项目经验
                                        </label>
                                        <textarea
                                            value={formData.projects}
                                            onChange={(e) => handleInputChange("projects", e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请描述您的项目经验..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            自我评价
                                        </label>
                                        <textarea
                                            value={formData.selfIntro}
                                            onChange={(e) => handleInputChange("selfIntro", e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请简单介绍一下自己..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {!generatedResume ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Wand2 className="w-10 h-10 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            准备生成简历
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-8 max-w-md mx-auto">
                                            AI 将根据您填写的信息，生成一份专业的简历内容。点击下方按钮开始生成。
                                        </p>
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                onClick={() => setStep(3)}
                                                className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                            >
                                                返回修改
                                            </button>
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating}
                                                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        <span>生成中...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-5 h-5" />
                                                        <span>AI 生成简历</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center space-x-3">
                                                <Check className="w-8 h-8 text-emerald-500" />
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    简历生成完成
                                                </h2>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setGeneratedResume(null);
                                                        setStep(1);
                                                    }}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    <span>重新生成</span>
                                                </button>
                                                <button className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl transition-colors">
                                                    <Copy className="w-4 h-4" />
                                                    <span>复制</span>
                                                </button>
                                                <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                                                    <Download className="w-5 h-5" />
                                                    <span>下载 PDF</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-600">
                                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                    {formData.name}
                                                </h1>
                                                <div className="flex items-center justify-center space-x-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                                    <span>{formData.phone}</span>
                                                    <span>•</span>
                                                    <span>{formData.email}</span>
                                                </div>
                                                <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
                                                    {formData.targetPosition}
                                                </p>
                                            </div>

                                            <div className="space-y-8">
                                                {generatedResume.slice(2).map((section, index) => (
                                                    <div key={index}>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                            {section.title}
                                                        </h3>
                                                        <div className="text-gray-700 dark:text-gray-300 dark:text-gray-600 whitespace-pre-line">
                                                            {section.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
