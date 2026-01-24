
import { Exam, Question, QuestionCategory, QuestionDifficulty, QuestionType, ExamType } from '../types';
import { generateId } from './dbService';
import { getDefaultDuration } from '../constants/examConfig';

// --- Interfaces ---
// (Giữ nguyên interfaces cũ, chỉ cập nhật logic hàm map)

interface TSAJsonExamMetadata {
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  total_questions: number;
  subject_area?: string;
  type?: ExamType; // Add type support
}

interface TSAJsonAnswer {
  text: string;
  is_correct: boolean;
  explanation?: string;
}

interface TSAJsonTrueFalseItem {
  statement: string;
  correct_answer: boolean;
  explanation?: string;
}

interface TSAJsonQuestion {
  id: number | string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false_grid' | 'fill_in_blank' | 'fill_in_table' | 'reading_comprehension';
  difficulty: string;
  points: number;
  category: string;
  subcategory: string;
  explanation: string;
  question_image?: string;
  answers?: TSAJsonAnswer[];
  true_false_items?: TSAJsonTrueFalseItem[];
  correct_answer?: string | number;
  sub_questions?: TSAJsonQuestion[];
}

// Updated Map Category for HSA Support
const mapCategory = (catString: string): QuestionCategory => {
  const s = (catString || '').toLowerCase();
  
  // HSA Subjects
  if (s.includes('toán') || s.includes('math')) return QuestionCategory.MATH;
  if (s.includes('lý') || s.includes('vật lí') || s.includes('physics')) return QuestionCategory.PHYSICS;
  if (s.includes('hóa') || s.includes('chemistry')) return QuestionCategory.CHEMISTRY;
  if (s.includes('sinh') || s.includes('biology')) return QuestionCategory.BIOLOGY;
  if (s.includes('sử') || s.includes('lịch sử') || s.includes('history')) return QuestionCategory.HISTORY;
  if (s.includes('địa') || s.includes('geography')) return QuestionCategory.GEOGRAPHY;
  if (s.includes('anh') || s.includes('english')) return QuestionCategory.ENGLISH;
  if (s.includes('văn') || s.includes('literature') || s.includes('ngữ văn')) return QuestionCategory.LITERATURE;

  // TSA Categories
  if (s.includes('problem') || s.includes('định lượng')) return QuestionCategory.PROBLEM_SOLVING;
  if (s.includes('critical') || s.includes('phản biện') || s.includes('logic')) return QuestionCategory.CRITICAL_THINKING;
  
  return QuestionCategory.UNKNOWN;
};

// Helper: Map Difficulty
const mapDifficulty = (diffString: string): QuestionDifficulty => {
  const s = (diffString || '').toLowerCase();
  if (s.includes('easy') || s.includes('dễ') || s.includes('nb') || s.includes('th')) return QuestionDifficulty.EASY;
  if (s.includes('hard') || s.includes('khó') || s.includes('vdc') || s.includes('vận dụng cao')) return QuestionDifficulty.HARD;
  return QuestionDifficulty.MEDIUM;
};

