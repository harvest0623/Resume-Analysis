import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    FileText,
    FileSpreadsheet,
    File,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    Users,
    BarChart3,
    Briefcase,
    Settings,
    History,
    Save,
    Trash2,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    FolderOpen,
    Copy,
    Zap,
    Search,
    RefreshCw,
    Eye,
    Package,
    Timer,
    Star,
    TrendingUp,
    PieChart,
    ArrowRight,
    Sparkles,
    Layers,
    Sliders,
    Bell,
    Mail,
    Archive,
    MoreHorizontal,
    GripVertical,
    ChevronRight,
    Info,
    HelpCircle,
    Maximize2,
    Minimize2,
    Share2,
    Printer,
    FileDown,
    Database,
    Activity,
    Award,
    Shield,
    Globe,
    Brain,
    Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { useResumeStore } from "@/store/resumeStore";
import {
    ExportFormat,
    ExportConfig,
    ExportHistoryItem,
    ExportTemplate,
    EXPORT_FIELDS,
    exportData,
    getExportHistory,
    addToExportHistory,
    clearExportHistory,
    getExportTemplates,
    saveExportTemplate,
    deleteExportTemplate,
    generateFilename,
} from "@/utils/export";

// 导出选项类型
interface ExportOption {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    glow?: string;
    format: string;
    category: string;
    popular?: boolean;
    new?: boolean;
}

// 定时任务类型
interface ScheduleTask {
    id: string;
    name: string;
    cron: string;
    enabled: boolean;
}

// 邮件订阅类型
interface EmailSubscription {
    id: string;
    email: string;
    frequency: string;
}

/* ───────── 动画背景 — 完全照抄简历分析页面（P1）写法 ───────── */
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
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    rotate: [360, 180, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, 60, 0],
                    y: [0, -80, 0],
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-blue-400/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

// 导出选项数据 - 增强版
const exportOptions: ExportOption[] = [
    {
        id: "resume-report",
        title: "简历分析报告",
        description: "导出单份简历的详细分析报告，包含评分、技能分析、优劣势评估等",
        icon: FileText,
        color: "blue",
        gradient: "from-blue-500 via-blue-600 to-indigo-600",
        glow: "glow-cyan",
        format: "PDF",
        category: "分析报告",
        popular: true,
    },
    {
        id: "candidate-list",
        title: "候选人列表",
        description: "导出所有候选人的基本信息、评分数据和联系方式",
        icon: Users,
        color: "emerald",
        gradient: "from-emerald-500 via-emerald-600 to-teal-600",
        glow: "glow-cyan",
        format: "Excel",
        category: "数据导出",
        popular: true,
    },
    {
        id: "comparison-report",
        title: "对比分析报告",
        description: "导出简历对比分析的结果，包含优劣势分析和推荐建议",
        icon: BarChart3,
        color: "purple",
        gradient: "from-purple-500 via-purple-600 to-violet-600",
        glow: "glow-purple",
        format: "PDF",
        category: "分析报告",
    },
    {
        id: "job-report",
        title: "职位招聘报告",
        description: "导出各职位的招聘数据、转化率分析和渠道效果",
        icon: Briefcase,
        color: "amber",
        gradient: "from-amber-500 via-orange-500 to-red-500",
        glow: "glow-pink",
        format: "PDF",
        category: "统计报告",
    },
    {
        id: "interview-schedule",
        title: "面试安排表",
        description: "导出面试安排的详细日程表，包含面试官和地点信息",
        icon: Calendar,
        color: "pink",
        gradient: "from-pink-500 via-rose-500 to-red-500",
        glow: "glow-pink",
        format: "Excel",
        category: "日程管理",
    },
    {
        id: "statistical-data",
        title: "统计数据",
        description: "导出所有招聘数据的统计分析，支持自定义维度",
        icon: PieChart,
        color: "indigo",
        gradient: "from-indigo-500 via-blue-500 to-cyan-500",
        glow: "glow-indigo",
        format: "CSV",
        category: "数据导出",
        new: true,
    },
    {
        id: "talent-pool",
        title: "人才库导出",
        description: "导出人才库中的候选人信息，支持标签筛选",
        icon: Database,
        color: "teal",
        gradient: "from-teal-500 via-cyan-500 to-blue-500",
        glow: "glow-cyan",
        format: "Excel",
        category: "数据导出",
        new: true,
    },
    {
        id: "analytics-dashboard",
        title: "分析仪表盘",
        description: "导出可视化的招聘分析仪表盘，包含图表和趋势",
        icon: TrendingUp,
        color: "rose",
        gradient: "from-rose-500 via-pink-500 to-purple-500",
        glow: "glow-pink",
        format: "PDF",
        category: "分析报告",
    },
];

// 日期范围选项
const DATE_RANGE_OPTIONS = [
    { value: 'all', label: '全部数据', icon: Layers },
    { value: 'week', label: '最近一周', icon: Clock },
    { value: 'month', label: '最近一月', icon: Calendar },
    { value: 'quarter', label: '最近一季', icon: BarChart3 },
    { value: 'year', label: '最近一年', icon: TrendingUp },
];

// 文件名模板选项
const FILENAME_TEMPLATES = [
    { value: '简历数据_{date}', label: '简历数据_日期', example: '简历数据_20240315' },
    { value: '候选人报告_{date}', label: '候选人报告_日期', example: '候选人报告_20240315' },
    { value: '招聘分析_{timestamp}', label: '招聘分析_时间戳', example: '招聘分析_20240315_143000' },
    { value: 'export_{date}', label: 'export_日期', example: 'export_20240315' },
    { value: 'Report_{date}_{time}', label: 'Report_日期_时间', example: 'Report_20240315_1430' },
];

// 分类选项
const CATEGORIES = [
    { id: 'all', label: '全部', icon: Layers },
    { id: '分析报告', label: '分析报告', icon: FileText },
    { id: '数据导出', label: '数据导出', icon: Database },
    { id: '统计报告', label: '统计报告', icon: BarChart3 },
    { id: '日程管理', label: '日程管理', icon: Calendar },
];

