
import React, { useState } from 'react';
import { User } from '../types';
import { X, LogIn, KeyRound, Mail, ArrowLeft, Send } from 'lucide-react';
import { loginUser, resetPassword } from '../services/firebaseService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users?: User[]; // Deprecated but kept for compatibility interface
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getFullEmail = (val: string) => {
     return val.includes('@') ? val : `${val}@nguyenhue.edu.vn`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginEmail = getFullEmail(email);
      await loginUser(loginEmail, password);
      // onLoginSuccess sẽ được trigger bởi useEffect trong App.tsx nhờ lắng nghe auth state
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Tài khoản hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng kiểm tra kết nối.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');
      setLoading(true);

      try {
          const resetEmail = getFullEmail(email);
          await resetPassword(resetEmail);
          setSuccessMsg(`Đã gửi email khôi phục mật khẩu đến ${resetEmail}. Vui lòng kiểm tra hộp thư (cả mục Spam).`);
      } catch (err: any) {
          console.error(err);
          if (err.code === 'auth/user-not-found') {
              setError('Không tìm thấy tài khoản với email này.');
          } else {
              setError('Không thể gửi email. Vui lòng thử lại sau.');
          }
      } finally {
          setLoading(false);
      }
  };

  const switchMode = (reset: boolean) => {
      setIsResetMode(reset);
      setError('');
      setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
        <div className="bg-primary-600 p-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold backdrop-blur-md">
            {isResetMode ? <KeyRound size={32} /> : '★'}
          </div>
          <h2 className="text-2xl font-bold text-white">
              {isResetMode ? 'Khôi Phục Mật Khẩu' : 'Đăng Nhập'}
          </h2>
          <p className="text-primary-100 text-sm mt-1">Hệ thống Sao Đỏ Nguyễn Huệ</p>
        </div>

        {isResetMode ? (
            // RESET PASSWORD FORM
            <form onSubmit={handleResetPassword} className="p-8 space-y-6">
                {successMsg ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-medium">
                        {successMsg}
                        <button 
                            type="button" 
                            onClick={() => switchMode(false)} 
                            className="text-primary-600 font-bold block mt-2 hover:underline"
                        >
                            Quay lại đăng nhập
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 text-center">
                            Nhập tên đăng nhập hoặc email của bạn. Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu mới.
                        </p>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                            {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tài khoản</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={20} />
                                </div>
                                <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                                placeholder="admin@nguyenhue.edu.vn"
                                required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition transform hover:scale-[1.02]"
                        >
                            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Send size={18} />}
                            Gửi Liên Kết
                        </button>
                    </>
                )}
                
                {!successMsg && (
                    <button 
                        type="button"
                        onClick={() => switchMode(false)}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:text-primary-600 transition"
                    >
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                )}
            </form>
        ) : (
            // LOGIN FORM
            <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tài khoản</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={20} />
                    </div>
                    <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    placeholder="admin@nguyenhue.edu.vn"
                    required
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={20} />
                    </div>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    placeholder="Nhập mật khẩu"
                    required
                    />
                </div>
                <div className="text-right mt-1">
                    <button 
                        type="button" 
                        onClick={() => switchMode(true)}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                        Quên mật khẩu?
                    </button>
                </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition transform hover:scale-[1.02]"
            >
                {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ) : (
                <>
                    <LogIn size={20} />
                    Đăng Nhập
                </>
                )}
            </button>
            
            <div className="text-center text-xs text-slate-400 space-y-1">
                <p>Sử dụng tài khoản Email/Password đã tạo trên Firebase Auth.</p>
                <p>Nếu chưa có, vui lòng liên hệ Admin.</p>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};
