
import React, { useState, useEffect, useMemo } from 'react';
import { MAX_DAILY_SCORE } from '../constants';
import { DailyLog, ClassEntity, CriteriaConfig, User, UserRole } from '../types';
import { Trash2, Save, Gift, AlertCircle, Clock, CheckCircle2, Edit3, RotateCcw, User as UserIcon, ArrowRight, Calculator } from 'lucide-react';

interface InputFormProps {
  onSave: (log: DailyLog) => void;
  classes: ClassEntity[];
  criteriaList: CriteriaConfig[];
  currentUser?: User | null;
  logs?: DailyLog[];
  onDelete?: (id: string) => void;
}

interface DeductionItem {
    criteriaId: string;
    pointsLost: number | ''; // Allow empty string for better typing experience
    note: string;
}

// Helper để lấy ngày địa phương YYYY-MM-DD chính xác
const getLocalDateString = () => {
    const d = new Date();
    // Sử dụng sv-SE để có định dạng YYYY-MM-DD ổn định
    return d.toLocaleDateString('sv-SE');
};

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
  // BUG FIX: Dùng getLocalDateString() thay vì toISOString().split('T')[0] để tránh lệch múi giờ
  const [date, setDate] = useState<string>(getLocalDateString());
  const [week, setWeek] = useState<number>(12); 
  const [reporterName, setReporterName] = useState<string>('');
  
  // Form State
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);
  const [bonusPoints, setBonusPoints] = useState<number | ''>(0);
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
        
        // Tự động bật chế độ Bonus Only nếu phiếu cũ chỉ có điểm cộng và không có lỗi
        if (existingLog.deductions.length === 0 && existingLog.bonusPoints > 0) {
            setIsBonusOnly(true);
        } else {
            setIsBonusOnly(false);
        }
    } else {
        // Chế độ thêm mới (New Mode) - Reset form sạch sẽ
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

  const updateDeduction = (index: number, field: keyof DeductionItem, value: any) => {
    const newDeductions = [...deductions];
    // Create a new object to ensure state immutability
    newDeductions[index] = {
        ...newDeductions[index],
        [field]: value
    };
    setDeductions(newDeductions);
  };

  const calculateStats = () => {
    const bonus = Number(bonusPoints) || 0;
    
    // Nếu là chế độ chỉ cộng điểm => Không có trừ điểm
    const totalDeducted = isBonusOnly ? 0 : deductions.reduce((acc, curr) => {
        const points = Number(curr.pointsLost) || 0;
        return acc + points;
    }, 0);

    // Công thức: 100 (Gốc) - Trừ + Cộng
    // Lưu ý: Điểm không được âm
    const totalScore = Math.max(0, MAX_DAILY_SCORE - totalDeducted + bonus);

    return { totalScore, totalDeducted, bonus };
  };

  const { totalScore, totalDeducted, bonus } = calculateStats();

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
            criteriaId: d.criteriaId,
            pointsLost: Number(d.pointsLost) || 0,
            note: d.note
        }));

        const newLog: DailyLog = {
          id: logId,
          date,
          week,
          classId: selectedClass,
          deductions: cleanDeductions,
          bonusPoints: Number(bonusPoints) || 0,
          totalScore: totalScore,
          reporterName,
          comment
        };

        await onSave(newLog);
        
        // Tự động chuyển sang lớp tiếp theo (Auto-advance)
        const currentIndex = availableClasses.findIndex(c => c.id === selectedClass);
        if (currentIndex >= 0 && currentIndex < availableClasses.length - 1) {
            // Delay nhẹ để người dùng thấy hiệu ứng loading xong
            setTimeout(() => {
                setSelectedClass(availableClasses[currentIndex + 1].id);
            }, 300);
        } else {
            // Nếu là lớp cuối cùng thì thôi
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
     if (!confirm(`Bạn có chắc chắn muốn ĐẶT LẠI điểm lớp ${selectedClass} về 100 (Xóa hết lỗi)?`)) return;

     setIsSaving(true);
     try {
         // Overwrite with a clean log
         const logId = `${date}-${selectedClass}`;
         const resetLog: DailyLog = {
            id: logId,
            date,
            week,
            classId: selectedClass,
            deductions: [],
            bonusPoints: 0,
            totalScore: 100,
            reporterName,
            comment: 'Đã đặt lại về 100 điểm.'
         };
         await onSave(resetLog);
         // UI updates automatically via listener
     } catch (e) {
         alert("Lỗi khi đặt lại điểm.");
     } finally {
         setIsSaving(false);
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
                        <Edit3 size={12} /> ĐANG SỬA PHIẾU CHẤM CŨ
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
                                    LỚP {c.name} {getGradedStatus(c.id) ? '✓' : ''}
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
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded ml-2 shrink-0">-{crit.maxPoints}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                         </div>

                        <div className="border border-red-100 rounded-3xl overflow-hidden mt-4 shadow-sm">
                            <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    <AlertCircle size={20} /> Danh sách vi phạm
                                </h3>
                                <span className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded-lg border border-red-200">
                                    Tổng trừ: {totalDeducted} điểm
                                </span>
                            </div>
                            
                            <div className="p-4 space-y-3 bg-white">
                                {deductions.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic">
                                        Lớp chưa có lỗi vi phạm nào.
                                    </div>
                                ) : (
                                    deductions.map((deduction, index) => {
                                        const criteria = criteriaList.find(c => c.id === deduction.criteriaId);
                                        return (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in">
                                                <div className="flex-1 w-full">
                                                    <select 
                                                        value={deduction.criteriaId}
                                                        onChange={(e) => updateDeduction(index, 'criteriaId', e.target.value)}
                                                        className="w-full p-2 rounded-lg border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 mb-2 sm:mb-0"
                                                    >
                                                        {criteriaList.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ghi chú thêm (VD: Tổ 1, 3 em...)" 
                                                        value={deduction.note}
                                                        onChange={(e) => updateDeduction(index, 'note', e.target.value)}
                                                        className="w-full p-2 mt-2 rounded-lg border-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                        <span className="text-xs font-bold text-slate-400">Trừ</span>
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max="100"
                                                            value={deduction.pointsLost}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                updateDeduction(index, 'pointsLost', val === '' ? '' : parseInt(val))
                                                            }}
                                                            className="w-12 text-center font-black text-red-600 border-none focus:ring-0 p-0"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeDeduction(index)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* BONUS & COMMENT SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                             <label className="block text-sm font-bold text-slate-700 mb-2">Điểm cộng / Khen thưởng</label>
                             <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={bonusPoints}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBonusPoints(val === '' ? '' : parseInt(val));
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 font-bold text-green-600"
                                    placeholder="0"
                                />
                             </div>
                             <p className="text-xs text-slate-400 mt-2">Nhập điểm cộng nếu lớp có thành tích tốt.</p>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét chung</label>
                             <textarea 
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 text-sm"
                                placeholder="Nhập nhận xét về nề nếp, vệ sinh..."
                             />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white/90 backdrop-blur-md p-4 -mx-6 -mb-8 md:mx-0 md:mb-0 md:rounded-2xl border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                        {/* SCORE PREVIEW */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Calculator size={10} /> Công thức tính
                                </span>
                                <div className="text-sm font-mono text-slate-600 font-medium">
                                    <span className="text-slate-800 font-bold">100</span>
                                    <span className="text-red-500 mx-1">- {totalDeducted}</span>
                                    <span className="text-green-500 mx-1">+ {Number(bonus) || 0}</span>
                                    <span>=</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg">
                                <div className="text-right">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Tổng điểm</span>
                                    <span className={`text-2xl font-black leading-none ${totalScore >= 100 ? 'text-green-400' : totalScore < 90 ? 'text-red-400' : 'text-white'}`}>
                                        {totalScore}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            {isEditingMode && (
                                <button 
                                    type="button" 
                                    onClick={handleReset}
                                    disabled={isSaving}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={20} /> 
                                    <span className="hidden sm:inline">Đặt lại 100đ</span>
                                </button>
                            )}

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                            >
                                {isSaving ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Save size={20} />}
                                {isEditingMode ? 'Cập Nhật Điểm' : 'Lưu Kết Quả'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        {/* Right Sidebar: Guidelines */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-white/10 rounded-lg">
                      <Clock className="text-yellow-400" size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-lg leading-tight">Hướng dẫn chấm</h3>
                      <p className="text-xs text-slate-400">Quy định năm học 2025-2026</p>
                   </div>
                </div>

                <div className="space-y-4 text-sm">
                   <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="font-bold text-green-400 block mb-1">✓ Điểm chuẩn: 100 điểm</span>
                      <p className="text-slate-300 text-xs">Mỗi lớp bắt đầu ngày mới với 100 điểm. Điểm trừ sẽ được khấu trừ từ quỹ điểm này.</p>
                   </div>
                   
                   <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="font-bold text-orange-400 block mb-1">⚠ Điểm cộng</span>
                      <p className="text-slate-300 text-xs">Điểm cộng được tính thêm vào tổng điểm sau khi đã trừ lỗi. Tổng điểm có thể vượt quá 100.</p>
                   </div>

                   <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="font-bold text-blue-400 block mb-1">★ Xếp loại</span>
                      <ul className="text-xs text-slate-300 space-y-1 mt-1 pl-4 list-disc">
                         <li><span className="text-white font-bold">Xuất sắc:</span> ≥ 100 điểm</li>
                         <li><span className="text-white font-bold">Tốt:</span> 95 - 99 điểm</li>
                         <li><span className="text-white font-bold">Khá:</span> 85 - 94 điểm</li>
                      </ul>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};
