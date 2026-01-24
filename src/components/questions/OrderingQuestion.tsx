import React from 'react';

interface OrderingQuestionProps {
  question: any;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({ question, value = [], onChange, disabled }) => {
  const items = value.length > 0 ? value : (question.options || []);

  const moveItem = (from: number, to: number) => {
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-500 uppercase text-center mb-4">
        Sử dụng nút mũi tên để sắp xếp theo thứ tự đúng
      </div>
      {items.map((item: string, i: number) => (
        <div key={i} className="flex gap-2 items-center">
           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500">
            {i + 1}
          </div>
          <div className="flex-1 p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm flex justify-between items-center">
            {item}
            <div className="flex gap-1">
              <button disabled={disabled || i === 0} onClick={() => moveItem(i, i - 1)} className="p-2 hover:bg-slate-100 rounded-lg text-lg">↑</button>
              <button disabled={disabled || i === items.length - 1} onClick={() => moveItem(i, i + 1)} className="p-2 hover:bg-slate-100 rounded-lg text-lg">↓</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
