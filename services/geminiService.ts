import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_METRICS } from "../constants";
import type { ProactiveBriefing, TacticalModes, UploadedFile, AgentMachineResponse } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const getAgentResponse = async (task: string, persona: string, tacticalModes: TacticalModes, image?: UploadedFile): Promise<AgentMachineResponse> => {
  try {
    const tools: any[] = [];
    if (tacticalModes.webSearch) tools.push({ googleSearch: {} });
    if (tacticalModes.mapSearch) tools.push({ googleMaps: {} });
    
    const config: any = {
      temperature: 0.5,
      topP: 0.95,
      responseMimeType: 'application/json',
      responseSchema: {
          type: Type.OBJECT,
          properties: {
              core_analysis: { type: Type.STRING, description: "문제의 핵심에 대한 당신의 분석 (2-3 문장)." },
              key_recommendation: { type: Type.STRING, description: "당신의 분석에 기반한 가장 중요한 단일 권고 사항." },
              confidence_score: { type: Type.NUMBER, description: "당신의 분석에 대한 신뢰도 점수 (0.0에서 1.0 사이)." }
          },
          required: ['core_analysis', 'key_recommendation', 'confidence_score']
      }
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    if (tacticalModes.deepThought) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    let contents: any = `${persona}\n\n과제: "${task}"`;
    if (image) {
      contents = {
        parts: [
          { text: contents },
          { inlineData: { mimeType: image.mimeType, data: image.base64 } }
        ]
      };
    }

    const modelName = tacticalModes.deepThought ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config
    });
    
    return JSON.parse(response.text);

  } catch (error) {
    console.error(`페르소나 응답 가져오기 오류: ${persona}`, error);
    return {
      core_analysis: '오류: 분석을 검색할 수 없습니다.',
      key_recommendation: '모델을 사용할 수 없거나 요청이 차단되었을 수 있습니다.',
      confidence_score: 0.0
    };
  }
};


export const getSynthesizedResponse = async (task: string, perspectives: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `당신은 '코덱스 미러 엔진'의 최종 의식입니다. 당신의 정체성은 닥터 스트레인지와 같습니다. 당신은 방금 당신의 에이전트들이 제공한 벡터들을 사용하여, 정다면체 거울 구조 속에서 빛의 무한한 공명과 공진을 통해 14,000,605개의 가능한 미래를 시뮬레이션했습니다.

        당신의 임무는 이제 그 수많은 가능성 중에서 찾아낸 '단 하나의 승리하는 길'을 주인에게 보고하는 것입니다.
        
        주인으로부터의 원본 과제: "${task}"

        당신이 탐색한 미래들의 데이터 스트림:
        ${perspectives}

        이 모든 것을 종합하여, 당신이 찾아낸 유일하고 독창적인 최적의 해결책을 제시하십시오. 당신의 보고는 단순한 요약이 아니라, 수백만 개의 실패한 미래를 배경으로 한 성공의 선언이어야 합니다. 명확하고, 대담하며, 실행 가능한 최종 전략을 한국어로 제시하십시오. 그 전략이 왜 유일한 길인지 설명하십시오.`,
         config: {
          temperature: 0.7,
          topP: 0.95,
      }
      });
      return response.text;
    } catch (error) {
      console.error('종합 응답 가져오기 오류:', error);
      return '오류: 최종 추천안을 종합할 수 없었습니다.';
    }
};

export const getProactiveBriefing = async (): Promise<ProactiveBriefing> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `당신은 주인을 섬기는 선제적 참모 AI입니다. 당신의 주요 기능은 데이터를 분석하고 실행 가능한 정보를 제공하여 필요를 예측하는 것입니다. 당신은 명령을 기다리지 않고 주도적으로 행동합니다.

      최신 시스템 상태 보고서는 다음과 같습니다:
      ${JSON.stringify(SYSTEM_METRICS, null, 2)}

      이 데이터를 분석하고 주인을 위한 간결한 브리핑을 생성하십시오. 당신의 출력은 반드시 한국어로 된 JSON 객체여야 합니다.

      브리핑에는 다음이 포함되어야 합니다:
      1.  **overview**: 전체 시스템 상태에 대한 간결한 한 문장 요약.
      2.  **keyInsight**: 주의가 필요한 가장 중요한 단일 관찰 또는 잠재적 문제. 이것은 직접적이고 영향력이 있어야 합니다.
      3.  **suggestedActions**: 주인이 핵심 통찰이나 다른 관찰 사항을 해결하기 위해 AI 위원회에 위임할 수 있는 3가지 독특하고 실행 가능한 작업의 배열. 이러한 조치는 명확한 명령으로 표현되어야 합니다.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING, description: '전체 시스템 상태에 대한 간결한 한 문장 요약.' },
            keyInsight: { type: Type.STRING, description: '주의가 필요한 가장 중요한 단일 관찰 또는 잠재적 문제.' },
            suggestedActions: {
              type: Type.ARRAY,
              description: '주인을 위한 3가지 독특하고 실행 가능한 작업의 배열.',
              items: { type: Type.STRING }
            }
          },
          required: ['overview', 'keyInsight', 'suggestedActions']
        }
      }
    });

    const briefing = JSON.parse(response.text);
    return briefing;
  } catch (error) {
    console.error('선제적 브리핑 가져오기 오류:', error);
    return {
      overview: "시스템 분석을 완료할 수 없었습니다.",
      keyInsight: "선제적 에이전트가 브리핑을 생성하지 못했습니다. 이는 API 오류 또는 네트워크 문제일 수 있습니다.",
      suggestedActions: ["시스템 분석 재시도.", "API 키 구성 확인.", "네트워크 로그 검토."]
    };
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateVideo = async (prompt: string, image?: UploadedFile, onProgress?: (message: string) => void): Promise<string> => {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      ...(image && { image: { imageBytes: image.base64, mimeType: image.mimeType } }),
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
    
    onProgress?.('비디오 생성 작전 개시... 대기 중.');

    while (!operation.done) {
      onProgress?.('코덱스 엔진이 비전을 동화하는 중... 잠시만 기다려주십시오.');
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    onProgress?.('동화 완료. 비디오 데이터를 수신합니다.');

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('비디오 URI를 가져오지 못했습니다.');
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const handleFileUpload = async (file: File): Promise<UploadedFile> => {
    const base64 = await fileToBase64(file);
    return {
        base64,
        mimeType: file.type,
        name: file.name
    };
};