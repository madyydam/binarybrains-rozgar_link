import React from 'react';

export interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number; // default 52
  strokeWidth?: number; // default 4
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 52,
  strokeWidth = 4,
  className = ''
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color threshold: above 85 -> green/blue, 70-85 -> brand blue
  const strokeColor = clampedScore >= 85 ? '#12AE85' : clampedScore >= 70 ? '#2F5BFF' : '#5B4BEA';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Match score: ${clampedScore}%`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAF0FF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold text-[#0F1B3D] tabular-nums leading-none">
          {clampedScore}
        </span>
        <span className="text-[8px] font-medium text-[#64748B] leading-none">%</span>
      </div>
    </div>
  );
};
