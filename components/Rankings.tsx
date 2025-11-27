import React, { useMemo, useState, useEffect } from 'react';
import { DailyLog, ClassEntity, RankingItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Trophy, Medal, AlertCircle, Calendar, X, User, CheckCircle2, Gift, ChevronLeft, ChevronRight } from 'lucide-react';

interface RankingsProps {
  logs: DailyLog[];
  classes: ClassEntity[];
}

type RankingViewType = 'week' | 'semester' | 'year';

export const Rankings: React.FC<RankingsProps> = ({ logs, classes }) => {
  const [viewType, setViewType] = useState<RankingViewType>('week');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  
  // State for detail modal
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Set default week to the latest week with data when logs load
  useEffect(() => {
    if (logs.length > 0) {
      const maxWeek = Math.max(...logs.map(l => l.week));
      // Only auto-update if we are on week 1 (likely default) and there is later data
      setSelectedWeek(prev => (prev === 1 && maxWeek > 1) ? maxWeek : prev);
    }
  }, [logs]);

  // Identify weeks that have data for visual cues
  const weeksWithData = useMemo(() => {
    return new Set(logs.map(l => l.week));
  }, [logs]);

  // Helper function to filter logs based on current view settings
  const getFilteredLogs = (allLogs: DailyLog[]) => {
    if (viewType === 'week') {
      return allLogs.filter(l => l.week === selectedWeek);
    } else if (viewType === 'semester') {
      if (selectedSemester === 1) {
        return allLogs.filter(l => l.week >= 1 && l.week <= 18);
      } else {
        return allLogs.filter(l => l.week >= 19 && l.week <= 35);
      }
    } 
    // viewType === 'year'
    return allLogs;
  };

  const rankingData = useMemo(() => {
    const filteredLogs = getFilteredLogs(logs);

    const data: RankingItem[] = classes.map(cls => {
      const classLogs = filteredLogs.filter(l => l.classId === cls.id);
      
      const totalScore = classLogs.reduce((acc, curr) => acc + curr.totalScore, 0);
      const violationCount = classLogs.reduce((acc, curr) => acc + curr.deductions.length, 0);
      
      return {
        classId: cls.id,
        className: cls.name,
        totalScore,
        violationCount,
        rank: 0, 
      };
    });

    // Sort by score descending
    data.sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign ranks
    data.forEach((item, index) => {
      item.rank = index + 1;
    });

    return data;
  }, [logs, classes, viewType, selectedWeek, selectedSemester]);

  const top3 = rankingData.slice(0, 3);

  const getMedalColor = (rank: number) => {
    switch(rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-slate-400';
      case 3: return 'text-amber-700';
      default: return 'text-slate-300';
    }
  };

  const getTitle = () => {
    if (viewType === 'week') return `Bảng Xếp Hạng Tuần ${selectedWeek}`;
    if (viewType === 'semester') return `Tổng Kết Học Kỳ ${selectedSemester}`;
    return 'Tổng Kết Cả Năm Học';
  };

  // Prepare data for the detail modal
  const selectedClassLogs = useMemo(() => {
    if (!selectedClassId) return [];
    const filtered = getFilteredLogs(logs);
    return filtered.filter(l => l.classId === selectedClassId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedClassId, logs, viewType, selectedWeek, selectedSemester]);

  const selectedClassInfo = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-8 relative">
      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-secondary-500" />
            {getTitle()}
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button
               onClick={() => setViewType('week')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition ${viewType === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
             >
               Theo Tuần
             </button>
             <button
               onClick={() => setViewType('semester')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition ${viewType === 'semester' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
             >
               Học Kỳ
             </button>
             <button
               onClick={() => setViewType('year')}
               className={`px-4 py-2 rounded-md text-sm font-bold transition ${viewType === 'year' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}
             >
               Cả Năm
             </button>
          </div>
        </div>

        {/* Filters specific to view type */}
        <div className="flex flex-wrap gap-4 items-center">
           {viewType === 'week' && (
             <div className="flex items-center gap-2">
               <label className="text-sm font-semibold text-slate-600 hidden sm:block">Chọn tuần:</label>
               
               <button 
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek <= 1}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Tuần trước"
               >
                 <ChevronLeft size={20} />
               </button>

               <select 
                 value={selectedWeek} 
                 onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                 className="p-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500 min-w-[120px]"
               >
                 {Array.from({length: 35}, (_, i) => i + 1).map(w => (
                   <option key={w} value={w}>
                     Tuần {w} {weeksWithData.has(w) ? '•' : ''}
                   </option>
                 ))}
               </select>

               <button 
                onClick={() => setSelectedWeek(Math.min(35, selectedWeek + 1))}
                disabled={selectedWeek >= 35}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Tuần sau"
               >
                 <ChevronRight size={20} />
               </button>

               <span className="text-xs text-slate-400 italic ml-2 hidden sm:inline">
                 (Có dữ liệu: •)
               </span>
             </div>
           )}

           {viewType === 'semester' && (
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setSelectedSemester(1)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold border ${selectedSemester === 1 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               >
                 Học Kỳ 1 (Tuần 1-18)
               </button>
               <button 
                 onClick={() => setSelectedSemester(2)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold border ${selectedSemester === 2 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               >
                 Học Kỳ 2 (Tuần 19-35)
               </button>
             </div>
           )}
           
           {viewType === 'year' && (
             <span className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar size={16} />
                Dữ liệu tổng hợp từ Tuần 1 đến Tuần 35
             </span>
           )}
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((item) => (
          <div 
            key={item.classId} 
            onClick={() => setSelectedClassId(item.classId)}
            className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-primary-500 flex flex-col items-center relative overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition group"
          >
             <div className={`absolute top-0 right-0 p-4 opacity-10 ${getMedalColor(item.rank)}`}>
               <Medal size={100} />
             </div>
             <div className={`text-4xl font-black mb-2 ${getMedalColor(item.rank)}`}>
               #{item.rank}
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-1">Lớp {item.className}</h3>
             <div className="text-3xl font-bold text-primary-600">{item.totalScore} <span className="text-sm font-normal text-slate-500">điểm</span></div>
             <div className="mt-4 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition">
               {item.violationCount === 0 ? 'Xuất sắc! Không có lỗi' : `${item.violationCount} lỗi vi phạm`}
             </div>
             <div className="absolute bottom-2 text-xs text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition">
                Nhấn để xem chi tiết
             </div>
          </div>
        ))}
         {top3.length === 0 && (
           <div className="col-span-3 text-center py-10 text-slate-400 italic bg-white rounded-xl border border-slate-100">
             Chưa có dữ liệu cho khoảng thời gian này.
           </div>
         )}
      </div>

      {/* Chart */}
      {rankingData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Biểu đồ thi đua</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="className" axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="totalScore" radius={[4, 4, 0, 0]}>
                {rankingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Full Table */}
      {rankingData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Hạng</th>
                  <th className="p-4">Lớp</th>
                  <th className="p-4 text-center">Tổng Điểm</th>
                  <th className="p-4 text-center">Số lỗi</th>
                  <th className="p-4 text-right">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rankingData.map((item) => (
                  <tr 
                    key={item.classId} 
                    onClick={() => setSelectedClassId(item.classId)}
                    className="hover:bg-primary-50/50 transition cursor-pointer"
                  >
                    <td className="p-4 font-bold text-slate-500">#{item.rank}</td>
                    <td className="p-4 font-bold text-slate-800">{item.className}</td>
                    <td className="p-4 text-center font-bold text-primary-600">{item.totalScore}</td>
                    <td className="p-4 text-center text-slate-600">{item.violationCount}</td>
                    <td className="p-4 text-right">
                       {/* Logic đánh giá sơ bộ */}
                      {item.totalScore >= (viewType === 'week' ? 95 : 95 * (viewType === 'semester' ? 18 : 35)) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tốt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Khá
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedClassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedClassId(null)}>
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary-600 p-6 flex justify-between items-start text-white">
               <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    Lớp {selectedClassInfo?.name}
                    <span className="text-sm font-normal opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                      {viewType === 'week' ? `Tuần ${selectedWeek}` : viewType === 'semester' ? `Học kỳ ${selectedSemester}` : 'Cả năm'}
                    </span>
                  </h3>
                  <p className="opacity-90 mt-1">Chi tiết các lỗi vi phạm và điểm số</p>
               </div>
               <button onClick={() => setSelectedClassId(null)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition">
                 <X size={24} />
               </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               {selectedClassLogs.length === 0 ? (
                 <div className="text-center py-12 flex flex-col items-center text-slate-400">
                    <CheckCircle2 size={48} className="text-green-500 mb-4" />
                    <p className="text-lg font-bold text-slate-700">Tuyệt vời!</p>
                    <p>Lớp không có phiếu chấm phạt nào trong thời gian này.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {selectedClassLogs.map((log) => (
                     <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                           <div className="flex items-center gap-2">
                             <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                               Tuần {log.week}
                             </span>
                             <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                               <Calendar size={14} className="text-slate-400" /> {log.date}
                             </span>
                           </div>
                           <div className="text-sm text-slate-500 flex items-center gap-1">
                              <User size={14} /> {log.reporterName}
                           </div>
                        </div>
                        
                        {log.deductions.length > 0 ? (
                          <div className="space-y-2 mb-3">
                             {log.deductions.map((d, idx) => (
                               <div key={idx} className="flex items-start gap-2 text-sm">
                                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                  <div className="flex-1">
                                    <span className="text-slate-700 font-medium">Lỗi: </span>
                                    <span className="text-slate-600">{d.note || "Vi phạm quy định"}</span>
                                  </div>
                                  <span className="font-bold text-red-600">-{d.pointsLost}đ</span>
                               </div>
                             ))}
                          </div>
                        ) : (
                           // If no deductions and no bonus, it's a perfect day. If bonus, we show below.
                           log.bonusPoints === 0 && (
                            <p className="text-sm text-green-600 italic mb-3 flex items-center gap-1">
                              <CheckCircle2 size={16} /> Không có lỗi vi phạm.
                            </p>
                           )
                        )}

                        {log.bonusPoints > 0 && (
                          <div className="mb-3 flex items-start gap-2 text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                             <Gift size={16} className="text-green-600 mt-0.5 shrink-0" />
                             <div className="flex-1">
                               <span className="text-green-700 font-bold">Điểm cộng: </span>
                               <span className="text-green-600">Thành tích tốt / Khen thưởng</span>
                             </div>
                             <span className="font-bold text-green-600">+{log.bonusPoints}đ</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                           <p className="text-sm text-slate-500 italic flex-1 mr-4">"{log.comment}"</p>
                           <div className="bg-primary-50 text-primary-700 font-bold px-3 py-1 rounded-lg">
                             {log.totalScore} điểm
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
               <span className="text-slate-500">Tổng số phiếu: <strong className="text-slate-800">{selectedClassLogs.length}</strong></span>
               <div className="flex gap-4 flex-wrap justify-center">
                  <span className="text-slate-500">Tổng lỗi: <strong className="text-red-600">{selectedClassLogs.reduce((acc, l) => acc + l.deductions.length, 0)}</strong></span>
                  <span className="text-slate-500">Tổng thưởng: <strong className="text-green-600">{selectedClassLogs.reduce((acc, l) => acc + (l.bonusPoints || 0), 0)}</strong></span>
                  <span className="text-slate-500">Tổng điểm: <strong className="text-primary-600">{selectedClassLogs.reduce((acc, l) => acc + l.totalScore, 0)}</strong></span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};