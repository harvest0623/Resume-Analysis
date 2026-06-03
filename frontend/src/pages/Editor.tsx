import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    GraduationCap,
    Briefcase,
    FolderOpen,
    Code,
    FileText,
    Save,
    Download,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    GripVertical,
    Settings,
    Palette,
    Layout,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import {
    ResumeEditorData,
    SectionType,
    SectionConfig,
    createDefaultResumeData,
    createDefaultEducation,
    createDefaultWorkExperience,
    createDefaultProjectExperience,
    createDefaultInternshipExperience,
    createDefaultSkillCategory,
    createDefaultSkillItem,
    createDefaultCustomSection,
    createDefaultCustomSectionItem,
} from '@/types/editor';
import BasicInfoEditor from '@/components/editor/BasicInfoEditor';
import EducationEditor from '@/components/editor/EducationEditor';
import WorkExperienceEditor from '@/components/editor/WorkExperienceEditor';
import ProjectEditor from '@/components/editor/ProjectEditor';
import InternshipEditor from '@/components/editor/InternshipEditor';
import SkillsEditor from '@/components/editor/SkillsEditor';
import SelfEvaluationEditor from '@/components/editor/SelfEvaluationEditor';
import CustomSectionEditor from '@/components/editor/CustomSectionEditor';
import ResumePreview from '@/components/editor/ResumePreview';

const defaultSections: SectionConfig[] = [
    { type: 'basicInfo', title: '基本信息', icon: 'User', visible: true, order: 0 },
    { type: 'education', title: '教育背景', icon: 'GraduationCap', visible: true, order: 1 },
    { type: 'workExperience', title: '工作经历', icon: 'Briefcase', visible: true, order: 2 },
    { type: 'projectExperience', title: '项目经验', icon: 'FolderOpen', visible: true, order: 3 },
    { type: 'internshipExperience', title: '实习经历', icon: 'Briefcase', visible: false, order: 4 },
    { type: 'skills', title: '专业技能', icon: 'Code', visible: true, order: 5 },
    { type: 'selfEvaluation', title: '自我评价', icon: 'FileText', visible: true, order: 6 },
];

