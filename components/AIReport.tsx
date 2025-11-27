import React, { useState } from 'react';
import { DailyLog, ClassEntity } from '../types';
import { generateWeeklyReport } from '../services/geminiService';
import { Sparkles, Copy, Check } from 'lucide-react';

interface AIReportProps {
  logs: DailyLog[];
  classes: ClassEntity[];
}

export const AIReport: React.FC<AIReportProps> = ({ logs, classes }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (logs.length === 0) {
      alert("Chưa có dữ liệu chấm điểm để tạo báo cáo.");
      return;
    }
    setLoading(true);
    setReport('');
    const result = await generateWeeklyReport(logs, classes);
    setReport(result);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
        <Sparkles size={48} className="mb-4 text-yellow-300 animate-pulse" />
        <h2 className="text-3xl font-bold mb-2">Trợ Lý AI Sao Đỏ</h2>
        <p className="text-indigo-100 mb-6 max-w-lg">
          Tự động tổng hợp số liệu, phân tích các lỗi vi phạm và soạn thảo bài phát biểu chào cờ chỉ trong vài giây.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang phân tích dữ liệu...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Tạo Báo Cáo Tuần
            </>
          )}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Nội dung báo cáo</h3>
            <button 
              onClick={handleCopy}
              className="text-slate-500 hover:text-primary-600 transition flex items-center gap-1 text-sm font-medium"
            >
              {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
              {report}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};