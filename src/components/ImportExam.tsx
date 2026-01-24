import React, { useState } from 'react';
import { Exam } from '../types';
import { Button } from './Button';
import { parseJSONExam, parseCSVExam } from '../services/fileParser';

interface ImportExamViewProps {
  onBack: () => void;
  onImportSuccess: (exam: Exam) => Promise<void>;
}

export const ImportExamView: React.FC<ImportExamViewProps> = ({ onBack, onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess(false);
    setStatusMessage('');

    try {
      setStatusMessage('📖 Đang đọc file...');
      const content = await file.text();
      let exam: Exam | null = null;

      if (file.name.endsWith('.json')) {
        // Use the proper JSON parser that handles math symbols
        exam = parseJSONExam(content);
      } else if (file.name.endsWith('.csv')) {
        exam = parseCSVExam(content, file.name);
      }

      if (!exam) {
        throw new Error('Không thể đọc file. Vui lòng kiểm tra định dạng.');
      }

      // Validate exam object
      if (!exam.id) {
        console.error('Exam object missing id:', exam);
        throw new Error('Lỗi: Đề thi không có ID. Vui lòng kiểm tra file.');
      }

      if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
        throw new Error('Đề thi phải có ít nhất 1 câu hỏi.');
      }

      // Validate all questions have IDs
      const missingIds = exam.questions.filter(q => !q.id);
      if (missingIds.length > 0) {
        console.error('Questions missing IDs:', missingIds);
        throw new Error(`Lỗi: ${missingIds.length} câu hỏi không có ID.`);
      }

      console.log('✅ Exam validation passed:', {
        id: exam.id,
        title: exam.title,
        questionCount: exam.questions.length
      });

      setStatusMessage('💾 Đang lưu lên hệ thống...');
      // Call the async import success handler (which now uploads to Firebase)
      await onImportSuccess(exam);
      
      setSuccess(true);
      setStatusMessage('✅ Import thành công! Đề thi đã được lưu lên server và các user khác sẽ thấy ngay.');
      
      // Auto-redirect after 2 seconds
      setTimeout(onBack, 2000);
    } catch (err: any) {
      console.error('❌ Import error:', err);
      setError(err.message || 'Lỗi khi import đề thi');
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">📥 Import Đề Thi</h2>
        <Button variant="secondary" onClick={onBack}>Quay lại</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Tải lên đề thi của bạn</h3>
          <p className="text-slate-500 mb-8">Hỗ trợ định dạng JSON hoặc CSV</p>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {loading ? 'Đang tải...' : 'Chọn file'}
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200 text-red-700 font-bold">
            ❌ {error}
          </div>
        )}

        {statusMessage && !success && (
          <div className="p-4 bg-blue-50 border-t border-blue-200 text-blue-700 font-bold">
            {statusMessage}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-t border-green-200 text-green-700 font-bold">
            {statusMessage}
          </div>
        )}

        <div className="p-8 space-y-6 text-slate-600 text-sm">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-semibold mb-2">💡 Gợi ý:</p>
            <p className="text-sm text-blue-700">Xem file <code className="bg-blue-100 px-2 py-1 rounded">JSON_FORMAT_GUIDE.md</code> để biết chi tiết định dạng của tất cả 10 loại câu hỏi</p>
            <p className="text-sm text-blue-700">Hoặc download file mẫu <code className="bg-blue-100 px-2 py-1 rounded">sample-all-question-types.json</code> trong thư mục gốc</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-2">📋 Định dạng JSON cơ bản:</h4>
            <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-200">{`{
  "title": "Tên đề thi",
  "description": "Mô tả",
  "type": "TSA",
  "durationMinutes": 150,
  "questions": [
    {
      "type": "multiple_choice",
      "text": "Câu hỏi?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Giải thích"
    }
  ]
}`}
{`{
  "title": "Đề thi mẫu",
  "description": "Mô tả",
  "type": "TSA",
  "durationMinutes": 60,
  "questions": [
    {
      "text": "Câu hỏi?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "type": "multiple_choice"
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-2">� Các loại câu hỏi được hỗ trợ:</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>✓ <strong>multiple_choice</strong> - Trắc nghiệm đơn (chọn 1)</li>
              <li>✓ <strong>true_false</strong> - Đúng/Sai</li>
              <li>✓ <strong>multiple_select</strong> - Trắc nghiệm phức hợp (chọn nhiều)</li>
              <li>✓ <strong>fill_in_blank</strong> - Điền khuyết</li>
              <li>✓ <strong>short_answer</strong> - Câu hỏi ngắn</li>
              <li>✓ <strong>essay</strong> - Tự luận</li>
              <li>✓ <strong>ordering</strong> - Sắp xếp thứ tự</li>
              <li>✓ <strong>matching</strong> - Ghép đôi</li>
              <li>✓ <strong>true_false_explain</strong> - Đúng/Sai + giải thích</li>
              <li>✓ <strong>reading</strong> - Đọc hiểu văn bản</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-2">📊 Ví dụ Định dạng CSV:</h4>
            <p className="mb-3">Cột: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer</p>
            <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-200">
{`Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer
Câu 1?,Option1,Option2,Option3,Option4,Option1
Câu 2?,Option1,Option2,Option3,Option4,Option2`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
