import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileText,
    FileStack,
    Download,
    Eye,
    Star,
    Search,
    Briefcase,
    Code,
    Palette,
    Building2,
    GraduationCap,
    TrendingUp,
    Edit3,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
    thumbnail: string;
    rating: number;
    downloads: number;
    tags: string[];
    icon: React.ElementType;
    color: string;
}

const templates: Template[] = [
    {
        id: "1",
        name: "简约专业",
        category: "通用",
        description: "简洁大方的专业简历模板，适合大多数行业和岗位。",
        thumbnail: "bg-gradient-to-br from-blue-100 to-blue-200",
        rating: 4.8,
        downloads: 1250,
        tags: ["简约", "专业", "通用"],
        icon: FileText,
        color: "from-blue-500 to-blue-600",
    },
    {
        id: "2",
        name: "技术精英",
        category: "技术",
        description: "专为程序员和技术人员设计，突出技术和项目经验。",
        thumbnail: "bg-gradient-to-br from-emerald-100 to-emerald-200",
        rating: 4.9,
        downloads: 980,
        tags: ["技术", "程序员", "IT"],
        icon: Code,
        color: "from-emerald-500 to-emerald-600",
    },
    {
        id: "3",
        name: "创意设计",
        category: "设计",
        description: "富有创意的设计简历，适合设计师和创意工作者。",
        thumbnail: "bg-gradient-to-br from-purple-100 to-purple-200",
        rating: 4.7,
        downloads: 756,
        tags: ["创意", "设计", "艺术"],
        icon: Palette,
        color: "from-purple-500 to-purple-600",
    },
    {
        id: "4",
        name: "商务精英",
        category: "商务",
        description: "高端商务风格，适合管理层和商务岗位。",
        thumbnail: "bg-gradient-to-br from-amber-100 to-amber-200",
        rating: 4.6,
        downloads: 654,
        tags: ["商务", "管理", "高端"],
        icon: Building2,
        color: "from-amber-500 to-amber-600",
    },
    {
        id: "5",
        name: "应届生",
        category: "校园",
        description: "适合应届毕业生，突出教育背景和实习经历。",
        thumbnail: "bg-gradient-to-br from-pink-100 to-pink-200",
        rating: 4.5,
        downloads: 1120,
        tags: ["应届", "校园", "实习"],
        icon: GraduationCap,
        color: "from-pink-500 to-pink-600",
    },
    {
        id: "6",
        name: "销售精英",
        category: "销售",
        description: "突出业绩和销售数据的简历模板。",
        thumbnail: "bg-gradient-to-br from-rose-100 to-rose-200",
        rating: 4.4,
        downloads: 432,
        tags: ["销售", "业绩", "市场"],
        icon: TrendingUp,
        color: "from-rose-500 to-rose-600",
    },
];

const categories = ["全部", "通用", "技术", "设计", "商务", "校园", "销售"];

// ============ 设计系统组件 ============

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-emerald-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 rounded-full blur-3xl"
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
        delay: Math.random() * 5,
    }));
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-teal-500/10 dark:bg-teal-400/10"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

const GlassCard = ({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
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

// ============ 页面主体 ============

export default function Templates() {
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const filteredTemplates = templates.filter((template) => {
        const matchKeyword =
            template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            template.description.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchCategory =
            selectedCategory === "全部" || template.category === selectedCategory;
        return matchKeyword && matchCategory;
    });

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
                    {/* ============ Hero Header ============ */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 100,
                            }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 rounded-3xl shadow-2xl shadow-teal-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <FileStack className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-gray-900 via-teal-800 to-emerald-800 dark:from-white dark:via-teal-200 dark:to-emerald-200 bg-clip-text text-transparent">
                                简历模板
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            精选多款专业简历模板，助您打造完美简历
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent font-semibold">
                                选择模板，一键开始编辑
                            </span>
                        </motion.p>
                    </div>

                    {/* ============ 搜索和筛选 ============ */}
                    <GlassCard delay={0.5} className="mb-10 p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索模板..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-5 py-3.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 text-sm ${
                                            selectedCategory === category
                                                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25"
                                                : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:border-teal-300 dark:hover:border-teal-600"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    {/* ============ 模板卡片网格 ============ */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTemplates.map((template, index) => {
                            const Icon = template.icon;
                            return (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -8 }}
                                    className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 dark:hover:shadow-teal-500/5 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

                                    <div className="relative">
                                        {/* 缩略图 */}
                                        <div className={`h-48 ${template.thumbnail} flex items-center justify-center`}>
                                            <div className="text-center">
                                                <div className="w-20 h-28 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center">
                                                    <Icon className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {template.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* 标题和评分 */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {template.name}
                                                    </h3>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {template.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {template.rating}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                                {template.description}
                                            </p>

                                            {/* 标签 */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {template.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* 底部操作 */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 dark:border-gray-700/80">
                                                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <Download className="w-4 h-4" />
                                                    <span>{template.downloads} 次下载</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setPreviewTemplate(template)}
                                                        className="p-2 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                                                        title="预览"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/editor?template=${template.id}`)
                                                        }
                                                        className="inline-flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                        <span>使用此模板</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* 空状态 */}
                    {filteredTemplates.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/30"
                        >
                            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                未找到匹配的模板
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                尝试使用其他关键词或分类筛选
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* ============ 预览弹窗 ============ */}
            {previewTemplate && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewTemplate(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {previewTemplate.name}
                                </h2>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <span className="text-gray-500 dark:text-gray-400 text-lg">✕</span>
                                </button>
                            </div>

                            <div
                                className={`h-96 ${previewTemplate.thumbnail} rounded-xl flex items-center justify-center mb-6`}
                            >
                                <div className="text-center">
                                    <div className="w-48 h-64 bg-white rounded-lg shadow-2xl mx-auto mb-4 flex items-center justify-center">
                                        <previewTemplate.icon className="w-16 h-16 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {previewTemplate.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        <span className="font-medium">{previewTemplate.rating}</span>
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {previewTemplate.downloads} 次下载
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setPreviewTemplate(null);
                                        navigate(`/editor?template=${previewTemplate.id}`);
                                    }}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-200"
                                >
                                    <Edit3 className="w-5 h-5" />
                                    <span>使用此模板编辑</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}