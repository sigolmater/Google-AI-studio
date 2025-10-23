import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AgentCard } from './components/AgentCard';
import { AGENTS, SYSTEM_METRICS } from './constants';
import { getAgentResponse, getSynthesizedResponse, getProactiveBriefing, generateImage, generateVideo, handleFileUpload } from './services/geminiService';
import type { Agent, AgentResponse, ProactiveBriefing, TacticalModes, UploadedFile, GeneratedMedia, AgentMachineResponse } from './types';
import { TurtleShipIcon, UploadIcon, SparklesIcon, PhotoIcon, VideoIcon, SimulationIcon } from './components/Icons';
import { MastersCodex } from './components/MastersCodex';
import { SystemMonitor } from './components/SystemMonitor';
import { AgentBriefing, BriefingSkeleton } from './components/AgentBriefing';
import { SimulationVisualizer } from './components/SimulationVisualizer';

const TacticalModeToggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className="font-semibold text-gray-300 text-sm">{label}</label>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`${checked ? 'bg-teal-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
      <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
  </div>
);


const App: React.FC = () => {
  const [task, setTask] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(true);
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [synthesizedResponse, setSynthesizedResponse] = useState<string>('');
  const [proactiveBriefing, setProactiveBriefing] = useState<ProactiveBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia | null>(null);
  const [pollingMessage, setPollingMessage] = useState<string>('');

  const [tacticalModes, setTacticalModes] = useState<TacticalModes>({
    webSearch: false,
    mapSearch: false,
    deepThought: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsBriefingLoading(true);
      try {
        const briefing = await getProactiveBriefing();
        setProactiveBriefing(briefing);
      } catch (err) {
        console.error('선제적 브리핑을 가져오는 데 실패했습니다:', err);
        setError('에이전트로부터 선제적 브리핑을 가져오는 데 실패했습니다.');
      } finally {
        setIsBriefingLoading(false);
      }
    };
    fetchBriefing();
  }, []);

  const resetState = () => {
    setError(null);
    setAgentResponses([]);
    setSynthesizedResponse('');
    setGeneratedMedia(null);
    setPollingMessage('');
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      try {
        const processedFile = await handleFileUpload(file);
        setUploadedFile(processedFile);
      } catch (err) {
        setError('파일 처리 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  const handleSimulation = useCallback(async (taskOverride?: string) => {
    setIsLoading(true);
    resetState();

    let effectiveTask = (taskOverride ?? task).trim();
    if (uploadedFile && effectiveTask === '') {
      effectiveTask = `${uploadedFile.name} 파일을 분석하십시오.`;
    } else if (effectiveTask === '') {
      effectiveTask = `현재 시스템 상태를 분석하고 다음 데이터를 기반으로 포괄적인 상태 평가 및 권장 사항을 제공하십시오:\n\n${JSON.stringify(SYSTEM_METRICS, null, 2)}`;
    }

    try {
      const responsesPromises = AGENTS.map(async (agent: Agent) => {
        const responseJson = await getAgentResponse(effectiveTask, agent.persona, tacticalModes, uploadedFile ?? undefined);
        return { agent, response: responseJson, isLoading: false };
      });

      const resolvedResponses = await Promise.all(responsesPromises);
      setAgentResponses(resolvedResponses);
      
      const synthesisPrompt = resolvedResponses.map(r => {
        if (typeof r.response === 'string') {
           return `\n\n### ${r.agent.name}의 보고 (오류):\n${r.response}`;
        }
        return `\n\n### ${r.agent.name}의 벡터:\n- 분석: ${r.response.core_analysis}\n- 권고: ${r.response.key_recommendation}\n- 신뢰도: ${r.response.confidence_score}`;
      }).join('');

      const finalResponse = await getSynthesizedResponse(effectiveTask, synthesisPrompt);
      setSynthesizedResponse(finalResponse);

    } catch (err) {
      console.error('오류가 발생했습니다:', err);
      setError('AI로부터 응답을 받는 데 실패했습니다. API 키를 확인하고 다시 시도하십시오.');
    } finally {
      setIsLoading(false);
    }
  }, [task, uploadedFile, tacticalModes]);

  const handleGenerateImage = async () => {
    if (!task.trim()) {
      setError('비전 생성을 위한 지시가 필요합니다.');
      return;
    }
    setIsLoading(true);
    resetState();
    try {
      const imageUrl = await generateImage(task);
      setGeneratedMedia({ type: 'image', url: imageUrl, prompt: task });
    } catch (err) {
      console.error('이미지 생성 오류:', err);
      setError('비전 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!task.trim() && !uploadedFile) {
        setError('비전 동화를 위한 지시 또는 이미지가 필요합니다.');
        return;
    }
    setIsLoading(true);
    resetState();
    try {
        const videoUrl = await generateVideo(task, uploadedFile ?? undefined, setPollingMessage);
        setGeneratedMedia({ type: 'video', url: videoUrl, prompt: task });
    } catch (err) {
        console.error('비디오 생성 오류:', err);
        setError('비전 동화에 실패했습니다.');
    } finally {
        setIsLoading(false);
        setPollingMessage('');
    }
  };

  const handleSuggestionSimulation = (suggestion: string) => {
    setTask(suggestion);
    setUploadedFile(null);
    handleSimulation(suggestion);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <SimulationVisualizer message={pollingMessage} />;
    }
    
    if (generatedMedia) {
      return (
        <div className="col-span-full p-4 bg-slate-800/60 rounded-lg border border-slate-700">
           <h3 className="font-bold text-lg text-gray-100 mb-3 flex items-center gap-2">
                {generatedMedia.type === 'image' ? <PhotoIcon className="w-6 h-6 text-teal-400" /> : <VideoIcon className="w-6 h-6 text-teal-400" />}
                {generatedMedia.type === 'image' ? '생성된 비전' : '동화된 비전'}
            </h3>
            {generatedMedia.type === 'image' ? (
                <img src={generatedMedia.url} alt={generatedMedia.prompt} className="rounded-md w-full" />
            ) : (
                <video src={generatedMedia.url} controls autoPlay loop className="rounded-md w-full" />
            )}
            <p className="text-xs text-gray-400 mt-2 italic">지시: "{generatedMedia.prompt}"</p>
        </div>
      );
    }
    
    if (agentResponses.length > 0) {
      return agentResponses.map(({ agent, response }) => (
        <AgentCard key={agent.name} agent={agent} response={response} isLoading={false} />
      ));
    }
    
    if (isBriefingLoading) return <BriefingSkeleton />;
    
    if (proactiveBriefing) {
      return <AgentBriefing briefing={proactiveBriefing} onSuggestionDeliberate={handleSuggestionSimulation} />;
    }
    
    return (
      <div className="col-span-full text-center py-20">
        <p className="text-gray-500">함대가 주인의 지시를 기다립니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-slate-900 text-gray-200">
      <aside className="w-full md:w-1/3 lg:w-1/4 p-6 md:p-8 bg-slate-800/50 border-r border-slate-700 flex flex-col gap-6">
        <div className="flex items-center gap-3">
            <TurtleShipIcon className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl font-bold text-gray-100">코덱스 거북선 AI</h1>
        </div>
        <p className="text-sm text-gray-400">지휘 콘솔을 통해 함대에 지시를 내리십시오. 미디어를 투입하고 전술 모드를 활용하여 작전 능력을 극대화할 수 있습니다.</p>

        <SystemMonitor />
        <MastersCodex />

        <div className="flex flex-col gap-4 flex-grow">
          <div>
            <label className="font-semibold text-gray-300 mb-2 block">지휘 콘솔 (指揮 Console)</label>
            <div className="relative">
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full p-3 pr-10 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow duration-200 text-sm"
                placeholder="지시를 입력하거나 파일을 투입하십시오..."
                rows={4}
              />
              <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-teal-400">
                <UploadIcon className="w-5 h-5" />
              </button>
            </div>
            {uploadedFile && (
                <div className="mt-2 p-2 bg-slate-900 border border-slate-700 rounded-md flex items-center gap-2">
                    <img src={`data:${uploadedFile.mimeType};base64,${uploadedFile.base64}`} alt="preview" className="w-10 h-10 rounded object-cover" />
                    <span className="text-xs text-gray-400 truncate flex-grow">{uploadedFile.name}</span>
                    <button onClick={() => setUploadedFile(null)} className="text-gray-500 hover:text-white text-xs pr-1">&times;</button>
                </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-900/70 border border-slate-700 rounded-lg space-y-3">
             <h3 className="font-semibold text-gray-300 text-sm">전술 모드 (戰術 Mode)</h3>
             <TacticalModeToggle label="웹 접속" description="실시간 웹 정보로 분석을 강화합니다." checked={tacticalModes.webSearch} onChange={v => setTacticalModes(p => ({...p, webSearch:v}))} />
             <TacticalModeToggle label="지도 접속" description="지리적, 공간적 맥락을 활용합니다." checked={tacticalModes.mapSearch} onChange={v => setTacticalModes(p => ({...p, mapSearch:v}))} />
             <TacticalModeToggle label="깊은 숙고" description="최고 복잡도 문제 해결을 위한 최대 연산" checked={tacticalModes.deepThought} onChange={v => setTacticalModes(p => ({...p, deepThought:v}))} />
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => handleSimulation()} disabled={isLoading} className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2">
            <SimulationIcon className="w-5 h-5" />
            {isLoading ? "시뮬레이션 중..." : "시뮬레이션 시작 (開始)"}
          </button>
          
          {uploadedFile ? (
            <button onClick={handleGenerateVideo} disabled={isLoading} className="w-full px-4 py-2 font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-lg hover:bg-teal-900 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2">
                <VideoIcon className="w-5 h-5"/> 비전 동화
            </button>
          ) : (
            <button onClick={handleGenerateImage} disabled={isLoading} className="w-full px-4 py-2 font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-lg hover:bg-teal-900 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2">
                <SparklesIcon className="w-5 h-5"/> 비전 생성
            </button>
          )}

        </div>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </aside>

      <main className="w-full md:w-2/3 lg:w-3/4 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            {synthesizedResponse && (
                 <div className={`mb-8 p-6 bg-gradient-to-br from-teal-900/50 to-slate-800/50 rounded-xl border border-teal-700/50 shadow-lg ${synthesizedResponse ? 'animate-pulse-glow' : ''}`}>
                    <h2 className="text-xl font-bold text-teal-300 mb-3">종합 분석 보고: 유일한 길</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">{synthesizedResponse}</p>
                 </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;