import React from 'react';
import type { Agent, AgentMachineResponse } from '../types';

interface AgentCardProps {
  agent: Agent;
  response: AgentMachineResponse | string;
  isLoading: boolean;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-slate-600 rounded w-3/4"></div>
        <div className="h-4 bg-slate-600 rounded w-full"></div>
        <div className="h-4 bg-slate-600 rounded w-1/2"></div>
        <div className="h-2.5 bg-slate-600 rounded-full w-full mt-2"></div>
    </div>
);


export const AgentCard: React.FC<AgentCardProps> = ({ agent, response, isLoading }) => {
  const { name, specialty, Icon } = agent;

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (typeof response === 'string') {
      return <p className="text-red-400">{response}</p>;
    }

    const { core_analysis, key_recommendation, confidence_score } = response;
    const confidencePercentage = confidence_score * 100;
    
    return (
      <div className="space-y-3">
        <p className="font-semibold text-gray-300">핵심 분석:</p>
        <p>{core_analysis}</p>
        <p className="font-semibold text-gray-300 pt-2">주요 권고:</p>
        <p>{key_recommendation}</p>
        <div className="pt-2">
           <p className="text-xs text-gray-400 mb-1">신뢰도: {confidencePercentage.toFixed(0)}%</p>
           <div className="w-full bg-slate-700 rounded-full h-1.5">
               <div className="bg-teal-500 h-1.5 rounded-full" style={{width: `${confidencePercentage}%`}}></div>
           </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col p-4 bg-slate-800/60 rounded-lg border border-slate-700 h-full shadow-md transition-all duration-300 hover:border-teal-500/50 hover:shadow-lg">
      <div className="flex items-center mb-3">
        <Icon className="w-6 h-6 mr-3 text-teal-400" />
        <h3 className="font-bold text-lg text-gray-100">{name}</h3>
      </div>
      <p className="text-xs text-gray-400 mb-4 italic">{specialty}</p>
      <div className="flex-grow text-sm text-gray-300 leading-relaxed">
        {renderContent()}
      </div>
    </div>
  );
};