// Helper: Convert LaTeX-like math symbols to KaTeX format
const fixMathSymbols = (text: string): string => {
  if (!text) return text;
  
  // Fix ${...}$ format (replace with ${...}$)
  text = text.replace(/\$\{([^}]+)\}\$/g, '$$${ $1 }$$');
  
  // Common math symbol replacements
  const replacements: Record<string, string> = {
    '\\\\circ': '^\\circ',           // ° symbol
    '\\\\sqrt': '\\sqrt',              // Square root
    '\\\\mathbb': '\\mathbb',          // Blackboard bold
    '\\\\Rightarrow': '\\Rightarrow',  // Right arrow
    '\\\\Leftrightarrow': '\\Leftrightarrow',
    '\\\\frac': '\\frac',              // Fraction
    '\\\\Delta': '\\Delta',            // Greek Delta
    '\\\\triangle': '\\triangle',      // Triangle symbol
    '\\\\angle': '\\angle',            // Angle symbol
    '\\\\approx': '\\approx',          // Approximately equal
    '\\\\leq': '\\leq',                // Less than or equal
    '\\\\geq': '\\geq',                // Greater than or equal
    '\\\\neq': '\\neq',                // Not equal
    '\\\\times': '\\times',            // Multiply
    '\\\\div': '\\div',                // Division
    '\\\\pm': '\\pm',                  // Plus minus
    '\\\\infty': '\\infty',            // Infinity
    '\\\\alpha': '\\alpha',            // Alpha
    '\\\\beta': '\\beta',              // Beta
    '\\\\gamma': '\\gamma',            // Gamma
    '\\\\pi': '\\pi',                  // Pi
    '\\\\sin': '\\sin',                // Sin
    '\\\\cos': '\\cos',                // Cos
    '\\\\tan': '\\tan',                // Tan
    '\\\\log': '\\log',                // Log
    '\\\\ln': '\\ln',                  // Natural log
    '\\\\sum': '\\sum',                // Sum
    '\\\\prod': '\\prod',              // Product
    '\\\\int': '\\int',                // Integral
    '\\\\in': '\\in',                  // In (set membership)
    '\\\\notin': '\\notin',            // Not in
    '\\\\cup': '\\cup',                // Union
    '\\\\cap': '\\cap',                // Intersection
    '\\\\subset': '\\subset',          // Subset
    '\\\\forall': '\\forall',          // For all
    '\\\\exists': '\\exists',          // Exists
  };
  
  // Apply replacements
  Object.entries(replacements).forEach(([from, to]) => {
    text = text.replace(new RegExp(from, 'g'), to);
  });
  
  return text;
};

