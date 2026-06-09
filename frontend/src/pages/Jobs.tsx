import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit3,
  Trash2,
  Eye,
  X,
  Save,
  Building2,
  Calendar,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowUpDown,
  TrendingUp,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  GraduationCap,
  Star,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Copy,
  ExternalLink,
  Brain,
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  Flame,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

/* ───────── 背景系统（橙红色系，与职位管理主题一致） ───────── */
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-1/2 -left-1/2 w-full h-full">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -80, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"
      />
    </div>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
  </div>
);

const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-orange-500/10 dark:bg-orange-400/10"
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────── 类型定义 ─────────────────── */
interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  education: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: "active" | "closed" | "draft";
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  isFavorited: boolean;
  comments: Comment[];
  tags: string[];
  hotLevel: "hot" | "new" | "recommend" | null;
  hiringProgress: number;
}

type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "applicants" | "salary";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

/* ─────────────────── 模拟数据 ─────────────────── */
const mockJobs: Job[] = [
  {
    id: "1",
    title: "高级前端工程师",
    department: "技术部",
    location: "北京·朝阳区",
    salary: "25-40K·14薪",
    type: "全职",
    experience: "3-5年",
    education: "本科",
    description: "负责公司核心产品的前端开发，参与技术架构设计，推动前端工程化建设。",
    requirements: ["React/Vue", "TypeScript", "Node.js", "3年以上经验", "大型项目经验"],
    benefits: ["五险一金", "带薪年假", "股票期权", "免费三餐", "弹性工作"],
    status: "active",
    applicants: 23,
    views: 1580,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    likes: 42,
    isLiked: false,
    isFavorited: false,
    comments: [
      { id: "c1", author: "张三", avatar: "Z", content: "薪资很有竞争力，已投递！", time: "2小时前" },
      { id: "c2", author: "李四", avatar: "L", content: "请问支持远程办公吗？", time: "5小时前" },
    ],
    tags: ["前端", "React", "高薪"],
    hotLevel: "hot",
    hiringProgress: 65,
  },
  {
    id: "2",
    title: "后端开发工程师",
    department: "技术部",
    location: "上海·浦东新区",
    salary: "20-35K·13薪",
    type: "全职",
    experience: "2-4年",
    education: "本科",
    description: "负责后端服务的设计与开发，优化系统性能，参与微服务架构设计。",
    requirements: ["Python/Go", "MySQL/Redis", "微服务架构", "Docker"],
    benefits: ["五险一金", "弹性工作", "年终奖", "团建活动"],
    status: "active",
    applicants: 15,
    views: 980,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-25",
    likes: 28,
    isLiked: false,
    isFavorited: true,
    comments: [
      { id: "c3", author: "王五", avatar: "W", content: "微服务技术栈很感兴趣", time: "1天前" },
    ],
    tags: ["后端", "Go", "微服务"],
    hotLevel: "new",
    hiringProgress: 40,
  },
  {
    id: "3",
    title: "产品经理",
    department: "产品部",
    location: "深圳·南山区",
    salary: "30-50K·15薪",
    type: "全职",
    experience: "5年以上",
    education: "本科",
    description: "负责产品规划和设计，推动产品迭代，深入理解用户需求。",
    requirements: ["5年产品经验", "B端产品经验", "数据驱动", "用户研究"],
    benefits: ["五险一金", "期权激励", "免费三餐", "健身房"],
    status: "active",
    applicants: 8,
    views: 650,
    createdAt: "2024-02-01",
    updatedAt: "2024-02-05",
    likes: 56,
    isLiked: true,
    isFavorited: false,
    comments: [
      { id: "c4", author: "赵六", avatar: "Z", content: "B端产品经理的机会不多，珍惜！", time: "3天前" },
      { id: "c5", author: "孙七", avatar: "S", content: "期权激励很吸引人", time: "4天前" },
    ],
    tags: ["产品", "B端", "高薪"],
    hotLevel: "recommend",
    hiringProgress: 25,
  },
  {
    id: "4",
    title: "UI设计师",
    department: "设计部",
    location: "杭州·西湖区",
    salary: "15-25K·13薪",
    type: "全职",
    experience: "2-3年",
    education: "本科",
    description: "负责产品UI设计和视觉规范制定，参与设计系统建设。",
    requirements: ["Figma/Sketch", "设计系统", "B端设计经验", "动效设计"],
    benefits: ["五险一金", "弹性工作", "设计培训", "下午茶"],
    status: "closed",
    applicants: 32,
    views: 2100,
    createdAt: "2024-01-10",
    updatedAt: "2024-02-15",
    likes: 35,
    isLiked: false,
    isFavorited: false,
    comments: [
      { id: "c6", author: "周八", avatar: "Z", content: "可惜已关闭，期待下次开放", time: "1周前" },
    ],
    tags: ["设计", "UI", "Figma"],
    hotLevel: null,
    hiringProgress: 100,
  },
  {
    id: "5",
    title: "数据分析师",
    department: "数据部",
    location: "北京·海淀区",
    salary: "18-30K·14薪",
    type: "全职",
    experience: "1-3年",
    education: "硕士",
    description: "负责业务数据分析，构建数据指标体系，输出数据洞察报告。",
    requirements: ["SQL", "Python", "Tableau/PowerBI", "统计学基础"],
    benefits: ["五险一金", "年终奖", "培训补贴", "交通补贴"],
    status: "draft",
    applicants: 0,
    views: 0,
    createdAt: "2024-02-10",
    updatedAt: "2024-02-10",
    likes: 0,
    isLiked: false,
    isFavorited: false,
    comments: [],
    tags: ["数据", "分析", "Python"],
    hotLevel: null,
    hiringProgress: 0,
  },
  {
    id: "6",
    title: "算法工程师",
    department: "AI部",
    location: "上海·徐汇区",
    salary: "35-60K·16薪",
    type: "全职",
    experience: "3-5年",
    education: "硕士",
    description: "负责NLP/CV算法研发，推动AI技术在业务场景中的落地应用。",
    requirements: ["深度学习", "PyTorch/TensorFlow", "NLP/CV", "论文发表经验"],
    benefits: ["五险一金", "股票期权", "GPU资源", "学术会议"],
    status: "active",
    applicants: 12,
    views: 1890,
    createdAt: "2024-01-25",
    updatedAt: "2024-02-01",
    likes: 89,
    isLiked: false,
    isFavorited: true,
    comments: [
      { id: "c7", author: "吴九", avatar: "W", content: "AI方向前景很好，已投递", time: "6小时前" },
      { id: "c8", author: "郑十", avatar: "Z", content: "GPU资源太香了！", time: "1天前" },
    ],
    tags: ["AI", "算法", "NLP"],
    hotLevel: "hot",
    hiringProgress: 35,
  },
];

