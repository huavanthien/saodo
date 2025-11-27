
import React, { useState } from 'react';
import { ClassEntity, CriteriaConfig, User, UserRole, CriteriaType, Announcement, DailyLog, SliderImage } from '../types';
import { Users, School, AlertTriangle, Plus, Trash2, Edit, Save, X, Bell, Pin, FileSpreadsheet, Download, CalendarRange, Filter, BookOpen, Image as ImageIcon } from 'lucide-react';
// @ts-ignore
import * as XLSX from 'xlsx';

interface AdminManagementProps {
  users: User[];
  classes: ClassEntity[];
  criteria: CriteriaConfig[];
  announcements?: Announcement[];
  logs?: DailyLog[];
  images?: SliderImage[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  onAddClass: (cls: ClassEntity) => void;
  onUpdateClass: (cls: ClassEntity) => void;
  onDeleteClass: (id: string) => void;
  onAddCriteria: (crit: CriteriaConfig) => void;
  onUpdateCriteria: (crit: CriteriaConfig) => void;
  onDeleteCriteria: (id: string) => void;
  onAddAnnouncement?: (ann: Announcement) => void;
  onUpdateAnnouncement?: (ann: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onAddImage?: (img: SliderImage) => void;
  onUpdateImage?: (img: SliderImage) => void;
  onDeleteImage?: (id: string) => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  users, classes, criteria, announcements = [], logs = [], images = [],
  onAddUser, onUpdateUser, onDeleteUser,
  onAddClass, onUpdateClass, onDeleteClass,
  onAddCriteria, onUpdateCriteria, onDeleteCriteria,
  onAddAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement,
  onAddImage, onUpdateImage, onDeleteImage
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'criteria' | 'announcements' | 'images' | 'reports'>('users');

  // Modal States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isNewClass, setIsNewClass] = useState(false);

  const [editingCriteria, setEditingCriteria] = useState<CriteriaConfig | null>(null);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isNewCriteria, setIsNewCriteria] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isNewAnnouncement, setIsNewAnnouncement] = useState(false);

  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isNewImage, setIsNewImage] = useState(false);

  // Export States
  const [exportType, setExportType] = useState<'week' | 'semester' | 'year'>('week');
  const [exportWeek, setExportWeek] = useState<number>(12);
  const [exportSemester, setExportSemester] = useState<number>(1);

  // --- Handlers for USER ---
  const openAddUser = () => {
    setEditingUser({ username: '', password: '', name: '', role: UserRole.RED_STAR, assignedClassIds: [] });
    setIsNewUser(true);
    setIsUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser({ ...user, assignedClassIds: user.assignedClassIds || [] });
    setIsNewUser(false);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    if (isNewUser) {
      // Check duplicate
      if (users.some(u => u.username === editingUser.username)) {
        alert('Tên đăng nhập đã tồn tại!');
        return;
      }
      onAddUser(editingUser);
    } else {
      onUpdateUser(editingUser);
    }
    setIsUserModalOpen(false);
  };

  const toggleUserClassAssignment = (classId: string) => {
    if (!editingUser) return;
    const currentAssignments = editingUser.assignedClassIds || [];
    let newAssignments;
    if (currentAssignments.includes(classId)) {
      newAssignments = currentAssignments.filter(id => id !== classId);
    } else {
      newAssignments = [...currentAssignments, classId];
    }
    setEditingUser({ ...editingUser, assignedClassIds: newAssignments });
  };

  const handleDeleteUserClick = (username: string) => {
    if (confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) {
      onDeleteUser(username);
    }
  };

  // --- Handlers for CLASS ---
  const openAddClass = () => {
    setEditingClass({ id: '', name: '', grade: 1 });
    setIsNewClass(true);
    setIsClassModalOpen(true);
  };

  const openEditClass = (cls: ClassEntity) => {
    setEditingClass({ ...cls });
    setIsNewClass(false);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    if (isNewClass) {
      if (!editingClass.id) editingClass.id = editingClass.name; // Simple ID gen
      if (classes.some(c => c.id === editingClass.id)) {
        alert('Mã lớp/Tên lớp đã tồn tại!');
        return;
      }
      onAddClass(editingClass);
    } else {
      onUpdateClass(editingClass);
    }
    setIsClassModalOpen(false);
  };

  const handleDeleteClassClick = (id: string) => {
    if (confirm('Xóa lớp học này sẽ ảnh hưởng đến lịch sử chấm điểm. Bạn có chắc không?')) {
      onDeleteClass(id);
    }
  };

  // --- Handlers for CRITERIA ---
  const openAddCriteria = () => {
    setEditingCriteria({ id: '', name: '', maxPoints: 1, type: CriteriaType.TRAT_TU });
    setIsNewCriteria(true);
    setIsCriteriaModalOpen(true);
  };

  const openEditCriteria = (crit: CriteriaConfig) => {
    setEditingCriteria({ ...crit });
    setIsNewCriteria(false);
    setIsCriteriaModalOpen(true);
  };

  const handleSaveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriteria) return;

    if (isNewCriteria) {
      editingCriteria.id = `c${Date.now()}`;
      onAddCriteria(editingCriteria);
    } else {
      onUpdateCriteria(editingCriteria);
    }
    setIsCriteriaModalOpen(false);
  };

  const handleDeleteCriteriaClick = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tiêu chí này?')) {
      onDeleteCriteria(id);
    }
  };

  // --- Handlers for ANNOUNCEMENTS ---
  const openAddAnnouncement = () => {
    setEditingAnnouncement({ 
      id: '', 
      title: '', 
      content: '', 
      date: new Date().toISOString().split('T')[0],
      isImportant: false 
    });
    setIsNewAnnouncement(true);
    setIsAnnouncementModalOpen(true);
  };

  const openEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement({ ...ann });
    setIsNewAnnouncement(false);
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !onAddAnnouncement || !onUpdateAnnouncement) return;

    if (isNewAnnouncement) {
      editingAnnouncement.id = `a${Date.now()}`;
      onAddAnnouncement(editingAnnouncement);
    } else {
      onUpdateAnnouncement(editingAnnouncement);
    }
    setIsAnnouncementModalOpen(false);
  };

  const handleDeleteAnnouncementClick = (id: string) => {
    if (!onDeleteAnnouncement) return;
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      onDeleteAnnouncement(id);
    }
  };

  // --- Handlers for IMAGES ---
  const openAddImage = () => {
    setEditingImage({ id: '', url: '', title: '', subtitle: '' });
    setIsNewImage(true);
    setIsImageModalOpen(true);
  };

  const openEditImage = (img: SliderImage) => {
    setEditingImage({ ...img });
    setIsNewImage(false);
    setIsImageModalOpen(true);
  };

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage || !onAddImage || !onUpdateImage) return;

    if (isNewImage) {
        editingImage.id = `img${Date.now()}`;
        onAddImage(editingImage);
    } else {
        onUpdateImage(editingImage);
    }
    setIsImageModalOpen(false);
  };

  const handleDeleteImageClick = (id: string) => {
    if (!onDeleteImage) return;
    if (confirm('Bạn có chắc muốn xóa hình ảnh này?')) {
        onDeleteImage(id);
    }
  };


  // --- EXPORT HANDLER ---
  const handleExportExcel = () => {
    try {
        let filteredLogs = [...logs];
        let fileName = 'BaoCao_NamHoc';

        // Filtering Logic
        if (exportType === 'week') {
            filteredLogs = logs.filter(l => l.week === exportWeek);
            fileName = `BaoCao_Tuan${exportWeek}`;
        } else if (exportType === 'semester') {
            if (exportSemester === 1) {
                filteredLogs = logs.filter(l => l.week >= 1 && l.week <= 18);
                fileName = `BaoCao_HocKy1`;
            } else {
                filteredLogs = logs.filter(l => l.week >= 19 && l.week <= 35);
                fileName = `BaoCao_HocKy2`;
            }
        }

        if (filteredLogs.length === 0) {
            alert("Không tìm thấy dữ liệu chấm điểm cho khoảng thời gian đã chọn!");
            return;
        }

        const rows = filteredLogs.map(log => {
            const className = classes.find(c => c.id === log.classId)?.name || log.classId;
            const violations = log.deductions.map(d => {
                const critName = criteria.find(c => c.id === d.criteriaId)?.name || d.criteriaId;
                return `${critName} (-${d.pointsLost})`;
            }).join('; ');
            
            const totalDeducted = log.deductions.reduce((acc, curr) => acc + curr.pointsLost, 0);

            return {
                'Mã phiếu': log.id,
                'Ngày': log.date,
                'Tuần học': log.week,
                'Lớp': className,
                'Người chấm': log.reporterName,
                'Tổng điểm': log.totalScore,
                'Điểm trừ': totalDeducted,
                'Điểm cộng': log.bonusPoints,
                'Chi tiết vi phạm': violations || 'Không có',
                'Nhận xét': log.comment
            };
        });

        // @ts-ignore
        const worksheet = XLSX.utils.json_to_sheet(rows);
        // @ts-ignore
        const workbook = XLSX.utils.book_new();
        
        // Auto-width columns
        const wscols = [
            {wch: 15}, {wch: 12}, {wch: 8}, {wch: 8}, {wch: 20}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 50}, {wch: 40}
        ];
        worksheet['!cols'] = wscols;

        // @ts-ignore
        XLSX.utils.book_append_sheet(workbook, worksheet, "DuLieu");
        
        const dateStr = new Date().toISOString().split('T')[0];
        // @ts-ignore
        XLSX.writeFile(workbook, `${fileName}_${dateStr}.xlsx`);
    } catch (error) {
        console.error("Export error", error);
        alert("Có lỗi khi xuất file. Vui lòng thử lại.");
    }
  };

  const tabs = [
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'classes', label: 'Lớp học', icon: School },
    { id: 'criteria', label: 'Quy định', icon: BookOpen },
    { id: 'announcements', label: 'Tin tức', icon: Bell },
    { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
    { id: 'reports', label: 'Xuất dữ liệu', icon: FileSpreadsheet },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] relative">
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] py-4 text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ================= USERS TAB ================= */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Danh sách người dùng</h3>
              <button 
                onClick={openAddUser}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition"
              >
                <Plus size={16} /> Thêm người dùng
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-3">Tên đăng nhập</th>
                    <th className="p-3">Họ tên</th>
                    <th className="p-3">Vai trò</th>
                    <th className="p-3">Lớp phụ trách</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{u.username}</td>
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {u.role === UserRole.ADMIN ? 'Tổng Phụ Trách' : 'Sao Đỏ'}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs truncate" title={u.assignedClassIds?.join(', ')}>
                        {u.assignedClassIds?.join(', ') || '-'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => openEditUser(u)} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteUserClick(u.username)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CLASSES TAB ================= */}
        {activeTab === 'classes' && (
           <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Danh sách lớp học</h3>
              <button 
                onClick={openAddClass}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition"
              >
                <Plus size={16} /> Thêm lớp
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {classes.map(c => (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:shadow-md transition bg-slate-50 group">
                  <div>
                    <p className="font-bold text-lg text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">Khối {c.grade}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditClass(c)} className="text-blue-400 hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteClassClick(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
           </div>
        )}

        {/* ================= CRITERIA TAB ================= */}
        {activeTab === 'criteria' && (
           <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Quy định chấm điểm</h3>
              <button 
                onClick={openAddCriteria}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition"
              >
                <Plus size={16} /> Thêm tiêu chí
              </button>
            </div>
            <div className="space-y-3">
              {criteria.map(c => (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      -{c.maxPoints}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{c.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                        onClick={() => openEditCriteria(c)}
                        className="p-2 text-slate-400 hover:text-blue-600"
                     >
                        <Edit size={18} />
                     </button>
                     <button 
                        onClick={() => handleDeleteCriteriaClick(c.id)}
                        className="p-2 text-slate-400 hover:text-red-600"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
           </div>
        )}

        {/* ================= ANNOUNCEMENTS TAB ================= */}
        {activeTab === 'announcements' && (
           <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Tin tức & Thông báo</h3>
              <button 
                onClick={openAddAnnouncement}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition"
              >
                <Plus size={16} /> Viết thông báo
              </button>
            </div>
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className={`p-4 border rounded-xl flex items-start justify-between hover:bg-slate-50 transition ${ann.isImportant ? 'border-l-4 border-l-primary-500 bg-red-50/20' : 'border-slate-200'}`}>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {ann.isImportant && <Pin size={14} className="text-primary-600 fill-current transform -rotate-45" />}
                      <h4 className={`font-bold text-lg ${ann.isImportant ? 'text-primary-700' : 'text-slate-800'}`}>{ann.title}</h4>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{ann.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                     <button 
                        onClick={() => openEditAnnouncement(ann)}
                        className="p-2 text-slate-400 hover:text-blue-600"
                     >
                        <Edit size={18} />
                     </button>
                     <button 
                        onClick={() => handleDeleteAnnouncementClick(ann.id)}
                        className="p-2 text-slate-400 hover:text-red-600"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  Chưa có thông báo nào. Hãy thêm thông báo mới!
                </div>
              )}
            </div>
           </div>
        )}

        {/* ================= IMAGES TAB (NEW) ================= */}
        {activeTab === 'images' && (
            <div>
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-800">Quản lý hình ảnh (Slide trang chủ)</h3>
               <button 
                 onClick={openAddImage}
                 className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition"
               >
                 <Plus size={16} /> Thêm hình ảnh
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {images.map(img => (
                 <div key={img.id} className="flex gap-4 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                    <img src={img.url} alt={img.title} className="w-24 h-24 object-cover rounded-lg bg-slate-200" />
                    <div className="flex-1 overflow-hidden">
                       <h4 className="font-bold text-slate-800 truncate">{img.title}</h4>
                       <p className="text-xs text-slate-500 truncate mb-1">{img.subtitle}</p>
                       <p className="text-xs text-blue-500 truncate bg-blue-50 p-1 rounded font-mono">{img.url}</p>
                    </div>
                    <div className="flex flex-col justify-center gap-2 shrink-0 border-l pl-3 ml-2 border-slate-100">
                        <button onClick={() => openEditImage(img)} className="text-blue-400 hover:text-blue-600"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteImageClick(img.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
               {images.length === 0 && (
                 <div className="col-span-2 text-center py-10 text-slate-400 italic">
                   Chưa có hình ảnh nào.
                 </div>
               )}
             </div>
            </div>
        )}

        {/* ================= REPORTS TAB ================= */}
        {activeTab === 'reports' && (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-xl shadow-green-100">
                    <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Xuất dữ liệu hệ thống</h3>
                <p className="text-slate-500 mb-8">
                    Tải xuống nhật ký chấm điểm dưới định dạng Excel (.xlsx). Chọn khoảng thời gian bạn muốn xuất báo cáo.
                </p>

                <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                        <Filter size={16} /> Bộ lọc xuất dữ liệu
                    </h4>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            <button 
                                onClick={() => setExportType('week')} 
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${exportType === 'week' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Theo Tuần
                            </button>
                            <button 
                                onClick={() => setExportType('semester')} 
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${exportType === 'semester' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Học Kỳ
                            </button>
                            <button 
                                onClick={() => setExportType('year')} 
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${exportType === 'year' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Cả Năm
                            </button>
                        </div>

                        {exportType === 'week' && (
                            <div className="relative">
                                <select 
                                    value={exportWeek} 
                                    onChange={(e) => setExportWeek(parseInt(e.target.value))}
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer shadow-sm"
                                >
                                    {Array.from({length: 35}, (_, i) => i + 1).map(w => (
                                        <option key={w} value={w}>Tuần {w}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <CalendarRange size={16} />
                                </div>
                            </div>
                        )}

                        {exportType === 'semester' && (
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                <button 
                                    onClick={() => setExportSemester(1)}
                                    className={`px-3 py-1.5 text-sm font-bold rounded-lg transition ${exportSemester === 1 ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Học Kỳ 1
                                </button>
                                <button 
                                    onClick={() => setExportSemester(2)}
                                    className={`px-3 py-1.5 text-sm font-bold rounded-lg transition ${exportSemester === 2 ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Học Kỳ 2
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <button 
                    onClick={handleExportExcel}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-600/30 flex items-center gap-3 transition transform hover:scale-105 active:scale-95"
                >
                    <Download size={24} />
                    Tải về file Excel
                </button>
                
                <p className="mt-4 text-xs text-slate-400 italic">
                    File sẽ được lưu với tên tương ứng (VD: BaoCao_Tuan12.xlsx)
                </p>
            </div>
        )}
      </div>

      {/* ================= USER MODAL ================= */}
      {isUserModalOpen && editingUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xl font-bold text-slate-800">{isNewUser ? 'Thêm người dùng' : 'Sửa người dùng'}</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên đăng nhập</label>
                  <input 
                    type="text" 
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={!isNewUser} // Cannot change username when editing
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                  <input 
                    type="text" 
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Vai trò</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={UserRole.ADMIN}>Tổng Phụ Trách</option>
                    <option value={UserRole.RED_STAR}>Sao Đỏ</option>
                  </select>
                </div>
                {editingUser.role === UserRole.RED_STAR && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phụ trách các lớp</label>
                    <div className="border border-slate-300 rounded-lg max-h-48 overflow-y-auto p-2 bg-slate-50 space-y-1">
                       {classes.map(c => (
                         <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editingUser.assignedClassIds?.includes(c.id)}
                              onChange={() => toggleUserClassAssignment(c.id)}
                              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                            />
                            <span className="text-sm text-slate-700">{c.name} (Khối {c.grade})</span>
                         </label>
                       ))}
                    </div>
                  </div>
                )}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Hủy</button>
                  <button type="submit" className="flex-1 py-2 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"><Save size={18} /> Lưu</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ================= CLASS MODAL ================= */}
      {isClassModalOpen && editingClass && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xl font-bold text-slate-800">{isNewClass ? 'Thêm lớp học' : 'Sửa lớp học'}</h3>
                <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên lớp (Ví dụ: 5C)</label>
                  <input 
                    type="text" 
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Khối</label>
                  <select 
                    value={editingClass.grade}
                    onChange={(e) => setEditingClass({...editingClass, grade: parseInt(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>Khối {g}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsClassModalOpen(false)} className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Hủy</button>
                  <button type="submit" className="flex-1 py-2 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"><Save size={18} /> Lưu</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ================= CRITERIA MODAL ================= */}
      {isCriteriaModalOpen && editingCriteria && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xl font-bold text-slate-800">{isNewCriteria ? 'Thêm tiêu chí' : 'Sửa tiêu chí'}</h3>
                <button onClick={() => setIsCriteriaModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveCriteria} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tên lỗi vi phạm</label>
                  <input 
                    type="text" 
                    value={editingCriteria.name}
                    onChange={(e) => setEditingCriteria({...editingCriteria, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Điểm trừ (Max)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={editingCriteria.maxPoints}
                    onChange={(e) => setEditingCriteria({...editingCriteria, maxPoints: parseInt(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nhóm vi phạm</label>
                  <select 
                    value={editingCriteria.type}
                    onChange={(e) => setEditingCriteria({...editingCriteria, type: e.target.value as CriteriaType})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(CriteriaType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCriteriaModalOpen(false)}
                    className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Lưu thay đổi
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ================= ANNOUNCEMENT MODAL ================= */}
      {isAnnouncementModalOpen && editingAnnouncement && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xl font-bold text-slate-800">{isNewAnnouncement ? 'Đăng thông báo mới' : 'Sửa thông báo'}</h3>
                <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề thông báo</label>
                  <input 
                    type="text" 
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ví dụ: Kế hoạch tuần 15"
                    required
                  />
                </div>

                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Ngày đăng</label>
                      <input 
                        type="date" 
                        value={editingAnnouncement.date}
                        onChange={(e) => setEditingAnnouncement({...editingAnnouncement, date: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                   </div>
                   <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editingAnnouncement.isImportant}
                          onChange={(e) => setEditingAnnouncement({...editingAnnouncement, isImportant: e.target.checked})}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-sm font-bold text-slate-700">Tin quan trọng (Ghim)</span>
                      </label>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung</label>
                  <textarea 
                    value={editingAnnouncement.content}
                    onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
                    placeholder="Nhập nội dung chi tiết..."
                    required
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(false)}
                    className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Lưu thông báo
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ================= IMAGE MODAL ================= */}
      {isImageModalOpen && editingImage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-xl font-bold text-slate-800">{isNewImage ? 'Thêm hình ảnh' : 'Sửa hình ảnh'}</h3>
                <button onClick={() => setIsImageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveImage} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Đường dẫn hình ảnh (URL)</label>
                  <input 
                    type="text" 
                    value={editingImage.url}
                    onChange={(e) => setEditingImage({...editingImage, url: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {editingImage.url && (
                    <div className="mt-2 w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={editingImage.url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề chính</label>
                  <input 
                    type="text" 
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ví dụ: Lễ khai giảng"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                  <input 
                    type="text" 
                    value={editingImage.subtitle}
                    onChange={(e) => setEditingImage({...editingImage, subtitle: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ví dụ: Chào đón năm học mới 2025"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsImageModalOpen(false)}
                    className="flex-1 py-2 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Lưu hình ảnh
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
