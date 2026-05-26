import { Link, useLocation } from "react-router-dom";
import {
    FileText,
    Users,
    Search,
    History,
    BarChart3,
    Menu,
    X,
    Upload,
    Lightbulb,
    PieChart,
    Briefcase,
    Calendar,
    Sparkles,
    Funnel,
    Download,
    Settings,
    ChevronDown,
    FileStack,
    UserCheck,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

export default function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const mainNavItems: NavItem[] = [
        { path: "/home", label: "首页", icon: BarChart3 },
    ];

    const navGroups: NavGroup[] = [
        {
            title: "简历工具",
            items: [
                { path: "/home/analyze", label: "简历分析", icon: FileText },
                { path: "/home/batch", label: "批量分析", icon: Upload },
                { path: "/home/compare", label: "简历比较", icon: Users },
                { path: "/home/optimize", label: "优化建议", icon: Lightbulb },
                { path: "/home/generate", label: "AI 生成", icon: Sparkles },
                { path: "/home/templates", label: "简历模板", icon: FileStack },
            ],
        },
        {
            title: "招聘管理",
            items: [
                { path: "/home/jobs", label: "职位管理", icon: Briefcase },
                { path: "/home/talent", label: "人才库", icon: UserCheck },
                { path: "/home/match", label: "岗位匹配", icon: Search },
                { path: "/home/interview", label: "面试管理", icon: Calendar },
                { path: "/home/pipeline", label: "招聘漏斗", icon: Funnel },
            ],
        },
        {
            title: "数据分析",
            items: [
                { path: "/home/stats", label: "数据统计", icon: PieChart },
                { path: "/home/history", label: "历史记录", icon: History },
                { path: "/home/export", label: "报告导出", icon: Download },
            ],
        },
    ];

    const isActive = (path: string) => {
        if (path === "/home") {
            return location.pathname === "/home" || location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const isGroupActive = (group: NavGroup) => {
        return group.items.some((item) => isActive(item.path));
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
                            智能招聘系统
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-1">
                        {mainNavItems.map((item) => {
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

                        {navGroups.map((group) => (
                            <div
                                key={group.title}
                                className="relative"
                                onMouseEnter={() => setActiveDropdown(group.title)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button
                                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                                        isGroupActive(group)
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <span>{group.title}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === group.title && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                                        >
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`flex items-center space-x-3 px-4 py-2 transition-all duration-200 ${
                                                            isActive(item.path)
                                                                ? "bg-blue-50 text-blue-600 font-medium"
                                                                : "text-gray-600 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}

                        <Link
                            to="/home/settings"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                isActive("/home/settings")
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span>设置</span>
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[80vh]"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {mainNavItems.map((item) => {
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

                            {navGroups.map((group) => (
                                <div key={group.title} className="pt-2">
                                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                                        {group.title}
                                    </p>
                                    {group.items.map((item) => {
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
                            ))}

                            <div className="pt-2 border-t border-gray-100">
                                <Link
                                    to="/home/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive("/home/settings")
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <Settings className="w-5 h-5" />
                                    <span>设置</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
