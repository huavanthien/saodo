import React, { useMemo, useState, useEffect } from 'react';
import { DailyLog, ClassEntity, RankingItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Trophy, Medal, AlertCircle, Calendar, X, User, CheckCircle2, Gift, ChevronLeft, ChevronRight, Crown, BarChart3 } from 'lucide-react';

interface RankingsProps {
  logs: DailyLog[];
  classes: ClassEntity[];
}

type RankingViewType = 'week' | 'semester' | 'year';

export const Rankings: React.FC<RankingsProps> = ({ logs, classes }) => {
  const [viewType, setViewType] = useState<RankingViewType>('week');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Set default week
  useEffect(() => {
    if (logs.length > 0) {
      const maxWeek = Math.max(...logs.map(l => l.week));
      setSelectedWeek(prev => (prev === 1 && maxWeek > 1) ? maxWeek : prev);
    }
  }, [logs]);

  const weeksWithData = useMemo(() => {
    return new Set(logs.map(l => l.week));
  }, [logs]);

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

    data.sort((a, b) => b.totalScore - a.totalScore);
    
    data.forEach((item, index) => {
      item.rank = index + 1;
    });

    return data;
  }, [logs, classes, viewType, selectedWeek, selectedSemester]);

  const top3 = rankingData.slice(0, 3);

  const getRankStyles = (rank: number) => {
    switch(rank) {
      case 1: return {
        bg: 'bg-gradient-to-b from-yellow-100 to-white',
        border: 'border-yellow-400',
        text: 'text-yellow-700',
        icon: 'text-yellow-500',
        shadow: 'shadow-yellow-200/50',
        badge: 'bg-yellow-100 text-yellow-800'
      };
      case 2: return {
        bg: 'bg-gradient-to-b from-slate-100 to-white',
        border: 'border-slate-300',
        text: 'text-slate-700',
        icon: 'text-slate-400',
        shadow: 'shadow-slate-200/50',
        badge: 'bg-slate-100 text-slate-800'
      };
      case 3: return {
        bg: 'bg-gradient-to-b from-orange-50 to-white',
        border: 'border-orange-300',
        text: 'text-orange-800',
        icon: 'text-orange-500',
        shadow: 'shadow-orange-200/50',
        badge: 'bg-orange-100 text-orange-800'
      };
      default: return {
        bg: 'bg-white',
        border: 'border-slate-100',
        text: 'text-slate-600',
        icon: 'text-slate-300',
        shadow: 'shadow-slate-100',
        badge: 'bg-slate-50 text-slate-600'
      };
    }
  };

  const selectedClassLogs = useMemo(() => {
    if (!selectedClassId) return [];
    const filtered = getFilteredLogs(logs);
    return filtered.filter(l => l.classId === selectedClassId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedClassId, logs, viewType, selectedWeek, selectedSemester]);

  const selectedClassInfo = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl">
           <button onClick={() => setViewType('week')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewType === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Theo Tuần</button>
           <button onClick={() => setViewType('semester')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewType === 'semester' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Học Kỳ</button>
           <button onClick={() => setViewType('year')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewType === 'year' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cả Năm</button>
        </div>

        <div className="flex items-center gap-2">
           {viewType === 'week' && (
             <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
               <button 
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek <= 1}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-30 transition"
               >
                 <ChevronLeft size={20} />
               </button>
               <select 
                 value={selectedWeek} 
                 onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                 className="py-1 px-2 border-none bg-transparent text-sm font-bold focus:ring-0 text-slate-700 text-center min-w-[100px] cursor-pointer"
               >
                 {Array.from({length: 35}, (_, i) => i + 1).map(w => (
                   <option key={w} value={w}>Tuần {w} {weeksWithData.has(w) ? '•' : ''}</option>
                 ))}
               </select>
               <button 
                onClick={() => setSelectedWeek(Math.min(35, selectedWeek + 1))}
                disabled={selectedWeek >= 35}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 disabled:opacity-30 transition"
               >
                 <ChevronRight size={20} />
               </button>
             </div>
           )}
           {viewType === 'semester' && (
             <div className="flex bg-slate-100 rounded-xl p-1">
               <button onClick={() => setSelectedSemester(1)} className={`px-3 py-1.5 text-sm font-bold rounded-lg transition ${selectedSemester === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>HK1</button>
               <button onClick={() => setSelectedSemester(2)} className={`px-3 py-1.5 text-sm font-bold rounded-lg transition ${selectedSemester === 2 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>HK2</button>
             </div>
           )}
        </div>
      </div>

      {/* Top 3 Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Rearrange order for visual podium: 2, 1, 3 */}
        {[top3[1], top3[0], top3[2]].map((item, idx) => {
          if (!item) return null;
          // Because we rearranged, calculate actual styles based on item.rank
          const styles = getRankStyles(item.rank);
          // Scale effect for #1
          const isFirst = item.rank === 1;

          return (
            <div 
              key={item.classId} 
              onClick={() => setSelectedClassId(item.classId)}
              className={`
                relative flex flex-col items-center p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2
                ${styles.bg} ${styles.border} ${styles.shadow}
                ${isFirst ? 'md:-mt-8 md:py-10 shadow-xl z-10 transform hover:-translate-y-2' : 'hover:-translate-y-1 shadow-lg opacity-90 hover:opacity-100'}
              `}
            >
               {/* Rank Badge */}
               <div className={`
                 absolute -top-5 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-md
                 ${isFirst ? 'bg-yellow-400 text-white w-16 h-16 text-3xl' : item.rank === 2 ? 'bg-slate-300 text-white' : 'bg-orange-400 text-white'}
               `}>
                 {item.rank}
               </div>

               {isFirst && <Crown className="text-yellow-500 mb-2 animate-bounce" size={32} />}
               {!isFirst && <div className="h-8"></div>}

               <h3 className="text-2xl font-black text-slate-800 mt-4">Lớp {item.className}</h3>
               
               <div className="mt-2 text-center">
                 <div className={`text-4xl font-black ${styles.text}`}>
                    {item.totalScore}
                 </div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tổng Điểm</span>
               </div>

               <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
                 {item.violationCount === 0 ? 'Xuất sắc' : `${item.violationCount} lỗi`}
               </div>
            </div>
          );
        })}
         {top3.length === 0 && (
           <div className="col-span-3 text-center py-10 text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
             Chưa có dữ liệu cho khoảng thời gian này.
           </div>
         )}
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        {rankingData.length > 0 && (
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Biểu đồ so sánh
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData.slice(0, 10)} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="className" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="totalScore" radius={[6, 6, 6, 6]} barSize={40}>
                    {rankingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? 'url(#colorScoreTop)' : '#cbd5e1'} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorScoreTop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Full Table */}
        {rankingData.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs font-extrabold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4 pl-6">Hạng</th>
                    <th className="p-4">Lớp</th>
                    <th className="p-4 text-center">Tổng Điểm</th>
                    <th className="p-4 text-center">Số lỗi</th>
                    <th className="p-4 text-right pr-6">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rankingData.map((item, idx) => {
                    let rowClass = "border-l-4 border-transparent hover:bg-primary-50/50 transition cursor-pointer group";
                    
                    if (item.rank === 1) {
                      rowClass = "bg-gradient-to-r from-yellow-50/60 to-transparent border-l-4 border-l-yellow-400 hover:from-yellow-100/60 transition cursor-pointer group";
                    } else if (item.rank === 2) {
                      rowClass = "bg-gradient-to-r from-slate-100/60 to-transparent border-l-4 border-l-slate-300 hover:from-slate-200/60 transition cursor-pointer group";
                    } else if (item.rank === 3) {
                      rowClass = "bg-gradient-to-r from-orange-50/60 to-transparent border-l-4 border-l-orange-400 hover:from-orange-100/60 transition cursor-pointer group";
                    }

                    return (
                      <tr 
                        key={item.classId} 
                        onClick={() => setSelectedClassId(item.classId)}
                        className={rowClass}
                      >
                        <td className="p-4 pl-6">
                          <span className={`
                            w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                            ${item.rank <= 3 ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 bg-slate-100'}
                            ${item.rank === 1 ? 'bg-yellow-400 border-2 border-white' : ''}
                            ${item.rank === 2 ? 'bg-slate-400 border-2 border-white' : ''}
                            ${item.rank === 3 ? 'bg-orange-400 border-2 border-white' : ''}
                          `}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800 text-lg group-hover:text-primary-600 transition-colors">{item.className}</td>
                        <td className="p-4 text-center">
                          <span className="font-extrabold text-slate-800">{item.totalScore}</span>
                        </td>
                        <td className="p-4 text-center">
                           {item.violationCount > 0 ? (
                             <span className="text-red-500 font-medium bg-red-50 px-2 py-1 rounded-md text-xs">{item.violationCount}</span>
                           ) : (
                             <span className="text-green-500 font-bold text-lg">✓</span>
                           )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          {item.totalScore >= (viewType === 'week' ? 95 : 95 * (viewType === 'semester' ? 18 : 35)) ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              <CheckCircle2 size={12} /> Tốt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                              Cần cố gắng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL - Cleaned up */}
      {selectedClassId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClassId(null)}>
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-start text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
               <div className="relative z-10">
                  <h3 className="text-3xl font-black flex items-center gap-3">
                    Lớp {selectedClassInfo?.name}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                      {viewType === 'week' ? `Tuần ${selectedWeek}` : viewType === 'semester' ? `Học kỳ ${selectedSemester}` : 'Cả năm'}
                    </span>
                    <span className="text-xs font-bold bg-primary-600 px-3 py-1 rounded-full">
                       Tổng {selectedClassLogs.reduce((acc, l) => acc + l.totalScore, 0)} điểm
                    </span>
                  </div>
               </div>
               <button onClick={() => setSelectedClassId(null)} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition z-10">
                 <X size={24} />
               </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               {selectedClassLogs.length === 0 ? (
                 <div className="text-center py-16 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">Không có vi phạm!</p>
                    <p className="text-slate-500 mt-2">Lớp thực hiện nề nếp rất tốt trong thời gian này.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {selectedClassLogs.map((log) => (
                     <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                               {log.date} • Tuần {log.week}
                             </span>
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                  <User size={12} />
                               </div>
                               <span className="text-sm font-semibold text-slate-700">{log.reporterName}</span>
                             </div>
                           </div>
                           <div className="text-xl font-black text-primary-600">
                             {log.totalScore}đ
                           </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                           {log.deductions.map((d, idx) => (
                             <div key={idx} className="flex items-start gap-3 text-sm p-3 bg-red-50/50 rounded-xl border border-red-50">
                                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-slate-800 font-medium">{d.note || "Vi phạm quy định"}</span>
                                </div>
                                <span className="font-bold text-red-600">-{d.pointsLost}</span>
                             </div>
                           ))}
                           {log.bonusPoints > 0 && (
                              <div className="flex items-start gap-3 text-sm p-3 bg-green-50/50 rounded-xl border border-green-50">
                                <Gift size={16} className="text-green-600 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <span className="text-slate-800 font-medium">Khen thưởng / Cộng điểm</span>
                                </div>
                                <span className="font-bold text-green-600">+{log.bonusPoints}</span>
                              </div>
                           )}
                           {log.deductions.length === 0 && log.bonusPoints === 0 && (
                             <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                               <CheckCircle2 size={16} /> Không có lỗi vi phạm
                             </div>
                           )}
                        </div>
                        
                        {log.comment && (
                          <div className="text-sm text-slate-500 italic border-t border-slate-50 pt-2">
                            "{log.comment}"
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};