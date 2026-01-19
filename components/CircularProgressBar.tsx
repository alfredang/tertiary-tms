
import React from 'react';

interface CircularProgressBarProps {
  percentage: number;
  className?: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage, className }) => {
  const radius = 20;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const progressColor = percentage === 100 ? 'stroke-green-500' : 'stroke-green-500';

  return (
    <div className={`relative w-14 h-14 ${className}`}>
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 44 44"
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          cx={radius + stroke}
          cy={radius + stroke}
          r={normalizedRadius}
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          className={`transition-all duration-500 ease-in-out ${progressColor}`}
          cx={radius + stroke}
          cy={radius + stroke}
          r={normalizedRadius}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-on-surface">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default CircularProgressBar;
