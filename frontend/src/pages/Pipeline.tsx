import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    LineChart as ReLineChart,
    Line,
    ComposedChart,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import {
    Funnel,
    Users,
    FileText,
    Phone,
    UserCheck,
    Handshake,
    Briefcase,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    BarChart3,
    Download,
    Filter,
    Search,
    ChevronDown,
    ChevronLeft,
    X,
    Check,
    Clock,
    AlertCircle,
    Settings,
    MoreVertical,
    Edit,
    Trash2,
    CheckSquare,
    Square,
    Target,
    Award,
    Sparkles,
    Brain,
    Calendar,
    Zap,
    LineChart as LineChartIcon,
    Activity,
    Star,
    Trophy,
    Globe,
    UserPlus,
    Lightbulb,
    AlertTriangle,
    CheckCircle2,
    ArrowUp,
    ArrowDown,
    Megaphone,
    Link2,
    Share2,
    Hash,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { usePipelineStore } from '@/store/pipelineStore';
import {
    Candidate,
    TimeDimension,
    CandidateStatus,
    PipelineStage,
} from '@/types/pipeline';
import {
    formatNumber,
    formatPercentage,
    formatDate,
    formatRelativeTime,
    getStatusLabel,
    getStatusColor,
    exportFunnelData,
    exportFullData,
    filterCandidates,
    paginate,
} from '@/utils/pipeline';

/* ═══════════════ 复用组件：GlassCard ═══════════════ */
const GlassCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl overflow-hidden ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
    </motion.div>
);

/* ═══════════════ 复用组件：背景动画（照抄简历优化建议页面，颜色完全一致） ═══════════════ */
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

/* ═══════════════ 复用组件：粒子场 ═══════════════ */
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
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-orange-500/10 dark:bg-orange-400/10"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
};

/** 阶段图标映射 */
const stageIcons: Record<string, React.ElementType> = {
    FileText,
    Users,
    PenTool: FileText,
    UserCheck,
    Handshake,
    Briefcase,
};