export default function Editor() {
    const [resumeData, setResumeData] = useState<ResumeEditorData>(createDefaultResumeData());
    const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
    const [activeSection, setActiveSection] = useState<SectionType>('basicInfo');
    const [showPreview, setShowPreview] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [showSectionManager, setShowSectionManager] = useState(false);

    // 从本地存储加载数据
    useEffect(() => {
        const savedData = localStorage.getItem('resume_editor_data');
        const savedSections = localStorage.getItem('resume_editor_sections');
        if (savedData) {
            try {
                setResumeData(JSON.parse(savedData));
            } catch (e) {
                console.error('Failed to load saved data:', e);
            }
        }
        if (savedSections) {
            try {
                setSections(JSON.parse(savedSections));
            } catch (e) {
                console.error('Failed to load saved sections:', e);
            }
        }
    }, []);

    // 自动保存到本地存储
    const autoSave = useCallback(() => {
        localStorage.setItem('resume_editor_data', JSON.stringify(resumeData));
        localStorage.setItem('resume_editor_sections', JSON.stringify(sections));
        setLastSaved(new Date().toLocaleTimeString());
    }, [resumeData, sections]);

    useEffect(() => {
        const timer = setTimeout(autoSave, 1000);
        return () => clearTimeout(timer);
    }, [autoSave]);

    // 更新简历数据
    const updateResumeData = useCallback((updates: Partial<ResumeEditorData>) => {
        setResumeData(prev => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    // 更新模块可见性
    const toggleSectionVisibility = useCallback((type: SectionType) => {
        setSections(prev =>
            prev.map(s =>
                s.type === type ? { ...s, visible: !s.visible } : s
            )
        );
    }, []);

    // 添加自定义模块
    const addCustomSection = useCallback(() => {
        const newSection = createDefaultCustomSection();
        newSection.title = '自定义模块';
        updateResumeData({
            customSections: [...resumeData.customSections, newSection],
        });
        setSections(prev => [
            ...prev,
            {
                type: 'custom',
                title: newSection.title,
                icon: 'FileText',
                visible: true,
                order: prev.length,
            },
        ]);
    }, [resumeData.customSections, updateResumeData]);

    // 删除自定义模块
    const removeCustomSection = useCallback((sectionId: string) => {
        updateResumeData({
            customSections: resumeData.customSections.filter(s => s.id !== sectionId),
        });
    }, [resumeData.customSections, updateResumeData]);

    // 获取图标组件
    const getIcon = (iconName: string) => {
        const icons: Record<string, React.ElementType> = {
            User,
            GraduationCap,
            Briefcase,
            FolderOpen,
            Code,
            FileText,
        };
        return icons[iconName] || FileText;
    };

    // 渲染编辑器内容
    const renderEditorContent = () => {
        switch (activeSection) {
            case 'basicInfo':
                return (
                    <BasicInfoEditor
                        data={resumeData.basicInfo}
                        onChange={(data) => updateResumeData({ basicInfo: data })}
                    />
                );
            case 'education':
                return (
                    <EducationEditor
                        data={resumeData.education}
                        onChange={(data) => updateResumeData({ education: data })}
                    />
                );
            case 'workExperience':
                return (
                    <WorkExperienceEditor
                        data={resumeData.workExperience}
                        onChange={(data) => updateResumeData({ workExperience: data })}
                    />
                );
            case 'projectExperience':
                return (
                    <ProjectEditor
                        data={resumeData.projectExperience}
                        onChange={(data) => updateResumeData({ projectExperience: data })}
                    />
                );
            case 'internshipExperience':
                return (
                    <InternshipEditor
                        data={resumeData.internshipExperience}
                        onChange={(data) => updateResumeData({ internshipExperience: data })}
                    />
                );
            case 'skills':
                return (
                    <SkillsEditor
                        data={resumeData.skillCategories}
                        onChange={(data) => updateResumeData({ skillCategories: data })}
                    />
                );
            case 'selfEvaluation':
                return (
                    <SelfEvaluationEditor
                        data={resumeData.selfEvaluation}
                        onChange={(data) => updateResumeData({ selfEvaluation: data })}
                    />
                );
            case 'custom':
                return (
                    <CustomSectionEditor
                        data={resumeData.customSections}
                        onChange={(data) => updateResumeData({ customSections: data })}
                        onRemove={removeCustomSection}
                    />
                );
            default:
                return null;
        }
    };

    // 导出为 JSON
    const exportAsJSON = () => {
        const dataStr = JSON.stringify(resumeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume_${resumeData.basicInfo.name || 'untitled'}_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // 手动保存
    const handleSave = () => {
        setIsSaving(true);
        autoSave();
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            {/* 顶部工具栏 */}
            <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    简历编辑器
                                </h1>
                                {lastSaved && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        上次保存: {lastSaved}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSectionManager(!showSectionManager)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="模块管理"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title={showPreview ? '隐藏预览' : '显示预览'}
                            >
                                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden sm:inline">{isSaving ? '已保存' : '保存'}</span>
                            </button>
                            <button
                                onClick={exportAsJSON}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">导出</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 模块管理弹窗 */}
            <AnimatePresence>
                {showSectionManager && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="sticky top-30 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    模块管理
                                </h3>
                                <button
                                    onClick={addCustomSection}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    添加自定义模块
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sections.map((section) => {
                                    const Icon = getIcon(section.icon);
                                    return (
                                        <button
                                            key={section.type}
                                            onClick={() => toggleSectionVisibility(section.type)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                section.visible
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {section.title}
                                            {section.visible ? (
                                                <Eye className="w-3 h-3 ml-1" />
                                            ) : (
                                                <EyeOff className="w-3 h-3 ml-1" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 主内容区域 */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className={`flex gap-6 ${showPreview ? '' : 'max-w-4xl mx-auto'}`}>
                    {/* 左侧编辑面板 */}
                    <div className={`${showPreview ? 'w-1/2' : 'w-full'}`}>
                        {/* 模块导航 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {sections
                                    .filter(s => s.visible)
                                    .sort((a, b) => a.order - b.order)
                                    .map((section) => {
                                        const Icon = getIcon(section.icon);
                                        return (
                                            <button
                                                key={section.type}
                                                onClick={() => setActiveSection(section.type)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    activeSection === section.type
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {section.title}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* 编辑内容 */}
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            {renderEditorContent()}
                        </motion.div>
                    </div>

                    {/* 右侧预览面板 */}
                    {showPreview && (
                        <div className="w-1/2">
                            <div className="sticky top-32">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            实时预览
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                                A4
                                            </button>
                                            <button className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                简洁模板
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-100 dark:bg-gray-900 max-h-[calc(100vh-200px)] overflow-y-auto">
                                        <ResumePreview data={resumeData} sections={sections} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
