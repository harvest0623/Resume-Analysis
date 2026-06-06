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
    Shield,
    Globe,
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
    format: string;
    category: string;
    popular?: boolean;
    new?: boolean;
}

// 导出选项数据 - 增强版
const exportOptions: ExportOption[] = [
    {
        id: "resume-report",
        title: "简历分析报告",
        description: "导出单份简历的详细分析报告，包含评分、技能分析、优劣势评估等",
        icon: FileText,
        color: "blue",
        gradient: "from-blue-500 via-blue-600 to-indigo-600",
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
    
    // 按类别分组字段
    const fieldsByCategory = EXPORT_FIELDS.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<string, typeof EXPORT_FIELDS>);
    
    const filteredCount = getFilteredResumes().length;
    
    // 动画变体
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };
    
    return (
        <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackButton />
                
                {/* 页面头部 - 增强版 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                        {/* 装饰性背景 */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <FileDown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold">报告导出中心</h1>
                                        <p className="text-blue-100 mt-1">智能导出，高效管理您的招聘数据</p>
                                    </div>
                                </div>
                                
                                {/* 快捷统计 */}
                                <div className="flex flex-wrap gap-4 mt-6">
                                    {STATS_CARDS.map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <motion.div
                                                key={stat.label}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3"
                                            >
                                                <Icon className="w-5 h-5 text-blue-200" />
                                                <div>
                                                    <p className="text-2xl font-bold">{stat.value}</p>
                                                    <p className="text-xs text-blue-200">{stat.label}</p>
                                                </div>
                                                {stat.trend && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        stat.trend.startsWith('+') ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'
                                                    }`}>
                                                        {stat.trend}
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* 快捷操作 */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    {showStats ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    <span className="text-sm">{showStats ? '收起统计' : '展开统计'}</span>
                                </button>
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    <span className="text-sm">{isFullscreen ? '退出全屏' : '全屏模式'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                {/* 搜索和过滤栏 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* 搜索框 */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索导出类型..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            
                            {/* 分类过滤 */}
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                                                selectedCategory === cat.id
                                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                {/* 导出选项卡片网格 - 增强版 */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                >
                    {filteredOptions.map((option, index) => {
                        const Icon = option.icon;
                        const isSelected = selectedOption === option.id;
                        
                        return (
                            <motion.div
                                key={option.id}
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-300 cursor-pointer group ${
                                    isSelected
                                        ? "border-blue-500 ring-4 ring-blue-500/20 shadow-xl shadow-blue-500/10"
                                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg"
                                }`}
                                onClick={() => setSelectedOption(option.id)}
                            >
                                {/* 顶部渐变条 */}
                                <div className={`h-2 bg-gradient-to-r ${option.gradient}`} />
                                
                                {/* 标签 */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {option.popular && (
                                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            热门
                                        </span>
                                    )}
                                    {option.new && (
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            新
                                        </span>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    {/* 图标 */}
                                    <div className={`w-14 h-14 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    
                                    {/* 内容 */}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                        {option.description}
                                    </p>
                                    
                                    {/* 格式标签和操作 */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg">
                                            {option.format}
                                        </span>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickExport(option.id);
                                            }}
                                            disabled={isExporting && selectedOption === option.id}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                                                isExporting && selectedOption === option.id
                                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                            }`}
                                        >
                                            {isExporting && selectedOption === option.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm">导出中</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" />
                                                    <span className="text-sm">导出</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* 选中状态指示器 */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-4 left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
                
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
