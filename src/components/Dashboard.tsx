import React, { useState } from 'react';
import { Exam, ExamType, UserRole } from '../types';
import { Button } from './Button';
import { ExamType as ExamTypeEnum } from '../types';

interface DashboardProps {
  exams: Exam[];
  userRole?: UserRole | null;
  onCreateExam: () => void;
  onImportExam: () => void;
  onManageUsers?: () => void;
  onViewHistory?: () => void;
  onViewAdminDashboard?: () => void;
  onRefresh?: () => Promise<void>;
  onPublishExam?: (examId: string) => Promise<void>;
  onSelectExam: (exam: Exam, mode: 'run' | 'edit') => void;
  onDeleteExam: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  exams, 
  userRole, 
  onCreateExam,
  onImportExam,
  onManageUsers,
  onViewHistory,
  onViewAdminDashboard,
  onRefresh,
  onPublishExam,
  onSelectExam, 
  onDeleteExam 
}) => {
  const [filterType, setFilterType] = useState<ExamType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [publishingExamId, setPublishingExamId] = useState<string | null>(null);

  const filteredExams = exams.filter(exam => {
    const matchesType = filterType === 'all' || exam.type === filterType;
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const canEdit = userRole === 'admin' || userRole === 'teacher';

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2">🎓 Bảng Điều Khiển</h1>
            <p className="text-indigo-100 text-lg font-medium">Chào mừng trở lại, {userRole === 'admin' ? '👨‍🏫 Admin' : '👨‍🎓 Học sinh'}!</p>
          </div>
          {onRefresh && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await onRefresh();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all"
              title="Làm mới danh sách đề"
            >
              {isRefreshing ? '⏳' : '🔄'} Làm mới
            </button>
          )}
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-4 flex-wrap">
          {canEdit && (
            <>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={onCreateExam}
                className="!bg-white !text-purple-600 !border-0 font-bold"
              >
                ➕ Tạo Đề Mới
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={onImportExam}
                className="!bg-white !text-purple-600 !border-0 font-bold"
              >
                📥 Import Đề
              </Button>
              {userRole === 'admin' && onManageUsers && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={onManageUsers}
                  className="!bg-white !text-purple-600 !border-0 font-bold"
                >
                  👥 Quản Lý Tài Khoản
                </Button>
              )}
              {userRole === 'admin' && onViewAdminDashboard && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={onViewAdminDashboard}
                  className="!bg-white !text-purple-600 !border-0 font-bold"
                >
                  📊 Thống Kê Admin
                </Button>
              )}
              {onViewHistory && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={onViewHistory}
                  className="!bg-white !text-purple-600 !border-0 font-bold"
                >
                  📚 Lịch Sử Làm Bài
                </Button>
              )}
            </>
          )}
          <div className="text-indigo-100 text-sm font-semibold flex items-center gap-2">
            📊 Tổng: <span className="text-white text-base font-black">{exams.length} đề</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap items-center">
            {['all', ExamTypeEnum.TSA, ExamTypeEnum.HSA].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? '📚 Tất Cả' : type === ExamTypeEnum.TSA ? '🧠 TSA' : '📐 HSA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(exam => {
          // Check if exam is published (will be uploaded to Firebase)
          const isPublished = exam.createdAt && exam.type; // Published exams have these fields set properly
          
          return (
          <div key={exam.id} className="group bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            {/* Draft/Published badge */}
            {userRole === 'admin' && (
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold ${
                isPublished 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isPublished ? '✅ Công khai' : '🔒 Nháp'}
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-inner ${
              exam.type === ExamTypeEnum.TSA ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {exam.type === ExamTypeEnum.TSA ? '🧠' : '📐'}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
              {exam.title}
            </h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
              {exam.description || 'Chưa có mô tả cho đề thi này.'}
            </p>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                {exam.type}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                {exam.questions.length} Câu hỏi
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <Button 
                variant="primary" 
                className="w-full font-bold shadow-md"
                onClick={() => onSelectExam(exam, 'run')}
              >
                🎯 Luyện Tập
              </Button>

              {canEdit && (
                <div className="flex gap-2">
                  {/* Publish button - only show if admin and not published */}
                  {userRole === 'admin' && !isPublished && onPublishExam && (
                    <Button
                      variant="secondary"
                      className="flex-1 !bg-green-600 !text-white hover:!bg-green-700 shadow-md"
                      onClick={async () => {
                        setPublishingExamId(exam.id);
                        await onPublishExam(exam.id);
                        setPublishingExamId(null);
                      }}
                      disabled={publishingExamId === exam.id}
                    >
                      {publishingExamId === exam.id ? '⏳ Đang tải...' : '📤 Tải Lên'}
                    </Button>
                  )}

                  {/* Edit button */}
                  <Button 
                    variant="secondary" 
                    className="!px-3 shadow-md"
                    onClick={() => onSelectExam(exam, 'edit')}
                  >
                    ✏️
                  </Button>

                  {/* Delete button */}
                  <Button 
                    variant="danger" 
                    className="!px-3 shadow-md"
                    onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
                            onDeleteExam(exam.id);
                        }
                    }}
                  >
                    🗑️
                  </Button>
                </div>
              )}
            </div>
          </div>
          );
        })}

        {filteredExams.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-bold text-slate-400">Không tìm thấy đề thi nào phù hợp</h3>
          </div>
        )}
      </div>
    </div>
  );
};
