import { Plus, Trash2, GripVertical } from 'lucide-react';
import { WorkExperience, createDefaultWorkExperience } from '@/types/editor';

interface WorkExperienceEditorProps {
    data: WorkExperience[];
    onChange: (data: WorkExperience[]) => void;
}

export default function WorkExperienceEditor({ data, onChange }: WorkExperienceEditorProps) {
    const addExperience = () => {
        onChange([...data, createDefaultWorkExperience()]);
    };

    const removeExperience = (id: string) => {
        onChange(data.filter(item => item.id !== id));
    };

    const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
        onChange(data.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addAchievement = (id: string) => {
        const experience = data.find(item => item.id === id);
        if (experience) {
            updateExperience(id, { achievements: [...experience.achievements, ''] });
        }
    };

    const updateAchievement = (id: string, index: number, value: string) => {
        const experience = data.find(item => item.id === id);
        if (experience) {
            const newAchievements = [...experience.achievements];
            newAchievements[index] = value;
            updateExperience(id, { achievements: newAchievements });
        }
    };

    const removeAchievement = (id: string, index: number) => {
        const experience = data.find(item => item.id === id);
        if (experience && experience.achievements.length > 1) {
            updateExperience(id, { achievements: experience.achievements.filter((_, i) => i !== index) });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">工作经历</h2>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加工作经历
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无工作经历</p>
                    <button
                        onClick={addExperience}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((exp, index) => (
                        <div
                            key={exp.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    工作经历 {index + 1}
                                </h3>
                                <button
                                    onClick={() => removeExperience(exp.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 公司名称 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        公司名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                        placeholder="如：阿里巴巴"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 职位 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        职位 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                        placeholder="如：高级后端工程师"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 部门 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        部门
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.department}
                                        onChange={(e) => updateExperience(exp.id, { department: e.target.value })}
                                        placeholder="如：技术部"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 是否在职 */}
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={exp.isCurrent}
                                            onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">目前在职</span>
                                    </label>
                                </div>

                                {/* 开始时间 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        开始时间
                                    </label>
                                    <input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 结束时间 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        结束时间
                                    </label>
                                    <input
                                        type="month"
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                        disabled={exp.isCurrent}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50"
                                    />
                                </div>

                                {/* 工作描述 */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        工作描述
                                    </label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                                        placeholder="简要描述你的工作职责..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                {/* 工作成果 */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            工作成果 <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            onClick={() => addAchievement(exp.id)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + 添加成果
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {exp.achievements.map((achievement, achIndex) => (
                                            <div key={achIndex} className="flex gap-2">
                                                <span className="mt-3 text-gray-400">•</span>
                                                <input
                                                    type="text"
                                                    value={achievement}
                                                    onChange={(e) => updateAchievement(exp.id, achIndex, e.target.value)}
                                                    placeholder="描述你的工作成果，建议量化..."
                                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                                />
                                                {exp.achievements.length > 1 && (
                                                    <button
                                                        onClick={() => removeAchievement(exp.id, achIndex)}
                                                        className="mt-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        建议使用 STAR 法则描述：情境(Situation)、任务(Task)、行动(Action)、结果(Result)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