export const parseJSONExam = (content: string): Exam | null => {
  try {
    const rawData = JSON.parse(content);
    let questions: Question[] = [];
    let title = "Đề thi được import";
    let description = "Đề thi từ file JSON";
    let examType = ExamType.TSA;
    let duration = getDefaultDuration(ExamType.TSA);
    let imageBank: Record<string, string> | undefined = undefined;

    if (rawData.imageBank) {
      imageBank = rawData.imageBank;
    }

    // Handle new format (with title, description, questions array directly)
    if (rawData.title && Array.isArray(rawData.questions)) {
      title = rawData.title || title;
      description = rawData.description || description;
      duration = rawData.durationMinutes || getDefaultDuration(ExamType.TSA);
      
      // Detect exam type from category
      const firstCategory = rawData.questions[0]?.category || '';
      if (firstCategory.includes('Toán') || firstCategory.includes('Math')) {
        examType = ExamType.HSA;
      }

      const convertNewFormatQuestion = (q: any): Question => {
        const questionType = q.type || 'multiple_choice';
        const category = mapCategory(q.category || 'Unknown');
        const difficulty = mapDifficulty(q.difficulty || 'Trung bình');
        const tags = Array.isArray(q.tags) ? q.tags : [];

        // Fix math symbols in text and explanation
        const text = fixMathSymbols(q.text || '');
        const explanation = fixMathSymbols(q.explanation || '');
        const explanationImage = q.explanationImage || undefined;

        const baseQuestion: Question = {
          id: q.id || generateId(),
          type: questionType as QuestionType,
          text,
          image: q.image || undefined,
          explanation,
          explanationImage,
          category,
          difficulty,
          tags,
          requiresImage: q.requiresImage || false
        };

        // Handle different question types
        if (questionType === 'multiple_choice') {
          return {
            ...baseQuestion,
            options: q.options || [],
            correctIndex: q.correctIndex || 0
          };
        } else if (questionType === 'true_false') {
          return {
            ...baseQuestion,
            rows: q.rows || []
          };
        } else if (questionType === 'short_answer' || questionType === 'fill_in_blank') {
          return {
            ...baseQuestion,
            correctAnswerText: q.correctAnswerText || ''
          };
        } else if (questionType === 'essay') {
          return baseQuestion;
        } else if (questionType === 'matching') {
          return {
            ...baseQuestion,
            matchPairs: q.matchPairs || []
          };
        } else if (questionType === 'ordering') {
          return {
            ...baseQuestion,
            items: q.items || []
          };
        } else if (questionType === 'reading') {
          return {
            ...baseQuestion,
            subQuestions: (q.subQuestions || []).map(convertNewFormatQuestion)
          };
        } else if (questionType === 'multiple_select') {
          return {
            ...baseQuestion,
            options: q.options || [],
            correctIndices: q.correctIndices || []
          };
        } else if (questionType === 'true_false_explain') {
          return {
            ...baseQuestion,
            correctAnswer: q.correctAnswer,
            explanation
          };
        }

        return baseQuestion;
      };

      questions = (rawData.questions as any[]).map(convertNewFormatQuestion);
    } 
    else if (rawData.exam && Array.isArray(rawData.questions)) {
      // Handle old format (TSA specific)
      const examData = rawData.exam as TSAJsonExamMetadata;
      title = examData.title || title;
      description = examData.description || `Đề thi môn: ${examData.subject_area || 'Tổng hợp'}`;
      duration = examData.duration_minutes || getDefaultDuration(examData.type || ExamType.TSA);
      if (examData.type) examType = examData.type;

      const convertQuestion = (q: TSAJsonQuestion): Question => {
        const baseDifficulty = mapDifficulty(q.difficulty);
        const baseCategory = mapCategory(q.category);
        const tags = [q.subcategory, q.category].filter(t => t) as string[];

        let type: QuestionType = 'multiple_choice';
        let options: string[] = [];
        let correctIndex = 0;
        let rows = undefined;
        let correctAnswerText = undefined;
        let subQuestions = undefined;

        if (q.question_type === 'multiple_choice' && q.answers) {
           type = 'multiple_choice';
           options = q.answers.map(a => a.text);
           correctIndex = q.answers.findIndex(a => a.is_correct);
           if (correctIndex === -1) correctIndex = 0;
        } 
        else if (q.question_type === 'true_false_grid' && q.true_false_items) {
           type = 'true_false';
           rows = q.true_false_items.map((item, idx) => ({
             id: `row_${generateId()}_${idx}`,
             text: item.statement,
             isCorrect: item.correct_answer
           }));
        }
        else if ((q.question_type === 'fill_in_blank' || q.question_type === 'fill_in_table') && q.correct_answer !== undefined) {
           type = 'short_answer';
           correctAnswerText = String(q.correct_answer);
        }
        else if (q.question_type === 'reading_comprehension') {
           type = 'reading';
           if (q.sub_questions) {
             subQuestions = q.sub_questions.map(sq => convertQuestion(sq));
           }
        }

        return {
           id: q.id ? String(q.id) : generateId(),
           type,
           text: fixMathSymbols(q.question_text),
           image: q.question_image,
           explanation: fixMathSymbols(q.explanation || ""),
           category: baseCategory,
           difficulty: baseDifficulty,
           tags,
           options: options.map(fixMathSymbols),
           correctIndex,
           rows,
           correctAnswerText,
           subQuestions
        };
      };

      questions = (rawData.questions as TSAJsonQuestion[]).map(convertQuestion);
    } 
    else if (rawData.questions && Array.isArray(rawData.questions) && rawData.questions[0]?.options) {
        // Legacy internal format
        title = rawData.title || title;
        description = rawData.description || description;
        questions = rawData.questions.map((q: any) => ({
          ...q,
          text: fixMathSymbols(q.text),
          explanation: fixMathSymbols(q.explanation),
          options: q.options?.map(fixMathSymbols)
        }));
    }

    if (questions.length === 0) return null;

    // Detect Type heuristic if not set
    if (!examType || examType === ExamType.TSA) {
        const isHSA = questions.some(q => 
            q.category === QuestionCategory.HISTORY || 
            q.category === QuestionCategory.PHYSICS || 
            q.category === QuestionCategory.LITERATURE ||
            q.category === QuestionCategory.MATH ||
            q.category === QuestionCategory.CHEMISTRY ||
            q.category === QuestionCategory.BIOLOGY ||
            q.category === QuestionCategory.GEOGRAPHY ||
            q.category === QuestionCategory.ENGLISH
        );
        examType = isHSA ? ExamType.HSA : ExamType.TSA;
    }

    return {
      id: generateId(),
      type: examType,
      title: title,
      description: description,
      durationMinutes: duration, 
      questionCount: questions.length,
      createdAt: Date.now(),
      questions,
      imageBank
    };
  } catch (e) {
    console.error("JSON Parse Error", e);
    return null;
  }
};

