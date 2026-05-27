import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Funnel,
  Users,
  FileText,
  Phone,
  UserCheck,
  Handshake,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

interface PipelineStage {
    id: string;
    name: string;
    count: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    conversionRate: number;
}

const mockPipeline: PipelineStage[] = [
    {
        id: "applied",
        name: "投递",
        count: 156,
        icon: FileText,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100",
        conversionRate: 100,
    },
    {
        id: "screening",
        name: "筛选",
        count: 89,
        icon: Users,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        conversionRate: 57,
    },
    {
        id: "phone",
        name: "电话面试",
        count: 45,
        icon: Phone,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-100",
        conversionRate: 51,
    },
    {
        id: "onsite",
        name: "现场面试",
        count: 23,
        icon: UserCheck,
        color: "text-pink-600",
        bgColor: "bg-pink-100",
        conversionRate: 51,
    },
    {
        id: "offer",
        name: "Offer",
        count: 12,
        icon: Handshake,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100",
        conversionRate: 52,
    },
];

const departmentData = [
    { name: "技术部", applied: 68, offer: 5, rate: 7.4 },
    { name: "产品部", applied: 32, offer: 3, rate: 9.4 },
    { name: "设计部", applied: 28, offer: 2, rate: 7.1 },
    { name: "市场部", imported: 18, offer: 1, rate: 5.6 },
    { name: "运营部", applied: 10, offer: 1, rate: 10 },
];

const monthlyTrend = [
    { month: "1月", applied: 45, offer: 3 },
    { month: "2月", applied: 52, offer: 4 },
    { month: "3月", applied: 59, offer: 5 },
];

export default function Pipeline() {
    const maxCount = useMemo(
        () => Math.max(...mockPipeline.map((s) => s.count)),
        []
    );

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
                            招聘漏斗
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            可视化招聘流程，分析各阶段转化率
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">总投递数</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Handshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+8%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">发放 Offer</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Funnel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">7.7%</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">整体转化率</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                                    <TrendingDown className="w-4 h-4" />
                                    <span>-2天</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">18天</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">平均招聘周期</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
                            招聘漏斗
                        </h2>
                        <div className="space-y-6">
                            {mockPipeline.map((stage, index) => {
                                const Icon = stage.icon;
                                const widthPercentage = (stage.count / maxCount) * 100;

                                return (
                                    <div key={stage.id} className="flex items-center space-x-6">
                                        <div className="w-32 flex-shrink-0">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`w-10 h-10 ${stage.bgColor} rounded-lg flex items-center justify-center`}
                                                >
                                                    <Icon className={`w-5 h-5 ${stage.color}`} />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {stage.name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${widthPercentage}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className={`h-full ${stage.bgColor} rounded-lg flex items-center justify-end pr-4`}
                                                >
                                                    <span className={`font-bold ${stage.color}`}>
                                                        {stage.count}
                                                    </span>
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="w-24 flex-shrink-0 text-right">
                                            {index > 0 && (
                                                <div className="flex items-center justify-end space-x-1">
                                                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">
                                                        {stage.conversionRate}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                部门招聘情况
                            </h2>
                            <div className="space-y-4">
                                {departmentData.map((dept, index) => (
                                    <div
                                        key={dept.name}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                {dept.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{dept.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                    投递 {dept.applied}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {dept.offer} 个 Offer
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                转化率 {dept.rate}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                月度趋势
                            </h2>
                            <div className="space-y-6">
                                {monthlyTrend.map((month, index) => (
                                    <div key={month.month}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {month.month}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                                投递 {month.applied} · Offer {month.offer}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(month.applied / 60) * 100}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                                />
                                            </div>
                                            <div className="w-16 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(month.offer / 6) * 100}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">投递数</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Offer 数</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
