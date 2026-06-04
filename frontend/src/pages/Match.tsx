import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, RefreshCcw, CheckCircle, Users, Target, Zap, ArrowUp,
    FileText, Filter, Save, Trash2, ChevronDown, ChevronUp,
    Sliders, X, Plus, Star, Download, Briefcase, GraduationCap,
    Layers, BarChart3, Settings2, Bookmark, Clock, AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import {
    MatchResult, ResumeData, MatchFilters, FilterTemplate,
    ExtendedMatchResult, DEFAULT_FILTERS, INDUSTRY_OPTIONS,
    EDUCATION_OPTIONS, SKILL_PRESETS,
} from "@/types/resume";

const TEMPLATE_STORAGE_KEY = "match_filter_templates";

function loadTemplates(): FilterTemplate[] {
    try {
        const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveTemplates(templates: FilterTemplate[]) {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

export default function Match() {
    const [jobDescription, setJobDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [isMatching, setIsMatching] = useState(false);
    const [matchResults, setMatchResults] = useState<ExtendedMatchResult[]>([]);
    const [filters, setFilters] = useState<MatchFilters>({ ...DEFAULT_FILTERS });
    const [showFilters, setShowFilters] = useState(true);
    const [templates, setTemplates] = useState<FilterTemplate[]>([]);
    const [templateName, setTemplateName] = useState("");
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [selectedPreset, setSelectedPreset] = useState("");
    const [weightExpanded, setWeightExpanded] = useState(false);
    const [showRejects, setShowRejects] = useState(false);
    const [useCoze, setUseCoze] = useState(false);

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
        setTemplates(loadTemplates());
    }, [setResumes]);

    // 筛选预览统计
    const filterPreview = useMemo(() => {
        if (matchResults.length === 0) return null;
        const passed = matchResults.filter((r) => r.filterPassed);
        const failed = matchResults.filter((r) => !r.filterPassed);
        const ranges = ["0-40", "40-60", "60-80", "80-100"];
        const distribution = ranges.map((range) => {
            const [min, max] = range.split("-").map(Number);
            return {
                range,
                count: passed.filter((r) => r.matchScore >= min && r.matchScore < max).length,
            };
        });
        const skillCount: Record<string, number> = {};
        passed.forEach((r) => {
            r.highlights.forEach((h) => {
                const match = h.match(/掌握 (.+)/);
                if (match) {
                    match[1].split(",").forEach((s) => {
                        const sk = s.trim();
                        skillCount[sk] = (skillCount[sk] || 0) + 1;
                    });
                }
            });
        });
        const topSkills = Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([skill, count]) => ({ skill, count }));
        return {
            total: matchResults.length,
            passed: passed.length,
            failed: failed.length,
            distribution,
            topSkills,
        };
    }, [matchResults]);

    const handleMatch = async () => {
        if (!jobDescription.trim() && !requirements.trim()) return;
        if (resumes.length === 0) return;

        setIsMatching(true);
        try {
            const hasActiveFilters =
                filters.experienceRange.min > 0 ||
                filters.experienceRange.max < 20 ||
                filters.educationLevel !== "不限" ||
                filters.industryBackground.length > 0 ||
                filters.requiredSkills.length > 0 ||
                filters.minProjectCount > 0;

            const result = await api.matchResumes(
                jobDescription,
                requirements,
                hasActiveFilters ? filters : undefined,
                useCoze
            );

            const resultsWithResume: ExtendedMatchResult[] = result.matches.map((match: any) => ({
                ...match,
                resume: resumes.find((r) => r.id === match.resumeId),
                details: {
                    skillsMatch: match.details?.skillsMatch ?? 0,
                    experienceMatch: match.details?.experienceMatch ?? 0,
                    educationMatch: match.details?.educationMatch ?? 0,
                    industryMatch: match.details?.industryMatch ?? 70,
                    projectMatch: match.details?.projectMatch ?? 70,
                },
                filterPassed: match.filterPassed ?? true,
                rejectReasons: match.rejectReasons ?? [],
            }));

            setMatchResults(resultsWithResume);
        } catch (err) {
            console.error("Matching failed:", err);
        } finally {
            setIsMatching(false);
        }
    };

    const reset = () => {
        setJobDescription("");
        setRequirements("");
        setMatchResults([]);
        setFilters({ ...DEFAULT_FILTERS });
        setSelectedPreset("");
    };

    const resetFilters = () => {
        setFilters({ ...DEFAULT_FILTERS });
        setSelectedPreset("");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    };

    const updateFilter = <K extends keyof MatchFilters>(key: K, value: MatchFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const addSkill = (name: string, weight: number = 2) => {
        if (!name.trim()) return;
        if (filters.requiredSkills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
        updateFilter("requiredSkills", [...filters.requiredSkills, { name: name.trim(), weight }]);
        setNewSkill("");
    };

    const removeSkill = (name: string) => {
        updateFilter("requiredSkills", filters.requiredSkills.filter((s) => s.name !== name));
    };

    const updateSkillWeight = (name: string, weight: number) => {
        updateFilter(
            "requiredSkills",
            filters.requiredSkills.map((s) => (s.name === name ? { ...s, weight } : s))
        );
    };

    const applyPreset = (presetName: string) => {
        setSelectedPreset(presetName);
        const skills = SKILL_PRESETS[presetName] || [];
        const newSkills = skills.map((name) => ({
            name,
            weight: filters.requiredSkills.find((s) => s.name === name)?.weight ?? 2,
        }));
        updateFilter("requiredSkills", newSkills);
    };

    const toggleIndustry = (industry: string) => {
        const current = filters.industryBackground;
        if (current.includes(industry)) {
            updateFilter("industryBackground", current.filter((i) => i !== industry));
        } else {
            updateFilter("industryBackground", [...current, industry]);
        }
    };

    const updateWeight = (key: keyof MatchFilters["weights"], value: number) => {
        updateFilter("weights", { ...filters.weights, [key]: value });
    };

    const saveTemplate = () => {
        if (!templateName.trim()) return;
        const template: FilterTemplate = {
            id: Date.now().toString(),
            name: templateName.trim(),
            filters: { ...filters },
            jobDescription,
            requirements,
            createdAt: new Date().toISOString(),
        };
        const updated = [...templates, template];
        setTemplates(updated);
        saveTemplates(updated);
        setTemplateName("");
        setShowSaveDialog(false);
    };

    const loadTemplate = (template: FilterTemplate) => {
        setFilters({ ...template.filters });
        if (template.jobDescription) setJobDescription(template.jobDescription);
        if (template.requirements) setRequirements(template.requirements);
    };

    const deleteTemplate = (id: string) => {
        const updated = templates.filter((t) => t.id !== id);
        setTemplates(updated);
        saveTemplates(updated);
    };

    const displayedResults = showRejects
        ? matchResults
        : matchResults.filter((r) => r.filterPassed);

    const hasActiveFilters =
        filters.experienceRange.min > 0 ||
        filters.experienceRange.max < 20 ||
        filters.educationLevel !== "不限" ||
        filters.industryBackground.length > 0 ||
        filters.requiredSkills.length > 0 ||
        filters.minProjectCount > 0;

    const weightTotal =
        filters.weights.skills +
        filters.weights.experience +
        filters.weights.education +
        filters.weights.industry +
        filters.weights.projects;

    // ---------- 子组件：筛选面板 ----------
    const FilterPanel = () => (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8"
        >
            <div className="p-6">
                {/* 筛选头部 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">筛选条件</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">配置精细化筛选规则，支持多条件组合</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                                已启用筛选
                            </span>
                        )}
                        <button
                            onClick={resetFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            <span>重置筛选</span>
                        </button>
                    </div>
                </div>

                {/* 快捷模板 */}
                {templates.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center space-x-1">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>已保存模板</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((t) => (
                                <div key={t.id} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => loadTemplate(t)}
                                        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {t.name}
                                    </button>
                                    <button
                                        onClick={() => deleteTemplate(t.id)}
                                        className="px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* 左列 */}
                    <div className="space-y-5">
                        {/* 工作经验 */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                <span>工作年限范围</span>
                                <span className="text-xs text-gray-400 ml-auto">
                                    {filters.experienceRange.min}年 - {filters.experienceRange.max >= 20 ? "不限" : `${filters.experienceRange.max}年`}
                                </span>
                            </label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="range"
                                    min={0}
                                    max={20}
                                    value={filters.experienceRange.min}
                                    onChange={(e) =>
                                        updateFilter("experienceRange", {
                                            ...filters.experienceRange,
                                            min: Math.min(Number(e.target.value), filters.experienceRange.max),
                                        })
                                    }
                                    className="flex-1 accent-blue-600"
                                />
                                <span className="text-xs text-gray-500 w-6 text-center">至</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={20}
                                    value={filters.experienceRange.max}
                                    onChange={(e) =>
                                        updateFilter("experienceRange", {
                                            ...filters.experienceRange,
                                            max: Math.max(Number(e.target.value), filters.experienceRange.min),
                                        })
                                    }
                                    className="flex-1 accent-blue-600"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0年</span>
                                <span>5年</span>
                                <span>10年</span>
                                <span>15年</span>
                                <span>不限</span>
                            </div>
                        </div>

                        {/* 学历要求 */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <GraduationCap className="w-4 h-4 text-purple-500" />
                                <span>最低学历要求</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {EDUCATION_OPTIONS.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateFilter("educationLevel", level)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            filters.educationLevel === level
                                                ? "bg-purple-600 text-white shadow-md"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 项目经历 */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Layers className="w-4 h-4 text-emerald-500" />
                                <span>最少项目经历</span>
                                <span className="text-xs text-gray-400 ml-auto">{filters.minProjectCount}个</span>
                            </label>
                            <div className="flex items-center space-x-3">
                                {[0, 1, 2, 3, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => updateFilter("minProjectCount", n)}
                                        className={`w-12 h-10 rounded-lg text-sm font-medium transition-all ${
                                            filters.minProjectCount === n
                                                ? "bg-emerald-600 text-white shadow-md"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        {n === 0 ? "不限" : `${n}+`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右列 */}
                    <div className="space-y-5">
                        {/* 行业背景 */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Briefcase className="w-4 h-4 text-amber-500" />
                                <span>行业背景</span>
                                {filters.industryBackground.length > 0 && (
                                    <span className="text-xs text-amber-600">已选{filters.industryBackground.length}项</span>
                                )}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {INDUSTRY_OPTIONS.map((ind) => (
                                    <button
                                        key={ind}
                                        onClick={() => toggleIndustry(ind)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                            filters.industryBackground.includes(ind)
                                                ? "bg-amber-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700"
                                        }`}
                                    >
                                        {ind}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 技能要求 */}
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>技能要求</span>
                                {filters.requiredSkills.length > 0 && (
                                    <span className="text-xs text-yellow-600">{filters.requiredSkills.length}项</span>
                                )}
                            </label>
                            {/* 预设快捷 */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {Object.keys(SKILL_PRESETS).map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => applyPreset(preset)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            selectedPreset === preset
                                                ? "bg-yellow-500 text-white"
                                                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100"
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                            {/* 自定义添加 */}
                            <div className="flex space-x-2 mb-3">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                                    placeholder="输入技能名称后回车添加"
                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => addSkill(newSkill)}
                                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {/* 已选技能列表 */}
                            {filters.requiredSkills.length > 0 && (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {filters.requiredSkills.map((skill) => (
                                        <div
                                            key={skill.name}
                                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5"
                                        >
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-400">权重</span>
                                                {[1, 2, 3, 4, 5].map((w) => (
                                                    <button
                                                        key={w}
                                                        onClick={() => updateSkillWeight(skill.name, w)}
                                                        className={`w-5 h-5 rounded text-xs font-medium transition-all ${
                                                            skill.weight >= w
                                                                ? "bg-yellow-400 text-white"
                                                                : "bg-gray-200 dark:bg-gray-600 text-gray-400"
                                                        }`}
                                                    >
                                                        {w}
                                                    </button>
                                                ))}
                                                {skill.weight >= 3 && (
                                                    <span className="text-[10px] text-red-500 font-medium">必须</span>
                                                )}
                                                <button onClick={() => removeSkill(skill.name)} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 权重配置（可折叠） */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setWeightExpanded(!weightExpanded)}
                        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        <div className="flex items-center space-x-2">
                            <Settings2 className="w-4 h-4 text-gray-500" />
                            <span>维度权重配置</span>
                            {Math.abs(weightTotal - 1) > 0.01 && (
                                <span className="text-xs text-amber-500">（当前总和: {(weightTotal * 100).toFixed(0)}%）</span>
                            )}
                        </div>
                        {weightExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                        {weightExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 grid grid-cols-5 gap-4"
                            >
                                {(
                                    [
                                        { key: "skills" as const, label: "技能", color: "blue" },
                                        { key: "experience" as const, label: "经验", color: "green" },
                                        { key: "education" as const, label: "学历", color: "purple" },
                                        { key: "industry" as const, label: "行业", color: "amber" },
                                        { key: "projects" as const, label: "项目", color: "emerald" },
                                    ] as const
                                ).map(({ key, label, color }) => (
                                    <div key={key} className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={Math.round(filters.weights[key] * 100)}
                                            onChange={(e) => updateWeight(key, Number(e.target.value) / 100)}
                                            className={`w-full text-center px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-${color}-500`}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">{(filters.weights[key] * 100).toFixed(0)}%</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 保存模板 */}
                <div className="mt-4 flex items-center justify-between">
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!hasActiveFilters}
                        className="flex items-center space-x-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>保存为模板</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <BackButton />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">岗位智能匹配</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">输入岗位要求，配置筛选条件，AI 自动匹配最合适的候选人</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {matchResults.length === 0 ? (
                            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                {/* 岗位描述 & 技能要求 */}
                                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">岗位描述</h3>
                                        </div>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="请输入岗位描述，例如：我们正在寻找一位有经验的前端工程师..."
                                            rows={8}
                                            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                <Target className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">技能要求</h3>
                                        </div>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            placeholder="请输入技能要求，例如：React、TypeScript、3年以上工作经验..."
                                            rows={8}
                                            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* 筛选条件区域 */}
                                <div className="mb-6">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                                    >
                                        <Sliders className="w-4 h-4" />
                                        <span>{showFilters ? "收起筛选条件" : "展开筛选条件"}</span>
                                        {hasActiveFilters && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    <AnimatePresence>{showFilters && <FilterPanel />}</AnimatePresence>
                                </div>

                                {/* AI 匹配开关 */}
                                <div className="mb-6 flex items-center justify-center">
                                    <label className="inline-flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={useCoze}
                                                onChange={(e) => setUseCoze(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                            AI 智能匹配
                                        </span>
                                        {useCoze && (
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                Coze
                                            </span>
                                        )}
                                    </label>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={handleMatch}
                                        disabled={isMatching || resumes.length === 0}
                                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isMatching ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>匹配中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                <span>开始匹配</span>
                                                {hasActiveFilters && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">含筛选</span>}
                                            </>
                                        )}
                                    </button>
                                    {(jobDescription || requirements) && (
                                        <button
                                            onClick={reset}
                                            className="inline-flex items-center space-x-2 px-6 py-4 bg-white text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200"
                                        >
                                            <RefreshCcw className="w-5 h-5" />
                                            <span>重置</span>
                                        </button>
                                    )}
                                </div>

                                {resumes.length === 0 && (
                                    <div className="mt-8 text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">暂无可匹配的简历</p>
                                        <p className="text-sm text-gray-400">请先上传并分析一些简历</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* ==================== 结果页 ==================== */
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                {/* 结果头部 */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">匹配完成</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                共 {matchResults.length} 位候选人
                                                {filterPreview && filterPreview.failed > 0 && (
                                                    <span>
                                                        ，{filterPreview.passed} 位通过筛选，{filterPreview.failed} 位未通过
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {filterPreview && filterPreview.failed > 0 && (
                                            <button
                                                onClick={() => setShowRejects(!showRejects)}
                                                className={`inline-flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg border transition-all ${
                                                    showRejects
                                                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                                }`}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{showRejects ? "隐藏" : "显示"}未通过</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={reset}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:bg-gray-700/50 transition-all duration-200"
                                        >
                                            <RefreshCcw className="w-5 h-5" />
                                            <span>重新匹配</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 预览统计卡片 */}
                                {filterPreview && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总候选人</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filterPreview.total}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">通过筛选</p>
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{filterPreview.passed}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
                                            <p className="text-xs text-red-500 mb-1">未通过</p>
                                            <p className="text-2xl font-bold text-red-500">{filterPreview.failed}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">匹配率</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {filterPreview.total > 0 ? Math.round((filterPreview.passed / filterPreview.total) * 100) : 0}%
                                            </p>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                                <div
                                                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                                                    style={{ width: `${filterPreview.total > 0 ? (filterPreview.passed / filterPreview.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 结果列表 */}
                                <div className="space-y-6">
                                    {displayedResults.map((match, index) => {
                                        if (!match.resume) return null;

                                        return (
                                            <motion.div
                                                key={match.resumeId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden ${
                                                    !match.filterPassed
                                                        ? "border-red-200 dark:border-red-800/50 opacity-75"
                                                        : "border-gray-100 dark:border-gray-700"
                                                }`}
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center space-x-4">
                                                                    {index === 0 && match.filterPassed && (
                                                                        <div className="flex items-center space-x-1 text-amber-500">
                                                                            <Zap className="w-5 h-5" />
                                                                            <span className="text-sm font-semibold">最佳匹配</span>
                                                                        </div>
                                                                    )}
                                                                    <div className={`px-4 py-2 rounded-xl border-2 font-bold text-lg ${getScoreColor(match.matchScore)}`}>
                                                                        {match.matchScore}%
                                                                    </div>
                                                                    {!match.filterPassed && (
                                                                        <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium border border-red-200 dark:border-red-800">
                                                                            未通过筛选
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="mb-4">
                                                                <ResumeCard resume={match.resume} showActions={false} />
                                                            </div>

                                                            {/* 五维匹配 */}
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                                                {[
                                                                    { label: "技能匹配", score: match.details.skillsMatch, icon: "💻" },
                                                                    { label: "经验匹配", score: match.details.experienceMatch, icon: "📅" },
                                                                    { label: "学历匹配", score: match.details.educationMatch, icon: "🎓" },
                                                                    { label: "行业匹配", score: match.details.industryMatch, icon: "🏢" },
                                                                    { label: "项目匹配", score: match.details.projectMatch, icon: "📋" },
                                                                ].map((item, i) => (
                                                                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                            <span className="mr-1">{item.icon}</span>
                                                                            {item.label}
                                                                        </p>
                                                                        <p className={`text-xl font-bold ${getScoreColor(item.score).split(" ")[0]}`}>
                                                                            {item.score}%
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* 匹配亮点 */}
                                                            <div className="mb-3">
                                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">匹配亮点</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {match.highlights.map((highlight, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 rounded-lg text-sm"
                                                                        >
                                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                                            <span>{highlight}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* 未通过原因 */}
                                                            {!match.filterPassed && match.rejectReasons.length > 0 && (
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">未通过原因</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {match.rejectReasons.map((reason, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm"
                                                                            >
                                                                                <X className="w-3.5 h-3.5" />
                                                                                <span>{reason}</span>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {displayedResults.length === 0 && (
                                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                                        <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">暂无匹配结果</p>
                                        <p className="text-sm text-gray-400">尝试调整筛选条件或降低门槛</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>

            {/* 保存模板弹窗 */}
            <AnimatePresence>
                {showSaveDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setShowSaveDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">保存筛选模板</h3>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveTemplate()}
                                placeholder="请输入模板名称"
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowSaveDialog(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={saveTemplate}
                                    disabled={!templateName.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    保存
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