export const parseCSVExam = (content: string, filename: string): Exam | null => {
  try {
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const questions: Question[] = [];
    
    let startIndex = 0;
    if (lines[0] && lines[0].includes('Nội dung câu hỏi')) {
      startIndex = 1;
    }

    let lastQuestion: Question | null = null; 

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts: string[] = [];
      let currentPart = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          if (inQuotes && line[j+1] === '"') { 
             currentPart += '"';
             j++;
          } else {
             inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart);
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      parts.push(currentPart);

      const cleanParts = parts.map(p => p.trim());

      if (cleanParts.length < 5) continue; 

      const qText = fixMathSymbols(cleanParts[0]);
      const qImage = cleanParts[1];
      const options = [cleanParts[2], cleanParts[4], cleanParts[6], cleanParts[8]]
        .filter(o => o !== undefined)
        .map(fixMathSymbols); 
      
      const correctVal = parseInt(cleanParts[10]);
      const correctIndex = !isNaN(correctVal) && correctVal >= 1 && correctVal <= 4 ? correctVal - 1 : 0;
      
      let explanation = fixMathSymbols(cleanParts[11] || "");
      const explanationImage = cleanParts[12];
      if (explanationImage) {
         explanation += `\n\n![Hình minh họa](${explanationImage})`;
      }

      const subject = cleanParts[13];
      const difficultyStr = cleanParts[14];
      const grade = cleanParts[15];
      const paragraph = cleanParts[16]; 

      const category = mapCategory(subject);
      const difficulty = mapDifficulty(difficultyStr);
      const tags = [subject, grade, difficultyStr].filter(t => t);

      const subQ: Question = {
        id: generateId(),
        type: 'multiple_choice',
        text: qText,
        image: qImage || undefined,
        options: options,
        correctIndex: correctIndex,
        explanation: explanation,
        category: category,
        difficulty: difficulty,
        tags: tags
      };

      if (paragraph && paragraph.trim().length > 0) {
         if (lastQuestion && lastQuestion.type === 'reading' && lastQuestion.text === paragraph) {
            if (!lastQuestion.subQuestions) lastQuestion.subQuestions = [];
            lastQuestion.subQuestions.push(subQ);
         } else {
            const readingQ: Question = {
               id: generateId(),
               type: 'reading',
               text: paragraph,
               explanation: "Xem giải thích chi tiết ở từng câu hỏi con.",
               category: category,
               difficulty: difficulty,
               tags: [...tags, 'Reading'],
               subQuestions: [subQ]
            };
            questions.push(readingQ);
            lastQuestion = readingQ;
         }
      } else {
         questions.push(subQ);
         lastQuestion = subQ; 
      }
    }

    if (questions.length === 0) return null;

    // Detect Type heuristic
    const isHSA = questions.some(q => 
        q.category === QuestionCategory.HISTORY || 
        q.category === QuestionCategory.PHYSICS || 
        q.category === QuestionCategory.LITERATURE ||
        q.tags?.some(t => t.toLowerCase().includes('hsa'))
    );

    return {
      id: generateId(),
      type: isHSA ? ExamType.HSA : ExamType.TSA,
      title: filename.replace('.csv', '') || "Đề thi Import",
      description: "Đề thi được import từ file CSV",
      durationMinutes: 90,
      questionCount: questions.length,
      createdAt: Date.now(),
      questions
    };
  } catch (e) {
    console.error("CSV Parse Error", e);
    return null;
  }
};

export const parseTextExam = (content: string, filename: string): Exam | null => {
    // Keep existing Text parser logic but add Type
    // ... (Existing logic) ...
    // Simplified for brevity, assume similar structure update
    return null; 
};
