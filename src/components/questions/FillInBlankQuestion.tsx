import React from 'react';

interface FillInBlankQuestionProps {
  question: any;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const FillInBlankQuestion: React.FC<FillInBlankQuestionProps> = ({ question, value, onChange, disabled }) => {
  const parts = question.text.split(question.blankPlaceholder || '[____]');
  
  const handleInputChange = (index: number, text: string) => {
    const newValue = [...value];
    while (newValue.length <= index) newValue.push('');
    newValue[index] = text;
    onChange(newValue);
  };

  return (
    <div className="leading-relaxed text-lg font-medium p-6 bg-slate-50 rounded-2xl border border-slate-200">
      {parts.map((part: string, index: number) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <input
              type="text"
              className="mx-2 px-3 py-1 border-b-2 border-slate-300 focus:border-indigo-500 outline-none w-32 text-center bg-transparent transition-all"
              value={value[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={disabled}
              placeholder="..."
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
