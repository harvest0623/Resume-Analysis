import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, RefreshCcw, CheckCircle, Users, Target, Zap, ArrowUp,
    FileText, Filter, Save, Trash2, ChevronDown, ChevronUp,
    Sliders, X, Plus, Star, Download, Briefcase, GraduationCap,
    Layers, BarChart3, Settings2, Bookmark, Clock, AlertCircle, Sparkles,
    Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code, Link, Eye, Edit3, Eraser,
    MapPin, Wallet, Calendar, Languages, Award, Activity, ChevronRight, Heart,
    ClipboardCheck, MessageCircle, Lightbulb
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

// 玻璃拟态卡片
const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
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

// 渐变按钮
const GlowButton = ({ children, onClick, variant = "primary", className = "", disabled = false }: {
    children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; className?: string; disabled?: boolean
}) => {
    const baseClass = "relative group overflow-hidden rounded-2xl font-semibold transition-all duration-300 inline-flex items-center justify-center";
    const variants = {
        primary: "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5",
        secondary: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700",
        ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClass} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center space-x-2">{children}</span>
        </button>
    );
};

// 动画背景（紫色主题）
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
            <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-indigo-600/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -80, 0], y: [0, 60, 0], rotate: [360, 180, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-violet-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, 60, 0], y: [0, -80, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-fuchsia-400/20 to-purple-400/20 rounded-full blur-3xl"
            />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
    </div>
);

// Markdown 工具栏按钮
const ToolButton = ({ icon: Icon, title, onClick, active = false }: { icon: any; title: string; onClick: () => void; active?: boolean }) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`p-1.5 rounded-md transition-all ${active ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400"}`}
    >
        <Icon className="w-3.5 h-3.5" />
    </button>
);

// Markdown 编辑器工具栏
type ToolbarProps = {
    value: string;
    onChange: (v: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    preview: boolean;
    setPreview: (v: boolean) => void;
    theme?: "purple" | "indigo";
};

const MarkdownToolbar = ({ value, onChange, textareaRef, preview, setPreview, theme = "purple" }: ToolbarProps) => {
    const apply = (before: string, after: string = before, placeholder: string = "") => {
        const ta = textareaRef.current;
        if (!ta) return;
        const { selectionStart: s, selectionEnd: e, value: t } = ta;
        const sel = t.substring(s, e) || placeholder;
        const newText = t.substring(0, s) + before + sel + after + t.substring(e);
        onChange(newText);
        // 还原光标
        requestAnimationFrame(() => {
            if (!ta) return;
            ta.focus();
            const pos = s + before.length;
            ta.setSelectionRange(pos, pos + sel.length);
        });
    };

    const applyLine = (prefix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const { selectionStart: s, value: t } = ta;
        const lineStart = t.lastIndexOf("\n", s - 1) + 1;
        const newText = t.substring(0, lineStart) + prefix + t.substring(lineStart);
        onChange(newText);
        requestAnimationFrame(() => {
            if (!ta) return;
            ta.focus();
            const pos = s + prefix.length;
            ta.setSelectionRange(pos, pos);
        });
    };

    const insertLink = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        const { selectionStart: s, selectionEnd: e, value: t } = ta;
        const sel = t.substring(s, e) || "链接文字";
        const url = prompt("请输入链接地址：", "https://");
        if (!url) return;
        const inserted = `[${sel}](${url})`;
        const newText = t.substring(0, s) + inserted + t.substring(e);
        onChange(newText);
        requestAnimationFrame(() => {
            if (!ta) return;
            ta.focus();
            const pos = s + inserted.length;
            ta.setSelectionRange(pos, pos);
        });
    };

    const clearFormat = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        let t = value;
        t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
        t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1");
        t = t.replace(/`([^`]+)`/g, "$1");
        t = t.replace(/^#{1,3} /gm, "");
        t = t.replace(/^> /gm, "");
        t = t.replace(/^[-*] /gm, "");
        t = t.replace(/^\d+\. /gm, "");
        t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
        onChange(t);
    };

    const themeClasses = theme === "purple"
        ? "focus-within:ring-purple-500/30 focus-within:border-purple-500/50"
        : "focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50";

    return (
        <div className={`border border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm transition-all focus-within:ring-2 ${themeClasses}`}>
            {/* 工具栏 */}
            <div className="flex items-center flex-wrap gap-0.5 p-1.5 border-b border-gray-200/60 dark:border-gray-600/60">
                <ToolButton icon={Heading1} title="一级标题" onClick={() => applyLine("# ")} />
                <ToolButton icon={Heading2} title="二级标题" onClick={() => applyLine("## ")} />
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                <ToolButton icon={Bold} title="加粗 (Ctrl+B)" onClick={() => apply("**", "**", "加粗文字")} />
                <ToolButton icon={Italic} title="斜体 (Ctrl+I)" onClick={() => apply("*", "*", "斜体文字")} />
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                <ToolButton icon={List} title="无序列表" onClick={() => applyLine("- ")} />
                <ToolButton icon={ListOrdered} title="有序列表" onClick={() => applyLine("1. ")} />
                <ToolButton icon={Quote} title="引用" onClick={() => applyLine("> ")} />
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                <ToolButton icon={Code} title="行内代码" onClick={() => apply("`", "`", "code")} />
                <ToolButton icon={Link} title="插入链接" onClick={insertLink} />
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                <ToolButton icon={Eraser} title="清除格式" onClick={clearFormat} />
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-all ${
                        preview
                            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-purple-600"
                    }`}
                    title={preview ? "编辑模式" : "预览模式"}
                >
                    {preview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{preview ? "编辑" : "预览"}</span>
                </button>
            </div>
            {/* 编辑区 / 预览区 */}
            {preview ? (
                <div
                    className="p-4 min-h-[208px] max-h-96 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownStatic(value) || '<p class="text-gray-400 italic">暂无内容，输入文字或使用工具栏添加格式...</p>' }}
                />
            ) : (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={8}
                    className="w-full p-4 bg-transparent resize-none focus:outline-none text-gray-900 dark:text-white"
                />
            )}
        </div>
    );
};

