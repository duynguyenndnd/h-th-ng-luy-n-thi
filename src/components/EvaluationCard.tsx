import React from 'react';

interface EvaluationCardProps {
  score: number;
  totalScore: number;
  percentage: number;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ score, totalScore, percentage }) => {
  // Xác định mức độ và feedback
  const getEvaluation = (percent: number) => {
    if (percent >= 90) {
      return {
        level: '🌟 PEAK PERFORMANCE 🌟',
        character: '😎',
        feedback: [
          'Đỉnh quá! No cap, bạn là goat 🐐',
          'Mạnh mẽ vl, bảo đảm W ✨',
          'Kỹ năng đã max level rồi! 💯',
          'Bro/Sis tuyệt vời quá, based!',
          'Bạn deserve 1 tỷ follow 🎉'
        ],
        color: 'from-yellow-400 to-orange-500'
      };
    } else if (percent >= 80) {
      return {
        level: '💪 EXCELLENT 💪',
        character: '🤩',
        feedback: [
          'Quá tuyệt vời! Keep it up! 🔥',
          'Ổn định vl bro, very slay 💅',
          'Bạn đã làm rất tốt! Proud of you 👑',
          'Chất lượng cao, deserves an A+ ⭐',
          'Bạn là main character energy 🌈'
        ],
        color: 'from-green-400 to-emerald-500'
      };
    } else if (percent >= 70) {
      return {
        level: '👍 GOOD JOB 👍',
        character: '😊',
        feedback: [
          'Ổn lắm! Tiếp tục cố gắng nhé 💪',
          'Tốt rồi, nhưng vẫn còn chỗ để cải thiện',
          'Bạn đang trên đúng con đường! 🚀',
          'Cách đây không xa là lập kỷ lục đâu! 🎯',
          'Bạn làm tốt lắm rồi, chúc mừng! 🎊'
        ],
        color: 'from-blue-400 to-cyan-500'
      };
    } else if (percent >= 50) {
      return {
        level: '📚 KEEP LEARNING 📚',
        character: '🤔',
        feedback: [
          'Không tệ, nhưng cần cố gắng thêm chút nữa',
          'Giữ tinh thần, bạn sẽ làm tốt hơn lần sau! 💪',
          'Còn nhiều kiến thức để khám phá, fam 🌍',
          'Bạn đã hiểu được nửa đường rồi! Tiếp tục nào 🎯',
          'Mỗi bước nhỏ đều là tiến bộ, vậy thôi! ✨'
        ],
        color: 'from-purple-400 to-pink-500'
      };
    } else {
      return {
        level: '🎓 NEED MORE PRACTICE 🎓',
        character: '😅',
        feedback: [
          'Đừng nản, bạn sẽ làm tốt hơn mà! 🌟',
          'Lỗi là bạn học được, keep grinding! 💯',
          'Bạn mới bắt đầu, có gì là sợ? 🚀',
          'Mọi master đều từ beginner, fam! 🎮',
          'Tiếp tục học tập, thành công sẽ đến! 🏆'
        ],
        color: 'from-red-400 to-orange-500'
      };
    }
  };

  const eval_data = getEvaluation(percentage);
  const randomFeedback = eval_data.feedback[Math.floor(Math.random() * eval_data.feedback.length)];

  return (
    <div className="w-full mt-8 mb-6">
      <div className={`bg-gradient-to-r ${eval_data.color} rounded-3xl p-8 shadow-2xl text-white transform transition-all hover:scale-105`}>
        <div className="flex items-start gap-6">
          {/* Character 2D */}
          <div className="text-9xl animate-bounce flex-shrink-0">
            {eval_data.character}
          </div>

          {/* Evaluation Content */}
          <div className="flex-grow">
            {/* Level */}
            <h2 className="text-3xl font-black mb-4 text-white drop-shadow-lg">
              {eval_data.level}
            </h2>

            {/* Score */}
            <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/30">
              <p className="text-5xl font-black mb-2">{score}/{totalScore}</p>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-white/90 text-xl font-bold mt-2">{percentage}% hoàn thành</p>
            </div>

            {/* Feedback */}
            <p className="text-lg font-semibold text-white drop-shadow-md italic">
              "{randomFeedback}"
            </p>

            {/* Motivational Quote */}
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 border-l-4 border-white/50">
              <p className="text-sm font-medium text-white/90">
                💡 Mẹo: Luyện tập thêm các câu hỏi khó để nâng cao kỹ năng của bạn!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
