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
    UserPlus,
    Eye,
    Bookmark,
    BookmarkCheck,
    Grid,
    List,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

type ViewMode = "grid" | "list";
type SortBy = "score" | "name" | "date";

export default function Talent() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortBy>("score");
    const [filterSkill, setFilterSkill] = useState<string>("");
    const [filterEducation, setFilterEducation] = useState<string>("");
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
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
        }

        return result;
    }, [resumes, searchKeyword, filterSkill, filterEducation, sortBy]);

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

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50";
        if (score >= 60) return "text-amber-600 bg-amber-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                人才库
                            </h1>
                            <p className="text-lg text-gray-600">
                                管理和筛选候选人，共 {filteredResumes.length} 人
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-3 ${
                                        viewMode === "grid"
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    } transition-colors`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-3 ${
                                        viewMode === "list"
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    } transition-colors`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索姓名、岗位、技能..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
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
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="score">按评分排序</option>
                                    <option value="name">按姓名排序</option>
                                    <option value="date">按时间排序</option>
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
                                    <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                技能筛选
                                            </label>
                                            <select
                                                value={filterSkill}
                                                onChange={(e) => setFilterSkill(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                学历筛选
                                            </label>
                                            <select
                                                value={filterEducation}
                                                onChange={(e) => setFilterEducation(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">全部学历</option>
                                                {allEducations.map((edu) => (
                                                    <option key={edu} value={edu}>
                                                        {edu}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {filteredResumes.length > 0 ? (
                        viewMode === "grid" ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredResumes.map((resume, index) => (
                                    <motion.div
                                        key={resume.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                        {resume.basicInfo.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {resume.basicInfo.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {resume.jobInfo.position || "未知岗位"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleBookmark(resume.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    {bookmarked.has(resume.id) ? (
                                                        <BookmarkCheck className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <Bookmark className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                                    <span>{resume.background.education}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <span>{resume.background.workYears}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{resume.basicInfo.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{resume.basicInfo.phone}</span>
                                                </div>
                                            </div>

                                            {resume.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {resume.skills.slice(0, 4).map((skill, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {resume.skills.length > 4 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                                                            +{resume.skills.length - 4}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                                                        resume.scores.overall
                                                    )}`}
                                                >
                                                    {resume.scores.overall} 分
                                                </div>
                                                <button className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    <Eye className="w-4 h-4" />
                                                    <span>查看详情</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {filteredResumes.map((resume, index) => (
                                    <motion.div
                                        key={resume.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-6 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {resume.basicInfo.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {resume.basicInfo.name}
                                                </h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{resume.jobInfo.position}</span>
                                                    <span>•</span>
                                                    <span>{resume.background.education}</span>
                                                    <span>•</span>
                                                    <span>{resume.background.workYears}</span>
                                                </div>
                                            </div>
                                            <div className="hidden md:flex flex-wrap gap-2 max-w-xs">
                                                {resume.skills.slice(0, 3).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold ${getScoreColor(
                                                    resume.scores.overall
                                                )}`}
                                            >
                                                {resume.scores.overall} 分
                                            </div>
                                            <button
                                                onClick={() => toggleBookmark(resume.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                {bookmarked.has(resume.id) ? (
                                                    <BookmarkCheck className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Bookmark className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                暂无人才数据
                            </h3>
                            <p className="text-gray-500">请先上传并分析一些简历</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
