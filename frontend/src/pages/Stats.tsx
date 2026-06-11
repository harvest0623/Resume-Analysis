import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    Users,
    TrendingUp,
    Award,
    Briefcase,
    GraduationCap,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Download,
    Share2,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Calendar,
    Clock,
    Eye,
    EyeOff,
    PieChart as PieChartIcon,
    Activity,
    Zap,
    Info,
    BarChart,
    Layers,
    Search,
    SlidersHorizontal,
    TrendingDown,
    Sparkles,
    Crown,
    Frown,
    Hash,
    Grip,
    Heart,
    Upload,
    Filter,
    Trophy,
    Medal,
    Gauge,
    X,
    ArrowUpDown,
    Mail,
    Phone,
    FileText,
    Star,
    Bookmark,
    Command,
    GitCompare,
    Image,
    Maximize2,
    Plus,
    Trash2,
    Palette,
    GripVertical,
    Settings2,
    Sliders,
    BarChartHorizontal,
    LineChart as LineChartIcon,
    AreaChart as AreaChartIcon,
    Radar as RadarIcon,
    CircleDot,
    ScatterChart as ScatterChartIcon,
    TreePine,
} from "lucide-react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
    Treemap,
    ScatterChart,
    Scatter,
} from "recharts";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

// ========== 背景与特效组件（参照 Analyze.tsx，颜色适配首页卡片主题） ==========

const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    rotate: [0, 180, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    rotate: [360, 180, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -80, 0],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-fuchsia-400/20 to-rose-400/20 rounded-full blur-3xl"
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
        delay: Math.random() * 5,
    }));

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-rose-500/10 dark:bg-rose-400/10"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// ========== 常量与工具 ==========

const TIME_RANGES = [
    { label: "近7天", days: 7 },
    { label: "近30天", days: 30 },
    { label: "近90天", days: 90 },
    { label: "全部", days: 0 },
] as const;

const CHART_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
];

const SCORE_THRESHOLDS = { high: 80, medium: 60 };

function getScoreBgClass(score: number): string {
    if (score >= SCORE_THRESHOLDS.high) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700";
    if (score >= SCORE_THRESHOLDS.medium) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700";
    return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isWithinDays(dateStr: string, days: number): boolean {
    if (days === 0) return true;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(dateStr) > cutoff;
}

function downloadCSV(content: string, filename: string) {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========== 子组件 ==========

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: number;
    suffix?: string;
    onClick?: () => void;
    active?: boolean;
}

function StatCard({ title, value, icon: Icon, color, change, suffix, onClick, active }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={onClick ? { scale: 1.02 } : undefined}
            onClick={onClick}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border transition-all cursor-pointer ${
                active
                    ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
            }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                        change > 0 ? "text-emerald-600 dark:text-emerald-400" : change < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                    }`}>
                        {change > 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                        ) : change < 0 ? (
                            <ArrowDownRight className="w-4 h-4" />
                        ) : (
                            <Minus className="w-4 h-4" />
                        )}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {value}{suffix}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </motion.div>
    );
}

interface SkillBarProps {
    skill: string;
    count: number;
    maxCount: number;
    onClick?: () => void;
}

function SkillBar({ skill, count, maxCount, onClick }: SkillBarProps) {
    const percentage = (count / maxCount) * 100;
    return (
        <motion.div
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={onClick}
            whileHover={{ x: 4 }}
        >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{skill}</span>
            <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right group-hover:font-semibold transition-all">{count}</span>
        </motion.div>
    );
}

// 时间范围选择器
function TimeRangeSelector({ value, onChange }: { value: number; onChange: (days: number) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const current = TIME_RANGES.find((r) => r.days === value) || TIME_RANGES[3];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{current.label}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                        {TIME_RANGES.map((range) => (
                            <button
                                key={range.days}
                                onClick={() => { onChange(range.days); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                    value === range.days
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 font-medium"
                                        : "text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 面包屑钻取导航
function DrilldownBreadcrumb({ path, onBack }: { path: string[]; onBack: (index: number) => void }) {
    return (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {path.map((item, i) => (
                <span key={i} className="flex items-center space-x-2">
                    {i > 0 && <ChevronRight className="w-3 h-3" />}
                    <button
                        onClick={() => onBack(i)}
                        className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                            i === path.length - 1 ? "text-gray-900 dark:text-white font-medium" : ""
                        }`}
                    >
                        {item}
                    </button>
                </span>
            ))}
        </div>
    );
}

// 自定义 Tooltip
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    {entry.name}: <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

// 异常预警卡片
function AlertCard({ alerts }: { alerts: { type: "warning" | "info" | "success"; message: string }[] }) {
    if (alerts.length === 0) return null;

    const iconMap = {
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    };
    const bgMap = {
        warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-2"
        >
            {alerts.map((alert, i) => (
                <div key={i} className={`flex items-start space-x-3 px-4 py-3 rounded-xl border ${bgMap[alert.type]}`}>
                    <div className="mt-0.5 shrink-0">{iconMap[alert.type]}</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                </div>
            ))}
        </motion.div>
    );
}

