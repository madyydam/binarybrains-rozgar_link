import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number; // default 6
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#2F5BFF',
  height = 6,
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className={`w-full bg-[#EAF0FF] rounded-full overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};
