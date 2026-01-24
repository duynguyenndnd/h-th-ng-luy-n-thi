import { Exam, QuestionCategory, QuestionDifficulty, ExamType } from '../types';

export const SAMPLE_NEW_QUESTION_TYPES: Exam = {
  id: 'new-question-types-demo',
  type: ExamType.HSA,
  title: 'Bài thi mẫu: Tất cả loại câu hỏi mới',
  description: 'Đây là bài thi mẫu để kiểm tra tất cả 6 loại câu hỏi mới: Tự luận, Điền chỗ trống, Đúng/Sai + Giải thích, Ghép đôi, Chọn nhiều, và Sắp xếp.',
  questionCount: 6,
  durationMinutes: 30,
  createdAt: Date.now(),
  questions: [
    // 1. Essay Question
    {
      id: 'q-essay-1',
      type: 'essay',
      text: 'Hãy viết một đoạn văn (100-150 từ) về tầm quan trọng của giáo dục trong xã hội hiện đại. Nêu rõ 2 lý do cụ thể.',
      explanation: 'Đây là câu hỏi tự luận yêu cầu bạn viết bài dựa trên yêu cầu cho trước. Bài viết sẽ được giáo viên chấm dựa trên các tiêu chí đã nêu.',
      category: QuestionCategory.LITERATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      essayRequirements: 'Viết 100-150 từ. Nêu 2 lý do cụ thể. Sử dụng từ ngữ chính xác, logic rõ ràng.',
      sampleAnswer: 'Giáo dục là nền tảng quan trọng xây dựng xã hội tiến bộ. Thứ nhất, giáo dục cung cấp kiến thức và kỹ năng cần thiết giúp con người phát triển toàn diện và thích ứng với thay đổi của thế giới. Thứ hai, giáo dục giáo dục giúp phát triển tư duy phản biện và ý thức dân chủ, tạo nên những công dân tòsm có trách nhiệm. Vì vậy, đầu tư vào giáo dục là đầu tư cho tương lai quốc gia.',
      rubricCriteria: ['Nội dung (40 điểm)', 'Cấu trúc bài (30 điểm)', 'Ngôn ngữ (30 điểm)'],
      pointsPerCriteria: [40, 30, 30]
    },

    // 2. Fill in the Blank Question
    {
      id: 'q-blank-1',
      type: 'fill_in_blank',
      text: 'Cụm từ nổi tiếng "Tôi nghĩ, vậy tôi [____]" được nêu lên bởi triết học gia [____] vào thế kỷ XVII. Tác phẩm kinh điển này đã [____] hình thành nên dòng tư tưởng [____] hiện đại.',
      explanation: 'Đây là câu điền chỗ trống yêu cầu bạn điền các từ khớp để hoàn thành câu. Các từ điền có thể có nhiều đáp án chính xác.',
      category: QuestionCategory.LITERATURE,
      difficulty: QuestionDifficulty.MEDIUM,
      blanks: [
        {
          position: 41, // "tôi [____]"
          correctAnswers: ['tồn tại', 'là']
        },
        {
          position: 89, // "bởi triết học gia [____]"
          correctAnswers: ['Descartes', 'René Descartes']
        },
        {
          position: 168, // "đã [____] hình thành"
          correctAnswers: ['giúp', 'có vai trò', 'tạo nên']
        },
        {
          position: 197, // "[____] hiện đại"
          correctAnswers: ['Phương Tây', 'triết học', 'tư tưởng']
        }
      ],
      caseSensitive: false,
      blankPlaceholder: '[____]'
    },

    // 3. True/False with Explanation
    {
      id: 'q-tfe-1',
      type: 'true_false_explain',
      text: 'Năm 1492, Christopher Columbus khám phá châu Mỹ.',
      explanation: 'Columbus thực sự tới châu Mỹ năm 1492, nhưng ông không phải người đầu tiên khám phá nó. Các dân tộc bản địa đã sống ở đó hàng nghìn năm, và các nhà thám hiểm Bắc Âu (Vikings) đã tới được đó trước Columbus. Tuy nhiên, chuyến đi của Columbus đánh dấu sự khái mở cho sự tương tác quy mô lớn giữa châu Âu và châu Mỹ.',
      category: QuestionCategory.HISTORY,
      difficulty: QuestionDifficulty.EASY,
      correctAnswer: true, // Columbus DID sail to Americas in 1492
      requiresExplanation: true,
      trueText: 'Đúng',
      falseText: 'Sai'
    },

    // 4. Matching Question
    {
      id: 'q-match-1',
      type: 'matching',
      text: 'Ghép nối các nhà khoa học với lĩnh vực chính của họ:',
      explanation: 'Bài tập ghép đôi yêu cầu bạn nối mỗi nhà khoa học với lĩnh vực nghiên cứu của họ.',
      category: QuestionCategory.UNKNOWN,
      difficulty: QuestionDifficulty.MEDIUM,
      leftLabel: 'Nhà khoa học',
      rightLabel: 'Lĩnh vực nghiên cứu',
      matchingPairs: [
        {
          id: 'pair1',
          left: 'Albert Einstein',
          right: 'Vật lý'
        },
        {
          id: 'pair2',
          left: 'Marie Curie',
          right: 'Phóng xạ'
        },
        {
          id: 'pair3',
          left: 'Charles Darwin',
          right: 'Tiến hóa sinh học'
        },
        {
          id: 'pair4',
          left: 'Stephen Hawking',
          right: 'Vũ trụ học'
        }
      ]
    },

    // 5. Multiple Select Question
    {
      id: 'q-ms-1',
      type: 'multiple_select',
      text: 'Nước nào dưới đây từng là thuộc địa của Pháp? (Chọn TẤT CẢ các đáp án đúng)',
      explanation: 'Câu hỏi này yêu cầu bạn chọn tất cả các quốc gia đã từng là thuộc địa của Pháp. Nó khác với câu trắc nghiệm thông thường vì có thể có nhiều đáp án đúng.',
      category: QuestionCategory.HISTORY,
      difficulty: QuestionDifficulty.HARD,
      options: [
        'Việt Nam',
        'Hy Lạp',
        'Algérie',
        'Marocco (phần protectorat)',
        'Thụy Điển',
        'Canada (phần Quebec)',
        'Senegal',
        'Bỉ'
      ],
      correctAnswers: [0, 2, 3, 5, 6], // Vietnam, Algeria, Morocco, Canada, Senegal
      partialCredit: false
    },

    // 6. Ordering Question
    {
      id: 'q-order-1',
      type: 'ordering',
      text: 'Sắp xếp các sự kiện lịch sử sau theo thứ tự thời gian (từ sớm nhất đến muộn nhất):',
      explanation: 'Bài tập sắp xếp yêu cầu bạn sắp xếp các sự kiện theo thứ tự thời gian chính xác. Bạn có thể kéo thả hoặc dùng các nút để di chuyển.',
      category: QuestionCategory.HISTORY,
      difficulty: QuestionDifficulty.MEDIUM,
      items: [
        'Cách mạng Công nghiệp (1760)',
        'Cuộc Cách mạng Pháp (1789)',
        'Chiến tranh Thế giới thứ I (1914-1918)',
        'Cuộc Cách mạng Tháng Mười (1917)',
        'Chiến tranh Thế giới thứ II (1939-1945)'
      ],
      correctOrder: [
        'Cách mạng Công nghiệp (1760)',
        'Cuộc Cách mạng Pháp (1789)',
        'Cuộc Cách mạng Tháng Mười (1917)',
        'Chiến tranh Thế giới thứ I (1914-1918)',
        'Chiến tranh Thế giới thứ II (1939-1945)'
      ],
      orderingType: 'sequence'
    }
  ]
};
