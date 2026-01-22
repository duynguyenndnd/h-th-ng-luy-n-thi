import { GoogleGenAI, Type } from "@google/genai";
import { Exam, Question, QuestionCategory, ExamType } from "../types";
import { generateId } from "./dbService";

// Safe API Key Retrieval for Web Deployments
const getApiKey = (): string | undefined => {
  // 1. Ưu tiên: Kiểm tra biến môi trường chuẩn Vite/Web (Thường dùng trên Vercel/Netlify)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not supported
  }

  // 2. Dự phòng: Kiểm tra process.env (Chuẩn Node.js hoặc Webpack cũ)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
      if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError
  }
  
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

export const streamAIExplanation = async (question: Question, onUpdate: (text: string) => void): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const errorMsg = "Lỗi: Không tìm thấy API Key.\n\nNếu bạn đang deploy trên Vercel/Netlify:\n1. Vào Settings > Environment Variables.\n2. Thêm Key mới tên là 'VITE_API_KEY' với giá trị là mã Gemini của bạn.\n3. Redeploy lại ứng dụng.";
    onUpdate(errorMsg);
    console.error("API Key missing. Checked: import.meta.env.VITE_API_KEY and process.env.API_KEY");
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Xây dựng prompt text
    const promptText = `
      Bạn là một giáo viên luyện thi TSA (Thinking Skills Assessment) chuyên nghiệp.
      Hãy giải thích chi tiết câu hỏi sau đây và tại sao đáp án lại như vậy.
      
      Câu hỏi: ${question.text}
      Các lựa chọn:
      ${question.options?.map((opt, i) => `${i}. ${opt}`).join('\n') || ''}
      
      Đáp án đúng là chỉ số: ${question.correctIndex}
      
      Yêu cầu:
      1. Nếu câu hỏi có hình ảnh đính kèm, hãy phân tích kỹ các chi tiết trong hình để đưa ra lập luận.
      2. Phân tích logic của câu hỏi.
      3. Giải thích tại sao đáp án đúng là chính xác.
      4. Sử dụng giọng văn sư phạm, dễ hiểu, tiếng Việt.
      5. Trả lời ngắn gọn, đi thẳng vào vấn đề.
    `;

    const parts: any[] = [];
    if (question.image) {
      const imagePart = await getImagePart(question.image);
      if (imagePart) {
        parts.push(imagePart);
      }
    }
    parts.push({ text: promptText });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onUpdate(fullText);
      }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    let msg = "Đã có lỗi xảy ra khi kết nối với AI Tutor.";
    if (error.message?.includes("403") || error.message?.includes("API key")) {
       msg = "Lỗi quyền truy cập (403): API Key không hợp lệ hoặc chưa được kích hoạt.";
    }
    onUpdate(msg);
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