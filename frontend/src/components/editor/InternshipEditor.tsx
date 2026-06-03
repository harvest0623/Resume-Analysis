import { Plus, Trash2 } from 'lucide-react';
import { InternshipExperience, createDefaultInternshipExperience } from '@/types/editor';

interface InternshipEditorProps {
    data: InternshipExperience[];
    onChange: (data: InternshipExperience[]) => void;
}

export default function InternshipEditor({ data, onChange }: InternshipEditorProps) {
    const addInternship = () => {
        onChange([...data, createDefaultInternshipExperience()]);
    };

    const removeInternship = (id: string) => {
        onChange(data.filter(item => item.id !== id));
    };

    const updateInternship = (id: string, updates: Partial<InternshipExperience>) => {
        onChange(data.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addAchievement = (id: string) => {
        const internship = data.find(item => item.id === id);
        if (internship) {
            updateInternship(id, { achievements: [...internship.achievements, ''] });
        }
    };

    const updateAchievement = (id: string, index: number, value: string) => {
        const internship = data.find(item => item.id === id);
        if (internship) {
            const newAchievements = [...internship.achievements];
            newAchievements[index] = value;
            updateInternship(id, { achievements: newAchievements });
        }
    };

    const removeAchievement = (id: string, index: number) => {
        const internship = data.find(item => item.id === id);
        if (internship && internship.achievements.length > 1) {
            updateInternship(id, { achievements: internship.achievements.filter((_, i) => i !== index) });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">实习经历</h2>
                <button
                    onClick={addInternship}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加实习经历
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无实习经历</p>
                    <button
                        onClick={addInternship}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((internship, index) => (
                        <div
                            key={internship.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    实习经历 {index + 1}
                                </h3>
                                <button
                                    onClick={() => removeInternship(internship.id)}
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
                                        value={internship.company}
                                        onChange={(e) => updateInternship(internship.id, { company: e.target.value })}
                                        placeholder="如：腾讯"
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
                                        value={internship.position}
                                        onChange={(e) => updateInternship(internship.id, { position: e.target.value })}
                                        placeholder="如：后端开发实习生"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 开始时间 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        开始时间
                                    </label>
                                    <input
                                        type="month"
                                        value={internship.startDate}
                                        onChange={(e) => updateInternship(internship.id, { startDate: e.target.value })}
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
                                        value={internship.endDate}
                                        onChange={(e) => updateInternship(internship.id, { endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 工作描述 */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        工作描述
                                    </label>
                                    <textarea
                                        value={internship.description}
                                        onChange={(e) => updateInternship(internship.id, { description: e.target.value })}
                                        placeholder="简要描述你的实习工作..."
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
                                            onClick={() => addAchievement(internship.id)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + 添加成果
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {internship.achievements.map((achievement, achIndex) => (
                                            <div key={achIndex} className="flex gap-2">
                                                <span className="mt-3 text-gray-400">•</span>
                                                <input
                                                    type="text"
                                                    value={achievement}
                                                    onChange={(e) => updateAchievement(internship.id, achIndex, e.target.value)}
                                                    placeholder="描述你的实习成果..."
                                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                                />
                                                {internship.achievements.length > 1 && (
                                                    <button
                                                        onClick={() => removeAchievement(internship.id, achIndex)}
                                                        className="mt-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
