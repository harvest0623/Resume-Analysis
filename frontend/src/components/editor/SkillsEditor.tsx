import { Plus, Trash2 } from 'lucide-react';
import {
    SkillCategory,
    SkillItem,
    createDefaultSkillCategory,
    createDefaultSkillItem,
} from '@/types/editor';

interface SkillsEditorProps {
    data: SkillCategory[];
    onChange: (data: SkillCategory[]) => void;
}

const skillLevels = ['了解', '熟悉', '精通', '专家'] as const;

export default function SkillsEditor({ data, onChange }: SkillsEditorProps) {
    const addCategory = () => {
        onChange([...data, createDefaultSkillCategory()]);
    };

    const removeCategory = (categoryId: string) => {
        onChange(data.filter(item => item.id !== categoryId));
    };

    const updateCategory = (categoryId: string, updates: Partial<SkillCategory>) => {
        onChange(data.map(item => item.id === categoryId ? { ...item, ...updates } : item));
    };

    const addSkill = (categoryId: string) => {
        const category = data.find(item => item.id === categoryId);
        if (category) {
            updateCategory(categoryId, {
                skills: [...category.skills, createDefaultSkillItem()],
            });
        }
    };

    const updateSkill = (categoryId: string, skillId: string, updates: Partial<SkillItem>) => {
        const category = data.find(item => item.id === categoryId);
        if (category) {
            updateCategory(categoryId, {
                skills: category.skills.map(skill =>
                    skill.id === skillId ? { ...skill, ...updates } : skill
                ),
            });
        }
    };

    const removeSkill = (categoryId: string, skillId: string) => {
        const category = data.find(item => item.id === categoryId);
        if (category) {
            updateCategory(categoryId, {
                skills: category.skills.filter(skill => skill.id !== skillId),
            });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">专业技能</h2>
                <button
                    onClick={addCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加技能分类
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无技能信息</p>
                    <button
                        onClick={addCategory}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((category) => (
                        <div
                            key={category.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1 mr-4">
                                    <input
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                                        placeholder="技能分类名称，如：编程语言、框架、数据库..."
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white text-lg font-semibold"
                                    />
                                </div>
                                <button
                                    onClick={() => removeCategory(category.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* 技能列表 */}
                            <div className="space-y-3">
                                {category.skills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <input
                                            type="text"
                                            value={skill.name}
                                            onChange={(e) => updateSkill(category.id, skill.id, { name: e.target.value })}
                                            placeholder="技能名称"
                                            className="flex-1 px-3 py-2 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white"
                                        />
                                        <select
                                            value={skill.level}
                                            onChange={(e) => updateSkill(category.id, skill.id, { level: e.target.value as SkillItem['level'] })}
                                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white text-sm"
                                        >
                                            {skillLevels.map((level) => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={skill.description}
                                            onChange={(e) => updateSkill(category.id, skill.id, { description: e.target.value })}
                                            placeholder="补充说明（可选）"
                                            className="flex-1 px-3 py-2 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white text-sm"
                                        />
                                        <button
                                            onClick={() => removeSkill(category.id, skill.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => addSkill(category.id)}
                                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                添加技能
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 技能建议 */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    技能填写建议
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• 建议按照熟练程度分类，如：编程语言、框架、数据库、工具等</li>
                    <li>• 只写与目标岗位相关的技能，避免罗列过多无关技能</li>
                    <li>• 技能描述可以补充具体使用场景或项目经验</li>
                </ul>
            </div>
        </div>
    );
}
