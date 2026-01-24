import { GoogleGenAI, Type } from "@google/genai";
import { Exam, Question, QuestionCategory, ExamType } from "../types";
import { generateId } from "./dbService";
import { getCachedExplanation, cacheExplanation } from "./aiCacheService";
import { streamOpenAIExplanation, scoreEssayWithOpenAI } from "./openaiService";

// Safe API Key Retrieval for Web Deployments
export const getApiKey = (): string | undefined => {
  // Try to get from Vite's import.meta.env (build-time injection)
  // @ts-ignore
  const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (viteKey) {
    console.log("✅ Using API key from Vite environment");
    return viteKey;
  }

  // Try to get from process.env (for Node.js/server contexts)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.REACT_APP_API_KEY;
      if (procKey) {
        console.log("✅ Using API key from process.env");
        return procKey;
      }
    }
  } catch (e) {
    // Ignore error
  }

  // Debug: show what we're looking for
  console.error("❌ API key not found. Checked: import.meta.env.VITE_GEMINI_API_KEY");
  return undefined;
};

// Helper to convert URL to Base64 (simplified for specific cases)
const getImagePart = async (imageUrl: string): Promise<any | null> => {
  if (imageUrl.startsWith('data:image')) {
    const mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
    const data = imageUrl.substring(imageUrl.indexOf(',') + 1);
    return {
      inlineData: {
        mimeType: mimeType,
        data: data
      }
    };
  }
  if (imageUrl.startsWith('http')) {
     try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result as string);
           reader.readAsDataURL(blob);
        });
        return {
           inlineData: {
              mimeType: blob.type,
              data: base64.split(',')[1]
           }
        };
     } catch (e) {
        console.warn("Cannot fetch image for AI analysis due to CORS or Network:", e);
        return null;
     }
  }
  return null;
};

export const streamAIExplanation = async (question: Question, onUpdate: (text: string) => void, maxRetries: number = 2): Promise<void> => {
  try {
    // 1️⃣ Kiểm tra cache trước
    const cached = getCachedExplanation(question.id, question.text);
    if (cached) {
      onUpdate(cached);
      return;
    }

    const geminiKey = getApiKey();
    
    // 2️⃣ Try Gemini first
    if (geminiKey) {
      let lastError: any;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🤖 Attempting Gemini (${attempt}/${maxRetries})...`);
          await generateAIExplanation(question, onUpdate);
          return;
        } catch (error: any) {
          lastError = error;
          console.warn(`⚠️ Gemini attempt ${attempt} failed:`, error.message);
          
          // Retry với backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }
      console.log("❌ Gemini failed all attempts, trying OpenAI...");
    }

    // 3️⃣ Fallback to OpenAI
    try {
      console.log("🔄 Falling back to OpenAI...");
      await streamOpenAIExplanation(question, onUpdate);
      return;
    } catch (openaiError) {
      console.error("❌ OpenAI also failed:", openaiError);
    }

    // 4️⃣ Final fallback: Dùng explanation từ file
    if (question.explanation) {
      const fallbackMsg = `📖 (AI không khả dụng)\n\n${question.explanation}`;
      onUpdate(fallbackMsg);
      cacheExplanation(question.id, question.text, fallbackMsg);
    } else {
      const errorMsg = "❌ Lỗi: Không thể lấy giải thích. Vui lòng thử lại sau.";
      onUpdate(errorMsg);
    }
  } catch (error) {
    console.error("Unexpected error in streamAIExplanation:", error);
    onUpdate("❌ Có lỗi xảy ra. Vui lòng thử lại.");
  }
};

/**
 * Hàm nội bộ để generate explanation từ AI
 */
const generateAIExplanation = async (question: Question, onUpdate: (text: string) => void): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API key not found");

  const ai = new GoogleGenAI({ apiKey });
  
  // 🎯 Tối ưu prompt: Giảm kích thước, tăng độ chính xác
  const promptText = `Giải thích câu hỏi sau:

Câu: ${question.text}

${question.options ? `Đáp án: ${question.options.map((opt, i) => `${i}. ${opt}`).join(' | ')}` : ''}

Đúng: ${question.correctIndex}

Hãy giải thích ngắn gọn, dễ hiểu. Tiếng Việt.`;

  const parts: any[] = [];
  
  // Nếu có hình ảnh, thêm vào
  if (question.image) {
    const imagePart = await getImagePart(question.image);
    if (imagePart) parts.push(imagePart);
  }
  
  parts.push({ text: promptText });

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2-flash', // Nhanh hơn, chi phí thấp hơn
    contents: { parts: parts },
  });

  let fullText = "";
  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) {
      fullText += text;
      onUpdate(fullText);
    }
  }

  // 💾 Lưu vào cache
  if (fullText) {
    cacheExplanation(question.id, fullText);
  }
};

export const generateExamFromTopic = async (topic: string, userTags: string[] = []): Promise<Exam | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    alert("Lỗi: Không tìm thấy API Key.\nVui lòng cấu hình biến môi trường 'VITE_API_KEY' trên server deploy.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Tạo một đề thi trắc nghiệm TSA (Thinking Skills Assessment) bằng Tiếng Việt về chủ đề: "${topic}".
      Đề thi phải bao gồm 5 câu hỏi chất lượng cao, kiểm tra tư duy logic hoặc giải quyết vấn đề.
      Mỗi câu hỏi phải có 5 lựa chọn (options), chỉ 1 đáp án đúng.
      Hãy gán các từ khóa (tags) phù hợp cho mỗi câu hỏi.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Tiêu đề ngắn gọn cho đề thi" },
            description: { type: Type.STRING, description: "Mô tả ngắn về nội dung đề thi" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Nội dung câu hỏi" },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Danh sách 5 lựa chọn trả lời"
                  },
                  correctIndex: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (0-4)" },
                  explanation: { type: Type.STRING, description: "Giải thích chi tiết tại sao đáp án đúng" },
                  category: { type: Type.STRING, description: "Loại câu hỏi (Problem Solving hoặc Critical Thinking)" },
                  tags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Các từ khóa phân loại câu hỏi" 
                  }
                },
                required: ["text", "options", "correctIndex", "explanation", "category"]
              }
            }
          },
          required: ["title", "description", "questions"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (!data.questions || data.questions.length === 0) throw new Error("Không nhận được dữ liệu hợp lệ.");

    const questions: Question[] = data.questions.map((q: any) => {
      const aiTags = Array.isArray(q.tags) ? q.tags : [];
      return {
        id: generateId(),
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        category: q.category.includes('Problem') ? QuestionCategory.PROBLEM_SOLVING : 
                  q.category.includes('Critical') ? QuestionCategory.CRITICAL_THINKING : QuestionCategory.UNKNOWN,
        tags: Array.from(new Set([...aiTags, ...userTags]))
      };
    });

    return {
      id: generateId(),
      type: ExamType.TSA,
      title: data.title || `Đề thi: ${topic}`,
      description: data.description || `Đề thi tạo bởi AI về chủ đề ${topic}`,
      durationMinutes: 15,
      questionCount: questions.length,
      createdAt: Date.now(),
      questions
    };

  } catch (error) {
    console.error("Gemini Generate Exam Error:", error);
    alert("Không thể tạo đề thi lúc này. Vui lòng thử lại sau.");
    return null;
  }
};