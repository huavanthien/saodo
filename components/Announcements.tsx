import React from 'react';
import { Announcement } from '../types';
import { Bell, Calendar, Pin, ArrowRight } from 'lucide-react';

interface AnnouncementsProps {
  announcements: Announcement[];
  onViewAll?: () => void;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ announcements, onViewAll }) => {
  // Only show the first 3 announcements in the widget
  const displayList = announcements.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden w-full">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        <Bell className="text-primary-600" size={20} />
        <h2 className="text-lg font-bold text-slate-800">Thông báo từ nhà trường</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {displayList.map((item) => (
          <div key={item.id} className={`p-4 hover:bg-slate-50 transition cursor-pointer ${item.isImportant ? 'bg-red-50/30' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold text-base line-clamp-2 ${item.isImportant ? 'text-primary-700' : 'text-slate-800'}`}>
                {item.isImportant && <Pin size={14} className="inline mr-1 text-primary-500 transform -rotate-45" />}
                {item.title}
              </h3>
            </div>
            <div className="flex justify-between items-end mt-2">
               <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 flex-1 pr-4">{item.content}</p>
               <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm">
                <Calendar size={10} />
                {item.date}
              </span>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="p-8 text-center text-slate-400 italic">
            Hiện không có thông báo mới nào.
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
        <button 
          onClick={onViewAll}
          className="text-sm text-primary-600 font-bold hover:text-primary-700 hover:underline flex items-center justify-center gap-1 w-full py-1"
        >
          Xem tất cả ({announcements.length}) <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};