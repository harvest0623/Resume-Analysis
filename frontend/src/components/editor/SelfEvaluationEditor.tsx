interface SelfEvaluationEditorProps {
    data: string;
    onChange: (data: string) => void;
}

const templates = [
    {
        title: '技术型',
        content: '具备扎实的编程基础和良好的编码习惯，熟悉主流开发框架和工具。注重代码质量和性能优化，善于学习新技术并应用于实际项目。具有良好的团队协作能力和沟通能力，能够快速融入团队并承担重要开发任务。',
    },
    {
        title: '经验型',
        content: '拥有X年互联网行业开发经验，参与过多个大型项目的开发和维护。熟悉高并发、分布式系统的设计与实现，具备独立解决问题的能力。在工作中注重技术积累和分享，曾主导过XX系统的设计与开发，取得了显著的业务成果。',
    },
    {
        title: '潜力型',
        content: '对技术充满热情，自学能力强，能够快速掌握新技术和新工具。在校期间积极参与项目实践和开源社区，具备良好的编程基础和学习能力。善于思考和总结，注重代码规范和文档编写，期待在实际工作中不断提升自己的技术能力。',
    },
];

export default function SelfEvaluationEditor({ data, onChange }: SelfEvaluationEditorProps) {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">自我评价</h2>

            {/* 快速模板 */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    快速模板
                </label>
                <div className="flex flex-wrap gap-2">
                    {templates.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => onChange(template.content)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                            {template.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* 编辑区域 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自我评价内容
                </label>
                <textarea
                    value={data}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="请用简洁的语言描述你的核心优势、职业特点和工作态度..."
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        建议 100-300 字，突出核心竞争力
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {data.length} 字
                    </span>
                </div>
            </div>

            {/* 写作建议 */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    写作建议
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• 避免空泛的描述，如"吃苦耐劳"、"认真负责"</li>
                    <li>• 突出与目标岗位相关的技能和经验</li>
                    <li>• 用具体数据和案例支撑你的优势</li>
                    <li>• 展示你的职业规划和发展方向</li>
                </ul>
            </div>
        </div>
    );
}
