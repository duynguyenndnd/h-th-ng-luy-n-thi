import React from 'react';

interface MultipleSelectQuestionProps {
  question: any;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const MultipleSelectQuestion: React.FC<MultipleSelectQuestionProps> = ({ question, value = [], onChange, disabled }) => {
  const toggleOption = (opt: string) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {question.options?.map((opt: string, i: number) => (
        <button
          key={i}
          onClick={() => toggleOption(opt)}
          disabled={disabled}
          className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-2 flex items-center gap-4 ${
            value.includes(opt)
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg'
              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${value.includes(opt) ? 'bg-white text-indigo-600 border-white' : 'border-slate-300'}`}>
            {value.includes(opt) && '✓'}
          </div>
          {opt}
        </button>
      ))}
    </div>
  );
};
