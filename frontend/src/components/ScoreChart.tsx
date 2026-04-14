import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface ScoreChartProps {
    scores: {
        overall: number;
        skills: number;
        experience: number;
        education: number;
    };
}

export default function ScoreChart({ scores }: ScoreChartProps) {
    const chartData = [
        { subject: "技能", A: scores.skills, fullMark: 100 },
        { subject: "经验", A: scores.experience, fullMark: 100 },
        { subject: "学历", A: scores.education, fullMark: 100 },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#10b981";
        if (score >= 60) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="relative"
                >
                    <svg className="w-40 h-40" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={getScoreColor(scores.overall)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${scores.overall * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                            initial={{ strokeDasharray: "0 283" }}
                            animate={{ strokeDasharray: `${scores.overall * 2.83} 283` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-4xl font-bold"
                            style={{ color: getScoreColor(scores.overall) }}
                        >
                            {scores.overall}
                        </motion.span>
                        <span className="text-sm text-gray-500">综合评分</span>
                    </div>
                </motion.div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="评分"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "技能", value: scores.skills },
                    { label: "经验", value: scores.experience },
                    { label: "学历", value: scores.education },
                ].map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-gray-50 rounded-xl p-4 text-center"
                    >
                        <div
                            className="text-2xl font-bold mb-1"
                            style={{ color: getScoreColor(item.value) }}
                        >
                            {item.value}
                        </div>
                        <div className="text-sm text-gray-600">{item.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
