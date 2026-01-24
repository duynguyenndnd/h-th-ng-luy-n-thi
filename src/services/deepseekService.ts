import { Question } from "../types";
import { getCachedExplanation, cacheExplanation } from "./aiCacheService";

/**
 * Deepseek AI Service - Fallback khi Gemini không kết nối
 */

export const getDeepseekApiKey = (): string | undefined => {
  // Try Vite environment
  // @ts-ignore
  const viteKey = import.meta.env?.VITE_DEEPSEEK_API_KEY;
  if (viteKey) {
    console.log("✅ Using Deepseek API key from Vite environment");
    return viteKey;
  }

  // Try process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
      if (procKey) {
        console.log("✅ Using Deepseek API key from process.env");
        return procKey;
      }
    }
  } catch (e) {
    // Ignore error
  }

  console.warn("⚠️  Deepseek API key not found");
  return undefined;
};

export const streamDeepseekExplanation = async (
  question: Question,
  onUpdate: (text: string) => void,
  maxRetries: number = 2
): Promise<void> => {
  try {
    // 1️⃣ Kiểm tra cache trước
    const cached = getCachedExplanation(question.id, question.text);
    if (cached) {
      console.log("✅ Using cached Deepseek explanation");
      onUpdate(cached);
      return;
    }

    const apiKey = getDeepseekApiKey();
    if (!apiKey) {
      throw new Error("Deepseek API key not configured");
    }

    console.log("🤖 Calling Deepseek API for explanation...");

    // Chuẩn bị prompt
    const prompt = `
Hãy giải thích chi tiết cho câu hỏi sau:

**Câu hỏi:** ${question.text}

${question.options ? `**Các lựa chọn:**
${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

**Đáp án đúng:** ${question.options[question.correctIndex || 0]}` : ""}

${question.explanation ? `**Gợi ý:** ${question.explanation}` : ""}

Hãy cung cấp:
1. Giải thích chi tiết tại sao đó là đáp án đúng
2. Các khái niệm liên quan cần hiểu
3. Cách tiếp cận vấn đề
4. Các lỗi thường gặp khi làm câu hỏi này

Viết bằng tiếng Việt, dễ hiểu, phù hợp cho học sinh.
`;

    // Gọi Deepseek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Bạn là giáo viên giỏi, giải thích các câu hỏi một cách rõ ràng và chi tiết bằng tiếng Việt.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Deepseek API error: ${error.message || response.statusText}`);
    }

    // 3️⃣ Stream response từ Deepseek
    if (!response.body) {
      throw new Error("No response body from Deepseek");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Xử lý tất cả lines hoàn chỉnh
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              fullText += content;
              onUpdate(fullText);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      // Giữ lại line cuối nếu nó chưa hoàn chỉnh
      buffer = lines[lines.length - 1];
    }

    // Xử lý phần buffer còn lại
    if (buffer.trim().startsWith("data: ")) {
      const data = buffer.trim().slice(6);
      if (data !== "[DONE]") {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            fullText += content;
            onUpdate(fullText);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    // 4️⃣ Cache kết quả
    if (fullText) {
      cacheExplanation(question.id, question.text, fullText);
      console.log("✅ Deepseek explanation cached");
    }
  } catch (error) {
    console.error("❌ Deepseek error:", error);
    throw error;
  }
};

/**
 * Generate essay score using Deepseek (fallback)
 */
export const scoreEssayWithDeepseek = async (
  essayText: string,
  question: Question
): Promise<number> => {
  try {
    const apiKey = getDeepseekApiKey();
    if (!apiKey) {
      throw new Error("Deepseek API key not configured");
    }

    console.log("🤖 Scoring essay with Deepseek...");

    const prompt = `
Hãy đánh giá bài luận sau dựa trên các tiêu chí:
1. Nội dung chính xác (40%)
2. Cấu trúc logic (30%)
3. Ngôn ngữ và diễn đạt (20%)
4. Độ chi tiết (10%)

**Câu hỏi:** ${question.text}

**Bài viết của học sinh:**
${essayText}

**Yêu cầu đáp án:** ${question.explanation || ""}

Hãy cho điểm từ 0-10 và giải thích lý do.
Trả lời CHỈ duy nhất 1 số từ 0-10 ở đầu, không giải thích.
`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Bạn là giáo viên kiểm tra bài viết. Cho điểm từ 0-10.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`Deepseek scoring error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "5";
    const score = parseInt(content.match(/\d+/)?.[0] || "5");

    return Math.min(10, Math.max(0, score));
  } catch (error) {
    console.error("❌ Deepseek scoring error:", error);
    throw error;
  }
};
