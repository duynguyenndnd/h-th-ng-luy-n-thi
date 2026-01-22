import React, { useState } from 'react';
import { Exam, ExamAttempt, Question } from '../types';
import { Button } from './Button';
import { streamAIExplanation } from '../services/geminiService';
import { MathText } from './MathText';

interface ExamResultProps {
  attempt: ExamAttempt;
  exam: Exam;
  onHome: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({ attempt, exam, onHome }) => {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Stats calculation
  const total = exam.questions.length;
  const correctCount = attempt.score;
  const percentage = Math.round((correctCount / total) * 100);
  const incorrect = total - correctCount;
  
  // Circle Progress Config
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color based on score
  let scoreColor = "text-red-500";
  let scoreStroke = "stroke-red-500";
  let gradeText = "Cần cố gắng";
  if (percentage >= 80) { scoreColor = "text-green-500"; scoreStroke = "stroke-green-500"; gradeText = "Xuất sắc"; }
  else if (percentage >= 50) { scoreColor = "text-blue-500"; scoreStroke = "stroke-blue-500"; gradeText = "Đạt"; }

  const handleAIExplain = async (q: Question) => {
    setLoadingAI(true);
    setAiExplanation("");
    await streamAIExplanation(q, (text) => {
      setLoadingAI(false);
      setAiExplanation(text);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Kết quả bài thi</h2>
              <p className="text-slate-500 text-sm">{attempt.examTitle} • {new Date(attempt.endTime).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold bg-white border shadow-sm ${scoreColor} border-current opacity-80`}>
              {gradeText}
            </div>
        </div>
        
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-around gap-10">
          {/* Circular Chart */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle 
                cx="60" cy="60" r="50" fill="none" 
                className={`${scoreStroke} transition-all duration-1000 ease-out`}
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
               <span className={`text-5xl font-black ${scoreColor}`}>{percentage}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">{correctCount}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-green-800 opacity-70">Câu đúng</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-5 text-center border border-red-100">
              <div className="text-3xl font-bold text-red-600 mb-1">{incorrect}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-red-800 opacity-70">Câu sai</div>
            </div>
             <div className="bg-blue-50 rounded-2xl p-5 text-center border border-blue-100 col-span-2">
              <div className="text-3xl font-bold text-blue-600 mb-1">{total}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-800 opacity-70">Tổng số câu hỏi</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-center gap-4 border-t border-slate-100">
           <Button onClick={onHome} variant="primary" className="shadow-lg shadow-blue-200">Quay về trang chủ</Button>
           <Button onClick={() => window.print()} variant="secondary" className="bg-white">In kết quả</Button>
        </div>
      </div>

      {/* Detailed Review List */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Chi tiết đáp án
        </h3>
        <div className="space-y-6">
        {exam.questions.map((q, idx) => {
          const userAnsIdx = attempt.answers[q.id];
          const isCorrect = userAnsIdx === q.correctIndex;
          const isSkipped = userAnsIdx === undefined;
          
          return (
            <div key={q.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${isCorrect ? 'border-slate-200' : 'border-red-200'}`}>
              <div className={`px-6 py-3 border-b flex justify-between items-center ${isCorrect ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                 <div className="flex items-center gap-3 flex-wrap">
                   <span className="font-bold text-slate-500 text-sm">Câu {idx + 1}</span>
                   <span className="w-px h-4 bg-slate-300"></span>
                   <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">{q.category}</span>
                   {q.tags && q.tags.map(tag => (
                     <span key={tag} className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-500 border border-slate-200">
                       #{tag}
                     </span>
                   ))}
                 </div>
                 {isCorrect ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200 whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ĐÚNG
                    </span>
                 ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full border border-red-200 whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      {isSkipped ? 'BỎ QUA' : 'SAI'}
                    </span>
                 )}
              </div>
              
              <div className="p-6 md:p-8">
                  <p className="text-lg text-slate-800 font-medium mb-6 leading-relaxed">
                    <MathText text={q.text} />
                  </p>
                  
                  {q.image && (
                     <img src={q.image} alt="Q" className="max-h-60 mb-6 rounded-lg border border-slate-200 mx-auto"/>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {q.options.map((opt, oIdx) => {
                      let styles = "border-slate-200 text-slate-600 bg-white hover:bg-slate-50";
                      let icon = <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold mr-3 text-slate-500">{String.fromCharCode(65 + oIdx)}</span>;
                      
                      if (oIdx === q.correctIndex) {
                        styles = "border-green-500 bg-green-50/50 text-green-900 ring-1 ring-green-500";
                        icon = <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mr-3 shadow-sm">✓</span>;
                      } else if (oIdx === userAnsIdx && !isCorrect) {
                        styles = "border-red-500 bg-red-50/50 text-red-900 ring-1 ring-red-500";
                        icon = <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-3 shadow-sm">✕</span>;
                      }

                      return (
                        <div key={oIdx} className={`px-4 py-3 border rounded-xl flex items-center transition-colors ${styles}`}>
                          {icon}
                          <span className="text-sm font-medium">
                            <MathText text={opt} />
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                    <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Giải thích
                    </p>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      <MathText text={q.explanation || "Không có giải thích chi tiết cho câu hỏi này."} />
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                       <button 
                         onClick={() => { setActiveQuestion(q); handleAIExplain(q); }}
                         className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium shadow-md shadow-purple-200 transition-all hover:scale-105"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                         Hỏi gia sư AI chi tiết
                       </button>
                    </div>
                  </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* AI Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col transform scale-100 transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div>
                   <div className="text-base">AI Tutor</div>
                   <div className="text-xs text-slate-500 font-normal">Phân tích chuyên sâu từ Gemini AI</div>
                </div>
              </h3>
              <button type="button" aria-label="Close dialog" onClick={() => setActiveQuestion(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 italic border border-slate-200 relative">
                <span className="absolute top-2 left-2 text-3xl text-slate-300 font-serif leading-none">“</span>
                <p className="px-4 relative z-10">
                  <MathText text={activeQuestion.text} />
                </p>
              </div>
              
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                   <div className="relative w-16 h-16 mb-4">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <p className="font-medium animate-pulse">Đang suy nghĩ...</p>
                </div>
              ) : (
                <div className="prose prose-slate prose-p:leading-relaxed prose-headings:text-slate-800 prose-strong:text-purple-700 max-w-none">
                  <div className="markdown-body whitespace-pre-line text-slate-700">
                    <MathText text={aiExplanation} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
              <Button variant="secondary" onClick={() => setActiveQuestion(null)}>Đóng cửa sổ</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
