import { useState } from "react";
import { motion } from "framer-motion";
import {
    Download,
    FileText,
    FileSpreadsheet,
    FileImage,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    Users,
    BarChart3,
    Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

interface ExportOption {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    format: string;
}

const exportOptions: ExportOption[] = [
    {
        id: "resume-report",
        title: "简历分析报告",
        description: "导出单份简历的详细分析报告，包含评分、技能分析等",
        icon: FileText,
        color: "from-blue-500 to-blue-600",
        format: "PDF",
    },
    {
        id: "candidate-list",
        title: "候选人列表",
        description: "导出所有候选人的基本信息和评分数据",
        icon: Users,
        color: "from-emerald-500 to-emerald-600",
        format: "Excel",
    },
    {
        id: "comparison-report",
        title: "对比分析报告",
        description: "导出简历对比分析的结果，包含优劣势分析",
        icon: BarChart3,
        color: "from-purple-500 to-purple-600",
        format: "PDF",
    },
    {
        id: "job-report",
        title: "职位招聘报告",
        description: "导出各职位的招聘数据和转化率分析",
        icon: Briefcase,
        color: "from-amber-500 to-amber-600",
        format: "PDF",
    },
    {
        id: "interview-schedule",
        title: "面试安排表",
        description: "导出面试安排的详细日程表",
        icon: Calendar,
        color: "from-pink-500 to-pink-600",
        format: "Excel",
    },
    {
        id: "statistical-data",
        title: "统计数据",
        description: "导出所有招聘数据的统计分析",
        icon: BarChart3,
        color: "from-indigo-500 to-indigo-600",
        format: "CSV",
    },
];

const recentExports = [
    {
        id: "1",
        name: "候选人列表_2024年3月.xlsx",
        date: "2024-03-15 14:30",
        size: "2.3 MB",
        status: "completed",
    },
    {
        id: "2",
        name: "简历分析报告_张三.pdf",
        date: "2024-03-14 10:15",
        size: "1.1 MB",
        status: "completed",
    },
    {
        id: "3",
        name: "招聘数据统计_2024Q1.xlsx",
        date: "2024-03-13 16:45",
        size: "3.5 MB",
        status: "completed",
    },
];

export default function Export() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState("month");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (optionId: string) => {
        setSelectedOption(optionId);
        setIsExporting(true);

        setTimeout(() => {
            setIsExporting(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            报告导出
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            导出各类招聘数据报告和分析结果
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="grid md:grid-cols-2 gap-6">
                                {exportOptions.map((option, index) => {
                                    const Icon = option.icon;
                                    return (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                                                selectedOption === option.id
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-100 hover:border-gray-200 dark:border-gray-600"
                                            }`}
                                            onClick={() => setSelectedOption(option.id)}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center`}
                                                >
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 dark:text-gray-600 text-sm font-medium rounded-lg">
                                                    {option.format}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {option.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">
                                                {option.description}
                                            </p>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExport(option.id);
                                                }}
                                                disabled={isExporting && selectedOption === option.id}
                                                className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                                    isExporting && selectedOption === option.id
                                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                                                }`}
                                            >
                                                {isExporting && selectedOption === option.id ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        <span>导出中...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-5 h-5" />
                                                        <span>导出报告</span>
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    导出设置
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            时间范围
                                        </label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="week">最近一周</option>
                                            <option value="month">最近一月</option>
                                            <option value="quarter">最近一季</option>
                                            <option value="year">最近一年</option>
                                            <option value="all">全部数据</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">
                                            文件格式
                                        </label>
                                        <div className="space-y-2">
                                            {["PDF", "Excel", "CSV"].map((format) => (
                                                <label
                                                    key={format}
                                                    className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="format"
                                                        value={format}
                                                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                                        defaultChecked={format === "PDF"}
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300 dark:text-gray-600">{format}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    最近导出
                                </h3>
                                <div className="space-y-4">
                                    {recentExports.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <FileSpreadsheet className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                        {item.date} · {item.size}
                                                    </p>
                                                </div>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
