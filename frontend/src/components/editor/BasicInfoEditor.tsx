import { BasicInfo } from '@/types/editor';

interface BasicInfoEditorProps {
    data: BasicInfo;
    onChange: (data: BasicInfo) => void;
}

export default function BasicInfoEditor({ data, onChange }: BasicInfoEditorProps) {
    const handleChange = (field: keyof BasicInfo, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">基本信息</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 姓名 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="请输入姓名"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 求职头衔 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        求职头衔
                    </label>
                    <input
                        type="text"
                        value={data.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        placeholder="如：Java后端工程师"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 手机号 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        手机号 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="请输入手机号"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 邮箱 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="请输入邮箱"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 性别 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        性别
                    </label>
                    <select
                        value={data.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    >
                        <option value="">请选择</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                    </select>
                </div>

                {/* 出生日期 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        出生日期
                    </label>
                    <input
                        type="date"
                        value={data.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 所在城市 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        所在城市
                    </label>
                    <input
                        type="text"
                        value={data.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="如：北京"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 工作年限 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        工作年限
                    </label>
                    <select
                        value={data.workYears}
                        onChange={(e) => handleChange('workYears', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    >
                        <option value="">请选择</option>
                        <option value="应届生">应届生</option>
                        <option value="1年">1年</option>
                        <option value="2年">2年</option>
                        <option value="3年">3年</option>
                        <option value="4年">4年</option>
                        <option value="5年">5年</option>
                        <option value="6-8年">6-8年</option>
                        <option value="8年以上">8年以上</option>
                    </select>
                </div>

                {/* 个人主页 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        个人主页/博客
                    </label>
                    <input
                        type="url"
                        value={data.avatar}
                        onChange={(e) => handleChange('avatar', e.target.value)}
                        placeholder="https://your-blog.com"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    />
                </div>

                {/* 个人简介 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        个人简介
                    </label>
                    <textarea
                        value={data.personalStatement}
                        onChange={(e) => handleChange('personalStatement', e.target.value)}
                        placeholder="简单介绍一下自己..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        建议 100-200 字，突出核心优势和职业目标
                    </p>
                </div>
            </div>
        </div>
    );
}