/** 时间维度选项 */
const timeDimensionOptions: { value: TimeDimension; label: string }[] = [
    { value: 'day', label: '日' },
    { value: 'week', label: '周' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季度' },
];

export default function Pipeline() {
    const {
        stages,
        candidates,
        funnelData,
        departmentStats,
        filters,
        permissions,
        selectedStage,
        selectedCandidates,
        loading,
        exporting,
        initialize,
        updateFilters,
        selectStage,
        toggleCandidateSelection,
        toggleSelectAll,
        updateCandidateStatus,
        bulkUpdateStatus,
        refreshTrendData,
    } = usePipelineStore();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
    const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
    const [topTab, setTopTab] = useState<'score' | 'newest' | 'interviewing'>('score');
    const [sourceTab, setSourceTab] = useState<'count' | 'conversion'>('count');
    const [insightFilter, setInsightFilter] = useState<'all' | 'bottleneck' | 'opportunity' | 'success'>('all');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        initialize();
    }, [initialize]);

    /** 最大计数用于漏斗宽度计算 */
    const maxCount = useMemo(() => {
        return Math.max(...stages.map((s) => s.count), 1);
    }, [stages]);

    /** 筛选后的候选人 */
    const filteredCandidates = useMemo(() => {
        return filterCandidates(candidates, selectedStage, searchKeyword);
    }, [candidates, selectedStage, searchKeyword]);

    /** 分页后的候选人 */
    const paginatedCandidates = useMemo(() => {
        return paginate(filteredCandidates, currentPage, pageSize);
    }, [filteredCandidates, currentPage, pageSize]);

    /** 总页数 */
    const totalPages = Math.ceil(filteredCandidates.length / pageSize);

    /** 整体转化率 */
    const overallConversion = useMemo(() => {
        if (stages.length < 2) return 0;
        const first = stages[0].count;
        const last = stages[stages.length - 1].count;
        return first > 0 ? (last / first) * 100 : 0;
    }, [stages]);

    /** 平均招聘周期 */
    const avgHiringDays = useMemo(() => {
        if (funnelData.length === 0) return 0;
        return funnelData.reduce((sum, d) => sum + d.avgDays, 0);
    }, [funnelData]);

    /** 根据时间范围过滤趋势数据 */
    const trendData = useMemo(() => {
        const all = usePipelineStore.getState().trendData;
        return all.slice(-timeRange);
    }, [timeRange]);

    /** Top 候选人（按评分/最新/面试中） */
    const topCandidates = useMemo(() => {
        const sorted = [...candidates];
        if (topTab === 'score') {
            sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        } else if (topTab === 'newest') {
            sorted.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        } else {
            sorted.sort((a, b) => {
                const aInt = a.status === 'interviewing' ? 1 : 0;
                const bInt = b.status === 'interviewing' ? 1 : 0;
                return bInt - aInt;
            });
        }
        return sorted.slice(0, 5);
    }, [candidates, topTab]);

    /** 招聘来源分析（基于候选人 ID 派生渠道） */
    const sourceStats = useMemo(() => {
        const sources = [
            { name: 'BOSS直聘', icon: Briefcase, gradient: 'from-red-500 to-orange-500', bg: 'bg-red-50 dark:bg-red-900/20' },
            { name: '猎聘', icon: Trophy, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { name: 'LinkedIn', icon: Globe, gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { name: '内推', icon: UserPlus, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { name: '官网投递', icon: Megaphone, gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ];
        const totalCount = candidates.length;
        const result = sources.map((s, i) => {
            const ratio = 0.4 - i * 0.06;
            const count = Math.round(totalCount * Math.max(0.08, ratio));
            const hired = Math.round(count * (0.18 - i * 0.02));
            return {
                ...s,
                count,
                hired,
                conversion: count > 0 ? (hired / count) * 100 : 0,
            };
        });
        return result;
    }, [candidates.length]);

    /** 面试官负载分布（基于候选人 index 派生面试官） */
    const interviewerLoad = useMemo(() => {
        const interviewers = ['张明', '李雪', '王芳', '陈刚', '刘洋', '赵琳'];
        const interviewStatuses = ['interviewing', 'offered', 'hired'];
        const load = interviewers.map((name, i) => {
            const interviewing = candidates.filter(
                (c, idx) => idx % interviewers.length === i && interviewStatuses.includes(c.status)
            ).length;
            const pending = candidates.filter(
                (c, idx) => idx % interviewers.length === i && c.status === 'screening'
            ).length;
            return {
                name,
                initials: name.charAt(0),
                interviewing,
                pending,
                total: interviewing + pending,
                gradient: ['from-red-500 to-orange-500', 'from-amber-500 to-yellow-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500', 'from-rose-500 to-red-500'][i],
            };
        });
        return load.sort((a, b) => b.total - a.total);
    }, [candidates]);

    /** AI 智能洞察（从阶段转化率识别瓶颈与机会） */
    const aiInsights = useMemo(() => {
        const insights: Array<{
            type: 'bottleneck' | 'opportunity' | 'success';
            icon: any;
            iconColor: string;
            gradient: string;
            title: string;
            desc: string;
            action: string;
        }> = [];

        stages.slice(1).forEach((stage) => {
            if (stage.conversionRate < 35) {
                insights.push({
                    type: 'bottleneck',
                    icon: AlertTriangle,
                    iconColor: 'text-red-600',
                    gradient: 'from-red-500 to-rose-500',
                    title: `${stage.name}阶段转化偏低（${formatPercentage(stage.conversionRate)}）`,
                    desc: `相比其他阶段流失较多，建议优化${stage.name}流程或候选人匹配度`,
                    action: '查看详情',
                });
            } else if (stage.conversionRate >= 70) {
                insights.push({
                    type: 'success',
                    icon: CheckCircle2,
                    iconColor: 'text-emerald-600',
                    gradient: 'from-emerald-500 to-teal-500',
                    title: `${stage.name}阶段表现优秀（${formatPercentage(stage.conversionRate)}）`,
                    desc: '该阶段筛选标准设置合理，可作为其他阶段的参考',
                    action: '复制策略',
                });
            }
        });

        // 机会型洞察
        const offerStage = stages.find((s) => s.id === 'offer');
        const hiredStage = stages.find((s) => s.id === 'hired');
        if (offerStage && hiredStage && offerStage.count > 0) {
            const acceptRate = (hiredStage.count / offerStage.count) * 100;
            if (acceptRate < 50) {
                insights.push({
                    type: 'opportunity',
                    icon: Lightbulb,
                    iconColor: 'text-amber-600',
                    gradient: 'from-amber-500 to-orange-500',
                    title: `Offer 接受率仅 ${formatPercentage(acceptRate)}`,
                    desc: '建议优化薪酬竞争力、面试体验或 Offer 沟通话术',
                    action: '优化建议',
                });
            }
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: CheckCircle2,
                iconColor: 'text-emerald-600',
                gradient: 'from-emerald-500 to-teal-500',
                title: '所有阶段健康度良好',
                desc: '当前漏斗各阶段表现稳定，可继续保持',
                action: '查看趋势',
            });
        }
        return insights;
    }, [stages]);

    /** 关键指标同比/环比（基于时间范围） */
    const comparisonMetrics = useMemo(() => {
        const currentTotal = trendData.reduce((s, d) => s + d.applied, 0);
        // 模拟环比/同比数据
        const lastPeriod = Math.round(currentTotal * 0.85);
        const samePeriodLastYear = Math.round(currentTotal * 0.72);
        const dMom = lastPeriod > 0 ? ((currentTotal - lastPeriod) / lastPeriod) * 100 : 0;
        const dYoy = samePeriodLastYear > 0 ? ((currentTotal - samePeriodLastYear) / samePeriodLastYear) * 100 : 0;
        return [
            {
                label: '投递量',
                current: currentTotal,
                dMom,
                dYoy,
                icon: FileText,
                gradient: 'from-red-500 to-rose-500',
            },
            {
                label: 'Offer 数',
                current: trendData.reduce((s, d) => s + d.offer, 0),
                dMom: 8.5,
                dYoy: 22.3,
                icon: Handshake,
                gradient: 'from-orange-500 to-amber-500',
            },
            {
                label: '入职数',
                current: trendData.reduce((s, d) => s + d.hired, 0),
                dMom: 15.2,
                dYoy: 35.8,
                icon: UserCheck,
                gradient: 'from-emerald-500 to-teal-500',
            },
            {
                label: '招聘周期',
                current: avgHiringDays,
                dMom: -5.3,
                dYoy: -12.8,
                icon: Clock,
                gradient: 'from-indigo-500 to-purple-500',
                unit: '天',
                isLowerBetter: true,
            },
        ];
    }, [trendData, avgHiringDays]);

    /** 处理时间维度切换 */
    const handleTimeDimensionChange = useCallback((dimension: TimeDimension) => {
        updateFilters({ timeDimension: dimension });
        refreshTrendData(dimension);
    }, [updateFilters, refreshTrendData]);

    /** 处理阶段点击 */
    const handleStageClick = useCallback((stageId: string) => {
        if (selectedStage === stageId) {
            selectStage(null);
        } else {
            selectStage(stageId);
            setCurrentPage(1);
        }
    }, [selectedStage, selectStage]);

    /** 处理导出 */
    const handleExport = useCallback((type: 'funnel' | 'full') => {
        if (type === 'funnel') {
            exportFunnelData(funnelData, candidates, selectedStage);
        } else {
            exportFullData(funnelData, candidates, departmentStats);
        }
        setShowExportMenu(false);
    }, [funnelData, candidates, departmentStats, selectedStage]);

    /** 处理状态更新 */
    const handleStatusUpdate = useCallback((candidateId: string, status: CandidateStatus) => {
        updateCandidateStatus(candidateId, status);
        setShowStatusDropdown(null);
    }, [updateCandidateStatus]);

    /** 处理批量更新 */
    const handleBulkUpdate = useCallback((status: CandidateStatus) => {
        bulkUpdateStatus(status);
    }, [bulkUpdateStatus]);

    /** 获取阶段名称 */
    const getStageName = (stageId: string): string => {
        const stage = stages.find(s => s.id === stageId);
        return stage?.name || stageId;
    };

    if (loading) {
        return (
            <div className="min-h-screen relative">
                <AnimatedBackground />
                <ParticleField />
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                    <BackButton />
                    <div className="flex items-center justify-center h-96">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full"
                        />
                    </div>
                </main>
            </div>
        );
    }

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
                    {/* ═══════════════ Hero 区域 — 照抄 Analyze 页面风格，主题色改为红/橙 ═══════════════ */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-3xl shadow-2xl shadow-red-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Funnel className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4"
                        >
                            招聘
                            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                                漏斗分析
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-3"
                        >
                            可视化招聘流程，深度分析各阶段转化率
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                            className="text-sm sm:text-base text-red-600 dark:text-red-400 font-medium"
                        >
                            智能洞察招聘瓶颈，提升人才转化效率
                        </motion.p>

                        {/* 快捷筛选 + 导出 + 配置 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55, duration: 0.6 }}
                            className="flex flex-wrap items-center justify-center gap-3 mt-8"
                        >
                            {/* 时间维度筛选 */}
                            <div className="flex items-center backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-lg">
                                {timeDimensionOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleTimeDimensionChange(option.value)}
                                        className={`px-4 py-2.5 text-sm font-semibold transition-all ${
                                            filters.timeDimension === option.value
                                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* 导出按钮 */}
                            {permissions.canExportData && (
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="font-semibold">导出</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {showExportMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-white/30 dark:border-gray-700/30 z-50 overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => handleExport('funnel')}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    导出漏斗数据
                                                </button>
                                                <button
                                                    onClick={() => handleExport('full')}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    导出全量数据
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* 配置按钮（仅管理员） */}
                            {permissions.canConfigureStages && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-semibold">配置</span>
                                </motion.button>
                            )}
                        </motion.div>
                    </div>

                    {/* ═══════════════ 统计卡片 — GlassCard 风格，红/橙主题 ═══════════════ */}
                    <div className="grid lg:grid-cols-4 gap-6 mb-8">
                        {[
                            {
                                icon: FileText,
                                label: '总投递数',
                                value: formatNumber(stages[0]?.count || 0),
                                trend: '+12%',
                                trendUp: true,
                                gradient: 'from-red-500 to-rose-600',
                                bgGlow: 'bg-red-100 dark:bg-red-900/30',
                                iconColor: 'text-red-600 dark:text-red-400',
                                delay: 0.1,
                            },
                            {
                                icon: Handshake,
                                label: '入职人数',
                                value: formatNumber(stages[stages.length - 1]?.count || 0),
                                trend: '+8%',
                                trendUp: true,
                                gradient: 'from-orange-500 to-amber-600',
                                bgGlow: 'bg-orange-100 dark:bg-orange-900/30',
                                iconColor: 'text-orange-600 dark:text-orange-400',
                                delay: 0.2,
                            },
                            {
                                icon: Target,
                                label: '整体转化率',
                                value: formatPercentage(overallConversion),
                                trend: '+3.2%',
                                trendUp: true,
                                gradient: 'from-amber-500 to-yellow-600',
                                bgGlow: 'bg-amber-100 dark:bg-amber-900/30',
                                iconColor: 'text-amber-600 dark:text-amber-400',
                                delay: 0.3,
                            },
                            {
                                icon: Clock,
                                label: '平均招聘周期',
                                value: `${avgHiringDays}天`,
                                trend: '-2天',
                                trendUp: false,
                                gradient: 'from-rose-500 to-pink-600',
                                bgGlow: 'bg-rose-100 dark:bg-rose-900/30',
                                iconColor: 'text-rose-600 dark:text-rose-400',
                                delay: 0.4,
                            },
                        ].map((card) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: card.delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -4 }}
                                className="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 overflow-hidden cursor-default"
                            >
                                {/* 顶部渐变装饰线 */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${card.gradient} group-hover:w-3/4 transition-all duration-500 rounded-full`} />

                                {/* 背景光晕 */}
                                <div className={`absolute -top-12 -right-12 w-32 h-32 ${card.bgGlow} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 text-sm font-semibold ${card.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {card.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            <span>{card.trend}</span>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ═══════════════ 漏斗图 + 阶段转化概览 2:1 网格 ═══════════════ */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* 漏斗图（2/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                        招聘漏斗
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">点击任一阶段查看候选人详情</p>
                                </div>
                                {selectedStage && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectStage(null)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        清除筛选
                                    </motion.button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {stages.map((stage, index) => {
                                    const Icon = stageIcons[stage.icon] || FileText;
                                    const widthPercentage = (stage.count / maxCount) * 100;
                                    const isSelected = selectedStage === stage.id;
                                    const prevStage = index > 0 ? stages[index - 1] : null;
                                    const dropOff = prevStage ? prevStage.count - stage.count : 0;

                                    return (
                                        <motion.div
                                            key={stage.id}
                                            className={`group relative flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 ring-2 ring-red-400/50'
                                                    : 'hover:bg-white/60 dark:hover:bg-gray-700/30'
                                            }`}
                                            onClick={() => handleStageClick(stage.id)}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="w-32 flex-shrink-0">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className={`w-9 h-9 ${stage.bgColor} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                        <Icon className={`w-4.5 h-4.5 ${stage.color}`} />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-sm text-gray-900 dark:text-white block">
                                                            {stage.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatPercentage((stage.count / (stages[0]?.count || 1)) * 100)} 占比
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative">
                                                <div className="h-11 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl overflow-hidden relative">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${widthPercentage}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                        className={`h-full ${stage.bgColor} rounded-xl flex items-center justify-end px-4 relative overflow-hidden`}
                                                    >
                                                        {/* 内部高光 */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
                                                        <span className={`font-bold ${stage.color} relative z-10`}>
                                                            {formatNumber(stage.count)}
                                                        </span>
                                                    </motion.div>
                                                </div>
                                                {/* 悬停详情 */}
                                                <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="absolute right-0 -top-9 bg-gray-900/95 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-10">
                                                        <div>留存：{formatNumber(stage.count)}</div>
                                                        {dropOff > 0 && <div className="text-red-300">流失：{formatNumber(dropOff)}</div>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-24 flex-shrink-0 text-right">
                                                {index > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center space-x-1">
                                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className={`font-bold text-sm ${stage.conversionRate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : stage.conversionRate >= 25 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {formatPercentage(stage.conversionRate)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">阶段转化</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                                                        起点
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 阶段转化概览侧边栏（1/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-orange-500" />
                                    阶段洞察
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">每阶段转化健康度</p>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {stages.slice(1).map((stage, i) => {
                                    const rate = stage.conversionRate;
                                    const health = rate >= 60 ? '优' : rate >= 30 ? '良' : '差';
                                    const healthColor = rate >= 60 ? 'from-emerald-500 to-teal-500' : rate >= 30 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';
                                    const healthBg = rate >= 60 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : rate >= 30 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                                    return (
                                        <motion.div
                                            key={stage.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.08 }}
                                            className="group p-3 rounded-2xl bg-white/50 dark:bg-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${healthBg}`}>{health}</span>
                                            </div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(rate)}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(stage.count)} 人</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, rate)}%` }}
                                                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                                                    className={`h-full bg-gradient-to-r ${healthColor} rounded-full`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="mt-5 pt-5 border-t border-gray-200/60 dark:border-gray-700/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">整体转化</span>
                                    <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">{formatPercentage(overallConversion)}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ═══════════════ 趋势图 + 招聘效率 2:1 网格 ═══════════════ */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* 趋势图（2/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-8"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                        招聘趋势
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {chartType === 'line' ? '投递 / Offer 折线对比' : chartType === 'bar' ? '各阶段数量柱状对比' : '投递与 Offer 时间序列'}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* 图表类型切换 */}
                                    <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl">
                                        {[
                                            { type: 'line' as const, icon: LineChartIcon, label: '折线' },
                                            { type: 'bar' as const, icon: BarChart3, label: '柱状' },
                                            { type: 'area' as const, icon: Activity, label: '面积' },
                                        ].map((t) => (
                                            <motion.button
                                                key={t.type}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setChartType(t.type)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                    chartType === t.type
                                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/30'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                                                }`}
                                            >
                                                <t.icon className="w-3.5 h-3.5" />
                                                {t.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                    {/* 时间范围快捷切换 */}
                                    <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl">
                                        {[
                                            { range: 7, label: '7天' },
                                            { range: 30, label: '30天' },
                                            { range: 90, label: '90天' },
                                        ].map((r) => (
                                            <motion.button
                                                key={r.range}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTimeRange(r.range as 7 | 30 | 90)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                    timeRange === r.range
                                                        ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-red-600'
                                                }`}
                                            >
                                                {r.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-xs">
                                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5" />投递</span>
                                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-1.5" />Offer</span>
                                {chartType === 'bar' && (
                                    <>
                                        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-1.5" />面试</span>
                                        <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5" />入职</span>
                                    </>
                                )}
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <ReLineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                                }}
                                            />
                                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: '1px solid rgba(229,231,235,0.8)',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    padding: '10px 14px',
                                                }}
                                                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="applied"
                                                name="投递"
                                                stroke="#EF4444"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                                                activeDot={{ r: 7, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="offer"
                                                name="Offer"
                                                stroke="#F97316"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
                                                activeDot={{ r: 7, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </ReLineChart>
                                    ) : chartType === 'bar' ? (
                                        <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBarApplied" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#F87171" stopOpacity={0.6} />
                                                </linearGradient>
                                                <linearGradient id="colorBarInterview" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.6} />
                                                </linearGradient>
                                                <linearGradient id="colorBarOffer" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#FB923C" stopOpacity={0.6} />
                                                </linearGradient>
                                                <linearGradient id="colorBarHired" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                                }}
                                            />
                                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: '1px solid rgba(229,231,235,0.8)',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    padding: '10px 14px',
                                                }}
                                                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                            />
                                            <Bar dataKey="applied" name="投递" fill="url(#colorBarApplied)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="interview" name="面试" fill="url(#colorBarInterview)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="offer" name="Offer" fill="url(#colorBarOffer)" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="hired" name="入职" fill="url(#colorBarHired)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorPipelineApplied" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPipelineOffer" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value);
                                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                                }}
                                            />
                                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: '1px solid rgba(229,231,235,0.8)',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                                    padding: '10px 14px',
                                                }}
                                                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="applied"
                                                name="投递"
                                                stroke="#EF4444"
                                                fillOpacity={1}
                                                fill="url(#colorPipelineApplied)"
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="offer"
                                                name="Offer"
                                                stroke="#F97316"
                                                fillOpacity={1}
                                                fill="url(#colorPipelineOffer)"
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                            {/* 趋势数据汇总 */}
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {[
                                    {
                                        label: '累计投递',
                                        value: trendData.reduce((s, d) => s + d.applied, 0),
                                        color: 'from-red-500 to-rose-500',
                                    },
                                    {
                                        label: '累计面试',
                                        value: trendData.reduce((s, d) => s + d.interview, 0),
                                        color: 'from-amber-500 to-orange-500',
                                    },
                                    {
                                        label: '累计入职',
                                        value: trendData.reduce((s, d) => s + d.hired, 0),
                                        color: 'from-emerald-500 to-teal-500',
                                    },
                                ].map((s) => (
                                    <div key={s.label} className="p-2.5 bg-white/40 dark:bg-gray-700/30 rounded-xl">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{s.label}</div>
                                        <div className={`text-lg font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                                            {formatNumber(s.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 招聘效率分析（1/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    招聘效率
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">关键效率指标</p>
                            </div>
                            <div className="space-y-4 flex-1">
                                {[
                                    {
                                        icon: Clock,
                                        label: '平均筛选周期',
                                        value: `${avgHiringDays}天`,
                                        gradient: 'from-red-500 to-rose-600',
                                        ratio: 25,
                                    },
                                    {
                                        icon: Users,
                                        label: '面试转化率',
                                        value: formatPercentage(
                                            ((stages.find((s) => s.id === 'interview')?.count || 0) /
                                                (stages.find((s) => s.id === 'screening')?.count || 1)) *
                                                100
                                        ),
                                        gradient: 'from-orange-500 to-amber-600',
                                        ratio: 60,
                                    },
                                    {
                                        icon: UserCheck,
                                        label: 'Offer 接受率',
                                        value: formatPercentage(
                                            ((stages.find((s) => s.id === 'hired')?.count || 0) /
                                                (stages.find((s) => s.id === 'offer')?.count || 1)) *
                                                100
                                        ),
                                        gradient: 'from-emerald-500 to-teal-600',
                                        ratio: 80,
                                    },
                                    {
                                        icon: TrendingUp,
                                        label: '本月新增',
                                        value: `${stages[0]?.count > 0 ? Math.round(stages[0].count * 0.35) : 0}人`,
                                        gradient: 'from-indigo-500 to-purple-600',
                                        ratio: 35,
                                    },
                                ].map((metric, i) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        whileHover={{ x: 2 }}
                                    >
                                        <div className="flex items-center space-x-3 mb-1.5">
                                            <div className={`w-9 h-9 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                                                <metric.icon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                                        </div>
                                        <div className="ml-12">
                                            <span className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                                            <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${metric.ratio}%` }}
                                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                                                    className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-5 pt-5 border-t border-gray-200/60 dark:border-gray-700/30">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">招聘完成率</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {stages[0]?.count > 0
                                            ? formatPercentage(
                                                  ((stages[stages.length - 1]?.count || 0) / stages[0].count) * 100
                                              )
                                            : '0%'}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${
                                                Math.min(
                                                    100,
                                                    ((stages[stages.length - 1]?.count || 0) /
                                                        (stages[0]?.count || 1)) *
                                                        100
                                                )
                                            }%`,
                                        }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3),transparent)]" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ═══════════════ 部门招聘情况（全宽 GlassCard） ═══════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-8 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                    部门招聘情况
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">各部门投递 / Offer / 入职对比</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-1.5" />投递</span>
                                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-1.5" />Offer</span>
                                <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-1.5" />入职</span>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentStats} layout="vertical" barCategoryGap={8}>
                                    <defs>
                                        <linearGradient id="colorPipelineAppliedBar" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#EF4444" />
                                            <stop offset="100%" stopColor="#F87171" />
                                        </linearGradient>
                                        <linearGradient id="colorPipelineOfferBar" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#F97316" />
                                            <stop offset="100%" stopColor="#FB923C" />
                                        </linearGradient>
                                        <linearGradient id="colorPipelineHiredBar" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#F59E0B" />
                                            <stop offset="100%" stopColor="#FBBF24" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="department"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            border: '1px solid rgba(229,231,235,0.8)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            padding: '10px 14px',
                                        }}
                                        labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                                    />
                                    <Bar dataKey="applied" name="投递" fill="url(#colorPipelineAppliedBar)" radius={[0, 6, 6, 0]} />
                                    <Bar dataKey="offer" name="Offer" fill="url(#colorPipelineOfferBar)" radius={[0, 6, 6, 0]} />
                                    <Bar dataKey="hired" name="入职" fill="url(#colorPipelineHiredBar)" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* 候选人列表（下钻） */}
                    <AnimatePresence>
                        {selectedStage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl mb-8 overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/30 bg-gradient-to-r from-red-50/50 via-orange-50/30 to-amber-50/30 dark:from-red-900/10 dark:via-orange-900/10 dark:to-amber-900/10">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <motion.button
                                                whileHover={{ x: -2, scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => selectStage(null)}
                                                className="p-2 hover:bg-white/60 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                            </motion.button>
                                            <div className="w-1.5 h-10 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {getStageName(selectedStage)}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">- 候选人列表</span>
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    共 {filteredCandidates.length} 人
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* 搜索框 */}
                                            <div className="relative group">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={searchKeyword}
                                                    onChange={(e) => {
                                                        setSearchKeyword(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    placeholder="搜索候选人..."
                                                    className="pl-10 pr-4 py-2 bg-white/60 dark:bg-gray-700/50 backdrop-blur border border-gray-200/60 dark:border-gray-600/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/60 w-64 transition-all"
                                                />
                                            </div>

                                            {/* 批量操作 */}
                                            {permissions.canBulkUpdate && selectedCandidates.size > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30"
                                                >
                                                    <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                                                        已选 {selectedCandidates.size} 人
                                                    </span>
                                                    <select
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleBulkUpdate(e.target.value as CandidateStatus);
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="px-2 py-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>批量操作</option>
                                                        <option value="screening">移至筛选</option>
                                                        <option value="interviewing">移至面试</option>
                                                        <option value="offered">发Offer</option>
                                                        <option value="hired">标记入职</option>
                                                        <option value="rejected">标记拒绝</option>
                                                    </select>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 候选人表格 */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/60 dark:bg-gray-700/30 border-b border-gray-200/60 dark:border-gray-700/30">
                                            <tr>
                                                {permissions.canBulkUpdate && (
                                                    <th className="px-6 py-3 text-left">
                                                        <button
                                                            onClick={() => toggleSelectAll(selectedCandidates.size < filteredCandidates.length)}
                                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                        >
                                                            {selectedCandidates.size === filteredCandidates.length ? (
                                                                <CheckSquare className="w-5 h-5 text-red-600" />
                                                            ) : (
                                                                <Square className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    候选人
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    职位
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    部门
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    状态
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    评分
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    投递时间
                                                </th>
                                                {permissions.canEditCandidates && (
                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                        操作
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100/60 dark:divide-gray-700/30">
                                            {paginatedCandidates.map((candidate, idx) => {
                                                const score = candidate.score || 0;
                                                const scoreColor = score >= 80 ? 'from-emerald-500 to-teal-500' : score >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';
                                                const avatarGradient = idx % 3 === 0 ? 'from-red-500 to-orange-500' : idx % 3 === 1 ? 'from-orange-500 to-amber-500' : 'from-rose-500 to-pink-500';
                                                return (
                                                <motion.tr
                                                    key={candidate.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="group hover:bg-gradient-to-r hover:from-red-50/30 hover:to-orange-50/30 dark:hover:from-red-900/10 dark:hover:to-orange-900/10 transition-colors"
                                                >
                                                    {permissions.canBulkUpdate && (
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => toggleCandidateSelection(candidate.id)}
                                                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                {selectedCandidates.has(candidate.id) ? (
                                                                    <CheckSquare className="w-5 h-5 text-red-600" />
                                                                ) : (
                                                                    <Square className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                                {candidate.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                    {candidate.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {candidate.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {candidate.position}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {candidate.department}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                                                            {getStatusLabel(candidate.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 min-w-[100px]">
                                                            <div className="flex-1 h-1.5 bg-gray-200/80 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${score}%` }}
                                                                    transition={{ duration: 0.6, delay: idx * 0.03 }}
                                                                    className={`h-full bg-gradient-to-r ${scoreColor} rounded-full`}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-bold min-w-[28px] text-right ${
                                                                score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                                                score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                                                                'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {candidate.score || '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {formatRelativeTime(candidate.appliedAt)}
                                                    </td>
                                                    {permissions.canEditCandidates && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="relative inline-block">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => setShowStatusDropdown(
                                                                        showStatusDropdown === candidate.id ? null : candidate.id
                                                                    )}
                                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                >
                                                                    <MoreVertical className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                                                                </motion.button>

                                                                <AnimatePresence>
                                                                    {showStatusDropdown === candidate.id && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-white/40 dark:border-gray-700/40 z-50 overflow-hidden"
                                                                        >
                                                                            <div className="py-1">
                                                                                {['screening', 'interviewing', 'offered', 'hired', 'rejected'].map((status) => (
                                                                                    <button
                                                                                        key={status}
                                                                                        onClick={() => handleStatusUpdate(candidate.id, status as CandidateStatus)}
                                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 transition-colors"
                                                                                    >
                                                                                        移至{getStatusLabel(status)}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </td>
                                                    )}
                                                </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 分页 */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/30 bg-gray-50/40 dark:bg-gray-800/20">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredCandidates.length)} 条，共 {filteredCandidates.length} 条
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1.5 text-sm border border-gray-200/60 dark:border-gray-700/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-all"
                                                >
                                                    上一页
                                                </motion.button>
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const page = i + 1;
                                                    const isActive = currentPage === page;
                                                    return (
                                                        <motion.button
                                                            key={page}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                                                isActive
                                                                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-500/30'
                                                                    : 'border border-gray-200/60 dark:border-gray-700/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800'
                                                            }`}
                                                        >
                                                            {page}
                                                        </motion.button>
                                                    );
                                                })}
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1.5 text-sm border border-gray-200/60 dark:border-gray-700/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-all"
                                                >
                                                    下一页
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ═══════════════ AI 智能洞察 + 关键指标同环比 ═══════════════ */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* AI 智能洞察（2/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.48, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-8"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
                                            <Brain className="w-4 h-4 text-white" />
                                        </div>
                                        AI 智能洞察
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">基于漏斗数据自动识别的优化建议</p>
                                </div>
                                <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl text-xs">
                                    {[
                                        { key: 'all' as const, label: '全部' },
                                        { key: 'bottleneck' as const, label: '瓶颈' },
                                        { key: 'opportunity' as const, label: '机会' },
                                        { key: 'success' as const, label: '亮点' },
                                    ].map((f) => (
                                        <button
                                            key={f.key}
                                            onClick={() => setInsightFilter(f.key)}
                                            className={`px-3 py-1.5 font-medium rounded-lg transition-all ${
                                                insightFilter === f.key
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-300 hover:text-red-600'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {aiInsights
                                    .filter((i) => insightFilter === 'all' || i.type === insightFilter)
                                    .map((insight, i) => {
                                        const Icon = insight.icon;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.08 }}
                                                whileHover={{ x: 4 }}
                                                className="group p-4 rounded-2xl bg-white/60 dark:bg-gray-700/30 border border-gray-100/60 dark:border-gray-700/30 hover:shadow-lg transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${insight.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{insight.title}</h3>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                                                insight.type === 'bottleneck'
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                    : insight.type === 'opportunity'
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            }`}>
                                                                {insight.type === 'bottleneck' ? '瓶颈' : insight.type === 'opportunity' ? '机会' : '亮点'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{insight.desc}</p>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ x: 2 }}
                                                        className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    >
                                                        {insight.action}
                                                        <ArrowRight className="w-3 h-3" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </div>
                        </motion.div>

                        {/* 关键指标同环比（1/3） */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.52, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Activity className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    关键指标
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">同环比对比</p>
                            </div>
                            <div className="space-y-3 flex-1">
                                {comparisonMetrics.map((m, i) => {
                                    const Icon = m.icon;
                                    const isPositive = m.isLowerBetter ? m.dMom < 0 : m.dMom > 0;
                                    return (
                                        <motion.div
                                            key={m.label}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.55 + i * 0.08 }}
                                            className="p-3 rounded-2xl bg-white/50 dark:bg-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-sm`}>
                                                        <Icon className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.label}</span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {m.current}{m.unit || ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className={`flex items-center px-1.5 py-0.5 rounded-md font-medium ${
                                                    isPositive
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                }`}>
                                                    {m.dMom > 0 ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
                                                    {Math.abs(m.dMom).toFixed(1)}%
                                                </span>
                                                <span className="text-gray-400">环比</span>
                                                <span className="text-gray-300">|</span>
                                                <span className={`flex items-center px-1.5 py-0.5 rounded-md font-medium ${
                                                    (m.isLowerBetter ? m.dYoy < 0 : m.dYoy > 0)
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                }`}>
                                                    {m.dYoy > 0 ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
                                                    {Math.abs(m.dYoy).toFixed(1)}%
                                                </span>
                                                <span className="text-gray-400">同比</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* ═══════════════ Top 候选人 + 招聘来源 + 面试官负载 3 列 ═══════════════ */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* Top 候选人排行榜 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Trophy className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    Top 候选人
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">综合表现突出的候选人</p>
                            </div>
                            <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl text-xs mb-4">
                                {[
                                    { key: 'score' as const, label: '高评分' },
                                    { key: 'newest' as const, label: '最新' },
                                    { key: 'interviewing' as const, label: '面试中' },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTopTab(t.key)}
                                        className={`px-3 py-1.5 font-medium rounded-lg transition-all ${
                                            topTab === t.key
                                                ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-red-600'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2.5 flex-1">
                                {topCandidates.map((c, i) => {
                                    const gradients = ['from-red-500 to-orange-500', 'from-amber-500 to-yellow-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500'];
                                    return (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + i * 0.06 }}
                                            whileHover={{ x: 4 }}
                                            className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white/50 dark:bg-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                    {c.name.charAt(0)}
                                                </div>
                                                {i < 3 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                                        {i + 1}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                    {c.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {c.position} · {c.department}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {topTab === 'score' && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{c.score || '-'}</span>
                                                    </div>
                                                )}
                                                {topTab === 'newest' && (
                                                    <span className="text-xs text-gray-500">{formatRelativeTime(c.appliedAt)}</span>
                                                )}
                                                {topTab === 'interviewing' && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                                                        {getStatusLabel(c.status)}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 招聘来源分析 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                            <Share2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        招聘来源
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">渠道转化效率</p>
                                </div>
                                <div className="inline-flex p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-lg text-xs">
                                    <button
                                        onClick={() => setSourceTab('count')}
                                        className={`px-2 py-1 rounded-md transition-all ${
                                            sourceTab === 'count' ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm' : 'text-gray-600'
                                        }`}
                                    >
                                        数量
                                    </button>
                                    <button
                                        onClick={() => setSourceTab('conversion')}
                                        className={`px-2 py-1 rounded-md transition-all ${
                                            sourceTab === 'conversion' ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm' : 'text-gray-600'
                                        }`}
                                    >
                                        转化
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2.5 flex-1">
                                {sourceStats
                                    .sort((a, b) => (sourceTab === 'count' ? b.count - a.count : b.conversion - a.conversion))
                                    .map((s, i) => {
                                        const Icon = s.icon;
                                        const maxValue = sourceTab === 'count'
                                            ? Math.max(...sourceStats.map(x => x.count))
                                            : Math.max(...sourceStats.map(x => x.conversion));
                                        const current = sourceTab === 'count' ? s.count : s.conversion;
                                        const ratio = maxValue > 0 ? (current / maxValue) * 100 : 0;
                                        return (
                                            <motion.div
                                                key={s.name}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.65 + i * 0.06 }}
                                                className="group"
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                                                            <Icon className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {sourceTab === 'count' ? `${s.count}人` : formatPercentage(s.conversion)}
                                                        </span>
                                                        {sourceTab === 'count' && (
                                                            <span className="text-xs text-gray-500 ml-1.5">入职 {s.hired}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${ratio}%` }}
                                                        transition={{ duration: 0.8, delay: 0.7 + i * 0.06 }}
                                                        className={`h-full bg-gradient-to-r ${s.gradient} rounded-full`}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </div>
                        </motion.div>

                        {/* 面试官负载分布 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl p-6 flex flex-col"
                        >
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <Hash className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    面试官负载
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">负载均衡情况</p>
                            </div>
                            <div className="space-y-3 flex-1">
                                {interviewerLoad.slice(0, 6).map((p, i) => {
                                    const max = Math.max(...interviewerLoad.map(x => x.total), 1);
                                    const ratio = (p.total / max) * 100;
                                    return (
                                        <motion.div
                                            key={p.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 + i * 0.06 }}
                                            className="group"
                                        >
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                    {p.initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{p.total}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        面试 {p.interviewing} · 待面 {p.pending}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden ml-11">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ratio}%` }}
                                                    transition={{ duration: 0.8, delay: 0.75 + i * 0.06 }}
                                                    className={`h-full bg-gradient-to-r ${p.gradient} rounded-full`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* 部门详情表格 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/5 dark:shadow-black/20 rounded-3xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/30">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                                部门招聘详情
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">各阶段转化率与平均周期</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/60 dark:bg-gray-700/30 border-b border-gray-200/60 dark:border-gray-700/30">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            部门
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            投递
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            筛选
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            面试
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Offer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            入职
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            转化率
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            平均周期
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/60 dark:divide-gray-700/30">
                                    {departmentStats.map((dept, idx) => (
                                        <motion.tr
                                            key={dept.department}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.55 + idx * 0.05 }}
                                            className="hover:bg-gradient-to-r hover:from-red-50/30 hover:to-orange-50/30 dark:hover:from-red-900/10 dark:hover:to-orange-900/10 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {dept.department.charAt(0)}
                                                    </div>
                                                    <span className="ml-3 font-semibold text-gray-900 dark:text-white">
                                                        {dept.department}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {dept.applied}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {dept.screening}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {dept.interview}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {dept.offer}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {dept.hired}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-gray-200/80 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, dept.conversionRate)}%` }}
                                                            transition={{ duration: 0.8, delay: 0.6 + idx * 0.05 }}
                                                            className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[42px]">
                                                        {formatPercentage(dept.conversionRate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {dept.avgDays}天
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}