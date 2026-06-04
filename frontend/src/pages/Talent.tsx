import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Tag,
    Star,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    ChevronDown,
    ChevronUp,
    UserPlus,
    Eye,
    Bookmark,
    BookmarkCheck,
    Grid,
    List,
    X,
    TrendingUp,
    Award,
    BarChart3,
    PieChart,
    Target,
    Zap,
    Clock,
    Download,
    Trash2,
    CheckCircle,
    XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

type ViewMode = "grid" | "list";
type SortBy = "score" | "name" | "date" | "skills";

export default function Talent() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortBy>("score");
    const [filterSkill, setFilterSkill] = useState<string>("");
    const [filterEducation, setFilterEducation] = useState<string>("");
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set());
    const [showStats, setShowStats] = useState(true);
    const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
    const { resumes, setResumes } = useResumeStore();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getHistory();
                setResumes(history);
            } catch (err) {
                console.error("Failed to load history:", err);
            }
        };
        loadHistory();
    }, [setResumes]);

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        resumes.forEach((r) => r.skills.forEach((s) => skills.add(s)));
        return Array.from(skills).sort();
    }, [resumes]);

    const allEducations = useMemo(() => {
        const edus = new Set<string>();
        resumes.forEach((r) => {
            if (r.background.education) edus.add(r.background.education);
        });
        return Array.from(edus).sort();
    }, [resumes]);

    const filteredResumes = useMemo(() => {
        let result = [...resumes];

        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            result = result.filter(
                (r) =>
                    r.basicInfo.name.toLowerCase().includes(keyword) ||
                    r.jobInfo.position.toLowerCase().includes(keyword) ||
                    r.skills.some((s) => s.toLowerCase().includes(keyword))
            );
        }

        if (filterSkill) {
            result = result.filter((r) => r.skills.includes(filterSkill));
        }

        if (filterEducation) {
            result = result.filter(
                (r) => r.background.education === filterEducation
            );
        }

        if (scoreRange[0] > 0 || scoreRange[1] < 100) {
            result = result.filter(
                (r) => r.scores.overall >= scoreRange[0] && r.scores.overall <= scoreRange[1]
            );
        }

        switch (sortBy) {
            case "score":
                result.sort((a, b) => b.scores.overall - a.scores.overall);
                break;
            case "name":
                result.sort((a, b) => a.basicInfo.name.localeCompare(b.basicInfo.name));
                break;
            case "date":
                result.sort(
                    (a, b) =>
                        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                );
                break;
            case "skills":
                result.sort((a, b) => b.skills.length - a.skills.length);
                break;
        }

        return result;
    }, [resumes, searchKeyword, filterSkill, filterEducation, sortBy, scoreRange]);

    const toggleBookmark = (id: string) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectResume = (id: string) => {
        setSelectedResumes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllResumes = () => {
        if (selectedResumes.size === filteredResumes.length) {
            setSelectedResumes(new Set());
        } else {
            setSelectedResumes(new Set(filteredResumes.map((r) => r.id)));
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 90) return { text: "优秀", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
        if (score >= 80) return { text: "良好", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
        if (score >= 60) return { text: "一般", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
        return { text: "待提升", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
    };

    const stats = useMemo(() => {
        if (resumes.length === 0) return null;

        const scores = resumes.map((r) => r.scores.overall);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highScore = Math.max(...scores);
        const lowScore = Math.min(...scores);

        const educationStats: Record<string, number> = {};
        resumes.forEach((r) => {
            const edu = r.background.education || "未知";
            educationStats[edu] = (educationStats[edu] || 0) + 1;
        });

        const skillStats: Record<string, number> = {};
        resumes.forEach((r) => {
            r.skills.forEach((s) => {
                skillStats[s] = (skillStats[s] || 0) + 1;
            });
        });
        const topSkills = Object.entries(skillStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            total: resumes.length,
            avgScore: Math.round(avgScore),
            highScore,
            lowScore,
            educationStats,
            topSkills,
        };
    }, [resumes]);

    const openDetailModal = (resume: ResumeData) => {
        setSelectedResume(resume);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedResume(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackButton />
                
                {/* 页面标题 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                人才库
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                管理和筛选候选人，共 <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredResumes.length}</span> 人
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                            >
                                <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">统计</span>
                            </button>
                            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-3 ${
                                        viewMode === "grid"
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                    } transition-colors`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-3 ${
                                        viewMode === "list"
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                                    } transition-colors`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 统计卡片 */}
                <AnimatePresence>
                    {showStats && stats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">总人数</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">平均分</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">最高分</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highScore}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                            <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">热门技能</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                        {stats.topSkills[0]?.[0] || "无"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 搜索和筛选 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="搜索姓名、岗位、技能..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700/50"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Filter className="w-5 h-5" />
                                <span>筛选</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                        showFilters ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortBy)}
                                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            >
                                <option value="score">按评分排序</option>
                                <option value="name">按姓名排序</option>
                                <option value="date">按时间排序</option>
                                <option value="skills">按技能数量</option>
                            </select>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            技能筛选
                                        </label>
                                        <select
                                            value={filterSkill}
                                            onChange={(e) => setFilterSkill(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                                        >
                                            <option value="">全部技能</option>
                                            {allSkills.map((skill) => (
                                                <option key={skill} value={skill}>
                                                    {skill}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            学历筛选
                                        </label>
                                        <select
                                            value={filterEducation}
                                            onChange={(e) => setFilterEducation(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                                        >
                                            <option value="">全部学历</option>
                                            {allEducations.map((edu) => (
                                                <option key={edu} value={edu}>
                                                    {edu}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            评分范围: {scoreRange[0]} - {scoreRange[1]}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={scoreRange[0]}
                                                onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                                                className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">至</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={scoreRange[1]}
                                                onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                                                className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 批量操作栏 */}
                {filteredResumes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between mb-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={selectAllResumes}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                    selectedResumes.size === filteredResumes.length && filteredResumes.length > 0
                                        ? "bg-blue-600 border-blue-600"
                                        : "border-gray-300 dark:border-gray-600"
                                }`}>
                                    {selectedResumes.size === filteredResumes.length && filteredResumes.length > 0 && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <span>全选 ({selectedResumes.size}/{filteredResumes.length})</span>
                            </button>
                        </div>
                        {selectedResumes.size > 0 && (
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                    <Download className="w-4 h-4 inline mr-1" />
                                    导出
                                </button>
                                <button className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                    <Trash2 className="w-4 h-4 inline mr-1" />
                                    删除
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 人才列表 */}
                {filteredResumes.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResumes.map((resume, index) => (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                                        selectedResumes.has(resume.id)
                                            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                                            : "border-gray-100 dark:border-gray-700"
                                    }`}
                                >
                                    <div className="p-6">
                                        {/* 顶部：头像 + 姓名 + 收藏 */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                                        {resume.basicInfo.name.charAt(0)}
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSelectResume(resume.id)}
                                                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            selectedResumes.has(resume.id)
                                                                ? "bg-blue-600 border-blue-600 text-white"
                                                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                                        }`}
                                                    >
                                                        {selectedResumes.has(resume.id) && (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {resume.basicInfo.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {resume.jobInfo.position || "未知岗位"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleBookmark(resume.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                {bookmarked.has(resume.id) ? (
                                                    <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Bookmark className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </button>
                                        </div>

                                        {/* 信息网格 */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <GraduationCap className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{resume.background.education || "未知"}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{resume.background.workYears || "未知"}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{resume.basicInfo.email || "无"}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                <span className="truncate">{resume.basicInfo.phone || "无"}</span>
                                            </div>
                                        </div>

                                        {/* 技能标签 */}
                                        {resume.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {resume.skills.slice(0, 4).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-lg font-medium"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {resume.skills.length > 4 && (
                                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-lg font-medium">
                                                        +{resume.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* 评分和操作 */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getScoreColor(
                                                        resume.scores.overall
                                                    )}`}
                                                >
                                                    {resume.scores.overall} 分
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBadge(resume.scores.overall).color}`}>
                                                    {getScoreBadge(resume.scores.overall).text}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => openDetailModal(resume)}
                                                className="inline-flex items-center space-x-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>详情</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* 列表视图 */
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {filteredResumes.map((resume, index) => (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                        selectedResumes.has(resume.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                    }`}
                                >
                                    <div className="flex items-center space-x-6 flex-1 min-w-0">
                                        <button
                                            onClick={() => toggleSelectResume(resume.id)}
                                            className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                                                selectedResumes.has(resume.id)
                                                    ? "bg-blue-600 border-blue-600"
                                                    : "border-gray-300 dark:border-gray-600"
                                            }`}
                                        >
                                            {selectedResumes.has(resume.id) && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
                                            {resume.basicInfo.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {resume.basicInfo.name}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBadge(resume.scores.overall).color}`}>
                                                    {getScoreBadge(resume.scores.overall).text}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {resume.jobInfo.position || "未知岗位"}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    {resume.background.education || "未知"}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {resume.background.workYears || "未知"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex flex-wrap gap-2 max-w-xs">
                                            {resume.skills.slice(0, 3).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-md font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {resume.skills.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                                                    +{resume.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 ml-4">
                                        <div
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${getScoreColor(
                                                resume.scores.overall
                                            )}`}
                                        >
                                            {resume.scores.overall} 分
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleBookmark(resume.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                {bookmarked.has(resume.id) ? (
                                                    <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Bookmark className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openDetailModal(resume)}
                                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    /* 空状态 */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            暂无人才数据
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            请先上传并分析一些简历
                        </p>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
                            <UserPlus className="w-5 h-5 inline mr-2" />
                            上传简历
                        </button>
                    </motion.div>
                )}
            </main>

            {/* 详情模态框 */}
            <AnimatePresence>
                {showDetailModal && selectedResume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={closeDetailModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 模态框头部 */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                                            {selectedResume.basicInfo.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedResume.basicInfo.name}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {selectedResume.jobInfo.position || "未知岗位"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeDetailModal}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* 模态框内容 */}
                            <div className="p-6 space-y-6">
                                {/* 评分卡片 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {selectedResume.scores.overall}
                                        </p>
                                        <p className="text-sm text-blue-600/70 dark:text-blue-400/70">综合评分</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {selectedResume.scores.skills}
                                        </p>
                                        <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">技能评分</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                            {selectedResume.scores.experience}
                                        </p>
                                        <p className="text-sm text-amber-600/70 dark:text-amber-400/70">经验评分</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 text-center">
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {selectedResume.scores.education}
                                        </p>
                                        <p className="text-sm text-purple-600/70 dark:text-purple-400/70">学历评分</p>
                                    </div>
                                </div>

                                {/* 基本信息 */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        基本信息
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
                                                <p className="text-gray-900 dark:text-white">{selectedResume.basicInfo.email || "未提供"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">电话</p>
                                                <p className="text-gray-900 dark:text-white">{selectedResume.basicInfo.phone || "未提供"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">地址</p>
                                                <p className="text-gray-900 dark:text-white">{selectedResume.basicInfo.address || "未提供"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">期望薪资</p>
                                                <p className="text-gray-900 dark:text-white">{selectedResume.jobInfo.expectedSalary || "未提供"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 教育背景 */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        教育背景
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">学历</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{selectedResume.background.education || "未提供"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">工作年限</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{selectedResume.background.workYears || "未提供"}</p>
                                        </div>
                                        {selectedResume.background.university && (
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">院校</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedResume.background.university}</p>
                                            </div>
                                        )}
                                        {selectedResume.background.major && (
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">专业</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{selectedResume.background.major}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 技能标签 */}
                                {selectedResume.skills.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            技能标签
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResume.skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI分析 */}
                                {selectedResume.analysis && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            AI 分析
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedResume.analysis}
                                        </p>
                                    </div>
                                )}

                                {/* 优化建议 */}
                                {selectedResume.suggestions && selectedResume.suggestions.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            优化建议
                                        </h3>
                                        <ul className="space-y-3">
                                            {selectedResume.suggestions.map((suggestion, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* 上传时间 */}
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    上传时间: {formatDate(selectedResume.uploadedAt)}
                                </div>
                            </div>

                            {/* 模态框底部 */}
                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeDetailModal}
                                        className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        关闭
                                    </button>
                                    <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
                                        <Download className="w-4 h-4 inline mr-2" />
                                        导出简历
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
