import { ResumeEditorData, SectionConfig } from '@/types/editor';

interface ResumePreviewProps {
    data: ResumeEditorData;
    sections: SectionConfig[];
}

export default function ResumePreview({ data, sections }: ResumePreviewProps) {
    const visibleSections = sections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month] = dateStr.split('-');
        return `${year}.${month}`;
    };

    const formatEndDate = (dateStr: string, isCurrent?: boolean) => {
        if (isCurrent) return '至今';
        return formatDate(dateStr);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
            <div className="p-8 h-full overflow-y-auto text-sm" style={{ fontSize: '10px', lineHeight: '1.5' }}>
                {/* 基本信息头部 */}
                {data.basicInfo.name && (
                    <div className="text-center mb-6 pb-4 border-b-2 border-gray-800">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {data.basicInfo.name}
                        </h1>
                        {data.basicInfo.jobTitle && (
                            <p className="text-lg text-gray-700 mb-2">{data.basicInfo.jobTitle}</p>
                        )}
                        <div className="flex flex-wrap justify-center gap-4 text-gray-600">
                            {data.basicInfo.phone && (
                                <span>{data.basicInfo.phone}</span>
                            )}
                            {data.basicInfo.email && (
                                <span>{data.basicInfo.email}</span>
                            )}
                            {data.basicInfo.location && (
                                <span>{data.basicInfo.location}</span>
                            )}
                            {data.basicInfo.workYears && (
                                <span>{data.basicInfo.workYears}经验</span>
                            )}
                        </div>
                        {data.basicInfo.personalStatement && (
                            <p className="mt-3 text-gray-600 text-xs leading-relaxed">
                                {data.basicInfo.personalStatement}
                            </p>
                        )}
                    </div>
                )}

                {/* 动态渲染各个模块 */}
                {visibleSections.map((section) => {
                    switch (section.type) {
                        case 'education':
                            return data.education.length > 0 && (
                                <div key="education" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        教育背景
                                    </h2>
                                    {data.education.map((edu) => (
                                        <div key={edu.id} className="mb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {edu.school}
                                                    </span>
                                                    {edu.major && (
                                                        <span className="text-gray-700 ml-2">
                                                            {edu.major}
                                                        </span>
                                                    )}
                                                    {edu.degree && (
                                                        <span className="text-gray-600 ml-2">
                                                            ({edu.degree})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600 whitespace-nowrap">
                                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                </span>
                                            </div>
                                            {(edu.gpa || edu.rank || edu.awards) && (
                                                <p className="text-gray-600 mt-1">
                                                    {[edu.gpa && `GPA ${edu.gpa}`, edu.rank, edu.awards]
                                                        .filter(Boolean)
                                                        .join(' | ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'workExperience':
                            return data.workExperience.length > 0 && (
                                <div key="workExperience" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        工作经历
                                    </h2>
                                    {data.workExperience.map((work) => (
                                        <div key={work.id} className="mb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {work.company}
                                                    </span>
                                                    {work.department && (
                                                        <span className="text-gray-600 ml-2">
                                                            {work.department}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600 whitespace-nowrap">
                                                    {formatDate(work.startDate)} - {formatEndDate(work.endDate, work.isCurrent)}
                                                </span>
                                            </div>
                                            {work.position && (
                                                <p className="text-gray-700 font-medium mt-1">
                                                    {work.position}
                                                </p>
                                            )}
                                            {work.description && (
                                                <p className="text-gray-600 mt-1">{work.description}</p>
                                            )}
                                            {work.achievements.filter(a => a).length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {work.achievements.filter(a => a).map((achievement, index) => (
                                                        <li key={index} className="text-gray-600 flex">
                                                            <span className="mr-2">•</span>
                                                            <span>{achievement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'projectExperience':
                            return data.projectExperience.length > 0 && (
                                <div key="projectExperience" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        项目经验
                                    </h2>
                                    {data.projectExperience.map((project) => (
                                        <div key={project.id} className="mb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {project.name}
                                                    </span>
                                                    {project.role && (
                                                        <span className="text-gray-700 ml-2">
                                                            - {project.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600 whitespace-nowrap">
                                                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                                                </span>
                                            </div>
                                            {project.company && (
                                                <p className="text-gray-600 text-xs">{project.company}</p>
                                            )}
                                            {project.description && (
                                                <p className="text-gray-600 mt-1">
                                                    <span className="font-medium">项目简介：</span>
                                                    {project.description}
                                                </p>
                                            )}
                                            {project.techStack && (
                                                <p className="text-gray-600 mt-1">
                                                    <span className="font-medium">技术栈：</span>
                                                    {project.techStack}
                                                </p>
                                            )}
                                            {project.responsibilities.filter(r => r).length > 0 && (
                                                <div className="mt-2">
                                                    <p className="font-medium text-gray-700">个人职责：</p>
                                                    <ul className="space-y-1 mt-1">
                                                        {project.responsibilities.filter(r => r).map((item, index) => (
                                                            <li key={index} className="text-gray-600 flex">
                                                                <span className="mr-2">•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {project.achievements.filter(a => a).length > 0 && (
                                                <div className="mt-2">
                                                    <p className="font-medium text-gray-700">技术亮点：</p>
                                                    <ul className="space-y-1 mt-1">
                                                        {project.achievements.filter(a => a).map((item, index) => (
                                                            <li key={index} className="text-gray-600 flex">
                                                                <span className="mr-2">•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'internshipExperience':
                            return data.internshipExperience.length > 0 && (
                                <div key="internshipExperience" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        实习经历
                                    </h2>
                                    {data.internshipExperience.map((intern) => (
                                        <div key={intern.id} className="mb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-semibold text-gray-900">
                                                        {intern.company}
                                                    </span>
                                                    {intern.position && (
                                                        <span className="text-gray-700 ml-2">
                                                            {intern.position}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600 whitespace-nowrap">
                                                    {formatDate(intern.startDate)} - {formatDate(intern.endDate)}
                                                </span>
                                            </div>
                                            {intern.description && (
                                                <p className="text-gray-600 mt-1">{intern.description}</p>
                                            )}
                                            {intern.achievements.filter(a => a).length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {intern.achievements.filter(a => a).map((achievement, index) => (
                                                        <li key={index} className="text-gray-600 flex">
                                                            <span className="mr-2">•</span>
                                                            <span>{achievement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'skills':
                            return data.skillCategories.length > 0 && (
                                <div key="skills" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        专业技能
                                    </h2>
                                    {data.skillCategories.map((category) => (
                                        <div key={category.id} className="mb-3">
                                            {category.name && (
                                                <p className="font-medium text-gray-800 mb-1">
                                                    {category.name}
                                                </p>
                                            )}
                                            {category.skills.length > 0 && (
                                                <ul className="space-y-1">
                                                    {category.skills.map((skill) => (
                                                        <li key={skill.id} className="text-gray-600 flex">
                                                            <span className="mr-2">•</span>
                                                            <span>
                                                                {skill.level === '精通' ? '精通' :
                                                                 skill.level === '熟悉' ? '熟悉' :
                                                                 skill.level === '了解' ? '了解' : '掌握'}
                                                                {skill.name}
                                                                {skill.description && `，${skill.description}`}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'selfEvaluation':
                            return data.selfEvaluation && (
                                <div key="selfEvaluation" className="mb-5">
                                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                        自我评价
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {data.selfEvaluation}
                                    </p>
                                </div>
                            );

                        case 'custom':
                            return data.customSections.map((section) => (
                                section.items.length > 0 && (
                                    <div key={section.id} className="mb-5">
                                        <h2 className="text-base font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                                            {section.title || '自定义模块'}
                                        </h2>
                                        {section.items.map((item) => (
                                            <div key={item.id} className="mb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        {item.title && (
                                                            <span className="font-semibold text-gray-900">
                                                                {item.title}
                                                            </span>
                                                        )}
                                                        {item.subtitle && (
                                                            <span className="text-gray-600 ml-2">
                                                                {item.subtitle}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.date && (
                                                        <span className="text-gray-600 whitespace-nowrap">
                                                            {item.date}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.content && (
                                                    <p className="text-gray-600 mt-1">{item.content}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            ));

                        default:
                            return null;
                    }
                })}

                {/* 空状态提示 */}
                {!data.basicInfo.name &&
                 data.education.length === 0 &&
                 data.workExperience.length === 0 &&
                 data.projectExperience.length === 0 &&
                 data.internshipExperience.length === 0 &&
                 data.skillCategories.length === 0 &&
                 !data.selfEvaluation && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-lg mb-2">简历预览</p>
                        <p className="text-sm">开始编辑左侧内容，这里将实时显示预览</p>
                    </div>
                )}
            </div>
        </div>
    );
}
