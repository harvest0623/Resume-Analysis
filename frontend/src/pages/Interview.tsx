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

/* ========== 类型定义 ========== */

type InterviewType = "onsite" | "video" | "phone";
type InterviewStatus = "scheduled" | "completed" | "cancelled" | "pending" | "in_progress";
type InterviewResult = "pass" | "fail" | "pending" | null;

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
    feedback?: string;
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
        date: "2024-03-15",
        time: "10:00",
        endTime: "11:00",
        duration: "60分钟",
        type: "video",
        location: "腾讯会议",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 3,
        createdAt: "2024-03-10T08:00:00Z",
        updatedAt: "2024-03-10T08:00:00Z",
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
        date: "2024-03-15",
        time: "14:00",
        endTime: "14:45",
        duration: "45分钟",
        type: "onsite",
        location: "北京总部 3楼会议室A",
        status: "scheduled",
        result: null,
        round: 2,
        totalRounds: 3,
        createdAt: "2024-03-09T10:00:00Z",
        updatedAt: "2024-03-09T10:00:00Z",
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
        date: "2024-03-14",
        time: "11:00",
        endTime: "11:30",
        duration: "30分钟",
        type: "phone",
        location: "电话面试",
        status: "completed",
        result: "pass",
        round: 1,
        totalRounds: 2,
        feedback: "候选人表达清晰，产品思维敏捷，有较强的逻辑能力，对行业趋势有深刻理解。",
        rating: 4,
        evaluations: [
            { name: "技术能力", score: 4, maxScore: 5, icon: <Brain className="w-4 h-4" /> },
            { name: "沟通表达", score: 5, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 4, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 3, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 4, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "建议进入下一轮面试，重点考察项目管理能力。",
        createdAt: "2024-03-08T14:00:00Z",
        updatedAt: "2024-03-14T12:00:00Z",
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
        date: "2024-03-13",
        time: "15:00",
        endTime: "16:00",
        duration: "60分钟",
        type: "video",
        location: "Zoom",
        status: "completed",
        result: "fail",
        round: 2,
        totalRounds: 2,
        feedback: "设计能力出色，作品集质量高，但团队协作经验稍显不足，与团队文化契合度有待提升。",
        rating: 3,
        evaluations: [
            { name: "设计能力", score: 4, maxScore: 5, icon: <Sparkles className="w-4 h-4" /> },
            { name: "沟通表达", score: 3, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 3, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 2, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 3, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "设计能力符合要求，但建议寻找更匹配团队文化的候选人。",
        createdAt: "2024-03-07T09:00:00Z",
        updatedAt: "2024-03-13T17:00:00Z",
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
        date: "2024-03-16",
        time: "09:30",
        endTime: "10:15",
        duration: "45分钟",
        type: "onsite",
        location: "上海分公司 5楼会议室B",
        status: "pending",
        result: null,
        round: 1,
        totalRounds: 2,
        createdAt: "2024-03-12T11:00:00Z",
        updatedAt: "2024-03-12T11:00:00Z",
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
        date: "2024-03-15",
        time: "16:00",
        endTime: "16:45",
        duration: "45分钟",
        type: "video",
        location: "飞书会议",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 2,
        createdAt: "2024-03-11T08:30:00Z",
        updatedAt: "2024-03-11T08:30:00Z",
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
        date: "2024-03-17",
        time: "10:00",
        endTime: "11:00",
        duration: "60分钟",
        type: "onsite",
        location: "北京总部 2楼会议室C",
        status: "scheduled",
        result: null,
        round: 1,
        totalRounds: 3,
        createdAt: "2024-03-12T14:00:00Z",
        updatedAt: "2024-03-12T14:00:00Z",
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
        date: "2024-03-14",
        time: "14:00",
        endTime: "15:00",
        duration: "60分钟",
        type: "phone",
        location: "电话面试",
        status: "completed",
        result: "pass",
        round: 2,
        totalRounds: 2,
        feedback: "测试理论基础扎实，自动化测试经验丰富，沟通能力良好。",
        rating: 5,
        evaluations: [
            { name: "技术能力", score: 5, maxScore: 5, icon: <Brain className="w-4 h-4" /> },
            { name: "沟通表达", score: 4, maxScore: 5, icon: <MessageSquare className="w-4 h-4" /> },
            { name: "逻辑思维", score: 5, maxScore: 5, icon: <Target className="w-4 h-4" /> },
            { name: "团队协作", score: 4, maxScore: 5, icon: <Users className="w-4 h-4" /> },
            { name: "学习能力", score: 5, maxScore: 5, icon: <Zap className="w-4 h-4" /> },
        ],
        notes: "强烈推荐录用，综合素质优秀。",
        createdAt: "2024-03-06T10:00:00Z",
        updatedAt: "2024-03-14T16:00:00Z",
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

/* ========== 子组件 ========== */

// 统计卡片
function StatCard({ icon, label, value, sub, color, trend }: {
    icon: React.ReactNode; label: string; value: string | number;
    sub?: string; color: string; trend?: { value: string; up: boolean };
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color }}>
                    {icon}
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-medium ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
                        <ArrowUpRight className={`w-3 h-3 mr-0.5 ${!trend.up && "rotate-180"}`} />
                        {trend.value}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

// 面试卡片
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`group bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${selected ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-700"
                }`}
            onClick={() => onView()}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <label className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => onSelect(interview.id)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                    </label>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                        {interview.candidateAvatar}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{interview.candidateName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{interview.position} · {interview.department}</p>
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
                            <div className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                                <button onClick={() => { onView(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <Eye className="w-3.5 h-3.5" /> 查看详情
                                </button>
                                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <Edit className="w-3.5 h-3.5" /> 编辑
                                </button>
                                {interview.status === "completed" && (
                                    <button onClick={() => { onEvaluate(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                        <ClipboardList className="w-3.5 h-3.5" /> 评价
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{interview.time} - {interview.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {getTypeIcon(interview.type)}
                    <span>{getTypeText(interview.type)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3.5 h-3.5" />
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
                                {interview.rating && (
                                    <div className="flex items-center gap-1 mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">综合评分:</span>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-4 h-4 ${s <= interview.rating! ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                                        ))}
                                    </div>
                                )}
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            {/* 面试提醒弹窗 */}
            {showAlarm && upcomingAlarmInterviews.length > 0 && (
                <InterviewAlarm
                    interviews={upcomingAlarmInterviews}
                    onDismiss={() => setShowAlarm(false)}
                />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackButton />

                {/* 页面标题 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            面试管理
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            安排和管理候选人面试，跟踪面试进度与结果
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openModal("add")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span>安排面试</span>
                        </button>
                    </div>
                </motion.div>

                {/* 统计卡片 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard
                        icon={<CalendarCheck className="w-5 h-5" />}
                        label="今日面试"
                        value={stats.todayInterviews.length}
                        sub="场"
                        color="#3b82f6"
                        trend={{ value: "8%", up: true }}
                    />
                    <StatCard
                        icon={<Users className="w-5 h-5" />}
                        label="总面试数"
                        value={interviews.length}
                        sub="场"
                        color="#8b5cf6"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="通过率"
                        value={`${stats.passRate}%`}
                        sub={`${stats.passCount}/${stats.completed.length} 人通过`}
                        color="#10b981"
                    />
                    <StatCard
                        icon={<AlertCircle className="w-5 h-5" />}
                        label="待确认"
                        value={stats.statusCounts.pending}
                        sub="场"
                        color="#f59e0b"
                    />
                </motion.div>

                {/* 视图切换与工具栏 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-2">
                            {([
                                { key: "list", label: "列表", icon: <ClipboardList className="w-4 h-4" /> },
                                { key: "calendar", label: "日历", icon: <Calendar className="w-4 h-4" /> },
                                { key: "stats", label: "统计", icon: <BarChart3 className="w-4 h-4" /> },
                            ] as const).map((v) => (
                                <button
                                    key={v.key}
                                    onClick={() => { setViewMode(v.key); setSelectedIds(new Set()); }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === v.key
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="all">全部方式</option>
                                <option value="video">视频面试</option>
                                <option value="onsite">现场面试</option>
                                <option value="phone">电话面试</option>
                            </select>
                        </div>
                    </div>

                    {/* 批量操作栏 */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-800">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                    已选择 {selectedIds.size} 项
                                </span>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    {selectedIds.size === filteredInterviews.length ? "取消全选" : "全选"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setBatchMenuOpen(!batchMenuOpen)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
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
                        </div>
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