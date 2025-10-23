import React from 'react';
import { SYSTEM_METRICS } from '../constants';
import { SystemMonitorIcon } from './Icons';
import { MetricDisplay } from './MetricDisplay';

export const SystemMonitor: React.FC = () => {
  const { cpu, memory, disk } = SYSTEM_METRICS.metrics;

  return (
    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <SystemMonitorIcon className="w-6 h-6 text-teal-400" />
        <h2 className="text-lg font-semibold text-gray-200">시스템 상태 (狀態)</h2>
      </div>
      <div className="space-y-4">
        <MetricDisplay 
          label="CPU 사용량"
          value={cpu.usage_percent}
          total={100}
          unit="%"
        />
        <MetricDisplay 
          label="메모리 사용량"
          value={memory.used_mb}
          total={memory.total_mb}
          unit="MB"
        />
        <MetricDisplay 
          label="디스크 사용량"
          value={disk.root_used_gb}
          total={disk.root_total_gb}
          unit="GB"
        />
      </div>
    </div>
  );
};