import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Search, Trash2, RefreshCcw, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

export default function HistoryPage() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { resumes, setResumes, removeResume } = useResumeStore();

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const history = await api.getHistory(searchKeyword || undefined);
            setResumes(history);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [searchKeyword, setResumes]);

    const handleDelete = async (id: string) => {
        try {
            await api.deleteHistory(id);
            removeResume(id);
        } catch (err) {
            console.error("Failed to delete resume:", err);
        }
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                历史记录
                            </h1>
                            <p className="text-lg text-gray-600">
                                管理您所有分析过的简历
                            </p>
                        </div>
                        <button
                            onClick={loadHistory}
                            disabled={isLoading}
                            className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                        >
                            <RefreshCcw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                            <span>刷新</span>
                        </button>
                    </div>

                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索候选人姓名、邮箱或岗位..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">加载中...</p>
                            </div>
                        </div>
                    ) : resumes.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resumes.map((resume, index) => (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ResumeCard
                                        resume={resume}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchKeyword ? "未找到匹配的简历" : "暂无历史记录"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchKeyword 
                                    ? "尝试使用其他关键词搜索"
                                    : "开始上传并分析您的第一份简历吧"
                                }
                            </p>
                            {!searchKeyword && (
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                                    <History className="w-4 h-4" />
                                    <span>分析过的简历将显示在这里</span>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
