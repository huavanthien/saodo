
import React, { useState, useMemo } from 'react';
import { ClassEntity, CriteriaConfig, User, UserRole, CriteriaType, Announcement, DailyLog, SliderImage } from '../types';
import { Users, School, AlertTriangle, Plus, Trash2, Edit, Save, X, Bell, Pin, FileSpreadsheet, Download, CalendarRange, Filter, BookOpen, Image as ImageIcon, Database, RefreshCw, ClipboardList, AlertCircle, Search, Shield, UserCog, CheckSquare, Crown, Check, LogOut, Lock, KeyRound, Tag, Layers, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import * as XLSX from 'xlsx';
import { ToastType } from './Toast';
import { resetPassword } from '../services/firebaseService';

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
  onSeedData?: () => void;
  onClearData?: () => void;
  onDeleteLog?: (id: string) => void;
  showToast?: (message: string, type: ToastType) => void;
}

// Helper color generator for categories
const getCategoryColor = (type: string) => {
  const colors: Record<string, string> = {
    [CriteriaType.DONG_PHUC]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CriteriaType.VE_SINH]: 'bg-green-100 text-green-700 border-green-200',
    [CriteriaType.TRAT_TU]: 'bg-red-100 text-red-700 border-red-200',
    [CriteriaType.XEP_HANG]: 'bg-orange-100 text-orange-700 border-orange-200',
    [CriteriaType.HAT_DAU_GIO]: 'bg-purple-100 text-purple-700 border-purple-200',
    [CriteriaType.THE_DUC]: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
};

