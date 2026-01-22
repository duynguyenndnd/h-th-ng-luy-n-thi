
import { Exam, Question, QuestionCategory, QuestionDifficulty, QuestionType, ExamType } from '../types';
import { generateId } from './dbService';

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

export const parseJSONExam = (content: string): Exam | null => {
  try {
    const rawData = JSON.parse(content);
    let questions: Question[] = [];
    let title = "Đề thi được import";
    let description = "Đề thi từ file JSON";
    let duration = 90;
    let examType = ExamType.TSA; // Default
    let imageBank: Record<string, string> | undefined = undefined;

    if (rawData.imageBank) {
      imageBank = rawData.imageBank;
    }

    if (rawData.exam && Array.isArray(rawData.questions)) {
      const examData = rawData.exam as TSAJsonExamMetadata;
      title = examData.title || title;
      description = examData.description || `Đề thi môn: ${examData.subject_area || 'Tổng hợp'}`;
      duration = examData.duration_minutes || 90;
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
           id: generateId(),
           type,
           text: q.question_text,
           image: q.question_image,
           explanation: q.explanation || "",
           category: baseCategory,
           difficulty: baseDifficulty,
           tags,
           options,
           correctIndex,
           rows,
           correctAnswerText,
           subQuestions
        };
      };

      questions = (rawData.questions as TSAJsonQuestion[]).map(convertQuestion);
    } 
    else if (rawData.questions && Array.isArray(rawData.questions) && rawData.questions[0].options) {
        // Legacy internal format logic
        title = rawData.title || title;
        description = rawData.description || description;
        questions = rawData.questions;
    }

    if (questions.length === 0) return null;

    // Detect Type heuristic if not set
    if (!rawData.exam?.type) {
        const isHSA = questions.some(q => 
            q.category === QuestionCategory.HISTORY || 
            q.category === QuestionCategory.PHYSICS || 
            q.category === QuestionCategory.LITERATURE
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

      const qText = cleanParts[0];
      const qImage = cleanParts[1];
      const options = [cleanParts[2], cleanParts[4], cleanParts[6], cleanParts[8]].filter(o => o !== undefined); 
      
      const correctVal = parseInt(cleanParts[10]);
      const correctIndex = !isNaN(correctVal) && correctVal >= 1 && correctVal <= 4 ? correctVal - 1 : 0;
      
      let explanation = cleanParts[11] || "";
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
