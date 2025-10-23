import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: number;
  total: number;
  unit: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value, total, unit }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const getBarColor = () => {
    if (percentage > 85) return 'bg-red-500';
    if (percentage > 65) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-xs font-mono text-gray-400">
          {value.toFixed(2)} / {total} {unit}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} usage`}
        ></div>
      </div>
    </div>
  );
};