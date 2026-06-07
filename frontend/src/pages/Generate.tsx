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
    Globe,
    Plus,
    Trash2,
    GripVertical,
    Edit3,
    X,
    Brain,
    ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";

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
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -80, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-fuchsia-400/20 to-purple-400/20 rounded-full blur-3xl"
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
                    className="absolute rounded-full bg-violet-500/10 dark:bg-violet-400/10"
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

interface ResumeSection {
    title: string;
    content: string;
}

interface CustomField {
    id: string;
    label: string;
    value: string;
    type: "text" | "textarea";
}

interface CustomModule {
    id: string;
    title: string;
    fields: CustomField[];
}

export default function Generate() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [generatedResume, setGeneratedResume] = useState<ResumeSection[] | null>(null);
    const [customModules, setCustomModules] = useState<CustomModule[]>([]);
    const [editingModule, setEditingModule] = useState<string | null>(null);
    const [newModuleName, setNewModuleName] = useState("");

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
        internshipExperience: "",
        projects: "",
        blog: "",
        selfIntro: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerateError(null);

        try {
            const result = await api.generateResume({
                basicInfo: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    targetPosition: formData.targetPosition,
                    workYears: formData.workYears,
                },
                education: formData.education,
                school: formData.school,
                major: formData.major,
                workExperience: formData.workExperience,
                internshipExperience: formData.internshipExperience,
                projects: formData.projects,
                skills: formData.skills.split(",").map((s) => s.trim()).filter((s) => s),
                blog: formData.blog,
                selfIntro: formData.selfIntro,
                customModules: customModules.map((m) => ({
                    title: m.title,
                    fields: m.fields.map((f) => ({
                        label: f.label,
                        value: f.value,
                    })),
                })),
            });

            if (result.success && result.sections) {
                // 按 order 排序并转换为 ResumeSection 格式
                const sections: ResumeSection[] = result.sections
                    .sort((a, b) => a.order - b.order)
                    .map((s) => ({
                        title: s.title,
                        content: s.content,
                    }));
                setGeneratedResume(sections);
            } else {
                throw new Error("生成失败，请重试");
            }
        } catch (error: any) {
            console.error("生成简历失败:", error);
            setGenerateError(error.message || "生成简历失败，请重试");
            // 降级到本地生成
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
                    title: "实习经历",
                    content: formData.internshipExperience || "暂无实习经历",
                },
                {
                    title: "项目经验",
                    content: formData.projects || "暂无项目经验",
                },
                {
                    title: "个人博客",
                    content: formData.blog ? `博客地址：${formData.blog}` : "暂无个人博客",
                },
                {
                    title: "自我评价",
                    content: formData.selfIntro || "暂无自我评价",
                },
            ];
            customModules.forEach((module) => {
                const moduleContent = module.fields
                    .filter((field) => field.value.trim())
                    .map((field) => `${field.label}：${field.value}`)
                    .join("\n");
                if (moduleContent) {
                    sections.push({
                        title: module.title,
                        content: moduleContent,
                    });
                }
            });
            setGeneratedResume(sections);
        } finally {
            setIsGenerating(false);
        }
    };

    const addCustomModule = () => {
        if (!newModuleName.trim()) return;
        const newModule: CustomModule = {
            id: Date.now().toString(),
            title: newModuleName.trim(),
            fields: [
                { id: `${Date.now()}-1`, label: "内容", value: "", type: "textarea" },
            ],
        };
        setCustomModules([...customModules, newModule]);
        setNewModuleName("");
        setEditingModule(newModule.id);
    };

    const removeCustomModule = (moduleId: string) => {
        setCustomModules(customModules.filter((m) => m.id !== moduleId));
        if (editingModule === moduleId) {
            setEditingModule(null);
        }
    };

    const addFieldToModule = (moduleId: string) => {
        setCustomModules(
            customModules.map((m) => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        fields: [
                            ...m.fields,
                            {
                                id: `${Date.now()}-${m.fields.length + 1}`,
                                label: `字段${m.fields.length + 1}`,
                                value: "",
                                type: "text",
                            },
                        ],
                    };
                }
                return m;
            })
        );
    };

    const removeFieldFromModule = (moduleId: string, fieldId: string) => {
        setCustomModules(
            customModules.map((m) => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        fields: m.fields.filter((f) => f.id !== fieldId),
                    };
                }
                return m;
            })
        );
    };

    const updateFieldLabel = (moduleId: string, fieldId: string, label: string) => {
        setCustomModules(
            customModules.map((m) => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        fields: m.fields.map((f) =>
                            f.id === fieldId ? { ...f, label } : f
                        ),
                    };
                }
                return m;
            })
        );
    };

    const updateFieldValue = (moduleId: string, fieldId: string, value: string) => {
        setCustomModules(
            customModules.map((m) => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        fields: m.fields.map((f) =>
                            f.id === fieldId ? { ...f, value } : f
                        ),
                    };
                }
                return m;
            })
        );
    };

    const moveModule = (moduleId: string, direction: "up" | "down") => {
        const index = customModules.findIndex((m) => m.id === moduleId);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === customModules.length - 1) return;

        const newModules = [...customModules];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
        setCustomModules(newModules);
    };

    const steps = [
        { id: 1, title: "基本信息", icon: User },
        { id: 2, title: "教育背景", icon: GraduationCap },
        { id: 3, title: "工作实习", icon: Briefcase },
        { id: 4, title: "项目经历", icon: FileText },
        { id: 5, title: "技能博客", icon: Code },
        { id: 6, title: "自定义模块", icon: Plus },
        { id: 7, title: "生成简历", icon: Sparkles },
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
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 rounded-3xl shadow-2xl shadow-purple-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Sparkles className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                AI 生成简历
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            填写基本信息，AI 为您生成专业的简历内容
                            <br className="hidden sm:block" />
                            <span className="text-purple-600 dark:text-purple-400 font-medium">快速打造高质量简历</span>
                        </motion.p>
                    </div>

                    <div className="flex items-center justify-center mb-12">
                        {steps.map((s, index) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.id} className="flex items-center">
                                    <button
                                        onClick={() => setStep(s.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                                            step === s.id
                                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                                                : step > s.id
                                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 dark:text-gray-500"
                                        }`}
                                    >
                                        {step > s.id ? (
                                            <Check className="w-5 h-5 flex-shrink-0" />
                                        ) : (
                                            <Icon className="w-5 h-5 flex-shrink-0" />
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
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
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
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
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
                                    工作与实习经历
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            工作经历
                                        </label>
                                        <textarea
                                            value={formData.workExperience}
                                            onChange={(e) => handleInputChange("workExperience", e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请描述您的工作经历，包括公司名称、职位、工作内容等..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            实习经历
                                        </label>
                                        <textarea
                                            value={formData.internshipExperience}
                                            onChange={(e) => handleInputChange("internshipExperience", e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请描述您的实习经历，包括公司名称、职位、实习内容等..."
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
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
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
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    项目经历
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            项目经验
                                        </label>
                                        <textarea
                                            value={formData.projects}
                                            onChange={(e) => handleInputChange("projects", e.target.value)}
                                            rows={8}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="请描述您的项目经验，包括项目名称、项目描述、您的角色和贡献等..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={() => setStep(5)}
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    技能与个人博客
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
                                            <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4" />
                                                <span>个人博客</span>
                                            </div>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.blog}
                                            onChange={(e) => handleInputChange("blog", e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://your-blog.com"
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
                                        onClick={() => setStep(4)}
                                        className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={() => setStep(6)}
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div
                                key="step6"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    自定义模块
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    您可以根据个人需求添加自定义简历模块，如获奖荣誉、资格证书、志愿者经历等。
                                </p>

                                {/* 添加新模块 */}
                                <div className="flex items-center space-x-3 mb-6">
                                    <input
                                        type="text"
                                        value={newModuleName}
                                        onChange={(e) => setNewModuleName(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="输入模块名称，如：获奖荣誉、资格证书..."
                                        onKeyDown={(e) => e.key === "Enter" && addCustomModule()}
                                    />
                                    <button
                                        onClick={addCustomModule}
                                        disabled={!newModuleName.trim()}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>添加</span>
                                    </button>
                                </div>

                                {/* 自定义模块列表 */}
                                {customModules.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">暂无自定义模块</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">在上方输入模块名称并点击"添加"按钮</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {customModules.map((module, moduleIndex) => (
                                            <div
                                                key={module.id}
                                                className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex flex-col space-y-1">
                                                            <button
                                                                onClick={() => moveModule(module.id, "up")}
                                                                disabled={moduleIndex === 0}
                                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <ChevronRight className="w-3 h-3 -rotate-90" />
                                                            </button>
                                                            <button
                                                                onClick={() => moveModule(module.id, "down")}
                                                                disabled={moduleIndex === customModules.length - 1}
                                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <ChevronRight className="w-3 h-3 rotate-90" />
                                                            </button>
                                                        </div>
                                                        {editingModule === module.id ? (
                                                            <input
                                                                type="text"
                                                                value={module.title}
                                                                onChange={(e) => {
                                                                    setCustomModules(
                                                                        customModules.map((m) =>
                                                                            m.id === module.id ? { ...m, title: e.target.value } : m
                                                                        )
                                                                    );
                                                                }}
                                                                onBlur={() => setEditingModule(null)}
                                                                onKeyDown={(e) => e.key === "Enter" && setEditingModule(null)}
                                                                className="px-2 py-1 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                                {module.title}
                                                            </h3>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setEditingModule(module.id)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeCustomModule(module.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    {module.fields.map((field) => (
                                                        <div key={field.id} className="flex items-start space-x-3">
                                                            <div className="flex-1 grid grid-cols-4 gap-3">
                                                                <div className="col-span-1">
                                                                    <input
                                                                        type="text"
                                                                        value={field.label}
                                                                        onChange={(e) =>
                                                                            updateFieldLabel(module.id, field.id, e.target.value)
                                                                        }
                                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                        placeholder="字段名称"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    {field.type === "textarea" ? (
                                                                        <textarea
                                                                            value={field.value}
                                                                            onChange={(e) =>
                                                                                updateFieldValue(module.id, field.id, e.target.value)
                                                                            }
                                                                            rows={3}
                                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                                                            placeholder="输入内容..."
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            value={field.value}
                                                                            onChange={(e) =>
                                                                                updateFieldValue(module.id, field.id, e.target.value)
                                                                            }
                                                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                                            placeholder="输入内容..."
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFieldFromModule(module.id, field.id)}
                                                                className="mt-1 p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addFieldToModule(module.id)}
                                                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        <span>添加字段</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={() => setStep(5)}
                                        className="px-8 py-3 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                    >
                                        上一步
                                    </button>
                                    <button
                                        onClick={() => setStep(7)}
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
                                    >
                                        下一步
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 7 && (
                            <motion.div
                                key="step7"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {!generatedResume ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 rounded-3xl shadow-2xl shadow-purple-500/30 mb-8 relative"
                                        >
                                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                                            <Wand2 className="w-10 h-10 text-white relative z-10" />
                                            <motion.div
                                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-xl"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            />
                                        </motion.div>
                                        <motion.h2
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3, duration: 0.6 }}
                                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                                        >
                                            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                                准备生成简历
                                            </span>
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.6 }}
                                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10"
                                        >
                                            AI 将根据您填写的信息，生成一份专业的简历内容
                                            <br className="hidden sm:block" />
                                            <span className="text-purple-600 dark:text-purple-400 font-medium">点击下方按钮开始生成</span>
                                        </motion.p>
                                        {generateError && (
                                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                                                <p className="text-sm">{generateError}</p>
                                                <p className="text-xs mt-1 opacity-75">已使用本地生成作为备选方案</p>
                                            </div>
                                        )}
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                onClick={() => setStep(6)}
                                                className="px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 rounded-xl"
                                            >
                                                返回修改
                                            </button>
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isGenerating}
                                                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transform hover:-translate-y-1 disabled:opacity-50 transition-all duration-300 overflow-hidden"
                                            >
                                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <span className="relative z-10 flex items-center">
                                                    {isGenerating ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                            <span>生成中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-5 h-5 mr-2" />
                                                            <span>AI 生成简历</span>
                                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center space-x-3">
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 rounded-3xl shadow-2xl shadow-purple-500/30 relative"
                                                >
                                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                                                    <Check className="w-10 h-10 text-white relative z-10" />
                                                    <motion.div
                                                        className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-xl"
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                                        transition={{ duration: 3, repeat: Infinity }}
                                                    />
                                                </motion.div>
                                                <motion.h2
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3, duration: 0.6 }}
                                                    className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                                                >
                                                    <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                                        简历生成完成
                                                    </span>
                                                </motion.h2>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setGeneratedResume(null);
                                                        setStep(1);
                                                    }}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    <span>重新生成</span>
                                                </button>
                                                <button className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 rounded-xl transition-colors">
                                                    <Copy className="w-4 h-4" />
                                                    <span>复制</span>
                                                </button>
                                                <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200">
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
                                                <div className="flex items-center justify-center space-x-4 text-gray-600 dark:text-gray-400">
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
                                                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
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
