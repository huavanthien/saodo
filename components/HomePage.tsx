import React, { useState } from 'react';
import { DailyLog, ClassEntity, Announcement, User, UserRole } from '../types';
import { Rankings } from './Rankings';
import { Announcements } from './Announcements';
import { ImageSlider } from './ImageSlider';
import { SLIDER_IMAGES } from '../constants';
import { LogIn, Award, Star, BookOpen, LayoutDashboard, User as UserIcon, ArrowRight, Calendar, X, Pin, Bell } from 'lucide-react';

interface HomePageProps {
  logs: DailyLog[];
  classes: ClassEntity[];
  announcements: Announcement[];
  currentUser: User | null;
  onLoginClick: () => void;
  onDashboardClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  logs, 
  classes, 
  announcements, 
  currentUser,
  onLoginClick,
  onDashboardClick 
}) => {
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  // Calculate School Year
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  // School year usually starts in August (8) or September (9)
  const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const schoolYear = `${startYear} - ${startYear + 1}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - Glass effect */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/30 transform hover:scale-105 transition-transform duration-300">
              NH
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 leading-none">TH Nguyễn Huệ</h1>
              <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mt-1">Cổng thi đua điện tử</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                    <span className="text-xs text-slate-500">{currentUser.role === UserRole.ADMIN ? 'Tổng Phụ Trách' : 'Sao Đỏ'}</span>
                 </div>
                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <UserIcon size={20} />
                 </div>
                 <button 
                  onClick={onDashboardClick}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-105 transition-all"
                 >
                   <span>{currentUser.role === UserRole.ADMIN ? 'Trang quản trị' : 'Sổ chấm điểm'}</span>
                   <ArrowRight size={16} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="group flex items-center gap-2 bg-white border-2 border-primary-100 text-primary-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-50 hover:border-primary-200 hover:shadow-md transition-all duration-300"
              >
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Đăng nhập Sao Đỏ</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Vibrant Gradient */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-rose-900 text-white overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-3/5 space-y-6 text-center md:text-left">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 animate-fade-in-up">
                   <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-white/20 shadow-sm">
                      <Star size={16} className="text-yellow-300 fill-yellow-300" />
                      <span>Hệ thống chấm điểm 4.0</span>
                   </div>
                   <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-white/10 shadow-sm text-yellow-100">
                      <Calendar size={16} />
                      <span>Năm học {schoolYear}</span>
                   </div>
               </div>
               
               <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight drop-shadow-md animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                  Thi Đua Nề Nếp<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                    Rèn Luyện Đạo Đức
                  </span>
               </h2>
               <p className="text-primary-100 text-lg md:text-xl font-medium max-w-xl mx-auto md:mx-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  Xây dựng môi trường học đường thân thiện, tích cực. Cập nhật xếp hạng thi đua nhanh chóng, minh bạch và công bằng cho mọi lớp học.
               </p>
               
               <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                  <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                     <Award className="text-yellow-300" />
                     <span className="font-bold">Xếp hạng tuần</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                     <BookOpen className="text-blue-300" />
                     <span className="font-bold">Báo cáo tự động</span>
                  </div>
               </div>
            </div>
            
            {/* 3D Illustration Placeholder */}
            <div className="md:w-2/5 flex justify-center relative animate-float">
               <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-white/10 to-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
                  <div className="text-[100px] md:text-[120px]">🏆</div>
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-white text-primary-600 p-4 rounded-2xl shadow-xl font-bold text-lg animate-bounce" style={{animationDuration: '3s'}}>
                     #1 Tuần này
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white text-slate-700 p-3 rounded-2xl shadow-xl font-bold flex items-center gap-2">
                     <span className="text-green-500">★</span> +10 Điểm
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-20 space-y-12">
        {/* Main Content Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Rankings (Takes 2/3) */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-3 bg-red-100 text-primary-600 rounded-xl">
                        <Award size={28} />
                     </div>
                     <h3 className="text-2xl font-extrabold text-slate-800">
                       Bảng Xếp Hạng
                     </h3>
                  </div>
                  <Rankings logs={logs} classes={classes} />
               </div>
            </div>
            
            {/* Right Column: Slider, Announcements & Rules (Takes 1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Image Slider */}
                <ImageSlider images={SLIDER_IMAGES} />

                {/* Announcements */}
                <Announcements 
                  announcements={announcements} 
                  onViewAll={() => setShowAllAnnouncements(true)}
                />
                
                {/* Rules */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-shadow">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2 relative z-10">
                     <BookOpen size={20} /> Quy định chấm điểm
                  </h4>
                  <ul className="space-y-3 relative z-10">
                    <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                       <span className="font-bold text-yellow-300 text-lg">100</span>
                       <span className="text-sm font-medium">Điểm tối đa mỗi ngày. Hãy giữ nề nếp thật tốt!</span>
                    </li>
                    <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                       <span className="font-bold text-red-300 text-lg">-5</span>
                       <span className="text-sm font-medium">Điểm trừ cho mỗi lần mất trật tự hoặc xả rác bừa bãi.</span>
                    </li>
                    <li className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/10">
                       <span className="font-bold text-green-300 text-lg">+</span>
                       <span className="text-sm font-medium">Điểm cộng khi làm việc tốt và tham gia phong trào.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <p className="font-bold text-white text-xl">Trường Tiểu học Nguyễn Huệ</p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-sm text-slate-400">
               <span>📍 Thôn Nam Thanh, xã Đắk Wil, tỉnh Lâm Đồng</span>
               <span className="hidden md:inline">•</span>
               <span>📞 (02613) 709 333</span>
               <span className="hidden md:inline">•</span>
               <span>✉️ lienhe@c1nguyenhue.edu.vn</span>
            </div>
            <div className="pt-8 border-t border-slate-800 mt-8 text-xs font-medium text-slate-600">
              © {new Date().getFullYear()} Sao Do Nguyen Hue App. Xây dựng vì học sinh thân yêu.
            </div>
         </div>
      </footer>

      {/* All Announcements Modal */}
      {showAllAnnouncements && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAllAnnouncements(false)}>
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
              <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100 sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                       <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Tất cả thông báo</h3>
                      <p className="text-xs text-slate-500 font-bold">{announcements.length} bản tin</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowAllAnnouncements(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 transition"
                 >
                    <X size={20} />
                 </button>
              </div>
              
              <div className="overflow-y-auto p-6 space-y-6">
                 {announcements.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">Không có dữ liệu.</div>
                 ) : (
                    announcements.map(item => (
                       <div key={item.id} className={`p-6 rounded-2xl border ${item.isImportant ? 'border-red-200 bg-red-50/20' : 'border-slate-100 bg-white hover:border-slate-300'} transition-all`}>
                          <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-3">
                             <h4 className={`text-lg font-bold ${item.isImportant ? 'text-primary-700' : 'text-slate-800'} flex items-start gap-2`}>
                                {item.isImportant && <Pin className="text-primary-500 shrink-0 mt-1" size={16} fill="currentColor" />}
                                {item.title}
                             </h4>
                             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap self-start">
                                {item.date}
                             </span>
                          </div>
                          <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                             {item.content}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};