export const AdminManagement: React.FC<AdminManagementProps> = ({
  users, classes, criteria, announcements = [], logs = [], images = [],
  onAddUser, onUpdateUser, onDeleteUser,
  onAddClass, onUpdateClass, onDeleteClass,
  onAddCriteria, onUpdateCriteria, onDeleteCriteria,
  onAddAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement,
  onAddImage, onUpdateImage, onDeleteImage,
  onSeedData, onClearData, onDeleteLog,
  showToast = (_message: string, _type: ToastType) => {}
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'criteria' | 'announcements' | 'images' | 'logs' | 'database'>('users');

  // Modal States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole>('ALL');

  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isNewClass, setIsNewClass] = useState(false);

  const [editingCriteria, setEditingCriteria] = useState<CriteriaConfig | null>(null);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isNewCriteria, setIsNewCriteria] = useState(false);
  const [criteriaSearchTerm, setCriteriaSearchTerm] = useState('');
  const [criteriaTypeFilter, setCriteriaTypeFilter] = useState<string>('ALL');
  const [customCriteriaType, setCustomCriteriaType] = useState('');
  const [isCreatingNewType, setIsCreatingNewType] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isNewAnnouncement, setIsNewAnnouncement] = useState(false);

  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isNewImage, setIsNewImage] = useState(false);

  // Export & Logs Filter States
  const [exportType, setExportType] = useState<'week' | 'semester' | 'year'>('week');
  const [exportWeek, setExportWeek] = useState<number>(12);
  const [exportSemester, setExportSemester] = useState<number>(1);
  const [selectedLogWeek, setSelectedLogWeek] = useState<number>(12);

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
      const normalizedUsername = editingUser.username.includes('@') ? editingUser.username : `${editingUser.username}@nguyenhue.edu.vn`;
      if (users.some(u => u.username === normalizedUsername || u.username === editingUser.username)) {
        showToast('Tên đăng nhập/Email đã tồn tại!', 'error');
        return;
      }
      onAddUser({ ...editingUser, username: normalizedUsername });
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

  const toggleGradeAssignment = (grade: number) => {
    if (!editingUser) return;
    const classesInGrade = classesByGrade[grade] || [];
    const classIdsInGrade = classesInGrade.map(c => c.id);
    const currentIds = editingUser.assignedClassIds || [];
    
    // Check if all classes in this grade are already selected
    const allSelected = classIdsInGrade.every(id => currentIds.includes(id));
    
    let newIds;
    if (allSelected) {
        // Deselect all
        newIds = currentIds.filter(id => !classIdsInGrade.includes(id));
    } else {
        // Select all (add missing ones)
        const toAdd = classIdsInGrade.filter(id => !currentIds.includes(id));
        newIds = [...currentIds, ...toAdd];
    }
    setEditingUser({...editingUser, assignedClassIds: newIds});
  };

  const handleDeleteUserClick = (username: string) => {
    if (username.toLowerCase().includes('admin')) {
      showToast('Không thể xóa tài khoản Tổng Phụ Trách (Admin)!', 'error');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) {
      onDeleteUser(username);
    }
  };

  const handleResetPassword = async (username: string) => {
      const email = username.includes('@') ? username : `${username}@nguyenhue.edu.vn`;
      if (confirm(`Bạn có chắc muốn gửi email đặt lại mật khẩu tới ${email}?`)) {
          try {
              await resetPassword(email);
              showToast(`Đã gửi email khôi phục tới ${email}!`, 'success');
          } catch (e: any) {
              console.error(e);
              if (e.code === 'auth/user-not-found') {
                   showToast('Tài khoản này chưa được đăng ký trong hệ thống Auth!', 'error');
              } else {
                   showToast('Lỗi khi gửi email: ' + e.message, 'error');
              }
          }
      }
  };

  // Helper filter users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                            u.username.toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
        return matchSearch && matchRole;
    });
  }, [users, userSearchTerm, userRoleFilter]);

  // Helper group classes by grade
  const classesByGrade = useMemo(() => {
    const grouped: Record<number, ClassEntity[]> = {1: [], 2: [], 3: [], 4: [], 5: []};
    classes.forEach(c => {
        if (grouped[c.grade]) {
            grouped[c.grade].push(c);
        }
    });
    return grouped;
  }, [classes]);

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
      if (!editingClass.id) editingClass.id = editingClass.name;
      if (classes.some(c => c.id === editingClass.id)) {
        showToast('Mã lớp/Tên lớp đã tồn tại!', 'error');
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
  // Helper: Get unique criteria types dynamically
  const uniqueCriteriaTypes = useMemo(() => {
    const types = new Set<string>();
    // Add default types
    Object.values(CriteriaType).forEach(t => types.add(t));
    // Add custom types from existing criteria
    criteria.forEach(c => types.add(c.type));
    return Array.from(types).sort();
  }, [criteria]);

  const openAddCriteria = () => {
    setEditingCriteria({ id: '', name: '', maxPoints: 5, type: CriteriaType.TRAT_TU });
    setCustomCriteriaType('');
    setIsCreatingNewType(false);
    setIsNewCriteria(true);
    setIsCriteriaModalOpen(true);
  };

  const openEditCriteria = (crit: CriteriaConfig) => {
    setEditingCriteria({ ...crit });
    setCustomCriteriaType('');
    setIsCreatingNewType(false);
    setIsNewCriteria(false);
    setIsCriteriaModalOpen(true);
  };

  const handleSaveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriteria) return;

    // Use custom type if entered, otherwise use selected type
    const finalType = (isCreatingNewType && customCriteriaType.trim()) 
      ? customCriteriaType.trim() 
      : editingCriteria.type;
      
    const finalCriteria = { ...editingCriteria, type: finalType };

    if (isNewCriteria) {
      finalCriteria.id = `c${Date.now()}`;
      onAddCriteria(finalCriteria);
    } else {
      onUpdateCriteria(finalCriteria);
    }
    setIsCriteriaModalOpen(false);
  };

  const handleDeleteCriteriaClick = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tiêu chí này?')) {
      onDeleteCriteria(id);
    }
  };

  const filteredCriteria = useMemo(() => {
    return criteria.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(criteriaSearchTerm.toLowerCase());
      const matchType = criteriaTypeFilter === 'ALL' || c.type === criteriaTypeFilter;
      return matchSearch && matchType;
    });
  }, [criteria, criteriaSearchTerm, criteriaTypeFilter]);

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
            showToast("Không tìm thấy dữ liệu chấm điểm cho khoảng thời gian đã chọn!", 'error');
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
        
        const wscols = [
            {wch: 15}, {wch: 12}, {wch: 8}, {wch: 8}, {wch: 20}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 50}, {wch: 40}
        ];
        worksheet['!cols'] = wscols;

        // @ts-ignore
        XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");
        // @ts-ignore
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        
        showToast("Xuất báo cáo thành công!", 'success');
    } catch (error) {
        console.error(error);
        showToast("Có lỗi khi xuất file Excel!", 'error');
    }
  };

  // --- LOG DELETION HANDLER ---
  const handleLogDeletion = (id: string) => {
    if (onDeleteLog) {
        onDeleteLog(id);
    }
  };

  // --- RENDER USER TAB ---
  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc tài khoản..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
             </div>
             <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button 
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${userRoleFilter === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Tất cả
                 </button>
                 <button 
                  onClick={() => setUserRoleFilter(UserRole.ADMIN)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${userRoleFilter === UserRole.ADMIN ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Admin
                 </button>
                 <button 
                  onClick={() => setUserRoleFilter(UserRole.RED_STAR)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${userRoleFilter === UserRole.RED_STAR ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Sao Đỏ
                 </button>
             </div>
         </div>
         <button 
            onClick={openAddUser}
            className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 w-full md:w-auto justify-center"
         >
            <Plus size={18} /> Thêm người dùng
         </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Lớp phụ trách</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isAdmin = user.role === UserRole.ADMIN;
                return (
                  <tr key={user.username} className={`hover:bg-slate-50/80 transition ${isAdmin ? 'bg-purple-50/30' : ''}`}>
                    <td className="p-4 font-bold text-slate-700">{user.username.split('@')[0]}</td>
                    <td className="p-4 font-medium text-slate-800">{user.name}</td>
                    <td className="p-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                          <Crown size={12} fill="currentColor" /> Tổng Phụ Trách
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                          <Shield size={12} /> Sao Đỏ
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isAdmin ? (
                        <span className="text-slate-400 text-xs italic">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.assignedClassIds && user.assignedClassIds.length > 0 ? (
                            user.assignedClassIds.slice(0, 5).map(cid => (
                              <span key={cid} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                {cid}
                              </span>
                            ))
                          ) : (
                            <span className="text-red-400 text-xs italic flex items-center gap-1"><AlertCircle size={10}/> Chưa phân công</span>
                          )}
                          {user.assignedClassIds && user.assignedClassIds.length > 5 && (
                             <span className="text-xs text-slate-400 font-medium px-1">+{user.assignedClassIds.length - 5} lớp khác</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                       <button 
                        onClick={() => handleResetPassword(user.username)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-200 rounded-lg transition"
                        title="Gửi mail đặt lại mật khẩu"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button 
                        onClick={() => openEditUser(user)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUserClick(user.username)}
                        disabled={isAdmin}
                        className={`p-2 rounded-lg transition ${isAdmin ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                        title={isAdmin ? "Không thể xóa Admin" : "Xóa"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">Không tìm thấy người dùng nào.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Quản trị hệ thống</h2>
          <p className="text-slate-500 mt-1">Quản lý người dùng, lớp học, quy định và dữ liệu</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        {[
          { id: 'users', label: 'Người dùng', icon: Users },
          { id: 'classes', label: 'Lớp học', icon: School },
          { id: 'criteria', label: 'Quy định', icon: AlertTriangle },
          { id: 'announcements', label: 'Tin tức', icon: Bell },
          { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
          { id: 'logs', label: 'Nhật ký', icon: ClipboardList },
          { id: 'database', label: 'Dữ liệu', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in-up">
        {activeTab === 'users' && renderUsersTab()}

        {activeTab === 'classes' && (
          <div className="space-y-6">
             <div className="flex justify-end">
                <button onClick={openAddClass} className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20">
                  <Plus size={18} /> Thêm Lớp
                </button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {classes.map(cls => (
                   <div key={cls.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center relative group hover:shadow-md transition">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-lg mb-2">
                         {cls.grade}
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{cls.name}</h4>
                      <p className="text-xs text-slate-400">Khối {cls.grade}</p>
                      
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                         <button onClick={() => openEditClass(cls)} className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"><Edit size={12}/></button>
                         <button onClick={() => handleDeleteClassClick(cls.id)} className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"><Trash2 size={12}/></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* --- CRITERIA MANAGEMENT TAB --- */}
        {activeTab === 'criteria' && (
             <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Tìm kiếm quy định..."
                              value={criteriaSearchTerm}
                              onChange={(e) => setCriteriaSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    {/* Horizontal Category Filter */}
                    <div className="flex-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setCriteriaTypeFilter('ALL')}
                             className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${criteriaTypeFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                           >
                              Tất cả
                           </button>
                           {uniqueCriteriaTypes.map(t => (
                             <button
                               key={t}
                               onClick={() => setCriteriaTypeFilter(t)}
                               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${criteriaTypeFilter === t ? 'ring-2 ring-offset-1 ring-primary-500 ' + getCategoryColor(t) : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                    </div>

                    <button onClick={openAddCriteria} className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 w-full md:w-auto justify-center shrink-0">
                        <Plus size={18} /> Thêm Quy Định
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100">
                         <tr>
                            <th className="p-4">Tên quy định / Lỗi vi phạm</th>
                            <th className="p-4 text-center">Điểm trừ tối đa</th>
                            <th className="p-4">Nhóm phân loại</th>
                            <th className="p-4 text-center">Thao tác</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {filteredCriteria.length === 0 ? (
                             <tr>
                                 <td colSpan={4} className="p-8 text-center text-slate-400 italic">Không tìm thấy quy định nào.</td>
                             </tr>
                         ) : (
                             filteredCriteria.map(crit => (
                                <tr key={crit.id} className="hover:bg-slate-50 group transition">
                                   <td className="p-4 font-bold text-slate-700">{crit.name}</td>
                                   <td className="p-4 text-center">
                                       <span className="inline-block bg-red-100 text-red-600 font-black px-3 py-1 rounded-lg">
                                           -{crit.maxPoints}
                                       </span>
                                   </td>
                                   <td className="p-4">
                                       <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(crit.type)}`}>
                                           {crit.type}
                                       </span>
                                   </td>
                                   <td className="p-4 flex justify-center gap-2">
                                      <button onClick={() => openEditCriteria(crit)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="Sửa"><Edit size={16}/></button>
                                      <button onClick={() => handleDeleteCriteriaClick(crit.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Xóa"><Trash2 size={16}/></button>
                                   </td>
                                </tr>
                             ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
        )}
        
        {activeTab === 'announcements' && (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button onClick={openAddAnnouncement} className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20">
                        <Plus size={18} /> Đăng Tin Mới
                    </button>
                </div>
                <div className="grid gap-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                             <div>
                                 <h4 className={`font-bold text-lg ${ann.isImportant ? 'text-primary-700' : 'text-slate-800'} flex items-center gap-2`}>
                                    {ann.isImportant && <Pin size={16} fill="currentColor" />}
                                    {ann.title}
                                 </h4>
                                 <p className="text-slate-500 text-sm mt-1 mb-2 line-clamp-2">{ann.content}</p>
                                 <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{ann.date}</span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => openEditAnnouncement(ann)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit size={18}/></button>
                                <button onClick={() => handleDeleteAnnouncementClick(ann.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 size={18}/></button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'images' && (
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button onClick={openAddImage} className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20">
                        <Plus size={18} /> Thêm Hình Ảnh
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.map(img => (
                        <div key={img.id} className="group relative aspect-video rounded-2xl overflow-hidden shadow-md">
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                <button onClick={() => openEditImage(img)} className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50"><Edit size={20}/></button>
                                <button onClick={() => handleDeleteImageClick(img.id)} className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50"><Trash2 size={20}/></button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <h4 className="font-bold">{img.title}</h4>
                                <p className="text-xs opacity-80">{img.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* LOGS TAB - NEW */}
        {activeTab === 'logs' && (
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Nhật Ký Chấm Điểm</h3>
                                <p className="text-slate-500 text-sm">Xem và quản lý phiếu chấm của Sao Đỏ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-600">Chọn tuần:</span>
                             <select 
                                value={selectedLogWeek}
                                onChange={(e) => setSelectedLogWeek(parseInt(e.target.value))}
                                className="p-2 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-primary-500"
                             >
                                {Array.from({length: 35}, (_, i) => i + 1).map(w => (
                                    <option key={w} value={w}>Tuần {w}</option>
                                ))}
                             </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="p-4">Ngày</th>
                                    <th className="p-4">Lớp</th>
                                    <th className="p-4">Điểm</th>
                                    <th className="p-4">Lỗi vi phạm</th>
                                    <th className="p-4">Người chấm</th>
                                    <th className="p-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.filter(l => l.week === selectedLogWeek).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                            Không có dữ liệu chấm điểm nào trong tuần {selectedLogWeek}.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.filter(l => l.week === selectedLogWeek)
                                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(log => {
                                            const className = classes.find(c => c.id === log.classId)?.name || log.classId;
                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50">
                                                    <td className="p-4 text-sm font-bold text-slate-600">{log.date}</td>
                                                    <td className="p-4 text-lg font-black text-primary-700">{className}</td>
                                                    <td className="p-4">
                                                        <span className={`font-bold ${log.totalScore >= 100 ? 'text-green-600' : 'text-slate-800'}`}>
                                                            {log.totalScore}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {log.deductions.length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                {log.deductions.map((d, idx) => (
                                                                    <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 inline-block w-fit">
                                                                        {d.note || "Lỗi vi phạm"} (-{d.pointsLost})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            log.bonusPoints > 0 ? (
                                                                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-bold">
                                                                    +{log.bonusPoints} Điểm cộng
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">Không có</span>
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm font-medium text-slate-600">{log.reporterName}</td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => {
                                                                if(confirm("Bạn có chắc chắn muốn xóa phiếu chấm này?")) {
                                                                    handleLogDeletion(log.id);
                                                                }
                                                            }}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa phiếu chấm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'database' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                     <FileSpreadsheet size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Xuất báo cáo Excel</h3>
                  <p className="text-slate-500 mb-6">Tải xuống dữ liệu chấm điểm để lưu trữ hoặc in ấn.</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Chọn loại báo cáo</label>
                          <div className="flex gap-2">
                              <button onClick={() => setExportType('week')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${exportType === 'week' ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Tuần</button>
                              <button onClick={() => setExportType('semester')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${exportType === 'semester' ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Học Kỳ</button>
                          </div>
                      </div>

                      {exportType === 'week' && (
                          <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2">Chọn tuần học</label>
                             <select value={exportWeek} onChange={(e) => setExportWeek(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-700">
                                {Array.from({length: 35}, (_, i) => i + 1).map(w => <option key={w} value={w}>Tuần {w}</option>)}
                             </select>
                          </div>
                      )}
                      
                      {exportType === 'semester' && (
                          <div>
                             <label className="block text-sm font-bold text-slate-700 mb-2">Chọn học kỳ</label>
                             <select value={exportSemester} onChange={(e) => setExportSemester(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-700">
                                <option value={1}>Học kỳ 1</option>
                                <option value={2}>Học kỳ 2</option>
                             </select>
                          </div>
                      )}

                      <button onClick={handleExportExcel} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                          <Download size={20} /> Tải xuống .xlsx
                      </button>
                  </div>
               </div>

               <div className="space-y-6">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4">
                         <RefreshCw size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Khôi phục dữ liệu mẫu</h3>
                      <p className="text-slate-500 mb-4">Nếu cơ sở dữ liệu bị lỗi hoặc trống, bạn có thể nạp lại bộ dữ liệu mẫu ban đầu.</p>
                      <button 
                        onClick={() => {
                            if(confirm("Hành động này sẽ ghi đè dữ liệu hiện tại. Bạn chắc chắn chứ?")) {
                                if (onSeedData) onSeedData();
                            }
                        }}
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                      >
                         <Database size={20} /> Nạp Dữ Liệu Mẫu
                      </button>
                   </div>

                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                         <Trash2 size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa toàn bộ dữ liệu</h3>
                      <p className="text-slate-500 mb-4">Xóa sạch tất cả lớp học, quy định, nhật ký và tài khoản (Trừ Admin). Cẩn thận!</p>
                      <button 
                         onClick={() => {
                            if(confirm("CẢNH BÁO: Hành động này KHÔNG THỂ hoan tác. Bạn có chắc chắn muốn xóa sạch dữ liệu không?")) {
                                if (onClearData) onClearData();
                            }
                         }}
                         className="w-full bg-white border-2 border-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                         <AlertTriangle size={20} /> Xóa Sạch Database
                      </button>
                   </div>
               </div>
           </div>
        )}
      </div>

      {/* USER MODAL */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveUser}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                   {isNewUser ? <Plus className="text-primary-600" /> : <Edit className="text-blue-600" />}
                   {isNewUser ? 'Thêm người dùng mới' : 'Chỉnh sửa thông tin'}
                </h3>
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-8">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider border-b pb-2 mb-2">Thông tin tài khoản</h4>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Tên đăng nhập / Email</label>
                          <input 
                            type="text" 
                            required 
                            disabled={!isNewUser}
                            value={editingUser.username.replace('@nguyenhue.edu.vn', '')}
                            onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 font-bold text-slate-700 disabled:bg-slate-100 disabled:text-slate-500"
                          />
                          {isNewUser && <p className="text-xs text-slate-400 mt-1">Hệ thống tự động thêm @nguyenhue.edu.vn</p>}
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên hiển thị</label>
                          <input 
                            type="text" 
                            required 
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 font-medium"
                          />
                       </div>
                       {isNewUser && (
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
                            <input 
                              type="text" 
                              required 
                              value={editingUser.password || ''}
                              onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 font-mono"
                              placeholder="Ít nhất 6 ký tự"
                            />
                         </div>
                       )}
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò hệ thống</label>
                          <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-200">
                             <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition ${editingUser.role === UserRole.RED_STAR ? 'bg-white shadow-sm ring-2 ring-orange-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                                <input 
                                  type="radio" 
                                  name="role" 
                                  className="hidden"
                                  checked={editingUser.role === UserRole.RED_STAR}
                                  onChange={() => setEditingUser({...editingUser, role: UserRole.RED_STAR})}
                                />
                                <Shield size={18} className={editingUser.role === UserRole.RED_STAR ? 'text-orange-500' : 'text-slate-400'} />
                                <span className={`font-bold ${editingUser.role === UserRole.RED_STAR ? 'text-orange-700' : ''}`}>Sao Đỏ</span>
                             </label>
                             <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition ${editingUser.role === UserRole.ADMIN ? 'bg-white shadow-sm ring-2 ring-purple-500' : 'hover:bg-slate-200 text-slate-500'}`}>
                                <input 
                                  type="radio" 
                                  name="role" 
                                  className="hidden"
                                  checked={editingUser.role === UserRole.ADMIN}
                                  onChange={() => setEditingUser({...editingUser, role: UserRole.ADMIN})}
                                />
                                <Crown size={18} className={editingUser.role === UserRole.ADMIN ? 'text-purple-600' : 'text-slate-400'} />
                                <span className={`font-bold ${editingUser.role === UserRole.ADMIN ? 'text-purple-800' : ''}`}>Tổng Phụ Trách</span>
                             </label>
                          </div>
                       </div>
                    </div>

                    {/* Class Assignment */}
                    <div className={`space-y-4 ${editingUser.role === UserRole.ADMIN ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                       <div className="flex justify-between items-center border-b pb-2 mb-2">
                           <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Phân công lớp phụ trách</h4>
                           {editingUser.assignedClassIds && editingUser.assignedClassIds.length > 0 && (
                               <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                  Đã chọn {editingUser.assignedClassIds.length} lớp
                               </span>
                           )}
                       </div>
                       
                       {editingUser.role === UserRole.ADMIN && (
                           <div className="bg-purple-50 text-purple-700 p-3 rounded-xl text-sm flex items-center gap-2 font-bold mb-4">
                               <Lock size={16} /> Admin có quyền quản lý tất cả các lớp.
                           </div>
                       )}

                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {[1, 2, 3, 4, 5].map(grade => (
                             <div key={grade} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="font-black text-slate-700">KHỐI {grade}</span>
                                   <button 
                                      type="button"
                                      onClick={() => toggleGradeAssignment(grade)}
                                      className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                                   >
                                      Chọn cả khối
                                   </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {classesByGrade[grade]?.map(cls => {
                                      const isSelected = editingUser.assignedClassIds?.includes(cls.id);
                                      return (
                                        <button
                                           key={cls.id}
                                           type="button"
                                           onClick={() => toggleUserClassAssignment(cls.id)}
                                           className={`
                                              px-3 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-1.5
                                              ${isSelected 
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105' 
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                              }
                                           `}
                                        >
                                           {isSelected && <Check size={12} strokeWidth={4} />}
                                           {cls.name}
                                        </button>
                                      );
                                   })}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                 <button 
                    type="button" 
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition transform active:scale-95 flex items-center gap-2"
                 >
                    <Save size={20} />
                    {isNewUser ? 'Tạo Người Dùng' : 'Lưu Thay Đổi'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTHER MODALS (Class, Criteria, etc. - Simplified for brevity but functional) */}
      {isClassModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsClassModalOpen(false)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold mb-4">{isNewClass ? 'Thêm Lớp Mới' : 'Sửa Lớp'}</h3>
               <form onSubmit={handleSaveClass} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700">Tên lớp</label>
                     <input type="text" required value={editingClass.name} onChange={(e) => setEditingClass({...editingClass, name: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="VD: 1A1" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700">Khối</label>
                     <select value={editingClass.grade} onChange={(e) => setEditingClass({...editingClass, grade: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg">
                        {[1,2,3,4,5].map(g => <option key={g} value={g}>Khối {g}</option>)}
                     </select>
                  </div>
                  <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 mt-4">Lưu</button>
               </form>
           </div>
        </div>
      )}

      {/* CRITERIA MODAL */}
       {isCriteriaModalOpen && editingCriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCriteriaModalOpen(false)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                       {isNewCriteria ? <Plus size={20} className="text-primary-600" /> : <Edit size={20} className="text-blue-600" />}
                       {isNewCriteria ? 'Thêm Quy Định' : 'Chỉnh Sửa Quy Định'}
                   </h3>
                   <button onClick={() => setIsCriteriaModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSaveCriteria} className="p-6 space-y-5">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung / Tên lỗi</label>
                     <input 
                        type="text" 
                        required 
                        value={editingCriteria.name} 
                        onChange={(e) => setEditingCriteria({...editingCriteria, name: e.target.value})} 
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
                        placeholder="Ví dụ: Không đeo khăn quàng..." 
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1">Điểm trừ tối đa</label>
                     <div className="flex items-center gap-3">
                         <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={editingCriteria.maxPoints} 
                            onChange={(e) => setEditingCriteria({...editingCriteria, maxPoints: parseInt(e.target.value)})} 
                            className="flex-1 accent-primary-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                         />
                         <div className="w-16 text-center font-black text-xl text-red-600 border-2 border-red-100 bg-red-50 rounded-lg py-1">
                            -{editingCriteria.maxPoints}
                         </div>
                     </div>
                     <p className="text-xs text-slate-400 mt-1">Điểm này sẽ bị trừ khỏi quỹ điểm 100 hàng ngày của lớp.</p>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Phân loại / Nhóm lỗi</label>
                     <div className="space-y-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setIsCreatingNewType(false)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!isCreatingNewType ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Chọn nhóm có sẵn
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreatingNewType(true)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${isCreatingNewType ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Plus size={14} className="inline mr-1" /> Tạo nhóm mới
                            </button>
                        </div>

                        {/* Existing Types */}
                        {!isCreatingNewType && (
                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1 custom-scrollbar">
                                {uniqueCriteriaTypes.map(t => (
                                    <button 
                                        key={t}
                                        type="button"
                                        onClick={() => {
                                            setEditingCriteria({...editingCriteria, type: t});
                                            setCustomCriteriaType('');
                                        }}
                                        className={`
                                            border rounded-lg p-2 text-sm font-bold flex items-center justify-center gap-2 transition relative overflow-hidden
                                            ${editingCriteria.type === t ? `ring-2 ring-primary-500 ring-offset-1 ${getCategoryColor(t)}` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                        `}
                                    >
                                        {t}
                                        {editingCriteria.type === t && (
                                            <div className="absolute top-1 right-1">
                                                <CheckCircle2 size={12} className="text-current" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Create New Type */}
                        {isCreatingNewType && (
                            <div className="relative animate-fade-in">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên nhóm mới</label>
                                <input 
                                    type="text"
                                    placeholder="Ví dụ: An toàn giao thông..."
                                    value={customCriteriaType}
                                    onChange={(e) => setCustomCriteriaType(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-800 text-sm font-bold focus:ring-2 focus:ring-primary-500"
                                    autoFocus
                                />
                            </div>
                        )}
                     </div>
                  </div>
                  <div className="pt-4">
                      <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex justify-center items-center gap-2">
                          <Save size={18} /> Lưu Quy Định
                      </button>
                  </div>
               </form>
           </div>
        </div>
      )}

      {isAnnouncementModalOpen && editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAnnouncementModalOpen(false)}>
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold mb-4">{isNewAnnouncement ? 'Đăng Tin Mới' : 'Sửa Tin'}</h3>
               <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700">Tiêu đề</label>
                     <input type="text" required value={editingAnnouncement.title} onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700">Nội dung</label>
                     <textarea required rows={4} value={editingAnnouncement.content} onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})} className="w-full p-2 border rounded-lg resize-none" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700">Ngày đăng</label>
                     <input type="date" required value={editingAnnouncement.date} onChange={(e) => setEditingAnnouncement({...editingAnnouncement, date: e.target.value})} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                     <input type="checkbox" id="imp" checked={editingAnnouncement.isImportant} onChange={(e) => setEditingAnnouncement({...editingAnnouncement, isImportant: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
                     <label htmlFor="imp" className="text-sm font-bold text-slate-700">Tin quan trọng (Ghim đầu trang)</label>
                  </div>
                  <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 mt-4">Đăng</button>
               </form>
           </div>
        </div>
      )}

      {isImageModalOpen && editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsImageModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{isNewImage ? 'Thêm Hình Ảnh' : 'Sửa Hình Ảnh'}</h3>
                <form onSubmit={handleSaveImage} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Đường dẫn ảnh (URL)</label>
                        <input type="url" required value={editingImage.url} onChange={(e) => setEditingImage({...editingImage, url: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="https://example.com/image.jpg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Tiêu đề</label>
                        <input type="text" required value={editingImage.title} onChange={(e) => setEditingImage({...editingImage, title: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Mô tả phụ</label>
                        <input type="text" required value={editingImage.subtitle} onChange={(e) => setEditingImage({...editingImage, subtitle: e.target.value})} className="w-full p-2 border rounded-lg" />
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 mt-4">Lưu</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};
