import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

/**
 * Essay/Short Answer Scoring Service
 * Sử dụng AI để chấm bài tự luận và câu trả lời tự do
 */

const getApiKey = (): string | undefined => {
  const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;
  
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  return undefined;
};

export interface EssayScoreResult {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  isAutoScored: boolean; // true = AI scored, false = manual needed
}

/**
 * Chấm bài tự luận/tự do bằng AI
 * @param question - Câu hỏi
 * @param userAnswer - Đáp án của học sinh
 * @returns Kết quả chấm với điểm số và nhận xét
 */
export const scoreEssay = async (
  question: Question,
  userAnswer: string
): Promise<EssayScoreResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API key not found for essay scoring");
    return null;
  }

  if (!userAnswer?.trim()) {
    return {
      score: 0,
      feedback: "Bạn chưa nhập câu trả lời",
      strengths: [],
      improvements: ["Cần nhập đáp án để được chấm điểm"],
      isAutoScored: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Bạn là một giáo viên chuyên chấm bài tự luận TSA (Thinking Skills Assessment). 
Hãy chấm bài trả lời của học sinh theo rubric dưới đây.

CÂUỐI: ${question.text}

ĐÁP ÁN CỦA HỌC SINH:
${userAnswer}

HƯỚNG DẪN CHẤM:
${question.explanation || "Dựa trên nội dung phù hợp và cách suy nghĩ logic"}

TIÊU CHÍ CHẤM:
1. Nội dung (40%): Trả lời đúng câu hỏi, có thông tin chính xác và đầy đủ
2. Cấu trúc (30%): Bài viết rõ ràng, logic, có mở bài - thân bài - kết bài
3. Ngôn ngữ (30%): Dùng từ chính xác, các bạn đơn giản, dễ hiểu

Hãy trả lời dưới dạng JSON với:
- score: điểm số từ 0-100
- feedback: nhận xét tổng thể (1-2 câu)
- strengths: điểm mạnh (3-5 điểm)
- improvements: cần cải thiện (3-5 điểm)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Điểm số từ 0-100" },
            feedback: { type: Type.STRING, description: "Nhận xét tổng thể" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Điểm mạnh của bài viết"
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Những điểm cần cải thiện"
            }
          },
          required: ["score", "feedback", "strengths", "improvements"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');

    // Validate score
    let score = Math.max(0, Math.min(100, data.score || 0));

    return {
      score,
      feedback: data.feedback || "Bài viết của bạn tốt",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      isAutoScored: true
    };
  } catch (error) {
    console.error("Essay scoring error:", error);
    return null;
  }
};

/**
 * Chấm short answer (câu trả lời ngắn)
 */
export const scoreShortAnswer = async (
  question: Question,
  userAnswer: string
): Promise<EssayScoreResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API key not found");
    return null;
  }

  if (!userAnswer?.trim()) {
    return {
      score: 0,
      feedback: "Chưa nhập câu trả lời",
      strengths: [],
      improvements: ["Cần nhập đáp án"],
      isAutoScored: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Chấm câu trả lời ngắn của học sinh.

CÂUỐI: ${question.text}
ĐÁP ÁN THAM KHẢO: ${question.correctAnswerText || ""}
ĐÁP ÁN CỦA HỌC SINH: ${userAnswer}

Hãy:
1. Xác định xem đáp án có đúng/gần đúng không (score 0-100)
2. Viết nhận xét (1-2 câu)
3. Nêu điểm tốt (nếu có)
4. Nêu cần cải thiện (nếu có)

Trả lời dưới dạng JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const score = Math.max(0, Math.min(100, data.score || 0));

    return {
      score,
      feedback: data.feedback || "Đáp án của bạn hợp lý",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      isAutoScored: true
    };
  } catch (error) {
    console.error("Short answer scoring error:", error);
    return null;
  }
};

/**
 * Convert score (0-100) to percentage
 */
export const scoreToPercentage = (score: number): number => {
  return Math.max(0, Math.min(100, score));
};
