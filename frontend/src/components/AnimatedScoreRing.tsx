import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  isWinner?: boolean;
}

export default function AnimatedScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label = "匹配分数",
  color,
  isWinner = false,
}: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      start = Math.round(eased * score);
      setAnimatedScore(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, visible]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getGlowColor = () => {
    if (score >= 80) return "rgba(16, 185, 129, 0.4)";
    if (score >= 60) return "rgba(245, 158, 11, 0.4)";
    return "rgba(239, 68, 68, 0.4)";
  };

  const strokeColor = getColor();

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: isWinner ? `drop-shadow(0 0 8px ${getGlowColor()})` : "none" }}
      >
        {/* 背景环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* 进度环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.2s ease-out",
            filter: `drop-shadow(0 0 6px ${getGlowColor()})`,
          }}
        />
        {/* 外圈装饰（获胜者） */}
        {isWinner && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2 + 4}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeDasharray="4 8"
            className="animate-spin"
            style={{ animationDuration: "8s" }}
            opacity={0.4}
          />
        )}
      </svg>
      {/* 中心分数 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: strokeColor }}
        >
          {animatedScore}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</span>
      </div>
    </div>
  );
}