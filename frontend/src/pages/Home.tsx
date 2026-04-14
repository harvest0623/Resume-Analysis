import { Link } from "react-router-dom";
import { FileText, Users, Search, History, ArrowRight, Sparkles, Zap, Shield, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Home() {
    const features = [
        {
            icon: FileText,
            title: "智能简历解析",
            description: "自动解析 PDF 简历，提取关键信息，包括姓名、电话、邮箱、技能等",
            path: "/home/analyze",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Users,
            title: "简历对比分析",
            description: "对比两份简历的各项指标，帮助您做出更好的招聘决策",
            path: "/home/compare",
            color: "from-indigo-500 to-indigo-600",
        },
        {
            icon: Search,
            title: "岗位智能匹配",
            description: "输入岗位要求，自动匹配最合适的候选人，提高招聘效率",
            path: "/home/match",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: History,
            title: "历史记录管理",
            description: "保存和管理所有分析过的简历，方便随时查看和对比",
            path: "/home/history",
            color: "from-emerald-500 to-emerald-600",
        },
    ];

    const benefits = [
        {
            icon: Sparkles,
            title: "AI 驱动",
            description: "利用先进的 AI 技术进行智能分析和匹配",
        },
        {
            icon: Zap,
            title: "高效便捷",
            description: "几秒钟内完成简历分析，大幅提升工作效率",
        },
        {
            icon: Shield,
            title: "数据安全",
            description: "所有数据本地处理，确保您的信息安全",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <Navbar />
            
            <main>
                <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                                    <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                                    <span className="text-sm font-medium text-blue-700">AI 赋能的招聘新时代</span>
                                </div>
                                
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                    智能简历分析系统
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        让招聘更简单
                                    </span>
                                </h1>
                                
                                <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                                    利用 AI 技术快速解析、分析和对比简历，帮助您找到最合适的候选人，
                                    提升招聘效率，降低招聘成本。
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        to="/home/analyze"
                                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        开始使用
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                    <Link
                                        to="/home/history"
                                        className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        查看历史
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                核心功能
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                我们提供全方位的简历分析解决方案，满足您的各种招聘需求
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.path}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Link to={feature.path} className="block">
                                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                                                    <Icon className="w-7 h-7 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    {feature.description}
                                                </p>
                                                <div className="flex items-center text-blue-600 font-medium">
                                                    立即体验
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                为什么选择我们
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                我们的系统具有显著的优势，让您的招聘工作更加高效
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <motion.div
                                        key={benefit.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {benefit.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">智能简历分析系统</span>
                    </div>
                    <p className="text-gray-400">
                        © 2024 智能简历分析系统. 保留所有权利.
                    </p>
                </div>
            </footer>
        </div>
    );
}
