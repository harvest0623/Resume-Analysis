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
    UserCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileManager from "@/components/ProfileManager";
import { getCurrentProfile, type Profile } from "@/utils/userProfile";

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
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [profileManagerOpen, setProfileManagerOpen] = useState(false);

    // 监听档案变化（多页面间同步）
    useEffect(() => {
        const updateProfile = () => setCurrentProfile(getCurrentProfile());
        updateProfile();
        window.addEventListener("storage", updateProfile);
        window.addEventListener("profileChanged", updateProfile);
        return () => {
            window.removeEventListener("storage", updateProfile);
            window.removeEventListener("profileChanged", updateProfile);
        };
    }, []);

    const mainNavItems: NavItem[] = [
        { path: "/home", label: "首页", icon: BarChart3 },
    ];

    const navGroups: NavGroup[] = [
        {
            title: "简历工具",
            items: [
                { path: "/analyze", label: "简历分析", icon: FileText },
                { path: "/batch", label: "批量分析", icon: Upload },
                { path: "/compare", label: "简历比较", icon: Users },
                { path: "/optimize", label: "优化建议", icon: Lightbulb },
                { path: "/generate", label: "AI 生成", icon: Sparkles },
                { path: "/templates", label: "简历模板", icon: FileStack },
            ],
        },
        {
            title: "招聘管理",
            items: [
                { path: "/jobs", label: "职位管理", icon: Briefcase },
                { path: "/talent", label: "人才库", icon: UserCheck },
                { path: "/match", label: "岗位匹配", icon: Search },
                { path: "/interview", label: "面试管理", icon: Calendar },
                { path: "/pipeline", label: "招聘漏斗", icon: Funnel },
            ],
        },
        {
            title: "数据分析",
            items: [
                { path: "/stats", label: "数据统计", icon: PieChart },
                { path: "/history", label: "历史记录", icon: History },
                { path: "/export", label: "报告导出", icon: Download },
            ],
        },
    ];

    const isActive = (path: string) => {
        if (path === "/home") {
            return location.pathname === "/home" || location.pathname === "/";
        }
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const isGroupActive = (group: NavGroup) => {
        return group.items.some((item) => isActive(item.path));
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
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
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
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
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
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
                                            className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50"
                                        >
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`flex items-center space-x-3 px-4 py-2 transition-all duration-200 ${
                                                            isActive(item.path)
                                                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                            to="/settings"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                isActive("/settings")
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span>设置</span>
                        </Link>

                        <button
                            onClick={() => setProfileManagerOpen(true)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            title="切换用户档案"
                        >
                            <UserCircle className="w-4 h-4" />
                            <span className="text-sm max-w-[120px] truncate">
                                {currentProfile?.name || "未登录"}
                            </span>
                        </button>

                        <div className="pl-2 border-l border-gray-200 dark:border-gray-700">
                            <ThemeToggle />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-900 dark:text-white" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
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
                        className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[80vh]"
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
                                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            {navGroups.map((group) => (
                                <div key={group.title} className="pt-2">
                                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
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
                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setProfileManagerOpen(true);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <span>{currentProfile?.name || "未登录"}（切换档案）</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileManager
                open={profileManagerOpen}
                onClose={() => setProfileManagerOpen(false)}
                onProfileChanged={() => {
                    // 触发全局事件，通知其他组件刷新
                    window.dispatchEvent(new Event("profileChanged"));
                    setCurrentProfile(getCurrentProfile());
                }}
            />
        </nav>
    );
}
