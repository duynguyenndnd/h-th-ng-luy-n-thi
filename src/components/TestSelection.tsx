import React, { useState } from 'react';
import { Exam } from '../types';
import { Button } from './Button';

interface TestSelectionProps {
  exam: Exam;
  onSelectSection: (sectionId: string, selectedTopics?: string[]) => void;
  onCancel: () => void;
}

export const TestSelection: React.FC<TestSelectionProps> = ({ exam, onSelectSection, onCancel }) => {
  const [selectedScience, setSelectedScience] = useState<string[]>([]);
  const [chosenSection, setChosenSection] = useState<string | null>(null);

  // Define exam sections (HSA format)
  const sections = [
    {
      id: 'section1',
      name: '📐 Phần 1: Toán học & Xử lý số liệu',
      subtitle: 'Tư duy định lượng',
      duration: 75,
      questions: 50,
      details: '35 câu trắc nghiệm + 15 câu điền đáp án'
    },
    {
      id: 'section2',
      name: '📚 Phần 2: Văn học - Ngôn ngữ',
      subtitle: 'Tư duy định tính',
      duration: 60,
      questions: 50,
      details: '50 câu trắc nghiệm khách quan'
    },
    {
      id: 'section3',
      name: '🔬 Phần 3: Khoa học hoặc Tiếng Anh',
      subtitle: 'Tự chọn',
      duration: 60,
      questions: 50,
      details: '50 câu trắc nghiệm & điền đáp án',
      hasChoice: true
    }
  ];

  const scienceTopics = [
    { id: 'physics', name: '⚡ Vật lí', icon: '🔬' },
    { id: 'chemistry', name: '🧪 Hóa học', icon: '🧬' },
    { id: 'biology', name: '🦠 Sinh học', icon: '🌿' },
    { id: 'history', name: '📜 Lịch sử', icon: '🏛️' },
    { id: 'geography', name: '🌍 Địa lí', icon: '🗺️' }
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'section3') {
      setChosenSection(sectionId);
    } else {
      onSelectSection(sectionId);
    }
  };

  const handleScienceSelect = (topicId: string) => {
    setSelectedScience(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(t => t !== topicId);
      } else if (prev.length < 3) {
        return [...prev, topicId];
      }
      return prev;
    });
  };

  const handleStartScience = () => {
    if (selectedScience.length === 3) {
      onSelectSection('section3', selectedScience);
    }
  };

  if (chosenSection === 'section3') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <h1 className="text-4xl font-black mb-2">🔬 Phần 3: Chọn Khoa học hoặc Tiếng Anh</h1>
            <p className="text-purple-100 text-lg">Hãy chọn 3 trong 5 chủ đề Khoa học</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-bold">⏰ Thời gian:</span> 60 phút | 
                <span className="font-bold ml-3">📝 Câu hỏi:</span> 50 câu
              </p>
            </div>

            {/* Science Topics Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-800">Chọn 3 chủ đề (Đã chọn: {selectedScience.length}/3)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {scienceTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleScienceSelect(topic.id)}
                    className={`p-4 rounded-xl font-bold transition-all border-2 ${
                      selectedScience.includes(topic.id)
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-600 shadow-lg scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{topic.icon}</div>
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Or English Option */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Hoặc</h2>
              <button
                onClick={() => onSelectSection('section3-english')}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-3xl mb-2">🇬🇧</div>
                <p className="font-bold text-lg text-slate-800">Tiếng Anh</p>
                <p className="text-sm text-slate-600">Đánh giá năng lực ngôn ngữ theo khung 6 bậc dành cho Việt Nam</p>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setChosenSection(null)}
                variant="secondary"
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleStartScience}
                disabled={selectedScience.length !== 3}
                variant="primary"
                className="flex-1"
              >
                ✨ Bắt đầu làm bài
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-2">🎯 Lựa chọn phần thi</h1>
        <p className="text-slate-600 text-lg">Hãy chọn phần bạn muốn làm bài thi</p>
      </div>

      {/* Total Time Info */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">⏱️ Tổng thời gian thi</p>
            <p className="text-3xl font-black">195 phút (3 giờ 15 phút)</p>
          </div>
          <div className="text-5xl">⏳</div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sections.map(section => (
          <div
            key={section.id}
            onClick={() => handleSectionClick(section.id)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer overflow-hidden border-2 border-transparent hover:border-purple-300"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-black mb-1">{section.name}</h2>
              <p className="text-purple-100 text-sm">{section.subtitle}</p>
            </div>

            {/* Section Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-slate-700">
                  <span className="text-2xl">⏱️</span>
                  <span className="font-bold">{section.duration} phút</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <span className="text-2xl">📝</span>
                  <span className="font-bold">{section.questions} câu hỏi</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                {section.details}
              </div>

              {section.hasChoice && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                  ⚠️ Có lựa chọn (Khoa học hoặc Tiếng Anh)
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
              >
                Chọn phần này →
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          onClick={onCancel}
          variant="secondary"
          className="px-8"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
};