/* ─────────────────── 工具函数 ─────────────────── */
const getStatusConfig = (status: Job["status"]) => {
  switch (status) {
    case "active":
      return {
        text: "招聘中",
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
        text_color: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      };
    case "closed":
      return {
        text: "已关闭",
        bg: "bg-gray-50 dark:bg-gray-700/50",
        text_color: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-600",
        dot: "bg-gray-400",
        icon: XCircle,
      };
    case "draft":
      return {
        text: "草稿",
        bg: "bg-amber-50 dark:bg-amber-900/30",
        text_color: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700",
        dot: "bg-amber-500",
        icon: AlertCircle,
      };
  }
};

const getSalaryColor = (salary: string) => {
  const match = salary.match(/(\d+)/);
  const num = match ? parseInt(match[1]) : 0;
  if (num >= 35) return "text-rose-600 dark:text-rose-400";
  if (num >= 25) return "text-orange-600 dark:text-orange-400";
  if (num >= 15) return "text-teal-600 dark:text-teal-400";
  return "text-blue-600 dark:text-blue-400";
};

/* ─────────────────── Toast 组件 ─────────────────── */
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm min-w-[280px] ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/80 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                : "bg-blue-50 dark:bg-blue-900/80 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : toast.type === "error" ? (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── 确认弹窗 ─────────────────── */
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── 标签输入组件 ─────────────────── */
function TagInput({
  tags,
  onChange,
  placeholder,
  color = "blue",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  color?: "blue" | "purple" | "green" | "orange";
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div
      className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-text min-h-[48px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${colorMap[color]}`}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(tags.filter((_, j) => j !== i));
            }}
            className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : "继续添加..."}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  );
}

/* ─────────────────── 职位详情侧边栏 ─────────────────── */
function JobDetailPanel({
  job,
  open,
  onClose,
  onEdit,
  onToggleStatus,
}: {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
}) {
  if (!job) return null;
  const statusConfig = getStatusConfig(job.status);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl shadow-gray-500/10 z-[70] overflow-y-auto"
          >
            {/* 顶部渐变装饰 */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${job.status === "active" ? "from-emerald-400 to-teal-500" : job.status === "closed" ? "from-gray-400 to-gray-500" : "from-amber-400 to-orange-500"}`} />

            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100/80 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">职位详情</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{job.title}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text_color} ${statusConfig.border} flex-shrink-0 ml-3`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                    {statusConfig.text}
                  </span>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${getSalaryColor(job.salary)}`}>{job.salary}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "部门", value: job.department },
                  { icon: MapPin, label: "地点", value: job.location },
                  { icon: Clock, label: "经验", value: job.experience },
                  { icon: GraduationCap, label: "学历", value: job.education },
                  { icon: Briefcase, label: "类型", value: job.type },
                  { icon: Calendar, label: "发布日期", value: job.createdAt },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3.5 bg-gray-50/80 dark:bg-gray-700/30 rounded-xl border border-gray-100/50 dark:border-gray-600/30">
                    <div className="w-9 h-9 bg-white dark:bg-gray-600/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex-1 text-center p-5 bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-100/50 dark:border-orange-800/30">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{job.applicants}</p>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1.5 font-medium">申请人数</p>
                </div>
                <div className="flex-1 text-center p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{job.views}</p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 mt-1.5 font-medium">浏览次数</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                  职位描述
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-700/20 rounded-xl p-4">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
                    任职要求
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg border border-orange-100/50 dark:border-orange-800/30"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                    福利待遇
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100/80 dark:border-gray-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEdit(job)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑职位
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onToggleStatus(job)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all border ${
                    job.status === "active"
                      ? "bg-gray-50/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-600"
                      : "bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                  }`}
                >
                  {job.status === "active" ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      关闭招聘
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      开启招聘
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── 主组件 ─────────────────── */
export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; jobId: string | null }>({
    open: false,
    jobId: null,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    salary: "",
    type: "全职",
    experience: "",
    education: "本科",
    description: "",
    requirements: [] as string[],
    benefits: [] as string[],
  });

  // 添加 Toast
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 筛选与排序
  const filteredJobs = useMemo(() => {
    const result = jobs.filter((job) => {
      const kw = searchKeyword.toLowerCase();
      const matchKeyword =
        !searchKeyword ||
        job.title.toLowerCase().includes(kw) ||
        job.department.toLowerCase().includes(kw) ||
        job.location.toLowerCase().includes(kw) ||
        job.requirements.some((r) => r.toLowerCase().includes(kw));
      const matchStatus = filterStatus === "all" || job.status === filterStatus;
      return matchKeyword && matchStatus;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "applicants":
          return b.applicants - a.applicants;
        case "salary": {
          const getNum = (s: string) => {
            const m = s.match(/(\d+)/);
            return m ? parseInt(m[1]) : 0;
          };
          return getNum(b.salary) - getNum(a.salary);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, searchKeyword, filterStatus, sortBy]);

  // 统计数据
  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
      totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
      draft: jobs.filter((j) => j.status === "draft").length,
    }),
    [jobs]
  );

  // 操作处理
  const handleCreate = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "",
      location: "",
      salary: "",
      type: "全职",
      experience: "",
      education: "本科",
      description: "",
      requirements: [],
      benefits: [],
    });
    setShowModal(true);
  };

  const handleEdit = (job: Job) => {
    setShowDetail(false);
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      salary: job.salary,
      type: job.type,
      experience: job.experience,
      education: job.education,
      description: job.description,
      requirements: [...job.requirements],
      benefits: [...job.benefits],
    });
    setTimeout(() => setShowModal(true), 100);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      addToast("请输入职位名称", "error");
      return;
    }
    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
            ? { ...j, ...formData, updatedAt: new Date().toISOString().split("T")[0] }
            : j
        )
      );
      addToast("职位已更新");
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
        applicants: 0,
        views: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        likes: 0,
        isLiked: false,
        isFavorited: false,
        comments: [],
        tags: [],
        hotLevel: "new",
        hiringProgress: 0,
      };
      setJobs((prev) => [newJob, ...prev]);
      addToast("职位已发布");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, jobId: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.jobId) {
      setJobs((prev) => prev.filter((j) => j.id !== deleteConfirm.jobId));
      addToast("职位已删除");
      if (detailJob?.id === deleteConfirm.jobId) {
        setShowDetail(false);
      }
    }
    setDeleteConfirm({ open: false, jobId: null });
  };

  const handleToggleStatus = (job: Job) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? { ...j, status: newStatus as Job["status"], updatedAt: new Date().toISOString().split("T")[0] }
          : j
      )
    );
    addToast(newStatus === "active" ? "已开启招聘" : "已关闭招聘");
    if (detailJob?.id === job.id) {
      setDetailJob({ ...job, status: newStatus as Job["status"] });
    }
  };

  const handleDuplicate = (job: Job) => {
    const newJob: Job = {
      ...job,
      id: Date.now().toString(),
      title: job.title + " (副本)",
      status: "draft",
      applicants: 0,
      views: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      likes: 0,
      isLiked: false,
      isFavorited: false,
      comments: [],
      hotLevel: null,
      hiringProgress: 0,
    };
    setJobs((prev) => [newJob, ...prev]);
    addToast("职位已复制为草稿");
    setActiveDropdown(null);
  };

  const handleLike = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, isLiked: !j.isLiked, likes: j.isLiked ? j.likes - 1 : j.likes + 1 }
          : j
      )
    );
  };

  const handleFavorite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, isFavorited: !j.isFavorited } : j
      )
    );
    const job = jobs.find((j) => j.id === jobId);
    addToast(job?.isFavorited ? "已取消收藏" : "已收藏职位");
  };

  const handleShare = (job: Job) => {
    addToast(`已复制「${job.title}」分享链接`);
  };

  const handleViewDetail = (job: Job) => {
    setDetailJob(job);
    setShowDetail(true);
    setActiveDropdown(null);
  };

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: "newest", label: "最新发布" },
    { value: "oldest", label: "最早发布" },
    { value: "applicants", label: "申请最多" },
    { value: "salary", label: "薪资最高" },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <ParticleField />
      <Navbar />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        open={deleteConfirm.open}
        title="删除职位"
        message="确定要删除这个职位吗？此操作无法撤销。"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, jobId: null })}
      />
      <JobDetailPanel
        job={detailJob}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BackButton />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* ─── 页面标题 ─── */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
            >
              {/* 左上角光晕 - 粉色系，与首页卡片一致 */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-500/40 to-rose-500/30 rounded-full blur-2xl" />
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-orange-500/30 to-pink-500/20 rounded-full blur-xl" />
              {/* 主图标背景 - 橙红渐变，与首页职位管理卡片一致 */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl shadow-orange-500/30" />
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-xl animate-pulse" />
              <Briefcase className="w-10 h-10 text-white relative z-10" />
              <motion.div
                className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 dark:from-white dark:via-orange-200 dark:to-red-200 bg-clip-text text-transparent">
                职位管理
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              管理和发布招聘职位，追踪应聘情况
              <br className="hidden sm:block" />
              <span className="text-orange-600 dark:text-orange-400 font-medium">高效管理招聘全流程</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                className="relative group overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">发布职位</span>
              </motion.button>
            </motion.div>
          </div>

          {/* ─── 统计卡片 ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            {[
              {
                label: "总职位数",
                value: stats.total,
                icon: Briefcase,
                gradient: "from-orange-500 to-red-500",
                iconBg: "bg-orange-100 dark:bg-orange-500/20",
                iconColor: "text-orange-600 dark:text-orange-400",
                shadow: "shadow-orange-500/30",
              },
              {
                label: "招聘中",
                value: stats.active,
                icon: TrendingUp,
                gradient: "from-emerald-500 to-teal-500",
                iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                shadow: "shadow-emerald-500/30",
              },
              {
                label: "总申请数",
                value: stats.totalApplicants,
                icon: UserCheck,
                gradient: "from-violet-500 to-purple-500",
                iconBg: "bg-violet-100 dark:bg-violet-500/20",
                iconColor: "text-violet-600 dark:text-violet-400",
                shadow: "shadow-violet-500/30",
              },
              {
                label: "总浏览量",
                value: stats.totalViews,
                icon: Eye,
                gradient: "from-amber-500 to-orange-500",
                iconBg: "bg-amber-100 dark:bg-amber-500/20",
                iconColor: "text-amber-600 dark:text-amber-400",
                shadow: "shadow-amber-500/30",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200/70 dark:border-gray-700/60 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden"
              >
                {/* 顶部装饰条 */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                {/* 角落光晕 */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />

                <div className="flex items-center justify-between mb-4 relative">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ─── 搜索与筛选栏 ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-4 sm:p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4.5 h-4.5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="搜索职位名称、部门、地点或技能..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600/50 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 状态筛选 */}
                <div className="flex bg-gray-100/80 dark:bg-gray-700/50 rounded-xl p-1">
                  {[
                    { value: "all", label: "全部" },
                    { value: "active", label: "招聘中" },
                    { value: "closed", label: "已关闭" },
                    { value: "draft", label: "草稿" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setFilterStatus(s.value)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        filterStatus === s.value
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-500/30"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* 排序 */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/80 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortOptions.find((s) => s.value === sortBy)?.label}
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/50 rounded-xl shadow-xl shadow-gray-500/10 overflow-hidden z-30"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                              sortBy === option.value
                                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {sortBy === option.value && (
                              <motion.div layoutId="sortCheck" className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 视图切换 */}
                <div className="flex bg-gray-100/80 dark:bg-gray-700/50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-500/30"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-500/30"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── 搜索结果提示 ─── */}
          {(searchKeyword || filterStatus !== "all") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              找到 <span className="font-bold text-gray-900 dark:text-white">{filteredJobs.length}</span> 个职位
              {searchKeyword && (
                <span>
                  ，关键词: <span className="text-orange-600 dark:text-orange-400 font-medium">"{searchKeyword}"</span>
                </span>
              )}
            </motion.div>
          )}

          {/* ─── 职位列表 - 网格视图 ─── */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, index) => {
                  const statusConfig = getStatusConfig(job.status);
                  const relatedJobs = jobs.filter(j => j.id !== job.id && (j.department === job.department || j.tags.some(t => job.tags.includes(t)))).slice(0, 3);

                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 20 }}
                      transition={{ delay: index * 0.04, type: "spring", damping: 25, stiffness: 200 }}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      {/* 顶部装饰条 */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* 角落光晕 */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="p-5 sm:p-6">
                        {/* ── 区域1: 头部 - 标题 + 热门标签 + 操作 ── */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className="text-base font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                                onClick={() => handleViewDetail(job)}
                              >
                                {job.title}
                              </h3>
                              {/* 热门/最新/推荐标签 */}
                              {job.hotLevel && (
                                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  job.hotLevel === "hot"
                                    ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30"
                                    : job.hotLevel === "new"
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30"
                                    : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30"
                                }`}>
                                  {job.hotLevel === "hot" && <Flame className="w-3 h-3" />}
                                  {job.hotLevel === "new" && <Zap className="w-3 h-3" />}
                                  {job.hotLevel === "recommend" && <Sparkles className="w-3 h-3" />}
                                  {job.hotLevel === "hot" ? "热门" : job.hotLevel === "new" ? "最新" : "推荐"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100/70 dark:bg-gray-700/40 rounded-md">
                                <Building2 className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                <span className="truncate font-medium">{job.department}</span>
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100/70 dark:bg-gray-700/40 rounded-md">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                <span className="truncate font-medium">{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative" ref={activeDropdown === job.id ? dropdownRef : undefined}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === job.id ? null : job.id);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {activeDropdown === job.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl shadow-gray-900/10 overflow-hidden z-20"
                                >
                                  <button onClick={() => handleViewDetail(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                    <Eye className="w-3.5 h-3.5 text-orange-500" />查看详情
                                  </button>
                                  <button onClick={() => handleEdit(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                    <Edit3 className="w-3.5 h-3.5 text-orange-500" />编辑职位
                                  </button>
                                  <button onClick={() => handleDuplicate(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                    <Copy className="w-3.5 h-3.5 text-orange-500" />复制职位
                                  </button>
                                  <button onClick={() => handleShare(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                    <Share2 className="w-3.5 h-3.5 text-orange-500" />分享职位
                                  </button>
                                  <button onClick={() => handleToggleStatus(job)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                                    {job.status === "active" ? (<><ToggleLeft className="w-3.5 h-3.5 text-orange-500" />关闭招聘</>) : (<><ToggleRight className="w-3.5 h-3.5 text-orange-500" />开启招聘</>)}
                                  </button>
                                  <div className="border-t border-gray-100 dark:border-gray-700" />
                                  <button onClick={() => { handleDelete(job.id); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />删除职位
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* ── 区域2: 薪资 + 招聘进度 ── */}
                        <div className="flex items-baseline gap-1 mb-3">
                          <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${getSalaryColor(job.salary)}`}>
                            {job.salary}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">/月</span>
                        </div>
                        {/* 招聘进度条 */}
                        {job.status === "active" && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">招聘进度</span>
                              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{job.hiringProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${job.hiringProgress}%` }}
                                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* ── 区域3: 标签区 ── */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.text_color} ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                            {statusConfig.text}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/30">
                            {job.experience}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100/50 dark:border-violet-800/30">
                            {job.education}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-100/50 dark:border-teal-800/30">
                            {job.type}
                          </span>
                        </div>

                        {/* 技能标签 */}
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.requirements.slice(0, 3).map((req, i) => (
                              <span key={i} className="px-2.5 py-1 text-[11px] font-medium bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-300 rounded-md border border-orange-100/50 dark:border-orange-800/30">
                                {req}
                              </span>
                            ))}
                            {job.requirements.length > 3 && (
                              <span className="px-2.5 py-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-100/50 dark:border-orange-800/30">
                                +{job.requirements.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* ── 区域4: 评论预览区 ── */}
                        {job.comments.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-xl border border-gray-100/50 dark:border-gray-600/30">
                            <div className="flex items-center gap-1.5 mb-2">
                              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">最新评论</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">({job.comments.length})</span>
                            </div>
                            <div className="space-y-2">
                              {job.comments.slice(0, 2).map((comment) => (
                                <div key={comment.id} className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[9px] font-bold text-white">{comment.avatar}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed truncate">
                                      <span className="font-semibold">{comment.author}</span> {comment.content}
                                    </p>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{comment.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── 区域5: 元数据 + 互动区 ── */}
                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50/60 dark:bg-orange-900/20 rounded-lg">
                              <Users className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                              <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{job.applicants}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/60 dark:bg-amber-900/20 rounded-lg">
                              <Eye className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{job.views}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{job.createdAt}</span>
                        </div>

                        {/* ── 区域6: 互动按钮区 ── */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/80 dark:border-gray-700/50">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleLike(job.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                job.isLiked
                                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                  : "bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${job.isLiked ? "fill-current" : ""}`} />
                              <span>{job.likes}</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleFavorite(job.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                job.isFavorited
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                  : "bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500"
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${job.isFavorited ? "fill-current" : ""}`} />
                              <span className="hidden sm:inline">收藏</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleShare(job)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">分享</span>
                            </motion.button>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{job.comments.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* ── 区域7: 关联推荐区 ── */}
                      {relatedJobs.length > 0 && (
                        <div className="px-5 sm:px-6 py-3 bg-gray-50/60 dark:bg-gray-700/20 border-t border-gray-100 dark:border-gray-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">相关职位</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {relatedJobs.map((rJob) => (
                              <button
                                key={rJob.id}
                                onClick={() => handleViewDetail(rJob)}
                                className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-gray-600/40 rounded-lg border border-gray-200/60 dark:border-gray-600/40 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group/r"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-md flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="text-left min-w-0 max-w-[100px]">
                                  <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate group-hover/r:text-orange-600 dark:group-hover/r:text-orange-400 transition-colors">{rJob.title}</p>
                                  <p className={`text-[10px] font-bold ${getSalaryColor(rJob.salary)} truncate`}>{rJob.salary.split("·")[0]}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── 区域8: 快捷操作栏 ── */}
                      <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-gray-50/80 to-orange-50/30 dark:from-gray-700/30 dark:to-orange-900/10 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <button
                          onClick={() => handleViewDetail(job)}
                          className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors flex items-center gap-1 group/btn"
                        >
                          查看详情
                          <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleEdit(job)} className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-all hover:scale-110">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggleStatus(job)} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${job.status === "active" ? "text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"}`}>
                            {job.status === "active" ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDelete(job.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* ─── 职位列表 - 列表视图 ─── */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 overflow-hidden shadow-sm">
              {/* 表头 */}
              <div className="hidden lg:grid grid-cols-[1.4fr_140px_120px_120px_100px_100px_140px_120px] gap-4 px-6 py-4 bg-gradient-to-r from-gray-50/80 to-orange-50/30 dark:from-gray-700/40 dark:to-orange-900/10 border-b border-gray-200/70 dark:border-gray-700/60 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>职位信息</span>
                <span>薪资</span>
                <span>地点</span>
                <span>状态</span>
                <span>申请</span>
                <span>浏览</span>
                <span>发布日期</span>
                <span className="text-right">操作</span>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, index) => {
                  const statusConfig = getStatusConfig(job.status);

                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      className="group grid grid-cols-1 lg:grid-cols-[1.4fr_140px_120px_120px_100px_100px_140px_120px] gap-2 lg:gap-4 items-center px-6 py-4 border-b border-gray-100/80 dark:border-gray-700/50 last:border-0 hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent dark:hover:from-orange-900/10 dark:hover:to-transparent transition-all duration-200 cursor-pointer"
                      onClick={() => handleViewDetail(job)}
                    >
                      {/* 职位信息 */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                          >
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {job.department} · {job.experience} · {job.education}
                          </p>
                        </div>
                      </div>

                      {/* 薪资 */}
                      <p className={`text-sm font-extrabold ${getSalaryColor(job.salary)}`}>{job.salary}</p>

                      {/* 地点 */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {job.location}
                      </p>

                      {/* 状态 */}
                      <span
                        className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.text_color} ${statusConfig.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                        {statusConfig.text}
                      </span>

                      {/* 申请数 */}
                      <p className="text-sm text-gray-900 dark:text-white font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-500" />
                        {job.applicants}
                      </p>

                      {/* 浏览数 */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        {job.views}
                      </p>

                      {/* 日期 */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{job.createdAt}</p>

                      {/* 操作 */}
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetail(job)}
                          className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-all hover:scale-110"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                            job.status === "active"
                              ? "text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                              : "text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          }`}
                          title={job.status === "active" ? "关闭招聘" : "开启招聘"}
                        >
                          {job.status === "active" ? (
                            <ToggleLeft className="w-4 h-4" />
                          ) : (
                            <ToggleRight className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* ─── 空状态 ─── */}
          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-100/80 dark:border-gray-700/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="relative w-24 h-24 mx-auto mb-8"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400/20 to-red-400/20 blur-xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-orange-400 dark:text-orange-500" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {searchKeyword || filterStatus !== "all" ? "未找到匹配的职位" : "暂无职位"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                {searchKeyword || filterStatus !== "all"
                  ? "尝试调整搜索条件或筛选状态，或清除当前筛选查看全部职位"
                  : "点击「发布职位」创建你的第一个招聘职位，开启高效招聘之旅"}
              </p>
              {searchKeyword || filterStatus !== "all" ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchKeyword("");
                    setFilterStatus("all");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-colors border border-orange-100/50 dark:border-orange-800/30"
                >
                  <X className="w-4 h-4" />
                  清除筛选
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all shadow-lg shadow-orange-500/25"
                >
                  <Plus className="w-4 h-4" />
                  发布职位
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* ─── 新增/编辑弹窗 ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              {/* 弹窗头部 */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    {editingJob ? (
                      <Edit3 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Plus className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingJob ? "编辑职位" : "发布新职位"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    基本信息
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        职位名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                        placeholder="例如：高级前端工程师"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        所属部门
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                        placeholder="例如：技术部"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        工作地点
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                        placeholder="例如：北京·朝阳区"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        薪资范围
                      </label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                        placeholder="例如：25-40K·14薪"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        工作类型
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                      >
                        <option value="全职">全职</option>
                        <option value="兼职">兼职</option>
                        <option value="实习">实习</option>
                        <option value="远程">远程</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        经验要求
                      </label>
                      <select
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                      >
                        <option value="">不限</option>
                        <option value="应届生">应届生</option>
                        <option value="1年以内">1年以内</option>
                        <option value="1-3年">1-3年</option>
                        <option value="3-5年">3-5年</option>
                        <option value="5年以上">5年以上</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        学历要求
                      </label>
                      <select
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                      >
                        <option value="不限">不限</option>
                        <option value="大专">大专</option>
                        <option value="本科">本科</option>
                        <option value="硕士">硕士</option>
                        <option value="博士">博士</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 职位描述 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    职位描述
                  </h3>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                    placeholder="描述职位的主要工作内容和职责..."
                  />
                </div>

                {/* 任职要求 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    任职要求
                  </h3>
                  <TagInput
                    tags={formData.requirements}
                    onChange={(tags) => setFormData({ ...formData, requirements: tags })}
                    placeholder="输入技能要求，按回车添加"
                    color="blue"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">按回车或逗号添加标签</p>
                </div>

                {/* 福利待遇 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    福利待遇
                  </h3>
                  <TagInput
                    tags={formData.benefits}
                    onChange={(tags) => setFormData({ ...formData, benefits: tags })}
                    placeholder="输入福利待遇，按回车添加"
                    color="green"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">按回车或逗号添加标签</p>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {editingJob ? "保存修改" : "发布职位"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
