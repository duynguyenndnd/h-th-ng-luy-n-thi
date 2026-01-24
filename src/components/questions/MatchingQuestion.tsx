import React from 'react';

interface MatchingQuestionProps {
  question: any;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({ question, value, onChange, disabled }) => {
  const handleMatch = (leftId: string, rightVal: string) => {
    onChange({ ...value, [leftId]: rightVal });
  };

  const leftLabels = question.matchingPairs || [];
  const rightOptions = [...leftLabels].map((p: any) => p.right).sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-8 bg-slate-50 p-4 rounded-t-2xl border-x border-t border-slate-200">
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">{question.leftLabel || 'Vế A'}</div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">{question.rightLabel || 'Vế B'}</div>
      </div>
      <div className="space-y-3">
        {leftLabels.map((pair: any) => (
          <div key={pair.id} className="grid grid-cols-2 gap-8 items-center">
            <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm">
              {pair.left}
            </div>
            <select
              className="p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-indigo-600 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
              value={value[pair.id] || ''}
              onChange={(e) => handleMatch(pair.id, e.target.value)}
              disabled={disabled}
            >
              <option value="">-- Chọn ghép nối --</option>
              {rightOptions.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};
