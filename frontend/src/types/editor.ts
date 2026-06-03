// 简历编辑器类型定义

export interface BasicInfo {
    name: string;
    phone: string;
    email: string;
    gender: string;
    birthDate: string;
    location: string;
    avatar: string;
    jobTitle: string;
    workYears: string;
    personalStatement: string;
}

export interface Education {
    id: string;
    school: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa: string;
    rank: string;
    awards: string;
    courses: string;
}

export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    department: string;
    description: string;
    achievements: string[];
}

export interface ProjectExperience {
    id: string;
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    company: string;
    description: string;
    techStack: string;
    responsibilities: string[];
    achievements: string[];
}

export interface InternshipExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
}

export interface SkillCategory {
    id: string;
    name: string;
    skills: SkillItem[];
}

export interface SkillItem {
    id: string;
    name: string;
    level: '了解' | '熟悉' | '精通' | '专家';
    description: string;
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomSectionItem[];
}

export interface CustomSectionItem {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    content: string;
}

export interface ResumeEditorData {
    id: string;
    templateId: string;
    basicInfo: BasicInfo;
    education: Education[];
    workExperience: WorkExperience[];
    projectExperience: ProjectExperience[];
    internshipExperience: InternshipExperience[];
    skillCategories: SkillCategory[];
    customSections: CustomSection[];
    selfEvaluation: string;
    updatedAt: string;
}

// 模块类型
export type SectionType =
    | 'basicInfo'
    | 'education'
    | 'workExperience'
    | 'projectExperience'
    | 'internshipExperience'
    | 'skills'
    | 'custom'
    | 'selfEvaluation';

// 模块配置
export interface SectionConfig {
    type: SectionType;
    title: string;
    icon: string;
    visible: boolean;
    order: number;
}

// 默认简历数据
export const createDefaultResumeData = (): ResumeEditorData => ({
    id: Date.now().toString(),
    templateId: '1',
    basicInfo: {
        name: '',
        phone: '',
        email: '',
        gender: '',
        birthDate: '',
        location: '',
        avatar: '',
        jobTitle: '',
        workYears: '',
        personalStatement: '',
    },
    education: [],
    workExperience: [],
    projectExperience: [],
    internshipExperience: [],
    skillCategories: [],
    customSections: [],
    selfEvaluation: '',
    updatedAt: new Date().toISOString(),
});

// 默认教育经历
export const createDefaultEducation = (): Education => ({
    id: Date.now().toString(),
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    gpa: '',
    rank: '',
    awards: '',
    courses: '',
});

// 默认工作经历
export const createDefaultWorkExperience = (): WorkExperience => ({
    id: Date.now().toString(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    department: '',
    description: '',
    achievements: [''],
});

// 默认项目经历
export const createDefaultProjectExperience = (): ProjectExperience => ({
    id: Date.now().toString(),
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    company: '',
    description: '',
    techStack: '',
    responsibilities: [''],
    achievements: [''],
});

// 默认实习经历
export const createDefaultInternshipExperience = (): InternshipExperience => ({
    id: Date.now().toString(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: [''],
});

// 默认技能分类
export const createDefaultSkillCategory = (): SkillCategory => ({
    id: Date.now().toString(),
    name: '',
    skills: [],
});

// 默认技能项
export const createDefaultSkillItem = (): SkillItem => ({
    id: Date.now().toString(),
    name: '',
    level: '熟悉',
    description: '',
});

// 默认自定义模块
export const createDefaultCustomSection = (): CustomSection => ({
    id: Date.now().toString(),
    title: '',
    items: [],
});

// 默认自定义模块项
export const createDefaultCustomSectionItem = (): CustomSectionItem => ({
    id: Date.now().toString(),
    title: '',
    subtitle: '',
    date: '',
    content: '',
});
