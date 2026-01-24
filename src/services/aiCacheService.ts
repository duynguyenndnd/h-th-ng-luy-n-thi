/**
 * AI Explanation Cache Service
 * Lưu giải thích câu hỏi vào localStorage để tránh gọi API lại
 */

const CACHE_PREFIX = 'ai_explanation_';
const CACHE_EXPIRY_HOURS = 24 * 7; // 7 days

interface CachedExplanation {
  text: string;
  timestamp: number;
  questionHash: string;
}

/**
 * Tạo hash từ câu hỏi để dùng làm cache key
 */
const generateQuestionHash = (questionId: string, questionText: string): string => {
  const combined = `${questionId}_${questionText}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Lấy giải thích từ cache
 */
export const getCachedExplanation = (questionId: string, questionText: string): string | null => {
  try {
    const hash = generateQuestionHash(questionId, questionText);
    const cacheKey = `${CACHE_PREFIX}${hash}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const data: CachedExplanation = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

    // Check if cache expired
    if (age > maxAge) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`✅ Cache hit for question ${questionId}`);
    return data.text;
  } catch (e) {
    console.warn('Cache read error:', e);
    return null;
  }
};

/**
 * Lưu giải thích vào cache
 */
export const cacheExplanation = (
  questionId: string,
  questionText: string,
  explanation: string
): void => {
  try {
    const hash = generateQuestionHash(questionId, questionText);
    const cacheKey = `${CACHE_PREFIX}${hash}`;
    const data: CachedExplanation = {
      text: explanation,
      timestamp: Date.now(),
      questionHash: hash
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
    console.log(`💾 Cached explanation for question ${questionId}`);
  } catch (e) {
    console.warn('Cache write error:', e);
  }
};

/**
 * Xóa một giải thích khỏi cache
 */
export const clearCacheForQuestion = (questionId: string, questionText: string): void => {
  try {
    const hash = generateQuestionHash(questionId, questionText);
    const cacheKey = `${CACHE_PREFIX}${hash}`;
    localStorage.removeItem(cacheKey);
  } catch (e) {
    console.warn('Cache clear error:', e);
  }
};

/**
 * Xóa tất cả cache AI explanations
 */
export const clearAllAICache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Cleared all AI explanation cache');
  } catch (e) {
    console.warn('Clear all cache error:', e);
  }
};

/**
 * Lấy thống kê cache
 */
export const getCacheStats = (): { count: number; size: number } => {
  try {
    let count = 0;
    let size = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        count++;
        size += localStorage.getItem(key)?.length || 0;
      }
    });
    return { count, size };
  } catch (e) {
    return { count: 0, size: 0 };
  }
};
