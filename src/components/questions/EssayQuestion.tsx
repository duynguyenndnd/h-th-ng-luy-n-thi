import React from 'react';

interface EssayQuestionProps {
  question: any;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const EssayQuestion: React.FC<EssayQuestionProps> = ({ question, value, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 italic text-blue-800 text-sm">
        <strong>Yêu cầu:</strong> {question.essayRequirements}
      </div>
      <textarea
        className="w-full h-64 p-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none font-medium"
        placeholder="Viết câu trả lời của bạn tại đây..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <div className="text-right text-xs font-bold text-slate-400">
        Số ký tự: {value.length}
      </div>
    </div>
  );
};
