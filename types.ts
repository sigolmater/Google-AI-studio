import type React from 'react';

export interface Agent {
  name: string;
  specialty: string;
  Icon: React.ComponentType<{ className?: string }>;
  persona: string;
}

export interface AgentMachineResponse {
  core_analysis: string;
  key_recommendation: string;
  confidence_score: number;
}


export interface AgentResponse {
  agent: Agent;
  response: AgentMachineResponse | string; // Allow string for graceful failure
  isLoading: boolean;
}

export interface ProactiveBriefing {
  overview: string;
  keyInsight: string;
  suggestedActions: string[];
}

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface TacticalModes {
  webSearch: boolean;
  mapSearch: boolean;
  deepThought: boolean;
}

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}