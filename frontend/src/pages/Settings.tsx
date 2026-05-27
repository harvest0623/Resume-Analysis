import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Camera,
  Mail,
  Phone,
  Building2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/hooks/useTheme";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const { theme, setTheme, isDark } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        interview: true,
        candidate: false,
    });

    const [profile, setProfile] = useState({
        name: "管理员",
        email: "admin@example.com",
        phone: "13800138000",
        company: "示例科技有限公司",
        position: "HR经理",
    });

    const tabs = [
        { id: "profile", label: "个人信息", icon: User },
        { id: "notifications", label: "通知设置", icon: Bell },
        { id: "appearance", label: "外观设置", icon: Palette },
        { id: "security", label: "安全设置", icon: Shield },
    ];

    const handleSave = () => {
        alert("设置已保存");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            系统设置
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            管理您的账户和系统偏好设置
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {profile.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.position}</p>
                                        </div>
                                    </div>
                                </div>
                                <nav className="p-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                                    activeTab === tab.id
                                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            {activeTab === "profile" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        个人信息
                                    </h2>

                                    <div className="flex items-center space-x-6 mb-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                                                {profile.name.charAt(0)}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {profile.name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                姓名
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, name: e.target.value })
                                                }
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                职位
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.position}
                                                onChange={(e) =>
                                                    setProfile({ ...profile, position: e.target.value })
                                                }
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                邮箱
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, email: e.target.value })
                                                    }
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                手机
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, phone: e.target.value })
                                                    }
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                公司
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={profile.company}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, company: e.target.value })
                                                    }
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>保存修改</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "notifications" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        通知设置
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        邮件通知
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        接收重要的邮件通知
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.email}
                                                    onChange={(e) =>
                                                        setNotifications({
                                                            ...notifications,
                                                            email: e.target.checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                                                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        推送通知
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        接收浏览器推送通知
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.push}
                                                    onChange={(e) =>
                                                        setNotifications({
                                                            ...notifications,
                                                            push: e.target.checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        面试提醒
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        面试前接收提醒通知
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.interview}
                                                    onChange={(e) =>
                                                        setNotifications({
                                                            ...notifications,
                                                            interview: e.target.checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        新候选人通知
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        有新候选人投递时通知
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.candidate}
                                                    onChange={(e) =>
                                                        setNotifications({
                                                            ...notifications,
                                                            candidate: e.target.checked,
                                                        })
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>保存设置</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "appearance" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        外观设置
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                主题模式
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => setTheme("light")}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                                                        theme === "light"
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                    }`}
                                                >
                                                    <Sun className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                                    <p className="font-medium text-gray-900 dark:text-white text-center">
                                                        浅色模式
                                                    </p>
                                                </button>
                                                <button
                                                    onClick={() => setTheme("dark")}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                                                        theme === "dark"
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                    }`}
                                                >
                                                    <Moon className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                                                    <p className="font-medium text-gray-900 dark:text-white text-center">
                                                        深色模式
                                                    </p>
                                                </button>
                                                <button
                                                    onClick={() => setTheme("system")}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                                                        theme === "system"
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                    }`}
                                                >
                                                    <Monitor className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                                                    <p className="font-medium text-gray-900 dark:text-white text-center">
                                                        跟随系统
                                                    </p>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                语言设置
                                            </h3>
                                            <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                <option value="zh-CN">简体中文</option>
                                                <option value="en-US">English</option>
                                                <option value="ja-JP">日本語</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button
                                            onClick={handleSave}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>保存设置</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        安全设置
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                                修改密码
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        当前密码
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="请输入当前密码"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        新密码
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="请输入新密码"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        确认新密码
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="请再次输入新密码"
                                                    />
                                                </div>
                                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                                                    更新密码
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                            <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-2">
                                                危险区域
                                            </h3>
                                            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                                删除账户后，所有数据将被永久删除且无法恢复。
                                            </p>
                                            <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                                                删除账户
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

const Calendar = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
