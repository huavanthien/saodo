
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, LogIn, KeyRound, Mail, ArrowLeft, Send, UserPlus, User as UserIcon, Shield, Crown } from 'lucide-react';
import { loginUser, resetPassword, registerUser, saveUserFirestore } from '../services/firebaseService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users?: User[]; 
}

type ModalMode = 'LOGIN' | 'REGISTER' | 'RESET';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<ModalMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.RED_STAR);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getFullEmail = (val: string) => {
     return val.includes('@') ? val : `${val}@nguyenhue.edu.vn`;
  };

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  const switchMode = (newMode: ModalMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginEmail = getFullEmail(email);
      await loginUser(loginEmail, password);
      // onLoginSuccess triggered by App.tsx auth listener
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Tài khoản hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setError('Lỗi đăng nhập: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự.');
          setLoading(false);
          return;
      }

      try {
          const registerEmail = getFullEmail(email);
          // 1. Create Auth User
          await registerUser(registerEmail, password);
          
          // 2. Save User Details to Firestore
          const newUser: User = {
              username: registerEmail,
              name: name || (registerEmail.split('@')[0]),
              role: role,
              assignedClassIds: []
          };
          await saveUserFirestore(newUser);

          setSuccessMsg('Đăng ký thành công! Đang tự động đăng nhập...');
          setTimeout(() => {
              onClose();
          }, 1500);
      } catch (err: any) {
          console.error(err);
          if (err.code === 'auth/email-already-in-use') {
              setError('Email/Tài khoản này đã được đăng ký.');
          } else if (err.code === 'auth/weak-password') {
              setError('Mật khẩu quá yếu (cần ít nhất 6 ký tự).');
          } else {
              setError('Lỗi đăng ký: ' + err.message);
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
          setSuccessMsg(`Đã gửi email khôi phục mật khẩu đến ${resetEmail}.`);
      } catch (err: any) {
          console.error(err);
          setError('Không thể gửi email. Vui lòng kiểm tra lại tên đăng nhập.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-primary-600 p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold backdrop-blur-md">
            {mode === 'RESET' ? <KeyRound size={32} /> : mode === 'REGISTER' ? <UserPlus size={32} /> : '★'}
          </div>
          <h2 className="text-2xl font-bold text-white">
              {mode === 'RESET' ? 'Khôi Phục Mật Khẩu' : mode === 'REGISTER' ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <p className="text-primary-100 text-sm mt-1">Hệ thống Sao Đỏ Nguyễn Huệ</p>
        </div>

        {/* Content */}
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 mb-6">
                {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-100 mb-6">
                {successMsg}
                </div>
            )}

            {mode === 'RESET' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <p className="text-sm text-slate-500 text-center">
                        Nhập tên đăng nhập hoặc email. Hệ thống sẽ gửi link đặt lại mật khẩu.
                    </p>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tài khoản</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={20} /></div>
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="admin@nguyenhue.edu.vn" required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Send size={18} />} Gửi Liên Kết
                    </button>
                    <button type="button" onClick={() => switchMode('LOGIN')} className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:text-primary-600 mt-4">
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                </form>
            )}

            {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tài khoản</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={20} /></div>
                                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="tên tài khoản" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><KeyRound size={20} /></div>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="******" required />
                            </div>
                            <div className="text-right mt-1">
                                <button type="button" onClick={() => switchMode('RESET')} className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">Quên mật khẩu?</button>
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><LogIn size={20} /> Đăng Nhập</>}
                    </button>
                    <div className="text-center pt-2">
                        <span className="text-sm text-slate-500">Chưa có tài khoản? </span>
                        <button type="button" onClick={() => switchMode('REGISTER')} className="text-sm font-bold text-primary-600 hover:underline">Đăng ký mới</button>
                    </div>
                </form>
            )}

            {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email / Tên đăng nhập</label>
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="admin hoặc saodo..." required />
                        <p className="text-[10px] text-slate-400 mt-1">* Tự động thêm @nguyenhue.edu.vn nếu thiếu</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><UserIcon size={18} /></div>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="Nguyễn Văn A" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu (6+ ký tự)</label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><KeyRound size={18} /></div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" placeholder="******" required minLength={6} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
                        <div className="flex gap-2">
                            <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer border transition ${role === UserRole.RED_STAR ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                <input type="radio" name="reg-role" className="hidden" checked={role === UserRole.RED_STAR} onChange={() => setRole(UserRole.RED_STAR)} />
                                <Shield size={16} /> <span className="text-sm font-bold">Sao Đỏ</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer border transition ${role === UserRole.ADMIN ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                <input type="radio" name="reg-role" className="hidden" checked={role === UserRole.ADMIN} onChange={() => setRole(UserRole.ADMIN)} />
                                <Crown size={16} /> <span className="text-sm font-bold">Admin</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2 transition mt-2">
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><UserPlus size={20} /> Đăng Ký</>}
                    </button>
                    <div className="text-center pt-1">
                        <button type="button" onClick={() => switchMode('LOGIN')} className="text-sm text-slate-500 hover:text-primary-600">Đã có tài khoản? Đăng nhập</button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
