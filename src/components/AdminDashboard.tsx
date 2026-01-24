import React, { useState, useEffect } from 'react';
import { Exam, ExamAttempt, User } from '../types';
import { Button } from './Button';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

interface AdminDashboardProps {
  exams: Exam[];
  onHome: () => void;
}

interface UserStats {
  userId: string;
  fullName: string;
  email: string;
  attemptCount: number;
  averageScore: number;
  completedExams: {
    examId: string;
    examTitle: string;
    score: number;
    percentage: number;
    timestamp: number;
  }[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ exams, onHome }) => {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterExamType, setFilterExamType] = useState<string>('all');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Query all exam attempts from Firestore
      const attemptsQuery = query(collection(db, 'examAttempts'));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      // Query all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersMap = new Map<string, any>();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      // Aggregate attempts by user
      const statsMap = new Map<string, UserStats>();
      
      attemptsSnapshot.docs.forEach(doc => {
        const attempt = doc.data() as any;
        const userId = attempt.userId || 'unknown';
        const user = usersMap.get(userId);
        
        if (!statsMap.has(userId)) {
          statsMap.set(userId, {
            userId,
            fullName: user?.fullName || 'Unknown User',
            email: user?.email || 'unknown@example.com',
            attemptCount: 0,
            averageScore: 0,
            completedExams: []
          });
        }
        
        const stats = statsMap.get(userId)!;
        stats.attemptCount++;
        stats.completedExams.push({
          examId: attempt.examId,
          examTitle: attempt.examTitle,
          score: attempt.score || 0,
          percentage: Math.round(((attempt.score || 0) / 10) * 100),
          timestamp: attempt.endTime || attempt.timestamp || Date.now()
        });
      });

      // Calculate averages
      const finalStats = Array.from(statsMap.values()).map(stats => ({
        ...stats,
        averageScore: Math.round(
          stats.completedExams.reduce((sum, e) => sum + e.score, 0) / 
          (stats.completedExams.length || 1)
        ),
        completedExams: stats.completedExams.sort((a, b) => b.timestamp - a.timestamp)
      }));

      setUserStats(finalStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-slate-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  const totalAttempts = userStats.reduce((sum, s) => sum + s.attemptCount, 0);
  const totalUsers = userStats.length;
  const avgScoreOverall = Math.round(
    userStats.reduce((sum, s) => sum + (s.averageScore * s.attemptCount), 0) / 
    (totalAttempts || 1)
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">📊 Dashboard Admin</h1>
        <Button onClick={onHome} variant="secondary">Quay lại</Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-md">
          <div className="text-4xl font-bold text-blue-600 mb-2">{totalUsers}</div>
          <p className="text-slate-700 font-bold">Tổng học sinh</p>
          <p className="text-sm text-slate-600 mt-2">Đã đăng ký hệ thống</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-md">
          <div className="text-4xl font-bold text-green-600 mb-2">{totalAttempts}</div>
          <p className="text-slate-700 font-bold">Tổng lần làm bài</p>
          <p className="text-sm text-slate-600 mt-2">Hoàn thành toàn bộ</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-md">
          <div className="text-4xl font-bold text-purple-600 mb-2">{exams.length}</div>
          <p className="text-slate-700 font-bold">Tổng đề thi</p>
          <p className="text-sm text-slate-600 mt-2">Đã tạo trong hệ thống</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-md">
          <div className="text-4xl font-bold text-orange-600 mb-2">{avgScoreOverall}%</div>
          <p className="text-slate-700 font-bold">Điểm trung bình</p>
          <p className="text-sm text-slate-600 mt-2">Toàn bộ hệ thống</p>
        </div>
      </div>

      {/* User Performance Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">👥 Hiệu Suất Học Sinh</h2>
        </div>

        <div className="overflow-x-auto">
          {userStats.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <p className="text-lg font-bold mb-2">📊 Chưa có dữ liệu</p>
              <p>Chưa có học sinh nào thực hiện bài thi</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Học sinh</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Bài làm</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Điểm TB</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Đề gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {userStats.map((stats) => {
                  const latestExam = stats.completedExams[0];
                  return (
                    <tr key={stats.userId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{stats.fullName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{stats.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                          {stats.attemptCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                          stats.averageScore >= 80 
                            ? 'bg-green-100 text-green-700' 
                            : stats.averageScore >= 50 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {stats.averageScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {latestExam && (
                          <div>
                            <div className="font-bold text-slate-800">{latestExam.examTitle}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(latestExam.timestamp).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-xs font-bold text-slate-600 mt-1">
                              {latestExam.percentage}%
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed User Exams */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">📋 Chi Tiết Hoạt Động</h2>
        {userStats.map((stats) => (
          <div 
            key={stats.userId} 
            className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-lg">👤</span> {stats.fullName}
                <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">{stats.email}</span>
              </h3>
            </div>
            
            <div className="p-4">
              {stats.completedExams.length === 0 ? (
                <p className="text-slate-600 text-sm">Chưa hoàn thành bài thi nào</p>
              ) : (
                <div className="space-y-2">
                  {stats.completedExams.map((exam, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{exam.examTitle}</p>
                        <p className="text-xs text-slate-600">
                          📅 {new Date(exam.timestamp).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-bold text-white ${
                        exam.percentage >= 80 
                          ? 'bg-green-500' 
                          : exam.percentage >= 50 
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}>
                        {exam.score}/10 ({exam.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
