import React, { useEffect, useState } from 'react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ durationMinutes, onTimeUp, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeUp]);

  useEffect(() => {
    // Warning when less than 5 minutes left
    setIsWarning(timeLeft < 300 && timeLeft > 0);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-mono font-bold text-2xl transition-all ${
        isWarning
          ? 'bg-red-100 text-red-600 animate-pulse border-2 border-red-400'
          : 'bg-blue-100 text-blue-600 border-2 border-blue-300'
      }`}
    >
      <span className={isWarning ? 'animate-bounce' : ''}>⏱️</span>
      <span>
        {displayMinutes}:{displaySeconds}
      </span>
      {isWarning && <span className="animate-spin ml-2">⚠️</span>}
    </div>
  );
};