// 统计面板头部
function PanelHeader({ title, icon: Icon, iconColor, children }: {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// ========== 面板：趋势分析（折线图+面积图） ==========
function TrendPanel({ resumes }: { resumes: ResumeData[] }) {
    const [chartType, setChartType] = useState<"line" | "area">("area");

    const trendData = useMemo(() => {
        const sorted = [...resumes].sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        const grouped: Record<string, { scores: number[]; count: number }> = {};

        sorted.forEach((r) => {
            const key = formatDate(r.uploadedAt);
            if (!grouped[key]) grouped[key] = { scores: [], count: 0 };
            grouped[key].scores.push(r.scores.overall);
            grouped[key].count++;
        });

        return Object.entries(grouped).map(([date, data]) => ({
            date,
            avgScore: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
            maxScore: Math.max(...data.scores),
            minScore: Math.min(...data.scores),
            count: data.count,
        }));
    }, [resumes]);

    if (trendData.length < 2) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <PanelHeader title="趋势分析" icon={Activity} iconColor="from-cyan-500 to-blue-600" />
                <div className="text-center py-12 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">需要至少2个不同日期的数据才能展示趋势</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="趋势分析" icon={Activity} iconColor="from-cyan-500 to-blue-600">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    <button
                        onClick={() => setChartType("area")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            chartType === "area" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        面积图
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            chartType === "line" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        折线图
                    </button>
                </div>
            </PanelHeader>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "area" ? (
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="maxScore" name="最高分" stroke="#10b981" fill="url(#colorMax)" strokeWidth={2} />
                            <Area type="monotone" dataKey="avgScore" name="平均分" stroke="#3b82f6" fill="url(#colorAvg)" strokeWidth={2.5} />
                            <Area type="monotone" dataKey="minScore" name="最低分" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                        </AreaChart>
                    ) : (
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="avgScore" name="平均分" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="maxScore" name="最高分" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="minScore" name="最低分" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// ========== 面板：评分分布（柱状图+饼图） ==========
function ScoreDistributionPanel({ resumes }: { resumes: ResumeData[] }) {
    const [view, setView] = useState<"bar" | "pie">("bar");
    const [drillRange, setDrillRange] = useState<string | null>(null);

    const distributionData = useMemo(() => {
        const ranges = [
            { name: "90-100", min: 90, max: 100, color: "#10b981" },
            { name: "80-89", min: 80, max: 89, color: "#34d399" },
            { name: "70-79", min: 70, max: 79, color: "#3b82f6" },
            { name: "60-69", min: 60, max: 69, color: "#f59e0b" },
            { name: "50-59", min: 50, max: 59, color: "#f97316" },
            { name: "0-49", min: 0, max: 49, color: "#ef4444" },
        ];

        return ranges.map((range) => ({
            name: range.name,
            count: resumes.filter((r) => r.scores.overall >= range.min && r.scores.overall <= range.max).length,
            color: range.color,
        }));
    }, [resumes]);

    const drillData = useMemo(() => {
        if (!drillRange) return null;
        const [min, max] = drillRange.split("-").map(Number);
        return resumes
            .filter((r) => r.scores.overall >= min && r.scores.overall <= max)
            .sort((a, b) => b.scores.overall - a.scores.overall);
    }, [drillRange, resumes]);

    const handleBarClick = (data: any) => {
        if (data?.name) setDrillRange(data.name);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="评分分布" icon={BarChart} iconColor="from-blue-500 to-indigo-600">
                <div className="flex items-center space-x-2">
                    {drillRange && (
                        <DrilldownBreadcrumb
                            path={["评分分布", drillRange]}
                            onBack={(i) => { if (i === 0) setDrillRange(null); }}
                        />
                    )}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 ml-4">
                        <button
                            onClick={() => setView("bar")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                view === "bar" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5 inline mr-1" />柱状
                        </button>
                        <button
                            onClick={() => setView("pie")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                view === "pie" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            <PieChartIcon className="w-3.5 h-3.5 inline mr-1" />饼图
                        </button>
                    </div>
                </div>
            </PanelHeader>

            <AnimatePresence mode="wait">
                {drillRange && drillData ? (
                    <motion.div
                        key="drilldown"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                            共 {drillData.length} 份简历，评分区间 {drillRange}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {drillData.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {r.basicInfo.name?.[0] || "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.basicInfo.name || r.filename}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.jobInfo.position || "未指定岗位"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 shrink-0 ml-3">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getScoreBgClass(r.scores.overall)}`}>
                                            {r.scores.overall}分
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(r.uploadedAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {view === "bar" ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={distributionData} onClick={handleBarClick} className="cursor-pointer">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                                        <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="简历数" radius={[6, 6, 0, 0]} cursor="pointer">
                                            {distributionData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData.filter((d) => d.count > 0)}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={50}
                                            paddingAngle={3}
                                            onClick={(_, index) => {
                                                const filtered = distributionData.filter((d) => d.count > 0);
                                                if (filtered[index]) handleBarClick(filtered[index]);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {distributionData.filter((d) => d.count > 0).map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                            点击图表可下钻查看该分数段的简历详情
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ========== 面板：技能雷达图 ==========
function SkillRadarPanel({ resumes }: { resumes: ResumeData[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categoryData = useMemo(() => {
        const categories: Record<string, { totalScore: number; count: number; skills: Set<string> }> = {};

        resumes.forEach((r) => {
            r.skills.forEach((skill) => {
                const category = categorizeSkill(skill);
                if (!categories[category]) categories[category] = { totalScore: 0, count: 0, skills: new Set() };
                categories[category].totalScore += r.scores.skills;
                categories[category].count++;
                categories[category].skills.add(skill);
            });
        });

        return Object.entries(categories).map(([name, data]) => ({
            subject: name,
            score: Math.round(data.totalScore / data.count),
            count: data.count,
            skills: Array.from(data.skills),
            fullMark: 100,
        }));
    }, [resumes]);

    const topSkillData = useMemo(() => {
        const skillScores: Record<string, { total: number; count: number }> = {};
        resumes.forEach((r) => {
            r.skills.forEach((skill) => {
                if (!skillScores[skill]) skillScores[skill] = { total: 0, count: 0 };
                skillScores[skill].total += r.scores.skills;
                skillScores[skill].count++;
            });
        });

        return Object.entries(skillScores)
            .map(([skill, data]) => ({
                subject: skill,
                score: Math.round(data.total / data.count),
                count: data.count,
                fullMark: 100,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
    }, [resumes]);

    if (categoryData.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="技能能力雷达" icon={Zap} iconColor="from-violet-500 to-purple-600">
                {selectedCategory && (
                    <DrilldownBreadcrumb
                        path={["技能类别", selectedCategory]}
                        onBack={(i) => { if (i === 0) setSelectedCategory(null); }}
                    />
                )}
            </PanelHeader>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-72">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">按技能类别</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                            <PolarGrid stroke="#e5e7eb" className="dark:opacity-30" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 11 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="技能评分"
                                dataKey="score"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="#8b5cf6"
                                fillOpacity={0.25}
                                onClick={(data: any) => {
                                    if (data?.subject) setSelectedCategory(data.subject);
                                }}
                                className="cursor-pointer"
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="h-72">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">热门技能 TOP 8</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topSkillData}>
                            <PolarGrid stroke="#e5e7eb" className="dark:opacity-30" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 10 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="技能评分"
                                dataKey="score"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="#3b82f6"
                                fillOpacity={0.25}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <AnimatePresence>
                {selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700"
                    >
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            {selectedCategory} - 相关技能
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categoryData
                                .find((c) => c.subject === selectedCategory)
                                ?.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-200 dark:border-violet-800"
                                    >
                                        {skill}
                                    </span>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function categorizeSkill(skill: string): string {
    const s = skill.toLowerCase();
    if (["react", "vue", "angular", "html", "css", "javascript", "typescript", "tailwind", "webpack", "vite", "next", "nuxt", "sass", "less"].some((k) => s.includes(k))) return "前端";
    if (["java", "python", "go", "node", "spring", "django", "flask", "fastapi", "express", "sql", "mysql", "postgres", "redis", "mongodb"].some((k) => s.includes(k))) return "后端";
    if (["docker", "kubernetes", "aws", "azure", "linux", "ci/cd", "jenkins", "terraform", "nginx"].some((k) => s.includes(k))) return "运维";
    if (["machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "data", "ai", "nlp", "cv"].some((k) => s.includes(k))) return "AI/数据";
    if (["swift", "kotlin", "flutter", "react native", "ios", "android"].some((k) => s.includes(k))) return "移动端";
    if (["figma", "sketch", "photoshop", "ui", "ux", "design"].some((k) => s.includes(k))) return "设计";
    return "其他";
}

// ========== 面板：多维度对比（分组柱状图） ==========
function DimensionComparePanel({ resumes }: { resumes: ResumeData[] }) {
    const compareData = useMemo(() => {
        const buckets = [
            { name: "技能", key: "skills" as const },
            { name: "经验", key: "experience" as const },
            { name: "学历", key: "education" as const },
        ];

        return buckets.map((b) => {
            const scores = resumes.map((r) => r.scores[b.key]);
            return {
                dimension: b.name,
                平均分: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
                最高分: Math.max(...scores),
                最低分: Math.min(...scores),
            };
        });
    }, [resumes]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="多维度对比" icon={Layers} iconColor="from-orange-500 to-red-600" />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={compareData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                        <XAxis dataKey="dimension" tick={{ fontSize: 13, fill: "#6b7280" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="平均分" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="最高分" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="最低分" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// ========== 面板：时间线 Treemap ==========
function SkillTreemapPanel({ resumes }: { resumes: ResumeData[] }) {
    const panelRef = useRef<HTMLDivElement>(null);
    const treeData = useMemo(() => {
        const counts: Record<string, number> = {};
        resumes.forEach((r) => {
            r.skills.forEach((s) => {
                counts[s] = (counts[s] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([name, size]) => ({ name, size }));
    }, [resumes]);

    if (treeData.length === 0) return null;

    const CustomContent = (props: any) => {
        const { x, y, width, height, name, size, index } = props;
        if (width < 30 || height < 20) return null;
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={6}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={0.85}
                />
                {width > 50 && height > 30 && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 6}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={Math.min(14, width / 6)}
                            fontWeight="600"
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 12}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.8)"
                            fontSize={Math.min(12, width / 8)}
                        >
                            {size}次
                        </text>
                    </>
                )}
            </g>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="技能词云分布" icon={Target} iconColor="from-pink-500 to-rose-600">
                <MemoizedChartExportButton targetRef={panelRef} fileName="技能词云" />
            </PanelHeader>
            <div ref={panelRef} className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treeData}
                        dataKey="size"
                        nameKey="name"
                        content={<CustomContent />}
                    />
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// ========== 面板：各维度评分对比（分组柱状图） ==========
function SkillBarPanel({ stats, maxSkillCount }: {
    stats: { topSkills: { skill: string; count: number }[] };
    maxSkillCount: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="热门技能 TOP 8" icon={Award} iconColor="from-emerald-500 to-teal-600" />
            <div className="space-y-4">
                {stats.topSkills.map((item) => (
                    <SkillBar
                        key={item.skill}
                        skill={item.skill}
                        count={item.count}
                        maxCount={maxSkillCount}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ========== 面板：学历/岗位分布 ==========
function DistributionPanel({
    title,
    icon: Icon,
    iconColor,
    distribution,
    total,
    maxItems,
}: {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    distribution: Record<string, number>;
    total: number;
    maxItems?: number;
}) {
    const entries = useMemo(() => {
        const sorted = Object.entries(distribution).sort(([, a], [, b]) => b - a);
        return maxItems ? sorted.slice(0, maxItems) : sorted;
    }, [distribution, maxItems]);

    if (entries.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title={title} icon={Icon} iconColor={iconColor} />
            <div className="space-y-4">
                {entries.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{name}</span>
                        <div className="flex items-center space-x-3 flex-1 ml-4">
                            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / total) * 100}%` }}
                                    transition={{ duration: 0.8 }}
                                    className={`h-full bg-gradient-to-r ${iconColor} rounded-full`}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-10 text-right">{count}</span>
                            <span className="text-xs text-gray-400 w-10 text-right">
                                {((count / total) * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// ========== 多维筛选器 ==========
interface FilterState {
    education: string;
    position: string;
    scoreRange: [number, number];
    skillKeyword: string;
}

function MultiFilter({ filters, onChange, resumes }: {
    filters: FilterState;
    onChange: (f: FilterState) => void;
    resumes: ResumeData[];
}) {
    const [expanded, setExpanded] = useState(false);

    const educationOptions = useMemo(() => {
        const set = new Set(resumes.map((r) => r.background.education || "未知"));
        return ["全部", ...Array.from(set).sort()];
    }, [resumes]);

    const positionOptions = useMemo(() => {
        const set = new Set(resumes.map((r) => r.jobInfo.position || "未知"));
        return ["全部", ...Array.from(set).sort()];
    }, [resumes]);

    const activeCount = [
        filters.education !== "全部" ? 1 : 0,
        filters.position !== "全部" ? 1 : 0,
        filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100 ? 1 : 0,
        filters.skillKeyword ? 1 : 0,
    ].reduce((s, v) => s + v, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="flex items-center space-x-3 flex-wrap">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        activeCount > 0
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>高级筛选</span>
                    {activeCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">{activeCount}</span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {activeCount > 0 && (
                    <button
                        onClick={() => onChange({ education: "全部", position: "全部", scoreRange: [0, 100], skillKeyword: "" })}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                        清除筛选
                    </button>
                )}
            </div>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* 学历筛选 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">学历要求</label>
                                    <select
                                        value={filters.education}
                                        onChange={(e) => onChange({ ...filters, education: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        {educationOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* 岗位筛选 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">目标岗位</label>
                                    <select
                                        value={filters.position}
                                        onChange={(e) => onChange({ ...filters, position: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        {positionOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* 分数范围 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                        评分范围: {filters.scoreRange[0]} - {filters.scoreRange[1]}
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={filters.scoreRange[0]}
                                            onChange={(e) => onChange({ ...filters, scoreRange: [Number(e.target.value), filters.scoreRange[1]] })}
                                            className="flex-1 accent-blue-600"
                                        />
                                        <span className="text-xs text-gray-400">-</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={filters.scoreRange[1]}
                                            onChange={(e) => onChange({ ...filters, scoreRange: [filters.scoreRange[0], Number(e.target.value)] })}
                                            className="flex-1 accent-blue-600"
                                        />
                                    </div>
                                </div>
                                {/* 技能关键词 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">技能关键词</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={filters.skillKeyword}
                                            onChange={(e) => onChange({ ...filters, skillKeyword: e.target.value })}
                                            placeholder="如: React, Python"
                                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ========== 面板：百分位数统计 ==========
function PercentilePanel({ resumes }: { resumes: ResumeData[] }) {
    const percentiles = useMemo(() => {
        const scores = resumes.map((r) => r.scores.overall).sort((a, b) => a - b);
        const getPercentile = (p: number) => {
            const idx = Math.ceil((p / 100) * scores.length) - 1;
            return scores[Math.max(0, idx)] || 0;
        };
        return [
            { label: "P10", value: getPercentile(10), desc: "底部10%", color: "text-red-500" },
            { label: "P25", value: getPercentile(25), desc: "下四分位", color: "text-orange-500" },
            { label: "P50", value: getPercentile(50), desc: "中位数", color: "text-blue-500" },
            { label: "P75", value: getPercentile(75), desc: "上四分位", color: "text-emerald-500" },
            { label: "P90", value: getPercentile(90), desc: "顶部10%", color: "text-violet-500" },
            { label: "P95", value: getPercentile(95), desc: "顶部5%", color: "text-pink-500" },
        ];
    }, [resumes]);

    const boxData = useMemo(() => {
        const scores = resumes.map((r) => r.scores.overall).sort((a, b) => a - b);
        const getPercentile = (p: number) => {
            const idx = Math.ceil((p / 100) * scores.length) - 1;
            return scores[Math.max(0, idx)] || 0;
        };
        const q1 = getPercentile(25);
        const q3 = getPercentile(75);
        const iqr = q3 - q1;
        const whiskerLow = Math.max(scores[0] || 0, q1 - 1.5 * iqr);
        const whiskerHigh = Math.min(scores[scores.length - 1] || 100, q3 + 1.5 * iqr);
        return { min: whiskerLow, q1, median: getPercentile(50), q3, max: whiskerHigh, outliers: scores.filter((s) => s < whiskerLow || s > whiskerHigh) };
    }, [resumes]);

    if (resumes.length < 2) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="百分位数分析" icon={Hash} iconColor="from-teal-500 to-cyan-600" />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                {percentiles.map((p) => (
                    <div key={p.label} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{p.label}</p>
                        <p className={`text-2xl font-bold ${p.color}`}>{p.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                    </div>
                ))}
            </div>
            {/* 箱线图可视化 */}
            <div className="relative h-16 flex items-center px-4">
                <div className="w-full relative">
                    {/* 须线 */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-600 rounded-full" style={{ left: `${boxData.min}%`, width: `${boxData.max - boxData.min}%` }} />
                    {/* 箱体 */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-8 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg" style={{ left: `${boxData.q1}%`, width: `${boxData.q3 - boxData.q1}%` }} />
                    {/* 中位数线 */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-10 w-1 bg-blue-600 dark:bg-blue-400 rounded-full" style={{ left: `${boxData.median}%` }} />
                    {/* 须端 */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-gray-400 rounded-full" style={{ left: `${boxData.min}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-gray-400 rounded-full" style={{ left: `${boxData.max}%` }} />
                    {/* 离群点 */}
                    {boxData.outliers.map((o, i) => (
                        <div key={i} className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-400 rounded-full" style={{ left: `${o}%` }} />
                    ))}
                </div>
                <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-gray-400">
                    <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
            </div>
            {boxData.outliers.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                    发现 {boxData.outliers.length} 个离群值（IQR方法）
                </p>
            )}
        </motion.div>
    );
}

// ========== 面板：技能组合分析 ==========
function SkillCombinationPanel({ resumes }: { resumes: ResumeData[] }) {
    const [showAll, setShowAll] = useState(false);

    const combinations = useMemo(() => {
        const pairCounts: Record<string, { skills: string[]; count: number }> = {};
        resumes.forEach((r) => {
            const skills = r.skills;
            for (let i = 0; i < skills.length; i++) {
                for (let j = i + 1; j < skills.length; j++) {
                    const key = [skills[i], skills[j]].sort().join(" + ");
                    if (!pairCounts[key]) pairCounts[key] = { skills: [skills[i], skills[j]].sort(), count: 0 };
                    pairCounts[key].count++;
                }
            }
        });
        return Object.values(pairCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, showAll ? 15 : 6);
    }, [resumes, showAll]);

    if (combinations.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="技能组合分析" icon={Grip} iconColor="from-fuchsia-500 to-pink-600">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {showAll ? "收起" : "查看全部"}
                </button>
            </PanelHeader>
            <div className="space-y-3">
                {combinations.map((combo, i) => (
                    <motion.div
                        key={combo.skills.join("+")}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                            <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">{combo.skills[0]}</span>
                            <span className="text-gray-400 text-xs">+</span>
                            <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg">{combo.skills[1]}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full"
                                    style={{ width: `${(combo.count / (combinations[0]?.count || 1)) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-8 text-right">{combo.count}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ========== 面板：评分相关性散点图 ==========
function ScoreCorrelationPanel({ resumes }: { resumes: ResumeData[] }) {
    const [xKey, setXKey] = useState<"skills" | "experience" | "education">("skills");
    const [yKey, setYKey] = useState<"skills" | "experience" | "education">("experience");

    const axisOptions = [
        { key: "skills" as const, label: "技能评分" },
        { key: "experience" as const, label: "经验评分" },
        { key: "education" as const, label: "学历评分" },
    ];

    const scatterData = useMemo(() => {
        return resumes.map((r) => ({
            x: r.scores[xKey],
            y: r.scores[yKey],
            name: r.basicInfo.name || r.filename,
            overall: r.scores.overall,
        }));
    }, [resumes, xKey, yKey]);

    const correlation = useMemo(() => {
        if (scatterData.length < 3) return 0;
        const xs = scatterData.map((d) => d.x);
        const ys = scatterData.map((d) => d.y);
        const n = xs.length;
        const sumX = xs.reduce((s, v) => s + v, 0);
        const sumY = ys.reduce((s, v) => s + v, 0);
        const sumXY = xs.reduce((s, v, i) => s + v * ys[i], 0);
        const sumX2 = xs.reduce((s, v) => s + v * v, 0);
        const sumY2 = ys.reduce((s, v) => s + v * v, 0);
        const num = n * sumXY - sumX * sumY;
        const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
    }, [scatterData]);

    const correlationLabel = Math.abs(correlation) > 0.7 ? "强相关" : Math.abs(correlation) > 0.4 ? "中等相关" : "弱相关";
    const correlationColor = correlation > 0.4 ? "text-emerald-600 dark:text-emerald-400" : correlation < -0.4 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="评分相关性分析" icon={Activity} iconColor="from-emerald-500 to-teal-600">
                <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${correlationColor}`}>
                        r = {correlation} ({correlationLabel})
                    </span>
                </div>
            </PanelHeader>
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">X轴:</label>
                    <select
                        value={xKey}
                        onChange={(e) => setXKey(e.target.value as any)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 outline-none"
                    >
                        {axisOptions.map((o) => (
                            <option key={o.key} value={o.key} disabled={o.key === yKey}>{o.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Y轴:</label>
                    <select
                        value={yKey}
                        onChange={(e) => setYKey(e.target.value as any)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 outline-none"
                    >
                        {axisOptions.map((o) => (
                            <option key={o.key} value={o.key} disabled={o.key === xKey}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                        <XAxis dataKey="x" name={axisOptions.find((o) => o.key === xKey)?.label} tick={{ fontSize: 12, fill: "#9ca3af" }} domain={[0, 100]} />
                        <YAxis dataKey="y" name={axisOptions.find((o) => o.key === yKey)?.label} tick={{ fontSize: 12, fill: "#9ca3af" }} domain={[0, 100]} />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ payload }) => {
                                if (!payload?.length) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{axisOptions.find((o) => o.key === xKey)?.label}: {d.x}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{axisOptions.find((o) => o.key === yKey)?.label}: {d.y}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">综合: {d.overall}</p>
                                    </div>
                                );
                            }}
                        />
                        <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.6}>
                            {scatterData.map((entry, index) => (
                                <Cell key={index} fill={getScoreColor(entry.overall)} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                每个点代表一份简历，颜色表示综合评分
            </p>
        </motion.div>
    );
}

function getScoreColor(score: number): string {
    if (score >= SCORE_THRESHOLDS.high) return "#10b981";
    if (score >= SCORE_THRESHOLDS.medium) return "#f59e0b";
    return "#ef4444";
}

// ========== 面板：数据洞察摘要 ==========
function InsightsPanel({ resumes, stats }: {
    resumes: ResumeData[];
    stats: {
        avgScore: number;
        medianScore: number;
        scoreStdDev: number;
        scoreDistribution: { high: number; medium: number; low: number };
        topSkills: { skill: string; count: number }[];
        educationDistribution: Record<string, number>;
        positionDistribution: Record<string, number>;
    };
}) {
    const insights = useMemo(() => {
        if (resumes.length === 0) return [];
        const result: { icon: React.ElementType; iconColor: string; title: string; content: string }[] = [];

        // 质量评估
        const highRate = stats.scoreDistribution.high / resumes.length;
        if (highRate > 0.6) {
            result.push({ icon: Crown, iconColor: "text-emerald-500", title: "整体质量优秀", content: `${(highRate * 100).toFixed(0)}% 的简历评分达到优秀水平，候选人池质量较高。` });
        } else if (highRate < 0.2) {
            result.push({ icon: Frown, iconColor: "text-red-500", title: "整体质量待提升", content: `仅 ${(highRate * 100).toFixed(0)}% 的简历达到优秀标准，建议扩大候选人来源或优化筛选标准。` });
        }

        // 技能洞察
        if (stats.topSkills.length > 0) {
            const topSkill = stats.topSkills[0];
            const rate = Math.round((topSkill.count / resumes.length) * 100);
            result.push({ icon: Zap, iconColor: "text-amber-500", title: "核心技能趋势", content: `${topSkill.skill} 出现频率最高（${rate}%），是当前候选人池的核心技能。` });
        }

        // 学历洞察
        const eduEntries = Object.entries(stats.educationDistribution).sort(([, a], [, b]) => b - a);
        if (eduEntries.length > 0) {
            const [topEdu, topEduCount] = eduEntries[0];
            const eduRate = Math.round((topEduCount / resumes.length) * 100);
            result.push({ icon: GraduationCap, iconColor: "text-indigo-500", title: "学历结构", content: `${topEdu} 占比最高（${eduRate}%），${eduEntries.length > 1 ? `其次为 ${eduEntries[1][0]}` : "学历分布较为集中"}。` });
        }

        // 分布均衡性
        const dist = stats.scoreDistribution;
        const total = dist.high + dist.medium + dist.low;
        if (total > 0) {
            const entropy = -((dist.high / total) * Math.log2(dist.high / total || 1) + (dist.medium / total) * Math.log2(dist.medium / total || 1) + (dist.low / total) * Math.log2(dist.low / total || 1));
            if (entropy < 1.0) {
                result.push({ icon: TrendingDown, iconColor: "text-orange-500", title: "评分集中度高", content: "简历评分分布较为集中，候选人水平差异不大。" });
            }
        }

        return result;
    }, [resumes, stats]);

    if (insights.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50"
        >
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">数据洞察</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
                {insights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl"
                        >
                            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${insight.iconColor}`} />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{insight.content}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ========== 面板：Top/Bottom 排名 ==========
function RankingPanel({ resumes }: { resumes: ResumeData[] }) {
    const [tab, setTab] = useState<"top" | "bottom">("top");

    const sorted = useMemo(() => {
        const s = [...resumes].sort((a, b) => b.scores.overall - a.scores.overall);
        return tab === "top" ? s.slice(0, 5) : s.slice(-5).reverse();
    }, [resumes, tab]);

    if (resumes.length < 2) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="简历排名" icon={Crown} iconColor="from-yellow-500 to-amber-600">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    <button
                        onClick={() => setTab("top")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            tab === "top" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        <TrendingUp className="w-3 h-3 inline mr-1" />Top 5
                    </button>
                    <button
                        onClick={() => setTab("bottom")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            tab === "bottom" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                        <TrendingDown className="w-3 h-3 inline mr-1" />Bottom 5
                    </button>
                </div>
            </PanelHeader>
            <div className="space-y-3">
                {sorted.map((r, i) => {
                    const rank = tab === "top" ? i + 1 : resumes.length - (sorted.length - 1 - i);
                    return (
                        <div key={r.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                                i === 0 && tab === "top" ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" :
                                i === 1 && tab === "top" ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                                i === 2 && tab === "top" ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white" :
                                "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                            }`}>
                                {rank}
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {r.basicInfo.name?.[0] || "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.basicInfo.name || r.filename}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.jobInfo.position || "未指定"} · {r.background.education || "未知"}</p>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${r.scores.overall}%`, backgroundColor: getScoreColor(r.scores.overall) }} />
                                </div>
                                <span className={`text-sm font-bold ${r.scores.overall >= 80 ? "text-emerald-600 dark:text-emerald-400" : r.scores.overall >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                                    {r.scores.overall}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ========== 面板：按学历的评分堆叠分布 ==========
function EducationScorePanel({ resumes }: { resumes: ResumeData[] }) {
    const data = useMemo(() => {
        const buckets: Record<string, { high: number; medium: number; low: number }> = {};
        resumes.forEach((r) => {
            const edu = r.background.education || "未知";
            if (!buckets[edu]) buckets[edu] = { high: 0, medium: 0, low: 0 };
            if (r.scores.overall >= SCORE_THRESHOLDS.high) buckets[edu].high++;
            else if (r.scores.overall >= SCORE_THRESHOLDS.medium) buckets[edu].medium++;
            else buckets[edu].low++;
        });
        return Object.entries(buckets)
            .map(([name, counts]) => ({ name, ...counts, total: counts.high + counts.medium + counts.low }))
            .sort((a, b) => b.total - a.total);
    }, [resumes]);

    if (data.length < 2) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <PanelHeader title="学历 × 评分分布" icon={GraduationCap} iconColor="from-violet-500 to-indigo-600" />
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data} layout="vertical" barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6b7280" }} width={60} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="high" name="优秀" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="medium" name="良好" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="low" name="待提升" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

// ========== 数据健康度计算 ==========
interface HealthFactor {
    name: string;
    score: number;
    weight: string;
    color: string;
    description: string;
}

interface HealthInfo {
    score: number;
    level: string;
    levelColor: string;
    bgGradient: string;
    factors: HealthFactor[];
    suggestions: string[];
}

function computeHealthScore(
    stats: {
        avgScore: number;
        scoreStdDev: number;
        recentCount: number;
        scoreDistribution: { high: number; medium: number; low: number };
    },
    filteredResumes: ResumeData[]
): HealthInfo {
    if (filteredResumes.length === 0) {
        return {
            score: 0,
            level: "无数据",
            levelColor: "gray",
            bgGradient: "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
            factors: [],
            suggestions: ["上传简历后即可获得健康度分析"],
        };
    }

    // 1. 平均分因子 (30%)
    const avgScore = Math.min(100, stats.avgScore);
    const avgFactor = avgScore * 0.3;

    // 2. 高分占比因子 (30%)
    const highRate = filteredResumes.length > 0 ? (stats.scoreDistribution.high / filteredResumes.length) * 100 : 0;
    const highFactor = highRate * 0.3;

    // 3. 样本稳定性因子 (20%) - 标准差越小越稳定
    const stabilityScore = Math.max(0, 100 - stats.scoreStdDev * 3);
    const stabilityFactor = stabilityScore * 0.2;

    // 4. 活跃度因子 (20%) - 近7天占比
    const recentRate = filteredResumes.length > 0 ? Math.min(100, (stats.recentCount / filteredResumes.length) * 100 * 5) : 0;
    const activityFactor = recentRate * 0.2;

    const totalScore = Math.round(avgFactor + highFactor + stabilityFactor + activityFactor);

    let level = "待改善";
    let levelColor = "rose";
    let bgGradient = "from-rose-500 to-pink-600";
    if (totalScore >= 80) {
        level = "优秀";
        levelColor = "emerald";
        bgGradient = "from-emerald-500 to-teal-600";
    } else if (totalScore >= 65) {
        level = "良好";
        levelColor = "blue";
        bgGradient = "from-blue-500 to-indigo-600";
    } else if (totalScore >= 45) {
        level = "一般";
        levelColor = "amber";
        bgGradient = "from-amber-500 to-orange-600";
    }

    const factors: HealthFactor[] = [
        {
            name: "平均分",
            score: Math.round(avgScore),
            weight: "30%",
            color: "rose",
            description: avgScore >= 80 ? "整体水平高" : avgScore >= 60 ? "整体水平中上" : avgScore >= 40 ? "整体水平一般" : "整体水平偏低",
        },
        {
            name: "高分占比",
            score: Math.round(highRate),
            weight: "30%",
            color: "amber",
            description: highRate >= 50 ? "优秀简历丰富" : highRate >= 25 ? "优秀简历适中" : "优秀简历偏少",
        },
        {
            name: "评分稳定性",
            score: Math.round(stabilityScore),
            weight: "20%",
            color: "blue",
            description: stabilityScore >= 80 ? "评分高度一致" : stabilityScore >= 50 ? "评分较一致" : "评分差异较大",
        },
        {
            name: "近期活跃度",
            score: Math.round(recentRate),
            weight: "20%",
            color: "emerald",
            description: recentRate >= 50 ? "简历池更新频繁" : recentRate >= 20 ? "简历池更新正常" : "近期更新缓慢",
        },
    ];

    // 智能建议
    const suggestions: string[] = [];
    if (avgScore < 60) suggestions.push("建议加强候选人筛选标准，提升简历质量");
    if (highRate < 25) suggestions.push("高分简历占比较低，可优化职位匹配度");
    if (stabilityScore < 50) suggestions.push("评分波动较大，建议细化评分规则");
    if (recentRate < 15) suggestions.push("近期更新缓慢，建议持续投入招聘渠道");
    if (suggestions.length === 0) suggestions.push("数据表现优异，保持当前节奏");

    return { score: totalScore, level, levelColor, bgGradient, factors, suggestions };
}

// 健康度圆环仪表盘
function HealthGauge({ score, level, levelColor, bgGradient }: { score: number; level: string; levelColor: string; bgGradient: string }) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={radius} className="stroke-gray-100 dark:stroke-gray-700" strokeWidth="14" fill="none" />
                <motion.circle
                    cx="100"
                    cy="100"
                    r={radius}
                    className={`${score >= 65 ? "stroke-emerald-500" : score >= 45 ? "stroke-amber-500" : "stroke-rose-500"}`}
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className={`text-6xl font-bold bg-gradient-to-br ${bgGradient} bg-clip-text text-transparent`}
                >
                    {score}
                </motion.span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">/ 100</span>
                <span className={`mt-1 px-3 py-0.5 text-xs font-bold rounded-full ${
                    levelColor === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" :
                    levelColor === "blue" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" :
                    levelColor === "amber" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                    "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                }`}>
                    {level}
                </span>
            </div>
        </div>
    );
}

// 健康度面板
function HealthScoreDashboard({
    stats,
    filteredResumes,
}: {
    stats: { avgScore: number; scoreStdDev: number; recentCount: number; scoreDistribution: { high: number; medium: number; low: number } };
    filteredResumes: ResumeData[];
}) {
    const health = useMemo(() => computeHealthScore(stats, filteredResumes), [stats, filteredResumes]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">数据健康度</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">综合评估候选人池质量与活跃度</p>
                    </div>
                </div>
            </div>

            {filteredResumes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">暂无数据，上传简历后查看健康度</div>
            ) : (
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-2 flex justify-center">
                        <HealthGauge score={health.score} level={health.level} levelColor={health.levelColor} bgGradient={health.bgGradient} />
                    </div>
                    <div className="lg:col-span-3 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {health.factors.map((f) => (
                                <div key={f.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.name}</span>
                                            <span className="text-xs text-gray-400 ml-1.5">权重 {f.weight}</span>
                                        </div>
                                        <span className={`text-base font-bold ${
                                            f.color === "rose" ? "text-rose-600 dark:text-rose-400" :
                                            f.color === "amber" ? "text-amber-600 dark:text-amber-400" :
                                            f.color === "blue" ? "text-blue-600 dark:text-blue-400" :
                                            "text-emerald-600 dark:text-emerald-400"
                                        }`}>{f.score}<span className="text-xs text-gray-400 ml-0.5">分</span></span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${f.score}%` }}
                                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                            className={`h-full rounded-full bg-gradient-to-r ${
                                                f.color === "rose" ? "from-rose-400 to-rose-600" :
                                                f.color === "amber" ? "from-amber-400 to-amber-600" :
                                                f.color === "blue" ? "from-blue-400 to-blue-600" :
                                                "from-emerald-400 to-emerald-600"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.description}</p>
                                </div>
                            ))}
                        </div>
                        {health.suggestions.length > 0 && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                                    智能建议
                                </p>
                                <ul className="space-y-1.5">
                                    {health.suggestions.map((s, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 mr-2 flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Top 简历聚光
function TopPerformersSpotlight({ resumes, onOpenAll }: { resumes: ResumeData[]; onOpenAll?: () => void }) {
    const topThree = useMemo(() => {
        return [...resumes]
            .sort((a, b) => b.scores.overall - a.scores.overall)
            .slice(0, 3);
    }, [resumes]);

    if (topThree.length === 0) return null;

    const medals = [
        { color: "from-amber-400 to-yellow-500", shadow: "shadow-amber-500/40", Icon: Crown, label: "TOP 1", rankColor: "text-amber-600 dark:text-amber-400" },
        { color: "from-slate-300 to-slate-400", shadow: "shadow-slate-400/30", Icon: Trophy, label: "TOP 2", rankColor: "text-slate-600 dark:text-slate-300" },
        { color: "from-orange-400 to-amber-600", shadow: "shadow-orange-500/30", Icon: Medal, label: "TOP 3", rankColor: "text-orange-600 dark:text-orange-400" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
        >
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 简历聚光</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">综合评分最高的 3 位候选人</p>
                    </div>
                </div>
                {onOpenAll && topThree.length > 0 && (
                    <button
                        onClick={onOpenAll}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>查看完整排名</span>
                    </button>
                )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {topThree.map((r, i) => {
                    const medal = medals[i];
                    const MedalIcon = medal.Icon;
                    return (
                        <motion.div
                            key={r.id}
                            whileHover={{ y: -6, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg ${medal.shadow} overflow-hidden group cursor-pointer`}
                        >
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${medal.color} rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
                            <div className="flex items-start justify-between mb-4 relative">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${medal.color} flex items-center justify-center shadow-lg ${medal.shadow}`}>
                                    <MedalIcon className="w-7 h-7 text-white" />
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                    i === 0 ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700" :
                                    i === 1 ? "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600" :
                                    "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700"
                                }`}>
                                    {medal.label}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                                {r.basicInfo.name || r.filename}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
                                {r.jobInfo.position || "未指定岗位"} {r.background.education && `· ${r.background.education}`}
                            </p>
                            <div className="flex items-baseline space-x-1 mb-4">
                                <span className={`text-3xl font-bold ${medal.rankColor}`}>{r.scores.overall}</span>
                                <span className="text-sm text-gray-500">分</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">技能</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.scores.skills}</p>
                                </div>
                                <div className="text-center p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">经验</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.scores.experience}</p>
                                </div>
                                <div className="text-center p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">学历</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.scores.education}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                                {r.skills.slice(0, 3).map((s) => (
                                    <span key={s} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                                        {s}
                                    </span>
                                ))}
                                {r.skills.length > 3 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-md">
                                        +{r.skills.length - 3}
                                    </span>
                                )}
                                {r.skills.length === 0 && <span className="text-xs text-gray-400">暂无技能标签</span>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// 改进的加载骨架屏
function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
                        <div className="w-full h-64 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// 改进的空状态
function EmptyState({
    hasTimeRange,
    onResetTimeRange,
    onUpload,
}: {
    hasTimeRange: boolean;
    onResetTimeRange: () => void;
    onUpload: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700"
        >
            <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-900/30 dark:to-pink-900/30 rounded-3xl blur-xl opacity-60" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40 rounded-3xl flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-rose-500 dark:text-rose-400" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {hasTimeRange ? "该时间范围内暂无数据" : "暂无数据可视化"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {hasTimeRange
                    ? "尝试调整时间范围或筛选条件，或上传更多简历以丰富数据"
                    : "上传并分析简历后，这里将展示丰富的数据洞察与可视化图表"}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
                {hasTimeRange && (
                    <button
                        onClick={onResetTimeRange}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        查看全部数据
                    </button>
                )}
                <button
                    onClick={onUpload}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-rose-500/30 transition-all"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    立即上传简历
                </button>
            </div>
        </motion.div>
    );
}

// ========== 简历详情抽屉 ==========
function ResumeDrilldownDrawer({
    isOpen,
    onClose,
    title,
    description,
    resumes,
    accentColor = "rose",
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    resumes: ResumeData[];
    accentColor?: "rose" | "amber" | "emerald" | "blue" | "indigo";
}) {
    const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score");
    const [search, setSearch] = useState("");

    const sortedResumes = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = term
            ? resumes.filter(
                  (r) =>
                      (r.basicInfo.name || "").toLowerCase().includes(term) ||
                      (r.jobInfo.position || "").toLowerCase().includes(term) ||
                      r.skills.some((s) => s.toLowerCase().includes(term))
              )
            : resumes;
        return [...filtered].sort((a, b) => {
            if (sortBy === "score") return b.scores.overall - a.scores.overall;
            if (sortBy === "name") return (a.basicInfo.name || "").localeCompare(b.basicInfo.name || "");
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });
    }, [resumes, sortBy, search]);

    // ESC 关闭
    useEffect(() => {
        if (!isOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const accentMap = {
        rose: { bg: "from-rose-500 to-pink-600", text: "text-rose-600 dark:text-rose-400", light: "bg-rose-50 dark:bg-rose-900/20" },
        amber: { bg: "from-amber-500 to-orange-600", text: "text-amber-600 dark:text-amber-400", light: "bg-amber-50 dark:bg-amber-900/20" },
        emerald: { bg: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-900/20" },
        blue: { bg: "from-blue-500 to-indigo-600", text: "text-blue-600 dark:text-blue-400", light: "bg-blue-50 dark:bg-blue-900/20" },
        indigo: { bg: "from-indigo-500 to-purple-600", text: "text-indigo-600 dark:text-indigo-400", light: "bg-indigo-50 dark:bg-indigo-900/20" },
    };
    const accent = accentMap[accentColor];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        aria-hidden="true"
                    />
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 280 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                    >
                        <div className={`px-6 py-5 bg-gradient-to-r ${accent.bg} text-white relative overflow-hidden`}>
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="flex items-start justify-between relative">
                                <div>
                                    <h2 className="text-xl font-bold">{title}</h2>
                                    {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
                                    <div className="flex items-center space-x-3 mt-3 text-xs text-white/90">
                                        <span className="px-2 py-0.5 rounded-full bg-white/20">共 {resumes.length} 份</span>
                                        {search && <span className="px-2 py-0.5 rounded-full bg-white/20">匹配 {sortedResumes.length} 份</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="关闭抽屉"
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="搜索姓名 / 岗位 / 技能"
                                    aria-label="搜索简历"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    aria-label="排序方式"
                                    className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                                >
                                    <option value="score">按评分</option>
                                    <option value="name">按姓名</option>
                                    <option value="date">按上传时间</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {sortedResumes.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                    <p>未找到匹配的简历</p>
                                </div>
                            ) : (
                                sortedResumes.map((r, i) => {
                                    const scoreColor = r.scores.overall >= 80 ? "text-emerald-600 dark:text-emerald-400" : r.scores.overall >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
                                    const scoreBg = r.scores.overall >= 80 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : r.scores.overall >= 60 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700" : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700";
                                    return (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-700 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-start space-x-3 min-w-0 flex-1">
                                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.bg} flex items-center justify-center text-white font-bold shrink-0`}>
                                                        {r.basicInfo.name?.[0] || "?"}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{r.basicInfo.name || r.filename}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                            {r.jobInfo.position || "未指定岗位"} {r.background.education && `· ${r.background.education}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg border ${scoreBg} ${scoreColor} font-bold text-sm shrink-0 ml-3`}>
                                                    {r.scores.overall}分
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                                <div className="text-center p-1.5 bg-white dark:bg-gray-900/40 rounded-lg">
                                                    <span className="text-gray-500">技能</span>
                                                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">{r.scores.skills}</span>
                                                </div>
                                                <div className="text-center p-1.5 bg-white dark:bg-gray-900/40 rounded-lg">
                                                    <span className="text-gray-500">经验</span>
                                                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">{r.scores.experience}</span>
                                                </div>
                                                <div className="text-center p-1.5 bg-white dark:bg-gray-900/40 rounded-lg">
                                                    <span className="text-gray-500">学历</span>
                                                    <span className="ml-1 font-semibold text-gray-900 dark:text-white">{r.scores.education}</span>
                                                </div>
                                            </div>
                                            {r.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {r.skills.slice(0, 5).map((s) => (
                                                        <span key={s} className="px-2 py-0.5 text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {r.skills.length > 5 && (
                                                        <span className={`px-2 py-0.5 text-xs font-medium ${accent.light} ${accent.text} rounded-md`}>
                                                            +{r.skills.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

// 记忆化版本
const MemoizedResumeDrilldownDrawer = memo(ResumeDrilldownDrawer);

// ========== 快捷键帮助弹窗 ==========
function ShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    useEffect(() => {
        if (!isOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const shortcuts = [
        { keys: ["R"], desc: "刷新数据" },
        { keys: ["E"], desc: "打开导出菜单" },
        { keys: ["A"], desc: "切换自动刷新" },
        { keys: ["T"], desc: "切换时间范围选择器" },
        { keys: ["1", "2", "3", "4", "5", "6"], desc: "展开对应统计卡详情" },
        { keys: ["?"], desc: "显示/隐藏快捷键帮助" },
        { keys: ["Esc"], desc: "关闭弹窗 / 收起详情" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        aria-hidden="true"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[70] overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="键盘快捷键"
                    >
                        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white relative">
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Command className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">键盘快捷键</h2>
                                        <p className="text-xs text-white/80">提升操作效率</p>
                                    </div>
                                </div>
                                <button onClick={onClose} aria-label="关闭" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                            {shortcuts.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.desc}</span>
                                    <div className="flex items-center space-x-1">
                                        {s.keys.map((k, j) => (
                                            <kbd
                                                key={j}
                                                className="px-2 py-1 text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm"
                                            >
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 text-center">
                            按 <kbd className="px-1.5 py-0.5 mx-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded font-mono">?</kbd> 随时打开此面板
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

const MemoizedShortcutsModal = memo(ShortcutsModal);

// ========== 时间对比模式 ==========
function ComparisonView({
    current,
    previous,
    isOpen,
    onClose,
}: {
    current: {
        totalResumes: number;
        avgScore: number;
        topScore: number;
        medianScore: number;
        highRate: number;
        mediumRate: number;
        lowRate: number;
    };
    previous: {
        totalResumes: number;
        avgScore: number;
        topScore: number;
        medianScore: number;
        highRate: number;
        mediumRate: number;
        lowRate: number;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    const metrics = [
        { key: "totalResumes", label: "简历数量", suffix: "份", format: (v: number) => v.toString() },
        { key: "avgScore", label: "平均评分", suffix: "分", format: (v: number) => v.toString() },
        { key: "topScore", label: "最高评分", suffix: "分", format: (v: number) => v.toString() },
        { key: "medianScore", label: "中位数", suffix: "分", format: (v: number) => v.toString() },
        { key: "highRate", label: "高分占比", suffix: "%", format: (v: number) => v.toFixed(1) },
        { key: "mediumRate", label: "中分占比", suffix: "%", format: (v: number) => v.toFixed(1) },
        { key: "lowRate", label: "低分占比", suffix: "%", format: (v: number) => v.toFixed(1) },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                >
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <GitCompare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">时间对比</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">本期数据与上一周期对比</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="关闭对比"
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                关闭对比
                            </button>
                        </div>

                        {!previous ? (
                            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                上一周期暂无数据，无法对比
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                            <th className="text-left py-2 px-3 font-medium">指标</th>
                                            <th className="text-right py-2 px-3 font-medium">上期</th>
                                            <th className="text-right py-2 px-3 font-medium">本期</th>
                                            <th className="text-right py-2 px-3 font-medium">变化</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.map((m) => {
                                            const curr = (current as any)[m.key];
                                            const prev = (previous as any)[m.key];
                                            const delta = curr - prev;
                                            const pct = prev !== 0 ? (delta / prev) * 100 : curr > 0 ? 100 : 0;
                                            const isPositive = delta > 0;
                                            const isNeutral = delta === 0;
                                            // 占比类指标越低越好（低分占比）
                                            const invertColor = m.key === "lowRate";
                                            const colorClass = isNeutral
                                                ? "text-gray-500"
                                                : (isPositive !== invertColor)
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400";
                                            return (
                                                <tr key={m.key} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-medium">{m.label}</td>
                                                    <td className="py-2.5 px-3 text-right text-gray-600 dark:text-gray-400">{m.format(prev)}{m.suffix}</td>
                                                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">{m.format(curr)}{m.suffix}</td>
                                                    <td className={`py-2.5 px-3 text-right font-bold ${colorClass}`}>
                                                        {isNeutral ? "—" : `${isPositive ? "+" : ""}${delta.toFixed(m.suffix === "%" ? 1 : 0)}${m.suffix}`}
                                                        {!isNeutral && (
                                                            <span className="ml-1 text-xs">({isPositive ? "+" : ""}{pct.toFixed(1)}%)</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const MemoizedComparisonView = memo(ComparisonView);

// ========== 图表 PNG 导出工具 ==========
async function exportChartAsPNG(container: HTMLElement, fileName: string) {
    const svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return false;
    // 序列化 SVG
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // 内联 computed 样式
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
        const computed = getComputedStyle(svg.querySelector(`#${el.id}`) || el);
        const keyProps = ["fill", "stroke", "stroke-width", "font-family", "font-size", "opacity"];
        keyProps.forEach((prop) => {
            const val = computed.getPropertyValue(prop);
            if (val) el.setAttribute(prop, val);
        });
    });
    const rect = svg.getBoundingClientRect();
    const width = Math.max(rect.width, 600);
    const height = Math.max(rect.height, 400);
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const imageEl = new window.Image();
    return new Promise<boolean>((resolve) => {
        imageEl.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                resolve(false);
                return;
            }
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(2, 2);
            ctx.drawImage(imageEl, 0, 0, width, height);
            canvas.toBlob((pngBlob) => {
                if (!pngBlob) {
                    URL.revokeObjectURL(url);
                    resolve(false);
                    return;
                }
                const pngUrl = URL.createObjectURL(pngBlob);
                const link = document.createElement("a");
                link.href = pngUrl;
                link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
                link.click();
                URL.revokeObjectURL(pngUrl);
                URL.revokeObjectURL(url);
                resolve(true);
            }, "image/png");
        };
        imageEl.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
        };
        imageEl.src = url;
    });
}

// 图表导出按钮
function ChartExportButton({ targetRef, fileName }: { targetRef: React.RefObject<HTMLElement>; fileName: string }) {
    const [loading, setLoading] = useState(false);
    return (
        <button
            onClick={async () => {
                if (!targetRef.current) return;
                setLoading(true);
                await exportChartAsPNG(targetRef.current, fileName);
                setLoading(false);
            }}
            aria-label="导出图表为 PNG"
            title="导出为 PNG"
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
        >
            <Image className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
        </button>
    );
}

const MemoizedChartExportButton = memo(ChartExportButton);

// ========== 自定义数据看板 ==========
type ChartType = "bar" | "column" | "line" | "area" | "radar" | "donut" | "scatter" | "treemap";
type MetricKey = "overall" | "skills" | "experience" | "education";
type XAxisKey = "education" | "position" | "topSkills";
type ColorScheme = "rose" | "indigo" | "emerald" | "amber" | "rainbow";

interface CustomSeries {
    id: string;
    name: string;
    metric: MetricKey;
    color: string;
    visible: boolean;
}

const METRIC_OPTIONS: { value: MetricKey; label: string; description: string }[] = [
    { value: "overall", label: "综合评分", description: "三项加权的总评分" },
    { value: "skills", label: "技能评分", description: "技能匹配度评分" },
    { value: "experience", label: "经验评分", description: "工作经历相关度" },
    { value: "education", label: "学历评分", description: "教育背景评分" },
];

const XAXIS_OPTIONS: { value: XAxisKey; label: string; description: string }[] = [
    { value: "education", label: "学历分布", description: "按教育背景聚合" },
    { value: "position", label: "岗位分布", description: "按目标岗位聚合" },
    { value: "topSkills", label: "热门技能", description: "按出现频次聚合" },
];

const CHART_TYPES: { value: ChartType; label: string; Icon: typeof BarChart3 }[] = [
    { value: "column", label: "柱状图", Icon: BarChart3 },
    { value: "bar", label: "条形图", Icon: BarChartHorizontal },
    { value: "line", label: "折线图", Icon: LineChartIcon },
    { value: "area", label: "面积图", Icon: AreaChartIcon },
    { value: "radar", label: "雷达图", Icon: RadarIcon },
    { value: "donut", label: "环形图", Icon: CircleDot },
    { value: "scatter", label: "散点图", Icon: ScatterChartIcon },
    { value: "treemap", label: "矩形树图", Icon: TreePine },
];

const COLOR_SCHEMES: Record<ColorScheme, { label: string; colors: string[]; gradient: string }> = {
    rose: { label: "玫瑰粉", colors: ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#fff1f2"], gradient: "from-rose-500 to-pink-600" },
    indigo: { label: "靛蓝", colors: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"], gradient: "from-indigo-500 to-purple-600" },
    emerald: { label: "翠绿", colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"], gradient: "from-emerald-500 to-teal-600" },
    amber: { label: "琥珀橙", colors: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"], gradient: "from-amber-500 to-orange-600" },
    rainbow: { label: "彩虹", colors: ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"], gradient: "from-rose-500 via-amber-500 to-indigo-500" },
};

function CustomDashboard({ resumes, stats }: { resumes: ResumeData[]; stats: any }) {
    const [chartType, setChartType] = useState<ChartType>("column");
    const [xAxis, setXAxis] = useState<XAxisKey>("education");
    const [colorScheme, setColorScheme] = useState<ColorScheme>("rose");
    const [showGrid, setShowGrid] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [sortBy, setSortBy] = useState<"value" | "name">("value");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [series, setSeries] = useState<CustomSeries[]>([
        { id: "s1", name: "综合评分", metric: "overall", color: "#f43f5e", visible: true },
        { id: "s2", name: "技能评分", metric: "skills", color: "#f59e0b", visible: true },
        { id: "s3", name: "经验评分", metric: "experience", color: "#10b981", visible: true },
    ]);
    const [newSeriesName, setNewSeriesName] = useState("");
    const [newSeriesMetric, setNewSeriesMetric] = useState<MetricKey>("education");
    const [showAddSeries, setShowAddSeries] = useState(false);

    const scheme = COLOR_SCHEMES[colorScheme];

    // 计算 X 轴分类
    const categories = useMemo(() => {
        if (xAxis === "education") {
            const groups: Record<string, number> = {};
            resumes.forEach((r) => {
                const edu = r.background.education || "未知";
                groups[edu] = (groups[edu] || 0) + 1;
            });
            return Object.keys(groups).sort();
        }
        if (xAxis === "position") {
            const groups: Record<string, number> = {};
            resumes.forEach((r) => {
                const pos = r.jobInfo.position || "未知";
                groups[pos] = (groups[pos] || 0) + 1;
            });
            return Object.keys(groups).sort().slice(0, 8);
        }
        return stats.topSkills.slice(0, 8).map((s: any) => s.name);
    }, [resumes, xAxis, stats.topSkills]);

    // 计算每个系列在每个分类下的数据
    const chartData = useMemo(() => {
        return categories.map((cat) => {
            const row: Record<string, string | number> = { name: cat };
            series
                .filter((s) => s.visible)
                .forEach((s) => {
                    let value = 0;
                    if (xAxis === "education") {
                        const subset = resumes.filter((r) => (r.background.education || "未知") === cat);
                        value = subset.length > 0 ? Math.round(subset.reduce((sum, r) => sum + r.scores[s.metric], 0) / subset.length) : 0;
                    } else if (xAxis === "position") {
                        const subset = resumes.filter((r) => (r.jobInfo.position || "未知") === cat);
                        value = subset.length > 0 ? Math.round(subset.reduce((sum, r) => sum + r.scores[s.metric], 0) / subset.length) : 0;
                    } else {
                        // topSkills
                        const count = resumes.filter((r) => r.skills.some((sk) => sk === cat)).length;
                        value = count;
                    }
                    row[s.id] = value;
                });
            return row;
        });
    }, [categories, series, resumes, xAxis]);

    // 排序
    const sortedData = useMemo(() => {
        if (sortBy === "name") {
            return [...chartData].sort((a, b) => (a.name > b.name ? 1 : -1) * (sortOrder === "asc" ? 1 : -1));
        }
        // 按第一个可见系列的数值排序
        const firstVisibleId = series.find((s) => s.visible)?.id;
        if (!firstVisibleId) return chartData;
        return [...chartData].sort((a, b) => ((a[firstVisibleId] as number) - (b[firstVisibleId] as number)) * (sortOrder === "asc" ? 1 : -1));
    }, [chartData, sortBy, sortOrder, series]);

    // 添加新系列
    const handleAddSeries = useCallback(() => {
        const usedColors = scheme.colors.slice(series.length % scheme.colors.length);
        const color = usedColors[0];
        const id = `s${Date.now()}`;
        const newSeries: CustomSeries = {
            id,
            name: newSeriesName.trim() || METRIC_OPTIONS.find((m) => m.value === newSeriesMetric)?.label || "新系列",
            metric: newSeriesMetric,
            color,
            visible: true,
        };
        setSeries((prev) => [...prev, newSeries]);
        setNewSeriesName("");
        setNewSeriesMetric("education");
        setShowAddSeries(false);
    }, [newSeriesName, newSeriesMetric, scheme.colors, series.length]);

    // 删除系列
    const handleRemoveSeries = useCallback((id: string) => {
        setSeries((prev) => prev.filter((s) => s.id !== id));
    }, []);

    // 切换可见性
    const handleToggleVisible = useCallback((id: string) => {
        setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
    }, []);

    // 更新系列名称
    const handleUpdateSeriesName = useCallback((id: string, name: string) => {
        setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    }, []);

    // 自动重排系列颜色
    useEffect(() => {
        setSeries((prev) => {
            const updated = [...prev];
            updated.forEach((s, i) => {
                s.color = scheme.colors[i % scheme.colors.length];
            });
            return updated;
        });
    }, [colorScheme, scheme.colors]);

    const visibleSeries = series.filter((s) => s.visible);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
        >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${scheme.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <Sliders className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">自定义数据看板</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">切换图表类型 · 自由组合数据系列</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-mono">{visibleSeries.length}</span>
                        <span>个数据系列</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-mono">{categories.length}</span>
                        <span>个分组</span>
                    </div>
                </div>

                {/* 图表类型切换器 */}
                <div className="mb-4 overflow-x-auto">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-900/40 p-1 rounded-xl border border-gray-200 dark:border-gray-700 inline-flex min-w-full sm:min-w-0">
                        {CHART_TYPES.map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                onClick={() => setChartType(value)}
                                aria-pressed={chartType === value}
                                aria-label={label}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    chartType === value
                                        ? `bg-gradient-to-r ${scheme.gradient} text-white shadow-md`
                                        : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 调色板选择 */}
                <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 shrink-0">
                        <Palette className="w-3.5 h-3.5" />
                        <span>调色板：</span>
                    </span>
                    {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setColorScheme(s)}
                            aria-pressed={colorScheme === s}
                            title={COLOR_SCHEMES[s].label}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                                colorScheme === s
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <span className="flex -space-x-1">
                                {COLOR_SCHEMES[s].colors.slice(0, 4).map((c, i) => (
                                    <span key={i} className="w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" style={{ background: c }} />
                                ))}
                            </span>
                            <span>{COLOR_SCHEMES[s].label}</span>
                        </button>
                    ))}
                </div>

                {/* 图表画布 */}
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${chartType}-${xAxis}-${colorScheme}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {sortedData.length === 0 || visibleSeries.length === 0 ? (
                                <div className="h-72 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                    <BarChart3 className="w-12 h-12 mb-2 opacity-40" />
                                    <p className="text-sm">请至少启用一个数据系列</p>
                                </div>
                            ) : (
                                <CustomChartRenderer
                                    chartType={chartType}
                                    data={sortedData}
                                    series={visibleSeries}
                                    colorScheme={scheme}
                                    showGrid={showGrid}
                                    showLabels={showLabels}
                                    showLegend={showLegend}
                                    xAxis={xAxis}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 数据系列管理 + 配置面板 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 数据系列管理 */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5">
                                <Settings2 className="w-4 h-4" />
                                <span>数据系列 ({series.length})</span>
                            </h4>
                            <button
                                onClick={() => setShowAddSeries((v) => !v)}
                                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                                    showAddSeries
                                        ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        : `bg-gradient-to-r ${scheme.gradient} text-white shadow-sm hover:shadow`
                                }`}
                            >
                                {showAddSeries ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                <span>{showAddSeries ? "取消" : "添加系列"}</span>
                            </button>
                        </div>

                        {/* 添加系列表单 */}
                        <AnimatePresence>
                            {showAddSeries && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mb-3"
                                >
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                                        <input
                                            type="text"
                                            value={newSeriesName}
                                            onChange={(e) => setNewSeriesName(e.target.value)}
                                            placeholder="系列名称（可选，默认使用指标名）"
                                            aria-label="新系列名称"
                                            className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={newSeriesMetric}
                                                onChange={(e) => setNewSeriesMetric(e.target.value as MetricKey)}
                                                aria-label="选择指标"
                                                className="flex-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                                            >
                                                {METRIC_OPTIONS.map((m) => (
                                                    <option key={m.value} value={m.value}>{m.label} · {m.description}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAddSeries}
                                                className={`px-3 py-1.5 bg-gradient-to-r ${scheme.gradient} text-white text-sm font-medium rounded-md shadow-sm hover:shadow`}
                                            >
                                                确认
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 系列列表 */}
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                            {series.map((s, i) => (
                                <motion.div
                                    key={s.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className={`flex items-center space-x-2 p-2 rounded-lg group transition-all ${
                                        s.visible ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-900/40 opacity-60"
                                    } border border-gray-200 dark:border-gray-700`}
                                >
                                    <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                                    <input
                                        type="text"
                                        value={s.name}
                                        onChange={(e) => handleUpdateSeriesName(s.id, e.target.value)}
                                        aria-label="系列名称"
                                        className="flex-1 min-w-0 text-sm bg-transparent border-0 outline-none focus:ring-1 focus:ring-rose-500 rounded px-1 text-gray-900 dark:text-white"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                        {METRIC_OPTIONS.find((m) => m.value === s.metric)?.label}
                                    </span>
                                    <button
                                        onClick={() => handleToggleVisible(s.id)}
                                        aria-label={s.visible ? "隐藏系列" : "显示系列"}
                                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded shrink-0"
                                    >
                                        {s.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                    {series.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveSeries(s.id)}
                                            aria-label="删除系列"
                                            className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* 图表配置面板 */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5 mb-3">
                            <Sliders className="w-4 h-4" />
                            <span>图表配置</span>
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">X 轴分组</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {XAXIS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setXAxis(opt.value)}
                                            aria-pressed={xAxis === opt.value}
                                            title={opt.description}
                                            className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-all ${
                                                xAxis === opt.value
                                                    ? `bg-gradient-to-r ${scheme.gradient} text-white shadow-sm`
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <ConfigToggle label="显示网格" enabled={showGrid} onChange={setShowGrid} scheme={scheme} />
                                <ConfigToggle label="数据标签" enabled={showLabels} onChange={setShowLabels} scheme={scheme} />
                                <ConfigToggle label="显示图例" enabled={showLegend} onChange={setShowLegend} scheme={scheme} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">排序方式</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as "value" | "name")}
                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="value">按数值</option>
                                        <option value="name">按名称</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">排序方向</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="desc">降序 ↓</option>
                                        <option value="asc">升序 ↑</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-center text-xs">
                                <Stat label="当前类型" value={CHART_TYPES.find((c) => c.value === chartType)?.label || ""} />
                                <Stat label="可见系列" value={String(visibleSeries.length)} />
                                <Stat label="数据点" value={String(sortedData.length * visibleSeries.length)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// 配置开关组件
function ConfigToggle({ label, enabled, onChange, scheme }: { label: string; enabled: boolean; onChange: (v: boolean) => void; scheme: typeof COLOR_SCHEMES.rose }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            aria-pressed={enabled}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                enabled
                    ? `bg-gradient-to-r ${scheme.gradient} text-white shadow-sm`
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            }`}
        >
            <span>{label}</span>
            <span className={`w-7 h-4 rounded-full relative transition-colors ${enabled ? "bg-white/30" : "bg-gray-300 dark:bg-gray-600"}`}>
                <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                />
            </span>
        </button>
    );
}

// 统计小卡片
function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">{label}</div>
            <div className="font-bold text-gray-900 dark:text-white text-sm">{value}</div>
        </div>
    );
}

// ========== 自定义图表渲染器 ==========
function CustomChartRenderer({
    chartType,
    data,
    series,
    colorScheme,
    showGrid,
    showLabels,
    showLegend,
    xAxis,
}: {
    chartType: ChartType;
    data: Array<Record<string, string | number>>;
    series: CustomSeries[];
    colorScheme: typeof COLOR_SCHEMES.rose;
    showGrid: boolean;
    showLabels: boolean;
    showLegend: boolean;
    xAxis: XAxisKey;
}) {
    const isDonut = chartType === "donut";
    const isRadar = chartType === "radar";
    const isScatter = chartType === "scatter";
    const isTreemap = chartType === "treemap";
    const isHorizontal = chartType === "bar";
    const isLineOrArea = chartType === "line" || chartType === "area";

    const visibleDataKey = series.length === 1 ? series[0].id : null;
    const valueKey = visibleDataKey || series[0].id;

    if (isDonut) {
        // 环形图：使用第一个可见系列
        const firstSeries = series[0];
        return (
            <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.map((d) => ({ name: String(d.name), value: d[firstSeries.id] as number }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={showLabels ? ({ name, value, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                            labelLine={false}
                        >
                            {data.map((_, idx) => (
                                <Cell key={idx} fill={colorScheme.colors[idx % colorScheme.colors.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomDashboardTooltip scheme={colorScheme} />} />
                        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (isRadar) {
        // 雷达图：使用类别作为轴
        return (
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <PolarGrid stroke={showGrid ? "#e5e7eb" : "transparent"} />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis tick={{ fontSize: 10 }} angle={30} />
                        {series.map((s) => (
                            <Radar
                                key={s.id}
                                name={s.name}
                                dataKey={s.id}
                                stroke={s.color}
                                fill={s.color}
                                fillOpacity={0.25}
                                strokeWidth={2}
                                dot={{ r: 3, fillOpacity: 1 }}
                            />
                        ))}
                        <RechartsTooltip content={<CustomDashboardTooltip scheme={colorScheme} />} />
                        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (isScatter) {
        // 散点图：使用 index 作为 X，每系列一个 Y
        return (
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid stroke={showGrid ? "#e5e7eb" : "transparent"} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <RechartsTooltip content={<CustomDashboardTooltip scheme={colorScheme} />} />
                        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
                        {series.map((s) => (
                            <Scatter
                                key={s.id}
                                name={s.name}
                                data={data.map((d) => ({ name: d.name, value: d[s.id] }))}
                                fill={s.color}
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (isTreemap) {
        // 矩形树图：使用第一个可见系列
        const firstSeries = series[0];
        return (
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data.map((d) => ({ name: String(d.name), size: d[firstSeries.id] as number }))}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        content={<CustomTreemapContent colors={colorScheme.colors} showLabels={showLabels} />}
                    />
                </ResponsiveContainer>
            </div>
        );
    }

    // 柱状图、条形图、折线图、面积图
    const BarOrLineChart = isHorizontal ? RechartsBarChart : RechartsBarChart;
    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarOrLineChart data={data} layout={isHorizontal ? "vertical" : "horizontal"} margin={{ top: showLabels ? 20 : 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        {series.map((s) => (
                            <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0" y1="0" x2={isHorizontal ? "1" : "0"} y2={isHorizontal ? "0" : "1"}>
                                <stop offset="0%" stopColor={s.color} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={s.color} stopOpacity={0.5} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid stroke={showGrid ? "#e5e7eb" : "transparent"} strokeDasharray="3 3" />
                    {isHorizontal ? (
                        <>
                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={70} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" angle={-15} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        </>
                    )}
                    <RechartsTooltip content={<CustomDashboardTooltip scheme={colorScheme} />} />
                    {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    {isLineOrArea ? (
                        series.map((s) => (
                            <Line
                                key={s.id}
                                type="monotone"
                                dataKey={s.id}
                                name={s.name}
                                stroke={s.color}
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: s.color, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6 }}
                                fill={chartType === "area" ? `url(#grad-${s.id})` : "none"}
                                fillOpacity={chartType === "area" ? 0.6 : undefined}
                            />
                        ))
                    ) : (
                        series.map((s) => (
                            <Bar
                                key={s.id}
                                dataKey={s.id}
                                name={s.name}
                                fill={`url(#grad-${s.id})`}
                                radius={[6, 6, 0, 0]}
                                label={showLabels ? ({ x, y, width, value }: any) => (
                                    <text x={x + width / 2} y={y - 4} fill="#374151" textAnchor="middle" fontSize={11} fontWeight={600}>
                                        {value}
                                    </text>
                                ) : false}
                            />
                        ))
                    )}
                </BarOrLineChart>
            </ResponsiveContainer>
        </div>
    );
}

// 仪表盘专用 Tooltip
function CustomDashboardTooltip({ active, payload, label, scheme }: any) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
            {label && <div className="font-semibold text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">{label}</div>}
            <div className="space-y-1.5">
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color || p.payload?.fill || p.fill }} />
                            <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                        </div>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                            {p.value}
                            {p.payload?.unit || ""}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 矩形树图自定义内容
function CustomTreemapContent({ root, depth, x, y, width, height, index, colors, showLabels }: any) {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: colors[index % colors.length],
                    stroke: "#fff",
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {showLabels && width > 40 && height > 30 && (
                <>
                    <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>
                        {root.name}
                    </text>
                    <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={11} opacity={0.9}>
                        {root.size}
                    </text>
                </>
            )}
        </g>
    );
}

const MemoizedCustomDashboard = memo(CustomDashboard);

// ========== 主页面 ==========

export default function Stats() {
    const [isLoading, setIsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(0); // 0 = all
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    // 新增：抽屉、快捷键、对比模式状态
    const [drilldown, setDrilldown] = useState<{ open: boolean; title: string; description: string; resumes: ResumeData[]; accent: "rose" | "amber" | "emerald" | "blue" | "indigo" } | null>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
    const [filters, setFilters] = useState<FilterState>({ education: "全部", position: "全部", scoreRange: [0, 100], skillKeyword: "" });
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { resumes, setResumes } = useResumeStore();

    // 加载数据
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const history = await api.getHistory();
            setResumes(history);
            setLastRefreshTime(new Date());
        } catch (err) {
            console.error("加载历史数据失败:", err);
        } finally {
            setIsLoading(false);
        }
    }, [setResumes]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 实时自动刷新
    useEffect(() => {
        if (autoRefresh) {
            refreshTimerRef.current = setInterval(() => {
                loadData();
            }, 30000); // 30秒刷新
        } else {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        }
        return () => {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        };
    }, [autoRefresh, loadData]);

    // 关闭导出菜单
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // 手动刷新
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    }, [loadData]);

    // 全局键盘快捷键
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            // 输入框 / 编辑控件内不触发
            if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const k = e.key.toLowerCase();
            if (k === "r") {
                e.preventDefault();
                handleRefresh();
            } else if (k === "e") {
                e.preventDefault();
                setShowExportMenu((v) => !v);
            } else if (k === "a") {
                e.preventDefault();
                setAutoRefresh((v) => !v);
            } else if (k === "?" || (e.shiftKey && k === "/")) {
                e.preventDefault();
                setShowShortcuts((v) => !v);
            } else if (k === "escape") {
                setSelectedCard(null);
                setShowShortcuts(false);
                if (drilldown?.open) setDrilldown(null);
            } else if (["1", "2", "3", "4", "5", "6"].includes(k)) {
                e.preventDefault();
                const id = ["total", "avg", "top", "median", "stddev", "recent"][parseInt(k, 10) - 1];
                setSelectedCard((cur) => (cur === id ? null : id));
            }
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleRefresh, drilldown]);

    // 时间范围 + 多维筛选
    const filteredResumes = useMemo(() => {
        return resumes.filter((r) => {
            if (!isWithinDays(r.uploadedAt, timeRange)) return false;
            if (filters.education !== "全部" && (r.background.education || "未知") !== filters.education) return false;
            if (filters.position !== "全部" && (r.jobInfo.position || "未知") !== filters.position) return false;
            if (r.scores.overall < filters.scoreRange[0] || r.scores.overall > filters.scoreRange[1]) return false;
            if (filters.skillKeyword) {
                const keyword = filters.skillKeyword.toLowerCase();
                const hasSkill = r.skills.some((s) => s.toLowerCase().includes(keyword));
                if (!hasSkill) return false;
            }
            return true;
        });
    }, [resumes, timeRange, filters]);

    // 计算统计数据
    const stats = useMemo(() => {
        if (filteredResumes.length === 0) {
            return {
                totalResumes: 0,
                avgScore: 0,
                topScore: 0,
                recentCount: 0,
                scoreDistribution: { high: 0, medium: 0, low: 0 },
                topSkills: [] as { skill: string; count: number }[],
                educationDistribution: {} as Record<string, number>,
                positionDistribution: {} as Record<string, number>,
                scoreStdDev: 0,
                medianScore: 0,
            };
        }

        const totalResumes = filteredResumes.length;
        const allScores = filteredResumes.map((r) => r.scores.overall);
        const avgScore = Math.round(allScores.reduce((s, v) => s + v, 0) / totalResumes);
        const topScore = Math.max(...allScores);
        const sortedScores = [...allScores].sort((a, b) => a - b);
        const medianScore = totalResumes % 2 === 0
            ? Math.round((sortedScores[totalResumes / 2 - 1] + sortedScores[totalResumes / 2]) / 2)
            : sortedScores[Math.floor(totalResumes / 2)];

        const variance = allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / totalResumes;
        const scoreStdDev = Math.round(Math.sqrt(variance) * 10) / 10;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentCount = filteredResumes.filter((r) => new Date(r.uploadedAt) > oneWeekAgo).length;

        const scoreDistribution = filteredResumes.reduce(
            (acc, r) => {
                if (r.scores.overall >= SCORE_THRESHOLDS.high) acc.high++;
                else if (r.scores.overall >= SCORE_THRESHOLDS.medium) acc.medium++;
                else acc.low++;
                return acc;
            },
            { high: 0, medium: 0, low: 0 }
        );

        const skillCounts: Record<string, number> = {};
        filteredResumes.forEach((r) => {
            r.skills.forEach((skill) => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });
        const topSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        const educationDistribution: Record<string, number> = {};
        filteredResumes.forEach((r) => {
            const edu = r.background.education || "未知";
            educationDistribution[edu] = (educationDistribution[edu] || 0) + 1;
        });

        const positionDistribution: Record<string, number> = {};
        filteredResumes.forEach((r) => {
            const pos = r.jobInfo.position || "未知";
            positionDistribution[pos] = (positionDistribution[pos] || 0) + 1;
        });

        return {
            totalResumes,
            avgScore,
            topScore,
            recentCount,
            scoreDistribution,
            topSkills,
            educationDistribution,
            positionDistribution,
            scoreStdDev,
            medianScore,
        };
    }, [filteredResumes]);

    // 上一周期数据（用于时间对比）
    const previousStats = useMemo(() => {
        if (timeRange === 0) return null; // 全部数据时无"上一周期"概念
        const prevStart = new Date();
        prevStart.setDate(prevStart.getDate() - timeRange * 2);
        const prevEnd = new Date();
        prevEnd.setDate(prevEnd.getDate() - timeRange);
        // 同样应用非时间筛选
        const prevBase = resumes.filter((r) => {
            if (filters.education !== "全部" && (r.background.education || "未知") !== filters.education) return false;
            if (filters.position !== "全部" && (r.jobInfo.position || "未知") !== filters.position) return false;
            if (r.scores.overall < filters.scoreRange[0] || r.scores.overall > filters.scoreRange[1]) return false;
            if (filters.skillKeyword) {
                const keyword = filters.skillKeyword.toLowerCase();
                if (!r.skills.some((s) => s.toLowerCase().includes(keyword))) return false;
            }
            return true;
        });
        const prev = prevBase.filter((r) => {
            const d = new Date(r.uploadedAt);
            return d >= prevStart && d <= prevEnd;
        });
        if (prev.length === 0) return null;
        const scores = prev.map((r) => r.scores.overall);
        const avg = Math.round(scores.reduce((s, v) => s + v, 0) / prev.length);
        const sorted = [...scores].sort((a, b) => a - b);
        const median = prev.length % 2 === 0
            ? Math.round((sorted[prev.length / 2 - 1] + sorted[prev.length / 2]) / 2)
            : sorted[Math.floor(prev.length / 2)];
        const dist = prev.reduce(
            (acc, r) => {
                if (r.scores.overall >= SCORE_THRESHOLDS.high) acc.high++;
                else if (r.scores.overall >= SCORE_THRESHOLDS.medium) acc.medium++;
                else acc.low++;
                return acc;
            },
            { high: 0, medium: 0, low: 0 }
        );
        return {
            totalResumes: prev.length,
            avgScore: avg,
            topScore: Math.max(...scores),
            medianScore: median,
            highRate: (dist.high / prev.length) * 100,
            mediumRate: (dist.medium / prev.length) * 100,
            lowRate: (dist.low / prev.length) * 100,
        };
    }, [resumes, timeRange, filters]);

    // 上一周期 ratio（百分比），用于 StatCard 变化指示
    const previousRatio = useMemo(() => {
        if (!previousStats) return undefined;
        return Math.round(((stats.avgScore - previousStats.avgScore) / Math.max(previousStats.avgScore, 1)) * 100);
    }, [stats, previousStats]);

    // 异常预警
    const alerts = useMemo(() => {
        const result: { type: "warning" | "info" | "success"; message: string }[] = [];

        if (filteredResumes.length > 0) {
            // 低分简历过多预警
            const lowRate = stats.scoreDistribution.low / filteredResumes.length;
            if (lowRate > 0.3) {
                result.push({
                    type: "warning",
                    message: `当前有 ${(lowRate * 100).toFixed(0)}% 的简历评分低于60分，建议优化简历模板或加强候选人筛选。`,
                });
            }

            // 标准差过大预警
            if (stats.scoreStdDev > 20) {
                result.push({
                    type: "info",
                    message: `评分标准差为 ${stats.scoreStdDev}，简历质量差异较大，建议关注低分简历的具体问题。`,
                });
            }

            // 高分占比提示
            const highRate = stats.scoreDistribution.high / filteredResumes.length;
            if (highRate > 0.5) {
                result.push({
                    type: "success",
                    message: `优秀简历占比 ${(highRate * 100).toFixed(0)}%，整体简历质量较高！`,
                });
            }

            // 活跃度预警
            if (timeRange === 0 && stats.recentCount === 0 && filteredResumes.length > 0) {
                result.push({
                    type: "info",
                    message: "近7天内无新增简历上传，建议定期更新候选人数据。",
                });
            }
        }

        return result;
    }, [filteredResumes, stats, timeRange]);

    const maxSkillCount = stats.topSkills.length > 0
        ? Math.max(...stats.topSkills.map((s) => s.count))
        : 0;

    // 数据导出 - CSV
    const handleExportCSV = useCallback(() => {
        const headers = ["姓名", "岗位", "学历", "综合评分", "技能评分", "经验评分", "学历评分", "技能列表", "上传时间"];
        const rows = filteredResumes.map((r) => [
            r.basicInfo.name || r.filename,
            r.jobInfo.position || "",
            r.background.education || "",
            r.scores.overall,
            r.scores.skills,
            r.scores.experience,
            r.scores.education,
            r.skills.join("; "),
            r.uploadedAt,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
        downloadCSV(csv, `简历统计数据_${new Date().toISOString().slice(0, 10)}.csv`);
        setShowExportMenu(false);
    }, [filteredResumes]);

    // 数据导出 - JSON
    const handleExportJSON = useCallback(() => {
        const data = {
            exportTime: new Date().toISOString(),
            timeRange: TIME_RANGES.find((r) => r.days === timeRange)?.label || "全部",
            summary: stats,
            resumes: filteredResumes,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `简历数据_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    }, [filteredResumes, stats, timeRange]);

    // 分享 - 复制链接
    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, []);

    // 计算与全局数据的对比变化率
    const getChangeRate = useCallback(
        (filterFn: (r: ResumeData) => boolean) => {
            if (timeRange === 0 || filteredResumes.length === 0 || resumes.length === 0) return undefined;
            const prevStart = new Date();
            prevStart.setDate(prevStart.getDate() - timeRange * 2);
            const prevEnd = new Date();
            prevEnd.setDate(prevEnd.getDate() - timeRange);
            const prevResumes = resumes.filter((r) => {
                const d = new Date(r.uploadedAt);
                return d >= prevStart && d <= prevEnd;
            });
            if (prevResumes.length === 0) return undefined;
            const prevAvg = prevResumes.filter(filterFn).length;
            const currAvg = filteredResumes.filter(filterFn).length;
            if (prevAvg === 0) return currAvg > 0 ? 100 : 0;
            return Math.round(((currAvg - prevAvg) / prevAvg) * 100);
        },
        [timeRange, filteredResumes, resumes]
    );

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ParticleField />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Hero Header - 参照 Analyze.tsx 设计，颜色与首页卡片主题一致 */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl shadow-2xl shadow-rose-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <PieChartIcon className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-rose-800 to-pink-800 dark:from-white dark:via-rose-200 dark:to-pink-200 bg-clip-text text-transparent">
                                数据统计分析
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            全方位可视化分析简历数据，掌握候选人池整体趋势
                            <br className="hidden sm:block" />
                            <span className="text-rose-600 dark:text-rose-400 font-medium">多维度评分分布与深度数据洞察</span>
                        </motion.p>
                    </div>

                    {/* 工具栏 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4"
                    >
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                                概览
                                {lastRefreshTime && (
                                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-3">
                                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                                        更新于 {lastRefreshTime.toLocaleTimeString()}
                                    </span>
                                )}
                            </h2>
                            <p className="text-base text-gray-600 dark:text-gray-400">
                                查看简历分析的整体数据概览，包括评分分布、技能统计等
                            </p>
                        </div>

                        <div className="flex items-center space-x-3 flex-wrap">
                            {/* 时间范围 */}
                            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

                            {/* 自动刷新开关 */}
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    autoRefresh
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                                title={autoRefresh ? "关闭自动刷新" : "开启自动刷新（每30秒）"}
                            >
                                {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                <span className="hidden sm:inline">自动刷新</span>
                            </button>

                            {/* 手动刷新 */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center space-x-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">刷新</span>
                            </button>

                            {/* 导出 */}
                            <div ref={exportMenuRef} className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center space-x-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">导出</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden"
                                        >
                                            <button
                                                onClick={handleExportCSV}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-300"
                                            >
                                                <Download className="w-4 h-4 text-emerald-500" />
                                                <span>导出 CSV</span>
                                            </button>
                                            <button
                                                onClick={handleExportJSON}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-gray-700 dark:text-gray-300"
                                            >
                                                <Download className="w-4 h-4 text-blue-500" />
                                                <span>导出 JSON</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 分享 */}
                            <button
                                onClick={handleShare}
                                className={`flex items-center space-x-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
                                    copied
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">已复制</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">分享</span>
                                    </>
                                )}
                            </button>

                            {/* 对比上期 */}
                            <button
                                onClick={() => setShowComparison((v) => !v)}
                                aria-pressed={showComparison}
                                title="对比上一周期数据"
                                className={`flex items-center space-x-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
                                    showComparison
                                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <GitCompare className="w-4 h-4" />
                                <span className="hidden md:inline">对比上期</span>
                            </button>

                            {/* 快捷键帮助 */}
                            <button
                                onClick={() => setShowShortcuts(true)}
                                aria-label="显示快捷键帮助"
                                title="快捷键帮助（?）"
                                className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                            >
                                <Command className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    {/* 时间对比面板 */}
                    {showComparison && previousStats && (
                        <MemoizedComparisonView
                            isOpen={showComparison}
                            onClose={() => setShowComparison(false)}
                            current={{
                                totalResumes: stats.totalResumes,
                                avgScore: stats.avgScore,
                                topScore: stats.topScore,
                                medianScore: stats.medianScore,
                                highRate: (stats.scoreDistribution.high / Math.max(stats.totalResumes, 1)) * 100,
                                mediumRate: (stats.scoreDistribution.medium / Math.max(stats.totalResumes, 1)) * 100,
                                lowRate: (stats.scoreDistribution.low / Math.max(stats.totalResumes, 1)) * 100,
                            }}
                            previous={previousStats}
                        />
                    )}

                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : filteredResumes.length === 0 ? (
                        <EmptyState
                            hasTimeRange={timeRange > 0}
                            onResetTimeRange={() => setTimeRange(0)}
                            onUpload={() => { window.location.href = "/analyze"; }}
                        />
                    ) : (
                        <>
                            {/* 异常预警 */}
                            <AlertCard alerts={alerts} />

                            {/* 数据洞察 */}
                            <div className="mb-6">
                                <InsightsPanel resumes={filteredResumes} stats={stats} />
                            </div>

                            {/* 多维筛选器 */}
                            <MultiFilter filters={filters} onChange={setFilters} resumes={resumes} />

                            {/* 概览统计卡片 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                                <StatCard
                                    title="简历总数"
                                    value={stats.totalResumes}
                                    icon={Users}
                                    color="from-blue-500 to-blue-600"
                                    change={getChangeRate(() => true)}
                                    active={selectedCard === "total"}
                                    onClick={() => setSelectedCard(selectedCard === "total" ? null : "total")}
                                />
                                <StatCard
                                    title="平均评分"
                                    value={stats.avgScore}
                                    icon={TrendingUp}
                                    color="from-emerald-500 to-emerald-600"
                                    suffix="分"
                                    active={selectedCard === "avg"}
                                    onClick={() => setSelectedCard(selectedCard === "avg" ? null : "avg")}
                                />
                                <StatCard
                                    title="最高评分"
                                    value={stats.topScore}
                                    icon={Award}
                                    color="from-amber-500 to-amber-600"
                                    suffix="分"
                                    active={selectedCard === "top"}
                                    onClick={() => setSelectedCard(selectedCard === "top" ? null : "top")}
                                />
                                <StatCard
                                    title="中位数"
                                    value={stats.medianScore}
                                    icon={Target}
                                    color="from-indigo-500 to-indigo-600"
                                    suffix="分"
                                    active={selectedCard === "median"}
                                    onClick={() => setSelectedCard(selectedCard === "median" ? null : "median")}
                                />
                                <StatCard
                                    title="评分标准差"
                                    value={stats.scoreStdDev}
                                    icon={Activity}
                                    color="from-rose-500 to-rose-600"
                                    active={selectedCard === "stddev"}
                                    onClick={() => setSelectedCard(selectedCard === "stddev" ? null : "stddev")}
                                />
                                <StatCard
                                    title="近7天新增"
                                    value={stats.recentCount}
                                    icon={Zap}
                                    color="from-purple-500 to-purple-600"
                                    change={timeRange > 0 ? getChangeRate(() => true) : undefined}
                                    active={selectedCard === "recent"}
                                    onClick={() => setSelectedCard(selectedCard === "recent" ? null : "recent")}
                                />
                            </div>

                            {/* 数据健康度 */}
                            <HealthScoreDashboard stats={stats} filteredResumes={filteredResumes} />

                            {/* Top 简历聚光 */}
                            <TopPerformersSpotlight
                                resumes={filteredResumes}
                                onOpenAll={() => {
                                    const sorted = [...filteredResumes].sort((a, b) => b.scores.overall - a.scores.overall);
                                    setDrilldown({
                                        open: true,
                                        title: "完整简历排名",
                                        description: `共 ${sorted.length} 份简历，按综合评分从高到低排序`,
                                        resumes: sorted,
                                        accent: "amber",
                                    });
                                }}
                            />

                            {/* 卡片详情展开 */}
                            <AnimatePresence>
                                {selectedCard && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white">
                                                    <Filter className="w-4 h-4 text-rose-500" />
                                                    <span>快捷筛选</span>
                                                    <span className="text-xs font-normal text-gray-500">点击下方按钮可快速应用对应筛选条件</span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCard(null)}
                                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                                >
                                                    收起
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const accentMap: Record<string, "rose" | "amber" | "emerald" | "blue" | "indigo"> = {
                                                            total: "blue", avg: "emerald", top: "amber", median: "indigo", stddev: "indigo", recent: "rose",
                                                        };
                                                        const titleMap: Record<string, string> = {
                                                            total: "全部简历列表", avg: "当前筛选条件下的简历", top: "高评分简历", median: "评分中位数附近简历", stddev: "评分分布简历", recent: "近 7 天新增简历",
                                                        };
                                                        setDrilldown({
                                                            open: true,
                                                            title: titleMap[selectedCard] || "简历列表",
                                                            description: `共 ${filteredResumes.length} 份简历，可搜索、排序后查看明细`,
                                                            resumes: filteredResumes,
                                                            accent: accentMap[selectedCard] || "rose",
                                                        });
                                                    }}
                                                    className="ml-3 flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>查看简历列表</span>
                                                </button>
                                            </div>
                                            {selectedCard === "total" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">简历分级概览</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <button
                                                            onClick={() => { setFilters({ ...filters, scoreRange: [80, 100] }); setSelectedCard(null); }}
                                                            className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                                        >
                                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1">优秀 (80+)</p>
                                                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{stats.scoreDistribution.high}</p>
                                                            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 flex items-center group-hover:underline">
                                                                <Filter className="w-3 h-3 mr-1" />点击筛选
                                                            </p>
                                                        </button>
                                                        <button
                                                            onClick={() => { setFilters({ ...filters, scoreRange: [60, 79] }); setSelectedCard(null); }}
                                                            className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                                        >
                                                            <p className="text-xs text-amber-700 dark:text-amber-300 mb-1">良好 (60-79)</p>
                                                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{stats.scoreDistribution.medium}</p>
                                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 flex items-center group-hover:underline">
                                                                <Filter className="w-3 h-3 mr-1" />点击筛选
                                                            </p>
                                                        </button>
                                                        <button
                                                            onClick={() => { setFilters({ ...filters, scoreRange: [0, 59] }); setSelectedCard(null); }}
                                                            className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20 rounded-xl border border-rose-200 dark:border-rose-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                                        >
                                                            <p className="text-xs text-rose-700 dark:text-rose-300 mb-1">待提升 (&lt;60)</p>
                                                            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">{stats.scoreDistribution.low}</p>
                                                            <p className="text-xs text-rose-600/70 dark:text-rose-400/70 flex items-center group-hover:underline">
                                                                <Filter className="w-3 h-3 mr-1" />点击筛选
                                                            </p>
                                                        </button>
                                                        <button
                                                            onClick={() => { setFilters({ ...filters, scoreRange: [0, 100] }); setSelectedCard(null); }}
                                                            className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/40 dark:to-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
                                                        >
                                                            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">全部</p>
                                                            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalResumes}</p>
                                                            <p className="text-xs text-gray-500 flex items-center group-hover:underline">
                                                                <Filter className="w-3 h-3 mr-1" />清除筛选
                                                            </p>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedCard === "avg" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">评分统计详情</h4>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">平均分</p>
                                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgScore}</p>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">中位数</p>
                                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.medianScore}</p>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">标准差</p>
                                                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.scoreStdDev}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-3">
                                                        平均分与中位数差距 {Math.abs(stats.avgScore - stats.medianScore)} 分，
                                                        {Math.abs(stats.avgScore - stats.medianScore) > 10 ? "评分分布较为分散" : "评分分布较为集中"}
                                                    </p>
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            onClick={() => { const lo = Math.max(0, stats.avgScore - 10); setFilters({ ...filters, scoreRange: [lo, Math.min(100, stats.avgScore + 10)] }); setSelectedCard(null); }}
                                                            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center"
                                                        >
                                                            <Filter className="w-3 h-3 mr-1" />查看平均分±10区间
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedCard === "top" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">最高分简历</h4>
                                                    {filteredResumes
                                                        .filter((r) => r.scores.overall === stats.topScore)
                                                        .slice(0, 3)
                                                        .map((r) => (
                                                            <div key={r.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                                                    {r.basicInfo.name?.[0] || "?"}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{r.basicInfo.name || r.filename}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{r.jobInfo.position || "未指定岗位"}</p>
                                                                </div>
                                                                <span className="px-3 py-1 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                                                    {stats.topScore}分
                                                                </span>
                                                            </div>
                                                        ))}
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={() => { setFilters({ ...filters, scoreRange: [Math.max(0, stats.topScore - 5), 100] }); setSelectedCard(null); }}
                                                            className="px-3 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center"
                                                        >
                                                            <Filter className="w-3 h-3 mr-1" />查看高分简历（{Math.max(0, stats.topScore - 5)}分+）
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {(selectedCard === "median" || selectedCard === "stddev" || selectedCard === "recent") && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">数据洞察</h4>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                        {selectedCard === "median" && (
                                                            <p>中位数为 <strong className="text-gray-900 dark:text-white">{stats.medianScore}分</strong>，表示一半的简历评分高于此值，一半低于此值。{stats.medianScore > stats.avgScore ? "中位数高于平均分，说明高分简历较多。" : "中位数低于平均分，说明存在少量高分拉高了平均值。"}</p>
                                                        )}
                                                        {selectedCard === "stddev" && (
                                                            <p>标准差为 <strong className="text-gray-900 dark:text-white">{stats.scoreStdDev}</strong>，{stats.scoreStdDev < 10 ? "简历质量差异较小，水平较为一致。" : stats.scoreStdDev < 20 ? "简历质量有一定差异。" : "简历质量差异较大，建议关注低分简历。"}</p>
                                                        )}
                                                        {selectedCard === "recent" && (
                                                            <p>近7天新增 <strong className="text-gray-900 dark:text-white">{stats.recentCount}</strong> 份简历，占总数的 {stats.totalResumes > 0 ? ((stats.recentCount / stats.totalResumes) * 100).toFixed(1) : "0"}%。</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {selectedCard === "median" && (
                                                            <button
                                                                onClick={() => { const lo = Math.max(0, stats.medianScore - 10); setFilters({ ...filters, scoreRange: [lo, Math.min(100, stats.medianScore + 10)] }); setSelectedCard(null); }}
                                                                className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center"
                                                            >
                                                                <Filter className="w-3 h-3 mr-1" />查看中位数附近
                                                            </button>
                                                        )}
                                                        {selectedCard === "recent" && (
                                                            <button
                                                                onClick={() => { setTimeRange(7); setSelectedCard(null); }}
                                                                className="px-3 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center"
                                                            >
                                                                <Filter className="w-3 h-3 mr-1" />限定近7天
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 评分分布 - 柱状图/饼图 */}
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <ScoreDistributionPanel resumes={filteredResumes} />

                                {/* 多维度对比 */}
                                <DimensionComparePanel resumes={filteredResumes} />
                            </div>

                            {/* 趋势分析 */}
                            <div className="mb-8">
                                <TrendPanel resumes={filteredResumes} />
                            </div>

                            {/* 技能雷达 + 技能词云 */}
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <SkillRadarPanel resumes={filteredResumes} />
                                <SkillTreemapPanel resumes={filteredResumes} />
                            </div>

                            {/* 技能条 + 学历分布 + 岗位分布 */}
                            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                                <SkillBarPanel stats={stats} maxSkillCount={maxSkillCount} />
                                <DistributionPanel
                                    title="学历分布"
                                    icon={GraduationCap}
                                    iconColor="from-indigo-500 to-purple-600"
                                    distribution={stats.educationDistribution}
                                    total={stats.totalResumes}
                                />
                                <DistributionPanel
                                    title="岗位分布"
                                    icon={Briefcase}
                                    iconColor="from-amber-500 to-orange-600"
                                    distribution={stats.positionDistribution}
                                    total={stats.totalResumes}
                                    maxItems={6}
                                />
                            </div>

                            {/* 百分位数 + 技能组合 */}
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <PercentilePanel resumes={filteredResumes} />
                                <SkillCombinationPanel resumes={filteredResumes} />
                            </div>

                            {/* 评分相关性 + 学历×评分 */}
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <ScoreCorrelationPanel resumes={filteredResumes} />
                                <EducationScorePanel resumes={filteredResumes} />
                            </div>

                            {/* 简历排名 */}
                            <div className="mb-8">
                                <RankingPanel resumes={filteredResumes} />
                            </div>

                            {/* 自定义数据看板 - 多种图表类型 + 数据系列管理 */}
                            <MemoizedCustomDashboard resumes={filteredResumes} stats={stats} />
                        </>
                    )}

                    {/* 全局弹窗：快捷键 + 抽屉 */}
                    <MemoizedShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
                    {drilldown && (
                        <MemoizedResumeDrilldownDrawer
                            isOpen={drilldown.open}
                            onClose={() => setDrilldown(null)}
                            title={drilldown.title}
                            description={drilldown.description}
                            resumes={drilldown.resumes}
                            accentColor={drilldown.accent}
                        />
                    )}
                </motion.div>
            </main>
        </div>
    );
}
