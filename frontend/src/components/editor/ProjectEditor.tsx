import { Plus, Trash2 } from 'lucide-react';
import { ProjectExperience, createDefaultProjectExperience } from '@/types/editor';

interface ProjectEditorProps {
    data: ProjectExperience[];
    onChange: (data: ProjectExperience[]) => void;
}

export default function ProjectEditor({ data, onChange }: ProjectEditorProps) {
    const addProject = () => {
        onChange([...data, createDefaultProjectExperience()]);
    };

    const removeProject = (id: string) => {
        onChange(data.filter(item => item.id !== id));
    };

    const updateProject = (id: string, updates: Partial<ProjectExperience>) => {
        onChange(data.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addListItem = (id: string, field: 'responsibilities' | 'achievements') => {
        const project = data.find(item => item.id === id);
        if (project) {
            updateProject(id, { [field]: [...project[field], ''] });
        }
    };

    const updateListItem = (id: string, field: 'responsibilities' | 'achievements', index: number, value: string) => {
        const project = data.find(item => item.id === id);
        if (project) {
            const newList = [...project[field]];
            newList[index] = value;
            updateProject(id, { [field]: newList });
        }
    };

    const removeListItem = (id: string, field: 'responsibilities' | 'achievements', index: number) => {
        const project = data.find(item => item.id === id);
        if (project && project[field].length > 1) {
            updateProject(id, { [field]: project[field].filter((_, i) => i !== index) });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">项目经验</h2>
                <button
                    onClick={addProject}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加项目经验
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无项目经验</p>
                    <button
                        onClick={addProject}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((project, index) => (
                        <div
                            key={project.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    项目 {index + 1}
                                </h3>
                                <button
                                    onClick={() => removeProject(project.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 项目名称 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        项目名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={project.name}
                                        onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                        placeholder="如：电商秒杀系统"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 担任角色 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        担任角色
                                    </label>
                                    <input
                                        type="text"
                                        value={project.role}
                                        onChange={(e) => updateProject(project.id, { role: e.target.value })}
                                        placeholder="如：后端负责人"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 所属公司/组织 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        所属公司/组织
                                    </label>
                                    <input
                                        type="text"
                                        value={project.company}
                                        onChange={(e) => updateProject(project.id, { company: e.target.value })}
                                        placeholder="如：阿里巴巴"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 技术栈 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        技术栈
                                    </label>
                                    <input
                                        type="text"
                                        value={project.techStack}
                                        onChange={(e) => updateProject(project.id, { techStack: e.target.value })}
                                        placeholder="如：Spring Boot, MySQL, Redis"
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
                                        value={project.startDate}
                                        onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
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
                                        value={project.endDate}
                                        onChange={(e) => updateProject(project.id, { endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 项目简介 */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        项目简介
                                    </label>
                                    <textarea
                                        value={project.description}
                                        onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                        placeholder="简要描述项目背景、目标和规模..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                {/* 个人职责 */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            个人职责
                                        </label>
                                        <button
                                            onClick={() => addListItem(project.id, 'responsibilities')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + 添加职责
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {project.responsibilities.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex gap-2">
                                                <span className="mt-3 text-gray-400">•</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => updateListItem(project.id, 'responsibilities', itemIndex, e.target.value)}
                                                    placeholder="描述你在项目中的职责..."
                                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                                />
                                                {project.responsibilities.length > 1 && (
                                                    <button
                                                        onClick={() => removeListItem(project.id, 'responsibilities', itemIndex)}
                                                        className="mt-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 技术亮点/成果 */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            技术亮点/成果 <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            onClick={() => addListItem(project.id, 'achievements')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            + 添加亮点
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {project.achievements.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex gap-2">
                                                <span className="mt-3 text-gray-400">•</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => updateListItem(project.id, 'achievements', itemIndex, e.target.value)}
                                                    placeholder="描述技术亮点或量化成果..."
                                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                                />
                                                {project.achievements.length > 1 && (
                                                    <button
                                                        onClick={() => removeListItem(project.id, 'achievements', itemIndex)}
                                                        className="mt-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        建议量化成果，如：性能提升50%、QPS达到1000+、响应时间降低到10ms以内
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
