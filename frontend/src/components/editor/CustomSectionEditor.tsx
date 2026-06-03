import { Plus, Trash2 } from 'lucide-react';
import {
    CustomSection,
    CustomSectionItem,
    createDefaultCustomSection,
    createDefaultCustomSectionItem,
} from '@/types/editor';

interface CustomSectionEditorProps {
    data: CustomSection[];
    onChange: (data: CustomSection[]) => void;
    onRemove: (sectionId: string) => void;
}

export default function CustomSectionEditor({ data, onChange, onRemove }: CustomSectionEditorProps) {
    const addSection = () => {
        onChange([...data, createDefaultCustomSection()]);
    };

    const updateSection = (sectionId: string, updates: Partial<CustomSection>) => {
        onChange(data.map(section => section.id === sectionId ? { ...section, ...updates } : section));
    };

    const addItem = (sectionId: string) => {
        const section = data.find(s => s.id === sectionId);
        if (section) {
            updateSection(sectionId, {
                items: [...section.items, createDefaultCustomSectionItem()],
            });
        }
    };

    const updateItem = (sectionId: string, itemId: string, updates: Partial<CustomSectionItem>) => {
        const section = data.find(s => s.id === sectionId);
        if (section) {
            updateSection(sectionId, {
                items: section.items.map(item => item.id === itemId ? { ...item, ...updates } : item),
            });
        }
    };

    const removeItem = (sectionId: string, itemId: string) => {
        const section = data.find(s => s.id === sectionId);
        if (section) {
            updateSection(sectionId, {
                items: section.items.filter(item => item.id !== itemId),
            });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">自定义模块</h2>
                <button
                    onClick={addSection}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加模块
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无自定义模块</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        你可以添加如：荣誉证书、社团经历、竞赛获奖、开源贡献等模块
                    </p>
                    <button
                        onClick={addSection}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((section) => (
                        <div
                            key={section.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                    placeholder="模块标题，如：荣誉证书、社团经历..."
                                    className="flex-1 mr-4 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white text-lg font-semibold"
                                />
                                <button
                                    onClick={() => onRemove(section.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* 条目列表 */}
                            <div className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                条目 {itemIndex + 1}
                                            </span>
                                            <button
                                                onClick={() => removeItem(section.id, item.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                                                placeholder="标题"
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                value={item.subtitle}
                                                onChange={(e) => updateItem(section.id, item.id, { subtitle: e.target.value })}
                                                placeholder="副标题（可选）"
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                value={item.date}
                                                onChange={(e) => updateItem(section.id, item.id, { date: e.target.value })}
                                                placeholder="日期（可选）"
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                            />
                                            <textarea
                                                value={item.content}
                                                onChange={(e) => updateItem(section.id, item.id, { content: e.target.value })}
                                                placeholder="详细描述..."
                                                rows={2}
                                                className="md:col-span-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => addItem(section.id)}
                                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                添加条目
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 使用建议 */}
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    自定义模块建议
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                    <li>• 荣誉证书：奖学金、竞赛获奖、专业认证等</li>
                    <li>• 社团经历：学生会、社团组织、志愿者活动等</li>
                    <li>• 开源贡献：GitHub 项目、技术博客、社区贡献等</li>
                    <li>• 其他技能：语言能力、演讲经历、出版物等</li>
                </ul>
            </div>
        </div>
    );
}
