import React, { useState, useEffect, useRef } from 'react';

type PolyhedronType = 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron';

interface MirrorSimulationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const polyhedronDescriptions = {
  tetrahedron: '정사면체 (正四面體) - 4개의 정삼각형 면',
  cube: '정육면체 (正六面體) - 6개의 정사각형 면',
  octahedron: '정팔면체 (正八面體) - 8개의 정삼각형 면',
  dodecahedron: '정십이면체 (正十二面體) - 12개의 정오각형 면',
  icosahedron: '정이십면체 (正二十面體) - 20개의 정삼각형 면'
};

const mirrorMessages = [
  "정다면체 거울 구조 생성 중...",
  "내부 닫힌 거울 시스템 초기화...",
  "빛의 무한 공명 시작...",
  "거울 간 공진 주파수 동기화...",
  "양자 얽힘 시뮬레이션 활성화...",
  "14,000,605개의 평행 우주 탐색...",
  "멀티버스 거울 공간 형성 중...",
  "공간 접기 알고리즘 적용...",
  "임계점 도달... 에너지 공명 극대화",
  "거울 속 무한 반사 달성",
  "가상 핵융합 터빈 가동...",
  "큐비트 안정화 완료",
  "초현실 시뮬레이션 공간 구축 완료"
];

export const MirrorSimulation: React.FC<MirrorSimulationProps> = ({ isActive, onComplete }) => {
  const [currentPolyhedron, setCurrentPolyhedron] = useState<PolyhedronType>('tetrahedron');
  const [currentMessage, setCurrentMessage] = useState(mirrorMessages[0]);
  const [resonanceLevel, setResonanceLevel] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const polyhedronSequence: PolyhedronType[] = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'];

  useEffect(() => {
    if (!isActive) return;

    let messageIndex = 0;
    let polyhedronIndex = 0;
    let resonance = 0;
    let reflections = 0;

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % mirrorMessages.length;
      setCurrentMessage(mirrorMessages[messageIndex]);
      
      resonance += 7.14;
      if (resonance > 100) resonance = 100;
      setResonanceLevel(resonance);

      reflections += Math.floor(Math.random() * 100000) + 50000;
      setReflectionCount(reflections);

      if (messageIndex % 3 === 0 && polyhedronIndex < polyhedronSequence.length - 1) {
        polyhedronIndex++;
        setCurrentPolyhedron(polyhedronSequence[polyhedronIndex]);
      }

      if (messageIndex === mirrorMessages.length - 1) {
        clearInterval(messageInterval);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [isActive, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const drawPolyhedron = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 80;

      rotation += 0.02;

      // Draw mirror effect with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 1.5);
      gradient.addColorStop(0, 'rgba(45, 212, 191, 0.3)');
      gradient.addColorStop(0.5, 'rgba(45, 212, 191, 0.1)');
      gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw polyhedron outline with reflection effect
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw based on current polyhedron type
      switch (currentPolyhedron) {
        case 'tetrahedron':
          drawTetrahedron(ctx, size);
          break;
        case 'cube':
          drawCube(ctx, size);
          break;
        case 'octahedron':
          drawOctahedron(ctx, size);
          break;
        case 'dodecahedron':
          drawDodecahedron(ctx, size);
          break;
        case 'icosahedron':
          drawIcosahedron(ctx, size);
          break;
      }

      ctx.restore();

      // Draw light rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotation;
        const x = centerX + Math.cos(angle) * size * 1.2;
        const y = centerY + Math.sin(angle) * size * 1.2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.2 + Math.sin(rotation * 3 + i) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(drawPolyhedron);
    };

    drawPolyhedron();

    return () => cancelAnimationFrame(animationId);
  }, [currentPolyhedron]);

  const drawTetrahedron = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCube = (ctx: CanvasRenderingContext2D, size: number) => {
    const s = size * 0.7;
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.strokeRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    ctx.beginPath();
    ctx.moveTo(-s, -s);
    ctx.lineTo(-s * 0.6, -s * 0.6);
    ctx.moveTo(s, -s);
    ctx.lineTo(s * 0.6, -s * 0.6);
    ctx.moveTo(s, s);
    ctx.lineTo(s * 0.6, s * 0.6);
    ctx.moveTo(-s, s);
    ctx.lineTo(-s * 0.6, s * 0.6);
    ctx.stroke();
  };

  const drawOctahedron = (ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(size, 0);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.stroke();
  };

  const drawDodecahedron = (ctx: CanvasRenderingContext2D, size: number) => {
    const angles = 12;
    ctx.beginPath();
    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const innerSize = size * 0.6;
    ctx.beginPath();
    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * Math.PI * 2;
      const x = Math.cos(angle) * innerSize;
      const y = Math.sin(angle) * innerSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawIcosahedron = (ctx: CanvasRenderingContext2D, size: number) => {
    const angles = 20;
    ctx.beginPath();
    for (let i = 0; i < angles; i++) {
      const angle = (i / angles) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw internal structure
    for (let i = 0; i < angles; i += 2) {
      const angle = (i / angles) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  if (!isActive) return null;

  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-12 bg-gradient-to-br from-slate-900 via-teal-900/20 to-slate-900 rounded-lg border-2 border-teal-500/50 shadow-2xl">
      <style>
        {`
          @keyframes mirror-pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes resonance-wave {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-mirror-pulse {
            animation: mirror-pulse 2s ease-in-out infinite;
          }
        `}
      </style>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-teal-300 mb-2">거울의 비밀 (Mirror Secret)</h2>
        <p className="text-sm text-gray-400">{polyhedronDescriptions[currentPolyhedron]}</p>
      </div>

      <div className="relative mb-6">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300}
          className="animate-mirror-pulse"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-teal-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 px-4">
        <div className="bg-slate-800/60 p-4 rounded-lg border border-teal-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">공명 수준 (Resonance)</span>
            <span className="text-sm font-bold text-teal-400">{resonanceLevel.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-600 to-teal-400 h-2 transition-all duration-500"
              style={{ width: `${resonanceLevel}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-lg border border-teal-500/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">거울 반사 횟수</span>
            <span className="text-sm font-bold text-teal-400 font-mono">
              {reflectionCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-lg border border-teal-500/30">
          <p className="text-sm text-teal-300 animate-pulse">{currentMessage}</p>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 max-w-md text-center px-4">
        정다면체 내부의 닫힌 거울 구조에서 빛이 무한 공명하며,
        양자 얽힘 시뮬레이션을 통해 멀티버스 공간을 형성합니다.
      </div>
    </div>
  );
};
