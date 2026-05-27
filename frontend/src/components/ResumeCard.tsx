import { ResumeData } from "@/types/resume";
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Calendar, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ResumeCardProps {
    resume: ResumeData;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (id: string) => void;
}

export default function ResumeCard({ 
    resume, 
    onDelete, 
    showActions = true,
    selectable = false,
    selected = false,
    onSelect
}: ResumeCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50";
        if (score >= 60) return "text-amber-600 bg-amber-50";
        return "text-red-600 bg-red-50";
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={`
                bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 transition-all duration-200 overflow-hidden
                ${selectable ? "cursor-pointer" : ""}
                ${selected ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800" : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"}
            `}
            onClick={() => selectable && onSelect?.(resume.id)}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(resume.basicInfo.name)}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {resume.basicInfo.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {resume.jobInfo.position || "未知岗位"}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(resume.scores.overall)}`}>
                        {resume.scores.overall} 分
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{resume.basicInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{resume.basicInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span>{resume.background.education}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{resume.background.workYears}工作经验</span>
                    </div>
                </div>

                {resume.skills.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {resume.skills.slice(0, 5).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                                >
                                    {skill}
                                </span>
                            ))}
                            {resume.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                                    +{resume.skills.length - 5}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(resume.uploadedAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                    {showActions && (
                        <div className="flex items-center space-x-2">
                            <Link
                                to={`/home/analyze`}
                                state={{ resumeId: resume.id }}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                            </Link>
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(resume.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
