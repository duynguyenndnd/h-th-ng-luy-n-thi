import React from 'react';
import { Exam, ExamType } from '../types';
import { Button } from './Button';

interface AnswerKeyProps {
  exam: Exam;
  onBack: () => void;
}

export const AnswerKeyView: React.FC<AnswerKeyProps> = ({ exam, onBack }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg">
            📜
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">{exam.title}</h1>
            <p className="text-slate-500 font-bold">Đáp án chi tiết • {exam.questions.length} câu hỏi</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={onBack}
          size="lg"
          className="font-bold border-2"
        >
          ⬅️ Quay Lại
        </Button>
      </div>

      {/* Answer Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest w-24 text-center">Câu</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Loại Câu Hỏi</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Đáp Án Đúng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {exam.questions.map((q, index) => (
                <tr key={q.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5 text-lg font-black text-slate-400 group-hover:text-indigo-600 text-center transition-colors">
                    {index + 1}
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-black uppercase group-hover:bg-white group-hover:shadow-sm transition-all">
                      {q.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {Array.isArray(q.correctAnswer) ? (
                      <div className="flex flex-wrap gap-2">
                        {q.correctAnswer.map((ans, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-sm font-bold border border-green-200">
                            {ans}
                          </span>
                        ))}
                      </div>
                    ) : typeof q.correctAnswer === 'object' ? (
                        <div className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                             {JSON.stringify(q.correctAnswer)}
                        </div>
                    ) : (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-black shadow-sm">
                        {String(q.correctAnswer)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg transform hover:scale-[1.01] transition-transform">
        <p className="font-bold flex items-center justify-center gap-2">
          💡 Mẹo: Bạn có thể sử dụng bảng này để đối chiếu nhanh kết quả sau khi làm bài xong.
        </p>
      </div>
    </div>
  );
};
