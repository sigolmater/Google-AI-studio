import React from 'react';
import type { ProactiveBriefing } from '../types';
import { BriefingIcon } from './Icons';

interface AgentBriefingProps {
  briefing: ProactiveBriefing;
  onSuggestionDeliberate: (suggestion: string) => void;
}

export const BriefingSkeleton: React.FC = () => (
  <div className="col-span-full p-6 bg-slate-800/60 rounded-lg border border-slate-700 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 bg-slate-700 rounded-md"></div>
        <div className="h-6 bg-slate-700 rounded w-1/3"></div>
    </div>
    <div className="space-y-4">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-8 bg-slate-700 rounded-lg w-1/2 mt-6"></div>
        <div className="flex flex-col gap-2 pt-4">
          <div className="h-8 bg-slate-700 rounded"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
        </div>
    </div>
  </div>
);

export const AgentBriefing: React.FC<AgentBriefingProps> = ({ briefing, onSuggestionDeliberate }) => {
  return (
    <div className="col-span-full p-6 bg-slate-800/60 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <BriefingIcon className="w-7 h-7 text-teal-400" />
        <h2 className="text-xl font-bold text-gray-100">에이전트 선제 브리핑</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">{briefing.overview}</p>
      
      <div className="my-5 p-4 rounded-lg bg-slate-900/50 border border-yellow-500/30">
        <h3 className="font-semibold text-yellow-300 mb-2">핵심 통찰 (核心 洞察)</h3>
        <p className="text-gray-300">{briefing.keyInsight}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-200 mb-3">권고 지시사항 (勸告 指示事項)</h3>
        <div className="flex flex-col gap-2">
            {briefing.suggestedActions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => onSuggestionDeliberate(action)}
                    className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors duration-200 text-sm text-teal-300 font-medium"
                >
                    &rarr; {action}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};