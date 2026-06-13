import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User as UserIcon,
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
    Smartphone,
    Eye,
    EyeOff,
    Check,
    X,
    Plus,
    Trash2,
    Copy,
    AlertTriangle,
    Briefcase,
    MapPin,
    Calendar,
    Languages,
    CreditCard,
    Users,
    Database,
    Download,
    Upload,
    Webhook,
    Code2,
    Slack,
    Github,
    Zap,
    Crown,
    Sparkles,
    Activity,
    Volume2,
    VolumeX,
    Edit,
    AtSign,
    Link2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/hooks/useTheme";

type TabId =
    | "profile"
    | "account"
    | "notifications"
    | "appearance"
    | "security"
    | "privacy"
    | "team"
    | "integrations"
    | "data"
    | "billing";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
    avatar: string;
    lastActive: string;
}

interface LoginSession {
    id: string;
    device: string;
    location: string;
    ip: string;
    time: string;
    current: boolean;
}

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
}

// ====== 通用小组件 ======
function FormField({
    label,
    required,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );
}

function InfoRow({
    label,
    value,
    mono,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
            <p
                className={`text-sm font-medium text-gray-900 dark:text-white ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function SettingsCard({
    title,
    description,
    children,
    action,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                    )}
                </div>
                {action}
            </div>
            <div className="px-6 sm:px-8 py-6">{children}</div>
        </div>
    );
}

function ToggleRow({
    icon: Icon,
    title,
    desc,
    color,
    checked,
    onChange,
}: {
    icon: any;
    title: string;
    desc: string;
    color: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
        purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
        emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
        amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
        pink: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
        cyan: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400",
        indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    };
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
            <div className="flex items-center space-x-3 min-w-0">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>
                </div>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

function ChannelCard({
    icon: Icon,
    title,
    desc,
    color,
    checked,
    onChange,
}: {
    icon: any;
    title: string;
    desc: string;
    color: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    const colorMap: Record<string, string> = {
        blue: "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
        emerald: "from-emerald-500 to-emerald-600",
        amber: "from-amber-500 to-amber-600",
    };
    return (
        <div
            className={`relative p-4 rounded-xl border-2 transition-all ${
                checked
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-sm`}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <Toggle checked={checked} onChange={onChange} />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
    );
}

function ActionCard({
    icon: Icon,
    title,
    desc,
    color,
    action = "执行",
}: {
    icon: any;
    title: string;
    desc: string;
    color: string;
    action?: string;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
        emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
        red: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
        amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    };
    return (
        <div className="p-5 bg-gray-50 dark:bg-gray-700/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{desc}</p>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                {action} →
            </button>
        </div>
    );
}

function SaveBar({
    onSave,
    onCancel,
    status,
    hasChanges,
}: {
    onSave: () => void;
    onCancel: () => void;
    status: "idle" | "saving" | "saved";
    hasChanges: boolean;
}) {
    // 没有未保存更改且不是 saving / saved 状态时，不展示
    if (!hasChanges && status === "idle") return null;
    return (
        <div className="sticky bottom-4 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm">
                {status === "saved" ? (
                    <>
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">所有更改已保存</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">您有未保存的更改</span>
                    </>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={onSave}
                    disabled={status === "saving" || !hasChanges}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {status === "saving" ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>保存中</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>保存修改</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ====== 主题色配置 ======
const accentColors = [
    { id: "blue", name: "蓝色", class: "bg-blue-500" },
    { id: "indigo", name: "靛蓝", class: "bg-indigo-500" },
    { id: "purple", name: "紫色", class: "bg-purple-500" },
    { id: "pink", name: "粉色", class: "bg-pink-500" },
    { id: "rose", name: "玫红", class: "bg-rose-500" },
    { id: "orange", name: "橙色", class: "bg-orange-500" },
    { id: "emerald", name: "翠绿", class: "bg-emerald-500" },
    { id: "cyan", name: "青色", class: "bg-cyan-500" },
];

// ====== 主组件 ======
export default function Settings() {
    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const { theme, setTheme } = useTheme();
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [hasChanges, setHasChanges] = useState(false);

    // 包装 theme setter，触发未保存提示
    const changeTheme = (t: Theme) => {
        setTheme(t);
        setHasChanges(true);
    };

    // 个人信息
    const [profile, _setProfile] = useState({
        name: "管理员",
        username: "admin",
        email: "admin@example.com",
        phone: "13800138000",
        company: "示例科技有限公司",
        position: "HR经理",
        location: "北京市朝阳区",
        birthday: "1990-01-01",
        gender: "male" as "male" | "female" | "other",
        bio: "专注于人才招聘与HR管理，致力于用技术提升招聘效率。",
        website: "https://example.com",
    });
    const setProfile = (v: typeof profile) => {
        _setProfile(v);
        setHasChanges(true);
    };

    // 账户设置
    const [account, _setAccount] = useState({
        language: "zh-CN",
        timezone: "Asia/Shanghai",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        firstDayOfWeek: "monday",
    });
    const setAccount = (v: typeof account) => {
        _setAccount(v);
        setHasChanges(true);
    };

    // 通知设置
    const [notifChannels, _setNotifChannels] = useState({
        email: true,
        push: true,
        sms: false,
        desktop: true,
    });
    const setNotifChannels = (v: typeof notifChannels) => {
        _setNotifChannels(v);
        setHasChanges(true);
    };

    const [notifTypes, _setNotifTypes] = useState({
        newCandidate: true,
        interview: true,
        report: true,
        system: true,
        marketing: false,
        weekly: true,
    });
    const setNotifTypes = (v: typeof notifTypes) => {
        _setNotifTypes(v);
        setHasChanges(true);
    };

    const [notifPrefs, _setNotifPrefs] = useState({
        quietHours: true,
        quietStart: "22:00",
        quietEnd: "08:00",
        digest: "daily",
        sound: true,
    });
    const setNotifPrefs = (v: typeof notifPrefs) => {
        _setNotifPrefs(v);
        setHasChanges(true);
    };

    // 外观设置
    const [accentColor, _setAccentColor] = useState("blue");
    const setAccentColor = (v: string) => {
        _setAccentColor(v);
        setHasChanges(true);
    };
    const [fontSize, _setFontSize] = useState("medium");
    const setFontSize = (v: string) => {
        _setFontSize(v);
        setHasChanges(true);
    };
    const [density, _setDensity] = useState("comfortable");
    const setDensity = (v: string) => {
        _setDensity(v);
        setHasChanges(true);
    };
    const [animations, _setAnimations] = useState(true);
    const setAnimations = (v: boolean) => {
        _setAnimations(v);
        setHasChanges(true);
    };
    const [sidebarStyle, _setSidebarStyle] = useState("expanded");
    const setSidebarStyle = (v: string) => {
        _setSidebarStyle(v);
        setHasChanges(true);
    };

    // 安全设置
    const [twoFA, _setTwoFA] = useState(false);
    const setTwoFA = (v: boolean) => {
        _setTwoFA(v);
        setHasChanges(true);
    };
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // 隐私设置
    const [privacy, _setPrivacy] = useState({
        profileVisible: true,
        activityStatus: true,
        personalizedAds: false,
        dataCollection: true,
        shareAnalytics: true,
    });
    const setPrivacy = (v: typeof privacy) => {
        _setPrivacy(v);
        setHasChanges(true);
    };

    // 团队
    const [teamMembers] = useState<TeamMember[]>([
        { id: "1", name: "管理员", email: "admin@example.com", role: "admin", avatar: "管", lastActive: "在线" },
        { id: "2", name: "张丽华", email: "zhanglh@example.com", role: "editor", avatar: "张", lastActive: "5 分钟前" },
        { id: "3", name: "李明", email: "liming@example.com", role: "viewer", avatar: "李", lastActive: "2 小时前" },
        { id: "4", name: "王芳", email: "wangfang@example.com", role: "editor", avatar: "王", lastActive: "昨天" },
    ]);

    // 登录会话
    const [sessions] = useState<LoginSession[]>([
        { id: "1", device: "MacBook Pro · Chrome 125", location: "北京, 中国", ip: "192.168.1.100", time: "当前会话", current: true },
        { id: "2", device: "iPhone 15 · Safari", location: "北京, 中国", ip: "192.168.1.105", time: "2 小时前", current: false },
        { id: "3", device: "Windows 11 · Edge", location: "上海, 中国", ip: "203.0.113.45", time: "3 天前", current: false },
    ]);

    // API 密钥
    const [apiKeys] = useState<ApiKey[]>([
        { id: "1", name: "生产环境密钥", key: "sk-prod-xxxxxxxxxxxxxxxxxxxxx", created: "2026-04-12", lastUsed: "5 分钟前" },
        { id: "2", name: "开发测试密钥", key: "sk-test-xxxxxxxxxxxxxxxxxxxxx", created: "2026-03-08", lastUsed: "2 天前" },
    ]);

    // 导航分组
    const navGroups = [
        {
            title: "个人与账户",
            items: [
                { id: "profile" as TabId, label: "个人信息", icon: UserIcon },
                { id: "account" as TabId, label: "账户设置", icon: Globe },
            ],
        },
        {
            title: "偏好",
            items: [
                { id: "notifications" as TabId, label: "通知设置", icon: Bell },
                { id: "appearance" as TabId, label: "外观设置", icon: Palette },
            ],
        },
        {
            title: "隐私与安全",
            items: [
                { id: "security" as TabId, label: "安全设置", icon: Shield },
                { id: "privacy" as TabId, label: "隐私设置", icon: Shield },
            ],
        },
        {
            title: "协作与扩展",
            items: [
                { id: "team" as TabId, label: "团队成员", icon: Users },
                { id: "integrations" as TabId, label: "API 与集成", icon: Code2 },
            ],
        },
        {
            title: "数据",
            items: [
                { id: "data" as TabId, label: "数据管理", icon: Database },
                { id: "billing" as TabId, label: "订阅与计费", icon: CreditCard },
            ],
        },
    ];

    const handleSave = () => {
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("saved");
            setHasChanges(false);
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 800);
    };

    const handleCancel = () => {
        // 取消时回退到初始值（仅作示意，真实场景可结合后端）
        setHasChanges(false);
        setSaveStatus("idle");
    };

    // ====== 各 Tab 渲染函数 ======
    const renderProfile = () => (
        <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                    <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>更换封面</span>
                    </button>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex items-end justify-between -mt-12 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl border-4 border-white dark:border-gray-800 shadow-lg">
                                {profile.name.charAt(0)}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>已认证</span>
                            </span>
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full flex items-center space-x-1">
                                <Crown className="w-3 h-3" />
                                <span>Pro 会员</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                        <FormField label="姓名" required>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="input-field"
                            />
                        </FormField>

                        <FormField label="用户名" required>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.username}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="职位">
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.position}
                                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="公司">
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="邮箱" required>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="手机">
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="所在地">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="生日">
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={profile.birthday}
                                    onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                                    className="input-field !pl-10"
                                />
                            </div>
                        </FormField>

                        <FormField label="性别">
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { v: "male", l: "男" },
                                    { v: "female", l: "女" },
                                    { v: "other", l: "其他" },
                                ].map((opt) => (
                                    <button
                                        key={opt.v}
                                        onClick={() => setProfile({ ...profile, gender: opt.v as any })}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                            profile.gender === opt.v
                                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                        }`}
                                    >
                                        {opt.l}
                                    </button>
                                ))}
                            </div>
                        </FormField>

                        <FormField label="个人网站">
                            <div className="relative">
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={profile.website}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    className="input-field !pl-10"
                                    placeholder="https://"
                                />
                            </div>
                        </FormField>

                        <div className="md:col-span-2">
                            <FormField label="个人简介">
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    rows={3}
                                    className="input-field resize-none"
                                    placeholder="介绍一下你自己..."
                                />
                                <p className="mt-1.5 text-xs text-gray-400">{profile.bio.length} / 200</p>
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>

            <SaveBar onSave={handleSave} onCancel={handleCancel} status={saveStatus} hasChanges={hasChanges} />
        </motion.div>
    );

    const renderAccount = () => (
        <motion.div
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="账户信息" description="管理您的账户基本设置与区域选项">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                    <InfoRow label="账户 ID" value="USR-2024-78521" mono />
                    <InfoRow label="注册时间" value="2026 年 3 月 15 日" />
                    <InfoRow
                        label="账户状态"
                        value={
                            <span className="inline-flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <span>活跃</span>
                            </span>
                        }
                    />
                    <InfoRow
                        label="套餐"
                        value={
                            <span className="inline-flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                                <Crown className="w-3.5 h-3.5" />
                                <span>Pro 会员</span>
                            </span>
                        }
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="区域与语言" description="设置您的语言、时区与日期格式">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                    <FormField label="界面语言">
                        <div className="relative">
                            <Languages className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                value={account.language}
                                onChange={(e) => setAccount({ ...account, language: e.target.value })}
                                className="input-field pl-10 appearance-none cursor-pointer"
                            >
                                <option value="zh-CN">简体中文</option>
                                <option value="zh-TW">繁體中文</option>
                                <option value="en-US">English (US)</option>
                                <option value="ja-JP">日本語</option>
                                <option value="ko-KR">한국어</option>
                            </select>
                        </div>
                    </FormField>

                    <FormField label="时区">
                        <select
                            value={account.timezone}
                            onChange={(e) => setAccount({ ...account, timezone: e.target.value })}
                            className="input-field appearance-none cursor-pointer"
                        >
                            <option value="Asia/Shanghai">(GMT+8) 北京、上海</option>
                            <option value="Asia/Tokyo">(GMT+9) 东京</option>
                            <option value="America/New_York">(GMT-5) 纽约</option>
                            <option value="Europe/London">(GMT+0) 伦敦</option>
                        </select>
                    </FormField>

                    <FormField label="日期格式">
                        <select
                            value={account.dateFormat}
                            onChange={(e) => setAccount({ ...account, dateFormat: e.target.value })}
                            className="input-field appearance-none cursor-pointer"
                        >
                            <option value="YYYY-MM-DD">2026-06-13</option>
                            <option value="MM/DD/YYYY">06/13/2026</option>
                            <option value="DD/MM/YYYY">13/06/2026</option>
                        </select>
                    </FormField>

                    <FormField label="时间格式">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { v: "24h", l: "24 小时制" },
                                { v: "12h", l: "12 小时制" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setAccount({ ...account, timeFormat: opt.v })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                        account.timeFormat === opt.v
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <FormField label="一周起始日">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { v: "monday", l: "周一" },
                                { v: "sunday", l: "周日" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setAccount({ ...account, firstDayOfWeek: opt.v })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                        account.firstDayOfWeek === opt.v
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </FormField>
                </div>
            </SettingsCard>

            <SettingsCard title="危险操作" description="不可逆的账户操作，请谨慎使用">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-red-900 dark:text-red-200">注销账户</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                                注销后账户将进入 30 天冻结期，之后数据将永久删除。
                            </p>
                        </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0">
                        注销账户
                    </button>
                </div>
            </SettingsCard>

            <SaveBar onSave={handleSave} onCancel={handleCancel} status={saveStatus} hasChanges={hasChanges} />
        </motion.div>
    );

    const renderNotifications = () => (
        <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="通知渠道" description="选择您接收通知的方式">
                <div className="grid sm:grid-cols-2 gap-3">
                    <ChannelCard
                        icon={Mail}
                        title="邮件通知"
                        desc="发送至您的邮箱"
                        color="blue"
                        checked={notifChannels.email}
                        onChange={(v) => setNotifChannels({ ...notifChannels, email: v })}
                    />
                    <ChannelCard
                        icon={Smartphone}
                        title="手机推送"
                        desc="移动设备推送"
                        color="purple"
                        checked={notifChannels.push}
                        onChange={(v) => setNotifChannels({ ...notifChannels, push: v })}
                    />
                    <ChannelCard
                        icon={Phone}
                        title="短信通知"
                        desc="重要事件短信提醒"
                        color="emerald"
                        checked={notifChannels.sms}
                        onChange={(v) => setNotifChannels({ ...notifChannels, sms: v })}
                    />
                    <ChannelCard
                        icon={Monitor}
                        title="桌面通知"
                        desc="浏览器桌面弹窗"
                        color="amber"
                        checked={notifChannels.desktop}
                        onChange={(v) => setNotifChannels({ ...notifChannels, desktop: v })}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="通知类型" description="选择您希望接收的通知类别">
                <div className="space-y-2">
                    <ToggleRow
                        icon={Sparkles}
                        title="新候选人匹配"
                        desc="当有新的候选人匹配到您的职位时"
                        color="indigo"
                        checked={notifTypes.newCandidate}
                        onChange={(v) => setNotifTypes({ ...notifTypes, newCandidate: v })}
                    />
                    <ToggleRow
                        icon={Calendar}
                        title="面试提醒"
                        desc="面试开始前 30 分钟提醒"
                        color="emerald"
                        checked={notifTypes.interview}
                        onChange={(v) => setNotifTypes({ ...notifTypes, interview: v })}
                    />
                    <ToggleRow
                        icon={Activity}
                        title="分析报告"
                        desc="招聘分析报告生成完成时"
                        color="blue"
                        checked={notifTypes.report}
                        onChange={(v) => setNotifTypes({ ...notifTypes, report: v })}
                    />
                    <ToggleRow
                        icon={Zap}
                        title="系统公告"
                        desc="产品更新与功能公告"
                        color="amber"
                        checked={notifTypes.system}
                        onChange={(v) => setNotifTypes({ ...notifTypes, system: v })}
                    />
                    <ToggleRow
                        icon={Volume2}
                        title="营销推广"
                        desc="产品优惠与活动信息"
                        color="pink"
                        checked={notifTypes.marketing}
                        onChange={(v) => setNotifTypes({ ...notifTypes, marketing: v })}
                    />
                    <ToggleRow
                        icon={Mail}
                        title="每周摘要"
                        desc="每周一发送上周招聘数据汇总"
                        color="cyan"
                        checked={notifTypes.weekly}
                        onChange={(v) => setNotifTypes({ ...notifTypes, weekly: v })}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="免打扰与摘要" description="设置静默时段与通知摘要频率">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                                <VolumeX className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">免打扰时段</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">在指定时段内不发送非紧急通知</p>
                            </div>
                        </div>
                        <Toggle checked={notifPrefs.quietHours} onChange={(v) => setNotifPrefs({ ...notifPrefs, quietHours: v })} />
                    </div>

                    <AnimatePresence>
                        {notifPrefs.quietHours && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-2 gap-4 overflow-hidden"
                            >
                                <FormField label="开始时间">
                                    <input
                                        type="time"
                                        value={notifPrefs.quietStart}
                                        onChange={(e) => setNotifPrefs({ ...notifPrefs, quietStart: e.target.value })}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="结束时间">
                                    <input
                                        type="time"
                                        value={notifPrefs.quietEnd}
                                        onChange={(e) => setNotifPrefs({ ...notifPrefs, quietEnd: e.target.value })}
                                        className="input-field"
                                    />
                                </FormField>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <FormField label="通知摘要频率">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { v: "realtime", l: "实时" },
                                { v: "daily", l: "每日" },
                                { v: "weekly", l: "每周" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setNotifPrefs({ ...notifPrefs, digest: opt.v })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                        notifPrefs.digest === opt.v
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">提示音</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">收到通知时播放提示音</p>
                            </div>
                        </div>
                        <Toggle checked={notifPrefs.sound} onChange={(v) => setNotifPrefs({ ...notifPrefs, sound: v })} />
                    </div>
                </div>
            </SettingsCard>

            <SaveBar onSave={handleSave} onCancel={handleCancel} status={saveStatus} hasChanges={hasChanges} />
        </motion.div>
    );

    const renderAppearance = () => (
        <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="主题模式" description="选择您偏好的界面主题">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { v: "light" as Theme, l: "浅色", icon: Sun, color: "text-amber-500", preview: "bg-white border-gray-200" },
                        { v: "dark" as Theme, l: "深色", icon: Moon, color: "text-indigo-500", preview: "bg-gray-900 border-gray-700" },
                        { v: "system" as Theme, l: "跟随系统", icon: Monitor, color: "text-gray-500", preview: "bg-gradient-to-r from-white to-gray-900" },
                    ].map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.v}
                                onClick={() => changeTheme(opt.v)}
                                className={`group relative p-5 rounded-2xl border-2 transition-all ${
                                    theme === opt.v
                                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className={`w-full h-20 rounded-xl mb-3 ${opt.preview} border-2 flex items-center justify-center overflow-hidden`}>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-8 bg-current opacity-30 rounded"></div>
                                        <div className="w-2 h-6 bg-current opacity-30 rounded"></div>
                                        <div className="w-2 h-10 bg-current opacity-30 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <Icon className={`w-4 h-4 ${opt.color}`} />
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{opt.l}</span>
                                </div>
                                {theme === opt.v && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </SettingsCard>

            <SettingsCard title="主题色" description="为界面选择您喜欢的主题色">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {accentColors.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setAccentColor(color.id)}
                            className="group flex flex-col items-center space-y-2"
                        >
                            <div
                                className={`relative w-12 h-12 ${color.class} rounded-2xl shadow-sm group-hover:scale-110 transition-transform ${
                                    accentColor === color.id ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800" : ""
                                }`}
                            >
                                {accentColor === color.id && (
                                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                                )}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{color.name}</span>
                        </button>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard title="布局" description="调整界面密度与显示效果">
                <div className="space-y-5">
                    <FormField label="字体大小">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { v: "small", l: "小", size: "text-xs" },
                                { v: "medium", l: "中", size: "text-sm" },
                                { v: "large", l: "大", size: "text-base" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setFontSize(opt.v)}
                                    className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                                        fontSize === opt.v
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <span className={`${opt.size} font-medium text-gray-900 dark:text-white`}>Aa</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{opt.l}</span>
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <FormField label="界面密度">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { v: "compact", l: "紧凑" },
                                { v: "comfortable", l: "舒适" },
                                { v: "spacious", l: "宽松" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setDensity(opt.v)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                        density === opt.v
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <FormField label="侧边栏样式">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { v: "expanded", l: "始终展开" },
                                { v: "collapsed", l: "始终折叠" },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => setSidebarStyle(opt.v)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                        sidebarStyle === opt.v
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {opt.l}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/40 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">动画效果</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">启用界面过渡与微交互动画</p>
                            </div>
                        </div>
                        <Toggle checked={animations} onChange={setAnimations} />
                    </div>
                </div>
            </SettingsCard>

            <SaveBar onSave={handleSave} onCancel={handleCancel} status={saveStatus} hasChanges={hasChanges} />
        </motion.div>
    );

    const renderSecurity = () => (
        <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="登录密码" description="定期更换密码可以提高账户安全性">
                <div className="space-y-4">
                    <FormField label="当前密码">
                        <div className="relative">
                            <input
                                type={showPassword.current ? "text" : "password"}
                                className="input-field !pr-12"
                                placeholder="请输入当前密码"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </FormField>
                    <FormField label="新密码" hint="至少 8 位，包含大小写字母和数字">
                        <div className="relative">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                className="input-field !pr-12"
                                placeholder="请输入新密码"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="mt-2 flex space-x-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`h-1 flex-1 rounded ${i <= 2 ? "bg-amber-400" : "bg-gray-200 dark:bg-gray-700"}`}></div>
                            ))}
                        </div>
                        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">强度：中等</p>
                    </FormField>
                    <FormField label="确认新密码">
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                className="input-field !pr-12"
                                placeholder="请再次输入新密码"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </FormField>
                    <div className="flex justify-end">
                        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
                            更新密码
                        </button>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="两步验证" description="为账户添加额外的安全保护层">
                <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">身份验证器</h4>
                                {twoFA ? (
                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">已启用</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">未启用</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">使用 Google Authenticator 等应用生成验证码</p>
                        </div>
                    </div>
                    <Toggle checked={twoFA} onChange={setTwoFA} />
                </div>
            </SettingsCard>

            <SettingsCard title="登录设备" description="管理已登录的设备与活动会话">
                <div className="space-y-2">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                                session.current
                                    ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    session.current ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-100 dark:bg-gray-700"
                                }`}>
                                    <Monitor className={`w-5 h-5 ${session.current ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`} />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{session.device}</h4>
                                        {session.current && (
                                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">当前</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {session.location} · {session.ip} · {session.time}
                                    </p>
                                </div>
                            </div>
                            {!session.current && (
                                <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                                    注销
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium hover:underline">
                    注销所有其他设备
                </button>
            </SettingsCard>

            <SettingsCard title="危险区域" description="不可恢复的账户操作">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-red-900 dark:text-red-200">删除账户</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                删除账户后，所有数据将被永久删除且无法恢复。
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors flex-shrink-0">
                            删除账户
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </motion.div>
    );

    const renderPrivacy = () => (
        <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="个人资料可见性" description="控制您的信息对其他用户的可见程度">
                <div className="space-y-2">
                    <ToggleRow
                        icon={UserIcon}
                        title="公开个人资料"
                        desc="允许团队成员查看您的个人资料"
                        color="blue"
                        checked={privacy.profileVisible}
                        onChange={(v) => setPrivacy({ ...privacy, profileVisible: v })}
                    />
                    <ToggleRow
                        icon={Activity}
                        title="在线状态"
                        desc="向其他成员显示您是否在线"
                        color="emerald"
                        checked={privacy.activityStatus}
                        onChange={(v) => setPrivacy({ ...privacy, activityStatus: v })}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="数据收集与个性化" description="管理您的数据如何被使用">
                <div className="space-y-2">
                    <ToggleRow
                        icon={Sparkles}
                        title="个性化推荐"
                        desc="基于您的使用习惯提供个性化内容"
                        color="purple"
                        checked={privacy.personalizedAds}
                        onChange={(v) => setPrivacy({ ...privacy, personalizedAds: v })}
                    />
                    <ToggleRow
                        icon={Database}
                        title="使用情况数据收集"
                        desc="帮助我们改进产品体验"
                        color="cyan"
                        checked={privacy.dataCollection}
                        onChange={(v) => setPrivacy({ ...privacy, dataCollection: v })}
                    />
                    <ToggleRow
                        icon={Activity}
                        title="匿名分析"
                        desc="分享匿名的使用统计信息"
                        color="amber"
                        checked={privacy.shareAnalytics}
                        onChange={(v) => setPrivacy({ ...privacy, shareAnalytics: v })}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="我的数据" description="下载、导出或清除您存储的数据">
                <div className="grid sm:grid-cols-3 gap-3">
                    <ActionCard
                        icon={Download}
                        title="下载个人数据"
                        desc="导出所有账户数据"
                        color="blue"
                        action="立即下载"
                    />
                    <ActionCard
                        icon={Upload}
                        title="导入数据"
                        desc="从其他平台迁移"
                        color="emerald"
                        action="开始导入"
                    />
                    <ActionCard
                        icon={Trash2}
                        title="清除活动记录"
                        desc="删除所有操作日志"
                        color="red"
                        action="清除记录"
                    />
                </div>
            </SettingsCard>

            <SaveBar onSave={handleSave} onCancel={handleCancel} status={saveStatus} hasChanges={hasChanges} />
        </motion.div>
    );

    const renderTeam = () => (
        <motion.div
            key="team"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard
                title="团队成员"
                description="管理团队成员及其访问权限"
                action={
                    <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                        <Plus className="w-4 h-4" />
                        <span>邀请成员</span>
                    </button>
                }
            >
                <div className="space-y-2">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {member.avatar}
                                    </div>
                                    {member.lastActive === "在线" && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {member.email} · {member.lastActive}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                        member.role === "admin"
                                            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                            : member.role === "editor"
                                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                    {member.role === "admin" ? "管理员" : member.role === "editor" ? "编辑者" : "查看者"}
                                </span>
                                <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4 text-gray-500" />
                                </button>
                                {member.id !== "1" && (
                                    <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group">
                                        <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard title="角色权限" description="查看每个角色的默认权限">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">权限</th>
                                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">管理员</th>
                                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">编辑者</th>
                                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">查看者</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[
                                { name: "查看候选人", a: true, e: true, v: true },
                                { name: "编辑候选人", a: true, e: true, v: false },
                                { name: "删除候选人", a: true, e: false, v: false },
                                { name: "管理职位", a: true, e: true, v: false },
                                { name: "查看分析报告", a: true, e: true, v: true },
                                { name: "管理团队", a: true, e: false, v: false },
                                { name: "账单与订阅", a: true, e: false, v: false },
                            ].map((row) => (
                                <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-4 py-3 text-gray-900 dark:text-white">{row.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        {row.a ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {row.e ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {row.v ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SettingsCard>
        </motion.div>
    );

    const renderIntegrations = () => (
        <motion.div
            key="integrations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard
                title="API 密钥"
                description="使用 API 密钥集成我们的服务到您的应用中"
                action={
                    <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                        <Plus className="w-4 h-4" />
                        <span>创建密钥</span>
                    </button>
                }
            >
                <div className="space-y-2">
                    {apiKeys.map((key) => (
                        <div key={key.id} className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <Code2 className="w-4 h-4 text-gray-500" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">{key.name}</h4>
                                </div>
                                <button className="text-sm text-red-600 dark:text-red-400 hover:underline">撤销</button>
                            </div>
                            <div className="flex items-center space-x-2 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <code className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                                    {key.key}
                                </code>
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                创建于 {key.created} · 上次使用：{key.lastUsed}
                            </p>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard title="Webhook" description="接收系统事件实时通知">
                <div className="space-y-4">
                    <FormField label="Webhook URL">
                        <div className="relative">
                            <Webhook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                placeholder="https://your-domain.com/webhook"
                                className="input-field pl-10"
                            />
                        </div>
                    </FormField>
                    <FormField label="监听事件">
                        <div className="grid grid-cols-2 gap-2">
                            {["候选人创建", "候选人更新", "面试安排", "报告生成"].map((event) => (
                                <label
                                    key={event}
                                    className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60"
                                >
                                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{event}</span>
                                </label>
                            ))}
                        </div>
                    </FormField>
                </div>
            </SettingsCard>

            <SettingsCard title="第三方应用" description="连接您常用的工具提升工作效率">
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { name: "Slack", desc: "团队协作与通知", icon: Slack, connected: true, color: "from-purple-500 to-pink-500" },
                        { name: "GitHub", desc: "代码仓库集成", icon: Github, connected: false, color: "from-gray-700 to-gray-900" },
                        { name: "飞书", desc: "即时通讯与日历", icon: Sparkles, connected: true, color: "from-blue-500 to-cyan-500" },
                        { name: "钉钉", desc: "企业沟通工具", icon: Briefcase, connected: false, color: "from-blue-600 to-blue-800" },
                    ].map((app) => {
                        const Icon = app.icon;
                        return (
                            <div key={app.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${app.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{app.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{app.desc}</p>
                                    </div>
                                </div>
                                <button
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                        app.connected
                                            ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {app.connected ? "已连接" : "连接"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </SettingsCard>
        </motion.div>
    );

    const renderData = () => (
        <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="存储用量" description="查看您的账户存储使用情况">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">已使用</span>
                            <span className="font-semibold text-gray-900 dark:text-white">12.4 GB / 50 GB</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{ width: "24.8%" }}
                            ></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {[
                            { label: "简历文件", value: "8.2 GB", color: "bg-blue-500" },
                            { label: "面试录音", value: "3.1 GB", color: "bg-purple-500" },
                            { label: "其他文件", value: "1.1 GB", color: "bg-emerald-500" },
                        ].map((item) => (
                            <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                <div className={`w-2 h-2 ${item.color} rounded-full mb-2`}></div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="数据导出" description="导出您的所有数据用于备份或迁移">
                <div className="grid sm:grid-cols-2 gap-3">
                    <ActionCard
                        icon={Download}
                        title="导出全部数据"
                        desc="包含所有候选人、职位、报告"
                        color="blue"
                        action="立即导出"
                    />
                    <ActionCard
                        icon={Database}
                        title="导出候选人"
                        desc="仅候选人数据库"
                        color="emerald"
                        action="导出 CSV"
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="数据导入" description="从其他系统导入数据">
                <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        拖拽文件到此处或点击上传
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        支持 CSV、Excel、JSON 格式 · 单文件最大 50 MB
                    </p>
                </div>
            </SettingsCard>

            <SettingsCard title="清理与重置" description="释放存储空间或重置应用数据">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <Trash2 className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">清理缓存</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">释放约 124 MB 缓存空间</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                            清理
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <h4 className="font-medium text-amber-900 dark:text-amber-200 text-sm">重置应用</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                    清除所有自定义设置，恢复到初始状态
                                </p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30">
                            重置
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </motion.div>
    );

    const renderBilling = () => (
        <motion.div
            key="billing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <SettingsCard title="当前套餐" description="您当前的订阅计划与权益">
                <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-rose-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-rose-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pro 会员</h3>
                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">推荐</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">解锁全部高级功能</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ¥199<span className="text-sm font-normal text-gray-500">/月</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">下次扣费 2026-07-13</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {[
                                { l: "职位数", v: "无限" },
                                { l: "简历解析", v: "10,000/月" },
                                { l: "团队成员", v: "20 人" },
                                { l: "存储空间", v: "50 GB" },
                            ].map((item) => (
                                <div key={item.l} className="p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl backdrop-blur-sm">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.l}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{item.v}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700">
                                管理订阅
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all">
                                升级套餐
                            </button>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="本月用量" description="查看本月各项资源的使用情况">
                <div className="space-y-4">
                    {[
                        { l: "简历解析", u: 3245, t: 10000, color: "from-blue-500 to-blue-600" },
                        { l: "AI 面试分析", u: 89, t: 200, color: "from-purple-500 to-purple-600" },
                        { l: "团队成员", u: 4, t: 20, color: "from-emerald-500 to-emerald-600" },
                    ].map((row) => (
                        <div key={row.l}>
                            <div className="flex items-center justify-between mb-1.5 text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{row.l}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {row.u.toLocaleString()} / {row.t.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${row.color} rounded-full transition-all`}
                                    style={{ width: `${(row.u / row.t) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard title="账单历史" description="查看与下载您的历史账单">
                <div className="space-y-2">
                    {[
                        { date: "2026-06-13", amount: "¥199.00", status: "待支付", color: "amber" },
                        { date: "2026-05-13", amount: "¥199.00", status: "已支付", color: "emerald" },
                        { date: "2026-04-13", amount: "¥199.00", status: "已支付", color: "emerald" },
                        { date: "2026-03-13", amount: "¥199.00", status: "已支付", color: "emerald" },
                    ].map((bill, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <CreditCard className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                        Pro 会员 · {bill.date}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">月度订阅</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {bill.amount}
                                </span>
                                <span
                                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                        bill.color === "emerald"
                                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                                    }`}
                                >
                                    {bill.status}
                                </span>
                                <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                    <Download className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>
        </motion.div>
    );

    // ====== 渲染内容映射 ======
    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return renderProfile();
            case "account":
                return renderAccount();
            case "notifications":
                return renderNotifications();
            case "appearance":
                return renderAppearance();
            case "security":
                return renderSecurity();
            case "privacy":
                return renderPrivacy();
            case "team":
                return renderTeam();
            case "integrations":
                return renderIntegrations();
            case "data":
                return renderData();
            case "billing":
                return renderBilling();
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            管理您的账户、偏好与系统配置
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
                        <aside className="lg:sticky lg:top-8 lg:self-start">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {profile.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {profile.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {navGroups.map((group) => (
                                        <div key={group.title} className="mb-3 last:mb-0">
                                            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                {group.title}
                                            </p>
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setActiveTab(item.id)}
                                                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                                                            activeTab === item.id
                                                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                        }`}
                                                    >
                                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">{item.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <div>
                            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>

            <style>{`
                .input-field {
                    width: 100%;
                    padding-top: 0.625rem;
                    padding-bottom: 0.625rem;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    border: 1px solid rgb(229 231 235);
                    border-radius: 0.75rem;
                    background-color: white;
                    color: rgb(17 24 39);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .input-field::placeholder {
                    color: rgb(156 163 175);
                }
                .input-field:focus {
                    outline: none;
                    border-color: transparent;
                    box-shadow: 0 0 0 2px rgb(59 130 246);
                }
                .dark .input-field {
                    border-color: rgb(75 85 99);
                    background-color: rgb(55 65 81);
                    color: white;
                }
                .dark .input-field::placeholder {
                    color: rgb(107 114 128);
                }
            `}</style>
        </div>
    );
}