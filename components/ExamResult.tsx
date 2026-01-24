import React, { useState } from 'react';
import { Exam, ExamAttempt, Question, QuestionType } from '../types';
import { Button } from './Button';
import { streamAIExplanation } from '../services/geminiService';
import { MathText } from './MathText';
import { getQuestionTypeLabel } from '../services/scoringService';

interface ExamResultProps {
  attempt: ExamAttempt;
  exam: Exam;
  onHome: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({ attempt, exam, onHome }) => {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Flatten questions for easier counting (including sub-questions)
  const allQuestions: Question[] = [];
  if (exam.questions) {
    exam.questions.forEach(q => {
       if (q.type === 'reading' && q.subQuestions) {
          // We only count sub-questions for scoring in reading comp
          allQuestions.push(...q.subQuestions);
       } else {
          allQuestions.push(q);
       }
    });
  }

  // Calculate detailed score based on flattened list
  // Note: The `attempt.score` passed from runner is essentially a simple count.
  // We recalculate here for detailed display if needed, but rely on attempt.score for the big number.
  const total = allQuestions.length;
  const correctCount = attempt.score;
  const percentage = Math.round((correctCount / total) * 100) || 0;
  
  // Helper
  const getImageUrl = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('bank:') && exam.imageBank) {
       const id = src.split(':')[1];
       return exam.imageBank[id];
    }
    return src;
  };

  const handleAIExplain = async (q: Question) => {
    setLoadingAI(true);
    setAiExplanation("");
    const qWithResolvedImage = { ...q, image: getImageUrl(q.image) };
    await streamAIExplanation(qWithResolvedImage, (text) => {
      setLoadingAI(false);
      setAiExplanation(text);
    });
  };

  // --- Render Answer Details based on Type ---
  const renderAnswerDetails = (q: Question) => {
     const userAns = attempt.answers[q.id];

     if (q.type === 'true_false') {
        return (
           <div className="mt-3 bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
              <table className="w-full text-sm">
                 <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-500">
                    <tr>
                       <th className="px-4 py-2 text-left">Mệnh đề</th>
                       <th className="px-4 py-2 text-center">Bạn chọn</th>
                       <th className="px-4 py-2 text-center">Đáp án</th>
                    </tr>
                 </thead>
                 <tbody>
                    {q.rows?.map(row => {
                       const uVal = userAns ? userAns[row.id] : undefined;
                       const isCorrect = uVal === row.isCorrect;
                       return (
                          <tr key={row.id} className="border-t border-slate-100">
                             <td className="px-4 py-2"><MathText text={row.text} /></td>
                             <td className={`px-4 py-2 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                {uVal === true ? 'Đúng' : uVal === false ? 'Sai' : '-'}
                             </td>
                             <td className="px-4 py-2 text-center text-slate-500">
                                {row.isCorrect ? 'Đúng' : 'Sai'}
                             </td>
                          </tr>
                       )
                    })}
                 </tbody>
              </table>
           </div>
        );
     }

     if (q.type === 'true_false_explain') {
        const answer = userAns || { answer: true, explanation: '' };
        return (
           <div className="mt-3 space-y-3">
              <div className="p-3 rounded border bg-blue-50 border-blue-200">
                 <span className="block text-xs font-bold uppercase opacity-70 mb-1 text-blue-800">Bạn chọn</span>
                 <span className="font-medium text-blue-900">{answer.answer ? 'Đúng' : 'Sai'}</span>
                 {answer.explanation && (
                    <div className="mt-2 text-sm text-blue-800">
                       <strong>Giải thích:</strong> {answer.explanation}
                    </div>
                 )}
              </div>
              <div className="p-3 rounded border bg-green-50 border-green-200">
                 <span className="block text-xs font-bold uppercase opacity-70 mb-1 text-green-800">Đáp án đúng</span>
                 <span className="font-medium text-green-900">{q.correctAnswer ? 'Đúng' : 'Sai'}</span>
              </div>
           </div>
        );
     }

     if (q.type === 'short_answer') {
        const isCorrect = (userAns || "").toString().trim().toLowerCase() === (q.correctAnswerText || "").trim().toLowerCase();
        return (
           <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className={`p-3 rounded border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                 <span className="block text-xs font-bold uppercase opacity-70 mb-1">Bạn trả lời</span>
                 <span className="font-medium">{userAns || "(Trống)"}</span>
              </div>
              <div className="p-3 rounded border bg-blue-50 border-blue-200">
                 <span className="block text-xs font-bold uppercase opacity-70 mb-1 text-blue-800">Đáp án đúng</span>
                 <span className="font-medium text-blue-900">{q.correctAnswerText}</span>
              </div>
           </div>
        );
     }

     if (q.type === 'essay') {
        return (
           <div className="mt-3 space-y-3">
              <div className="p-3 rounded border bg-purple-50 border-purple-200">
                 <span className="block text-xs font-bold uppercase opacity-70 mb-1 text-purple-800">Bài viết của bạn</span>
                 <p className="text-sm text-purple-900 whitespace-pre-wrap">{userAns || "(Trống)"}</p>
              </div>
              {q.sampleAnswer && (
                 <div className="p-3 rounded border bg-green-50 border-green-200">
                    <span className="block text-xs font-bold uppercase opacity-70 mb-1 text-green-800">Đáp án mẫu</span>
                    <p className="text-sm text-green-900 whitespace-pre-wrap">{q.sampleAnswer}</p>
                 </div>
              )}
           </div>
        );
     }

     if (q.type === 'fill_in_blank') {
        return (
           <div className="mt-3">
              <div className="p-3 rounded border bg-slate-50 border-slate-200">
                 <span className="block text-xs font-bold uppercase opacity-70 mb-2">Các chỗ trống đã điền</span>
                 <div className="space-y-2">
                    {q.blanks?.map((blank, idx) => (
                       <div key={blank.position} className="text-sm">
                          <strong>Chỗ trống {idx + 1}:</strong> {userAns?.[blank.position] || '(Trống)'} 
                          <span className="text-xs text-slate-500 ml-2">(Đáp án: {blank.correctAnswers.join(', ')})</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        );
     }

     if (q.type === 'matching') {
        return (
           <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                 <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-500">
                    <tr>
                       <th className="px-4 py-2 text-left">Mục trái</th>
                       <th className="px-4 py-2 text-left">Bạn ghép</th>
                       <th className="px-4 py-2 text-left">Đáp án</th>
                    </tr>
                 </thead>
                 <tbody>
                    {q.matchingPairs?.map(pair => (
                       <tr key={pair.id} className="border-t border-slate-100">
                          <td className="px-4 py-2"><strong>{pair.left}</strong></td>
                          <td className={`px-4 py-2 font-bold ${userAns?.[pair.id] === pair.right ? 'text-green-600' : 'text-red-500'}`}>
                             {userAns?.[pair.id] || '(Trống)'}
                          </td>
                          <td className="px-4 py-2 text-slate-500">{pair.right}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        );
     }

     if (q.type === 'multiple_select') {
        return (
           <div className="mt-3 space-y-2">
              {q.options?.map((opt, idx) => {
                 const isSelected = userAns?.includes(idx);
                 const isCorrect = q.correctAnswers?.includes(idx);
                 let style = "border-slate-100 text-slate-500 bg-white opacity-60";

                 if (isCorrect && isSelected) style = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500";
                 else if (isCorrect && !isSelected) style = "border-yellow-500 bg-yellow-50 text-yellow-800 ring-1 ring-yellow-500";
                 else if (!isCorrect && isSelected) style = "border-red-500 bg-red-50 text-red-800 font-bold ring-1 ring-red-500";

                 return (
                    <div key={idx} className={`px-3 py-2 border rounded flex items-center gap-2 text-sm ${style}`}>
                       <input type="checkbox" aria-label={`Lựa chọn: ${opt}`} checked={isSelected} disabled readOnly />
                       <MathText text={opt} />
                    </div>
                 );
              })}
           </div>
        );
     }

     if (q.type === 'ordering') {
        return (
           <div className="mt-3 space-y-2">
              {userAns?.map((item: string, idx: number) => {
                 const isCorrect = q.correctOrder?.[idx] === item;
                 return (
                    <div
                       key={`${item}-${idx}`}
                       className={`px-4 py-2 rounded border flex items-center gap-3 text-sm ${
                          isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
                       }`}
                    >
                       <span className="font-bold">{idx + 1}.</span>
                       <span>{item}</span>
                    </div>
                 );
              })}
           </div>
        );
     }

     // Default MCQ
     return (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
           {q.options?.map((opt, idx) => {
              const isSelected = userAns === idx;
              const isCorrectIndex = idx === q.correctIndex;
              let style = "border-slate-100 text-slate-500 bg-white opacity-60";
              
              if (isCorrectIndex) style = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500";
              else if (isSelected) style = "border-red-500 bg-red-50 text-red-800 font-bold ring-1 ring-red-500";
              
              return (
                 <div key={idx} className={`px-3 py-2 border rounded flex items-center gap-2 text-sm ${style}`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full border text-xs">{String.fromCharCode(65+idx)}</span>
                    <MathText text={opt} />
                 </div>
              )
           })}
        </div>
     );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
       {/* Exam Info Header */}
       <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl border border-blue-100 p-6 space-y-3">
          <div className="flex justify-between items-start gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-800">{exam.title}</h1>
                <p className="text-slate-600 text-sm mt-1">{exam.description}</p>
             </div>
             <div className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${
                exam.type === 'TSA' 
                   ? 'bg-blue-100 text-blue-700' 
                   : 'bg-purple-100 text-purple-700'
             }`}>
                {exam.type === 'TSA' ? '🧠 TSA - Tư duy' : '📚 HSA - Năng lực'}
             </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
             <div className="bg-white rounded-lg p-3 border border-blue-100">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Thời gian</span>
                <span className="text-blue-700 font-bold">{exam.durationMinutes} phút</span>
             </div>
             <div className="bg-white rounded-lg p-3 border border-blue-100">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Tổng câu hỏi</span>
                <span className="text-blue-700 font-bold">{total} câu</span>
             </div>
             <div className="bg-white rounded-lg p-3 border border-blue-100">
                <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Danh mục</span>
                <span className="text-blue-700 font-bold">{exam.category || 'Chung'}</span>
             </div>
          </div>
       </div>

       {/* Summary Header */}
       <div className="bg-white rounded-3xl shadow-lg overflow-hidden text-center p-8 border border-slate-100">
          <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
             <div className="text-4xl font-black text-blue-600">{percentage}%</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kết quả bài thi</h2>
          <p className="text-slate-500">Bạn làm đúng {correctCount} trên tổng số {total} câu hỏi.</p>
          <div className="flex justify-center gap-4 mt-6">
             <Button onClick={onHome} variant="secondary">Về trang chủ</Button>
             <Button onClick={() => window.print()}>In kết quả</Button>
          </div>
       </div>

       {/* Questions Review */}
       <div className="space-y-6">
          <h3 className="font-bold text-xl text-slate-800 px-2">Chi tiết đáp án</h3>
          
          {exam.questions && exam.questions.map((q, i) => {
             // If Reading Comp, render block then questions
             if (q.type === 'reading' && q.subQuestions) {
                return (
                   <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700">Bài đọc {i+1}</div>
                      <div className="p-6 border-b border-slate-100 text-sm leading-relaxed text-slate-600 bg-slate-50/50">
                         <MathText text={q.text.substring(0, 200) + "..."} /> 
                         <span className="text-blue-500 text-xs italic ml-2">(Xem toàn văn trong bài thi)</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                         {q.subQuestions.map((subQ, subI) => (
                            <div key={subQ.id} className="p-6">
                               <div className="flex gap-2 mb-2">
                                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">Câu {i+1}.{subI+1}</span>
                               </div>
                               <h4 className="font-medium text-slate-800 mb-2"><MathText text={subQ.text} /></h4>
                               {renderAnswerDetails(subQ)}
                               <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded">
                                  <strong>Giải thích: </strong> <MathText text={subQ.explanation} />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )
             }

             // Standard Questions
             const img = getImageUrl(q.image);
             return (
                <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                   <div className="flex gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">Câu {i+1}</span>
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wide mt-0.5">{getQuestionTypeLabel(q.type)}</span>
                   </div>
                   
                   <h4 className="font-medium text-lg text-slate-800 mb-4"><MathText text={q.text} /></h4>
                   {img && <img src={img} className="max-h-48 mb-4 rounded border" alt="Q"/>}
                   
                   {renderAnswerDetails(q)}

                   <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-start">
                      <div className="text-sm text-slate-600">
                         <span className="font-bold text-slate-800 block mb-1">Giải thích:</span>
                         <MathText text={q.explanation || "Không có."} />
                      </div>
                      <button onClick={() => { setActiveQuestion(q); handleAIExplain(q); }} className="text-purple-600 text-xs font-bold flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded transition-colors whitespace-nowrap ml-4">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         AI Tutor
                      </button>
                   </div>
                </div>
             )
          })}
       </div>

       {/* AI Modal (Copied from Result but simplified) */}
       {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-purple-50 rounded-t-2xl">
              <h3 className="font-bold text-purple-800">AI Tutor Analysis</h3>
              <button onClick={() => setActiveQuestion(null)}>✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {loadingAI ? <div className="text-center py-8 animate-pulse text-purple-600">Đang phân tích...</div> : <div className="prose prose-sm"><MathText text={aiExplanation} /></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};