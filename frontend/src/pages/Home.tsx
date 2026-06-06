import { Link } from "react-router-dom";
import {
  FileText, Users, Search, History, ArrowRight, Sparkles, Zap, Shield, BarChart3,
  Upload, Lightbulb, PieChart, Briefcase, Calendar, Funnel, Download,
  FileStack, UserCheck, Sparkle, Edit3, ChevronRight
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import CompareParticleEffect from "@/components/CompareParticleEffect";

/* ───────── 背景系统 ───────── */
function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
      style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    />
  );
}

function LayeredBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 底层：渐变网格 */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* 中层：柔光光晕 */}
      <div className="absolute top-0 -left-40 w-[40rem] h-[40rem] bg-blue-400/15 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-indigo-400/12 dark:bg-indigo-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-20 left-1/4 w-[30rem] h-[30rem] bg-purple-400/10 dark:bg-purple-500/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* 浮动粒子 — 多色多尺寸 */}
      {[
        { color: "bg-blue-500/40 dark:bg-blue-400/30", size: "w-2 h-2", dur: 3, x: "10%", y: "20%" },
        { color: "bg-indigo-500/35 dark:bg-indigo-400/25", size: "w-1.5 h-1.5", dur: 4, x: "25%", y: "60%" },
        { color: "bg-purple-500/35 dark:bg-purple-400/25", size: "w-1 h-1", dur: 3.5, x: "45%", y: "15%" },
        { color: "bg-cyan-500/35 dark:bg-cyan-400/25", size: "w-1.5 h-1.5", dur: 5, x: "65%", y: "75%" },
        { color: "bg-pink-500/35 dark:bg-pink-400/25", size: "w-1 h-1", dur: 4.5, x: "80%", y: "30%" },
        { color: "bg-blue-500/40 dark:bg-blue-400/30", size: "w-2 h-2", dur: 3.8, x: "90%", y: "55%" },
        { color: "bg-indigo-500/30 dark:bg-indigo-400/20", size: "w-1.5 h-1.5", dur: 6, x: "15%", y: "85%" },
        { color: "bg-violet-500/35 dark:bg-violet-400/25", size: "w-1 h-1", dur: 4.2, x: "55%", y: "40%" },
        { color: "bg-teal-500/30 dark:bg-teal-400/20", size: "w-1.5 h-1.5", dur: 5.5, x: "35%", y: "10%" },
        { color: "bg-rose-500/30 dark:bg-rose-400/20", size: "w-1 h-1", dur: 3.3, x: "70%", y: "50%" },
        { color: "bg-blue-500/25 dark:bg-blue-400/15", size: "w-2.5 h-2.5", dur: 7, x: "5%", y: "45%" },
        { color: "bg-indigo-500/30 dark:bg-indigo-400/20", size: "w-1.5 h-1.5", dur: 4.8, x: "50%", y: "90%" },
        { color: "bg-purple-500/25 dark:bg-purple-400/15", size: "w-2 h-2", dur: 6.5, x: "85%", y: "70%" },
        { color: "bg-cyan-500/25 dark:bg-cyan-400/15", size: "w-1 h-1", dur: 3.7, x: "30%", y: "35%" },
        { color: "bg-pink-500/30 dark:bg-pink-400/20", size: "w-1.5 h-1.5", dur: 5.2, x: "95%", y: "12%" },
      ].map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} ${p.color} rounded-full`}
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -20 - Math.random() * 20, 0],
            x: [0, (Math.random() - 0.5) * 15, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 扩散圆环 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute left-1/2 top-1/2 border border-blue-500/8 dark:border-blue-400/8 rounded-full"
          style={{
            width: 300 + i * 200,
            height: 300 + i * 200,
            marginLeft: -(150 + i * 100),
            marginTop: -(150 + i * 100),
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───────── 浮动卡片 — 增强版 3D 倾斜 ───────── */
function FloatingCard({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────── 渐变文字 ───────── */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

/* ───────── 数据 ───────── */
const features = [
  { icon: FileText, title: "智能简历解析", description: "自动解析 PDF，提取关键信息，包括姓名、电话、邮箱、技能等", path: "/home/analyze", gradient: "from-blue-500 to-cyan-500", glow: "glow-cyan", category: "简历工具" },
  { icon: Upload, title: "批量分析", description: "一次性上传多份简历，系统自动进行批量分析处理", path: "/home/batch", gradient: "from-cyan-500 to-teal-500", glow: "glow-cyan", category: "简历工具" },
  { icon: Users, title: "简历对比分析", description: "对比两份简历的各项指标，帮助您做出更好的招聘决策", path: "/home/compare", gradient: "from-indigo-500 to-violet-500", glow: "glow-indigo", category: "简历工具" },
  { icon: Lightbulb, title: "简历优化建议", description: "AI 生成个性化优化建议，帮助候选人提升简历质量", path: "/home/optimize", gradient: "from-amber-500 to-orange-500", glow: "glow-pink", category: "简历工具" },
  { icon: Sparkle, title: "AI 生成简历", description: "填写基本信息，AI 为您生成专业的简历内容", path: "/home/generate", gradient: "from-violet-500 to-purple-500", glow: "glow-purple", category: "简历工具" },
  { icon: Edit3, title: "简历编辑器", description: "在线编辑简历，支持实时预览、模块管理和多种导出格式", path: "/home/editor", gradient: "from-blue-500 to-indigo-500", glow: "glow-indigo", category: "简历工具" },
  { icon: FileStack, title: "简历模板", description: "精选多款专业简历模板，助您打造完美简历", path: "/home/templates", gradient: "from-teal-500 to-emerald-500", glow: "glow-cyan", category: "简历工具" },
  { icon: Briefcase, title: "职位管理", description: "管理和发布招聘职位，跟踪招聘进度", path: "/home/jobs", gradient: "from-orange-500 to-red-500", glow: "glow-pink", category: "招聘管理" },
  { icon: UserCheck, title: "人才库", description: "管理和筛选候选人，建立企业人才储备", path: "/home/talent", gradient: "from-fuchsia-500 to-pink-500", glow: "glow-pink", category: "招聘管理" },
  { icon: Search, title: "岗位智能匹配", description: "输入岗位要求，自动匹配最合适的候选人，提高招聘效率", path: "/home/match", gradient: "from-purple-500 to-indigo-500", glow: "glow-purple", category: "招聘管理" },
  { icon: Calendar, title: "面试管理", description: "安排和管理候选人面试，记录面试反馈", path: "/home/interview", gradient: "from-pink-500 to-rose-500", glow: "glow-pink", category: "招聘管理" },
  { icon: Funnel, title: "招聘漏斗", description: "可视化招聘流程，分析各阶段转化率", path: "/home/pipeline", gradient: "from-red-500 to-orange-500", glow: "glow-pink", category: "招聘管理" },
  { icon: PieChart, title: "数据统计", description: "查看简历分析的整体数据概览，包括评分分布、技能统计等", path: "/home/stats", gradient: "from-rose-500 to-pink-500", glow: "glow-pink", category: "数据分析" },
  { icon: History, title: "历史记录管理", description: "保存和管理所有分析过的简历，方便随时查看和对比", path: "/home/history", gradient: "from-emerald-500 to-teal-500", glow: "glow-cyan", category: "数据分析" },
  { icon: Download, title: "报告导出", description: "导出各类招聘数据报告和分析结果", path: "/home/export", gradient: "from-sky-500 to-blue-500", glow: "glow-cyan", category: "数据分析" },
];

const benefits = [
  { icon: Sparkles, title: "AI 驱动", description: "利用先进的 AI 技术进行智能分析和匹配", gradient: "from-amber-400 to-orange-500", statClass: "stat-card-amber" },
  { icon: Zap, title: "高效便捷", description: "几秒钟内完成简历分析，大幅提升工作效率", gradient: "from-blue-400 to-cyan-500", statClass: "stat-card-blue" },
  { icon: Shield, title: "数据安全", description: "所有数据本地处理，确保您的信息安全", gradient: "from-emerald-400 to-teal-500", statClass: "stat-card-emerald" },
];

const categories = [
  { name: "简历工具", icon: FileText, count: features.filter(f => f.category === "简历工具").length },
  { name: "招聘管理", icon: Briefcase, count: features.filter(f => f.category === "招聘管理").length },
  { name: "数据分析", icon: PieChart, count: features.filter(f => f.category === "数据分析").length },
];

/* ───────── 页面 ───────── */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900 transition-colors duration-500 relative">
      <Navbar />

      <main>
        {/* ──────── Hero ──────── */}
        <section ref={heroRef} className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <DotGrid />
          <LayeredBackground />
          <CompareParticleEffect active={false} />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>

                {/* 徽章 */}
                <motion.div
                  className="inline-flex items-center px-5 py-2.5 glass-card-elevated rounded-full mb-10 cursor-default"
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  </motion.div>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI 赋能的招聘新时代</span>
                </motion.div>

                {/* 标题 */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                  <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    智能简历分析系统
                  </motion.span>
                  <br />
                  <motion.span
                    className="shimmer-text"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  >
                    让招聘更简单
                  </motion.span>
                </h1>

                {/* 描述 */}
                <motion.p
                  className="text-xl text-gray-500 dark:text-gray-400 mb-14 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                >
                  利用 AI 技术快速解析、分析和对比简历，帮助您找到最合适的候选人，
                  <br className="hidden sm:block" />
                  提升招聘效率，降低招聘成本。
                </motion.p>

                {/* CTA 按钮 */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-5"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                >
                  <Link
                    to="/home/analyze"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10 flex items-center">
                      开始使用
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/home/history"
                    className="inline-flex items-center px-8 py-4 glass-card rounded-2xl text-gray-700 dark:text-gray-300 font-semibold hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    查看历史
                    <ChevronRight className="w-5 h-5 ml-1 opacity-40" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ──────── 分类标签 ──────── */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -3 }}
                    className="flex items-center space-x-3 px-6 py-3.5 glass-card rounded-2xl cursor-default transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cat.count} 个功能</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ──────── 功能卡片 ──────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }} className="text-center mb-16"
            >
              <motion.div
                className="inline-flex items-center px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"
                whileHover={{ scale: 1.03 }}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">核心功能</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                全方位的
                <GradientText> 简历解决方案</GradientText>
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                我们提供全方位的简历分析解决方案，满足您的各种招聘需求
              </p>
            </motion.div>

            {/* 卡片网格 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <FloatingCard key={feature.path} delay={index * 0.05} className="h-full">
                    <Link to={feature.path} className="block group h-full">
                      <div className="relative card-3d glass-card rounded-3xl p-7 h-full flex flex-col overflow-hidden cursor-pointer">
                        {/* 悬浮渐变覆盖层 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-500 rounded-3xl`} />

                        {/* 顶部渐变装饰线 */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r ${feature.gradient} group-hover:w-3/4 transition-all duration-500 rounded-full`} />

                        <div className="relative z-10 flex flex-col h-full">
                          {/* 图标 */}
                          <motion.div
                            className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${feature.glow}`}
                            whileHover={{ rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </motion.div>

                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {feature.title}
                          </h3>

                          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 flex-grow">
                            {feature.description}
                          </p>

                          <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                            立即体验
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </FloatingCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────── 为什么选择我们 ──────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <DotGrid />
          <div className="absolute inset-0 gradient-mesh" />
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-400/8 dark:bg-blue-500/4 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-purple-400/8 dark:bg-purple-500/4 rounded-full blur-[120px]" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }} className="text-center mb-16"
            >
              <motion.div
                className="inline-flex items-center px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-6"
                whileHover={{ scale: 1.03 }}
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">为什么选择我们</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                超越期待的
                <GradientText> 招聘体验</GradientText>
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                我们的系统具有显著的优势，让您的招聘工作更加高效
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <FloatingCard key={benefit.title} delay={index * 0.15}>
                    <div className={`relative ${benefit.statClass} rounded-3xl p-10 shadow-xl border border-white/50 dark:border-gray-700/30 text-center h-full overflow-hidden group backdrop-blur-sm`}>
                      {/* 顶部光晕 */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br ${benefit.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />

                      <div className="relative z-10">
                        <motion.div
                          className={`w-20 h-20 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                          whileHover={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </FloatingCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────── CTA ──────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-900 rounded-3xl p-12 sm:p-16 text-center overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/30"
            >
              {/* 背景光晕 */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

              {/* 浮动粒子 */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
                  style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
                  animate={{ y: [0, -25, 0], opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}

              <div className="relative z-10">
                <motion.h2
                  className="text-3xl sm:text-4xl font-bold text-white mb-6 neon-text"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                >
                  准备好提升招聘效率了吗？
                </motion.h2>
                <motion.p
                  className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  立即开始使用智能简历分析系统，体验 AI 带来的高效招聘
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative inline-block"
                >
                  {/* 涟漪环 */}
                  <span className="ripple-ring w-20 h-20" />
                  <span className="ripple-ring w-20 h-20" />
                  <span className="ripple-ring w-20 h-20" />

                  <Link
                    to="/home/analyze"
                    className="group relative inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-lg hover:bg-blue-50"
                  >
                    免费开始使用
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ──────── Footer ──────── */}
      <footer className="bg-white dark:bg-black text-gray-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">智能简历分析系统</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                利用先进的 AI 技术，为企业提供智能、高效、安全的简历分析解决方案，助力企业找到最合适的人才。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">快速链接</h3>
              <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                <li><Link to="/home/analyze" className="hover:text-blue-600 dark:hover:text-white transition-colors">简历分析</Link></li>
                <li><Link to="/home/jobs" className="hover:text-blue-600 dark:hover:text-white transition-colors">职位管理</Link></li>
                <li><Link to="/home/talent" className="hover:text-blue-600 dark:hover:text-white transition-colors">人才库</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">联系我们</h3>
              <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                <li>support@example.com</li>
                <li>400-123-4567</li>
                <li>北京市朝阳区</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2026 智能简历分析系统. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}