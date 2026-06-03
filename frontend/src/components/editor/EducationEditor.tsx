import { Plus, Trash2 } from 'lucide-react';
import { Education, createDefaultEducation } from '@/types/editor';

interface EducationEditorProps {
    data: Education[];
    onChange: (data: Education[]) => void;
}

export default function EducationEditor({ data, onChange }: EducationEditorProps) {
    const addEducation = () => {
        onChange([...data, createDefaultEducation()]);
    };

    const removeEducation = (id: string) => {
        onChange(data.filter(item => item.id !== id));
    };

    const updateEducation = (id: string, updates: Partial<Education>) => {
        onChange(data.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">教育背景</h2>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    添加教育经历
                </button>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">暂无教育经历</p>
                    <button
                        onClick={addEducation}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        点击添加
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((edu, index) => (
                        <div
                            key={edu.id}
                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    教育经历 {index + 1}
                                </h3>
                                <button
                                    onClick={() => removeEducation(edu.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 学校名称 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        学校名称 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.school}
                                        onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                                        placeholder="如：北京大学"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 专业 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        专业 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.major}
                                        onChange={(e) => updateEducation(edu.id, { major: e.target.value })}
                                        placeholder="如：计算机科学与技术"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 学历 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        学历
                                    </label>
                                    <select
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    >
                                        <option value="">请选择</option>
                                        <option value="高中">高中</option>
                                        <option value="大专">大专</option>
                                        <option value="本科">本科</option>
                                        <option value="硕士">硕士</option>
                                        <option value="博士">博士</option>
                                    </select>
                                </div>

                                {/* GPA */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        GPA/成绩
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.gpa}
                                        onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                                        placeholder="如：3.8/4.0"
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
                                        value={edu.startDate}
                                        onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
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
                                        value={edu.endDate}
                                        onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 排名 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        排名
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.rank}
                                        onChange={(e) => updateEducation(edu.id, { rank: e.target.value })}
                                        placeholder="如：前5%"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 荣誉奖项 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        荣誉奖项
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.awards}
                                        onChange={(e) => updateEducation(edu.id, { awards: e.target.value })}
                                        placeholder="如：国家奖学金、优秀毕业生"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* 主修课程 */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        主修课程
                                    </label>
                                    <textarea
                                        value={edu.courses}
                                        onChange={(e) => updateEducation(edu.id, { courses: e.target.value })}
                                        placeholder="列出与求职相关的核心课程..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
