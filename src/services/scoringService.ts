import { Question } from '../types';

/**
 * Calculate score for a question based on its type and the user's answer
 * Returns a value between 0 and 1 (representing percentage of points earned)
 */
export function calculateQuestionScore(
  question: Question,
  userAnswer: any,
  fullyCorrect: boolean = true
): number {
  if (!question.type) question.type = 'multiple_choice';

  switch (question.type) {
    case 'multiple_choice':
      return userAnswer === question.correctIndex ? 1 : 0;

    case 'true_false':
      // userAnswer is Record<string, boolean>
      if (!question.rows) return 0;
      const correctAnswers = question.rows.filter(r => r.isCorrect).length;
      let correctCount = 0;
      question.rows.forEach(row => {
        if (userAnswer[row.id] === row.isCorrect) {
          correctCount++;
        }
      });
      return correctAnswers > 0 ? correctCount / question.rows.length : 0;

    case 'true_false_explain': {
      // userAnswer is { answer: boolean, explanation?: string }
      if (userAnswer.answer === question.correctAnswer) {
        if (question.requiresExplanation && !userAnswer.explanation?.trim()) {
          return 0.5; // Partial credit without explanation
        }
        return 1;
      }
      return 0;
    }

    case 'short_answer': {
      // userAnswer is string
      const normalize = (str: string) =>
        str.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Check against correctAnswerText
      if (
        question.correctAnswerText &&
        normalize(userAnswer) === normalize(question.correctAnswerText)
      ) {
        return 1;
      }

      // Check against acceptableAnswers
      if (question.acceptableAnswers) {
        for (const acceptable of question.acceptableAnswers) {
          if (normalize(userAnswer) === normalize(acceptable)) {
            return 1;
          }
        }
      }

      return 0;
    }

    case 'essay':
      // Essays typically need manual grading
      // Return 0.5 if submitted (placeholder for teacher review)
      return userAnswer?.trim() ? 0.5 : 0;

    case 'fill_in_blank': {
      // userAnswer is Record<number, string>
      if (!question.blanks || question.blanks.length === 0) return 0;

      let correctCount = 0;
      question.blanks.forEach(blank => {
        const userAnswer_ = userAnswer[blank.position] || '';
        const normalized = question.caseSensitive
          ? userAnswer_
          : userAnswer_.trim().toLowerCase();

        for (const correctAnswer of blank.correctAnswers) {
          const normalizedCorrect = question.caseSensitive
            ? correctAnswer
            : correctAnswer.trim().toLowerCase();

          if (normalized === normalizedCorrect) {
            correctCount++;
            break;
          }
        }
      });

      return question.blanks.length > 0
        ? correctCount / question.blanks.length
        : 0;
    }

    case 'matching': {
      // userAnswer is Record<string, string> (pairId -> rightValue)
      if (!question.matchingPairs || question.matchingPairs.length === 0) return 0;

      let correctCount = 0;
      question.matchingPairs.forEach(pair => {
        const userAnswerForPair = userAnswer[pair.id];
        if (userAnswerForPair === pair.right) {
          correctCount++;
        }
      });

      return question.matchingPairs.length > 0
        ? correctCount / question.matchingPairs.length
        : 0;
    }

    case 'multiple_select': {
      // userAnswer is number[] (array of selected indices)
      if (!question.options || !question.correctAnswers) return 0;

      const correctSet = new Set(question.correctAnswers);
      const userSet = new Set(userAnswer);

      if (question.partialCredit) {
        // Partial credit: points for each correct answer
        let correctCount = 0;
        userSet.forEach(idx => {
          if (correctSet.has(idx)) {
            correctCount++;
          }
        });

        // Subtract points for incorrect selections
        const incorrectCount = userSet.size - correctCount;
        const score =
          (correctCount - incorrectCount) / question.correctAnswers.length;
        return Math.max(0, score);
      } else {
        // All or nothing: must match exactly
        if (userSet.size !== correctSet.size) return 0;
        for (const idx of userSet) {
          if (!correctSet.has(idx)) return 0;
        }
        return 1;
      }
    }

    case 'ordering': {
      // userAnswer is string[] (ordered items)
      if (!question.correctOrder || question.correctOrder.length === 0) return 0;

      const correct = question.correctOrder;
      const user = userAnswer;

      if (user.length !== correct.length) return 0;

      let correctCount = 0;
      for (let i = 0; i < correct.length; i++) {
        if (user[i] === correct[i]) {
          correctCount++;
        }
      }

      return correct.length > 0 ? correctCount / correct.length : 0;
    }

    case 'reading':
      // Reading comprehension is handled via subQuestions
      return 0;

    default:
      return 0;
  }
}

/**
 * Get a human-readable label for the question type
 */
export function getQuestionTypeLabel(type?: string): string {
  switch (type) {
    case 'multiple_choice':
      return 'Trắc nghiệm';
    case 'true_false':
      return 'Đúng/Sai';
    case 'true_false_explain':
      return 'Đúng/Sai + Giải thích';
    case 'short_answer':
      return 'Điền đáp án';
    case 'essay':
      return 'Tự luận';
    case 'fill_in_blank':
      return 'Điền chỗ trống';
    case 'matching':
      return 'Ghép đôi';
    case 'multiple_select':
      return 'Chọn nhiều';
    case 'ordering':
      return 'Sắp xếp';
    case 'reading':
      return 'Đọc hiểu';
    default:
      return 'Không xác định';
  }
}