// 静态 Markdown 渲染（避免在组件中重复创建闭包）
function renderMarkdownStatic(md: string): string {
    if (!md) return "";
    const lines = md.split("\n");
    const out: string[] = [];
    let inList = false;
    let inOrdered = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let esc = line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        esc = esc.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-400 text-xs font-mono">$1</code>');
        esc = esc.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
        esc = esc.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
        if (/^### /.test(esc)) {
            esc = `<span class="text-base font-semibold text-gray-900 dark:text-white block mt-2">${esc.replace(/^### /, "")}</span>`;
        } else if (/^## /.test(esc)) {
            esc = `<span class="text-lg font-bold text-gray-900 dark:text-white block mt-2">${esc.replace(/^## /, "")}</span>`;
        } else if (/^# /.test(esc)) {
            esc = `<span class="text-xl font-bold text-purple-700 dark:text-purple-300 block mt-2">${esc.replace(/^# /, "")}</span>`;
        }
        if (/^> /.test(esc)) {
            esc = `<span class="block pl-3 border-l-4 border-purple-400 text-gray-600 dark:text-gray-400 italic">${esc.replace(/^> /, "")}</span>`;
        }
        esc = esc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-purple-600 dark:text-purple-400 underline">$1</a>');
        if (/^[-*] /.test(esc)) {
            if (!inList) { inList = true; inOrdered = false; out.push('<ul class="list-disc list-inside space-y-0.5 ml-2 text-gray-700 dark:text-gray-300">'); }
            esc = `<li>${esc.replace(/^[-*] /, "")}</li>`;
        } else if (/^\d+\. /.test(esc)) {
            if (!inOrdered) { inOrdered = true; inList = false; out.push('<ol class="list-decimal list-inside space-y-0.5 ml-2 text-gray-700 dark:text-gray-300">'); }
            esc = `<li>${esc.replace(/^\d+\. /, "")}</li>`;
        } else {
            if (inList) { out.push("</ul>"); inList = false; }
            if (inOrdered) { out.push("</ol>"); inOrdered = false; }
        }
        out.push(esc);
    }
    if (inList) out.push("</ul>");
    if (inOrdered) out.push("</ol>");
    return out.join("<br/>");
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
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem("match_favorites");
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [sortBy, setSortBy] = useState<"score" | "experience" | "education">("score");
    const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
    const [selectedResume, setSelectedResume] = useState<ExtendedMatchResult | null>(null);
    const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
    const [showCompare, setShowCompare] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const [scoreFilter, setScoreFilter] = useState<number>(0);
    const [jdPreview, setJdPreview] = useState(false);
    const [reqPreview, setReqPreview] = useState(false);
    const jdRef = useRef<HTMLTextAreaElement>(null);
    const reqRef = useRef<HTMLTextAreaElement>(null);

    // 高级筛选（前端状态，不影响后端）
    const [cityFilter, setCityFilter] = useState<string[]>([]);
    const [cityInput, setCityInput] = useState("");
    const [salaryRange, setSalaryRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const [salaryEnabled, setSalaryEnabled] = useState(false);
    const [genderFilter, setGenderFilter] = useState<"不限" | "男" | "女">("不限");
    const [ageRange, setAgeRange] = useState<{ min: number; max: number }>({ min: 18, max: 60 });
    const [ageEnabled, setAgeEnabled] = useState(false);
    const [lastActiveDays, setLastActiveDays] = useState<number>(0); // 0 = 不限
    const [languageFilter, setLanguageFilter] = useState<string[]>([]);
    const [certificateFilter, setCertificateFilter] = useState<string[]>([]);
    const [jobHoppingFilter, setJobHoppingFilter] = useState<"不限" | "稳定" | "中等" | "频繁">("不限");
    const [advancedExpanded, setAdvancedExpanded] = useState(false);
    const [jdAnalyzing, setJdAnalyzing] = useState(false);
    const [jdExtractedKeywords, setJdExtractedKeywords] = useState<string[]>([]);
    const [showGapAnalysis, setShowGapAnalysis] = useState(false);
    const [gapTargetId, setGapTargetId] = useState<string | null>(null);
    const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [templateManageOpen, setTemplateManageOpen] = useState(false);
    const [renameTemplateId, setRenameTemplateId] = useState<string | null>(null);
    const [renameTemplateName, setRenameTemplateName] = useState("");
    const [importTemplateText, setImportTemplateText] = useState("");
    const [jdAutoTags, setJdAutoTags] = useState<string[]>([]);

    const CITY_PRESETS = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "苏州", "西安", "重庆", "天津", "厦门", "长沙", "青岛"];
    const LANGUAGE_PRESETS = ["英语", "日语", "韩语", "法语", "德语", "西班牙语", "俄语", "粤语"];
    const CERTIFICATE_PRESETS = ["PMP", "CPA", "ACCA", "教师资格证", "执业医师", "建筑师", "软件设计师", "系统架构师", "AWS认证", "阿里云认证"];

    // 富文本编辑器工具函数
    const applyFormat = (text: string, selStart: number, selEnd: number, before: string, after: string = before, placeholder: string = ""): { text: string; selStart: number; selEnd: number } => {
        const selected = text.substring(selStart, selEnd) || placeholder;
        const newText = text.substring(0, selStart) + before + selected + after + text.substring(selEnd);
        return {
            text: newText,
            selStart: selStart + before.length,
            selEnd: selStart + before.length + selected.length,
        };
    };

    const applyLinePrefix = (text: string, selStart: number, selEnd: number, prefix: string): { text: string; selStart: number; selEnd: number } => {
        // 找到当前行的开始
        const lineStart = text.lastIndexOf("\n", selStart - 1) + 1;
        const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
        return { text: newText, selStart: selStart + prefix.length, selEnd: selEnd + prefix.length };
    };

    // 极简 Markdown 渲染（仅解析本编辑器支持的语法）
    const renderMarkdown = (md: string): string => {
        if (!md) return "";
        const lines = md.split("\n");
        const out: string[] = [];
        let inList = false;
        let inOrdered = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let esc = line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            // 代码块标记
            esc = esc.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-400 text-xs">$1</code>');
            // 加粗
            esc = esc.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
            // 斜体
            esc = esc.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
            // 标题
            if (/^### /.test(esc)) {
                esc = `<span class="text-base font-semibold text-gray-900 dark:text-white">${esc.replace(/^### /, "")}</span>`;
            } else if (/^## /.test(esc)) {
                esc = `<span class="text-lg font-bold text-gray-900 dark:text-white">${esc.replace(/^## /, "")}</span>`;
            } else if (/^# /.test(esc)) {
                esc = `<span class="text-xl font-bold text-purple-700 dark:text-purple-300">${esc.replace(/^# /, "")}</span>`;
            }
            // 引用
            if (/^> /.test(esc)) {
                esc = `<span class="block pl-3 border-l-4 border-purple-400 text-gray-600 dark:text-gray-400 italic">${esc.replace(/^> /, "")}</span>`;
            }
            // 链接
            esc = esc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-purple-600 dark:text-purple-400 underline">$1</a>');
            // 无序列表
            if (/^[-*] /.test(esc)) {
                if (!inList) { inList = true; inOrdered = false; out.push('<ul class="list-disc list-inside space-y-0.5 ml-2 text-gray-700 dark:text-gray-300">'); }
                esc = `<li>${esc.replace(/^[-*] /, "")}</li>`;
            } else if (/^\d+\. /.test(esc)) {
                if (!inOrdered) { inOrdered = true; inList = false; out.push('<ol class="list-decimal list-inside space-y-0.5 ml-2 text-gray-700 dark:text-gray-300">'); }
                esc = `<li>${esc.replace(/^\d+\. /, "")}</li>`;
            } else {
                if (inList) { out.push("</ul>"); inList = false; }
                if (inOrdered) { out.push("</ol>"); inOrdered = false; }
            }
            out.push(esc);
        }
        if (inList) out.push("</ul>");
        if (inOrdered) out.push("</ol>");
        return out.join("<br/>");
    };

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
        setCityFilter([]); setCityInput("");
        setSalaryEnabled(false); setAgeEnabled(false); setGenderFilter("不限");
        setLastActiveDays(0); setLanguageFilter([]); setCertificateFilter([]); setJobHoppingFilter("不限");
        setJdExtractedKeywords([]); setJdAutoTags([]);
    };

    // JD 一键分析：提取技术关键词、经验要求、学历要求
    const analyzeJD = useCallback(() => {
        if (!jobDescription.trim()) {
            showToast("info", "请先输入岗位描述");
            return;
        }
        setJdAnalyzing(true);
        // 模拟分析延时
        setTimeout(() => {
            const text = jobDescription.toLowerCase();
            const extracted: string[] = [];
            const autoTags: string[] = [];

            // 技能关键词提取
            const skillPatterns = [
                "react", "vue", "angular", "javascript", "typescript", "css", "html", "scss", "less",
                "node\\.?js", "python", "java", "golang", "go", "rust", "c\\+\\+", "c#", "php", "ruby",
                "spring", "django", "flask", "express", "next\\.?js", "nuxt",
                "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "kafka", "rabbitmq",
                "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "devops", "ci/cd",
                "git", "linux", "unix", "微服务", "rest", "graphql", "grpc", "api",
                "机器学习", "深度学习", "nlp", "推荐系统", "数据挖掘", "大数据", "hadoop", "spark", "flink",
                "tensorflow", "pytorch", "数据仓库", "数据湖",
                "figma", "sketch", "ui", "ux", "用户研究", "交互设计",
            ];
            for (const pat of skillPatterns) {
                const re = new RegExp(pat, "gi");
                const m = re.exec(text);
                if (m) {
                    const keyword = m[0].charAt(0).toUpperCase() + m[0].slice(1);
                    if (!extracted.includes(keyword)) extracted.push(keyword);
                }
            }

            // 经验年限
            const expMatch = text.match(/(\d+)\s*年(以上|以上工作经验|经验|工作经验)/);
            if (expMatch) {
                const years = parseInt(expMatch[1]);
                updateFilter("experienceRange", { ...filters.experienceRange, min: Math.max(filters.experienceRange.min, years) });
            }

            // 学历
            const eduMatch = text.match(/本科|大专|硕士|博士|研究生/);
            if (eduMatch) {
                const eduMap: Record<string, string> = { "大专": "大专", "本科": "本科", "硕士": "硕士", "研究生": "硕士", "博士": "博士" };
                updateFilter("educationLevel", (eduMap[eduMatch[0]] as "不限" | "大专" | "本科" | "硕士" | "博士") || "不限");
            }

            // 行业
            const industryKw: Record<string, string[]> = {
                "金融": ["金融", "银行", "证券", "保险", "支付"],
                "电商": ["电商", "电子商务", "零售", "供应链"],
                "教育": ["教育", "在线教育", "培训"],
                "医疗": ["医疗", "医药", "健康", "医院"],
                "游戏": ["游戏", "手游", "电竞"],
            };
            for (const [ind, kws] of Object.entries(industryKw)) {
                if (kws.some((kw) => text.includes(kw)) && !filters.industryBackground.includes(ind)) {
                    toggleIndustry(ind);
                }
            }

            // 自动标签
            if (text.includes("全栈")) autoTags.push("全栈");
            if (text.includes("前端")) autoTags.push("前端");
            if (text.includes("后端")) autoTags.push("后端");
            if (text.includes("算法")) autoTags.push("算法");
            if (text.includes("数据")) autoTags.push("数据");
            if (text.includes("架构")) autoTags.push("架构");
            if (text.includes("管理")) autoTags.push("管理");

            setJdExtractedKeywords(extracted.slice(0, 10));
            setJdAutoTags(autoTags);
            setJdAnalyzing(false);
            if (extracted.length > 0) {
                showToast("success", `已分析出 ${extracted.length} 个关键词 · 已自动应用到筛选`);
            } else {
                showToast("info", "未识别到明显技术关键词，建议手动补充");
            }
        }, 800);
    }, [jobDescription, filters]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    };

    const toggleFavorite = (resumeId: string) => {
        const isFav = favorites.has(resumeId);
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(resumeId)) {
                next.delete(resumeId);
            } else {
                next.add(resumeId);
            }
            try {
                localStorage.setItem("match_favorites", JSON.stringify([...next]));
            } catch {}
            return next;
        });
        showToast(isFav ? "info" : "success", isFav ? "已取消收藏" : "已添加到收藏");
    };

    const toggleCompare = (resumeId: string) => {
        setCompareIds((prev) => {
            const next = new Set(prev);
            if (next.has(resumeId)) {
                next.delete(resumeId);
            } else {
                if (next.size >= 4) {
                    showToast("error", "最多支持 4 位候选人同时对比");
                    return prev;
                }
                next.add(resumeId);
            }
            return next;
        });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast("success", "已复制到剪贴板");
        } catch {
            showToast("error", "复制失败，请手动选择文本");
        }
    };

    const exportResults = (format: "json" | "csv") => {
        const data = displayedResults.filter((m) => m.resume);
        if (data.length === 0) return;
        const filename = `匹配结果_${new Date().toISOString().slice(0, 10)}.${format}`;
        if (format === "json") {
            const payload = data.map((m) => ({
                name: m.resume?.basicInfo?.name,
                score: m.matchScore,
                details: m.details,
                highlights: m.highlights,
                filterPassed: m.filterPassed,
                rejectReasons: m.rejectReasons,
            }));
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            triggerDownload(blob, filename);
        } else {
            const headers = ["姓名", "总分", "技能匹配", "经验匹配", "学历匹配", "行业匹配", "项目匹配", "筛选通过"];
            const rows = data.map((m) => [
                m.resume?.basicInfo?.name ?? "",
                m.matchScore,
                m.details.skillsMatch,
                m.details.experienceMatch,
                m.details.educationMatch,
                m.details.industryMatch,
                m.details.projectMatch,
                m.filterPassed ? "是" : "否",
            ]);
            const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            triggerDownload(blob, filename);
        }
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    const sortedResults = useMemo(() => {
        const list = [...displayedResults];
        // 收藏置顶
        list.sort((a, b) => {
            const aFav = a.resumeId && favorites.has(a.resumeId);
            const bFav = b.resumeId && favorites.has(b.resumeId);
            if (aFav !== bFav) return aFav ? -1 : 1;
            if (a.filterPassed !== b.filterPassed) return a.filterPassed ? -1 : 1;
            if (sortBy === "score") return b.matchScore - a.matchScore;
            if (sortBy === "experience") {
                const aExp = parseInt(a.resume?.background?.workYears ?? "0") || 0;
                const bExp = parseInt(b.resume?.background?.workYears ?? "0") || 0;
                return bExp - aExp;
            }
            const eduOrder: Record<string, number> = { "博士": 5, "硕士": 4, "本科": 3, "大专": 2, "高中": 1 };
            const aEdu = eduOrder[a.resume?.background?.education ?? ""] ?? 0;
            const bEdu = eduOrder[b.resume?.background?.education ?? ""] ?? 0;
            return bEdu - aEdu;
        });
        // 关键词筛选 + 高级筛选
        const kw = searchKeyword.trim().toLowerCase();
        const advCityActive = cityFilter.length > 0;
        const advSalaryActive = salaryEnabled;
        const advAgeActive = ageEnabled;
        const advGenderActive = genderFilter !== "不限";
        const advActiveDays = lastActiveDays > 0;
        const advJobHoppingActive = jobHoppingFilter !== "不限";
        const advLangActive = languageFilter.length > 0;
        const advCertActive = certificateFilter.length > 0;
        const hasAdvanced = advCityActive || advSalaryActive || advAgeActive || advGenderActive || advActiveDays || advJobHoppingActive || advLangActive || advCertActive;

        return list.filter((m) => {
            if (scoreFilter > 0 && m.matchScore < scoreFilter) return false;
            if (showFavoritesOnly && !favorites.has(m.resumeId)) return false;
            if (!kw && !hasAdvanced) return true;
            if (kw) {
                const r = m.resume;
                const name = r?.basicInfo?.name?.toLowerCase() ?? "";
                const work = r?.background?.workYears?.toLowerCase() ?? "";
                const edu = r?.background?.education?.toLowerCase() ?? "";
                const skills = r?.skills?.join(" ").toLowerCase() ?? "";
                const pos = r?.jobInfo?.position?.toLowerCase() ?? "";
                if (!(name.includes(kw) || work.includes(kw) || edu.includes(kw) || skills.includes(kw) || pos.includes(kw))) return false;
            }
            // --- 高级筛选 ---
            const r = m.resume;
            if (!r) return true;
            // 城市：address 中包含目标城市
            if (advCityActive) {
                const addr = r.basicInfo.address?.toLowerCase() ?? "";
                if (!cityFilter.some((c) => addr.includes(c.toLowerCase()))) return false;
            }
            // 薪资：expectedSalary 模糊匹配
            if (advSalaryActive) {
                const salStr = r.jobInfo.expectedSalary ?? "";
                const salNum = parseInt(salStr.replace(/[^0-9]/g, "")) || 0;
                if (salNum > 0 && (salNum < salaryRange.min * 1000 || salNum > salaryRange.max * 1000)) return false;
            }
            // 年龄（resume 无此字段，跳过）
            // 性别（resume 无此字段，跳过）
            // 最近活跃（resume 无此字段，跳过）
            // 跳槽频率（resume 无此字段，跳过）
            // 语言：skills 中包含语言名
            if (advLangActive) {
                const skillSet = new Set(r.skills?.map((s) => s.toLowerCase()) ?? []);
                if (!languageFilter.some((l) => skillSet.has(l.toLowerCase()))) return false;
            }
            // 证书：skills 或 background 字段
            if (advCertActive) {
                const allText = ((r.skills ?? []).join(" ") + " " + (r.background?.university ?? "") + " " + (r.background?.major ?? "")).toLowerCase();
                if (!certificateFilter.some((c) => allText.includes(c.toLowerCase()))) return false;
            }
            return true;
        });
    }, [displayedResults, sortBy, searchKeyword, showFavoritesOnly, favorites, scoreFilter,
        cityFilter, salaryRange, salaryEnabled, ageRange, ageEnabled, genderFilter,
        lastActiveDays, jobHoppingFilter, languageFilter, certificateFilter]);

    const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2500);
    }, []);

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
            className="overflow-hidden"
        >
            <div className="p-2">
                {/* 筛选头部 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">筛选条件</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">配置精细化筛选规则，支持多条件组合</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
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
                    {templates.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setTemplateManageOpen(!templateManageOpen)}
                                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                            >
                                <Settings2 className="w-3.5 h-3.5" />
                                <span>管理模板 ({templates.length})</span>
                            </button>
                            <button
                                onClick={() => {
                                    const json = JSON.stringify(templates, null, 2);
                                    navigator.clipboard.writeText(json).then(() => showToast("success", "模板数据已复制到剪贴板"));
                                }}
                                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                title="导出模板"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>导出</span>
                            </button>
                            <label className="flex items-center space-x-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer" title="导入模板">
                                <Plus className="w-3.5 h-3.5" />
                                <span>导入</span>
                            </label>
                        </div>
                    )}
                </div>
                {/* 模板管理面板 */}
                <AnimatePresence>
                    {templateManageOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 bg-gray-50/80 dark:bg-gray-700/40 rounded-xl p-3 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">模板管理</p>
                                <button onClick={() => setTemplateManageOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            {renameTemplateId && (
                                <div className="flex items-center space-x-2 mb-3">
                                    <input
                                        type="text"
                                        value={renameTemplateName}
                                        onChange={(e) => setRenameTemplateName(e.target.value)}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => {
                                            if (renameTemplateName.trim()) {
                                                const updated = templates.map((t) => t.id === renameTemplateId ? { ...t, name: renameTemplateName.trim() } : t);
                                                setTemplates(updated);
                                                saveTemplates(updated);
                                                setRenameTemplateId(null);
                                                showToast("success", "模板已重命名");
                                            }
                                        }}
                                        className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                                    >确认</button>
                                    <button onClick={() => setRenameTemplateId(null)} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">取消</button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                {templates.map((t) => (
                                    <div key={t.id} className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden group/tpl">
                                        <button
                                            onClick={() => { loadTemplate(t); setTemplateManageOpen(false); }}
                                            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {t.name}
                                        </button>
                                        <button
                                            onClick={() => { setRenameTemplateId(t.id); setRenameTemplateName(t.name); }}
                                            className="px-1.5 py-1 text-gray-400 hover:text-purple-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            title="重命名"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(t.id)}
                                            className="px-1.5 py-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            title="删除"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 高级筛选（前端状态） */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setAdvancedExpanded(!advancedExpanded)}
                        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <Sliders className="w-4 h-4 text-fuchsia-500" />
                            <span>高级筛选</span>
                            <span className="text-xs text-gray-400">（城市 / 薪资 / 年龄 / 语言 / 证书 等）</span>
                            {(cityFilter.length > 0 || salaryEnabled || ageEnabled || lastActiveDays > 0 || languageFilter.length > 0 || certificateFilter.length > 0 || genderFilter !== "不限" || jobHoppingFilter !== "不限") && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 rounded-full font-medium">
                                    已启用
                                </span>
                            )}
                        </div>
                        {advancedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                        {advancedExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-5 overflow-hidden"
                            >
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {/* 城市/地区 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <MapPin className="w-4 h-4 text-rose-500" />
                                            <span>期望城市</span>
                                            {cityFilter.length > 0 && <span className="text-xs text-rose-600">已选 {cityFilter.length}</span>}
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {CITY_PRESETS.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setCityFilter((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                                        cityFilter.includes(c)
                                                            ? "bg-rose-500 text-white shadow-sm"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700"
                                                    }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex space-x-1.5">
                                            <input
                                                type="text"
                                                value={cityInput}
                                                onChange={(e) => setCityInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && cityInput.trim()) {
                                                        setCityFilter((prev) => prev.includes(cityInput.trim()) ? prev : [...prev, cityInput.trim()]);
                                                        setCityInput("");
                                                    }
                                                }}
                                                placeholder="自定义城市后回车"
                                                className="flex-1 px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (cityInput.trim()) {
                                                        setCityFilter((prev) => prev.includes(cityInput.trim()) ? prev : [...prev, cityInput.trim()]);
                                                        setCityInput("");
                                                    }
                                                }}
                                                className="px-2 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {cityFilter.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {cityFilter.map((c) => (
                                                    <span key={c} className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        <span>{c}</span>
                                                        <button onClick={() => setCityFilter((prev) => prev.filter((x) => x !== c))} className="hover:text-red-500">
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 薪资范围 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={salaryEnabled}
                                                onChange={(e) => setSalaryEnabled(e.target.checked)}
                                                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <Wallet className="w-4 h-4 text-emerald-500" />
                                            <span>期望薪资（K/月）</span>
                                            <span className="text-xs text-gray-400 ml-auto">
                                                {salaryRange.min === salaryRange.max ? `${salaryRange.min}K` : `${salaryRange.min}-${salaryRange.max}K`}
                                            </span>
                                        </label>
                                        <div className={`flex items-center space-x-3 ${!salaryEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                                            <input
                                                type="range"
                                                min={5}
                                                max={200}
                                                step={5}
                                                value={salaryRange.min}
                                                onChange={(e) => setSalaryRange((r) => ({ ...r, min: Math.min(Number(e.target.value), r.max) }))}
                                                className="flex-1 accent-emerald-600"
                                            />
                                            <span className="text-xs text-gray-500">至</span>
                                            <input
                                                type="range"
                                                min={5}
                                                max={200}
                                                step={5}
                                                value={salaryRange.max}
                                                onChange={(e) => setSalaryRange((r) => ({ ...r, max: Math.max(Number(e.target.value), r.min) }))}
                                                className="flex-1 accent-emerald-600"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                            <span>5K</span>
                                            <span>50K</span>
                                            <span>100K</span>
                                            <span>150K</span>
                                            <span>200K+</span>
                                        </div>
                                    </div>

                                    {/* 性别 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Heart className="w-4 h-4 text-pink-500" />
                                            <span>性别</span>
                                        </label>
                                        <div className="flex gap-2">
                                            {(["不限", "男", "女"] as const).map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => setGenderFilter(g)}
                                                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                        genderFilter === g
                                                            ? "bg-pink-500 text-white shadow-md"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                                                    }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 年龄段 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={ageEnabled}
                                                onChange={(e) => setAgeEnabled(e.target.checked)}
                                                className="w-3.5 h-3.5 rounded text-cyan-500 focus:ring-cyan-500"
                                            />
                                            <Calendar className="w-4 h-4 text-cyan-500" />
                                            <span>年龄段</span>
                                            <span className="text-xs text-gray-400 ml-auto">{ageRange.min}-{ageRange.max}岁</span>
                                        </label>
                                        <div className={`flex items-center space-x-3 ${!ageEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                                            <input
                                                type="range"
                                                min={18}
                                                max={60}
                                                value={ageRange.min}
                                                onChange={(e) => setAgeRange((r) => ({ ...r, min: Math.min(Number(e.target.value), r.max) }))}
                                                className="flex-1 accent-cyan-600"
                                            />
                                            <span className="text-xs text-gray-500">至</span>
                                            <input
                                                type="range"
                                                min={18}
                                                max={60}
                                                value={ageRange.max}
                                                onChange={(e) => setAgeRange((r) => ({ ...r, max: Math.max(Number(e.target.value), r.min) }))}
                                                className="flex-1 accent-cyan-600"
                                            />
                                        </div>
                                    </div>

                                    {/* 最近活跃 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Activity className="w-4 h-4 text-indigo-500" />
                                            <span>最近活跃</span>
                                            <span className="text-xs text-gray-400 ml-auto">{lastActiveDays === 0 ? "不限" : `${lastActiveDays}天内`}</span>
                                        </label>
                                        <div className="flex gap-1.5">
                                            {[0, 7, 15, 30, 60, 90].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => setLastActiveDays(d)}
                                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        lastActiveDays === d
                                                            ? "bg-indigo-500 text-white shadow-md"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                    }`}
                                                >
                                                    {d === 0 ? "不限" : `${d}天`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 跳槽频率 */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span>跳槽频率</span>
                                        </label>
                                        <div className="flex gap-1.5">
                                            {(["不限", "稳定", "中等", "频繁"] as const).map((j) => (
                                                <button
                                                    key={j}
                                                    onClick={() => setJobHoppingFilter(j)}
                                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        jobHoppingFilter === j
                                                            ? "bg-amber-500 text-white shadow-md"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                    }`}
                                                >
                                                    {j}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 语言能力 */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Languages className="w-4 h-4 text-blue-500" />
                                        <span>语言能力</span>
                                        {languageFilter.length > 0 && <span className="text-xs text-blue-600">已选 {languageFilter.length} 项</span>}
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {LANGUAGE_PRESETS.map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setLanguageFilter((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                    languageFilter.includes(l)
                                                        ? "bg-blue-500 text-white shadow-sm"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700"
                                                }`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 证书 */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Award className="w-4 h-4 text-yellow-500" />
                                        <span>证书要求</span>
                                        {certificateFilter.length > 0 && <span className="text-xs text-yellow-600">已选 {certificateFilter.length} 项</span>}
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {CERTIFICATE_PRESETS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setCertificateFilter((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                    certificateFilter.includes(c)
                                                        ? "bg-yellow-500 text-white shadow-sm"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700"
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 已启用条件快速一览 */}
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center space-x-1">
                                        <ChevronRight className="w-3 h-3" />
                                        <span>当前已启用的高级条件：</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cityFilter.length > 0 && <span className="text-xs px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded">城市 × {cityFilter.length}</span>}
                                        {salaryEnabled && <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">薪资 {salaryRange.min}-{salaryRange.max}K</span>}
                                        {ageEnabled && <span className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">年龄 {ageRange.min}-{ageRange.max}</span>}
                                        {genderFilter !== "不限" && <span className="text-xs px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded">{genderFilter}性</span>}
                                        {lastActiveDays > 0 && <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">活跃 {lastActiveDays}天内</span>}
                                        {jobHoppingFilter !== "不限" && <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">跳槽 {jobHoppingFilter}</span>}
                                        {languageFilter.length > 0 && <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">语言 × {languageFilter.length}</span>}
                                        {certificateFilter.length > 0 && <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">证书 × {certificateFilter.length}</span>}
                                        {cityFilter.length === 0 && !salaryEnabled && !ageEnabled && genderFilter === "不限" && lastActiveDays === 0 && jobHoppingFilter === "不限" && languageFilter.length === 0 && certificateFilter.length === 0 && (
                                            <span className="text-xs text-gray-400 italic">未设置任何高级条件</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                <BackButton />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                    {/* Hero Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-purple-500/30 mb-8 relative"
                        >
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                            <Search className="w-10 h-10 text-white relative z-10" />
                            <motion.div
                                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 blur-xl"
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
                            <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                岗位智能匹配
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            输入岗位要求，配置筛选条件，自动匹配最合适的候选人
                            <br className="hidden sm:block" />
                            <span className="text-purple-600 dark:text-purple-400 font-medium">多维度精准筛选，提升招聘效率</span>
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        {matchResults.length === 0 ? (
                            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                {/* 岗位描述 & 技能要求 */}
                                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                    <GlassCard delay={0.1} className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                                    <FileText className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">岗位描述</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">详细描述岗位职责和任职要求</p>
                                                </div>
                                            </div>
                                            {/* 模板下拉 */}
                                            <div className="relative group">
                                                <button className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors">
                                                    <Bookmark className="w-3.5 h-3.5" />
                                                    <span>模板库</span>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden max-h-80 overflow-y-auto">
                                                    {[
                                                        { title: "前端工程师", desc: "React/Vue 3年以上经验" },
                                                        { title: "后端开发", desc: "Java/Go 微服务架构" },
                                                        { title: "算法工程师", desc: "机器学习/深度学习" },
                                                        { title: "产品经理", desc: "B 端 SaaS 行业经验" },
                                                        { title: "UI 设计师", desc: "Figma/设计系统" },
                                                        { title: "数据分析师", desc: "SQL/Python/业务分析" },
                                                        { title: "运维工程师", desc: "K8s/Docker/云原生" },
                                                        { title: "测试工程师", desc: "自动化测试/性能测试" },
                                                    ].map((t, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setJobDescription(t.title + "：\n" + t.desc + "\n\n岗位职责：\n1. \n2. \n3. \n\n任职要求：\n1. \n2. \n3. ")}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                                        >
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <MarkdownToolbar
                                                value={jobDescription}
                                                onChange={setJobDescription}
                                                textareaRef={jdRef}
                                                preview={jdPreview}
                                                setPreview={setJdPreview}
                                                theme="purple"
                                            />
                                            {/* 字数统计 + 操作行 */}
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center space-x-2 flex-wrap">
                                                    {["前端", "后端", "全栈", "算法", "产品", "设计"].map((tag) => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => setJobDescription((prev) => (prev ? prev + "、" : "") + tag)}
                                                            className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors"
                                                        >
                                                            +{tag}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                    <span>{jobDescription.length}</span>
                                                    <span>/ 1000</span>
                                                </div>
                                            </div>
                                            {/* AI 优化建议 */}
                                            {jobDescription.length > 20 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-3 flex items-start space-x-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30"
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 text-xs text-purple-700 dark:text-purple-300">
                                                        <p className="font-medium">AI 建议</p>
                                                        <p className="mt-0.5">补充具体的技术栈、团队规模、业务场景等信息可提升匹配精度</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {/* JD 一键分析按钮 */}
                                            <div className="mt-3 flex items-center justify-between">
                                                <button
                                                    onClick={analyzeJD}
                                                    disabled={jdAnalyzing || !jobDescription.trim()}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-md shadow-purple-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                >
                                                    {jdAnalyzing ? (
                                                        <>
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                                                            />
                                                            <span>分析中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            <span>AI 分析 JD</span>
                                                        </>
                                                    )}
                                                </button>
                                                {jdAutoTags.length > 0 && (
                                                    <div className="flex items-center space-x-1.5 flex-wrap">
                                                        {jdAutoTags.map((tag) => (
                                                            <span key={tag} className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                                                # {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* JD 提取关键词展示 */}
                                            {jdExtractedKeywords.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-2 flex flex-wrap gap-1"
                                                >
                                                    <span className="text-[10px] text-gray-400 mr-1 leading-6">已提取：</span>
                                                    {jdExtractedKeywords.map((kw) => (
                                                        <button
                                                            key={kw}
                                                            onClick={() => {
                                                                const exists = filters.requiredSkills.some((s) => s.name.toLowerCase() === kw.toLowerCase());
                                                                if (!exists) {
                                                                    updateFilter("requiredSkills", [...filters.requiredSkills, { name: kw, weight: 2 }]);
                                                                    showToast("success", `已添加技能：${kw}`);
                                                                }
                                                            }}
                                                            className="text-[10px] px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-800/40 cursor-pointer transition-colors"
                                                        >
                                                            + {kw}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </div>
                                    </GlassCard>
                                    <GlassCard delay={0.2} className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">技能要求</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">关键技术栈与能力要求</p>
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <button className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors">
                                                    <Zap className="w-3.5 h-3.5" />
                                                    <span>技能速选</span>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden max-h-80 overflow-y-auto">
                                                    {[
                                                        { group: "前端", skills: ["React", "Vue", "TypeScript", "Webpack"] },
                                                        { group: "后端", skills: ["Java", "Go", "Python", "Node.js"] },
                                                        { group: "移动端", skills: ["iOS", "Android", "React Native", "Flutter"] },
                                                        { group: "数据", skills: ["MySQL", "Redis", "MongoDB", "Elasticsearch"] },
                                                        { group: "AI/算法", skills: ["机器学习", "深度学习", "NLP", "推荐系统"] },
                                                        { group: "运维", skills: ["Docker", "Kubernetes", "AWS", "Linux"] },
                                                    ].map((g, i) => (
                                                        <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                                            <p className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">{g.group}</p>
                                                            <div className="p-2 flex flex-wrap gap-1">
                                                                {g.skills.map((s) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => setRequirements((prev) => prev.includes(s) ? prev : (prev ? prev + "、" : "") + s)}
                                                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 hover:text-indigo-600 rounded transition-colors"
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <MarkdownToolbar
                                                value={requirements}
                                                onChange={setRequirements}
                                                textareaRef={reqRef}
                                                preview={reqPreview}
                                                setPreview={setReqPreview}
                                                theme="indigo"
                                            />
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center space-x-1 flex-wrap gap-1">
                                                    {Array.from(new Set(requirements.split(/[、,，\s]+/).filter(Boolean))).slice(0, 6).map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded">
                                                            <span>{tag}</span>
                                                            <button
                                                                onClick={() => setRequirements((prev) => prev.split(/[、,，\s]+/).filter((t) => t && t !== tag).join("、"))}
                                                                className="hover:text-red-500"
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                    <span>{requirements.split(/[、,，\s]+/).filter(Boolean).length}</span>
                                                    <span>个技能</span>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>

                                {/* 筛选条件区域 */}
                                <GlassCard delay={0.3} className="p-8 mb-8">
                                    <div className="flex items-center justify-center relative mb-4 flex-wrap gap-3">
                                        {/* 匹配模式选择 - 居中 */}
                                        <div className="relative p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5">
                                            <motion.div
                                                className="absolute top-1 bottom-1 rounded-xl shadow-md"
                                                animate={{ x: useCoze ? '100%' : '0%' }}
                                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                                style={{
                                                    left: 4,
                                                    right: 4,
                                                    width: 'calc(50% - 4px)',
                                                    background: useCoze
                                                        ? 'linear-gradient(to right, #a855f7, #8b5cf6)'
                                                        : 'linear-gradient(to right, #7c3aed, #6366f1)',
                                                }}
                                            />
                                            <div className="relative flex">
                                                <button
                                                    onClick={() => setUseCoze(false)}
                                                    className={`relative z-10 flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                        !useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    <span>规则匹配</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${!useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>快速</span>
                                                </button>
                                                <button
                                                    onClick={() => setUseCoze(true)}
                                                    className={`relative z-10 flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                                                        useCoze ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>AI 智能匹配</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${useCoze ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>精准</span>
                                                </button>
                                            </div>
                                        </div>
                                        {/* 展开/收起筛选 - 绝对定位到右侧 */}
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                                        >
                                            <Sliders className="w-4 h-4" />
                                            <span>{showFilters ? "收起筛选" : "展开筛选"}</span>
                                            {hasActiveFilters && (
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                            )}
                                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <AnimatePresence>{showFilters && <FilterPanel />}</AnimatePresence>
                                </GlassCard>

                                {/* 操作按钮 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                                >
                                    <GlowButton
                                        onClick={handleMatch}
                                        disabled={isMatching || resumes.length === 0}
                                        className="px-8 py-4"
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
                                    </GlowButton>
                                    {(jobDescription || requirements) && (
                                        <GlowButton variant="secondary" onClick={reset} className="px-6 py-4">
                                            <RefreshCcw className="w-5 h-5" />
                                            <span>重置</span>
                                        </GlowButton>
                                    )}
                                </motion.div>

                                {resumes.length === 0 && (
                                    <GlassCard delay={0.6} className="mt-8 p-12 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                                        <div className="relative z-10">
                                            <motion.div
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30"
                                            >
                                                <Users className="w-12 h-12 text-purple-500" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">暂无简历数据</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-1">请先上传并分析一些简历</p>
                                            <p className="text-sm text-gray-400 mb-8">完成简历分析后，系统将自动智能匹配最合适的候选人</p>
                                            <div className="flex flex-wrap items-center justify-center gap-3">
                                                <a
                                                    href="/analyze"
                                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all font-semibold"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>立即分析简历</span>
                                                </a>
                                                <a
                                                    href="/analyze"
                                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-white dark:hover:bg-gray-700 transition-all font-semibold"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span>上传简历</span>
                                                </a>
                                            </div>
                                            {/* 三步骤提示 */}
                                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                                {[
                                                    { step: 1, title: "上传简历", desc: "支持 PDF / Word", color: "from-blue-500 to-cyan-500" },
                                                    { step: 2, title: "AI 智能分析", desc: "自动提取关键信息", color: "from-purple-500 to-indigo-500" },
                                                    { step: 3, title: "岗位匹配", desc: "精准推荐候选人", color: "from-pink-500 to-rose-500" },
                                                ].map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.7 + i * 0.1 }}
                                                        className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 text-left"
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} text-white text-sm font-bold flex items-center justify-center mb-2 shadow-md`}>
                                                            {item.step}
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}
                            </motion.div>
                        ) : isMatching ? (
                            /* ==================== 匹配中骨架屏 ==================== */
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-6">
                                {/* 加载状态头部 */}
                                <GlassCard delay={0.1} className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl animate-pulse" />
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 border-4 border-transparent border-t-white border-r-white/50 rounded-2xl"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">AI 正在智能匹配候选人...</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                                <motion.span
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    ●
                                                </motion.span>
                                                <span>正在分析岗位需求 · 评估候选人技能 · 计算匹配分数</span>
                                            </p>
                                        </div>
                                    </div>
                                    {/* 进度条 */}
                                    <div className="mt-4 h-1.5 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "95%" }}
                                            transition={{ duration: 3, ease: "easeInOut" }}
                                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                </GlassCard>
                                {/* 骨架卡片 */}
                                {[1, 2, 3].map((i) => (
                                    <GlassCard key={i} delay={0.1 + i * 0.1} className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse" />
                                                <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse" />
                                            </div>
                                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-6 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
                                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="grid grid-cols-5 gap-2 mt-4">
                                                {[1, 2, 3, 4, 5].map((j) => (
                                                    <div key={j} className="h-16 bg-gradient-to-r from-gray-200/80 to-gray-300/80 dark:from-gray-700/80 dark:to-gray-600/80 rounded-lg animate-pulse" />
                                                ))}
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </motion.div>
                        ) : (
                            /* ==================== 结果页 ==================== */
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                {/* 结果头部 */}
                                <GlassCard delay={0.1} className="p-6 mb-6">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                                className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                            >
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">匹配完成</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    显示 {sortedResults.length} / {matchResults.length} 位候选人
                                                    {filterPreview && filterPreview.failed > 0 && (
                                                        <span> · {filterPreview.passed} 位通过 · {filterPreview.failed} 位未通过</span>
                                                    )}
                                                    {favorites.size > 0 && (
                                                        <span className="text-amber-600 dark:text-amber-400"> · ★ {favorites.size} 位已收藏</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* 排序 */}
                                            <div className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-1">
                                                {([
                                                    { key: "score", label: "综合分", icon: Star },
                                                    { key: "experience", label: "经验", icon: Clock },
                                                    { key: "education", label: "学历", icon: GraduationCap },
                                                ] as const).map(({ key, label, icon: Icon }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setSortBy(key)}
                                                        className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                            sortBy === key
                                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30'
                                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon className="w-3.5 h-3.5" />
                                                        <span>{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {/* 视图切换 */}
                                            <div className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-1">
                                                <button
                                                    onClick={() => setViewMode("detailed")}
                                                    className={`p-1.5 rounded-lg transition-all ${
                                                        viewMode === "detailed"
                                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                    title="详细视图"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("compact")}
                                                    className={`p-1.5 rounded-lg transition-all ${
                                                        viewMode === "compact"
                                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                    title="紧凑视图"
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* 显示未通过 */}
                                            {filterPreview && filterPreview.failed > 0 && (
                                                <button
                                                    onClick={() => setShowRejects(!showRejects)}
                                                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-xl border transition-all ${
                                                        showRejects
                                                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                                            : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{showRejects ? "隐藏" : "显示"}未通过</span>
                                                </button>
                                            )}
                                            {/* 对比 */}
                                            <button
                                                onClick={() => setShowCompare(true)}
                                                disabled={compareIds.size < 2}
                                                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-xl border transition-all ${
                                                    compareIds.size >= 2
                                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/30 hover:shadow-lg"
                                                        : "bg-white/60 dark:bg-gray-800/60 text-gray-400 border-gray-200/50 dark:border-gray-700/50 cursor-not-allowed"
                                                }`}
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                                <span>对比 ({compareIds.size})</span>
                                            </button>
                                            {/* 导出 */}
                                            <div className="relative group">
                                                <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 rounded-xl transition-all">
                                                    <Download className="w-4 h-4" />
                                                    <span>导出</span>
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                                                    <button
                                                        onClick={() => { exportResults("json"); showToast("success", "JSON 文件已下载"); }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors"
                                                    >
                                                        导出 JSON
                                                    </button>
                                                    <button
                                                        onClick={() => { exportResults("csv"); showToast("success", "CSV 文件已下载"); }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors border-t border-gray-100 dark:border-gray-700"
                                                    >
                                                        导出 CSV
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const text = sortedResults.map((m) => `${m.resume?.basicInfo?.name}: ${m.matchScore}%`).join("\n");
                                                            copyToClipboard(text);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors border-t border-gray-100 dark:border-gray-700"
                                                    >
                                                        复制文本
                                                    </button>
                                                </div>
                                            </div>
                                            {/* 重新匹配 */}
                                            <button
                                                onClick={reset}
                                                className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                                            >
                                                <RefreshCcw className="w-4 h-4" />
                                                <span>重新匹配</span>
                                            </button>
                                        </div>
                                    </div>
                                    {/* 第二行：搜索 + 分数筛选 + 收藏筛选 */}
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                        {/* 关键词搜索 */}
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="搜索候选人姓名..."
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                                            />
                                            {searchKeyword && (
                                                <button
                                                    onClick={() => setSearchKeyword("")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        {/* 分数筛选 */}
                                        <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-3 py-1.5">
                                            <Target className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">分数≥</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={scoreFilter}
                                                onChange={(e) => setScoreFilter(parseInt(e.target.value))}
                                                className="w-20 accent-purple-500"
                                            />
                                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-8 text-right">{scoreFilter}</span>
                                        </div>
                                        {/* 收藏筛选 */}
                                        <button
                                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-xl border transition-all ${
                                                showFavoritesOnly
                                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                                    : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300"
                                            }`}
                                        >
                                            <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                                            <span>仅收藏 ({favorites.size})</span>
                                        </button>
                                        {/* 清空筛选 */}
                                        {(searchKeyword || scoreFilter > 0 || showFavoritesOnly) && (
                                            <button
                                                onClick={() => {
                                                    setSearchKeyword("");
                                                    setScoreFilter(0);
                                                    setShowFavoritesOnly(false);
                                                }}
                                                className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                                            >
                                                <RefreshCcw className="w-3.5 h-3.5" />
                                                <span>重置</span>
                                            </button>
                                        )}
                                    </div>
                                </GlassCard>

                                {/* 批量操作栏 */}
                                {sortedResults.length > 0 && (
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkSelected.size === sortedResults.length && sortedResults.length > 0}
                                                    onChange={() => {
                                                        if (bulkSelected.size === sortedResults.length) {
                                                            setBulkSelected(new Set());
                                                        } else {
                                                            setBulkSelected(new Set(sortedResults.map((m) => m.resumeId)));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
                                                />
                                                <span>全选 ({bulkSelected.size}/{sortedResults.length})</span>
                                            </label>
                                        </div>
                                        {bulkSelected.size > 0 && (
                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    onClick={() => {
                                                        bulkSelected.forEach((id) => toggleFavorite(id));
                                                        showToast("success", `已批量收藏 ${bulkSelected.size} 位候选人`);
                                                        setBulkSelected(new Set());
                                                    }}
                                                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                                                >
                                                    <Star className="w-3.5 h-3.5" />
                                                    <span>批量收藏</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const data = sortedResults
                                                            .filter((m) => bulkSelected.has(m.resumeId) && m.resume)
                                                            .map((m) => ({ name: m.resume!.basicInfo.name, score: m.matchScore, skills: m.resume!.skills }));
                                                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url; a.download = "batch_candidates.json"; a.click();
                                                        URL.revokeObjectURL(url);
                                                        showToast("success", `已导出 ${data.length} 位候选人数据`);
                                                        setBulkSelected(new Set());
                                                    }}
                                                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>批量导出</span>
                                                </button>
                                                <button
                                                    onClick={() => setBulkSelected(new Set())}
                                                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    <span>取消选择</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 预览统计卡片 */}
                                {filterPreview && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/40 dark:border-gray-700/30 rounded-2xl p-4 shadow-lg shadow-gray-900/5 group hover:scale-[1.02] transition-transform"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Users className="w-4 h-4 text-purple-500" />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">总候选人</p>
                                            </div>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{filterPreview.total}</p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl p-4 shadow-lg shadow-emerald-500/5 group hover:scale-[1.02] transition-transform"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="flex items-center space-x-2 mb-2">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">通过筛选</p>
                                            </div>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{filterPreview.passed}</p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-4 shadow-lg shadow-red-500/5 group hover:scale-[1.02] transition-transform"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/15 to-pink-500/15 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="flex items-center space-x-2 mb-2">
                                                <X className="w-4 h-4 text-red-500" />
                                                <p className="text-xs text-red-600 dark:text-red-400">未通过</p>
                                            </div>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{filterPreview.failed}</p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-4 shadow-lg shadow-blue-500/5 group hover:scale-[1.02] transition-transform"
                                        >
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Target className="w-4 h-4 text-blue-500" />
                                                <p className="text-xs text-blue-600 dark:text-blue-400">匹配率</p>
                                            </div>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                {filterPreview.total > 0 ? Math.round((filterPreview.passed / filterPreview.total) * 100) : 0}%
                                            </p>
                                            <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${filterPreview.total > 0 ? (filterPreview.passed / filterPreview.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* 结果列表 */}
                                {sortedResults.length === 0 ? (
                                    <GlassCard delay={0.1} className="p-12 text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center">
                                            <Search className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">没有匹配的候选人</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            尝试调整搜索关键词、降低分数阈值或关闭"仅收藏"
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchKeyword("");
                                                setScoreFilter(0);
                                                setShowFavoritesOnly(false);
                                            }}
                                            className="inline-flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-md shadow-purple-500/30 hover:shadow-lg transition-all"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            <span>重置筛选</span>
                                        </button>
                                    </GlassCard>
                                ) : (
                                <div className="space-y-6">
                                    {sortedResults.map((match, index) => {
                                        if (!match.resume) return null;
                                        const isFav = favorites.has(match.resumeId);

                                        return (
                                            <motion.div
                                                key={match.resumeId}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                whileHover={{ y: -2 }}
                                                className={`relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-2 overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-shadow group ${
                                                    !match.filterPassed
                                                        ? "border-red-200/50 dark:border-red-800/30 opacity-80"
                                                        : index === 0 && match.filterPassed
                                                            ? "border-amber-300/60 dark:border-amber-600/40 shadow-amber-500/10"
                                                            : "border-white/40 dark:border-gray-700/30"
                                                } ${compareIds.has(match.resumeId) ? "ring-2 ring-blue-500/50 border-blue-300" : ""}`}
                                            >
                                                {/* 顶部渐变高光 */}
                                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                                                    !match.filterPassed
                                                        ? "from-red-400 to-pink-400"
                                                        : index === 0 && match.filterPassed
                                                            ? "from-amber-400 via-yellow-400 to-amber-400"
                                                            : "from-purple-400 via-indigo-400 to-purple-400"
                                                }`} />
                                                <div className="p-6">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center flex-wrap gap-3">
                                                                    {/* 对比多选框 */}
                                                                    <button
                                                                        onClick={() => toggleCompare(match.resumeId)}
                                                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                                            compareIds.has(match.resumeId)
                                                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 bg-white/60 dark:bg-gray-800/60'
                                                                        }`}
                                                                        title="加入对比"
                                                                    >
                                                                        {compareIds.has(match.resumeId) && <span className="text-xs">✓</span>}
                                                                    </button>
                                                                    {index === 0 && match.filterPassed && (
                                                                        <motion.div
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
                                                                            className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200/50 dark:border-amber-700/50"
                                                                        >
                                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                                            <span>最佳匹配</span>
                                                                        </motion.div>
                                                                    )}
                                                                    <div className={`px-4 py-2 rounded-xl border-2 font-bold text-lg shadow-sm ${getScoreColor(match.matchScore)}`}>
                                                                        {match.matchScore}%
                                                                    </div>
                                                                    {!match.filterPassed && (
                                                                        <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium border border-red-200 dark:border-red-800">
                                                                            未通过筛选
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* 收藏 + 详情 + 缺口 + 展开 按钮组 */}
                                                                <div className="flex items-center space-x-1">
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() => toggleFavorite(match.resumeId)}
                                                                        className={`p-2 rounded-xl transition-all ${
                                                                            isFav
                                                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
                                                                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-500'
                                                                        }`}
                                                                        title={isFav ? "取消收藏" : "收藏"}
                                                                    >
                                                                        <Star className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                                                                    </motion.button>
                                                                    <button
                                                                        onClick={() => setSelectedResume(match)}
                                                                        className="p-2 rounded-xl text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all"
                                                                        title="查看详情"
                                                                    >
                                                                        <FileText className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setGapTargetId(match.resumeId); setShowGapAnalysis(true); }}
                                                                        className="p-2 rounded-xl text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 transition-all"
                                                                        title="技能缺口分析"
                                                                    >
                                                                        <Target className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setExpandedCards((prev) => {
                                                                                const next = new Set(prev);
                                                                                next.has(match.resumeId) ? next.delete(match.resumeId) : next.add(match.resumeId);
                                                                                return next;
                                                                            });
                                                                        }}
                                                                        className={`p-2 rounded-xl transition-all ${
                                                                            expandedCards.has(match.resumeId)
                                                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                                                                                : 'text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600'
                                                                        }`}
                                                                        title={expandedCards.has(match.resumeId) ? "收起详情" : "展开详情"}
                                                                    >
                                                                        {expandedCards.has(match.resumeId) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="mb-4">
                                                                <ResumeCard resume={match.resume} showActions={false} />
                                                            </div>

                                                            {/* 行内展开：完整分析 */}
                                                            <AnimatePresence>
                                                                {expandedCards.has(match.resumeId) && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="mb-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/20 rounded-xl p-4 overflow-hidden"
                                                                    >
                                                                        {/* 分析内容 */}
                                                                        {match.resume.analysis && (
                                                                            <div className="mb-3">
                                                                                <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">AI 分析</h4>
                                                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{match.resume.analysis}</p>
                                                                            </div>
                                                                        )}
                                                                        {/* 匹配亮点列表 */}
                                                                        {match.highlights.length > 0 && (
                                                                            <div className="mb-3">
                                                                                <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">匹配亮点</h4>
                                                                                <ul className="space-y-1">
                                                                                    {match.highlights.map((h, i) => (
                                                                                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-1.5">
                                                                                            <ArrowUp className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                                            <span>{h}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        {/* 未通过筛选原因 */}
                                                                        {!match.filterPassed && match.rejectReasons && match.rejectReasons.length > 0 && (
                                                                            <div>
                                                                                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5">未通过原因</h4>
                                                                                <ul className="space-y-1">
                                                                                    {match.rejectReasons.map((reason, i) => (
                                                                                        <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start space-x-1.5">
                                                                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                                                                            <span>{reason}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>

                                                            {/* 五维匹配 */}
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                                                {[
                                                                    { label: "技能匹配", score: match.details.skillsMatch, icon: "💻" },
                                                                    { label: "经验匹配", score: match.details.experienceMatch, icon: "📅" },
                                                                    { label: "学历匹配", score: match.details.educationMatch, icon: "🎓" },
                                                                    { label: "行业匹配", score: match.details.industryMatch, icon: "🏢" },
                                                                    { label: "项目匹配", score: match.details.projectMatch, icon: "📋" },
                                                                ].map((item, i) => (
                                                                    <div key={i} className="bg-gray-50/80 dark:bg-gray-700/40 rounded-xl p-3 backdrop-blur-sm">
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
                                                            {viewMode === "detailed" && (
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
                                                            )}

                                                            {/* 未通过原因 */}
                                                            {!match.filterPassed && match.rejectReasons.length > 0 && viewMode === "detailed" && (
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
                                )}

                                {/* 浮动对比条 */}
                                <AnimatePresence>
                                    {compareIds.size > 0 && (
                                        <motion.div
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 100, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
                                        >
                                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl px-4 py-3 flex items-center space-x-3">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                                    <span>已选 <strong className="text-blue-600 dark:text-blue-400">{compareIds.size}</strong> / 4 位候选人对比</span>
                                                </div>
                                                <button
                                                    onClick={() => { setCompareIds(new Set()); }}
                                                    className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    清空
                                                </button>
                                                <button
                                                    onClick={() => setShowCompare(true)}
                                                    disabled={compareIds.size < 2}
                                                    className="inline-flex items-center space-x-1 px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span>开始对比</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                {/* ==================== 常驻创意模块区（无需匹配） ==================== */}
                <div className="mt-12 space-y-8">
                    {/*  1：JD 模板库 — 一键填入 */}
                    <GlassCard delay={0.3} className="p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">热门岗位模板</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">点击即可一键填入岗位描述与技能要求，快速开始匹配</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: "⚛️", title: "React 前端", desc: "React / TypeScript / Node.js", jd: "负责公司核心产品的前端开发与维护，使用 React + TypeScript 构建高性能 SPA 应用；参与技术方案设计与 Code Review；与设计、后端团队紧密协作。", req: "React、TypeScript、JavaScript、CSS、Webpack、Git" },
                                { icon: " ️", title: "Java 后端", desc: "Spring / MySQL / Redis", jd: "负责后端微服务架构的设计与开发；使用 Spring Boot 构建 RESTful API；设计数据库表结构并优化 SQL 查询性能；参与系统高可用与高并发方案设计。", req: "Java、Spring Boot、MySQL、Redis、微服务、Docker" },
                                { icon: " ", title: "全栈工程师", desc: "React + Go/Node", jd: "负责全栈开发，前端使用 React/Vue，后端使用 Node.js 或 Go；独立完成从需求分析到上线的全流程；关注工程化与代码质量。", req: "React、Vue、Node.js、Go、TypeScript、Docker" },
                                { icon: " ", title: "算法工程师", desc: "Python / PyTorch", jd: "负责推荐系统/搜索/NLP 相关算法的研究与落地；搭建模型训练与评估 pipeline；持续优化线上指标（CTR/CVR 等）。", req: "Python、PyTorch、TensorFlow、机器学习、深度学习、SQL" },
                                { icon: "☁️", title: "DevOps 工程师", desc: "K8s / CI/CD / AWS", jd: "负责 CI/CD 流水线搭建与维护；管理 Kubernetes 集群与云上资源；推进基础设施自动化与监控告警体系建设。", req: "Docker、Kubernetes、AWS、Linux、Terraform、Prometheus" },
                                { icon: " ", title: "产品经理", desc: "需求 / 原型 / 数据驱动", jd: "负责产品需求调研与竞品分析；撰写 PRD 并推动设计与开发落地；通过数据分析驱动产品迭代与增长。", req: "需求分析、Axure、SQL、数据分析、项目管理" },
                                { icon: " ️", title: "UI/UX 设计师", desc: "Figma / Sketch / 交互设计", jd: "负责产品 UI 设计与交互优化；建立并维护 Design System；参与用户研究与可用性测试。", req: "Figma、Sketch、Adobe XD、交互设计、设计系统" },
                                { icon: " ", title: "数据分析师", desc: "SQL / Python / BI", jd: "负责业务数据的提取、清洗与分析；搭建数据看板与自动化报表；输出数据洞察驱动业务决策。", req: "SQL、Python、Tableau、数据分析、统计学" },
                            ].map((tpl, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setJobDescription(tpl.jd);
                                        setRequirements(tpl.req);
                                        showToast("success", `已填入「${tpl.title}」模板`);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="text-left p-4 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
                                >
                                    <span className="text-2xl block mb-2">{tpl.icon}</span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tpl.title}</h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{tpl.desc}</p>
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>

                    {/*  2：简历质量速查表 */}
                    <GlassCard delay={0.4} className="p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <ClipboardCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">简历质量速查表</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">上传简历前自查以下要点，提高通过率</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0 }}
                                viewport={{ once: true }}
                                className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30"
                            >
                                <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-3">基本信息</h4>
                                <ul className="space-y-2">
                                    {["姓名、手机、邮箱完整", "求职意向明确", "照片专业得体", "工作年限与目标岗位匹配"].map((item, ii) => (
                                        <li key={ii} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                viewport={{ once: true }}
                                className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30"
                            >
                                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3">工作经历</h4>
                                <ul className="space-y-2">
                                    {["用 STAR 法则描述成果", "突出量化数据（提升X%）", "近 3 段经历详细描述", "行业/岗位相关性高"].map((item, ii) => (
                                        <li key={ii} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                viewport={{ once: true }}
                                className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/30"
                            >
                                <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">技能亮点</h4>
                                <ul className="space-y-2">
                                    {["技能与 JD 关键词匹配", "熟练程度描述合理", "有项目案例佐证", "新技术栈有学习记录"].map((item, ii) => (
                                        <li key={ii} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </GlassCard>

                    {/*  3：AI 面试准备指南 */}
                    <GlassCard delay={0.5} className="p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI 面试准备指南</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">智能匹配岗位的高频面试题与应答策略</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* 左：面试高频问题 */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4 text-rose-500" />
                                    <span>面试高频问题</span>
                                </h4>
                                {[
                                    { q: "请做一下自我介绍", tip: "用 1 分钟浓缩核心经历，重点突出与岗位匹配的技能和项目" },
                                    { q: "你最大的技术挑战是什么？", tip: "用 STAR 法：背景→任务→行动→结果，量化成果" },
                                    { q: "为什么选择我们公司？", tip: "提前研究公司产品与技术栈，展示真实兴趣" },
                                    { q: "你对未来 3-5 年有什么规划？", tip: "展示成长意愿与稳定性，与岗位发展路径对齐" },
                                    { q: "你有什么想问我的？", tip: "问团队技术栈/项目挑战/成长机制，不要问薪资福利" },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        viewport={{ once: true }}
                                        className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50"
                                    >
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.q}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">💡 {item.tip}</p>
                                    </motion.div>
                                ))}
                            </div>
                            {/* 右：应答框架 + 技巧 */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    <span>应答框架与技巧</span>
                                </h4>
                                {/* STAR 框架 */}
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                    <h5 className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">STAR 回答法</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { letter: "S", label: "Situation", desc: "背景情境", color: "bg-amber-500" },
                                            { letter: "T", label: "Task", desc: "目标任务", color: "bg-orange-500" },
                                            { letter: "A", label: "Action", desc: "采取行动", color: "bg-red-500" },
                                            { letter: "R", label: "Result", desc: "最终成果", color: "bg-pink-500" },
                                        ].map((s, si) => (
                                            <div key={si} className="flex items-center space-x-2 p-2 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                                                <span className={`w-7 h-7 ${s.color} text-white text-xs font-bold rounded-lg flex items-center justify-center`}>{s.letter}</span>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{s.label}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{s.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* 5 个技巧 */}
                                <div className="space-y-2">
                                    {[
                                        { icon: " ", title: "量化成果", desc: "用数字说话：提升 30% 性能、减少 50% bug" },
                                        { icon: "⏳", title: "控制节奏", desc: "每个问题 2-3 分钟，不要超时或过于简短" },
                                        { icon: " ", title: "展示思考", desc: "回答前先停顿思考 2 秒，展示逻辑性" },
                                        { icon: " ", title: "真诚面对", desc: "不会的问题诚实说，展示学习意愿" },
                                        { icon: " ", title: "互动提问", desc: "主动与面试官互动，展示沟通能力" },
                                    ].map((tip, ti) => (
                                        <motion.div
                                            key={ti}
                                            initial={{ opacity: 0, x: 10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: ti * 0.08 }}
                                            viewport={{ once: true }}
                                            className="flex items-start space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/50"
                                        >
                                            <span className="text-lg flex-shrink-0">{tip.icon}</span>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{tip.title}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{tip.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* ==================== 匹配后创意模块区（需要数据） ==================== */}
                {matchResults.length > 0 && (
                    <div className="mt-12 space-y-8">
                        {/* 模块一：智能面试题生成 */}
                        <GlassCard delay={0.3} className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">智能面试题推荐</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">基于 JD 需求和候选人技能缺口，自动生成针对性面试题目</p>
                                    </div>
                                </div>
                            </div>
                            {/* 三类题目 */}
                            <div className="grid md:grid-cols-3 gap-4">
                                {[
                                    {
                                        icon: "🎯",
                                        title: "技术基础题",
                                        color: "from-blue-500 to-cyan-500",
                                        bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
                                        questions: (() => {
                                            const req = requirements.split(/[、,，\s]+/).filter(Boolean).slice(0, 3);
                                            if (req.length === 0) return ["请描述你最熟悉的语言的核心特性", "HTTP 协议的工作原理是什么？", "什么是 RESTful API？"];
                                            return req.map((s, i) => {
                                                const qs = [
                                                    `请简述 ${s} 的核心原理与最佳实践`,
                                                    `${s} 在实际项目中有哪些应用场景？`,
                                                    `在 ${s} 开发中遇到过哪些性能瓶颈？`,
                                                ];
                                                return qs[i % qs.length];
                                            });
                                        })(),
                                    },
                                    {
                                        icon: "🧩",
                                        title: "项目经验题",
                                        color: "from-emerald-500 to-teal-500",
                                        bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
                                        questions: [
                                            "请介绍一个你主导的最有挑战性的项目",
                                            "在项目中如何做技术选型和架构设计？",
                                            "遇到项目延期或需求变更时你是如何应对的？",
                                        ],
                                    },
                                    {
                                        icon: "💡",
                                        title: "综合能力题",
                                        color: "from-purple-500 to-indigo-500",
                                        bg: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
                                        questions: [
                                            jobDescription.length > 50
                                                ? `根据 JD 描述："${jobDescription.slice(0, 40)}..."，你认为这个岗位最大的挑战是什么？`
                                                : "你认为自己最大的技术优势是什么？",
                                            "你是如何保持技术学习和成长的？",
                                            "如何看待 AI 对开发者工作的影响？",
                                        ],
                                    },
                                ].map((cat, ci) => (
                                    <motion.div
                                        key={ci}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: ci * 0.1 }}
                                        viewport={{ once: true }}
                                        className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50`}
                                    >
                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-2xl">{cat.icon}</span>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{cat.title}</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {cat.questions.map((q, qi) => (
                                                <li key={qi} className="flex items-start space-x-2">
                                                    <span className="w-5 h-5 rounded-full bg-white/80 dark:bg-gray-800/80 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {qi + 1}
                                                    </span>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                            {/* 操作按钮 */}
                            <div className="mt-5 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        const allQ = [
                                            ...(() => {
                                                const req = requirements.split(/[、,，\s]+/).filter(Boolean).slice(0, 3);
                                                if (req.length === 0) return ["请描述你最熟悉的语言的核心特性", "HTTP 协议的工作原理是什么？", "什么是 RESTful API？"];
                                                return req.map((s, i) => {
                                                    const qs = [
                                                        `请简述 ${s} 的核心原理与最佳实践`,
                                                        `${s} 在实际项目中有哪些应用场景？`,
                                                        `在 ${s} 开发中遇到过哪些性能瓶颈？`,
                                                    ];
                                                    return qs[i % qs.length];
                                                });
                                            })(),
                                            "请介绍一个你主导的最有挑战性的项目",
                                            "在项目中如何做技术选型和架构设计？",
                                            "遇到项目延期或需求变更时你是如何应对的？",
                                            jobDescription.length > 50
                                                ? `根据 JD 描述："${jobDescription.slice(0, 40)}..."，你认为这个岗位最大的挑战是什么？`
                                                : "你认为自己最大的技术优势是什么？",
                                            "你是如何保持技术学习和成长的？",
                                            "如何看待 AI 对开发者工作的影响？",
                                        ];
                                        navigator.clipboard.writeText(allQ.map((q, i) => `${i + 1}. ${q}`).join("\n\n"));
                                        showToast("success", "面试题已复制到剪贴板");
                                    }}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>复制全部面试题</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const allQ = [
                                            ...(() => {
                                                const req = requirements.split(/[、,，\s]+/).filter(Boolean).slice(0, 3);
                                                if (req.length === 0) return ["请描述你最熟悉的语言的核心特性", "HTTP 协议的工作原理是什么？", "什么是 RESTful API？"];
                                                return req.map((s, i) => {
                                                    const qs = [
                                                        `请简述 ${s} 的核心原理与最佳实践`,
                                                        `${s} 在实际项目中有哪些应用场景？`,
                                                        `在 ${s} 开发中遇到过哪些性能瓶颈？`,
                                                    ];
                                                    return qs[i % qs.length];
                                                });
                                            })(),
                                            "请介绍一个你主导的最有挑战性的项目",
                                            "在项目中如何做技术选型和架构设计？",
                                            "遇到项目延期或需求变更时你是如何应对的？",
                                            jobDescription.length > 50
                                                ? `根据 JD 描述："${jobDescription.slice(0, 40)}..."，你认为这个岗位最大的挑战是什么？`
                                                : "你认为自己最大的技术优势是什么？",
                                            "你是如何保持技术学习和成长的？",
                                            "如何看待 AI 对开发者工作的影响？",
                                        ];
                                        const blob = new Blob([allQ.map((q, i) => `${i + 1}. ${q}`).join("\n\n")], { type: "text/plain" });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url; a.download = "面试题_智能推荐.txt"; a.click();
                                        URL.revokeObjectURL(url);
                                        showToast("success", "面试题已下载");
                                    }}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-md shadow-rose-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>下载面试题</span>
                                </button>
                            </div>
                        </GlassCard>

                        {/* 模块二：岗位竞争力分析 */}
                        <GlassCard delay={0.4} className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">岗位竞争力分析</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">候选人竞争力雷达图、人才梯队分布与综合评估</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid lg:grid-cols-3 gap-5">
                                {/* 人才梯队 */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/30">
                                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center space-x-2">
                                        <Award className="w-4 h-4" />
                                        <span>人才梯队分布</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { tier: "S 级 (≥85)", count: sortedResults.filter((r) => r.matchScore >= 85).length, color: "bg-amber-500", pct: Math.round(sortedResults.filter((r) => r.matchScore >= 85).length / Math.max(sortedResults.length, 1) * 100) },
                                            { tier: "A 级 (70-84)", count: sortedResults.filter((r) => r.matchScore >= 70 && r.matchScore < 85).length, color: "bg-orange-500", pct: Math.round(sortedResults.filter((r) => r.matchScore >= 70 && r.matchScore < 85).length / Math.max(sortedResults.length, 1) * 100) },
                                            { tier: "B 级 (50-69)", count: sortedResults.filter((r) => r.matchScore >= 50 && r.matchScore < 70).length, color: "bg-yellow-500", pct: Math.round(sortedResults.filter((r) => r.matchScore >= 50 && r.matchScore < 70).length / Math.max(sortedResults.length, 1) * 100) },
                                            { tier: "C 级 (<50)", count: sortedResults.filter((r) => r.matchScore < 50).length, color: "bg-gray-400", pct: Math.round(sortedResults.filter((r) => r.matchScore < 50).length / Math.max(sortedResults.length, 1) * 100) },
                                        ].map((tier, i) => (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{tier.tier}</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{tier.count} 人 ({tier.pct}%)</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${tier.pct}%` }}
                                                        transition={{ duration: 1, delay: i * 0.15 }}
                                                        viewport={{ once: true }}
                                                        className={`h-full ${tier.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 竞争力雷达 */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30 flex flex-col items-center">
                                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-4 text-center flex items-center space-x-2">
                                        <Target className="w-4 h-4" />
                                        <span>竞争力雷达</span>
                                    </h4>
                                    <div className="relative w-40 h-40">
                                        <svg viewBox="0 0 120 120" className="w-full h-full">
                                            {[20, 40, 60, 80].map((r, i) => (
                                                <polygon
                                                    key={i}
                                                    points="60,15 113,60 60,105 7,60"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="0.5"
                                                    className="text-gray-200 dark:text-gray-600"
                                                    transform={`scale(${r / 100})`}
                                                    style={{ transformOrigin: "60px 60px" }}
                                                />
                                            ))}
                                            {/* 五维数据 */}
                                            {(() => {
                                                const dims = [
                                                    { label: "技能", val: Math.round(sortedResults.reduce((s, r) => s + r.details.skillsMatch, 0) / Math.max(sortedResults.length, 1)) },
                                                    { label: "经验", val: Math.round(sortedResults.reduce((s, r) => s + r.details.experienceMatch, 0) / Math.max(sortedResults.length, 1)) },
                                                    { label: "学历", val: Math.round(sortedResults.reduce((s, r) => s + r.details.educationMatch, 0) / Math.max(sortedResults.length, 1)) },
                                                    { label: "行业", val: Math.round(sortedResults.reduce((s, r) => s + r.details.industryMatch, 0) / Math.max(sortedResults.length, 1)) },
                                                    { label: "项目", val: Math.round(sortedResults.reduce((s, r) => s + r.details.projectMatch, 0) / Math.max(sortedResults.length, 1)) },
                                                ];
                                                const angles = [270, 342, 54, 126, 198].map((a) => (a * Math.PI) / 180);
                                                const pts = dims.map((d, i) => {
                                                    const r = (d.val / 100) * 48 + 12;
                                                    return `${60 + r * Math.cos(angles[i])},${60 + r * Math.sin(angles[i])}`;
                                                });
                                                const ptsFull = dims.map((_, i) => {
                                                    const r = 60;
                                                    return `${60 + r * Math.cos(angles[i])},${60 + r * Math.sin(angles[i])}`;
                                                });
                                                return (
                                                    <>
                                                        <polygon points={ptsFull.join(" ")} fill="rgba(59,130,246,0.06)" stroke="none" />
                                                        <polygon points={pts.join(" ")} fill="rgba(59,130,246,0.15)" stroke="rgb(59,130,246)" strokeWidth="1.5" />
                                                        {dims.map((d, i) => (
                                                            <g key={i}>
                                                                <circle cx={pts[i].split(",")[0]} cy={pts[i].split(",")[1]} r="2.5" fill="rgb(59,130,246)" />
                                                                <text
                                                                    x={ptsFull[i].split(",")[0]}
                                                                    y={parseFloat(ptsFull[i].split(",")[1]) + (i === 2 ? 4 : i === 3 ? 0 : -3)}
                                                                    textAnchor="middle"
                                                                    className="fill-gray-500 dark:fill-gray-400"
                                                                    style={{ fontSize: "7px" }}
                                                                >
                                                                    {d.label}
                                                                </text>
                                                            </g>
                                                        ))}
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                    </div>
                                </div>

                                {/* 综合评估 */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
                                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center space-x-2">
                                        <Bookmark className="w-4 h-4" />
                                        <span>综合评估建议</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {(() => {
                                            const avgScore = Math.round(sortedResults.reduce((s, r) => s + r.matchScore, 0) / Math.max(sortedResults.length, 1));
                                            const topCount = sortedResults.filter((r) => r.matchScore >= 80).length;
                                            const suggestions: string[] = [];
                                            if (topCount >= 3) suggestions.push("人才储备充足，可优先面试 S 级候选人");
                                            else if (topCount >= 1) suggestions.push("有合适人选但数量偏少，建议扩大招聘渠道");
                                            else suggestions.push("目前候选人匹配度偏低，建议放宽筛选条件或调整 JD");

                                            const avgSkill = Math.round(sortedResults.reduce((s, r) => s + r.details.skillsMatch, 0) / Math.max(sortedResults.length, 1));
                                            if (avgSkill < 60) suggestions.push("整体技能匹配度不足，建议审视岗位需求是否合理");
                                            if (sortedResults.length > 10) suggestions.push("候选人池丰富，可考虑提高筛选门槛");
                                            if (sortedResults.length <= 3) suggestions.push("候选人数偏少，建议增加简历上传或降低筛选标准");

                                            return (
                                                <>
                                                    <div className="flex items-center space-x-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl">
                                                        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{avgScore}</span>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">平均匹配分</p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{sortedResults.length} 位候选人</p>
                                                        </div>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {suggestions.map((sg, i) => (
                                                            <li key={i} className="flex items-start space-x-1.5 text-xs text-gray-700 dark:text-gray-300">
                                                                <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                <span>{sg}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* 模块三：匹配健康度仪表盘 */}
                        <div className="grid lg:grid-cols-4 gap-5">
                            {[
                                {
                                    label: "平均匹配分",
                                    value: Math.round(sortedResults.reduce((s, r) => s + r.matchScore, 0) / Math.max(sortedResults.length, 1)),
                                    suffix: "分",
                                    icon: Star,
                                    color: "from-violet-500 to-purple-600",
                                    bgColor: "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
                                },
                                {
                                    label: "技能覆盖率",
                                    value: (() => {
                                        const req = new Set(requirements.split(/[、,，\s]+/).filter(Boolean).map((s) => s.toLowerCase()));
                                        if (req.size === 0) return 100;
                                        const covered = new Set<string>();
                                        sortedResults.forEach((m) => {
                                            (m.resume?.skills ?? []).forEach((s) => {
                                                req.forEach((rs) => { if (s.toLowerCase().includes(rs) || rs.includes(s.toLowerCase())) covered.add(rs); });
                                            });
                                        });
                                        return Math.round((covered.size / req.size) * 100);
                                    })(),
                                    suffix: "%",
                                    icon: Zap,
                                    color: "from-cyan-500 to-blue-600",
                                    bgColor: "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
                                },
                                {
                                    label: "收藏率",
                                    value: favorites.size,
                                    suffix: `/${sortedResults.length}`,
                                    icon: Heart,
                                    color: "from-rose-500 to-pink-600",
                                    bgColor: "from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
                                },
                                {
                                    label: "对比组数",
                                    value: compareIds.size,
                                    suffix: "人",
                                    icon: Layers,
                                    color: "from-amber-500 to-orange-600",
                                    bgColor: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -4 }}
                                    className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg group cursor-default`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                                        <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                                            <stat.icon className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline space-x-2">
                                        <motion.span
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: i * 0.15 + 0.3, type: "spring" }}
                                            viewport={{ once: true }}
                                            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent"
                                        >
                                            {stat.value}
                                        </motion.span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{stat.suffix}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Toast 通知 */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key={toast.message}
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -80, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className={`px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center space-x-2 ${
                            toast.type === "success" ? "bg-emerald-500/95 text-white" :
                            toast.type === "error" ? "bg-red-500/95 text-white" :
                            "bg-blue-500/95 text-white"
                        }`}>
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 对比弹窗 */}
            <AnimatePresence>
                {showCompare && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowCompare(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-6xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 头部 */}
                            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5">
                                <button
                                    onClick={() => setShowCompare(false)}
                                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">候选人对比</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">横向对比 {compareIds.size} 位候选人的五维匹配数据</p>
                            </div>
                            {/* 对比表格 */}
                            <div className="flex-1 overflow-auto p-6">
                                <div className={`grid gap-4`} style={{ gridTemplateColumns: `120px repeat(${compareIds.size}, minmax(0, 1fr))` }}>
                                    {/* 标题行 */}
                                    <div></div>
                                    {Array.from(compareIds).map((id) => {
                                        const m = sortedResults.find((r) => r.resumeId === id);
                                        if (!m || !m.resume) return null;
                                        return (
                                            <div key={id} className="text-center">
                                                <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md border-2 mb-2 ${getScoreColor(m.matchScore)}`}>
                                                    {m.matchScore}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.resume.basicInfo.name}</p>
                                            </div>
                                        );
                                    })}
                                    {/* 数据行 */}
                                    {[
                                        { label: "技能匹配", key: "skillsMatch" as const, color: "from-purple-500 to-indigo-500" },
                                        { label: "经验匹配", key: "experienceMatch" as const, color: "from-blue-500 to-cyan-500" },
                                        { label: "学历匹配", key: "educationMatch" as const, color: "from-emerald-500 to-teal-500" },
                                        { label: "行业匹配", key: "industryMatch" as const, color: "from-amber-500 to-orange-500" },
                                        { label: "项目匹配", key: "projectMatch" as const, color: "from-pink-500 to-rose-500" },
                                    ].map((row) => {
                                        const values = Array.from(compareIds).map((id) => {
                                            const m = sortedResults.find((r) => r.resumeId === id);
                                            return m?.details[row.key] ?? 0;
                                        });
                                        const max = Math.max(...values);
                                        return (
                                            <div key={row.key} className="contents">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 self-center">{row.label}</div>
                                                {values.map((v, i) => {
                                                    const id = Array.from(compareIds)[i];
                                                    const isBest = v === max && values.filter(x => x === max).length === 1;
                                                    return (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-lg font-bold ${getScoreColor(v).split(" ")[0]}`}>
                                                                    {v}%
                                                                    {isBest && <span className="ml-1 text-xs text-amber-500">★</span>}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${v}%` }}
                                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                                    className={`h-full bg-gradient-to-r ${row.color} rounded-full`}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                    {/* 操作行 */}
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 self-center">操作</div>
                                    {Array.from(compareIds).map((id) => {
                                        const m = sortedResults.find((r) => r.resumeId === id);
                                        if (!m || !m.resume) return null;
                                        return (
                                            <div key={id} className="flex flex-col space-y-1">
                                                <button
                                                    onClick={() => { setSelectedResume(m); setShowCompare(false); }}
                                                    className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                                >
                                                    查看详情
                                                </button>
                                                <button
                                                    onClick={() => toggleCompare(id)}
                                                    className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    移出对比
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 技能缺口分析弹窗 */}
            <AnimatePresence>
                {showGapAnalysis && gapTargetId && (() => {
                    const m = sortedResults.find((r) => r.resumeId === gapTargetId);
                    if (!m || !m.resume) return null;
                    const r = m.resume;
                    const reqSkills = new Set(requirements.split(/[、,，\s]+/).filter(Boolean).map((s) => s.toLowerCase()));
                    const candidateSkills = new Set((r.skills ?? []).map((s) => s.toLowerCase()));
                    const matched: string[] = [];
                    const missing: string[] = [];
                    reqSkills.forEach((rs) => {
                        let found = false;
                        for (const cs of candidateSkills) {
                            if (cs.includes(rs) || rs.includes(cs)) { matched.push(rs); found = true; break; }
                        }
                        if (!found) missing.push(rs);
                    });
                    const jdSkills = jdExtractedKeywords.length > 0
                        ? jdExtractedKeywords.map((k) => k.toLowerCase())
                        : [...reqSkills];
                    const jdMatched = jdSkills.filter((js) => [...candidateSkills].some((cs) => cs.includes(js) || js.includes(cs)));
                    const jdMissing = jdSkills.filter((js) => !jdMatched.includes(js));
                    const matchRate = reqSkills.size > 0 ? Math.round((matched.length / reqSkills.size) * 100) : 100;
                    const overallRate = jdSkills.length > 0 ? Math.round((jdMatched.length / jdSkills.length) * 100) : matchRate;

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            onClick={() => { setShowGapAnalysis(false); setGapTargetId(null); }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[80vh] shadow-2xl flex flex-col overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5">
                                    <button
                                        onClick={() => { setShowGapAnalysis(false); setGapTargetId(null); }}
                                        className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">技能缺口分析</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {r.basicInfo.name} · 需求匹配率 <span className={`font-bold ${overallRate >= 70 ? "text-emerald-600" : overallRate >= 40 ? "text-amber-600" : "text-red-600"}`}>{overallRate}%</span>
                                    </p>
                                </div>
                                <div className="flex-1 overflow-auto p-6">
                                    {/* 匹配概览 */}
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative w-24 h-24">
                                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                                                    className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
                                                <motion.circle cx="50" cy="50" r="42" fill="none"
                                                    initial={{ strokeDasharray: "264 264", strokeDashoffset: 264 }}
                                                    animate={{ strokeDashoffset: 264 - (overallRate / 100) * 264 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    stroke="currentColor"
                                                    className={`${overallRate >= 70 ? "text-emerald-500" : overallRate >= 40 ? "text-amber-500" : "text-red-500"}`}
                                                    strokeWidth="10" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className={`text-xl font-bold ${overallRate >= 70 ? "text-emerald-600" : overallRate >= 40 ? "text-amber-600" : "text-red-600"}`}>{overallRate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 需求技能匹配 */}
                                    {reqSkills.size > 0 && (
                                        <div className="mb-5">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">技能要求匹配</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">已匹配 ({matched.length}/{reqSkills.size})</p>
                                                    <div className="space-y-1">
                                                        {matched.length > 0 ? matched.map((s) => (
                                                            <div key={s} className="flex items-center space-x-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                <span className="capitalize">{s}</span>
                                                            </div>
                                                        )) : <p className="text-xs text-gray-400 italic px-3 py-1">无匹配技能</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">缺失技能 ({missing.length}/{reqSkills.size})</p>
                                                    <div className="space-y-1">
                                                        {missing.length > 0 ? missing.map((s) => (
                                                            <div key={s} className="flex items-center space-x-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                <span className="capitalize">{s}</span>
                                                            </div>
                                                        )) : <p className="text-xs text-gray-400 italic px-3 py-1">全部匹配</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* JD 关键词分析 */}
                                    {jdSkills.length > 0 && (
                                        <div className="mb-5">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">JD 关键词覆盖</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">已覆盖 ({jdMatched.length})</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {jdMatched.map((s) => (
                                                            <span key={s} className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded capitalize">{s}</span>
                                                        ))}
                                                        {jdMatched.length === 0 && <span className="text-xs text-gray-400 italic">无</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">未覆盖 ({jdMissing.length})</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {jdMissing.map((s) => (
                                                            <span key={s} className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded capitalize">{s}</span>
                                                        ))}
                                                        {jdMissing.length === 0 && <span className="text-xs text-gray-400 italic">全部覆盖</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 候选人所有技能 */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">候选人技能全景 ({r.skills?.length ?? 0})</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(r.skills ?? []).map((s) => {
                                                const isReq = reqSkills.has(s.toLowerCase());
                                                return (
                                                    <span key={s} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isReq ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                                                        {s}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* 候选人详情弹窗 */}
            <AnimatePresence>
                {selectedResume && selectedResume.resume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedResume(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 头部 */}
                            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5">
                                <button
                                    onClick={() => setSelectedResume(null)}
                                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center space-x-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg border-2 ${getScoreColor(selectedResume.matchScore)}`}>
                                        {selectedResume.matchScore}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {selectedResume.resume.basicInfo.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            综合匹配分 · {selectedResume.matchScore}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* 内容 */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* 五维匹配雷达 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">五维匹配详情</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[
                                            { label: "技能", score: selectedResume.details.skillsMatch },
                                            { label: "经验", score: selectedResume.details.experienceMatch },
                                            { label: "学历", score: selectedResume.details.educationMatch },
                                            { label: "行业", score: selectedResume.details.industryMatch },
                                            { label: "项目", score: selectedResume.details.projectMatch },
                                        ].map((item, i) => (
                                            <div key={i} className="text-center">
                                                <div className="relative w-full aspect-square mb-2">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                                                        <motion.circle
                                                            cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
                                                            className={item.score >= 80 ? "text-emerald-500" : item.score >= 60 ? "text-amber-500" : "text-red-500"}
                                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                                            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - item.score / 100) }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                                                        {item.score}%
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* 完整简历信息 */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">完整简历</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                                        <ResumeCard resume={selectedResume.resume} showActions={true} />
                                    </div>
                                </div>
                                {/* 匹配亮点 */}
                                {selectedResume.highlights.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">匹配亮点</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResume.highlights.map((h, i) => (
                                                <span key={i} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    <span>{h}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
