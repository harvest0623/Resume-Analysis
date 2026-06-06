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
        trendData,
        departmentStats,
        filters,
        userRole,
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <BackButton />
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </main>
            </div>
        );
    }

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
                    {/* 页面标题 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                招聘漏斗
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                可视化招聘流程，分析各阶段转化率
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* 时间维度筛选 */}
                            <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {timeDimensionOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleTimeDimensionChange(option.value)}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                                            filters.timeDimension === option.value
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* 导出按钮 */}
                            {permissions.canExportData && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowExportMenu(!showExportMenu)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>导出</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    <AnimatePresence>
                                        {showExportMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                            >
                                                <button
                                                    onClick={() => handleExport('funnel')}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl"
                                                >
                                                    导出漏斗数据
                                                </button>
                                                <button
                                                    onClick={() => handleExport('full')}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-xl"
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
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    <span>配置</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className="grid lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stages[0]?.count || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">总投递数</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Handshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>+8%</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stages[stages.length - 1]?.count || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">入职人数</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                    <Funnel className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatPercentage(overallConversion)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">整体转化率</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                                    <TrendingDown className="w-4 h-4" />
                                    <span>-2天</span>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {avgHiringDays}天
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">平均招聘周期</p>
                        </motion.div>
                    </div>

                    {/* 漏斗图 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                招聘漏斗
                            </h2>
                            {selectedStage && (
                                <button
                                    onClick={() => selectStage(null)}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                    清除筛选
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {stages.map((stage, index) => {
                                const Icon = stageIcons[stage.icon] || FileText;
                                const widthPercentage = (stage.count / maxCount) * 100;
                                const isSelected = selectedStage === stage.id;

                                return (
                                    <motion.div
                                        key={stage.id}
                                        className={`flex items-center space-x-6 p-4 rounded-xl cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                        onClick={() => handleStageClick(stage.id)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="w-36 flex-shrink-0">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 ${stage.bgColor} rounded-lg flex items-center justify-center`}>
                                                    <Icon className={`w-5 h-5 ${stage.color}`} />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white block">
                                                        {stage.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatPercentage((stage.count / (stages[0]?.count || 1)) * 100)} 占比
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${widthPercentage}%` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className={`h-full ${stage.bgColor} rounded-lg flex items-center justify-end pr-4`}
                                                >
                                                    <span className={`font-bold ${stage.color}`}>
                                                        {formatNumber(stage.count)}
                                                    </span>
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="w-28 flex-shrink-0 text-right">
                                            {index > 0 && (
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center space-x-1">
                                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {formatPercentage(stage.conversionRate)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        转化率
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* 图表区域 */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* 趋势图 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                招聘趋势
                            </h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOffer" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="applied"
                                            name="投递"
                                            stroke="#3B82F6"
                                            fillOpacity={1}
                                            fill="url(#colorApplied)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="offer"
                                            name="Offer"
                                            stroke="#10B981"
                                            fillOpacity={1}
                                            fill="url(#colorOffer)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* 部门统计 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                部门招聘情况
                            </h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentStats} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                        <YAxis
                                            type="category"
                                            dataKey="department"
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            width={80}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="applied" name="投递" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="offer" name="Offer" fill="#10B981" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="hired" name="入职" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* 候选人列表（下钻） */}
                    <AnimatePresence>
                        {selectedStage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => selectStage(null)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {getStageName(selectedStage)} - 候选人列表
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    共 {filteredCandidates.length} 人
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* 搜索框 */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchKeyword}
                                                    onChange={(e) => {
                                                        setSearchKeyword(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    placeholder="搜索候选人..."
                                                    className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                                />
                                            </div>

                                            {/* 批量操作 */}
                                            {permissions.canBulkUpdate && selectedCandidates.size > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">
                                                        已选 {selectedCandidates.size} 人
                                                    </span>
                                                    <select
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleBulkUpdate(e.target.value as CandidateStatus);
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>批量操作</option>
                                                        <option value="screening">移至筛选</option>
                                                        <option value="interviewing">移至面试</option>
                                                        <option value="offered">发Offer</option>
                                                        <option value="hired">标记入职</option>
                                                        <option value="rejected">标记拒绝</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 候选人表格 */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                {permissions.canBulkUpdate && (
                                                    <th className="px-6 py-3 text-left">
                                                        <button
                                                            onClick={() => toggleSelectAll(selectedCandidates.size < filteredCandidates.length)}
                                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {selectedCandidates.size === filteredCandidates.length ? (
                                                                <CheckSquare className="w-5 h-5" />
                                                            ) : (
                                                                <Square className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    候选人
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    职位
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    部门
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    状态
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    评分
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    投递时间
                                                </th>
                                                {permissions.canEditCandidates && (
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        操作
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {paginatedCandidates.map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    {permissions.canBulkUpdate && (
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => toggleCandidateSelection(candidate.id)}
                                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                            >
                                                                {selectedCandidates.has(candidate.id) ? (
                                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                                ) : (
                                                                    <Square className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {candidate.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {candidate.email}
                                                            </p>
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
                                                        <div className="flex items-center">
                                                            <span className={`text-sm font-medium ${
                                                                (candidate.score || 0) >= 80 ? 'text-emerald-600' :
                                                                (candidate.score || 0) >= 60 ? 'text-amber-600' :
                                                                'text-red-600'
                                                            }`}>
                                                                {candidate.score || '-'}
                                                            </span>
                                                            {(candidate.score || 0) >= 80 && (
                                                                <span className="ml-1 text-xs text-emerald-600">优秀</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {formatRelativeTime(candidate.appliedAt)}
                                                    </td>
                                                    {permissions.canEditCandidates && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setShowStatusDropdown(
                                                                        showStatusDropdown === candidate.id ? null : candidate.id
                                                                    )}
                                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                                >
                                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {showStatusDropdown === candidate.id && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                                                        >
                                                                            <div className="py-1">
                                                                                {['screening', 'interviewing', 'offered', 'hired', 'rejected'].map((status) => (
                                                                                    <button
                                                                                        key={status}
                                                                                        onClick={() => handleStatusUpdate(candidate.id, status as CandidateStatus)}
                                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 分页 */}
                                {totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredCandidates.length)} 条，共 {filteredCandidates.length} 条
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    上一页
                                                </button>
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-1 text-sm rounded-lg ${
                                                                currentPage === page
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    下一页
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 部门详情表格 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                部门招聘详情
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            部门
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            投递
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            筛选
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            面试
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Offer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            入职
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            转化率
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            平均周期
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {departmentStats.map((dept) => (
                                        <tr key={dept.department} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        {dept.department.charAt(0)}
                                                    </div>
                                                    <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                                        {dept.department}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
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
                                                <div className="flex items-center">
                                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${Math.min(100, dept.conversionRate)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {formatPercentage(dept.conversionRate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {dept.avgDays}天
                                            </td>
                                        </tr>
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
