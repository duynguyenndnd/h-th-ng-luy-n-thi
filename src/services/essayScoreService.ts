/**
 * Essay Scoring Service
 * Sử dụng AI để chấm điểm bài tự luận/tự do
 */

import { GoogleGenAI } from "@google/genai";
import { getApiKey } from './geminiService';

export interface EssayScore {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  details: {
    contentScore: number; // Chất lượng nội dung
    structureScore: number; // Cấu trúc bài viết
    languageScore: number; // Chất lượng ngôn ngữ
  };
}

/**
 * Chấm điểm bài tự luận/tự do sử dụng AI
 */
export const scoreEssayWithAI = async (
  essayText: string,
  questionText: string,
  expectedAnswer?: string,
  rubric?: string,
  onUpdate?: (text: string) => void
): Promise<EssayScore> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key không được tìm thấy");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Bạn là một giáo viên luyện thi chuyên nghiệp và công bằng. Hãy chấm điểm bài tự luận sau đây.

CÂUTIN HỎI:
${questionText}

BÀI TRẢ LỜI CỦA HỌC SINH:
${essayText}

${expectedAnswer ? `ĐÁP ÁN THAM KHẢO:\n${expectedAnswer}\n` : ''}

${rubric ? `TIÊU CHÍ CHẤM ĐIỂM:\n${rubric}\n` : ''}

Vui lòng:
1. Đánh giá bài viết dựa trên:
   - Nội dung & ý tưởng (40%)
   - Cấu trúc & tổ chức (30%)
   - Chất lượng ngôn ngữ & biểu đạt (30%)

2. Cho điểm từ 0-100

3. Cung cấp:
   - Đánh giá tổng thể
   - Điểm mạnh của bài viết (3-5 điểm)
   - Cần cải thiện (3-5 điểm)
   - Phản hồi chi tiết để học sinh cải thiện

Trả lời dưới dạng JSON với structure sau:
{
  "score": <number 0-100>,
  "contentScore": <number 0-100>,
  "structureScore": <number 0-100>,
  "languageScore": <number 0-100>,
  "feedback": "<string - đánh giá tổng thể>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>", ...],
  "improvements": ["<cần cải thiện 1>", "<cần cải thiện 2>", ...]
}

CHỈ TRẢ LỜI JSON, KHÔNG CÓ TEXT KHÁC.
    `;

    let fullResponse = "";

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        if (onUpdate) {
          onUpdate(fullResponse);
        }
      }
    }

    // Parse JSON response
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response không chứa JSON hợp lệ");
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, result.score || 0)),
      feedback: result.feedback || "Không có phản hồi",
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
      details: {
        contentScore: Math.min(100, Math.max(0, result.contentScore || 0)),
        structureScore: Math.min(100, Math.max(0, result.structureScore || 0)),
        languageScore: Math.min(100, Math.max(0, result.languageScore || 0))
      }
    };
  } catch (error: any) {
    console.error("Essay Scoring Error:", error);
    throw new Error(`Không thể chấm điểm bài viết: ${error.message}`);
  }
};

/**
 * Chấm điểm bài tự luận với retry logic
 */
export const scoreEssayWithRetry = async (
  essayText: string,
  questionText: string,
  expectedAnswer?: string,
  rubric?: string,
  onUpdate?: (text: string) => void,
  maxRetries: number = 3
): Promise<EssayScore> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Nỗ lực chấm điểm bài viết: ${attempt}/${maxRetries}`);
      return await scoreEssayWithAI(essayText, questionText, expectedAnswer, rubric, onUpdate);
    } catch (error: any) {
      lastError = error;
      console.warn(`Lần thứ ${attempt} thất bại:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error("Không thể chấm điểm sau nhiều lần thử");
};
