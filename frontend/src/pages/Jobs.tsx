import { useState, useEffect } from "react";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

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
  createdAt: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "高级前端工程师",
    department: "技术部",
    location: "北京",
    salary: "25-40K",
    type: "全职",
    experience: "3-5年",
    education: "本科",
    description: "负责公司核心产品的前端开发，参与技术架构设计。",
    requirements: ["React/Vue", "TypeScript", "3年以上经验"],
    benefits: ["五险一金", "带薪年假", "股票期权"],
    status: "active",
    applicants: 23,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "后端开发工程师",
    department: "技术部",
    location: "上海",
    salary: "20-35K",
    type: "全职",
    experience: "2-4年",
    education: "本科",
    description: "负责后端服务的设计与开发，优化系统性能。",
    requirements: ["Python/Go", "MySQL/Redis", "微服务架构"],
    benefits: ["五险一金", "弹性工作", "年终奖"],
    status: "active",
    applicants: 15,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "产品经理",
    department: "产品部",
    location: "深圳",
    salary: "30-50K",
    type: "全职",
    experience: "5年以上",
    education: "本科",
    description: "负责产品规划和设计，推动产品迭代。",
    requirements: ["5年产品经验", "B端产品经验", "数据驱动"],
    benefits: ["五险一金", "期权激励", "免费三餐"],
    status: "active",
    applicants: 8,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "UI设计师",
    department: "设计部",
    location: "杭州",
    salary: "15-25K",
    type: "全职",
    experience: "2-3年",
    education: "本科",
    description: "负责产品UI设计和视觉规范制定。",
    requirements: ["Figma/Sketch", "设计系统", "B端设计经验"],
    benefits: ["五险一金", "弹性工作", "设计培训"],
    status: "closed",
    applicants: 32,
    createdAt: "2024-01-10",
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    salary: "",
    type: "全职",
    experience: "",
    education: "本科",
    description: "",
  });

  const filteredJobs = jobs.filter((job) => {
    const matchKeyword =
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.department.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = filterStatus === "all" || job.status === filterStatus;
    return matchKeyword && matchStatus;
  });

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
    });
    setShowModal(true);
  };

  const handleEdit = (job: Job) => {
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
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingJob) {
      setJobs(
        jobs.map((j) =>
          j.id === editingJob.id ? { ...j, ...formData } : j
        )
      );
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        ...formData,
        requirements: [],
        benefits: [],
        status: "active",
        applicants: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setJobs([newJob, ...jobs]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const getStatusBadge = (status: Job["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "closed":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "draft":
        return "bg-amber-50 text-amber-600 border-amber-200";
    }
  };

  const getStatusText = (status: Job["status"]) => {
    switch (status) {
      case "active":
        return "招聘中";
      case "closed":
        return "已关闭";
      case "draft":
        return "草稿";
    }
  };

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                职位管理
              </h1>
              <p className="text-lg text-gray-600">
                管理和发布招聘职位
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>发布职位</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索职位名称或部门..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "closed", "draft"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {status === "all" ? "全部" : getStatusText(status as Job["status"])}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Building2 className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {getStatusText(job.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{job.applicants} 人申请</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{job.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                暂无职位
              </h3>
              <p className="text-gray-500">点击"发布职位"创建新的招聘职位</p>
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingJob ? "编辑职位" : "发布新职位"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      职位名称
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：高级前端工程师"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属部门
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：技术部"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工作地点
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：北京"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      薪资范围
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：25-40K"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工作类型
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="全职">全职</option>
                      <option value="兼职">兼职</option>
                      <option value="实习">实习</option>
                      <option value="合同">合同</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      经验要求
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：3-5年"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    职位描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="请输入职位描述..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingJob ? "保存修改" : "发布职位"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
