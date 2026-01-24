import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Exam, Question, QuestionType } from '../types';
import { Button } from './Button';
import { streamAIExplanation } from '../services/geminiService';
import { MathText } from './MathText';
import { 
  EssayQuestion, 
  FillInBlankQuestion, 
  TrueFalseExplainQuestion, 
  MatchingQuestion, 
  MultipleSelectQuestion, 
  OrderingQuestion 
} from './questions';

interface ExamRunnerProps {
  exam: Exam;
  mode: 'exam' | 'practice';
  onFinish: (answers: Record<string, any>, timeSpent: number) => void;
  onExit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ exam, mode, onFinish, onExit }) => {
  const STORAGE_KEY = `tsa_autosave_${exam.id}_${mode}`;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeAIQuestionId, setActiveAIQuestionId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    setImageError(false);
  }, [currentIdx]);

  const getImageUrl = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('bank:') && exam.imageBank) {
       const id = src.split(':')[1];
       return exam.imageBank[id];
    }
    return src;
  };

  // --- AUTOSAVE & RESTORE ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.answers) setAnswers(data.answers);
        if (data.flagged) setFlagged(data.flagged);
        if (data.checkedQuestions) setCheckedQuestions(data.checkedQuestions);
        if (mode === 'exam' && typeof data.timeLeft === 'number' && data.timeLeft > 0) {
           setTimeLeft(data.timeLeft);
        }
        if (typeof data.currentIdx === 'number') setCurrentIdx(data.currentIdx);
        triggerAlert("🔄 Đã khôi phục bài làm từ phiên trước");
      } catch (e) { console.error("Restore failed", e); }
    }
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (!isRestored) return;
    const payload = { answers, flagged, checkedQuestions, currentIdx, timeLeft, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [answers, flagged, checkedQuestions, currentIdx, isRestored]);

  useEffect(() => {
    if (!isRestored || mode !== 'exam') return;
    if (timeLeft % 5 === 0) {
      const payload = { answers, flagged, checkedQuestions, currentIdx, timeLeft, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }, [timeLeft, isRestored, mode]);
  // --- END AUTOSAVE ---

  const triggerAlert = useCallback((msg: string) => {
    if (mode === 'practice' && !msg.includes("khôi phục")) return; 
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  }, [mode]);

  const handleSubmit = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const timeSpent = (exam.durationMinutes * 60) - timeLeft;
    onFinish(answersRef.current, timeSpent);
  }, [exam.durationMinutes, onFinish, timeLeft, STORAGE_KEY]);

  const handleManualExit = () => {
    if (confirm("Bạn có chắc muốn thoát? Tiến độ bài làm hiện tại sẽ bị xóa.")) {
      localStorage.removeItem(STORAGE_KEY);
      onExit();
    }
  };

  useEffect(() => {
    if (mode === 'practice') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit, exam.durationMinutes, mode]);

  useEffect(() => {
    setQuestionElapsed(0);
    const qTimer = setInterval(() => {
      setQuestionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentIdx]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId: string, value: any) => {
    if (mode === 'practice' && checkedQuestions[qId]) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };
  
  const handleCheckAnswer = (qId: string) => {
    setCheckedQuestions(prev => ({...prev, [qId]: true}));
  };

  const handleToggleFlag = () => {
    setFlagged(prev => ({...prev, [currentQuestion.id]: !prev[currentQuestion.id]}));
  };

  const handleAIExplain = async (q: Question) => {
    if (activeAIQuestionId === q.id) return;
    setLoadingAI(true);
    setActiveAIQuestionId(q.id);
    setAiExplanation("");
    const qWithResolvedImage = { ...q, image: getImageUrl(q.image) };
    await streamAIExplanation(qWithResolvedImage, (text) => {
      setLoadingAI(false);
      setAiExplanation(text);
    });
  };

  const currentQuestion = exam.questions[currentIdx];
  const progress = Object.keys(answers).length; // Note: This logic needs refinement for sub-questions, simplified here
  const isLast = currentIdx === exam.questions.length - 1;
  const isFlagged = flagged[currentQuestion.id];
  
  // --- Renderers for Question Types ---

  const renderMultipleChoice = (q: Question, isSub = false) => {
    const isChecked = checkedQuestions[q.id];
    const userAns = answers[q.id];
    const hasAns = userAns !== undefined;

    return (
      <div className="grid gap-3 mb-6">
        {q.options?.map((opt, idx) => {
          const isSelected = userAns === idx;
          const isCorrectIndex = idx === q.correctIndex;
          
          let styles = "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50";
          let icon = String.fromCharCode(65 + idx);
          
          if (mode === 'practice' && isChecked) {
             if (isCorrectIndex) styles = "border-green-500 bg-green-50/50 ring-1 ring-green-500 z-10";
             else if (isSelected) styles = "border-red-500 bg-red-50/50 ring-1 ring-red-500 z-10";
             else styles = "border-slate-100 bg-white opacity-60";
          } else if (isSelected) {
             styles = "border-blue-600 bg-blue-50/50 shadow-sm z-10";
          }

          return (
            <div
              key={idx}
              onClick={() => !isChecked && handleAnswerChange(q.id, idx)}
              className={`group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${styles}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mr-4 bg-slate-100 text-slate-500 ${isSelected ? 'bg-blue-600 text-white' : ''} ${isChecked && isCorrectIndex ? '!bg-green-500 !text-white' : ''}`}>
                {icon}
              </div>
              <div className="flex-1 text-base text-slate-700">
                <MathText text={opt} />
              </div>
            </div>
          );
        })}
        {mode === 'practice' && !isChecked && hasAns && (
           <div className="flex justify-end"><Button size="sm" onClick={() => handleCheckAnswer(q.id)}>Kiểm tra</Button></div>
        )}
      </div>
    );
  };

  const renderTrueFalse = (q: Question) => {
    const isChecked = checkedQuestions[q.id];
    const userAns = answers[q.id] || {}; // Record<string, boolean>

    return (
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left text-slate-700">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-2/3">Mệnh đề</th>
              <th className="px-6 py-3 text-center">Đúng</th>
              <th className="px-6 py-3 text-center">Sai</th>
            </tr>
          </thead>
          <tbody>
            {q.rows?.map((row) => {
              const selectedVal = userAns[row.id]; // true | false | undefined
              const isCorrectRow = row.isCorrect;
              
              let rowClass = "bg-white border-b hover:bg-slate-50";
              // Check visual logic
              if (mode === 'practice' && isChecked) {
                 const userCorrect = selectedVal === isCorrectRow;
                 rowClass = userCorrect ? "bg-green-50" : "bg-red-50";
              }

              return (
                <tr key={row.id} className={rowClass}>
                  <td className="px-6 py-4 font-medium"><MathText text={row.text} /></td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="radio" 
                      name={`${q.id}_${row.id}`} 
                      checked={selectedVal === true}
                      onChange={() => handleAnswerChange(q.id, { ...userAns, [row.id]: true })}
                      disabled={isChecked}
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="radio" 
                      name={`${q.id}_${row.id}`} 
                      checked={selectedVal === false}
                      onChange={() => handleAnswerChange(q.id, { ...userAns, [row.id]: false })}
                      disabled={isChecked}
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {mode === 'practice' && !isChecked && Object.keys(userAns).length > 0 && (
           <div className="flex justify-end p-4 bg-slate-50 border-t"><Button size="sm" onClick={() => handleCheckAnswer(q.id)}>Kiểm tra</Button></div>
        )}
      </div>
    );
  };

  const renderShortAnswer = (q: Question) => {
    const isChecked = checkedQuestions[q.id];
    const userAns = answers[q.id] || "";

    let inputClass = "w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none";
    if (mode === 'practice' && isChecked) {
        const isCorrect = userAns.trim().toLowerCase() === (q.correctAnswerText || "").trim().toLowerCase();
        inputClass = isCorrect 
          ? "w-full p-3 rounded-lg border-2 border-green-500 bg-green-50 text-green-900 font-bold"
          : "w-full p-3 rounded-lg border-2 border-red-500 bg-red-50 text-red-900";
    }

    return (
      <div className="mb-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">Nhập câu trả lời của bạn:</label>
        <input 
          type="text" 
          value={userAns} 
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          disabled={isChecked}
          className={inputClass}
          placeholder="Viết đáp án..."
        />
        {mode === 'practice' && isChecked && (
          <div className="text-sm text-slate-600 mt-2">
            <strong>Đáp án đúng:</strong> {q.correctAnswerText}
          </div>
        )}
        {mode === 'practice' && !isChecked && userAns && (
           <div className="flex justify-end"><Button size="sm" onClick={() => handleCheckAnswer(q.id)}>Kiểm tra</Button></div>
        )}
      </div>
    );
  };

  // Main Render Logic Switcher
  const renderQuestionBody = (q: Question) => {
    const isChecked = checkedQuestions[q.id];
    
    switch (q.type) {
      case 'essay': 
        return <EssayQuestion question={q} value={answers[q.id] || ''} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'fill_in_blank': 
        return <FillInBlankQuestion question={q} value={answers[q.id] || []} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'true_false_explain': 
        return <TrueFalseExplainQuestion question={q} value={answers[q.id] || { choice: null, explanation: '' }} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'matching': 
        return <MatchingQuestion question={q} value={answers[q.id] || {}} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'multiple_select': 
        return <MultipleSelectQuestion question={q} value={answers[q.id] || []} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'ordering': 
        return <OrderingQuestion question={q} value={answers[q.id] || []} onChange={(v) => handleAnswerChange(q.id, v)} disabled={isChecked} />;
      case 'true_false': 
        return renderTrueFalse(q);
      case 'short_answer': 
        return renderShortAnswer(q);
      case 'multiple_choice': 
      default: 
        return renderMultipleChoice(q);
    }
  };

  // Special Layout for Reading Comprehension
  if (currentQuestion.type === 'reading' && currentQuestion.subQuestions) {
    return (
      <div className="relative flex flex-col h-[calc(100vh-100px)]">
         {/* Header */}
         <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-4">
               <span className="font-bold text-slate-700">Bài đọc {currentIdx + 1}</span>
               <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {currentQuestion.subQuestions.length} câu hỏi kèm theo
               </div>
            </div>
            {mode === 'exam' && <div className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</div>}
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx===0}>Trước</Button>
               <Button variant="primary" size="sm" onClick={() => isLast ? setSubmitConfirmOpen(true) : setCurrentIdx(currentIdx + 1)}>{isLast ? "Nộp bài" : "Tiếp"}</Button>
            </div>
         </div>

         <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Passage */}
            <div className="flex-1 md:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-slate-200 bg-slate-50 custom-scrollbar">
               <h3 className="text-xl font-bold text-slate-800 mb-4">Văn bản đọc hiểu</h3>
               <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-justify">
                  <MathText text={currentQuestion.text} />
               </div>
            </div>

            {/* Right: Sub Questions */}
            <div className="flex-1 md:w-1/2 p-6 md:p-8 overflow-y-auto bg-white custom-scrollbar">
               <div className="space-y-12">
                  {currentQuestion.subQuestions.map((subQ, idx) => (
                    <div key={subQ.id} className="relative">
                       <span className="absolute -left-4 top-0 text-xs font-bold text-slate-400 -ml-2">#{idx + 1}</span>
                       <h4 className="font-bold text-slate-800 mb-4 text-base"><MathText text={subQ.text} /></h4>
                       {/* Render sub-question based on its own type */}
                       {(() => {
                          const SubRenderer = () => {
                             // Temporarily inject handlers scoped to subQ.id
                             // Note: renderMultipleChoice etc uses handleAnswerChange which uses q.id.
                             // We need to render them passing subQ
                             switch(subQ.type) {
                                case 'true_false': return renderTrueFalse(subQ);
                                case 'short_answer': return renderShortAnswer(subQ);
                                default: return renderMultipleChoice(subQ, true);
                             }
                          }
                          return <SubRenderer />
                       })()}
                       
                       {/* Explanation for SubQ (Practice) */}
                       {mode === 'practice' && checkedQuestions[subQ.id] && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-slate-700">
                             <div className="font-bold mb-1 text-blue-700">Giải thích:</div>
                             <MathText text={subQ.explanation} />
                          </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
         </div>
         {isSubmitConfirmOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                  <h3 className="font-bold text-lg mb-2">Nộp bài?</h3>
                  <p className="mb-4 text-sm text-slate-600">Bạn có chắc muốn kết thúc?</p>
                  <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => setSubmitConfirmOpen(false)} className="flex-1">Hủy</Button>
                     <Button onClick={() => { localStorage.removeItem(STORAGE_KEY); onFinish(answersRef.current, (exam.durationMinutes * 60) - timeLeft); }} className="flex-1">Nộp ngay</Button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  // Standard Layout for Single Questions
  return (
    <div className="relative flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-160px)] h-auto">
      {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-amber-100 border-l-4 border-amber-500 text-amber-700 px-6 py-3 rounded shadow-lg font-bold">
          {notification}
        </div>
      )}

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[600px] lg:h-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-sm font-semibold">Câu {currentIdx + 1}</span>
             {mode === 'practice' && <span className="text-green-600 text-xs font-bold uppercase border border-green-200 px-2 py-0.5 rounded bg-green-50">Luyện tập</span>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleToggleFlag} className={`p-2 rounded-full ${isFlagged ? 'text-yellow-500 bg-yellow-50' : 'text-slate-300 hover:text-slate-500'}`}>
              <svg className="w-5 h-5" fill={isFlagged ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8l-6-2-6 2zM3 21h18M5 10V3a2 2 0 012-2h10a2 2 0 012 2v7" /></svg>
            </button>
            {mode === 'exam' && <div className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
             <h2 className="text-xl font-bold text-slate-800 mb-6 whitespace-pre-line"><MathText text={currentQuestion.text} /></h2>
             
             {(() => {
                const img = getImageUrl(currentQuestion.image);
                if (img) return <img src={img} className="max-h-80 mb-6 mx-auto rounded border" onError={()=>setImageError(true)} alt="Q" />
             })()}

             {renderQuestionBody(currentQuestion)}

             {mode === 'practice' && checkedQuestions[currentQuestion.id] && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-8 animate-fade-in">
                   <h4 className="font-bold text-blue-800 mb-2">Giải thích</h4>
                   <p className="text-sm text-slate-700 whitespace-pre-line"><MathText text={currentQuestion.explanation || "Chưa có giải thích."} /></p>
                   
                   <div className="mt-4 pt-4 border-t border-blue-200/50">
                      {activeAIQuestionId !== currentQuestion.id ? (
                        <button onClick={() => handleAIExplain(currentQuestion)} className="text-sm text-purple-600 font-bold flex items-center gap-1 hover:underline">
                           ✨ Hỏi gia sư AI
                        </button>
                      ) : (
                        <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm mt-2 text-sm text-slate-700">
                           {loadingAI ? <span className="animate-pulse text-purple-600">Đang suy nghĩ...</span> : <MathText text={aiExplanation} />}
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between">
           <Button variant="ghost" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx===0}>Quay lại</Button>
           <Button onClick={() => isLast ? setSubmitConfirmOpen(true) : setCurrentIdx(currentIdx + 1)}>{isLast ? "Nộp bài" : "Tiếp theo"}</Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Xác nhận nộp bài?</h3>
            <p className="text-slate-500 text-center mb-6 text-sm">Bạn còn thời gian. Kiểm tra kỹ trước khi nộp nhé.</p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={handleSubmit}>Nộp bài ngay</Button>
              <Button variant="ghost" onClick={() => setSubmitConfirmOpen(false)}>Làm tiếp</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