// 统计卡片数据
const STATS_CARDS = [
    { label: '总导出次数', value: 128, icon: Download, color: 'blue', trend: '+12%' },
    { label: '本月导出', value: 24, icon: Calendar, color: 'emerald', trend: '+8%' },
    { label: '常用格式', value: 'Excel', icon: FileSpreadsheet, color: 'amber', trend: '' },
    { label: '平均大小', value: '2.4MB', icon: File, color: 'purple', trend: '-5%' },
];

export default function Export() {
    const { resumes } = useResumeStore();
    
    // 状态管理
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showStats, setShowStats] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // 导出配置状态
    const [config, setConfig] = useState<ExportConfig>({
        format: 'xlsx',
        filename: '简历数据_{date}',
        dateRange: 'all',
        selectedFields: ['name', 'position', 'education', 'workYears', 'overallScore'],
        includeHeader: true,
        customTitle: '简历分析报告',
    });
    
    // UI 状态
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [history, setHistory] = useState<ExportHistoryItem[]>([]);
    const [templates, setTemplates] = useState<ExportTemplate[]>([]);
    const [customFilename, setCustomFilename] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(1);

    // 高级功能 state
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
    const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newTask, setNewTask] = useState<{ name: string; frequency: string; time: string; format: ExportFormat }>({
        name: '',
        frequency: 'daily',
        time: '09:00',
        format: 'xlsx',
    });

    // 弹窗与安全 state
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [watermark, setWatermark] = useState({ enabled: true, text: '简历分析系统' });
    const [security, setSecurity] = useState({ password: '', encryption: 'aes-256' });

    // 加载历史记录和模板
    useEffect(() => {
        setHistory(getExportHistory());
        setTemplates(getExportTemplates());
    }, []);
    
    // 过滤选项
    const filteredOptions = useMemo(() => {
        let filtered = exportOptions;
        
        // 按分类过滤
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(opt => opt.category === selectedCategory);
        }
        
        // 按搜索词过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(opt => 
                opt.title.toLowerCase().includes(query) ||
                opt.description.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }, [selectedCategory, searchQuery]);
    
    // 过滤数据根据日期范围
    const getFilteredResumes = useCallback(() => {
        if (config.dateRange === 'all') return resumes;
        
        const now = new Date();
        const ranges: Record<string, number> = {
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365,
        };
        
        const days = ranges[config.dateRange] || 0;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        return resumes.filter(r => new Date(r.uploadedAt) >= cutoff);
    }, [resumes, config.dateRange]);
    
    // 处理字段选择
    const toggleField = (fieldId: string) => {
        setConfig(prev => ({
            ...prev,
            selectedFields: prev.selectedFields.includes(fieldId)
                ? prev.selectedFields.filter(f => f !== fieldId)
                : [...prev.selectedFields, fieldId],
        }));
    };
    
    // 全选/取消全选某类别字段
    const toggleCategory = (category: string) => {
        const categoryFields = EXPORT_FIELDS.filter(f => f.category === category).map(f => f.id);
        const allSelected = categoryFields.every(f => config.selectedFields.includes(f));
        
        setConfig(prev => ({
            ...prev,
            selectedFields: allSelected
                ? prev.selectedFields.filter(f => !categoryFields.includes(f))
                : [...new Set([...prev.selectedFields, ...categoryFields])],
        }));
    };
    
    // 快速导出处理
    const handleQuickExport = (optionId: string) => {
        setSelectedOption(optionId);
        setIsExporting(true);
        
        const option = exportOptions.find(o => o.id === optionId);
        if (option) {
            const formatMap: Record<string, ExportFormat> = {
                'PDF': 'pdf',
                'Excel': 'xlsx',
                'CSV': 'csv',
            };
            setConfig(prev => ({
                ...prev,
                format: formatMap[option.format] || 'xlsx',
            }));
        }
        
        // 模拟导出进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                clearInterval(interval);
                setIsExporting(false);
                setExportResult({ success: true, message: `${option?.title} 导出成功！` });
                setTimeout(() => setExportResult(null), 3000);
            }
        }, 500);
    };
    
    // 完整导出功能
    const handleExport = async () => {
        const filteredResumes = getFilteredResumes();
        
        if (filteredResumes.length === 0) {
            setExportResult({ success: false, message: '没有可导出的数据' });
            return;
        }
        
        if (config.selectedFields.length === 0) {
            setExportResult({ success: false, message: '请至少选择一个导出字段' });
            return;
        }
        
        setIsExporting(true);
        setExportProgress(0);
        setExportResult(null);
        
        const progressInterval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);
        
        try {
            const result = await exportData(filteredResumes, config);
            
            clearInterval(progressInterval);
            setExportProgress(100);
            
            const historyItem: ExportHistoryItem = {
                id: Date.now().toString(),
                name: result.filename,
                format: config.format,
                date: new Date().toLocaleString('zh-CN'),
                size: result.size,
                status: 'completed',
            };
            addToExportHistory(historyItem);
            setHistory(getExportHistory());
            
            setExportResult({ success: true, message: `导出成功！文件: ${result.filename}` });
        } catch (error) {
            clearInterval(progressInterval);
            setExportResult({ success: false, message: (error as Error).message });
        } finally {
            setIsExporting(false);
            setTimeout(() => {
                setExportProgress(0);
            }, 2000);
        }
    };
    
    // 保存模板
    const handleSaveTemplate = () => {
        if (!templateName.trim()) return;
        
        const template: ExportTemplate = {
            id: Date.now().toString(),
            name: templateName,
            config: {
                format: config.format,
                dateRange: config.dateRange,
                selectedFields: config.selectedFields,
                includeHeader: config.includeHeader,
                customTitle: config.customTitle,
            },
            createdAt: new Date().toLocaleString('zh-CN'),
        };
        
        saveExportTemplate(template);
        setTemplates(getExportTemplates());
        setTemplateName('');
        setShowTemplates(true);
        setExportResult({ success: true, message: '模板保存成功！' });
        setTimeout(() => setExportResult(null), 2000);
    };
    
    // 加载模板
    const loadTemplate = (template: ExportTemplate) => {
        setConfig(prev => ({
            ...prev,
            ...template.config,
        }));
        setShowTemplates(false);
        setExportResult({ success: true, message: `已加载模板: ${template.name}` });
        setTimeout(() => setExportResult(null), 2000);
    };

    // 高级功能处理函数
    const addScheduleTask = () => {
        if (!newTask.name.trim()) return;
        const freqMap: Record<string, string> = { daily: '每天', weekly: '每周', monthly: '每月' };
        const task: ScheduleTask = {
            id: `task-${Date.now()}`,
            name: newTask.name,
            cron: `${freqMap[newTask.frequency] || '每天'} ${newTask.time}（${newTask.format.toUpperCase()}）`,
            enabled: true,
        };
        setScheduleTasks(prev => [task, ...prev]);
        setNewTask({ name: '', frequency: 'daily', time: '09:00', format: 'xlsx' });
        setShowScheduleModal(false);
    };

    const removeScheduleTask = (id: string) => {
        setScheduleTasks(prev => prev.filter(t => t.id !== id));
    };

    const addEmailSubscription = () => {
        if (!newEmail.trim()) return;
        const sub: EmailSubscription = {
            id: `sub-${Date.now()}`,
            email: newEmail,
            frequency: '每周推送',
        };
        setEmailSubscriptions(prev => [sub, ...prev]);
        setNewEmail('');
    };

    const removeEmailSubscription = (id: string) => {
        setEmailSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    // 按类别分组字段
    const fieldsByCategory = EXPORT_FIELDS.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, typeof EXPORT_FIELDS>);
    
    const filteredCount = getFilteredResumes().length;

    return (
        <div className={`min-h-screen relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            <AnimatedBackground />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />

                {/* ──────── Hero — 完全照抄简历分析页面（P1）写法 ──────── */}
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
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <FileDown className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                报告导出中心
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            智能导出各类招聘数据报告与分析结果
                            <br className="hidden sm:block" />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">支持多格式、多维度、模板化管理</span>
                        </motion.p>
                    </div>

                    {/* 快捷统计 — P3 首页图标风格小标签 */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-3 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {STATS_CARDS.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    className="flex items-center space-x-3 px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl cursor-default transition-all duration-300"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white text-base leading-tight">{stat.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    </div>
                                    {stat.trend && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            stat.trend.startsWith('+')
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {stat.trend}
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* 快捷操作 */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="group inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {showStats ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                            {showStats ? '收起统计' : '展开统计'}
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="inline-flex items-center px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                            {isFullscreen ? '退出全屏' : '全屏模式'}
                        </button>
                    </motion.div>
                </motion.div>
                
                {/* 搜索和过滤栏 — 玻璃态现代风 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-black/20">
                        {/* 顶部装饰条 */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                        <div className="p-5">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* 搜索框 */}
                                <div className="flex-1 relative group">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-focus-within:scale-110 transition-transform duration-300">
                                        <Search className="w-4 h-4 text-white" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="搜索导出类型、格式或分类..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-16 pr-12 py-3.5 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-600/60 rounded-lg transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* 分类过滤 */}
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1">
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        return (
                                            <motion.button
                                                key={cat.id}
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                                                    selectedCategory === cat.id
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-white/60 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-600/40'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{cat.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 过滤结果统计 */}
                            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>共 <span className="font-bold text-blue-600 dark:text-blue-400">{filteredOptions.length}</span> 个导出类型</span>
                                </div>
                                {(searchQuery || selectedCategory !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                        }}
                                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
                                    >
                                        清除筛选
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                {/* 导出选项卡片网格 — 图标样式参照首页（P2） */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch mb-8">
                    {filteredOptions.map((option, index) => {
                        const Icon = option.icon;
                        const isSelected = selectedOption === option.id;

                        return (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                whileTap={{ scale: 0.98 }}
                                className={`group h-full ${isSelected ? "ring-4 ring-blue-500/30 rounded-3xl" : ""}`}
                            >
                                <div
                                    className="relative card-3d glass-card rounded-3xl p-7 h-full flex flex-col overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedOption(option.id)}
                                >
                                    {/* 悬浮渐变覆盖层 */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-500 rounded-3xl`} />

                                    {/* 顶部渐变装饰线 */}
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${option.gradient} group-hover:w-3/4 transition-all duration-500 rounded-full`} />

                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* 图标 — P2 首页风格 */}
                                        <motion.div
                                            className={`w-14 h-14 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${option.glow || ''}`}
                                            whileHover={{ rotate: [0, -8, 8, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Icon className="w-7 h-7 text-white" />
                                        </motion.div>

                                        {/* 标签（热门 / 新 / 格式） */}
                                        <div className="flex gap-2 mb-3 -mt-1 flex-wrap">
                                            {option.popular && (
                                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5" />
                                                    热门
                                                </span>
                                            )}
                                            {option.new && (
                                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    新
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded-full">
                                                {option.format}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                            {option.title}
                                        </h3>

                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 flex-grow line-clamp-2">
                                            {option.description}
                                        </p>

                                        {/* 操作区 */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickExport(option.id);
                                                }}
                                                disabled={isExporting && selectedOption === option.id}
                                                className={`group/btn inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                    isExporting && selectedOption === option.id
                                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
                                                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                }`}
                                            >
                                                {isExporting && selectedOption === option.id ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                        导出中
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3.5 h-3.5 mr-1.5" />
                                                        {isSelected ? "已选中" : "快速导出"}
                                                    </>
                                                )}
                                            </button>

                                            <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                查看详情
                                                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 选中状态指示器 */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md"
                                        >
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                {/* 空状态 */}
                {filteredOptions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">未找到匹配的导出类型</h3>
                        <p className="text-gray-500 dark:text-gray-400">尝试调整搜索条件或选择其他分类</p>
                    </motion.div>
                )}

                {/* ──────── 数据洞察模块 — 新增（数据可视化） ──────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-10"
                >
                    {/* 标题区 */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <PieChart className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">数据洞察</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">实时分析导出数据，辅助决策</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span>实时更新</span>
                        </div>
                    </div>

                    {/* 顶部 4 个数据卡片 */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: Database, label: '总数据量', value: resumes.length, suffix: '条', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+12%' },
                            { icon: Star, label: '平均评分', value: resumes.length > 0 ? Math.round((resumes.reduce((s, r) => s + (r.scores?.overall || 0), 0) / resumes.length) * 10) / 10 : 0, suffix: '分', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', trend: '+0.3' },
                            { icon: Activity, label: '本月导出', value: history.length || 24, suffix: '次', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', trend: '+18%' },
                            { icon: TrendingUp, label: '增长率', value: 24.6, suffix: '%', color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '+5.2%' },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08 }}
                                    whileHover={{ y: -4 }}
                                    className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-5 shadow-lg shadow-gray-900/5 dark:shadow-black/20 cursor-default"
                                >
                                    {/* 装饰背景 */}
                                    <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-xl`} />
                                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color}`} />

                                    <div className="relative flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                            stat.trend.startsWith('+')
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {stat.trend}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">{stat.suffix}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* 图表区：导出格式分布 + 导出趋势 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 导出格式分布 - 环形图 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                    导出格式分布
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">近 30 天</span>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* SVG 环形图 */}
                                <div className="relative w-36 h-36 flex-shrink-0">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const data = [
                                                { label: 'PDF', value: 45, color: '#ef4444' },
                                                { label: 'Excel', value: 35, color: '#10b981' },
                                                { label: 'CSV', value: 20, color: '#3b82f6' },
                                            ];
                                            const radius = 35;
                                            const circumference = 2 * Math.PI * radius;
                                            let offset = 0;
                                            return data.map((d, i) => {
                                                const length = (d.value / 100) * circumference;
                                                const el = (
                                                    <motion.circle
                                                        key={i}
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        fill="none"
                                                        stroke={d.color}
                                                        strokeWidth="14"
                                                        strokeDasharray={`${length} ${circumference - length}`}
                                                        strokeDashoffset={-offset}
                                                        initial={{ strokeDasharray: `0 ${circumference}` }}
                                                        animate={{ strokeDasharray: `${length} ${circumference - length}` }}
                                                        transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                                                    />
                                                );
                                                offset += length;
                                                return el;
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">128</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">总导出</div>
                                    </div>
                                </div>

                                {/* 图例 */}
                                <div className="flex-1 space-y-2.5">
                                    {[
                                        { label: 'PDF 报告', value: 45, color: 'bg-red-500', count: 58 },
                                        { label: 'Excel 表格', value: 35, color: 'bg-emerald-500', count: 45 },
                                        { label: 'CSV 数据', value: 20, color: 'bg-blue-500', count: 25 },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}%</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.value}%` }}
                                                        transition={{ duration: 0.8, delay: 0.6 }}
                                                        className={`h-full ${item.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* 导出趋势 - 折线/柱状图 */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    导出趋势
                                </h3>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400" />
                                        <span className="text-gray-500 dark:text-gray-400">本周</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-sm bg-gradient-to-t from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600" />
                                        <span className="text-gray-500 dark:text-gray-400">上周</span>
                                    </div>
                                </div>
                            </div>

                            {/* SVG 柱状图 */}
                            <div className="h-40 flex items-end gap-2 mt-2">
                                {(() => {
                                    const data = [
                                        { day: '一', current: 60, last: 40 },
                                        { day: '二', current: 80, last: 55 },
                                        { day: '三', current: 45, last: 50 },
                                        { day: '四', current: 90, last: 70 },
                                        { day: '五', current: 70, last: 60 },
                                        { day: '六', current: 50, last: 35 },
                                        { day: '日', current: 75, last: 45 },
                                    ];
                                    return data.map((d, i) => (
                                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                                            <div className="w-full flex items-end justify-center gap-0.5 h-32">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${d.last}%` }}
                                                    transition={{ duration: 0.6, delay: 0.7 + i * 0.05 }}
                                                    className="w-1/2 bg-gradient-to-t from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600 rounded-t-md"
                                                />
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${d.current}%` }}
                                                    transition={{ duration: 0.6, delay: 0.8 + i * 0.05 }}
                                                    className="w-1/2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md shadow-sm"
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{d.day}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* 自定义导出区域 - 增强版 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Sliders className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">自定义导出</h2>
                            <p className="text-gray-500 dark:text-gray-400">精细控制导出内容，满足个性化需求</p>
                        </div>
                    </div>
                    
                    {/* 步骤指示器 */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center gap-4">
                            {[
                                { step: 1, label: '选择格式' },
                                { step: 2, label: '设置范围' },
                                { step: 3, label: '选择字段' },
                                { step: 4, label: '导出' },
                            ].map((item, index) => (
                                <div key={item.step} className="flex items-center">
                                    <button
                                        onClick={() => setActiveStep(item.step)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                            activeStep === item.step
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : activeStep > item.step
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                        }`}
                                    >
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                            activeStep === item.step
                                                ? 'bg-white text-blue-500'
                                                : activeStep > item.step
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            {activeStep > item.step ? '✓' : item.step}
                                        </span>
                                        <span className="text-sm font-medium hidden sm:block">{item.label}</span>
                                    </button>
                                    {index < 3 && (
                                        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* 左侧：配置区 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 步骤 1: 格式选择 */}
                            <AnimatePresence mode="wait">
                                {activeStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <File className="w-5 h-5 text-blue-500" />
                                                选择导出格式
                                            </h3>
                                            <button
                                                onClick={() => setActiveStep(2)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                                            >
                                                下一步
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { 
                                                    id: 'xlsx' as ExportFormat, 
                                                    name: 'Excel', 
                                                    icon: FileSpreadsheet, 
                                                    color: 'from-emerald-500 to-emerald-600',
                                                    desc: '适合数据分析和二次处理',
                                                    features: ['支持多Sheet', '数据透视表', '公式计算'],
                                                    size: '约 50KB/100条'
                                                },
                                                { 
                                                    id: 'csv' as ExportFormat, 
                                                    name: 'CSV', 
                                                    icon: File, 
                                                    color: 'from-blue-500 to-blue-600',
                                                    desc: '通用格式，兼容性最好',
                                                    features: ['纯文本格式', '体积最小', '通用兼容'],
                                                    size: '约 20KB/100条'
                                                },
                                                { 
                                                    id: 'pdf' as ExportFormat, 
                                                    name: 'PDF', 
                                                    icon: FileText, 
                                                    color: 'from-red-500 to-red-600',
                                                    desc: '适合打印和分享',
                                                    features: ['固定排版', '防篡改', '专业外观'],
                                                    size: '约 100KB/100条'
                                                },
                                            ].map(format => {
                                                const Icon = format.icon;
                                                const isSelected = config.format === format.id;
                                                return (
                                                    <motion.button
                                                        key={format.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setConfig(prev => ({ ...prev, format: format.id }))}
                                                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                                                            isSelected
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="absolute top-3 right-3"
                                                            >
                                                                <CheckCircle className="w-6 h-6 text-blue-500" />
                                                            </motion.div>
                                                        )}
                                                        
                                                        <div className={`w-14 h-14 bg-gradient-to-br ${format.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                                            <Icon className="w-7 h-7 text-white" />
                                                        </div>
                                                        
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{format.name}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{format.desc}</p>
                                                        
                                                        <div className="space-y-2">
                                                            {format.features.map(feature => (
                                                                <div key={feature} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                                    <span>{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{format.size}</span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* 步骤 2: 数据范围 */}
                                {activeStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setActiveStep(1)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                                </button>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-purple-500" />
                                                    选择数据范围
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => setActiveStep(3)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                                            >
                                                下一步
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {DATE_RANGE_OPTIONS.map(option => {
                                                const Icon = option.icon;
                                                return (
                                                    <motion.button
                                                        key={option.value}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setConfig(prev => ({ ...prev, dateRange: option.value }))}
                                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                                                            config.dateRange === option.value
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                        }`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                            config.dateRange === option.value
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                        }`}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                        <span className={`text-sm font-medium ${
                                                            config.dateRange === option.value
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {option.label}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Info className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                        当前可导出 <span className="font-bold">{filteredCount}</span> 条数据
                                                    </p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        选择的范围将自动过滤数据
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* 步骤 3: 字段选择 */}
                                {activeStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setActiveStep(2)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                                >
                                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                                </button>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Filter className="w-5 h-5 text-green-500" />
                                                    选择导出字段
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    已选 <span className="font-semibold text-blue-500">{config.selectedFields.length}</span> 项
                                                </span>
                                                <button
                                                    onClick={() => setActiveStep(4)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                                                >
                                                    下一步
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                            {Object.entries(fieldsByCategory).map(([category, fields]) => {
                                                const allSelected = fields.every(f => config.selectedFields.includes(f.id));
                                                const someSelected = fields.some(f => config.selectedFields.includes(f.id));
                                                
                                                return (
                                                    <motion.div
                                                        key={category}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                <Layers className="w-4 h-4" />
                                                                {category}
                                                            </h4>
                                                            <button
                                                                onClick={() => toggleCategory(category)}
                                                                className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                                                                    allSelected
                                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {allSelected ? '取消全选' : '全选'}
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {fields.map(field => (
                                                                <motion.button
                                                                    key={field.id}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => toggleField(field.id)}
                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                                                        config.selectedFields.includes(field.id)
                                                                            ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                    }`}
                                                                >
                                                                    {config.selectedFields.includes(field.id) && (
                                                                        <CheckCircle className="w-3 h-3" />
                                                                    )}
                                                                    {field.label}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* 步骤 4: 高级设置 */}
                                {activeStep === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        {/* 文件命名 */}
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setActiveStep(3)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                                    >
                                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                                    </button>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Settings className="w-5 h-5 text-gray-500" />
                                                        高级设置
                                                    </h3>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {/* 文件命名规则 */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                        文件命名规则
                                                    </label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {FILENAME_TEMPLATES.map(template => (
                                                            <label
                                                                key={template.value}
                                                                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                                    config.filename === template.value && !customFilename
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="filename"
                                                                    checked={config.filename === template.value && !customFilename}
                                                                    onChange={() => {
                                                                        setConfig(prev => ({ ...prev, filename: template.value }));
                                                                        setCustomFilename(false);
                                                                    }}
                                                                    className="mt-1 mr-3"
                                                                />
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{template.label}</span>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">示例: {template.example}</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                        
                                                        {/* 自定义文件名 */}
                                                        <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                            customFilename
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                        }`}>
                                                            <input
                                                                type="radio"
                                                                name="filename"
                                                                checked={customFilename}
                                                                onChange={() => setCustomFilename(true)}
                                                                className="mt-1 mr-3"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">自定义命名</span>
                                                                <input
                                                                    type="text"
                                                                    value={customFilename ? config.filename : ''}
                                                                    onChange={(e) => setConfig(prev => ({ ...prev, filename: e.target.value }))}
                                                                    placeholder="输入自定义文件名"
                                                                    className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 text-sm"
                                                                    onClick={() => setCustomFilename(true)}
                                                                />
                                                            </div>
                                                        </label>
                                                    </div>
                                                    
                                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                            <HelpCircle className="w-4 h-4" />
                                                            支持变量: {'{date}'} (日期), {'{time}'} (时间), {'{timestamp}'} (完整时间戳)
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* PDF 专用设置 */}
                                                {config.format === 'pdf' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            PDF 报告标题
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={config.customTitle || ''}
                                                            onChange={(e) => setConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                                                            placeholder="输入报告标题"
                                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* 保存模板 */}
                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <Save className="w-4 h-4" />
                                                        保存为模板
                                                    </h4>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            value={templateName}
                                                            onChange={(e) => setTemplateName(e.target.value)}
                                                            placeholder="输入模板名称"
                                                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                                                        />
                                                        <button
                                                            onClick={handleSaveTemplate}
                                                            disabled={!templateName.trim()}
                                                            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            保存
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* 右侧：操作区 - 增强版 */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* 导出按钮卡片 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4"
                            >
                                {/* 导出图标 */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        animate={{ 
                                            rotate: isExporting ? 360 : 0,
                                            scale: isExporting ? [1, 1.1, 1] : 1
                                        }}
                                        transition={{ 
                                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 1, repeat: Infinity }
                                        }}
                                        className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25"
                                    >
                                        <Download className="w-12 h-12 text-white" />
                                    </motion.div>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        准备导出
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold text-blue-500 text-lg">{filteredCount}</span> 条数据
                                    </p>
                                    
                                    {/* 格式标签 */}
                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                        {config.format === 'xlsx' && <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                                        {config.format === 'csv' && <File className="w-4 h-4 text-blue-500" />}
                                        {config.format === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {config.format.toUpperCase()} 格式
                                        </span>
                                    </div>
                                </div>
                                
                                {/* 进度条 */}
                                <AnimatePresence>
                                    {isExporting && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">导出进度</span>
                                                <span className="text-sm font-semibold text-blue-500">{Math.round(exportProgress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${exportProgress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                正在处理数据，请稍候...
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* 导出结果提示 */}
                                <AnimatePresence>
                                    {exportResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
                                                exportResult.success
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                            }`}
                                        >
                                            {exportResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            )}
                                            <p className={`text-sm ${
                                                exportResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                            }`}>
                                                {exportResult.message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                
                                {/* 主导出按钮 */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleExport}
                                    disabled={isExporting || filteredCount === 0}
                                    className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                                        isExporting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : filteredCount === 0
                                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/25 active:shadow-md'
                                    }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            导出中...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-6 h-6" />
                                            开始导出
                                        </>
                                    )}
                                </motion.button>
                                
                                {/* 快捷操作按钮 */}
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2">
                                        <Eye className="w-5 h-5 text-gray-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">预览</span>
                                    </button>
                                    <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2">
                                        <Share2 className="w-5 h-5 text-gray-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">分享</span>
                                    </button>
                                    <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2">
                                        <Printer className="w-5 h-5 text-gray-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">打印</span>
                                    </button>
                                    <button className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-2">
                                        <Archive className="w-5 h-5 text-gray-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">归档</span>
                                    </button>
                                </div>
                                
                                {/* 数据统计 */}
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">导出统计</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">总数据量</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{resumes.length} 条</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">选中字段</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{config.selectedFields.length} 项</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">导出格式</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{config.format.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            
                            {/* 模板管理 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FolderOpen className="w-5 h-5 text-amber-500" />
                                        导出模板
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
                                            {templates.length}
                                        </span>
                                        {showTemplates ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {showTemplates && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-4">
                                                {templates.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无保存的模板</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">在高级设置中保存模板</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                        {templates.map(template => (
                                                            <motion.div
                                                                key={template.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {template.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {template.createdAt}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => loadTemplate(template)}
                                                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                        title="使用模板"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            deleteExportTemplate(template.id);
                                                                            setTemplates(getExportTemplates());
                                                                        }}
                                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                        title="删除模板"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            
                            {/* 导出历史 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <History className="w-5 h-5 text-purple-500" />
                                        导出历史
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {history.length > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearExportHistory();
                                                    setHistory([]);
                                                }}
                                                className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                清空
                                            </button>
                                        )}
                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                                            {history.length}
                                        </span>
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {showHistory && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-4">
                                                {history.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无导出记录</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">导出后将在这里显示</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                        {history.map((item, index) => (
                                                            <motion.div
                                                                key={item.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                {item.format === 'xlsx' ? (
                                                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                                                        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                                                                    </div>
                                                                ) : item.format === 'csv' ? (
                                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                                        <File className="w-5 h-5 text-blue-500" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                                                        <FileText className="w-5 h-5 text-red-500" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {item.date} · {item.size}
                                                                    </p>
                                                                </div>
                                                                {item.status === 'completed' ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ──────── 高级功能模块 — 新增（定时调度 + 分享） ──────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mb-10"
                >
                    {/* 标题区 */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">高级功能</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">定时任务、邮件订阅、协作分享</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 定时任务 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-violet-500" />
                                    定时任务
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium rounded-full">
                                    {scheduleTasks.length} 个任务
                                </span>
                            </div>

                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                                {scheduleTasks.length === 0 ? (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                        <Timer className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">暂无定时任务</p>
                                    </div>
                                ) : (
                                    scheduleTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-600/50"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{task.name}</p>
                                                <button
                                                    onClick={() => removeScheduleTask(task.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{task.cron}</span>
                                                <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${
                                                    task.enabled
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                                                }`}>
                                                    {task.enabled ? '运行中' : '已暂停'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                新建定时任务
                            </button>
                        </motion.div>

                        {/* 邮件订阅 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    邮件订阅
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-full">
                                    {emailSubscriptions.length} 个订阅
                                </span>
                            </div>

                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                                {emailSubscriptions.length === 0 ? (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                        <Mail className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">暂无邮件订阅</p>
                                    </div>
                                ) : (
                                    emailSubscriptions.map((sub) => (
                                        <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-100 dark:border-gray-600/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{sub.email}</p>
                                                <button
                                                    onClick={() => removeEmailSubscription(sub.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{sub.frequency}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="接收邮箱"
                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                />
                                <button
                                    onClick={addEmailSubscription}
                                    disabled={!newEmail.trim()}
                                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    <Mail className="w-4 h-4" />
                                    订阅推送
                                </button>
                            </div>
                        </motion.div>

                        {/* 协作分享 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-pink-500" />
                                    协作分享
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium rounded-full">
                                    实时同步
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                {/* 分享链接 */}
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">分享链接</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`https://app.example.com/share/${Date.now().toString(36)}`}
                                            className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl font-mono text-gray-700 dark:text-gray-300"
                                        />
                                        <button
                                            onClick={() => navigator.clipboard?.writeText(`https://app.example.com/share/${Date.now().toString(36)}`)}
                                            className="px-3 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* 分享设置 */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">查看权限</span>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <select className="w-full text-xs font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer">
                                            <option>任何人</option>
                                            <option>仅团队</option>
                                            <option>需密码</option>
                                        </select>
                                    </div>
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">有效期</span>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <select className="w-full text-xs font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none cursor-pointer">
                                            <option>7 天</option>
                                            <option>30 天</option>
                                            <option>永久</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center gap-1">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">微信</span>
                                </button>
                                <button className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center gap-1">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">钉钉</span>
                                </button>
                                <button className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center gap-1">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">飞书</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ──────── 定时任务弹窗 ──────── */}
                <AnimatePresence>
                    {showScheduleModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowScheduleModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Timer className="w-5 h-5 text-violet-500" />
                                            新建定时任务
                                        </h3>
                                        <button
                                            onClick={() => setShowScheduleModal(false)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">任务名称</label>
                                            <input
                                                type="text"
                                                value={newTask.name}
                                                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                                placeholder="如：每日报告导出"
                                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">执行频率</label>
                                                <select
                                                    value={newTask.frequency}
                                                    onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                                >
                                                    <option value="daily">每日</option>
                                                    <option value="weekly">每周</option>
                                                    <option value="monthly">每月</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">执行时间</label>
                                                <input
                                                    type="time"
                                                    value={newTask.time}
                                                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">导出格式</label>
                                            <select
                                                value={newTask.format}
                                                onChange={(e) => setNewTask({ ...newTask, format: e.target.value as ExportFormat })}
                                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                            >
                                                <option value="xlsx">Excel (.xlsx)</option>
                                                <option value="csv">CSV (.csv)</option>
                                                <option value="pdf">PDF (.pdf)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex gap-3">
                                        <button
                                            onClick={() => setShowScheduleModal(false)}
                                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={addScheduleTask}
                                            disabled={!newTask.name.trim()}
                                            className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-md shadow-purple-500/25 hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            创建任务
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ──────── AI 智能推荐 + 活动时间线 — 新增 ──────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mb-10"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* AI 智能推荐 */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500" />
                            {/* 装饰光晕 */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative flex items-center gap-3 mb-4">
                                <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                                    <Brain className="w-6 h-6 text-white" />
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/40 to-pink-500/40 blur-lg"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        AI 智能推荐
                                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[10px] font-bold rounded">BETA</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">基于数据特征自动推荐导出方案</p>
                                </div>
                            </div>

                            <div className="relative space-y-3">
                                {(() => {
                                    const avgScore = resumes.length > 0
                                        ? resumes.reduce((s, r) => s + (r.scores?.overall || 0), 0) / resumes.length
                                        : 0;
                                    const recommendation = avgScore > 0
                                        ? (avgScore >= 80
                                            ? { format: 'PDF', reason: '高质量简历推荐 PDF 报告展示', icon: '📄', color: 'from-red-500 to-rose-600' }
                                            : avgScore >= 60
                                            ? { format: 'Excel', reason: '中等数据量推荐 Excel 便于筛选', icon: '📊', color: 'from-emerald-500 to-green-600' }
                                            : { format: 'CSV', reason: '批量数据推荐 CSV 体积最小', icon: '📋', color: 'from-blue-500 to-cyan-600' })
                                        : { format: 'Excel', reason: '默认推荐 Excel 通用格式', icon: '📊', color: 'from-emerald-500 to-green-600' };

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            whileHover={{ y: -2 }}
                                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/30"
                                        >
                                            <div className="text-2xl">{recommendation.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">推荐格式：{recommendation.format}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{recommendation.reason}</p>
                                            </div>
                                            <button
                                                onClick={() => setConfig(prev => ({ ...prev, format: recommendation.format.toLowerCase() as ExportFormat }))}
                                                className={`px-3 py-1.5 bg-gradient-to-r ${recommendation.color} text-white text-xs font-medium rounded-lg shadow-md hover:shadow-lg transition-all`}
                                            >
                                                采纳
                                            </button>
                                        </motion.div>
                                    );
                                })()}

                                {[
                                    { icon: Target, text: '已为您筛选核心 12 项关键字段', color: 'text-emerald-500' },
                                    { icon: Award, text: '建议添加评分字段辅助决策', color: 'text-amber-500' },
                                    { icon: TrendingUp, text: '本周数据增长 18%，建议周报导出', color: 'text-blue-500' },
                                ].map((tip, i) => {
                                    const Icon = tip.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + i * 0.08 }}
                                            className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            <Icon className={`w-4 h-4 ${tip.color}`} />
                                            <span className="flex-1">{tip.text}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* 活动时间线 */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">活动动态</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">团队最近操作与系统事件</p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">实时</span>
                            </div>

                            <div className="relative pl-6">
                                {/* 时间线主轴 */}
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />

                                {(() => {
                                    const baseActivities = [
                                        { icon: Download, color: 'from-blue-500 to-cyan-500', text: '导出 Excel 报表', user: '您', time: '刚刚', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                                        { icon: Save, color: 'from-emerald-500 to-teal-500', text: '保存模板 "周度分析"', user: '李同学', time: '5 分钟前', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                                        { icon: Share2, color: 'from-pink-500 to-rose-500', text: '分享报告给 HR 团队', user: '王经理', time: '1 小时前', bg: 'bg-pink-100 dark:bg-pink-900/30' },
                                        { icon: Timer, color: 'from-violet-500 to-purple-500', text: '创建定时任务 "日报推送"', user: '张主管', time: '3 小时前', bg: 'bg-violet-100 dark:bg-violet-900/30' },
                                        { icon: Award, color: 'from-amber-500 to-orange-500', text: '筛选出 5 份优秀简历', user: '系统', time: '今天 09:30', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                                    ];
                                    return baseActivities.map((act, i) => {
                                        const Icon = act.icon;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 + i * 0.1 }}
                                                className="relative pb-4 last:pb-0"
                                            >
                                                {/* 节点 */}
                                                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full bg-gradient-to-br ${act.color} ring-4 ring-white dark:ring-gray-800 shadow-md`} />

                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 ${act.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-4 h-4 bg-gradient-to-br ${act.color} bg-clip-text text-transparent`} style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                            <span className="font-medium">{act.user}</span>
                                                            <span className="text-gray-600 dark:text-gray-400"> {act.text}</span>
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{act.time}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ──────── 数据预览 + 快捷键 + 水印 — 新增 ──────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="mb-10"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 数据预览触发卡 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setShowPreview(true)}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20 cursor-pointer group"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">数据预览</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">导出前查看实际数据表格</p>

                                {/* 模拟数据条 */}
                                <div className="space-y-1.5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-1.5">
                                            <div className="h-2 flex-1 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-900/40 dark:to-blue-900/40 rounded" />
                                            <div className="h-2 w-1/3 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 rounded" />
                                            <div className="h-2 w-1/4 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/40 dark:to-purple-900/40 rounded" />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 group-hover:gap-2.5 transition-all">
                                    <Eye className="w-4 h-4" />
                                    点击预览
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 快捷键面板触发卡 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setShowShortcuts(true)}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20 cursor-pointer group"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">快捷键</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">键盘快捷操作，提升效率</p>

                                <div className="space-y-1.5">
                                    {[
                                        { keys: ['Ctrl', 'E'], desc: '快速导出' },
                                        { keys: ['Ctrl', 'P'], desc: '打开预览' },
                                        { keys: ['Ctrl', 'S'], desc: '保存模板' },
                                    ].map((kb, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">{kb.desc}</span>
                                            <div className="flex items-center gap-1">
                                                {kb.keys.map((k, j) => (
                                                    <kbd key={j} className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                                                        {k}
                                                    </kbd>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:gap-2.5 transition-all">
                                    <Zap className="w-4 h-4" />
                                    查看全部
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 水印/安全设置触发卡 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setShowSecurity(true)}
                            className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5 dark:shadow-black/20 cursor-pointer group"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 mb-4">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">水印与安全</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">自定义水印、密码保护</p>

                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">水印状态</span>
                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-medium">
                                            {watermark.enabled ? '已开启' : '已关闭'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">密码保护</span>
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-[10px] font-medium">
                                            {security.password ? '已设置' : '未设置'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">加密传输</span>
                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-medium">
                                            AES-256
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 group-hover:gap-2.5 transition-all">
                                    <Shield className="w-4 h-4" />
                                    配置安全
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ──────── 弹窗合集：数据预览 / 快捷键 / 水印安全 ──────── */}

                {/* 数据预览弹窗 */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowPreview(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-cyan-500" />
                                        数据预览
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">（前 10 条）</span>
                                    </h3>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >×</button>
                                </div>

                                <div className="flex-1 overflow-auto p-6">
                                    {resumes.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">暂无数据可预览</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-white dark:bg-gray-800">
                                                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">姓名</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">职位</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">评分</th>
                                                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">技能</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resumes.slice(0, 10).map((r, i) => (
                                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                        <td className="p-2 text-gray-900 dark:text-white">{r.basicInfo?.name || '-'}</td>
                                                        <td className="p-2 text-gray-700 dark:text-gray-300">{r.jobInfo?.position || r.background?.workYears || '-'}</td>
                                                        <td className="p-2">
                                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                                                                {r.scores?.overall?.toFixed(1) || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-gray-700 dark:text-gray-300 text-xs">
                                                            {(r.skills || []).slice(0, 3).join(', ') || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 快捷键弹窗 */}
                <AnimatePresence>
                    {showShortcuts && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowShortcuts(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-violet-500" />
                                            键盘快捷键
                                        </h3>
                                        <button
                                            onClick={() => setShowShortcuts(false)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >×</button>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { keys: ['Ctrl', 'E'], desc: '快速导出当前数据' },
                                            { keys: ['Ctrl', 'P'], desc: '打开数据预览' },
                                            { keys: ['Ctrl', 'S'], desc: '保存为模板' },
                                            { keys: ['Ctrl', 'F'], desc: '聚焦搜索框' },
                                            { keys: ['Esc'], desc: '关闭弹窗' },
                                            { keys: ['?'], desc: '显示快捷键' },
                                        ].map((kb, i) => (
                                            <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{kb.desc}</span>
                                                <div className="flex items-center gap-1">
                                                    {kb.keys.map((k, j) => (
                                                        <kbd key={j} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                                                            {k}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 水印/安全弹窗 */}
                <AnimatePresence>
                    {showSecurity && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSecurity(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-rose-500" />
                                            水印与安全
                                        </h3>
                                        <button
                                            onClick={() => setShowSecurity(false)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >×</button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* 水印设置 */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">启用水印</label>
                                                <button
                                                    onClick={() => setWatermark({ ...watermark, enabled: !watermark.enabled })}
                                                    className={`w-10 h-5 rounded-full transition-colors ${watermark.enabled ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${watermark.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={watermark.text}
                                                onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                                                placeholder="水印文字"
                                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                            />
                                        </div>

                                        {/* 密码保护 */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">密码保护</label>
                                            <input
                                                type="password"
                                                value={security.password}
                                                onChange={(e) => setSecurity({ ...security, password: e.target.value })}
                                                placeholder="留空则不设置密码"
                                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                            />
                                        </div>

                                        {/* 加密选项 */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">传输加密</label>
                                            <select
                                                value={security.encryption}
                                                onChange={(e) => setSecurity({ ...security, encryption: e.target.value })}
                                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
                                            >
                                                <option value="aes-256">AES-256（推荐）</option>
                                                <option value="aes-128">AES-128</option>
                                                <option value="rsa-2048">RSA-2048</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">所有数据已通过端到端加密传输</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex gap-3">
                                        <button
                                            onClick={() => setShowSecurity(false)}
                                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={() => setShowSecurity(false)}
                                            className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                                        >
                                            保存配置
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 底部功能提示 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">智能导出小贴士</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    使用 <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-mono">Ctrl + E</kbd> 快速导出 · 
                                    支持批量导出和定时任务 · 
                                    数据安全加密传输
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 md:ml-auto">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Shield className="w-4 h-4" />
                                <span>数据安全</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Globe className="w-4 h-4" />
                                <span>多端同步</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Zap className="w-4 h-4" />
                                <span>极速导出</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
