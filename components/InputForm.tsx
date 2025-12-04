
import React, { useState, useEffect, useMemo } from 'react';
import { MAX_DAILY_SCORE } from '../constants';
import { DailyLog, ClassEntity, CriteriaConfig, User, UserRole } from '../types';
import { Plus, Trash2, Save, Gift, AlertCircle, Calendar, User as UserIcon, Clock, CheckCircle2, Edit3, RotateCcw } from 'lucide-react';

interface InputFormProps {
  onSave: (log: DailyLog) => void;
  classes: ClassEntity[];
  criteriaList: CriteriaConfig[];
  currentUser?: User | null;
  logs?: DailyLog[];
  onDelete?: (id: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSave, classes, criteriaList, currentUser, logs = [], onDelete }) => {
  // Lọc danh sách lớp được phân công
  const availableClasses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) {
      return classes;
    }
    if (currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0) {
      return classes.filter(c => currentUser.assignedClassIds!.includes(c.id));
    }
    return [];
  }, [classes, currentUser]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [week, setWeek] = useState<number>(12); // Default week, should ideally be calculated from date
  const [reporterName, setReporterName] = useState<string>('');
  
  // Form State
  const [deductions, setDeductions] = useState<{ criteriaId: string; pointsLost: number; note: string }[]>([]);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isBonusOnly, setIsBonusOnly] = useState<boolean>(false);
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Initialize defaults
  useEffect(() => {
    if (availableClasses.length > 0 && !selectedClass) {
      setSelectedClass(availableClasses[0].id);
    }
  }, [availableClasses, selectedClass]);

  useEffect(() => {
    if (currentUser) {
         setReporterName(currentUser.name);
    }
  }, [currentUser]);

  // --- LOGIC QUAN TRỌNG: Tự động tải dữ liệu cũ nếu đã chấm ---
  useEffect(() => {
    if (!selectedClass || !date) return;

    // Tìm xem lớp này ngày này đã được chấm chưa
    const existingLog = logs.find(l => l.classId === selectedClass && l.date === date);

    if (existingLog) {
        // Chế độ chỉnh sửa (Edit Mode)
        setIsEditingMode(true);
        // Load dữ liệu cũ vào form
        setDeductions(existingLog.deductions.map(d => ({
            criteriaId: d.criteriaId,
            pointsLost: d.pointsLost,
            note: d.note || ''
        })) || []);
        setBonusPoints(existingLog.bonusPoints || 0);
        setComment(existingLog.comment || '');
        setReporterName(existingLog.reporterName || currentUser?.name || '');
        
        // Tự động bật chế độ Bonus Only nếu phiếu cũ chỉ có điểm cộng
        if (existingLog.deductions.length === 0 && existingLog.bonusPoints > 0) {
            setIsBonusOnly(true);
        } else {
            setIsBonusOnly(false);
        }
    } else {
        // Chế độ thêm mới (New Mode)
        setIsEditingMode(false);
        setDeductions([]);
        setBonusPoints(0);
        setComment('');
        setIsBonusOnly(false);
        // Reset reporter name to current user if switching to a new blank log
        if (currentUser) setReporterName(currentUser.name);
    }
  }, [selectedClass, date, logs, currentUser]);

  // Kiểm tra trạng thái đã chấm (để hiện tick xanh trong dropdown)
  const getGradedStatus = (classId: string) => {
      return logs.some(l => l.classId === classId && l.date === date);
  };

  const addDeduction = (criteria?: CriteriaConfig) => {
    if (criteria) {
        setDeductions([...deductions, { criteriaId: criteria.id, pointsLost: criteria.maxPoints, note: criteria.name }]);
    } else {
        if (criteriaList.length === 0) return;
        setDeductions([...deductions, { criteriaId: criteriaList[0].id, pointsLost: 1, note: '' }]);
    }
  };

  const removeDeduction = (index: number) => {
    const newDeductions = [...deductions];
    newDeductions.splice(index, 1);
    setDeductions(newDeductions);
  };

  const updateDeduction = (index: number, field: string, value: any) => {
    const newDeductions = [...deductions];
    // @ts-ignore
    newDeductions[index][field] = value;
    setDeductions(newDeductions);
  };

  const calculateTotal = () => {
    if (isBonusOnly) {
      return bonusPoints; // Nếu chế độ chỉ cộng điểm, tổng điểm là điểm cộng (hoặc 100 + bonus tùy quy định, ở đây giả sử là bonus)
      // Thường thì điểm cộng được cộng vào điểm 100. Sửa lại logic một chút:
      // return 100 + bonusPoints; // Nếu muốn nền tảng là 100
    }
    
    // Logic mặc định: 100 - Trừ + Cộng
    const totalDeducted = deductions.reduce((acc, curr) => {
        const points = Number(curr.pointsLost);
        return acc + (isNaN(points) ? 0 : points);
    }, 0);
    return Math.max(0, MAX_DAILY_SCORE - totalDeducted + bonusPoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim()) {
      alert("Vui lòng nhập tên người chấm!");
      return;
    }
    if (!selectedClass) {
        alert("Vui lòng chọn lớp!");
        return;
    }

    setIsSaving(true);

    try {
        // ID ĐỊNH DANH (Deterministic ID): Luôn là ngày + mã lớp
        // Điều này đảm bảo ghi đè chính xác mà không cần tìm kiếm ID cũ
        const logId = `${date}-${selectedClass}`;

        const cleanDeductions = isBonusOnly ? [] : deductions.map(d => ({
            ...d,
            pointsLost: Number(d.pointsLost) || 0 // Ensure number to prevent NaN error
        }));

        const newLog: DailyLog = {
          id: logId,
          date,
          week,
          classId: selectedClass,
          deductions: cleanDeductions,
          bonusPoints: Number(bonusPoints) || 0,
          totalScore: calculateTotal(),
          reporterName,
          comment
        };

        await onSave(newLog);
        
        // Sau khi lưu thành công, nếu muốn chuyển sang lớp tiếp theo:
        const currentIndex = availableClasses.findIndex(c => c.id === selectedClass);
        if (currentIndex >= 0 && currentIndex < availableClasses.length - 1) {
            setSelectedClass(availableClasses[currentIndex + 1].id);
        } else {
            // Nếu là lớp cuối cùng, hoặc muốn ở lại, chỉ cần reset state loading
            // Vì useEffect sẽ chạy lại và load data vừa lưu (chuyển sang chế độ Edit)
        }

    } catch (error) {
        console.error("Save error:", error);
        alert("Có lỗi xảy ra khi lưu. Vui lòng kiểm tra kết nối mạng.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleReset = async () => {
     if (!selectedClass || !date) return;
     if (!confirm(`Bạn có chắc chắn muốn xóa/làm lại phiếu chấm của lớp ${selectedClass} ngày ${date}?`)) return;

     if (onDelete) {
         // ID is always date-classId
         const logId = `${date}-${selectedClass}`;
         await onDelete(logId);
         // Reset UI handled by useEffect when log disappears from props
     }
  };

  const weeks = Array.from({ length: 35 }, (_, i) => i + 1);

  if (currentUser && currentUser.role === UserRole.RED_STAR && availableClasses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl border border-red-100 text-center">
         <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle size={40} />
         </div>
         <h3 className="text-2xl font-bold text-slate-800 mb-2">Chưa được phân công</h3>
         <p className="text-slate-500">
           Tài khoản của bạn chưa được phân công phụ trách lớp nào. Vui lòng liên hệ Tổng Phụ Trách.
         </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                {/* Status Indicator Bar */}
                {isEditingMode && (
                    <div className="absolute top-0 left-0 w-full bg-orange-50 text-orange-700 text-xs font-bold py-1 px-4 text-center border-b border-orange-100 flex items-center justify-center gap-2">
                        <Edit3 size={12} /> Bạn đang sửa phiếu chấm đã lưu lúc trước
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    {isBonusOnly ? <Gift className="text-green-500" size={32} /> : <div className="bg-primary-100 p-2 rounded-xl text-primary-600"><Save size={24}/></div>}
                    {isBonusOnly ? 'Khen Thưởng' : 'Sổ Chấm Điểm'}
                    </h2>
                    
                    {currentUser?.role === UserRole.ADMIN && (
                    <label className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full cursor-pointer border transition-all ${isBonusOnly ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                        <input 
                            type="checkbox" 
                            checked={isBonusOnly} 
                            onChange={(e) => {
                            setIsBonusOnly(e.target.checked);
                            if (e.target.checked) setDeductions([]);
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        Chế độ chỉ cộng điểm
                    </label>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section 1: Time & Reporter */}
                    <div className="bg-slate-50 p-5 rounded-2xl space-y-4 border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin chung</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Tuần học</label>
                            <div className="relative">
                                <select
                                    value={week}
                                    onChange={(e) => setWeek(parseInt(e.target.value))}
                                    className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold bg-white cursor-pointer"
                                >
                                    {weeks.map(w => <option key={w} value={w}>Tuần {w}</option>)}
                                </select>
                            </div>
                            </div>
                            <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Ngày chấm</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold bg-white text-slate-700 cursor-pointer"
                                required
                            />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Người chấm</label>
                            <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                                className="w-full pl-9 p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold bg-white"
                                placeholder="Nhập tên người chấm"
                            />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Class Selection */}
                    <div className={`p-5 rounded-2xl flex flex-col justify-center border transition-colors ${isEditingMode ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-100'}`}>
                        <label className={`block text-sm font-bold mb-3 text-center ${isEditingMode ? 'text-orange-800' : 'text-blue-800'}`}>
                            {isEditingMode ? 'Đang sửa điểm lớp' : 'Chọn lớp cần chấm'}
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={`w-full p-4 rounded-xl border-2 focus:ring-4 text-lg font-black text-center cursor-pointer transition-all appearance-none
                                    ${isEditingMode 
                                        ? 'border-orange-300 bg-white text-orange-900 focus:ring-orange-200 focus:border-orange-400' 
                                        : 'border-blue-200 bg-white text-blue-900 focus:ring-blue-200 focus:border-blue-400'}
                                `}
                            >
                                {availableClasses.map(c => (
                                <option key={c.id} value={c.id}>
                                    LỚP {c.name} {getGradedStatus(c.id) ? '(Đã chấm)' : ''}
                                </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <Clock size={20} />
                            </div>
                        </div>
                        
                        <div className="flex justify-center gap-4 mt-3 min-h-[24px]">
                             {isEditingMode ? (
                                 <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                     <Edit3 size={12} /> Đang cập nhật phiếu cũ
                                 </span>
                             ) : (
                                 getGradedStatus(selectedClass) && (
                                     <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                                         <CheckCircle2 size={12} /> Đã chấm hôm nay
                                     </span>
                                 )
                             )}
                        </div>
                    </div>
                    </div>

                    {/* DEDUCTIONS SECTION */}
                    {!isBonusOnly && (
                    <div className="space-y-4">
                         {/* Quick Add Buttons */}
                         <div>
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                                <Clock size={18} className="text-primary-600" /> Chấm nhanh (Chạm để thêm lỗi)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {criteriaList.map((crit) => (
                                    <button
                                        key={crit.id}
                                        type="button"
                                        onClick={() => addDeduction(crit)}
                                        className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 hover:shadow-md transition-all active:scale-95 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-slate-700 text-sm group-hover:text-red-700 line-clamp-2">{crit.name}</span>
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded ml-2">-{crit.maxPoints}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                         </div>

                        <div className="border border-red-100 rounded-3xl overflow-hidden mt-4 shadow-sm">
                            <div className="bg-red-50 p-4 flex justify-between items-center border-b border-red-100">
                                <label className="text-sm font-bold text-red-800 flex items-center gap-2">
                                <AlertCircle size={18} /> Chi tiết lỗi vi phạm
                                </label>
                                <button 
                                type="button" 
                                onClick={() => addDeduction()}
                                className="text-xs bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition font-bold shadow-sm"
                                >
                                + Thêm dòng
                                </button>
                            </div>
                            
                            <div className="p-4 bg-white min-h-[100px]">
                                {deductions.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-24 text-slate-300 italic border-2 border-dashed border-slate-100 rounded-xl">
                                    <CheckCircle2 size={32} className="mb-2 opacity-50" />
                                    <p>Không có vi phạm nào. Lớp tốt!</p>
                                </div>
                                )}

                                <div className="space-y-3">
                                {deductions.map((deduction, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-xl border border-slate-100 hover:border-red-200 transition bg-slate-50/50 animate-fade-in">
                                    <select 
                                        className="flex-1 p-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-red-200 font-medium"
                                        value={deduction.criteriaId}
                                        onChange={(e) => updateDeduction(idx, 'criteriaId', e.target.value)}
                                    >
                                        {criteriaList.map(crit => (
                                        <option key={crit.id} value={crit.id}>{crit.name} (Max -{crit.maxPoints})</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <input 
                                            type="text" 
                                            placeholder="Ghi chú (Tổ 1, bàn cuối...)"
                                            value={deduction.note}
                                            onChange={(e) => updateDeduction(idx, 'note', e.target.value)}
                                            className="flex-1 p-2.5 text-sm border-slate-200 rounded-lg w-full md:w-48"
                                        />
                                        <div className="flex items-center bg-red-100 rounded-lg px-2 py-1">
                                        <span className="text-red-700 font-bold text-xs mr-1">-</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="20"
                                            value={deduction.pointsLost}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                updateDeduction(idx, 'pointsLost', isNaN(val) ? '' : val);
                                            }}
                                            onBlur={(e) => {
                                                 // @ts-ignore
                                                 if (!e.target.value) updateDeduction(idx, 'pointsLost', 0);
                                            }}
                                            className="w-10 bg-transparent text-center font-bold text-red-700 focus:outline-none"
                                        />
                                        </div>
                                        <button 
                                        type="button" 
                                        onClick={() => removeDeduction(idx)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                        <Trash2 size={18} />
                                        </button>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* BONUS SECTION */}
                    {currentUser?.role === UserRole.ADMIN && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-xl text-green-600">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-800">Điểm cộng</h4>
                                <p className="text-xs text-green-600">Dành cho tập thể xuất sắc</p>
                            </div>
                            </div>
                            <div className="flex-1 flex items-center gap-4">
                            <input 
                                type="number" 
                                min="0"
                                value={bonusPoints}
                                onChange={(e) => setBonusPoints(parseInt(e.target.value) || 0)}
                                className="w-24 p-3 text-center font-black text-2xl text-green-600 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-100 bg-white"
                                placeholder="0"
                            />
                            <span className="text-sm text-green-700 italic font-medium">điểm thưởng</span>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* COMMENTS & TOTAL */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét</label>
                        <textarea 
                            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 transition resize-none bg-slate-50 focus:bg-white"
                            rows={2}
                            placeholder="Nhận xét ngắn gọn về tình hình lớp..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <div className="bg-slate-900 p-6 rounded-3xl text-white text-center shadow-xl shadow-slate-200">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng kết điểm</p>
                        <p className={`text-5xl font-black ${calculateTotal() >= 100 ? 'text-yellow-400' : 'text-white'}`}>
                            {calculateTotal()}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Trên thang điểm 100</p>
                    </div>
                    </div>

                    <div className="flex gap-4">
                        {isEditingMode && (
                             <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-5 rounded-2xl font-bold text-red-600 bg-white border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition shadow-sm flex flex-col items-center justify-center gap-1 min-w-[120px]"
                             >
                                 <RotateCcw size={20} />
                                 <span className="text-xs">Hủy / Làm lại</span>
                             </button>
                        )}
                        <button 
                        type="submit" 
                        disabled={isSaving}
                        className={`flex-1 font-bold text-lg py-5 rounded-2xl shadow-xl flex justify-center items-center gap-3 transition transform hover:scale-[1.01] active:scale-95
                            ${isEditingMode 
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/30' 
                                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/30'}
                            disabled:opacity-70 disabled:cursor-not-allowed
                        `}
                        >
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            isEditingMode ? <><Save size={24} /> Cập Nhật Kết Quả</> : <><Save size={24} /> Lưu Kết Quả Mới</>
                        )}
                        </button>
                    </div>
                    
                    {isEditingMode && (
                        <p className="text-center text-xs text-orange-600 font-bold">
                            * Bạn đang cập nhật lại phiếu chấm của ngày {date}
                        </p>
                    )}
                </form>
            </div>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <Clock size={20} className="text-blue-500" />
                     Tiến độ hôm nay
                 </h3>
                 
                 <div className="mt-2 mb-6">
                     <div className="flex justify-between text-sm mb-2">
                         <span className="text-slate-500">Đã chấm:</span>
                         <span className="font-bold text-slate-800">{logs.filter(l => l.date === date).length}/{availableClasses.length} lớp</span>
                     </div>
                     <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                         <div 
                             className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out"
                             style={{ width: `${availableClasses.length > 0 ? (logs.filter(l => l.date === date).length / availableClasses.length) * 100 : 0}%` }}
                         ></div>
                     </div>
                 </div>

                 <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                     {logs.filter(l => l.date === date).sort((a, b) => b.totalScore - a.totalScore).map(log => {
                         const clsName = classes.find(c => c.id === log.classId)?.name || log.classId;
                         const isCurrent = log.classId === selectedClass;
                         return (
                             <div 
                                key={log.id} 
                                onClick={() => setSelectedClass(log.classId)}
                                className={`p-4 rounded-xl border cursor-pointer transition group
                                    ${isCurrent ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}
                                `}
                             >
                                 <div className="flex justify-between items-center mb-2">
                                     <span className={`font-black text-lg ${isCurrent ? 'text-orange-800' : 'text-slate-700'}`}>Lớp {clsName}</span>
                                     <span className={`font-bold ${log.totalScore >= 100 ? 'text-green-600' : 'text-slate-600'}`}>
                                         {log.totalScore}đ
                                     </span>
                                 </div>
                                 {log.deductions.length > 0 ? (
                                     <p className="text-xs text-red-500 line-clamp-1">
                                         {log.deductions.length} lỗi: {log.deductions.map(d => d.note).join(', ')}
                                     </p>
                                 ) : (
                                     <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                         <CheckCircle2 size={10} /> Tốt
                                     </p>
                                 )}
                             </div>
                         );
                     })}
                     {logs.filter(l => l.date === date).length === 0 && (
                         <div className="text-center py-8 text-slate-400 text-sm italic">Chưa có lớp nào được chấm hôm nay.</div>
                     )}
                 </div>
             </div>
        </div>
    </div>
  );
};
