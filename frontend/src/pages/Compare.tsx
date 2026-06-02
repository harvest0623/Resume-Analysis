import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, RefreshCcw, CheckCircle, ArrowRight, TrendingUp, TrendingDown, Trophy, Settings, ChevronDown, ChevronUp, Briefcase, GraduationCap, Code, Target, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import ResumeCard from "@/components/ResumeCard";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData, EnhancedComparisonResult, ComparisonConfig } from "@/types/resume";

export default function Compare() {
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<EnhancedComparisonResult | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { resumes, setResumes } = useResumeStore();
    const [showConfig, setShowConfig] = useState(false);
    const [useCoze, setUseCoze] = useState(false);
    const [config, setConfig] = useState<ComparisonConfig>({
        skillsWeight: 0.45,
        experienceWeight: 0.30,
        educationWeight: 0.25,
        skillMatchThreshold: 0.6,
        experienceYearsWeight: 0.4,
        projectQualityWeight: 0.3,
        positionMatchWeight: 0.3,
        educationLevelWeight: 0.5,
        majorMatchWeight: 0.3,
        universityRankWeight: 0.2
    });
    const [jobDescription, setJobDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        skills: true,
        experience: true,
        education: true
    });

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

    const toggleResume = (id: string) => {
        if (selectedResumes.includes(id)) {
            setSelectedResumes(selectedResumes.filter((r) => r !== id));
        } else if (selectedResumes.length < 5) {
            setSelectedResumes([...selectedResumes, id]);
        }
    };

    const handleCompare = async () => {
        if (selectedResumes.length < 2) return;

        setIsComparing(true);
        setError(null);
        try {
            const result = await api.compareResumes(
                selectedResumes,
                showConfig ? config : undefined,
                jobDescription,
                requirements,
                useCoze
            );
            if (result && result.resumes && result.results && result.comparison) {
                setComparisonResult(result);
            } else {
                throw new Error("返回数据格式错误");
            }
        } catch (err: any) {
            console.error("Comparison failed:", err);
            setError(err.message || "对比分析失败，请稍后重试");
        } finally {
            setIsComparing(false);
        }
    };

    const reset = () => {
        setSelectedResumes([]);
        setComparisonResult(null);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleConfigChange = (key: keyof ComparisonConfig, value: number) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetConfig = () => {
        setConfig({
            skillsWeight: 0.45,
            experienceWeight: 0.30,
            educationWeight: 0.25,
            skillMatchThreshold: 0.6,
            experienceYearsWeight: 0.4,
            projectQualityWeight: 0.3,
            positionMatchWeight: 0.3,
            educationLevelWeight: 0.5,
            majorMatchWeight: 0.3,
            universityRankWeight: 0.2
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    };

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
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            简历对比分析
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            选择2-5份简历进行对比，帮助您做出更好的招聘决策
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {!comparisonResult ? (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            已选择 {selectedResumes.length}/5 份简历（至少选择2份）
                                        </p>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setShowConfig(!showConfig)}
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>配置规则</span>
                                                {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                            {selectedResumes.length >= 2 && (
                                                <button
                                                    onClick={handleCompare}
                                                    disabled={isComparing}
                                                    className={`inline-flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                                        useCoze 
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                                    }`}
                                                >
                                                    {isComparing ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>对比中...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {useCoze ? <Sparkles className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                                            <span>{useCoze ? 'AI 对比' : '规则对比'}（{selectedResumes.length}份）</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center mb-6">
                                        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                                            <button
                                                onClick={() => setUseCoze(false)}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    !useCoze 
                                                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' 
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                <Code className="w-4 h-4" />
                                                <span>规则分析</span>
                                            </button>
                                            <button
                                                onClick={() => setUseCoze(true)}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    useCoze 
                                                        ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' 
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span>AI 智能分析</span>
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 text-red-500">⚠</div>
                                                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                                            </div>
                                            <p className="text-red-600 dark:text-red-500 text-xs mt-2">
                                                已自动切换到规则分析模式
                                            </p>
                                        </motion.div>
                                    )}

                                    <AnimatePresence>
                                        {showConfig && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-6 overflow-hidden"
                                            >
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">自定义规则配置</h3>
                                                        <button
                                                            onClick={resetConfig}
                                                            className="text-sm text-blue-600 hover:text-blue-700"
                                                        >
                                                            重置默认
                                                        </button>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">岗位描述</h4>
                                                            <textarea
                                                                value={jobDescription}
                                                                onChange={(e) => setJobDescription(e.target.value)}
                                                                placeholder="输入岗位描述，帮助更精准地评估匹配度..."
                                                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">岗位要求</h4>
                                                            <textarea
                                                                value={requirements}
                                                                onChange={(e) => setRequirements(e.target.value)}
                                                                placeholder="输入具体要求，如技能、经验、学历等..."
                                                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">维度权重配置</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">技能权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.skillsWeight * 100}
                                                                    onChange={(e) => handleConfigChange('skillsWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.skillsWeight * 100)}%</span>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">经验权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.experienceWeight * 100}
                                                                    onChange={(e) => handleConfigChange('experienceWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.experienceWeight * 100)}%</span>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">学历权重</label>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={config.educationWeight * 100}
                                                                    onChange={(e) => handleConfigChange('educationWeight', Number(e.target.value) / 100)}
                                                                    className="w-full"
                                                                />
                                                                <span className="text-xs text-gray-500">{Math.round(config.educationWeight * 100)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">工作年限权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.experienceYearsWeight * 100}
                                                                onChange={(e) => handleConfigChange('experienceYearsWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.experienceYearsWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">项目质量权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.projectQualityWeight * 100}
                                                                onChange={(e) => handleConfigChange('projectQualityWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.projectQualityWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">学历层次权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.educationLevelWeight * 100}
                                                                onChange={(e) => handleConfigChange('educationLevelWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.educationLevelWeight * 100)}%</span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">专业匹配权重</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={config.majorMatchWeight * 100}
                                                                onChange={(e) => handleConfigChange('majorMatchWeight', Number(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-gray-500">{Math.round(config.majorMatchWeight * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {resumes.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {resumes.map((resume) => (
                                            <ResumeCard
                                                key={resume.id}
                                                resume={resume}
                                                selectable
                                                selected={selectedResumes.includes(resume.id)}
                                                onSelect={toggleResume}
                                                showActions={false}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 dark:text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">暂无可对比的简历</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">请先上传并分析一些简历</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">对比完成</h2>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                        <span>重新对比</span>
                                    </button>
                                </div>

                                {comparisonResult.comparison.ranking && (
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-800 mb-8">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                            <Trophy className="w-6 h-6 text-amber-600" />
                                            <span>候选人排名</span>
                                        </h3>
                                        <div className="space-y-3">
                                            {comparisonResult.comparison.ranking.map((item, index) => (
                                                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-white dark:bg-gray-800'}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                                                            {item.rank}
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                    </div>
                                                    <span className={`text-lg font-bold ${index === 0 ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{item.score}分</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                    {comparisonResult.resumes.map((resume, index) => (
                                        <motion.div
                                            key={resume.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {resume.basicInfo.name}
                                                    </h3>
                                                    {comparisonResult.comparison.ranking && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            comparisonResult.comparison.ranking[index]?.rank === 1 
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            第{comparisonResult.comparison.ranking[index]?.rank || index + 1}名
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-center mb-4">
                                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${getScoreColor(comparisonResult.results[index].matchScore)}`}>
                                                        <span className="text-2xl font-bold">{comparisonResult.results[index].matchScore}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">匹配分数</p>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <p className="text-gray-600 dark:text-gray-400">{resume.jobInfo.position}</p>
                                                    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                                                        <span>{resume.background.education}</span>
                                                        <span>•</span>
                                                        <span>{resume.background.workYears}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">评分对比</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: "技能评分", key: "skills" },
                                            { label: "经验评分", key: "experience" },
                                            { label: "学历评分", key: "education" },
                                        ].map((item) => (
                                            <div key={item.key} className="space-y-3">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                                                {comparisonResult.results.map((result, idx) => (
                                                    <div key={idx} className="flex items-center space-x-3">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 w-20 truncate">
                                                            {comparisonResult.resumes[idx].basicInfo.name}
                                                        </span>
                                                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.key === 'skills' ? result.details.skillsMatch : item.key === 'experience' ? result.details.experienceMatch : result.details.educationMatch}%` }}
                                                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                                                className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : idx === 1 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : idx === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : idx === 3 ? 'bg-gradient-to-r from-pink-500 to-pink-600' : 'bg-gradient-to-r from-rose-500 to-rose-600'}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold w-12 text-right">
                                                            {item.key === 'skills' ? result.details.skillsMatch : item.key === 'experience' ? result.details.experienceMatch : result.details.educationMatch}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => toggleSection('skills')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Code className="w-5 h-5 text-blue-600" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white">技能分析</h4>
                                            </div>
                                            {expandedSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {expandedSections.skills && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {result.details.skillsMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.skillsMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-blue-500 rounded-full"
                                                            />
                                                        </div>
                                                        {result.skillsDetails.matched.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {result.skillsDetails.matched.slice(0, 5).map((skill, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                                        {skill.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => toggleSection('experience')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Briefcase className="w-5 h-5 text-amber-600" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white">经验分析</h4>
                                            </div>
                                            {expandedSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {expandedSections.experience && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-amber-600">
                                                                {result.details.experienceMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.experienceMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-amber-500 rounded-full"
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            工作年限：{result.experienceDetails.years}年 | 
                                                            岗位匹配：{result.experienceDetails.positionMatch}分
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => toggleSection('education')}
                                            className="w-full flex items-center justify-between mb-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <GraduationCap className="w-5 h-5 text-emerald-600" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white">学历分析</h4>
                                            </div>
                                            {expandedSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        {expandedSections.education && comparisonResult.results && (
                                            <div className="space-y-4">
                                                {comparisonResult.results.map((result, index) => (
                                                    <div key={index}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {comparisonResult.resumes[index].basicInfo.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-emerald-600">
                                                                {result.details.educationMatch}分
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${result.details.educationMatch}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                className="h-full bg-emerald-500 rounded-full"
                                                            />
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            学历层次：{comparisonResult.resumes[index].background.education}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {comparisonResult.comparison.priorityWeights && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                            <Target className="w-5 h-5 text-purple-600" />
                                            <span>权重分配</span>
                                        </h4>
                                        <div className="flex items-center space-x-4">
                                            {Object.entries(comparisonResult.comparison.priorityWeights).map(([key, value]) => (
                                                <div key={key} className="flex-1">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {Math.round(value * 100)}%
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {key === 'skills' ? '技能' : key === 'experience' ? '经验' : '学历'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {comparisonResult.resumes.map((resume, index) => (
                                        <div key={resume.id} className="space-y-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                                <span>{resume.basicInfo.name}</span>
                                                {comparisonResult.comparison.ranking && comparisonResult.comparison.ranking[index]?.rank === 1 && (
                                                    <Trophy className="w-4 h-4 text-amber-500" />
                                                )}
                                            </h4>
                                            {comparisonResult.comparison.strengths[resume.id]?.length > 0 && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                                                    <h5 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center space-x-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>优势</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.strengths[resume.id].map((strength, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-emerald-700">
                                                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {comparisonResult.comparison.weaknesses[resume.id]?.length > 0 && (
                                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                                    <h5 className="text-sm font-semibold text-red-800 mb-3 flex items-center space-x-1">
                                                        <TrendingDown className="w-4 h-4" />
                                                        <span>劣势</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.comparison.weaknesses[resume.id].map((weakness, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-red-700">
                                                                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{weakness}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {comparisonResult.results && comparisonResult.results[index].highlights.length > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                                    <h5 className="text-sm font-semibold text-blue-800 mb-3 flex items-center space-x-1">
                                                        <Trophy className="w-4 h-4" />
                                                        <span>亮点</span>
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {comparisonResult.results[index].highlights.map((highlight, i) => (
                                                            <li key={i} className="flex items-start space-x-2 text-sm text-blue-700">
                                                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span>{highlight}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200">
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                                        <Trophy className="w-6 h-6 text-purple-600" />
                                        <span>AI 推荐建议</span>
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {comparisonResult.comparison.recommendation}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
