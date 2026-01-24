import { ExamType } from '../types';

/**
 * Thời gian thi mặc định cho mỗi loại đề thi
 * TSA (Tư duy): 150 phút
 * HSA (Đánh giá năng lực): 150 phút
 */
export const EXAM_DURATIONS: Record<ExamType, number> = {
  [ExamType.TSA]: 150,  // 150 phút
  [ExamType.HSA]: 150,  // 150 phút
};

/**
 * Hàm lấy thời gian thi mặc định cho loại đề thi
 */
export const getDefaultDuration = (examType: ExamType): number => {
  return EXAM_DURATIONS[examType] || 150;
};
