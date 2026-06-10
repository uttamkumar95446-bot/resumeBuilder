"use client";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 120, label }: ScoreGaugeProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 70 ? "#22c55e" : clampedScore >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="oklch(0.922 0.004 286.375)"
          strokeWidth="10"
        />
        {/* Score arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-bold"
          fill="currentColor"
          fontSize="28"
        >
          {Math.round(clampedScore)}
        </text>
      </svg>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
