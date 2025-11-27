import React from 'react';
import { DailyLog, ClassEntity, Announcement } from '../types';
import { Rankings } from './Rankings';
import { Announcements } from './Announcements';
import { LogIn } from 'lucide-react';

interface HomePageProps {
  logs: DailyLog[];
  classes: ClassEntity[];
  announcements: Announcement[];
  onLoginClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ logs, classes, announcements, onLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              NH
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">TH Nguyễn Huệ</h1>
              <p className="text-xs text-slate-500 font-semibold">Cổng thông tin thi đua</p>
            </div>
          </div>
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-primary-100 transition"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Đăng nhập Sao Đỏ</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-2">
            Thi Đua Nề Nếp - Rèn Luyện Đạo Đức
          </h2>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto">
            Hệ thống quản lý chấm điểm và xếp hạng thi đua minh bạch, công bằng dành cho học sinh trường Tiểu học Nguyễn Huệ.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Thông báo */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
               <h3 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-primary-500 pl-3">
                 Bảng Xếp Hạng Thi Đua
               </h3>
               <Rankings logs={logs} classes={classes} />
            </div>
            
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-secondary-500 pl-3">
                 Tin Tức & Thông Báo
              </h3>
              <Announcements announcements={announcements} />
              
              <div className="mt-6 bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
                <h4 className="font-bold text-lg mb-2">Quy định chấm điểm</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  <li>Điểm tối đa mỗi ngày: 100 điểm</li>
                  <li>Mất trật tự: -5 điểm/lần</li>
                  <li>Vệ sinh bẩn: -5 điểm/lần</li>
                  <li>Không khăn quàng: -2 điểm/bạn</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-8">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-bold text-white text-lg mb-2">Trường Tiểu học Nguyễn Huệ</p>
            <p className="text-sm">Địa chỉ: Thôn Nam Thanh, xã Đắk Wil, tỉnh Lâm Đồng</p>
            <p className="text-sm mt-1">Điện thoại: (02613) 709 333 - Email: lienhe@c1nguyenhue.edu.vn</p>
            <div className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500">
              © {new Date().getFullYear()} Sao Do Nguyen Hue App. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
};