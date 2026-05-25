import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  position: string;
  interviewer: string;
  date: string;
  time: string;
  duration: string;
  type: "onsite" | "video" | "phone";
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  feedback?: string;
  rating?: number;
}

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "张三",
    candidateAvatar: "张",
    position: "高级前端工程师",
    interviewer: "李经理",
    date: "2024-03-15",
    time: "10:00",
    duration: "60分钟",
    type: "video",
    location: "腾讯会议",
    status: "scheduled",
  },
  {
    id: "2",
    candidateName: "李四",
    candidateAvatar: "李",
    position: "后端开发工程师",
    interviewer: "王总监",
    date: "2024-03-15",
    time: "14:00",
    duration: "45分钟",
    type: "onsite",
    location: "北京总部 3楼会议室A",
    status: "scheduled",
  },
  {
    id: "3",
    candidateName: "王五",
    candidateAvatar: "王",
    position: "产品经理",
    interviewer: "赵经理",
    date: "2024-03-14",
    time: "11:00",
    duration: "30分钟",
    type: "phone",
    location: "电话面试",
    status: "completed",
    feedback: "候选人表达清晰，产品思维敏捷，有较强的逻辑能力。",
    rating: 4,
  },
  {
    id: "4",
    candidateName: "赵六",
    candidateAvatar: "赵",
    position: "UI设计师",
    interviewer: "刘总监",
    date: "2024-03-13",
    time: "15:00",
    duration: "60分钟",
    type: "video",
    location: "Zoom",
    status: "completed",
    feedback: "设计能力出色，作品集质量高，但团队协作经验稍显不足。",
    rating: 3,
  },
  {
    id: "5",
    candidateName: "孙七",
    candidateAvatar: "孙",
    position: "数据分析师",
    interviewer: "陈经理",
    date: "2024-03-16",
    time: "09:30",
    duration: "45分钟",
    type: "onsite",
    location: "上海分公司 5楼会议室B",
    status: "pending",
  },
];

const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];

export default function Interview() {
  const [interviews] = useState<Interview[]>(mockInterviews);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);

  const prevMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };

  const getInterviewsForDate = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return interviews.filter((i) => i.date === dateStr);
  };

  const getStatusBadge = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-600 border-red-200";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
    }
  };

  const getStatusText = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return "已安排";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      case "pending":
        return "待确认";
    }
  };

  const getTypeIcon = (type: Interview["type"]) => {
    switch (type) {
      case "onsite":
        return <Building2 className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: Interview["type"]) => {
    switch (type) {
      case "onsite":
        return "现场面试";
      case "video":
        return "视频面试";
      case "phone":
        return "电话面试";
    }
  };

  const filteredInterviews =
    filterStatus === "all"
      ? interviews
      : interviews.filter((i) => i.status === filterStatus);

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
                面试管理
              </h1>
              <p className="text-lg text-gray-600">
                安排和管理候选人面试
              </p>
            </div>
            <button className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5" />
              <span>安排面试</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                  </h3>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dayInterviews = getInterviewsForDate(day);
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === selectedDate.getMonth() &&
                      new Date().getFullYear() === selectedDate.getFullYear();

                    return (
                      <button
                        key={day}
                        className={`relative p-2 rounded-lg text-center transition-colors ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : dayInterviews.length > 0
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        {dayInterviews.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                            {dayInterviews.slice(0, 3).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1 h-1 rounded-full ${
                                  isToday ? "bg-white" : "bg-blue-500"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    面试统计
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">今日面试</span>
                      <span className="font-medium text-gray-900">2 场</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">本周面试</span>
                      <span className="font-medium text-gray-900">5 场</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">待确认</span>
                      <span className="font-medium text-amber-600">1 场</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
                {["all", "scheduled", "completed", "pending", "cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                        filterStatus === status
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {status === "all"
                        ? "全部"
                        : getStatusText(status as Interview["status"])}
                    </button>
                  )
                )}
              </div>

              <div className="space-y-4">
                {filteredInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedInterview(interview)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {interview.candidateAvatar}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interview.candidateName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {interview.position}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                          interview.status
                        )}`}
                      >
                        {getStatusText(interview.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{interview.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {interview.time} ({interview.duration})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getTypeIcon(interview.type)}
                        <span>{getTypeText(interview.type)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>

                    {interview.feedback && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {interview.feedback}
                          </p>
                        </div>
                        {interview.rating && (
                          <div className="flex items-center space-x-1 mt-2">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < interview.rating!
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredInterviews.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    暂无面试安排
                  </h3>
                  <p className="text-gray-500">点击"安排面试"创建新的面试</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {selectedInterview && (
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
              className="bg-white rounded-2xl max-w-lg w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  面试详情
                </h2>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedInterview.candidateAvatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedInterview.candidateName}
                    </h3>
                    <p className="text-gray-500">{selectedInterview.position}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">面试时间</p>
                      <p className="font-medium text-gray-900">
                        {selectedInterview.date} {selectedInterview.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">面试时长</p>
                      <p className="font-medium text-gray-900">
                        {selectedInterview.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(selectedInterview.type)}
                    <div>
                      <p className="text-sm text-gray-500">面试方式</p>
                      <p className="font-medium text-gray-900">
                        {getTypeText(selectedInterview.type)} -{" "}
                        {selectedInterview.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">面试官</p>
                      <p className="font-medium text-gray-900">
                        {selectedInterview.interviewer}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedInterview.feedback && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      面试反馈
                    </h4>
                    <p className="text-gray-600">{selectedInterview.feedback}</p>
                    {selectedInterview.rating && (
                      <div className="flex items-center space-x-1 mt-3">
                        <span className="text-sm text-gray-500 mr-2">评分:</span>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < selectedInterview.rating!
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  关闭
                </button>
                {selectedInterview.status === "scheduled" && (
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                    提交反馈
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
