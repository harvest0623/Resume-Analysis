import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Video,
    Phone,
    Building2,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Star,
    MessageSquare,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    TrendingUp,
    Users,
    Briefcase,
    Bell,
    BellRing,
    Timer,
    ArrowUpRight,
    Download,
    Copy,
    Check,
    Eye,
    ClipboardList,
    GraduationCap,
    Mail,
    Target,
    Brain,
    Heart,
    Zap,
    Layers,
    RotateCcw,
    SlidersHorizontal,
    ChevronDown,
    Info,
    CalendarCheck,
    CalendarClock,
    CalendarX,
    CalendarOff,
    GripVertical,
    Sparkles,
    Tag,
    Flame,
    Activity,
    GitMerge,
    Smile,
    Frown,
    Meh,
    Coffee,
    Moon,
    Sun,
    Sunrise,
    Sunset,
    Dribbble,
    Hash,
    FlagTriangleRight,
    ListTodo,
    RefreshCw,
    Wand2,
    Palette,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area,
} from "recharts";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

/* ========== 动画背景组件 ========== */

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-rose-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -80, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-fuchsia-400/20 to-pink-400/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

const ParticleField = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
    }));

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-pink-500/10 dark:bg-pink-400/10"
                    style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

/* ========== 类型定义 ========== */

type InterviewType = "onsite" | "video" | "phone";
type InterviewStatus = "scheduled" | "completed" | "cancelled" | "pending" | "in_progress";
type InterviewResult = "pass" | "fail" | "pending" | null;
type InterviewPriority = "critical" | "high" | "medium" | "low";
type InterviewTag = "紧急" | "高管" | "校招" | "社招" | "实习" | "急聘" | "核心岗位" | "储备";

interface ActivityLog {
    id: string;
    interviewId: string;
    action: string;
    detail: string;
    timestamp: string;
    icon: React.ReactNode;
}

interface EvaluationDimension {
    name: string;
    score: number;
    maxScore: number;
    icon: React.ReactNode;
}

