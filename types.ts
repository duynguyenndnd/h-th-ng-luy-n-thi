
export enum ExamType {
  TSA = 'TSA', // Tư duy (Thinking Skills Assessment)
  HSA = 'HSA'  // Đánh giá năng lực (High School Assessment)
}

export enum QuestionCategory {
  // TSA Categories
  PROBLEM_SOLVING = 'Tư duy Định lượng & Giải quyết vấn đề',
  CRITICAL_THINKING = 'Tư duy Phản biện & Logic',
  
  // HSA Categories (VNU Format)
  MATH = 'Toán học (Định lượng)',
  LITERATURE = 'Ngữ văn (Định tính)',
  PHYSICS = 'Vật lý',
  CHEMISTRY = 'Hóa học',
  BIOLOGY = 'Sinh học',
  HISTORY = 'Lịch sử',
  GEOGRAPHY = 'Địa lý',
  ENGLISH = 'Tiếng Anh',
  
  UNKNOWN = 'Chung'
}

export enum QuestionDifficulty {
  EASY = 'Dễ',
  MEDIUM = 'Trung bình',
  HARD = 'Khó'
}

export type UserRole = 'admin' | 'user';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'reading';

export interface TrueFalseRow {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface User {
  username: string; // ID duy nhất
  password?: string; // Mật khẩu
  fullName: string;
  role: UserRole;
  allowedExamTypes?: ExamType[]; // Mảng chứa các loại đề thi được phép truy cập
  registeredAt: number;
}

export interface Question {
  id: string;
  type?: QuestionType; // Mặc định là multiple_choice nếu undefined
  text: string;
  image?: string; // URL, base64, hoặc reference key (VD: "bank:img_01")
  requiresImage?: boolean; // Nếu true, bắt buộc phải có ảnh
  explanation: string;
  category: QuestionCategory;
  difficulty?: QuestionDifficulty;
  tags?: string[];

  // --- Multiple Choice Specific ---
  options?: string[];
  correctIndex?: number; // 0-4

  // --- True/False Specific ---
  rows?: TrueFalseRow[];

  // --- Short Answer Specific ---
  correctAnswerText?: string;

  // --- Reading Comprehension Specific ---
  // Bài đọc sẽ nằm ở trường `text`, các câu hỏi con nằm ở đây
  subQuestions?: Question[]; 
}

export interface ExamMetadata {
  id: string;
  type: ExamType; // TSA or HSA
  title: string;
  description: string;
  questionCount: number;
  durationMinutes: number;
  createdAt: number;
}

export interface Exam extends ExamMetadata {
  questions: Question[];
  imageBank?: Record<string, string>; // Key: ID ảnh, Value: Base64 string
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  examType?: ExamType;
  startTime: number;
  endTime: number;
  // answers stores the user's input based on question type
  answers: Record<string, any>; 
  score: number;
}

export interface DragDropFile {
  name: string;
  content: string;
  type: 'json' | 'csv';
}