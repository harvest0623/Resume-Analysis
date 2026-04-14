import { Link, useLocation } from "react-router-dom";
import { FileText, Users, Search, History, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { path: "/home", label: "首页", icon: FileText },
        { path: "/home/analyze", label: "简历分析", icon: FileText },
        { path: "/home/compare", label: "简历比较", icon: Users },
        { path: "/home/match", label: "岗位匹配", icon: Search },
        { path: "/home/history", label: "历史记录", icon: History },
    ];

    const isActive = (path: string) => {
        if (path === "/home") {
            return location.pathname === "/home" || location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            智能简历分析
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                        isActive(item.path)
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                            isActive(item.path)
                                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
