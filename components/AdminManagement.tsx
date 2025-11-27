import React, { useState } from 'react';
import { ClassEntity, CriteriaConfig, User, UserRole, CriteriaType, Announcement } from '../types';
import { Users, School, AlertTriangle, Plus, Trash2, Edit, Save, X, Bell, Pin } from 'lucide-react';

interface AdminManagementProps {
  users: User[];
  classes: ClassEntity[];
  criteria: CriteriaConfig[];
  announcements?: Announcement[]; // Made optional to be backward compatible or strict
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
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  users, classes, criteria, announcements = [],
  onAddUser, onUpdateUser, onDeleteUser,
  onAddClass, onUpdateClass, onDeleteClass,
  onAddCriteria, onUpdateCriteria, onDeleteCriteria,
  onAddAnnouncement, onUpdateAnnouncement, onDeleteAnnouncement
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'criteria' | 'announcements'>('users');

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

  const tabs = [
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'classes', label: 'Lớp học', icon: School },
    { id: 'criteria', label: 'Tiêu chí', icon: AlertTriangle },
    { id: 'announcements', label: 'Tin tức', icon: Bell },
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
    </div>
  );
};