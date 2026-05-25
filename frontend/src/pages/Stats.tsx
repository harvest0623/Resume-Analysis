import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { api } from "@/utils/api";
import { useResumeStore } from "@/store/resumeStore";
import { ResumeData } from "@/types/resume";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: number;
  suffix?: string;
}

function StatCard({ title, value, icon: Icon, color, change, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-gray-500"
          }`}>
            {change > 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : change < 0 ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">
        {value}{suffix}
      </p>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  );
}

interface SkillBarProps {
  skill: string;
  count: number;
  maxCount: number;
}

function SkillBar({ skill, count, maxCount }: SkillBarProps) {
  const percentage = (count / maxCount) * 100;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700 w-24 truncate">{skill}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        />
      </div>
      <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
    </div>
  );
}

export default function Stats() {
  const [isLoading, setIsLoading] = useState(false);
  const { resumes, setResumes } = useResumeStore();

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const history = await api.getHistory();
        setResumes(history);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [setResumes]);

  const stats = useMemo(() => {
    if (resumes.length === 0) {
      return {
        totalResumes: 0,
        avgScore: 0,
        topScore: 0,
        recentCount: 0,
        scoreDistribution: { high: 0, medium: 0, low: 0 },
        topSkills: [] as { skill: string; count: number }[],
        educationDistribution: {} as Record<string, number>,
        positionDistribution: {} as Record<string, number>,
      };
    }

    const totalResumes = resumes.length;
    const avgScore = Math.round(
      resumes.reduce((sum, r) => sum + r.scores.overall, 0) / totalResumes
    );
    const topScore = Math.max(...resumes.map((r) => r.scores.overall));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentCount = resumes.filter(
      (r) => new Date(r.uploadedAt) > oneWeekAgo
    ).length;

    const scoreDistribution = resumes.reduce(
      (acc, r) => {
        if (r.scores.overall >= 80) acc.high++;
        else if (r.scores.overall >= 60) acc.medium++;
        else acc.low++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    const skillCounts: Record<string, number> = {};
    resumes.forEach((r) => {
      r.skills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const educationDistribution: Record<string, number> = {};
    resumes.forEach((r) => {
      const edu = r.background.education || "未知";
      educationDistribution[edu] = (educationDistribution[edu] || 0) + 1;
    });

    const positionDistribution: Record<string, number> = {};
    resumes.forEach((r) => {
      const pos = r.jobInfo.position || "未知";
      positionDistribution[pos] = (positionDistribution[pos] || 0) + 1;
    });

    return {
      totalResumes,
      avgScore,
      topScore,
      recentCount,
      scoreDistribution,
      topSkills,
      educationDistribution,
      positionDistribution,
    };
  }, [resumes]);

  const maxSkillCount = stats.topSkills.length > 0 
    ? Math.max(...stats.topSkills.map((s) => s.count))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              数据统计
            </h1>
            <p className="text-lg text-gray-600">
              查看简历分析的整体数据概览
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">加载中...</p>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无数据</h3>
              <p className="text-gray-500">请先上传并分析一些简历</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="简历总数"
                  value={stats.totalResumes}
                  icon={Users}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  title="平均评分"
                  value={stats.avgScore}
                  icon={TrendingUp}
                  color="from-emerald-500 to-emerald-600"
                  suffix="分"
                />
                <StatCard
                  title="最高评分"
                  value={stats.topScore}
                  icon={Award}
                  color="from-amber-500 to-amber-600"
                  suffix="分"
                />
                <StatCard
                  title="近7天新增"
                  value={stats.recentCount}
                  icon={Target}
                  color="from-purple-500 to-purple-600"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">评分分布</h3>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-emerald-600">优秀 (80+)</div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.scoreDistribution.high / stats.totalResumes) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-end pr-3"
                        >
                          <span className="text-sm font-medium text-white">{stats.scoreDistribution.high}</span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-amber-600">良好 (60-79)</div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.scoreDistribution.medium / stats.totalResumes) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-end pr-3"
                        >
                          <span className="text-sm font-medium text-white">{stats.scoreDistribution.medium}</span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-red-600">待提升 (&lt;60)</div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.scoreDistribution.low / stats.totalResumes) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-end pr-3"
                        >
                          <span className="text-sm font-medium text-white">{stats.scoreDistribution.low}</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">热门技能 TOP 8</h3>
                  <div className="space-y-4">
                    {stats.topSkills.map((item, index) => (
                      <SkillBar
                        key={item.skill}
                        skill={item.skill}
                        count={item.count}
                        maxCount={maxSkillCount}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">学历分布</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.educationDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([edu, count]) => (
                        <div key={edu} className="flex items-center justify-between">
                          <span className="text-gray-700">{edu}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / stats.totalResumes) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">岗位分布</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.positionDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([pos, count]) => (
                        <div key={pos} className="flex items-center justify-between">
                          <span className="text-gray-700 truncate flex-1 mr-4">{pos}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / stats.totalResumes) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-500 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
