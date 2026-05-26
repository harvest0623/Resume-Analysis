import { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Eye,
    Star,
    Search,
    Filter,
    Briefcase,
    Code,
    Palette,
    Building2,
    GraduationCap,
    TrendingUp,
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
        description: "专为程序员和技术人员设计，突出技术栈和项目经验。",
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

export default function Templates() {
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
                            简历模板
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            精选多款专业简历模板，助您打造完美简历
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索模板..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                                        selectedCategory === category
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTemplates.map((template, index) => {
                            const Icon = template.icon;
                            return (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div
                                        className={`h-48 ${template.thumbnail} flex items-center justify-center`}
                                    >
                                        <div className="text-center">
                                            <div
                                                className={`w-20 h-28 bg-white rounded-lg shadow-lg mx-auto mb-4 flex items-center justify-center`}
                                            >
                                                <Icon className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {template.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {template.name}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {template.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {template.rating}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {template.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {template.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                <Download className="w-4 h-4" />
                                                <span>{template.downloads} 次下载</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setPreviewTemplate(template)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button className="inline-flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                                                    <Download className="w-4 h-4" />
                                                    <span>下载</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                未找到匹配的模板
                            </h3>
                            <p className="text-gray-500">尝试使用其他关键词或分类筛选</p>
                        </div>
                    )}
                </motion.div>
            </main>

            {previewTemplate && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewTemplate(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {previewTemplate.name}
                                </h2>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <span className="text-gray-500">✕</span>
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

                            <p className="text-gray-600 mb-6">
                                {previewTemplate.description}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        <span className="font-medium">{previewTemplate.rating}</span>
                                    </div>
                                    <span className="text-gray-500">
                                        {previewTemplate.downloads} 次下载
                                    </span>
                                </div>
                                <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                                    <Download className="w-5 h-5" />
                                    <span>下载模板</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
