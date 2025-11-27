import React, { useState, useEffect, useMemo } from 'react';
import { MAX_DAILY_SCORE } from '../constants';
import { DailyLog, ClassEntity, CriteriaConfig, User, UserRole } from '../types';
import { Plus, Trash2, Save, Gift, AlertCircle } from 'lucide-react';

interface InputFormProps {
  onSave: (log: DailyLog) => void;
  classes: ClassEntity[];
  criteriaList: CriteriaConfig[];
  currentUser?: User | null;
}

export const InputForm: React.FC<InputFormProps> = ({ onSave, classes, criteriaList, currentUser }) => {
  // Logic to filter classes based on role
  const availableClasses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) {
      return classes;
    }
    // For Red Stars, filter by assigned IDs
    if (currentUser.assignedClassIds && currentUser.assignedClassIds.length > 0) {
      return classes.filter(c => currentUser.assignedClassIds!.includes(c.id));
    }
    return [];
  }, [classes, currentUser]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [week, setWeek] = useState<number>(12); // Default to a sample week, in real app calculate from date
  const [reporterName, setReporterName] = useState<string>('');
  const [deductions, setDeductions] = useState<{ criteriaId: string; pointsLost: number; note: string }[]>([]);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  
  // New state for Admin-only "Bonus Only" mode
  const [isBonusOnly, setIsBonusOnly] = useState<boolean>(false);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Set default selected class when availableClasses changes
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.some(c => c.id === selectedClass)) {
      setSelectedClass(availableClasses[0].id);
    }
  }, [availableClasses, selectedClass]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.RED_STAR) {
         setReporterName(currentUser.name);
      } else if (currentUser.role === UserRole.ADMIN) {
         setReporterName(currentUser.name);
      }
    }
  }, [currentUser]);

  const addDeduction = () => {
    if (criteriaList.length === 0) return;
    setDeductions([...deductions, { criteriaId: criteriaList[0].id, pointsLost: 1, note: '' }]);
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
      return bonusPoints; // For bonus-only logs, total is just the bonus
    }
    const totalDeducted = deductions.reduce((acc, curr) => acc + Number(curr.pointsLost), 0);
    return Math.max(0, MAX_DAILY_SCORE - totalDeducted + bonusPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName) {
      alert("Vui lòng nhập tên người chấm!");
      return;
    }
    if (!selectedClass) {
        alert("Vui lòng chọn lớp!");
        return;
    }

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      date,
      week,
      classId: selectedClass,
      deductions: isBonusOnly ? [] : deductions, // No deductions if bonus only
      bonusPoints,
      totalScore: calculateTotal(),
      reporterName,
      comment
    };

    onSave(newLog);
    // Reset form
    setDeductions([]);
    setBonusPoints(0);
    setComment('');
    setIsBonusOnly(false);
    alert("Đã lưu kết quả!");
  };

  // Generate array of 35 weeks
  const weeks = Array.from({ length: 35 }, (_, i) => i + 1);

  if (currentUser && currentUser.role === UserRole.RED_STAR && availableClasses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle size={32} />
         </div>
         <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa được phân công</h3>
         <p className="text-slate-500">
           Tài khoản của bạn chưa được phân công phụ trách lớp nào. Vui lòng liên hệ Tổng Phụ Trách.
         </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center justify-between">
        <span className="flex items-center">
          <span className="bg-primary-100 p-2 rounded-lg mr-3">📝</span>
          {isBonusOnly ? 'Khen Thưởng / Cộng Điểm' : 'Sổ Chấm Điểm Sao Đỏ'}
        </span>
        {isAdmin && (
           <label className="flex items-center gap-2 text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-lg cursor-pointer border border-green-100">
              <input 
                type="checkbox" 
                checked={isBonusOnly} 
                onChange={(e) => {
                  setIsBonusOnly(e.target.checked);
                  if (e.target.checked) setDeductions([]);
                }}
                className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
              />
              Chế độ chỉ cộng điểm
           </label>
        )}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Tuần học</label>
             <select
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value))}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
             >
                {weeks.map(w => (
                  <option key={w} value={w}>Tuần {w}</option>
                ))}
             </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày chấm</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Lớp</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            >
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {availableClasses.length > 1 && (
               <p className="text-xs text-slate-400 mt-1 italic">
                 Bạn được phân công {availableClasses.length} lớp
               </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Người chấm / Người nhập</label>
          <input 
            type="text" 
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A"
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
        </div>

        {/* DEDUCTIONS SECTION - Hide if Bonus Only mode */}
        {!isBonusOnly && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-red-800 flex items-center gap-2">
                <AlertCircle size={16} /> Các lỗi vi phạm (Trừ điểm)
              </label>
              <button 
                type="button" 
                onClick={addDeduction}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Thêm lỗi
              </button>
            </div>
            
            {deductions.length === 0 && (
              <p className="text-slate-400 text-center text-sm py-4 italic">Chưa có lỗi nào được ghi nhận.</p>
            )}

            <div className="space-y-3">
              {deductions.map((deduction, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-3 rounded-lg shadow-sm border border-red-100">
                  <select 
                    className="flex-1 p-2 text-sm border rounded-md"
                    value={deduction.criteriaId}
                    onChange={(e) => updateDeduction(idx, 'criteriaId', e.target.value)}
                  >
                    {criteriaList.map(crit => (
                      <option key={crit.id} value={crit.id}>{crit.name} (Max -{crit.maxPoints})</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={deduction.pointsLost}
                      onChange={(e) => updateDeduction(idx, 'pointsLost', parseInt(e.target.value))}
                      className="w-16 p-2 text-sm border rounded-md text-center text-red-600 font-bold"
                    />
                    <span className="text-xs text-slate-500">điểm</span>
                  </div>
                   <input 
                      type="text" 
                      placeholder="Ghi chú (VD: 2 bạn nói chuyện)"
                      value={deduction.note}
                      onChange={(e) => updateDeduction(idx, 'note', e.target.value)}
                      className="flex-1 p-2 text-sm border rounded-md w-full sm:w-auto"
                    />
                  <button 
                    type="button" 
                    onClick={() => removeDeduction(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BONUS SECTION - Show for Admin or if allowed */}
        {isAdmin && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
             <label className="block text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                <Gift size={16} /> Điểm cộng / Khen thưởng
             </label>
             <div className="flex items-center gap-4">
                <div className="w-32">
                   <input 
                    type="number" 
                    min="0"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(parseInt(e.target.value) || 0)}
                    className="w-full p-3 text-center font-bold text-green-600 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                   />
                </div>
                <div className="text-sm text-green-700 italic">
                   Nhập số điểm cộng thêm cho lớp (Ví dụ: 10 điểm vì nhặt được của rơi, tham gia phong trào tốt...)
                </div>
             </div>
          </div>
        )}

        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-1">Nhận xét / Ghi chú</label>
           <textarea 
             className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 transition"
             rows={3}
             placeholder="Nhận xét chi tiết..."
             value={comment}
             onChange={(e) => setComment(e.target.value)}
           ></textarea>
        </div>

        <div className="flex items-center justify-between bg-primary-50 p-4 rounded-xl border border-primary-100">
          <span className="font-bold text-slate-700">Tổng điểm ghi nhận:</span>
          <span className="text-3xl font-extrabold text-primary-600">{calculateTotal()}</span>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition transform hover:scale-[1.02]"
        >
          <Save size={20} />
          Lưu Kết Quả
        </button>
      </form>
    </div>
  );
};