import React, { useState, useEffect } from 'react';
import { Exam, ExamAttempt } from '../types';
import { Button } from './Button';
import { getAttempts } from '../services/dbService';

interface UserHistoryProps {
  exams: Exam[];
  onViewResult: (attempt: ExamAttempt) => void;
  onHome: () => void;
}

export const UserHistory: React.FC<UserHistoryProps> = ({ exams, onViewResult, onHome }) => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getAttempts();
      setAttempts(history.sort((a, b) => b.endTime - a.endTime));
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = filterType === 'all' 
    ? attempts 
    : attempts.filter(a => a.examType === filterType);

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeText = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '⭐ Xuất sắc';
    if (percentage >= 50) return '✅ Đạt';
    return '⚠️ Cần cố gắng';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-slate-600">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">📚 Lịch Sử Làm Bài</h1>
        <Button onClick={onHome} variant="secondary">Quay lại</Button>
      </div>

      {/* Filter */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex gap-4 items-center">
          <span className="font-bold text-slate-700">Lọc theo:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📊 Tất cả
          </button>
          <button
            onClick={() => setFilterType('TSA')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterType === 'TSA'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧠 TSA
          </button>
          <button
            onClick={() => setFilterType('HSA')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterType === 'HSA'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📚 HSA
          </button>
        </div>
      )}

      {/* History List */}
      {filteredAttempts.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-2xl font-bold text-slate-800 mb-2">Chưa làm bài nào</p>
          <p className="text-slate-600">Hãy chọn một đề thi để bắt đầu luyện tập</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => {
            const exam = exams.find(e => e.id === attempt.examId);
            const total = exams.length > 0 
              ? exams.find(e => e.id === attempt.examId)?.questions.length || 1 
              : 1;
            const percentage = Math.round((attempt.score / total) * 100);
            const timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 60000);

            return (
              <div
                key={attempt.id}
                className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{attempt.examTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        attempt.examType === 'TSA' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {attempt.examType === 'TSA' ? '🧠 TSA' : '📚 HSA'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      📅 {new Date(attempt.endTime).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {' • '}
                      ⏱️ {timeSpent} phút
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className={`text-center px-6 py-3 rounded-xl ${getScoreColor(attempt.score, total)}`}>
                      <div className="text-3xl font-bold">{attempt.score}/{total}</div>
                      <div className="text-sm font-bold">{percentage}%</div>
                      <div className="text-xs mt-1">{getGradeText(attempt.score, total)}</div>
                    </div>

                    <Button
                      onClick={() => onViewResult(attempt)}
                      variant="primary"
                      className="shadow-lg"
                    >
                      Xem Chi Tiết →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">{attempts.length}</div>
            <p className="text-slate-700 font-bold">Tổng bài làm</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {Math.round(
                (attempts.reduce((sum, a) => sum + a.score, 0) / 
                 (attempts.length * 10)) * 100
              )}%
            </div>
            <p className="text-slate-700 font-bold">Điểm trung bình</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {attempts.filter(a => a.examType === 'TSA').length}
            </div>
            <p className="text-slate-700 font-bold">Bài TSA</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {attempts.filter(a => a.examType === 'HSA').length}
            </div>
            <p className="text-slate-700 font-bold">Bài HSA</p>
          </div>
        </div>
      )}
    </div>
  );
};
