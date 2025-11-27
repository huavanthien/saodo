
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-white border-green-100 text-green-800 shadow-green-100',
    error: 'bg-white border-red-100 text-red-800 shadow-red-100',
    info: 'bg-white border-blue-100 text-blue-800 shadow-blue-100',
  };

  const icons = {
    success: <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle size={18} className="text-green-600" /></div>,
    error: <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><AlertCircle size={18} className="text-red-600" /></div>,
    info: <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><Info size={18} className="text-blue-600" /></div>,
  };

  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-xl animate-fade-in-up ${styles[type]} min-w-[320px] max-w-sm`}>
      <div className="shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
         <h4 className="font-bold text-sm uppercase tracking-wide opacity-70 mb-0.5">
            {type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo'}
         </h4>
         <p className="font-bold text-base">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
};
