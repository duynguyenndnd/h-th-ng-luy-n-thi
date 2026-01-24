import React from 'react';

interface TrueFalseExplainQuestionProps {
  question: any;
  value: { choice: boolean | null; explanation: string };
  onChange: (value: { choice: boolean | null; explanation: string }) => void;
  disabled?: boolean;
}

export const TrueFalseExplainQuestion: React.FC<TrueFalseExplainQuestionProps> = ({ question, value, onChange, disabled }) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {[true, false].map((choice) => (
          <button
            key={String(choice)}
            onClick={() => onChange({ ...value, choice })}
            disabled={disabled}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg transition-all border-2 ${
              value.choice === choice
                ? choice
                  ? 'bg-green-500 text-white border-green-600 shadow-lg'
                  : 'bg-red-500 text-white border-red-600 shadow-lg'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {choice ? (question.trueText || 'Đúng') : (question.falseText || 'Sai')}
          </button>
        ))}
      </div>
      
      {question.requiresExplanation && (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
            Giải thích lựa chọn của bạn:
          </label>
          <textarea
            className="w-full h-32 p-4 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none font-medium"
            placeholder="Tại sao bạn chọn như vậy?..."
            value={value.explanation || ''}
            onChange={(e) => onChange({ ...value, explanation: e.target.value })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};
