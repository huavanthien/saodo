import React from 'react';
import { Announcement } from '../types';
import { Bell, Calendar, Pin } from 'lucide-react';

interface AnnouncementsProps {
  announcements: Announcement[];
}

export const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        <Bell className="text-primary-600" size={20} />
        <h2 className="text-lg font-bold text-slate-800">Thông báo từ nhà trường</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {announcements.map((item) => (
          <div key={item.id} className={`p-4 hover:bg-slate-50 transition ${item.isImportant ? 'bg-red-50/30' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold text-base ${item.isImportant ? 'text-primary-700' : 'text-slate-800'}`}>
                {item.isImportant && <Pin size={14} className="inline mr-1 text-primary-500 transform -rotate-45" />}
                {item.title}
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap ml-2">
                <Calendar size={12} />
                {item.date}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="p-8 text-center text-slate-400 italic">
            Hiện không có thông báo mới nào.
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-50 text-center">
        <button className="text-sm text-primary-600 font-semibold hover:underline">
          Xem tất cả thông báo
        </button>
      </div>
    </div>
  );
};