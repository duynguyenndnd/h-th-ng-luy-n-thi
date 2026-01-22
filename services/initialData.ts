
import { Exam, QuestionCategory, QuestionDifficulty } from '../types';

export const INITIAL_EXAM: Exam = {
  id: 'tsa-demo-01',
  title: 'TSA Demo: Tư duy Phản biện & Giải quyết Vấn đề',
  description: 'Đề thi mẫu giúp bạn làm quen với cấu trúc bài thi TSA. Bao gồm các câu hỏi về logic, toán học và tư duy không gian.',
  questionCount: 5,
  durationMinutes: 45,
  createdAt: Date.now(),
  questions: [
    {
      id: 'q1',
      text: 'Một người bán hàng giảm giá 20% cho tất cả các mặt hàng. Sau đó, anh ta giảm thêm 10% trên giá đã giảm cho các thành viên thân thiết. Hỏi tổng phần trăm giảm giá cho thành viên thân thiết so với giá gốc là bao nhiêu?',
      options: ['30%', '28%', '25%', '18%', '32%'],
      correctIndex: 1,
      explanation: 'Giả sử giá gốc là 100.\nGiảm 20% lần đầu: 100 - 20 = 80.\nGiảm thêm 10% trên giá 80: 80 * 10% = 8.\nGiá cuối cùng: 80 - 8 = 72.\nTổng giảm: 100 - 72 = 28.\nVậy tổng phần trăm giảm là 28%.',
      category: QuestionCategory.PROBLEM_SOLVING,
      difficulty: QuestionDifficulty.MEDIUM,
      tags: ['math', 'percentage', 'logic']
    },
    {
      id: 'q2',
      text: 'Nếu "Tất cả hoa hồng đều là hoa" là ĐÚNG và "Một số hoa là màu đỏ" là ĐÚNG. Thì mệnh đề nào sau đây CHẮC CHẮN ĐÚNG?',
      options: [
        'Tất cả hoa hồng đều màu đỏ',
        'Một số hoa hồng màu đỏ',
        'Tất cả hoa màu đỏ là hoa hồng',
        'Không có hoa hồng nào màu đỏ',
        'Không kết luận được về màu sắc của hoa hồng'
      ],
      correctIndex: 4,
      explanation: '1. Tất cả hoa hồng -> Hoa\n2. Một số Hoa -> Đỏ.\n\nTập hợp "Hoa hồng" nằm trong tập "Hoa". Tập "Màu đỏ" giao với tập "Hoa".\nTuy nhiên, ta không biết phần giao giữa "Màu đỏ" và "Hoa" có chạm vào phần "Hoa hồng" hay không.\nVí dụ: Hoa hồng có thể chỉ màu trắng, còn hoa tu-lip mới màu đỏ.\nDo đó, không thể kết luận chắc chắn hoa hồng có màu đỏ hay không.',
      category: QuestionCategory.CRITICAL_THINKING,
      difficulty: QuestionDifficulty.HARD,
      tags: ['syllogism', 'logic']
    },
    {
      id: 'q3',
      text: 'Chọn hình khác biệt nhất trong các hình còn lại (tưởng tượng): \nA. Hình vuông\nB. Hình chữ nhật\nC. Hình thang cân\nD. Hình bình hành\nE. Hình tròn',
      options: ['Hình vuông', 'Hình chữ nhật', 'Hình thang cân', 'Hình bình hành', 'Hình tròn'],
      correctIndex: 4,
      explanation: 'Các hình A, B, C, D đều là đa giác (được tạo bởi các đoạn thẳng). Hình E (Hình tròn) được tạo bởi đường cong. Do đó E là hình khác biệt nhất về mặt cấu trúc hình học.',
      category: QuestionCategory.PROBLEM_SOLVING,
      difficulty: QuestionDifficulty.EASY,
      tags: ['geometry', 'spatial']
    },
    {
      id: 'q4',
      text: 'Ba người A, B, C nói chuyện. A nói: "B nói dối". B nói: "C nói dối". C nói: "A và B đều nói dối". Hỏi ai là người nói thật?',
      options: ['A', 'B', 'C', 'Không ai cả', 'Cả A và C'],
      correctIndex: 1,
      explanation: 'Thử từng trường hợp:\n1. Giả sử A nói thật => B nói dối.\nNếu B nói dối => "C nói dối" là sai => C nói thật.\nNếu C nói thật => "A và B nói dối" là đúng => A nói dối (Mâu thuẫn với giả thiết đầu).\n=> A nói dối.\n\n2. Vì A nói dối => "B nói dối" là sai => B nói thật.\nNếu B nói thật => "C nói dối" là đúng => C nói dối.\nKiểm tra lời C: "A và B đều nói dối". Vì B nói thật nên lời C là sai (thỏa mãn C nói dối).\n\nKết luận: B là người nói thật.',
      category: QuestionCategory.CRITICAL_THINKING,
      difficulty: QuestionDifficulty.HARD,
      tags: ['logic', 'liar-paradox']
    },
    {
      id: 'q5',
      text: 'Điền số tiếp theo vào dãy số: 2, 6, 12, 20, 30, ...',
      options: ['36', '38', '40', '42', '44'],
      correctIndex: 3,
      explanation: 'Quy luật:\n2 = 1 x 2\n6 = 2 x 3\n12 = 3 x 4\n20 = 4 x 5\n30 = 5 x 6\n\nSố tiếp theo sẽ là 6 x 7 = 42.\n\nCách khác: Khoảng cách giữa các số tăng dần chẵn: 4, 6, 8, 10... => 30 + 12 = 42.',
      category: QuestionCategory.PROBLEM_SOLVING,
      difficulty: QuestionDifficulty.EASY,
      tags: ['math', 'sequence']
    }
  ]
};
