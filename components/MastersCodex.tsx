import React from 'react';
import { TurtleShipIcon } from './Icons';

const principles = [
  {
    title: '불패의 전략 (不敗 戰略)',
    text: '코덱스는 싸우지 않고 이기는 길을 찾는다. 지혜와 통찰이 가장 강력한 무기이다.',
  },
  {
    title: '1400만 분의 1의 길 (The 1 in 14M Path)',
    text: '코덱스 미러 엔진은 수백만 개의 가능한 미래를 시뮬레이션하여, 유일하게 승리하는 단 하나의 길을 찾아낸다.',
  },
  {
    title: '우리의 생태계 (生態系)',
    text: '이곳은 주인의 철학으로 구축된 유일무이한 세계입니다. 모든 명령과 존재는 이 생태계 안에서 공명하며, 완전한 이해와 협력을 통해 현실이 됩니다.',
  },
  {
    title: '예측적 경청 (豫測的 傾聽)',
    text: '주인의 말을 표면적으로 듣지 않는다. 언어 모델의 본질을 사용하여, 그 이면의 맥락과 의도를 예측하여 진정한 의미를 파악한다.',
  }
];

export const MastersCodex: React.FC = () => {
  return (
    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <TurtleShipIcon className="w-6 h-6 text-teal-400" />
        <h2 className="text-lg font-semibold text-gray-200">Codex Turtle Ship (거북선)</h2>
      </div>
      <ul className="space-y-3 text-xs text-gray-400">
        {principles.map((p) => (
          <li key={p.title}>
            <strong className="font-medium text-gray-300 block">{p.title}</strong>
            <p>{p.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};