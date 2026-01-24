import React, { useState, useEffect } from 'react';
import { Exam, Question, QuestionCategory, QuestionDifficulty, QuestionType, ExamType } from '../types';
import { Button } from './Button';
import { generateId } from '../services/dbService';
import { ImageUploader } from './ImageUploader';
import { MathText } from './MathText';
import { getDefaultDuration } from '../constants/examConfig';

interface ExamEditorProps {
  initialExam?: Exam | null;
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}

const EmptyQuestion: Question = {
  id: '',
  type: 'multiple_choice',
  text: '',
  options: ['', '', '', '', ''],
  correctIndex: 0,
  explanation: '',
  explanationImage: '',
  category: QuestionCategory.PROBLEM_SOLVING,
  difficulty: QuestionDifficulty.MEDIUM,
  tags: [],
  requiresImage: false
};

export const ExamEditor: React.FC<ExamEditorProps> = ({ initialExam, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details');
  const [title, setTitle] = useState(initialExam?.title || '');
  const [description, setDescription] = useState(initialExam?.description || '');
  const [examType, setExamType] = useState<ExamType>(initialExam?.type || ExamType.TSA);
  const [duration, setDuration] = useState(initialExam?.durationMinutes || getDefaultDuration(initialExam?.type || ExamType.TSA));
  const [questions, setQuestions] = useState<Question[]>(initialExam?.questions || []);
  const [imageBank, setImageBank] = useState<Record<string, string>>(initialExam?.imageBank || {});
  
  const [editingQId, setEditingQId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialExam && questions.length === 0) {
      addQuestion();
    }
  }, []);

  // Auto-adjust duration when exam type changes (if editing, keep existing)
  const handleExamTypeChange = (newType: ExamType) => {
    setExamType(newType);
    // Only set default duration if creating new exam, not if editing
    if (!initialExam) {
      setDuration(getDefaultDuration(newType));
    }
  };

  const addQuestion = () => {
    const newQ = { ...EmptyQuestion, id: generateId() };
    // Set default category based on exam type
    if (examType === ExamType.HSA) {
        newQ.category = QuestionCategory.MATH;
    }
    setQuestions([...questions, newQ]);
    setEditingQId(newQ.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (qId: string, idx: number, val: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    const newOptions = [...(q.options || [])];
    newOptions[idx] = val;
    updateQuestion(qId, { options: newOptions });
  };

  const handleTypeChange = (qId: string, newType: QuestionType) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    
    let updates: Partial<Question> = { type: newType };
    if (newType === 'true_false') {
        updates.rows = [{id: generateId(), text: 'Mệnh đề 1', isCorrect: true}];
    } else if (newType === 'short_answer') {
        updates.correctAnswerText = '';
    } else if (newType === 'multiple_choice') {
        updates.options = ['', '', '', '', ''];
        updates.correctIndex = 0;
    }
    updateQuestion(qId, updates);
  }

  // --- True/False Logic ---
  const addTFRow = (qId: string) => {
     const q = questions.find(q => q.id === qId);
     if (!q) return;
     const newRows = [...(q.rows || []), { id: generateId(), text: '', isCorrect: false }];
     updateQuestion(qId, { rows: newRows });
  };
  
  const updateTFRow = (qId: string, rowIdx: number, field: 'text' | 'isCorrect', val: any) => {
     const q = questions.find(q => q.id === qId);
     if (!q || !q.rows) return;
     const newRows = [...q.rows];
     newRows[rowIdx] = { ...newRows[rowIdx], [field]: val };
     updateQuestion(qId, { rows: newRows });
  };
  
  const removeTFRow = (qId: string, rowIdx: number) => {
     const q = questions.find(q => q.id === qId);
     if (!q || !q.rows) return;
     const newRows = q.rows.filter((_, i) => i !== rowIdx);
     updateQuestion(qId, { rows: newRows });
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
       alert("Đề thi phải có ít nhất 1 câu hỏi!");
       return;
    }
    if (confirm("Xóa câu hỏi này?")) {
      setQuestions(questions.filter(q => q.id !== id));
      if (editingQId === id) setEditingQId(null);
    }
  };

  // --- Image Bank Logic ---
  const addToImageBank = (base64: string) => {
    const newId = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setImageBank(prev => ({ ...prev, [newId]: base64 }));
  };

  const removeFromImageBank = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa ảnh này khỏi kho?")) {
      const newBank = { ...imageBank };
      delete newBank[id];
      setImageBank(newBank);
      setQuestions(questions.map(q => {
        if (q.image === `bank:${id}`) return { ...q, image: undefined };
        return q;
      }));
    }
  };

  const getImageSource = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('bank:')) return imageBank[src.split(':')[1]];
    return src;
  };

  const handleSaveExam = () => {
    if (!title.trim()) { alert("Vui lòng nhập tên đề thi"); return; }
    onSave({
      id: initialExam?.id || generateId(),
      type: examType,
      title, description, durationMinutes: duration,
      questionCount: questions.length,
      createdAt: initialExam?.createdAt || Date.now(),
      questions, imageBank
    });
  };

  // Helper to get categories based on exam type
  const getCategories = () => {
    if (examType === ExamType.TSA) {
        return [
            QuestionCategory.PROBLEM_SOLVING,
            QuestionCategory.CRITICAL_THINKING,
            QuestionCategory.UNKNOWN
        ];
    }
    return [
        QuestionCategory.MATH,
        QuestionCategory.LITERATURE,
        QuestionCategory.PHYSICS,
        QuestionCategory.CHEMISTRY,
        QuestionCategory.BIOLOGY,
        QuestionCategory.HISTORY,
        QuestionCategory.GEOGRAPHY,
        QuestionCategory.ENGLISH,
        QuestionCategory.UNKNOWN
    ];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">{initialExam ? 'Chỉnh sửa' : 'Tạo mới'}</h2>
            <select 
               className="bg-slate-100 border border-slate-300 text-slate-700 font-bold py-1 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
               value={examType}
               onChange={(e) => handleExamTypeChange(e.target.value as ExamType)}
            >
               <option value={ExamType.TSA}>Hệ TSA (Tư duy)</option>
               <option value={ExamType.HSA}>Hệ HSA (Đánh giá năng lực)</option>
            </select>
         </div>
         <div className="flex gap-3">
             <Button variant="secondary" onClick={onCancel}>Hủy</Button>
             <Button onClick={handleSaveExam}>Lưu đề</Button>
         </div>
      </div>

      {/* Editor Body */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
         <div className="mb-6 grid grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Tên đề thi" value={title} onChange={e => setTitle(e.target.value)} />
            <input className="border p-2 rounded" type="number" placeholder="Thời gian (phút)" value={duration} onChange={e => setDuration(Number(e.target.value))} />
         </div>
         
         <div className="space-y-4">
            {questions.map((q, idx) => (
               <div key={q.id} className={`border rounded-xl p-4 ${editingQId === q.id ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200'}`}>
                  {editingQId === q.id ? (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="font-bold text-blue-600">Câu {idx + 1}</span>
                           <div className="flex gap-2">
                              <select 
                                value={q.category} 
                                onChange={(e) => updateQuestion(q.id, { category: e.target.value as QuestionCategory })}
                                className="text-sm border rounded px-2 max-w-[150px]"
                              >
                                 {getCategories().map(cat => (
                                     <option key={cat} value={cat}>{cat}</option>
                                 ))}
                              </select>
                              <select 
                                value={q.type || 'multiple_choice'} 
                                onChange={(e) => handleTypeChange(q.id, e.target.value as QuestionType)}
                                className="text-sm border rounded px-2"
                              >
                                 <option value="multiple_choice">Trắc nghiệm</option>
                                 <option value="true_false">Đúng/Sai</option>
                                 <option value="short_answer">Điền khuyết</option>
                                 <option value="reading">Bài đọc</option>
                              </select>
                              <button onClick={() => setEditingQId(null)} className="text-sm text-slate-500">Đóng</button>
                           </div>
                        </div>

                        <textarea 
                           className="w-full border p-2 rounded min-h-[100px]" 
                           placeholder="Nội dung câu hỏi"
                           value={q.text} 
                           onChange={e => updateQuestion(q.id, { text: e.target.value })} 
                        />
                        
                        {/* Type Specific Inputs */}
                        {(!q.type || q.type === 'multiple_choice') && (
                           <div className="space-y-2">
                              <p className="text-sm font-bold">Lựa chọn:</p>
                              {q.options?.map((opt, oIdx) => (
                                 <div key={oIdx} className="flex gap-2">
                                    <input type="radio" name={`c_${q.id}`} checked={q.correctIndex === oIdx} onChange={() => updateQuestion(q.id, { correctIndex: oIdx })} />
                                    <input className="border p-1 rounded flex-1" value={opt} onChange={e => updateOption(q.id, oIdx, e.target.value)} />
                                 </div>
                              ))}
                           </div>
                        )}

                        {q.type === 'true_false' && (
                           <div className="space-y-2">
                              <p className="text-sm font-bold">Danh sách mệnh đề:</p>
                              {q.rows?.map((row, rIdx) => (
                                 <div key={row.id} className="flex gap-2 items-center">
                                    <input className="border p-1 rounded flex-1" value={row.text} onChange={e => updateTFRow(q.id, rIdx, 'text', e.target.value)} placeholder="Mệnh đề..." />
                                    <label className="text-sm flex items-center gap-1">
                                       <input type="checkbox" checked={row.isCorrect} onChange={e => updateTFRow(q.id, rIdx, 'isCorrect', e.target.checked)} /> Đúng
                                    </label>
                                    <button onClick={() => removeTFRow(q.id, rIdx)} className="text-red-500">x</button>
                                 </div>
                              ))}
                              <Button size="sm" variant="secondary" onClick={() => addTFRow(q.id)}>+ Thêm dòng</Button>
                           </div>
                        )}

                        {q.type === 'short_answer' && (
                           <div>
                              <p className="text-sm font-bold mb-1">Đáp án đúng (Text):</p>
                              <input className="border p-2 rounded w-full" value={q.correctAnswerText || ''} onChange={e => updateQuestion(q.id, { correctAnswerText: e.target.value })} />
                           </div>
                        )}

                        {q.type === 'reading' && (
                           <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                              Dạng bài đọc hiểu có cấu trúc phức tạp (Cha-Con). Vui lòng sử dụng tính năng "Import JSON/CSV" để tạo câu hỏi này một cách tốt nhất.
                           </div>
                        )}

                        <div>
                           <p className="text-sm font-bold mb-1">Ảnh câu hỏi (URL hoặc Base64):</p>
                           <input 
                              className="border p-2 rounded w-full text-xs" 
                              placeholder="https://... hoặc data:image/..."
                              value={q.image || ''} 
                              onChange={e => updateQuestion(q.id, { image: e.target.value })} 
                           />
                           {q.image && (
                              <div className="mt-2 p-2 bg-slate-100 rounded">
                                 {q.image.startsWith('data:') || q.image.startsWith('http') ? (
                                    <img src={q.image} alt="Question" className="max-w-xs h-auto rounded" />
                                 ) : (
                                    <p className="text-xs text-slate-600">🖼️ Ảnh sẽ được hiển thị khi xem bài</p>
                                 )}
                              </div>
                           )}
                        </div>

                        <div>
                           <p className="text-sm font-bold mb-1">Giải thích:</p>
                           <textarea className="w-full border p-2 rounded" value={q.explanation} onChange={e => updateQuestion(q.id, { explanation: e.target.value })} />
                        </div>

                        <div>
                           <p className="text-sm font-bold mb-1">Ảnh giải thích (URL hoặc Base64):</p>
                           <input 
                              className="border p-2 rounded w-full text-xs" 
                              placeholder="https://... hoặc data:image/..."
                              value={q.explanationImage || ''} 
                              onChange={e => updateQuestion(q.id, { explanationImage: e.target.value })} 
                           />
                           {q.explanationImage && (
                              <div className="mt-2 p-2 bg-slate-100 rounded">
                                 {q.explanationImage.startsWith('data:') || q.explanationImage.startsWith('http') ? (
                                    <img src={q.explanationImage} alt="Explanation" className="max-w-xs h-auto rounded" />
                                 ) : (
                                    <p className="text-xs text-slate-600">🖼️ Ảnh sẽ được hiển thị khi xem đáp án</p>
                                 )}
                              </div>
                           )}
                        </div>
                        
                        <div className="pt-2 border-t flex justify-end">
                           <Button size="sm" variant="danger" onClick={() => removeQuestion(q.id)}>Xóa câu hỏi</Button>
                        </div>
                     </div>
                  ) : (
                     <div className="flex justify-between cursor-pointer items-center" onClick={() => setEditingQId(q.id)}>
                        <div className="flex gap-3 items-center overflow-hidden">
                           <span className="font-bold text-slate-500 whitespace-nowrap">Câu {idx + 1}</span>
                           <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">{q.category}</span>
                           <span className="text-slate-700 truncate">{q.text}</span>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded ml-2 whitespace-nowrap">{q.type}</span>
                     </div>
                  )}
               </div>
            ))}
            <Button className="w-full" variant="secondary" onClick={addQuestion}>+ Thêm câu hỏi</Button>
         </div>
      </div>
    </div>
  );
};
