import React, { useState, useEffect, useMemo } from 'react';
import { MAX_DAILY_SCORE } from '../constants';
import { DailyLog, ClassEntity, CriteriaConfig, User, UserRole } from '../types';
import { Plus, Trash2, Save, Gift, AlertCircle, Calendar, User as UserIcon } from 'lucide-react';

interface InputFormProps {
  onSave: (log: DailyLog) => void;
  classes: ClassEntity[];
  criteriaList: CriteriaConfig[];
  currentUser?: User | null;
}

export const InputForm: React.FC<InputFormProps> = ({ onSave, classes, criteriaList, currentUser }) => {
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
  const [week, setWeek] = useState<number>(12);
  const [reporterName, setReporterName] = useState<string>('');
  const [deductions, setDeductions] = useState<{ criteriaId: string; pointsLost: number; note: string }[]>([]);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isBonusOnly, setIsBonusOnly] = useState<boolean>(false);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.some(c => c.id === selectedClass)) {
      setSelectedClass(availableClasses[0].id);
    }
  }, [availableClasses, selectedClass]);

  useEffect(() => {
    if (currentUser) {
         setReporterName(currentUser.name);
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
      return bonusPoints;
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
      deductions: isBonusOnly ? [] : deductions,
      bonusPoints,
      totalScore: calculateTotal(),
      reporterName,
      comment
    };

    onSave(newLog);
    setDeductions([]);
    setBonusPoints(0);
    setComment('');
    setIsBonusOnly(false);
    alert("Đã lưu kết quả!");
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
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          {isBonusOnly ? <Gift className="text-green-500" size={32} /> : <div className="bg-primary-100 p-2 rounded-xl text-primary-600"><Save size={24}/></div>}
          {isBonusOnly ? 'Khen Thưởng' : 'Sổ Chấm Điểm'}
        </h2>
        
        {isAdmin && (
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
           <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Thông tin chung</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-600 mb-1.5">Tuần học</label>
                   <div className="relative">
                      <select
                          value={week}
                          onChange={(e) => setWeek(parseInt(e.target.value))}
                          className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold bg-white"
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
                    className="w-full p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-primary-500 text-sm font-bold bg-white text-slate-700"
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
                   />
                </div>
              </div>
           </div>

           {/* Section 2: Class Selection */}
           <div className="bg-blue-50 p-5 rounded-2xl flex flex-col justify-center">
              <label className="block text-sm font-bold text-blue-800 mb-3 text-center">Chọn lớp cần chấm</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-blue-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-lg font-black text-blue-900 bg-white text-center cursor-pointer transition-all"
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>LỚP {c.name}</option>
                ))}
              </select>
              {availableClasses.length > 1 && (
                 <p className="text-xs text-blue-500 mt-3 text-center font-medium">
                   Bạn đang phụ trách {availableClasses.length} lớp
                 </p>
              )}
           </div>
        </div>

        {/* DEDUCTIONS SECTION */}
        {!isBonusOnly && (
          <div className="border border-red-100 rounded-3xl overflow-hidden">
            <div className="bg-red-50 p-4 flex justify-between items-center border-b border-red-100">
              <label className="text-sm font-bold text-red-800 flex items-center gap-2">
                <AlertCircle size={18} /> Các lỗi vi phạm
              </label>
              <button 
                type="button" 
                onClick={addDeduction}
                className="text-xs bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 flex items-center gap-1 transition shadow-md shadow-red-200 font-bold"
              >
                <Plus size={14} /> Thêm lỗi
              </button>
            </div>
            
            <div className="p-4 bg-white min-h-[100px]">
              {deductions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-slate-300 italic">
                  <p>Chưa có lỗi vi phạm nào.</p>
                </div>
              )}

              <div className="space-y-3">
                {deductions.map((deduction, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-xl border border-slate-100 hover:border-red-200 transition bg-slate-50/50">
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
                          placeholder="Chi tiết (VD: tổ 1 nói chuyện)"
                          value={deduction.note}
                          onChange={(e) => updateDeduction(idx, 'note', e.target.value)}
                          className="flex-1 p-2.5 text-sm border-slate-200 rounded-lg w-full md:w-48"
                        />
                      <div className="flex items-center bg-red-100 rounded-lg px-2 py-1">
                        <span className="text-red-700 font-bold text-xs mr-1">-</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="10"
                          value={deduction.pointsLost}
                          onChange={(e) => updateDeduction(idx, 'pointsLost', parseInt(e.target.value))}
                          className="w-8 bg-transparent text-center font-bold text-red-700 focus:outline-none"
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
        )}

        {/* BONUS SECTION */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-100">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét của giáo viên/sao đỏ</label>
              <textarea 
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-100 transition resize-none bg-slate-50 focus:bg-white"
                rows={3}
                placeholder="Nhập nhận xét chi tiết về tình hình lớp..."
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

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-primary-500/30 flex justify-center items-center gap-3 transition transform hover:scale-[1.01] active:scale-95"
        >
          <Save size={24} />
          Lưu Kết Quả Vào Hệ Thống
        </button>
      </form>
    </div>
  );
};