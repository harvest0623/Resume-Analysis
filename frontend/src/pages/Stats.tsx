import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
            <PanelHeader title="技能词云分布" icon={Target} iconColor="from-pink-500 to-rose-600" />
            <div className="h-56">
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

// ========== 主页面 ==========

export default function Stats() {
    const [isLoading, setIsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(0); // 0 = all
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* 页面标题和工具栏 */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                数据统计
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                查看简历分析的整体数据概览
                                {lastRefreshTime && (
                                    <span className="text-sm text-gray-400 dark:text-gray-500 ml-3">
                                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                                        更新于 {lastRefreshTime.toLocaleTimeString()}
                                    </span>
                                )}
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
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">加载中...</p>
                            </div>
                        </div>
                    ) : filteredResumes.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {timeRange > 0 ? "该时间范围内暂无数据" : "暂无数据"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {timeRange > 0 ? "请尝试扩大时间范围或上传更多简历" : "请先上传并分析一些简历"}
                            </p>
                            {timeRange > 0 && (
                                <button
                                    onClick={() => setTimeRange(0)}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    查看全部数据
                                </button>
                            )}
                        </div>
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

                            {/* 卡片详情展开 */}
                            <AnimatePresence>
                                {selectedCard && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                                            {selectedCard === "total" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">简历总数详情</h4>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">优秀 (80+)</p>
                                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.scoreDistribution.high}</p>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">良好 (60-79)</p>
                                                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.scoreDistribution.medium}</p>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">待提升 (&lt;60)</p>
                                                            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.scoreDistribution.low}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedCard === "avg" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">评分统计详情</h4>
                                                    <div className="grid grid-cols-3 gap-4">
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
                                                </div>
                                            )}
                                            {selectedCard === "top" && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">最高分简历</h4>
                                                    {filteredResumes
                                                        .filter((r) => r.scores.overall === stats.topScore)
                                                        .map((r) => (
                                                            <div key={r.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                                                    {r.basicInfo.name?.[0] || "?"}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white">{r.basicInfo.name || r.filename}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{r.jobInfo.position || "未指定岗位"}</p>
                                                                </div>
                                                                <span className="ml-auto px-3 py-1 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-700">
                                                                    {stats.topScore}分
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                            {(selectedCard === "median" || selectedCard === "stddev" || selectedCard === "recent") && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {selectedCard === "median" && (
                                                        <p>中位数为 <strong className="text-gray-900 dark:text-white">{stats.medianScore}分</strong>，表示一半的简历评分高于此值，一半低于此值。{stats.medianScore > stats.avgScore ? "中位数高于平均分，说明高分简历较多。" : "中位数低于平均分，说明存在少量高分拉高了平均值。"}</p>
                                                    )}
                                                    {selectedCard === "stddev" && (
                                                        <p>标准差为 <strong className="text-gray-900 dark:text-white">{stats.scoreStdDev}</strong>，{stats.scoreStdDev < 10 ? "简历质量差异较小，水平较为一致。" : stats.scoreStdDev < 20 ? "简历质量有一定差异。" : "简历质量差异较大，建议关注低分简历。"}</p>
                                                    )}
                                                    {selectedCard === "recent" && (
                                                        <p>近7天新增 <strong className="text-gray-900 dark:text-white">{stats.recentCount}</strong> 份简历，占总数的 {((stats.recentCount / stats.totalResumes) * 100).toFixed(1)}%。</p>
                                                    )}
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
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