interface Interview {
    id: string;
    candidateName: string;
    candidateAvatar: string;
    candidateEmail: string;
    candidatePhone: string;
    candidateResume: string;
    position: string;
    department: string;
    interviewer: string;
    interviewerAvatar: string;
    date: string;
    time: string;
    endTime: string;
    duration: string;
    type: InterviewType;
    location: string;
    status: InterviewStatus;
    result: InterviewResult;
    round: number;
    totalRounds: number;
    priority: InterviewPriority;
    tags: InterviewTag[];
    feedback?: string;
    feedbackSentiment?: "positive" | "neutral" | "negative";
    rating?: number;
    evaluations?: EvaluationDimension[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

type ViewMode = "list" | "calendar" | "stats";
type ModalType = "detail" | "edit" | "evaluate" | "add" | null;

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];
const STATUS_COLORS: Record<InterviewStatus, string> = {
    scheduled: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
    pending: "#f59e0b",
    in_progress: "#8b5cf6",
};
const RESULT_COLORS: Record<string, string> = {
    pass: "#10b981",
    fail: "#ef4444",
    pending: "#6b7280",
};

/* ========== 模拟数据 ========== */

const mockInterviews: Interview[] = [
    {
        id: "1",
        candidateName: "张明远",
        candidateAvatar: "张",
        candidateEmail: "zhangmingyuan@example.com",
        candidatePhone: "138-0000-0001",
        candidateResume: "前端开发工程师简历_张明远.pdf",
        position: "高级前端工程师",
        department: "技术研发部",
        interviewer: "李经理",
        interviewerAvatar: "李",
        date: "2026-06-12",
        time: "10:00",
        endTime: "11:00",
        duration: "60分钟",
        type: "video",
        location: "腾讯会议",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 3,
        priority: "high",
        tags: ["核心岗位", "社招"],
        createdAt: "2026-06-08T08:00:00Z",
        updatedAt: "2026-06-08T08:00:00Z",
    },
    {
        id: "2",
        candidateName: "李思涵",
        candidateAvatar: "李",
        candidateEmail: "lisihan@example.com",
        candidatePhone: "138-0000-0002",
        candidateResume: "后端开发工程师简历_李思涵.pdf",
        position: "后端开发工程师",
        department: "技术研发部",
        interviewer: "王总监",
        interviewerAvatar: "王",
        date: "2026-06-10",
        time: "14:00",
        endTime: "14:45",
        duration: "45分钟",
        type: "onsite",
        location: "北京总部 3楼会议室A",
        status: "scheduled",
        result: null,
        round: 2,
        totalRounds: 3,
        priority: "critical",
        tags: ["紧急", "高管"],
        createdAt: "2026-06-07T10:00:00Z",
        updatedAt: "2026-06-07T10:00:00Z",
    },
    {
        id: "3",
        candidateName: "王浩然",
        candidateAvatar: "王",
        candidateEmail: "wanghaoran@example.com",
        candidatePhone: "138-0000-0003",
        candidateResume: "产品经理简历_王浩然.pdf",
        position: "产品经理",
        department: "产品部",
        interviewer: "赵经理",
        interviewerAvatar: "赵",
        date: "2026-06-09",
        time: "11:00",
        endTime: "11:30",
        duration: "30分钟",
        type: "phone",
        location: "电话面试",
        status: "completed",
        result: "pass",
        round: 1,
        totalRounds: 2,
        priority: "medium",
        tags: ["社招"],
        feedback: "候选人表达清晰，产品思维敏捷，有较强的逻辑能力，对行业趋势有深刻理解。",
        feedbackSentiment: "positive",
        rating: 4,
        evaluations: [
            { name: "技术能力", score: 4, maxScore: 5, icon: <Brain className="w-4 h-4" /> },
            { name: "沟通表达", score: 5, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 4, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 3, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 4, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "建议进入下一轮面试，重点考察项目管理能力。",
        createdAt: "2026-06-06T14:00:00Z",
        updatedAt: "2026-06-09T12:00:00Z",
    },
    {
        id: "4",
        candidateName: "赵雨桐",
        candidateAvatar: "赵",
        candidateEmail: "zhaoyutong@example.com",
        candidatePhone: "138-0000-0004",
        candidateResume: "UI设计师简历_赵雨桐.pdf",
        position: "UI设计师",
        department: "设计部",
        interviewer: "刘总监",
        interviewerAvatar: "刘",
        date: "2026-06-08",
        time: "15:00",
        endTime: "16:00",
        duration: "60分钟",
        type: "video",
        location: "Zoom",
        status: "completed",
        result: "fail",
        round: 2,
        totalRounds: 2,
        priority: "medium",
        tags: ["社招"],
        feedback: "设计能力出色，作品集质量高，但团队协作经验稍显不足，与团队文化契合度有待提升。",
        feedbackSentiment: "neutral",
        rating: 3,
        evaluations: [
            { name: "设计能力", score: 4, maxScore: 5, icon: <Sparkles className="w-4 h-4" /> },
            { name: "沟通表达", score: 3, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 3, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 2, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 3, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "设计能力符合要求，但建议寻找更匹配团队文化的候选人。",
        createdAt: "2026-06-05T09:00:00Z",
        updatedAt: "2026-06-08T17:00:00Z",
    },
    {
        id: "5",
        candidateName: "孙博文",
        candidateAvatar: "孙",
        candidateEmail: "sunbowen@example.com",
        candidatePhone: "138-0000-0005",
        candidateResume: "数据分析师简历_孙博文.pdf",
        position: "数据分析师",
        department: "数据部",
        interviewer: "陈经理",
        interviewerAvatar: "陈",
        date: "2026-06-15",
        time: "09:30",
        endTime: "10:15",
        duration: "45分钟",
        type: "onsite",
        location: "上海分公司 5楼会议室B",
        status: "pending",
        result: null,
        round: 1,
        totalRounds: 2,
        priority: "low",
        tags: ["储备"],
        createdAt: "2026-06-09T11:00:00Z",
        updatedAt: "2026-06-09T11:00:00Z",
    },
    {
        id: "6",
        candidateName: "周雅婷",
        candidateAvatar: "周",
        candidateEmail: "zhouyating@example.com",
        candidatePhone: "138-0000-0006",
        candidateResume: "运营经理简历_周雅婷.pdf",
        position: "运营经理",
        department: "运营部",
        interviewer: "吴总监",
        interviewerAvatar: "吴",
        date: "2026-06-10",
        time: "16:00",
        endTime: "16:45",
        duration: "45分钟",
        type: "video",
        location: "飞书会议",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 2,
        priority: "high",
        tags: ["急聘", "社招"],
        createdAt: "2026-06-08T08:30:00Z",
        updatedAt: "2026-06-08T08:30:00Z",
    },
    {
        id: "7",
        candidateName: "吴子轩",
        candidateAvatar: "吴",
        candidateEmail: "wuzixuan@example.com",
        candidatePhone: "138-0000-0007",
        candidateResume: "Java开发工程师简历_吴子轩.pdf",
        position: "Java开发工程师",
        department: "技术研发部",
        interviewer: "王总监",
        interviewerAvatar: "王",
        date: "2026-06-16",
        time: "10:00",
        endTime: "11:00",
        duration: "60分钟",
        type: "onsite",
        location: "北京总部 2楼会议室C",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 3,
        priority: "medium",
        tags: ["校招"],
        createdAt: "2026-06-09T14:00:00Z",
        updatedAt: "2026-06-09T14:00:00Z",
    },
    {
        id: "8",
        candidateName: "郑雨晴",
        candidateAvatar: "郑",
        candidateEmail: "zhengyuqing@example.com",
        candidatePhone: "138-0000-0008",
        candidateResume: "测试工程师简历_郑雨晴.pdf",
        position: "测试工程师",
        department: "质量保障部",
        interviewer: "钱经理",
        interviewerAvatar: "钱",
        date: "2026-06-09",
        time: "14:00",
        endTime: "15:00",
        duration: "60分钟",
        type: "phone",
        location: "电话面试",
        status: "completed",
        result: "pass",
        round: 2,
        totalRounds: 2,
        priority: "high",
        tags: ["急聘", "核心岗位"],
        feedback: "测试理论基础扎实，自动化测试经验丰富，沟通能力良好。",
        feedbackSentiment: "positive",
        rating: 5,
        evaluations: [
            { name: "技术能力", score: 5, maxScore: 5, icon: <Brain className="w-4 h-4" /> },
            { name: "沟通表达", score: 4, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 5, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 4, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 5, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "强烈推荐录用，综合素质优秀。",
        createdAt: "2026-06-04T10:00:00Z",
        updatedAt: "2026-06-09T16:00:00Z",
    },
];

const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];

/* ========== 工具函数 ========== */

const getStatusText = (status: InterviewStatus): string => {
    const map: Record<InterviewStatus, string> = {
        scheduled: "已安排",
        completed: "已完成",
        cancelled: "已取消",
        pending: "待确认",
        in_progress: "进行中",
    };
    return map[status];
};

const getStatusBadgeClass = (status: InterviewStatus): string => {
    const map: Record<InterviewStatus, string> = {
        scheduled: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        in_progress: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    };
    return map[status];
};

const getResultText = (result: InterviewResult): string => {
    const map: Record<string, string> = { pass: "通过", fail: "未通过", pending: "待定" };
    return result ? map[result] : "-";
};

const getResultBadgeClass = (result: InterviewResult): string => {
    if (!result) return "";
    const map: Record<string, string> = {
        pass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
        fail: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
        pending: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    };
    return map[result];
};

const getTypeIcon = (type: InterviewType) => {
    switch (type) {
        case "onsite": return <Building2 className="w-4 h-4" />;
        case "video": return <Video className="w-4 h-4" />;
        case "phone": return <Phone className="w-4 h-4" />;
    }
};

const getTypeText = (type: InterviewType): string => {
    const map: Record<InterviewType, string> = { onsite: "现场面试", video: "视频面试", phone: "电话面试" };
    return map[type];
};

const getPriorityConfig = (priority: InterviewPriority) => {
    const map: Record<InterviewPriority, { label: string; color: string; icon: React.ReactNode; gradient: string }> = {
        critical: { label: "紧急", color: "text-red-500", icon: <Flame className="w-3 h-3" />, gradient: "from-red-500 to-rose-500" },
        high: { label: "高", color: "text-orange-500", icon: <FlagTriangleRight className="w-3 h-3" />, gradient: "from-orange-500 to-amber-500" },
        medium: { label: "中", color: "text-blue-500", icon: <Info className="w-3 h-3" />, gradient: "from-blue-500 to-cyan-500" },
        low: { label: "低", color: "text-gray-400", icon: <ChevronDown className="w-3 h-3" />, gradient: "from-gray-400 to-gray-500" },
    };
    return map[priority];
};

const getTagConfig = (tag: InterviewTag) => {
    const map: Record<InterviewTag, { color: string; icon: React.ReactNode }> = {
        "紧急": { color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", icon: <Flame className="w-2.5 h-2.5" /> },
        "高管": { color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800", icon: <Star className="w-2.5 h-2.5" /> },
        "校招": { color: "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800", icon: <GraduationCap className="w-2.5 h-2.5" /> },
        "社招": { color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", icon: <Briefcase className="w-2.5 h-2.5" /> },
        "实习": { color: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800", icon: <Coffee className="w-2.5 h-2.5" /> },
        "急聘": { color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800", icon: <Zap className="w-2.5 h-2.5" /> },
        "核心岗位": { color: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800", icon: <Target className="w-2.5 h-2.5" /> },
        "储备": { color: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700", icon: <Dribbble className="w-2.5 h-2.5" /> },
    };
    return map[tag];
};

/* ========== 子组件 ========== */

// 统计卡片 - 玻璃拟态风格
function StatCard({ icon, label, value, sub, color, trend, gradient }: {
    icon: React.ReactNode; label: string; value: string | number;
    sub?: string; color: string; trend?: { value: string; up: boolean };
    gradient?: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-xl transition-shadow duration-300"
            style={{ background: gradient || `linear-gradient(135deg, ${color}08, ${color}15)` }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: color }} />
            <div className="relative">
                <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white" }}>
                        {icon}
                    </div>
                    {trend && (
                        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend.up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                            <ArrowUpRight className={`w-3 h-3 mr-0.5 ${!trend.up && "rotate-180"}`} />
                            {trend.value}
                        </span>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                    {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
                </div>
            </div>
        </motion.div>
    );
}

// 面试轮次进度条
function RoundProgress({ round, total }: { round: number; total: number }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                        i < round
                            ? "bg-gradient-to-r from-pink-500 to-rose-500"
                            : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    style={{ width: i === round - 1 ? "16px" : "8px" }}
                />
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{round}/{total}</span>
        </div>
    );
}

// 今日日程时间线
function TodayTimeline({ interviews }: { interviews: Interview[] }) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">今日日程</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{interviews.length} 场面试</p>
                    </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {now.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
                </span>
            </div>

            {interviews.length === 0 ? (
                <div className="text-center py-8">
                    <CalendarOff className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">今日暂无面试安排</p>
                </div>
            ) : (
                <div className="relative">
                    {/* 时间轴线 */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-pink-400 to-rose-400 opacity-30" />

                    <div className="space-y-3">
                        {interviews
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((iv, idx) => {
                                const [h, m] = iv.time.split(":").map(Number);
                                const isPast = h < currentHour || (h === currentHour && m < currentMinute);
                                const isCurrent = h === currentHour && !isPast;

                                return (
                                    <motion.div
                                        key={iv.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-start gap-3 ${isPast ? "opacity-50" : ""}`}
                                    >
                                        <div className={`relative z-10 w-[14px] h-[14px] rounded-full border-[3px] mt-1.5 flex-shrink-0 ${
                                            isCurrent
                                                ? "border-pink-500 bg-white shadow-lg shadow-pink-500/30 animate-pulse"
                                                : isPast
                                                    ? "border-gray-300 bg-gray-200 dark:border-gray-600 dark:bg-gray-700"
                                                    : "border-rose-400 bg-white dark:bg-gray-800"
                                        }`} />
                                        <div className={`flex-1 p-3 rounded-xl transition-all ${
                                            isCurrent
                                                ? "bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800"
                                                : isPast
                                                    ? "bg-gray-50 dark:bg-gray-800/50"
                                                    : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                                                        {iv.time}
                                                    </span>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {iv.candidateName}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(iv.status)}`}>
                                                    {getStatusText(iv.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{iv.position}</span>
                                                <span>·</span>
                                                <span>{iv.interviewer}</span>
                                                <span>·</span>
                                                <span>{getTypeText(iv.type)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}

// 快速操作面板
function QuickActions({ onAdd, onExport }: { onAdd: () => void; onExport: () => void }) {
    const actions = [
        { icon: <Plus className="w-5 h-5" />, label: "安排面试", color: "from-pink-500 to-rose-500", onClick: onAdd },
        { icon: <Download className="w-5 h-5" />, label: "导出数据", color: "from-violet-500 to-purple-500", onClick: onExport },
        { icon: <CalendarCheck className="w-5 h-5" />, label: "今日日程", color: "from-blue-500 to-cyan-500", onClick: () => document.getElementById("today-timeline")?.scrollIntoView({ behavior: "smooth" }) },
        { icon: <BarChart3 className="w-5 h-5" />, label: "数据统计", color: "from-emerald-500 to-teal-500", onClick: () => document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" }) },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
        >
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {actions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.onClick}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-sm`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

// 面试官排行榜
function InterviewerRanking({ interviews }: { interviews: Interview[] }) {
    const interviewerStats = useMemo(() => {
        const map: Record<string, { count: number; passCount: number; totalRating: number; ratedCount: number }> = {};
        interviews.forEach((iv) => {
            if (!map[iv.interviewer]) {
                map[iv.interviewer] = { count: 0, passCount: 0, totalRating: 0, ratedCount: 0 };
            }
            map[iv.interviewer].count++;
            if (iv.result === "pass") map[iv.interviewer].passCount++;
            if (iv.rating) {
                map[iv.interviewer].totalRating += iv.rating;
                map[iv.interviewer].ratedCount++;
            }
        });
        return Object.entries(map)
            .map(([name, stats]) => ({
                name,
                avatar: name[0],
                count: stats.count,
                passRate: stats.count > 0 ? Math.round((stats.passCount / stats.count) * 100) : 0,
                avgRating: stats.ratedCount > 0 ? (stats.totalRating / stats.ratedCount).toFixed(1) : "-",
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [interviews]);

    const maxCount = interviewerStats[0]?.count || 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">面试官排行</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">按面试数量排名</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {interviewerStats.map((item, idx) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? "bg-amber-400 text-white" :
                            idx === 1 ? "bg-gray-300 text-gray-700" :
                            idx === 2 ? "bg-orange-300 text-orange-700" :
                            "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                            {idx + 1}
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {item.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{item.count} 场</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                                />
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-gray-400">通过率 {item.passRate}%</span>
                                <span className="text-[10px] text-gray-400">评分 {item.avgRating}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// 数据洞察面板
function DataInsights({ interviews }: { interviews: Interview[] }) {
    const insights = useMemo(() => {
        const completed = interviews.filter((i) => i.status === "completed");
        const total = interviews.length;
        const passCount = completed.filter((i) => i.result === "pass").length;
        const failCount = completed.filter((i) => i.result === "fail").length;

        // 面试方式偏好
        const typeCount = { onsite: 0, video: 0, phone: 0 };
        interviews.forEach((i) => { typeCount[i.type]++; });
        const mostUsedType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];

        // 平均面试轮次
        const avgRounds = total > 0 ? (interviews.reduce((sum, i) => sum + i.round, 0) / total).toFixed(1) : "0";

        // 本周面试数
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeekCount = interviews.filter((i) => new Date(i.date) >= weekAgo).length;

        return {
            passRate: completed.length > 0 ? Math.round((passCount / completed.length) * 100) : 0,
            failRate: completed.length > 0 ? Math.round((failCount / completed.length) * 100) : 0,
            mostUsedType: mostUsedType ? getTypeText(mostUsedType[0] as InterviewType) : "-",
            avgRounds,
            thisWeekCount,
            topDepartment: (() => {
                const deptMap: Record<string, number> = {};
                interviews.forEach((i) => { deptMap[i.department] = (deptMap[i.department] || 0) + 1; });
                return Object.entries(deptMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
            })(),
        };
    }, [interviews]);

    const items = [
        { label: "通过率", value: `${insights.passRate}%`, icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-500" },
        { label: "未通过率", value: `${insights.failRate}%`, icon: <XCircle className="w-4 h-4" />, color: "text-red-500" },
        { label: "最常用方式", value: insights.mostUsedType, icon: <Video className="w-4 h-4" />, color: "text-blue-500" },
        { label: "平均轮次", value: `${insights.avgRounds} 轮`, icon: <Layers className="w-4 h-4" />, color: "text-purple-500" },
        { label: "本周面试", value: `${insights.thisWeekCount} 场`, icon: <TrendingUp className="w-4 h-4" />, color: "text-pink-500" },
        { label: "热门部门", value: insights.topDepartment, icon: <Building2 className="w-4 h-4" />, color: "text-amber-500" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">数据洞察</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">智能分析面试数据</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className={item.color}>{item.icon}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// 年度面试热力图 - GitHub贡献图风格
function YearlyHeatmap({ interviews, onDateSelect }: { interviews: Interview[]; onDateSelect: (date: string) => void }) {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    // 展示近12个月
    const months: { name: string; weeks: { date: string; count: number; isToday: boolean; isFuture: boolean }[][] }[] = [];

    for (let m = 0; m < 12; m++) {
        const monthDate = new Date(today.getFullYear(), m, 1);
        const daysInMonth = new Date(today.getFullYear(), m + 1, 0).getDate();
        const firstDayOfWeek = monthDate.getDay();
        const weeks: { date: string; count: number; isToday: boolean; isFuture: boolean }[][] = [];
        let currentWeek: { date: string; count: number; isToday: boolean; isFuture: boolean }[] = [];

        // 填充月初空白日
        for (let d = 0; d < firstDayOfWeek; d++) {
            currentWeek.push({ date: "", count: -1, isToday: false, isFuture: false });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${today.getFullYear()}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const count = interviews.filter((i) => i.date === dateStr).length;
            const dateObj = new Date(today.getFullYear(), m, d);
            const isToday = dateObj.toDateString() === today.toDateString();
            const isFuture = dateObj > today;

            currentWeek.push({ date: dateStr, count, isToday, isFuture });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // 填充月末剩余日
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ date: "", count: -1, isToday: false, isFuture: false });
            }
            weeks.push(currentWeek);
        }

        months.push({ name: `${m + 1}月`, weeks });
    }

    const maxCount = Math.max(1, ...Object.values(
        interviews.reduce((acc, iv) => {
            acc[iv.date] = (acc[iv.date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ));
    const getHeatColor = (count: number, isFuture: boolean) => {
        if (count < 0) return "bg-transparent";
        if (isFuture) return "bg-gray-100 dark:bg-gray-700/30";
        if (count === 0) return "bg-gray-100 dark:bg-gray-700/50";
        const intensity = Math.min(count / Math.max(maxCount, 4), 1);
        if (intensity <= 0.25) return "bg-pink-200 dark:bg-pink-900/40";
        if (intensity <= 0.5) return "bg-pink-400 dark:bg-pink-700/60";
        if (intensity <= 0.75) return "bg-pink-500 dark:bg-pink-600/80";
        return "bg-pink-700 dark:bg-pink-500";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">面试热力图</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{today.getFullYear()}年面试密度分布</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">少</span>
                    <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700/50" />
                    <div className="w-3 h-3 rounded-sm bg-pink-200 dark:bg-pink-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-pink-400 dark:bg-pink-700/60" />
                    <div className="w-3 h-3 rounded-sm bg-pink-500 dark:bg-pink-600/80" />
                    <div className="w-3 h-3 rounded-sm bg-pink-700 dark:bg-pink-500" />
                    <span className="text-[10px] text-gray-400">多</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-[800px]">
                    {months.map((month, mIdx) => (
                        <div key={mIdx} className="flex-1">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 text-center">{month.name}</div>
                            <div className="flex gap-[3px]">
                                {month.weeks.map((week, wIdx) => (
                                    <div key={wIdx} className="flex flex-col gap-[3px]">
                                        {week.map((day, dIdx) => (
                                            <motion.div
                                                key={dIdx}
                                                whileHover={{ scale: 1.3 }}
                                                className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getHeatColor(day.count, day.isFuture)} ${
                                                    day.isToday ? "ring-2 ring-pink-500 ring-offset-1" : ""
                                                }`}
                                                onClick={() => day.date && onDateSelect(day.date)}
                                                title={day.date ? `${day.date} · ${day.count} 场面试` : ""}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm ring-2 ring-pink-500 ring-offset-1 bg-pink-200 dark:bg-pink-900/40" />
                        <span className="text-[10px] text-gray-400">今天</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700/30" />
                        <span className="text-[10px] text-gray-400">未来</span>
                    </div>
                </div>
                <span className="text-[10px] text-gray-400">
                    总计 {interviews.length} 场面试
                </span>
            </div>
        </div>
    );
}

// 智能排期建议面板
function SmartSuggestion({ interviews }: { interviews: Interview[] }) {
    const suggestions = useMemo(() => {
        const completed = interviews.filter((i) => i.status === "completed");
        const allTimes = completed.map((i) => i.time);
        const passInterviews = completed.filter((i) => i.result === "pass");

        // 最佳面试时段 - 通过率最高的时段
        const passByHour: Record<string, { total: number; pass: number }> = {};
        completed.forEach((iv) => {
            const hour = iv.time.split(":")[0];
            if (!passByHour[hour]) passByHour[hour] = { total: 0, pass: 0 };
            passByHour[hour].total++;
            if (iv.result === "pass") passByHour[hour].pass++;
        });

        const bestHour = Object.entries(passByHour)
            .map(([h, d]) => ({ hour: `${h}:00`, rate: d.total > 0 ? Math.round((d.pass / d.total) * 100) : 0, total: d.total }))
            .sort((a, b) => b.rate - a.rate || b.total - a.total)
            .slice(0, 3);

        // 最佳面试方式
        const passByType: Record<string, { total: number; pass: number }> = {};
        completed.forEach((iv) => {
            if (!passByType[iv.type]) passByType[iv.type] = { total: 0, pass: 0 };
            passByType[iv.type].total++;
            if (iv.result === "pass") passByType[iv.type].pass++;
        });

        const bestType = Object.entries(passByType)
            .map(([t, d]) => ({ type: getTypeText(t as InterviewType), rate: d.total > 0 ? Math.round((d.pass / d.total) * 100) : 0 }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 1);

        // 最佳面试时长
        const passByDuration: Record<string, { total: number; pass: number }> = {};
        completed.forEach((iv) => {
            const dur = iv.duration;
            if (!passByDuration[dur]) passByDuration[dur] = { total: 0, pass: 0 };
            passByDuration[dur].total++;
            if (iv.result === "pass") passByDuration[dur].pass++;
        });

        const bestDuration = Object.entries(passByDuration)
            .map(([d, s]) => ({ duration: d, rate: s.total > 0 ? Math.round((s.pass / s.total) * 100) : 0 }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 1);

        // 本周最佳面试日
        const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const passByDay: Record<number, { total: number; pass: number }> = {};
        completed.forEach((iv) => {
            const day = new Date(iv.date).getDay();
            if (!passByDay[day]) passByDay[day] = { total: 0, pass: 0 };
            passByDay[day].total++;
            if (iv.result === "pass") passByDay[day].pass++;
        });

        const bestDay = Object.entries(passByDay)
            .map(([d, s]) => ({ day: dayNames[Number(d)], rate: s.total > 0 ? Math.round((s.pass / s.total) * 100) : 0 }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 1);

        return { bestHour, bestType, bestDuration, bestDay };
    }, [interviews]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">智能排期建议</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">基于历史通过率数据分析</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {suggestions.bestDay.length > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">最佳面试日</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{suggestions.bestDay[0].day}</span>
                            <span className="text-sm text-purple-500 dark:text-purple-400">通过率 {suggestions.bestDay[0].rate}%</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.bestType.length > 0 && (
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Video className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">最佳面试方式</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{suggestions.bestType[0].type}</span>
                                <span className="text-xs text-green-500">{suggestions.bestType[0].rate}%</span>
                            </div>
                        </div>
                    )}

                    {suggestions.bestDuration.length > 0 && (
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Timer className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">最佳面试时长</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{suggestions.bestDuration[0].duration}</span>
                                <span className="text-xs text-green-500">{suggestions.bestDuration[0].rate}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {suggestions.bestHour.length > 0 && (
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">最佳面试时段</span>
                        <div className="flex gap-2">
                            {suggestions.bestHour.map((h, idx) => (
                                <div
                                    key={idx}
                                    className="flex-1 text-center py-2 px-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800"
                                >
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{h.hour}</div>
                                    <div className="text-[10px] text-pink-500">{h.rate}% 通过率</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 最近动态流
function RecentActivity({ interviews, onViewInterview }: { interviews: Interview[]; onViewInterview: (id: string) => void }) {
    const activities = useMemo(() => {
        const acts: ActivityLog[] = [];
        
        interviews
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 8)
            .forEach((iv) => {
                if (iv.status === "completed" && iv.result) {
                    acts.push({
                        id: `complete-${iv.id}`,
                        interviewId: iv.id,
                        action: getResultText(iv.result),
                        detail: `${iv.candidateName} 的${iv.position}面试${getResultText(iv.result)}`,
                        timestamp: iv.updatedAt,
                        icon: iv.result === "pass" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />,
                    });
                } else if (iv.status === "scheduled") {
                    const createdDate = new Date(iv.createdAt);
                    const now = new Date();
                    const diffHours = Math.floor((now.getTime() - createdDate.getTime()) / 3600000);
                    if (diffHours < 48) {
                        acts.push({
                            id: `new-${iv.id}`,
                            interviewId: iv.id,
                            action: "新安排",
                            detail: `为 ${iv.candidateName} 安排了${iv.position}面试`,
                            timestamp: iv.createdAt,
                            icon: <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />,
                        });
                    }
                }
            });

        return acts.slice(0, 6);
    }, [interviews]);

    if (activities.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">最近动态</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">面试活动实时追踪</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {activities.map((act, idx) => {
                    const timestamp = new Date(act.timestamp);
                    const now = new Date();
                    const diffMs = now.getTime() - timestamp.getTime();
                    const diffMin = Math.floor(diffMs / 60000);
                    const diffHour = Math.floor(diffMs / 3600000);
                    const timeStr = diffMin < 1 ? "刚刚" : diffMin < 60 ? `${diffMin}分钟前` : diffHour < 24 ? `${diffHour}小时前` : `${Math.floor(diffHour / 24)}天前`;

                    return (
                        <motion.div
                            key={act.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={() => onViewInterview(act.interviewId)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                {act.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white truncate">{act.detail}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeStr}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {act.action}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// 面试卡片 - 增强版
function InterviewCard({ interview, onView, onEdit, onEvaluate, selected, onSelect }: {
    interview: Interview;
    onView: () => void;
    onEdit: () => void;
    onEvaluate: () => void;
    selected: boolean;
    onSelect: (id: string) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isPast = new Date(`${interview.date}T${interview.endTime}`) < new Date() && interview.status === "scheduled";

    // 计算面试时间距离现在的时间
    const getTimeStatus = () => {
        if (interview.status !== "scheduled") return null;
        const now = new Date();
        const start = new Date(`${interview.date}T${interview.time}`);
        const diffMs = start.getTime() - now.getTime();
        if (diffMs < 0) return { label: "已开始", color: "text-amber-600 dark:text-amber-400" };
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin <= 30) return { label: `${diffMin}分钟后`, color: "text-pink-600 dark:text-pink-400" };
        if (diffMin <= 60) return { label: `${diffMin}分钟后`, color: "text-gray-500 dark:text-gray-400" };
        return null;
    };

    const timeStatus = getTimeStatus();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            whileHover={{ y: -2 }}
            className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selected
                    ? "border-pink-400 dark:border-pink-500 ring-2 ring-pink-100 dark:ring-pink-900/30"
                    : "border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800/50"
            }`}
            onClick={() => onView()}
        >
            {/* 左侧状态指示条 */}
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
                interview.status === "completed" ? "bg-emerald-500" :
                interview.status === "scheduled" ? "bg-pink-500" :
                interview.status === "pending" ? "bg-amber-500" :
                "bg-gray-300 dark:bg-gray-600"
            }`} />

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <label className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => onSelect(interview.id)}
                            className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                    </label>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20">
                            {interview.candidateAvatar}
                        </div>
                        {timeStatus && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{interview.candidateName}</h3>
                            {timeStatus && (
                                <span className={`text-[10px] font-semibold ${timeStatus.color} animate-pulse`}>
                                    {timeStatus.label}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{interview.position} · {interview.department}</p>
                        <RoundProgress round={interview.round} total={interview.totalRounds} />
                        {/* 标签和优先级 */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                            {getPriorityConfig(interview.priority) && (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 dark:bg-gray-700/50 ${getPriorityConfig(interview.priority).color}`}>
                                    {getPriorityConfig(interview.priority).icon}
                                    {getPriorityConfig(interview.priority).label}优先
                                </span>
                            )}
                            {interview.tags.slice(0, 3).map((tag) => {
                                const config = getTagConfig(tag);
                                return (
                                    <span key={tag} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${config.color}`}>
                                        {config.icon}
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(interview.status)}`}>
                        {getStatusText(interview.status)}
                    </span>
                    {interview.result && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getResultBadgeClass(interview.result)}`}>
                            {getResultText(interview.result)}
                        </span>
                    )}
                    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                                <button onClick={() => { onView(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <Eye className="w-3.5 h-3.5 text-gray-400" /> 查看详情
                                </button>
                                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <Edit className="w-3.5 h-3.5 text-gray-400" /> 编辑
                                </button>
                                {interview.status === "completed" && (
                                    <button onClick={() => { onEvaluate(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                        <ClipboardList className="w-3.5 h-3.5 text-gray-400" /> 评价
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    <span>{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>{interview.time} - {interview.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-pink-400">{getTypeIcon(interview.type)}</span>
                    <span>{getTypeText(interview.type)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3.5 h-3.5 text-pink-400" />
                    <span>{interview.interviewer}</span>
                </div>
            </div>

            {interview.feedback && (
                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{interview.feedback}</p>
                </div>
            )}

            {isPast && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    面试时间已过，请确认状态
                </div>
            )}
        </motion.div>
    );
}

// 面试提醒弹窗
function InterviewAlarm({ interviews, onDismiss }: { interviews: Interview[]; onDismiss: () => void }) {
    const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});
    const [urgentInterviews, setUrgentInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        const updateTimers = () => {
            const now = new Date();
            const newTimeLeft: Record<string, string> = {};
            const urgent: Interview[] = [];

            interviews.forEach((iv) => {
                if (iv.status !== "scheduled") return;
                const startTime = new Date(`${iv.date}T${iv.time}`);
                const diffMs = startTime.getTime() - now.getTime();

                if (diffMs <= 0) return;

                const diffMin = Math.floor(diffMs / 60000);
                const hours = Math.floor(diffMin / 60);
                const minutes = diffMin % 60;

                if (diffMin <= 30) {
                    urgent.push(iv);
                    newTimeLeft[iv.id] = diffMin <= 1 ? "即将开始" : `${diffMin} 分钟后`;
                } else if (hours > 0) {
                    newTimeLeft[iv.id] = `${hours} 小时 ${minutes} 分钟后`;
                } else {
                    newTimeLeft[iv.id] = `${minutes} 分钟后`;
                }
            });

            setTimeLeft(newTimeLeft);
            setUrgentInterviews(urgent);
        };

        updateTimers();
        const interval = setInterval(updateTimers, 10000);
        return () => clearInterval(interval);
    }, [interviews]);

    if (urgentInterviews.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <BellRing className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">面试即将开始</h2>
                                <p className="text-sm text-white/70">请提前做好准备</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {urgentInterviews.map((iv) => (
                            <div key={iv.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                            {iv.candidateAvatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{iv.candidateName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{iv.position}</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                                        {timeLeft[iv.id] || "计算中..."}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{iv.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{iv.time} - {iv.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {getTypeIcon(iv.type)}
                                        <span>{getTypeText(iv.type)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="truncate">{iv.location}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <User className="w-3.5 h-3.5" />
                                    <span>面试官：{iv.interviewer}</span>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>{iv.department}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            知道了
                        </button>
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                        >
                            进入面试
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// 添加/编辑面试弹窗
function InterviewFormModal({ interview, onClose, onSave }: {
    interview?: Interview;
    onClose: () => void;
    onSave: (data: Partial<Interview>) => void;
}) {
    const [form, setForm] = useState({
        candidateName: interview?.candidateName || "",
        candidateEmail: interview?.candidateEmail || "",
        candidatePhone: interview?.candidatePhone || "",
        position: interview?.position || "",
        department: interview?.department || "技术研发部",
        interviewer: interview?.interviewer || "",
        date: interview?.date || new Date().toISOString().split("T")[0],
        time: interview?.time || "10:00",
        endTime: interview?.endTime || "11:00",
        duration: interview?.duration || "60分钟",
        type: interview?.type || "video" as InterviewType,
        location: interview?.location || "",
        round: interview?.round || 1,
        totalRounds: interview?.totalRounds || 3,
        notes: interview?.notes || "",
        priority: interview?.priority || "medium" as InterviewPriority,
        tags: interview?.tags || [] as InterviewTag[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {interview ? "编辑面试" : "安排面试"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">候选人姓名 *</label>
                            <input
                                type="text"
                                required
                                value={form.candidateName}
                                onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="请输入候选人姓名"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">应聘职位 *</label>
                            <input
                                type="text"
                                required
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="请输入应聘职位"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱</label>
                            <input
                                type="email"
                                value={form.candidateEmail}
                                onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="candidate@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">电话</label>
                            <input
                                type="tel"
                                value={form.candidatePhone}
                                onChange={(e) => setForm({ ...form, candidatePhone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="138-0000-0000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试日期 *</label>
                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">开始时间 *</label>
                            <input
                                type="time"
                                required
                                value={form.time}
                                onChange={(e) => setForm({ ...form, time: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">结束时间</label>
                            <input
                                type="time"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试方式</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value as InterviewType })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="video">视频面试</option>
                                <option value="onsite">现场面试</option>
                                <option value="phone">电话面试</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试轮次</label>
                            <input
                                type="number"
                                min={1}
                                value={form.round}
                                onChange={(e) => setForm({ ...form, round: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试官</label>
                            <input
                                type="text"
                                value={form.interviewer}
                                onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="请输入面试官"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">部门</label>
                            <select
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            >
                                <option>技术研发部</option>
                                <option>产品部</option>
                                <option>设计部</option>
                                <option>运营部</option>
                                <option>数据部</option>
                                <option>质量保障部</option>
                                <option>市场部</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试地点/链接</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="会议室或视频链接"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">优先级</label>
                            <div className="flex gap-2">
                                {(["critical", "high", "medium", "low"] as InterviewPriority[]).map((p) => {
                                    const cfg = getPriorityConfig(p);
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm({ ...form, priority: p })}
                                            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                                                form.priority === p
                                                    ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent shadow-md`
                                                    : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                            }`}
                                        >
                                            <span className="flex items-center justify-center gap-1">{cfg.icon}{cfg.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(["紧急", "急聘", "高管", "核心岗位", "社招", "校招", "实习", "储备"] as InterviewTag[]).map((tag) => {
                                    const cfg = getTagConfig(tag);
                                    const isSelected = form.tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const newTags = isSelected
                                                    ? form.tags.filter((t) => t !== tag)
                                                    : [...form.tags, tag];
                                                setForm({ ...form, tags: newTags });
                                            }}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                                                isSelected ? `${cfg.color} shadow-sm` : "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                            }`}
                                        >
                                            {cfg.icon}
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            {interview ? "保存修改" : "确认安排"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// 评价弹窗
function EvaluationModal({ interview, onClose, onSave }: {
    interview: Interview;
    onClose: () => void;
    onSave: (data: { feedback: string; rating: number; evaluations: EvaluationDimension[]; result: InterviewResult }) => void;
}) {
    const defaultEvals: EvaluationDimension[] = [
        { name: "技术能力", score: 0, maxScore: 5, icon: <Brain className="w-4 h-4" /> },
        { name: "沟通表达", score: 0, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
        { name: "逻辑思维", score: 0, maxScore: 5, icon: <Target className="w-4 h-4" /> },
        { name: "团队协作", score: 0, maxScore: 5, icon: <Users className="w-4 h-4" /> },
        { name: "学习能力", score: 0, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
    ];

    const [evaluations, setEvaluations] = useState<EvaluationDimension[]>(
        interview.evaluations || defaultEvals
    );
    const [feedback, setFeedback] = useState(interview.feedback || "");
    const [result, setResult] = useState<InterviewResult>(interview.result || "pending");
    const [saved, setSaved] = useState(false);

    const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;

    const handleSave = () => {
        onSave({ feedback, rating: Math.round(avgScore), evaluations, result });
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 800);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white dark:bg-gray-800 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">面试评价</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidateName} · {interview.position}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 面试结果 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">面试结果</label>
                        <div className="flex gap-3">
                            {(["pass", "fail", "pending"] as InterviewResult[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setResult(r)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${result === r
                                            ? r === "pass"
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400"
                                                : r === "fail"
                                                    ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                                                    : "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300"
                                            : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                        }`}
                                >
                                    {r === "pass" ? "通过" : r === "fail" ? "未通过" : "待定"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 多维度评分 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">多维度评分</label>
                        <div className="space-y-4">
                            {evaluations.map((ev, idx) => (
                                <div key={ev.name} className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-28 text-sm text-gray-600 dark:text-gray-400">
                                        {ev.icon}
                                        <span>{ev.name}</span>
                                    </div>
                                    <div className="flex-1 flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((score) => (
                                            <button
                                                key={score}
                                                type="button"
                                                onClick={() => {
                                                    const newEvals = [...evaluations];
                                                    newEvals[idx] = { ...newEvals[idx], score };
                                                    setEvaluations(newEvals);
                                                }}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${score <= ev.score
                                                        ? "bg-amber-400 text-white shadow-sm"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="w-8 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {ev.score}/5
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">综合评分</span>
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 ${s <= Math.round(avgScore) ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-lg text-gray-900 dark:text-white">{avgScore.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 反馈意见 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">面试反馈</label>
                        <textarea
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="请记录面试反馈意见..."
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saved}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${saved
                                ? "bg-emerald-500 text-white"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                            }`}
                    >
                        {saved ? (
                            <span className="flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" /> 已保存
                            </span>
                        ) : (
                            "提交评价"
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// 详情弹窗
function DetailModal({ interview, onClose, onEdit, onEvaluate }: {
    interview: Interview;
    onClose: () => void;
    onEdit: () => void;
    onEvaluate: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="relative">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {interview.candidateAvatar}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{interview.candidateName}</h2>
                                    <p className="text-white/70">{interview.position}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                                            {getStatusText(interview.status)}
                                        </span>
                                        {interview.result && (
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                                                {getResultText(interview.result)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* 基本信息 */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">基本信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={<Mail className="w-4 h-4" />} label="邮箱" value={interview.candidateEmail} />
                            <InfoRow icon={<Phone className="w-4 h-4" />} label="电话" value={interview.candidatePhone} />
                            <InfoRow icon={<Briefcase className="w-4 h-4" />} label="部门" value={interview.department} />
                            <InfoRow icon={<Layers className="w-4 h-4" />} label="轮次" value={`第 ${interview.round} 轮 / 共 ${interview.totalRounds} 轮`} />
                        </div>
                        {interview.tags.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                {getPriorityConfig(interview.priority) && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shadow-sm bg-gradient-to-r ${getPriorityConfig(interview.priority).gradient} text-white`}>
                                        {getPriorityConfig(interview.priority).icon}
                                        {getPriorityConfig(interview.priority).label}优先级
                                    </span>
                                )}
                                {interview.tags.map((tag) => {
                                    const config = getTagConfig(tag);
                                    return (
                                        <span key={tag} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                                            {config.icon}
                                            {tag}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 面试信息 */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">面试信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={<Calendar className="w-4 h-4" />} label="日期" value={interview.date} />
                            <InfoRow icon={<Clock className="w-4 h-4" />} label="时间" value={`${interview.time} - ${interview.endTime} (${interview.duration})`} />
                            <InfoRow icon={getTypeIcon(interview.type)} label="方式" value={`${getTypeText(interview.type)} - ${interview.location}`} />
                            <InfoRow icon={<User className="w-4 h-4" />} label="面试官" value={interview.interviewer} />
                        </div>
                    </div>

                    {/* 评价详情 */}
                    {interview.evaluations && interview.evaluations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">多维度评分</h3>
                            <div className="space-y-3">
                                {interview.evaluations.map((ev) => (
                                    <div key={ev.name} className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 w-28 text-sm text-gray-600 dark:text-gray-400">
                                            {ev.icon}
                                            <span>{ev.name}</span>
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(ev.score / ev.maxScore) * 100}%` }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{ev.score}/{ev.maxScore}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 反馈 */}
                    {interview.feedback && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">面试反馈</h3>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{interview.feedback}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    {interview.rating && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">综合评分:</span>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-4 h-4 ${s <= interview.rating! ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                                            ))}
                                        </div>
                                    )}
                                    {interview.feedbackSentiment && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-400 mr-1">情感:</span>
                                            {interview.feedbackSentiment === "positive" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Smile className="w-3 h-3" />积极
                                                </span>
                                            )}
                                            {interview.feedbackSentiment === "neutral" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <Meh className="w-3 h-3" />中性
                                                </span>
                                            )}
                                            {interview.feedbackSentiment === "negative" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                    <Frown className="w-3 h-3" />消极
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 备注 */}
                    {interview.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">备注</h3>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                <p className="text-amber-800 dark:text-amber-200 text-sm">{interview.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部操作 */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        关闭
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                        编辑
                    </button>
                    {interview.status === "completed" && (
                        <button
                            onClick={onEvaluate}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                        >
                            评价
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value || "-"}</p>
            </div>
        </div>
    );
}

/* ========== 主组件 ========== */

export default function Interview() {
    const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    // 清理搜索防抖定时器
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showAlarm, setShowAlarm] = useState(true);
    const [batchMenuOpen, setBatchMenuOpen] = useState(false);

    /* ========== 日历逻辑 ========== */
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    const getInterviewsForDate = (day: number) => {
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return interviews.filter((i) => i.date === dateStr);
    };

    /* ========== 过滤与搜索 ========== */
    const filteredInterviews = useMemo(() => {
        let result = interviews;
        if (filterStatus !== "all") result = result.filter((i) => i.status === filterStatus);
        if (filterType !== "all") result = result.filter((i) => i.type === filterType);
        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(
                (i) =>
                    i.candidateName.toLowerCase().includes(q) ||
                    i.position.toLowerCase().includes(q) ||
                    i.interviewer.toLowerCase().includes(q) ||
                    i.department.toLowerCase().includes(q)
            );
        }
        return result;
    }, [interviews, filterStatus, filterType, debouncedSearch]);

    /* ========== 统计数据 ========== */
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const todayInterviews = interviews.filter((i) => i.date === today);
        const completed = interviews.filter((i) => i.status === "completed");
        const passCount = completed.filter((i) => i.result === "pass").length;
        const passRate = completed.length > 0 ? Math.round((passCount / completed.length) * 100) : 0;
        const statusCounts = {
            scheduled: interviews.filter((i) => i.status === "scheduled").length,
            completed: completed.length,
            pending: interviews.filter((i) => i.status === "pending").length,
            cancelled: interviews.filter((i) => i.status === "cancelled").length,
        };
        const typeCounts = {
            onsite: interviews.filter((i) => i.type === "onsite").length,
            video: interviews.filter((i) => i.type === "video").length,
            phone: interviews.filter((i) => i.type === "phone").length,
        };
        return { todayInterviews, passRate, passCount, completed, statusCounts, typeCounts };
    }, [interviews]);

    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split("T")[0];
        }).reverse();
        return last7Days.map((date) => {
            const dayInterviews = interviews.filter((i) => i.date === date);
            return {
                date: date.slice(5),
                已完成: dayInterviews.filter((i) => i.status === "completed").length,
                已安排: dayInterviews.filter((i) => i.status === "scheduled").length,
                待确认: dayInterviews.filter((i) => i.status === "pending").length,
            };
        });
    }, [interviews]);

    const pieData = useMemo(() => [
        { name: "已安排", value: stats.statusCounts.scheduled, color: "#3b82f6" },
        { name: "已完成", value: stats.statusCounts.completed, color: "#10b981" },
        { name: "待确认", value: stats.statusCounts.pending, color: "#f59e0b" },
        { name: "已取消", value: stats.statusCounts.cancelled, color: "#ef4444" },
    ], [stats]);

    const departmentData = useMemo(() => {
        const deptMap: Record<string, number> = {};
        interviews.forEach((i) => {
            deptMap[i.department] = (deptMap[i.department] || 0) + 1;
        });
        return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
    }, [interviews]);

    /* ========== 操作 ========== */
    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredInterviews.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredInterviews.map((i) => i.id)));
        }
    }, [selectedIds, filteredInterviews]);

    const handleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleBatchStatusChange = useCallback((status: InterviewStatus) => {
        setInterviews((prev) =>
            prev.map((i) => (selectedIds.has(i.id) ? { ...i, status, updatedAt: new Date().toISOString() } : i))
        );
        setSelectedIds(new Set());
        setBatchMenuOpen(false);
    }, [selectedIds]);

    const handleBatchDelete = useCallback(() => {
        setInterviews((prev) => prev.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setBatchMenuOpen(false);
    }, [selectedIds]);

    const handleSaveInterview = useCallback((data: Partial<Interview>) => {
        if (selectedInterview) {
            setInterviews((prev) =>
                prev.map((i) =>
                    i.id === selectedInterview.id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
                )
            );
        } else {
            const newInterview: Interview = {
                id: String(Date.now()),
                candidateAvatar: (data.candidateName || "新")[0],
                candidateEmail: data.candidateEmail || "",
                candidatePhone: data.candidatePhone || "",
                candidateResume: "",
                interviewerAvatar: (data.interviewer || "面")[0],
                status: "scheduled",
                result: null,
                priority: data.priority || "medium",
                tags: data.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data,
            } as Interview;
            setInterviews((prev) => [newInterview, ...prev]);
        }
        setModalType(null);
        setSelectedInterview(null);
    }, [selectedInterview]);

    const handleSaveEvaluation = useCallback((data: { feedback: string; rating: number; evaluations: EvaluationDimension[]; result: InterviewResult }) => {
        if (!selectedInterview) return;
        setInterviews((prev) =>
            prev.map((i) =>
                i.id === selectedInterview.id
                    ? { ...i, ...data, status: "completed" as InterviewStatus, updatedAt: new Date().toISOString() }
                    : i
            )
        );
        setModalType(null);
        setSelectedInterview(null);
    }, [selectedInterview]);

    const openModal = useCallback((type: ModalType, interview?: Interview) => {
        setSelectedInterview(interview || null);
        setModalType(type);
    }, []);

    const closeModal = useCallback(() => {
        setModalType(null);
        setSelectedInterview(null);
    }, []);

    /* ========== 闹钟提醒：检查即将开始的面试 ========== */
    const upcomingAlarmInterviews = useMemo(() => {
        const now = new Date();
        return interviews.filter((iv) => {
            if (iv.status !== "scheduled") return false;
            const startTime = new Date(`${iv.date}T${iv.time}`);
            const diffMs = startTime.getTime() - now.getTime();
            return diffMs > 0 && diffMs <= 30 * 60 * 1000; // 30分钟内
        });
    }, [interviews]);

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />

            {/* 面试提醒弹窗 */}
            {showAlarm && upcomingAlarmInterviews.length > 0 && (
                <InterviewAlarm
                    interviews={upcomingAlarmInterviews}
                    onDismiss={() => setShowAlarm(false)}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                <BackButton />

                {/* Hero Header - 与简历分析页面布局一致 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl shadow-2xl shadow-pink-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Calendar className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-pink-500/20 to-pink-500/20 blur-xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-gray-900 via-pink-800 to-rose-800 dark:from-white dark:via-pink-200 dark:to-rose-200 bg-clip-text text-transparent">
                                面试管理
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            安排和管理候选人面试，记录面试反馈
                            <br className="hidden sm:block" />
                            <span className="text-pink-600 dark:text-pink-400 font-medium">跟踪面试进度与结果</span>
                        </motion.p>
                    </div>
                </motion.div>

                {/* 今日日程时间线 */}
                <TodayTimeline interviews={stats.todayInterviews} />

                {/* 统计卡片 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                >
                    <StatCard
                        icon={<CalendarCheck className="w-5 h-5" />}
                        label="今日面试"
                        value={stats.todayInterviews.length}
                        sub="场"
                        color="#ec4899"
                        gradient="linear-gradient(135deg, #fdf2f8, #fce7f3)"
                        trend={{ value: "8%", up: true }}
                    />
                    <StatCard
                        icon={<Users className="w-5 h-5" />}
                        label="总面试数"
                        value={interviews.length}
                        sub="场"
                        color="#8b5cf6"
                        gradient="linear-gradient(135deg, #f5f3ff, #ede9fe)"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="通过率"
                        value={`${stats.passRate}%`}
                        sub={`${stats.passCount}/${stats.completed.length} 人通过`}
                        color="#10b981"
                        gradient="linear-gradient(135deg, #ecfdf5, #d1fae5)"
                    />
                    <StatCard
                        icon={<AlertCircle className="w-5 h-5" />}
                        label="待确认"
                        value={stats.statusCounts.pending}
                        sub="场"
                        color="#f59e0b"
                        gradient="linear-gradient(135deg, #fffbeb, #fef3c7)"
                    />
                </motion.div>

                {/* 快速操作面板 */}
                <QuickActions onAdd={() => openModal("add")} onExport={() => {
                    const data = filteredInterviews.map(i => ({
                        姓名: i.candidateName,
                        职位: i.position,
                        部门: i.department,
                        日期: i.date,
                        时间: `${i.time}-${i.endTime}`,
                        面试官: i.interviewer,
                        类型: getTypeText(i.type),
                        状态: getStatusText(i.status),
                        结果: getResultText(i.result),
                        优先级: getPriorityConfig(i.priority).label,
                    }));
                    const csv = [Object.keys(data[0] || {}).join(",")].concat(data.map(r => Object.values(r).join(","))).join("\n");
                    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `面试数据_${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                }} />

                {/* 智能面板 - 排期建议 + 最近动态 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
                >
                    <SmartSuggestion interviews={interviews} />
                    <RecentActivity 
                        interviews={interviews} 
                        onViewInterview={(id) => {
                            const iv = interviews.find((i) => i.id === id);
                            if (iv) openModal("detail", iv);
                        }}
                    />
                </motion.div>

                {/* 年度面试热力图（列表视图可见） */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <YearlyHeatmap 
                        interviews={interviews} 
                        onDateSelect={(date) => {
                            const [y, m, d] = date.split("-").map(Number);
                            setSelectedDate(new Date(y, m - 1, d));
                            setViewMode("calendar");
                        }} 
                    />
                </motion.div>

                {/* 排行榜 + 数据洞察 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
                >
                    <InterviewerRanking interviews={interviews} />
                    <DataInsights interviews={interviews} />
                </motion.div>

                {/* 视图切换与工具栏 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                            {([
                                { key: "list", label: "列表", icon: <ClipboardList className="w-4 h-4" /> },
                                { key: "calendar", label: "日历", icon: <Calendar className="w-4 h-4" /> },
                                { key: "stats", label: "统计", icon: <BarChart3 className="w-4 h-4" /> },
                            ] as const).map((v) => (
                                <button
                                    key={v.key}
                                    onClick={() => { setViewMode(v.key); setSelectedIds(new Set()); }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === v.key
                                            ? "bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                        }`}
                                >
                                    {v.icon}
                                    {v.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 flex-1 md:flex-initial">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索候选人、职位、面试官..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            >
                                <option value="all">全部状态</option>
                                <option value="scheduled">已安排</option>
                                <option value="completed">已完成</option>
                                <option value="pending">待确认</option>
                                <option value="cancelled">已取消</option>
                            </select>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            >
                                <option value="all">全部方式</option>
                                <option value="video">视频面试</option>
                                <option value="onsite">现场面试</option>
                                <option value="phone">电话面试</option>
                            </select>
                            <button
                                onClick={() => {
                                    // 导出功能
                                    const data = filteredInterviews.map(i => ({
                                        姓名: i.candidateName,
                                        职位: i.position,
                                        部门: i.department,
                                        日期: i.date,
                                        时间: `${i.time}-${i.endTime}`,
                                        面试官: i.interviewer,
                                        类型: getTypeText(i.type),
                                        状态: getStatusText(i.status),
                                        结果: getResultText(i.result),
                                    }));
                                    const csv = [Object.keys(data[0] || {}).join(",")].concat(data.map(r => Object.values(r).join(","))).join("\n");
                                    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `面试数据_${new Date().toISOString().split("T")[0]}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                                title="导出数据"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 批量操作栏 */}
                    {selectedIds.size > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex items-center justify-between px-4 py-3 bg-pink-50 dark:bg-pink-900/20 border-t border-pink-100 dark:border-pink-800"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-pink-700 dark:text-pink-400">
                                    已选择 {selectedIds.size} 项
                                </span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-pink-600 dark:text-pink-400 hover:underline"
                                >
                                    {selectedIds.size === filteredInterviews.length ? "取消全选" : "全选"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setBatchMenuOpen(!batchMenuOpen)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all flex items-center gap-1.5"
                                    >
                                        批量操作
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {batchMenuOpen && (
                                        <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                                            <button onClick={() => handleBatchStatusChange("completed")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" /> 标记为已完成
                                            </button>
                                            <button onClick={() => handleBatchStatusChange("cancelled")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-500" /> 批量取消
                                            </button>
                                            <button onClick={() => handleBatchStatusChange("pending")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4 text-amber-500" /> 重置为待确认
                                            </button>
                                            <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                            <button onClick={handleBatchDelete} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <Trash2 className="w-4 h-4" /> 批量删除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* ===== 列表视图 ===== */}
                {viewMode === "list" && (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredInterviews.map((interview) => (
                                <InterviewCard
                                    key={interview.id}
                                    interview={interview}
                                    selected={selectedIds.has(interview.id)}
                                    onSelect={handleSelect}
                                    onView={() => openModal("detail", interview)}
                                    onEdit={() => openModal("edit", interview)}
                                    onEvaluate={() => openModal("evaluate", interview)}
                                />
                            ))}
                        </AnimatePresence>
                        {filteredInterviews.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                            >
                                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无匹配的面试</h3>
                                <p className="text-gray-500 dark:text-gray-400">尝试调整筛选条件或点击"安排面试"创建新的面试</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ===== 日历视图 ===== */}
                {viewMode === "calendar" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                                    </h3>
                                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <ChevronRight className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }, (_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                        const day = i + 1;
                                        const dayInterviews = getInterviewsForDate(day);
                                        const isToday =
                                            new Date().getDate() === day &&
                                            new Date().getMonth() === selectedDate.getMonth() &&
                                            new Date().getFullYear() === selectedDate.getFullYear();

                                        return (
                                            <button
                                                key={day}
                                                className={`relative p-2 rounded-lg text-center transition-colors ${isToday
                                                        ? "bg-indigo-600 text-white shadow-md"
                                                        : dayInterviews.length > 0
                                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                                                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{day}</span>
                                                {dayInterviews.length > 0 && (
                                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                                                        {dayInterviews.slice(0, 3).map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-indigo-400"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        面试统计
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">今日面试</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{stats.todayInterviews.length} 场</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">本月面试</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{interviews.length} 场</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">待确认</span>
                                            <span className="font-medium text-amber-600 dark:text-amber-400">{stats.statusCounts.pending} 场</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 面试安排
                            </h3>
                            <div className="space-y-3">
                                {getInterviewsForDate(selectedDate.getDate()).map((interview) => (
                                    <InterviewCard
                                        key={interview.id}
                                        interview={interview}
                                        selected={selectedIds.has(interview.id)}
                                        onSelect={handleSelect}
                                        onView={() => openModal("detail", interview)}
                                        onEdit={() => openModal("edit", interview)}
                                        onEvaluate={() => openModal("evaluate", interview)}
                                    />
                                ))}
                                {getInterviewsForDate(selectedDate.getDate()).length === 0 && (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">当日暂无面试安排</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 面试类型通过率对比 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">面试方式通过率</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">各面试方式效果对比</p>
                                    </div>
                                    <Video className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    {(["video", "onsite", "phone"] as InterviewType[]).map((type) => {
                                        const typeInterviews = interviews.filter((i) => i.type === type && i.status === "completed");
                                        const typePass = typeInterviews.filter((i) => i.result === "pass").length;
                                        const typeRate = typeInterviews.length > 0 ? Math.round((typePass / typeInterviews.length) * 100) : 0;
                                        return (
                                            <div key={type}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-pink-400">{getTypeIcon(type)}</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{getTypeText(type)}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {typeRate}% ({typePass}/{typeInterviews.length})
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${typeRate}%` }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">反馈情感分布</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">面试反馈情感分析</p>
                                    </div>
                                    <Smile className="w-5 h-5 text-emerald-500" />
                                </div>
                                {(() => {
                                    const withFeedback = interviews.filter((i) => i.feedbackSentiment);
                                    const positive = withFeedback.filter((i) => i.feedbackSentiment === "positive").length;
                                    const neutral = withFeedback.filter((i) => i.feedbackSentiment === "neutral").length;
                                    const negative = withFeedback.filter((i) => i.feedbackSentiment === "negative").length;
                                    const total = withFeedback.length || 1;
                                    const sentiments = [
                                        { emoticon: "😊", label: "积极", count: positive, color: "from-emerald-400 to-green-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", textColor: "text-emerald-600 dark:text-emerald-400" },
                                        { emoticon: "😐", label: "中性", count: neutral, color: "from-amber-400 to-yellow-500", bgColor: "bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-600 dark:text-amber-400" },
                                        { emoticon: "😟", label: "消极", count: negative, color: "from-red-400 to-rose-500", bgColor: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-600 dark:text-red-400" },
                                    ];
                                    return (
                                        <div className="space-y-3">
                                            {sentiments.map((s, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className={`${s.bgColor} rounded-xl p-3`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{s.emoticon}</span>
                                                            <span className={`text-sm font-medium ${s.textColor}`}>{s.label}</span>
                                                        </div>
                                                        <span className={`text-sm font-bold ${s.textColor}`}>{s.count}</span>
                                                    </div>
                                                    <div className="h-2 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.round((s.count / total) * 100)}%` }}
                                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== 统计视图 ===== */}
                {viewMode === "stats" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* 图表行 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 近7天面试趋势 */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">近7天面试趋势</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">各状态面试数量变化</p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                </div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="scheduledGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "1px solid #e5e7eb",
                                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                        <Area type="monotone" dataKey="已完成" stroke="#10b981" fill="url(#completedGrad)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="已安排" stroke="#3b82f6" fill="url(#scheduledGrad)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="待确认" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 面试状态分布 */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">面试状态分布</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">各状态面试占比</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                strokeWidth={0}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #e5e7eb",
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value: string) => (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 部门分布 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">部门面试分布</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">各部门面试数量</p>
                                    </div>
                                    <Building2 className="w-5 h-5 text-purple-500" />
                                </div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={departmentData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "1px solid #e5e7eb",
                                            }}
                                        />
                                        <Bar dataKey="value" name="面试数" radius={[0, 8, 8, 0]}>
                                            {departmentData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 通过率统计 */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">招聘漏斗</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">面试流程转化</p>
                                    </div>
                                    <Target className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "已安排面试", value: stats.statusCounts.scheduled + stats.statusCounts.completed, total: interviews.length, color: "bg-blue-500" },
                                        { label: "已完成面试", value: stats.statusCounts.completed, total: interviews.length, color: "bg-emerald-500" },
                                        { label: "面试通过", value: stats.passCount, total: interviews.length, color: "bg-purple-500" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {item.value}
                                                    <span className="text-gray-400 font-normal"> / {item.total}</span>
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${item.color}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* 弹窗 */}
            <AnimatePresence>
                {modalType === "detail" && selectedInterview && (
                    <DetailModal
                        interview={selectedInterview}
                        onClose={closeModal}
                        onEdit={() => openModal("edit", selectedInterview)}
                        onEvaluate={() => openModal("evaluate", selectedInterview)}
                    />
                )}
                {modalType === "edit" && (
                    <InterviewFormModal
                        interview={selectedInterview || undefined}
                        onClose={closeModal}
                        onSave={handleSaveInterview}
                    />
                )}
                {modalType === "add" && (
                    <InterviewFormModal
                        onClose={closeModal}
                        onSave={handleSaveInterview}
                    />
                )}
                {modalType === "evaluate" && selectedInterview && (
                    <EvaluationModal
                        interview={selectedInterview}
                        onClose={closeModal}
                        onSave={handleSaveEvaluation}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}