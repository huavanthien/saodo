import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { Rankings } from './components/Rankings';
import { AIReport } from './components/AIReport';
import { HomePage } from './components/HomePage';
import { AdminManagement } from './components/AdminManagement';
import { LoginModal } from './components/LoginModal';
import { CLASSES, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_USERS, CRITERIA_LIST } from './constants';
import { DailyLog, User, UserRole, ClassEntity, CriteriaConfig, Announcement } from './types';
import { LayoutDashboard, PenTool, BarChart3, Bot, Menu, X, LogOut, Settings } from 'lucide-react';

type Tab = 'dashboard' | 'input' | 'rankings' | 'ai' | 'management';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- GLOBAL STATE ---
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [classes, setClasses] = useState<ClassEntity[]>(CLASSES);
  const [criteriaList, setCriteriaList] = useState<CriteriaConfig[]>(CRITERIA_LIST);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Load logs from local storage
  useEffect(() => {
    const savedLogs = localStorage.getItem('saodo_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(INITIAL_LOGS_MOCK);
    }
  }, []);

  // --- HANDLERS ---
  const handleSaveLog = (newLog: DailyLog) => {
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('saodo_logs', JSON.stringify(updatedLogs));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.ADMIN) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('input');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // --- CRUD HANDLERS FOR ADMIN ---
  
  // Users
  const handleAddUser = (user: User) => setUsers([...users, user]);
  const handleUpdateUser = (user: User) => setUsers(users.map(u => u.username === user.username ? user : u));
  const handleDeleteUser = (username: string) => setUsers(users.filter(u => u.username !== username));

  // Classes
  const handleAddClass = (cls: ClassEntity) => setClasses([...classes, cls]);
  const handleUpdateClass = (cls: ClassEntity) => setClasses(classes.map(c => c.id === cls.id ? cls : c));
  const handleDeleteClass = (id: string) => setClasses(classes.filter(c => c.id !== id));

  // Criteria
  const handleAddCriteria = (crit: CriteriaConfig) => setCriteriaList([...criteriaList, crit]);
  const handleUpdateCriteria = (crit: CriteriaConfig) => setCriteriaList(criteriaList.map(c => c.id === crit.id ? crit : c));
  const handleDeleteCriteria = (id: string) => setCriteriaList(criteriaList.filter(c => c.id !== id));

  // Announcements
  const handleAddAnnouncement = (ann: Announcement) => setAnnouncements([ann, ...announcements]);
  const handleUpdateAnnouncement = (ann: Announcement) => setAnnouncements(announcements.map(a => a.id === ann.id ? ann : a));
  const handleDeleteAnnouncement = (id: string) => setAnnouncements(announcements.filter(a => a.id !== id));


  // Define Nav Items based on Role
  const getNavItems = () => {
    const items = [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.RED_STAR] },
      { id: 'input', label: 'Chấm điểm', icon: PenTool, roles: [UserRole.ADMIN, UserRole.RED_STAR] },
      { id: 'rankings', label: 'Xếp hạng', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.RED_STAR] },
      { id: 'ai', label: 'Trợ lý AI', icon: Bot, roles: [UserRole.ADMIN] },
      { id: 'management', label: 'Quản trị', icon: Settings, roles: [UserRole.ADMIN] },
    ];

    if (!currentUser) return [];
    return items.filter(item => item.roles.includes(currentUser.role));
  };

  const navItems = getNavItems();

  // --- GUEST VIEW RENDER ---
  if (!currentUser) {
    return (
      <>
        <HomePage 
          logs={logs} 
          classes={classes} 
          announcements={announcements}
          onLoginClick={() => setShowLoginModal(true)} 
        />
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onLoginSuccess={handleLoginSuccess}
          users={users} // Pass dynamic users to login
        />
      </>
    );
  }

  // --- AUTHENTICATED VIEW RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            ★
          </div>
          <span className="font-bold text-slate-800">Sao Đỏ NH</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-10 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/30">
            ★
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Sao Đỏ</h1>
            <p className="text-xs text-slate-500 font-semibold truncate max-w-[120px]" title={currentUser.name}>
              {currentUser.role === UserRole.ADMIN ? 'Tổng Phụ Trách' : currentUser.name}
            </p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-1">Tuần hiện tại</p>
            <p className="font-bold">Tuần 12 - HK1</p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="mb-8 hidden md:block flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold text-slate-800">
               {navItems.find(i => i.id === activeTab)?.label}
             </h2>
             <p className="text-slate-500">Xin chào, {currentUser.name}</p>
           </div>
        </header>

        <div className="max-w-6xl mx-auto animate-fade-in">
          {activeTab === 'dashboard' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-semibold mb-1">Tổng số phiếu chấm</p>
                    <p className="text-3xl font-bold text-slate-800">{logs.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-semibold mb-1">Lớp dẫn đầu</p>
                    <p className="text-3xl font-bold text-primary-600">
                       {/* Simple logic to find top class */}
                       {classes[0]?.name || 'N/A'}
                    </p>
                  </div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-semibold mb-1">Tổng lỗi vi phạm</p>
                    <p className="text-3xl font-bold text-red-500">
                      {logs.reduce((acc, log) => acc + log.deductions.length, 0)}
                    </p>
                  </div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 text-sm font-semibold mb-1">Cập nhật lúc</p>
                    <p className="text-xl font-bold text-slate-800">{new Date().toLocaleTimeString('vi-VN')}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-700 mb-4">Tổng quan xếp hạng</h3>
                  <Rankings logs={logs} classes={classes} />
                </div>
             </div>
          )}

          {activeTab === 'input' && (
            <InputForm 
              onSave={handleSaveLog} 
              classes={classes} 
              criteriaList={criteriaList}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'rankings' && (
            <Rankings logs={logs} classes={classes} />
          )}

          {activeTab === 'ai' && currentUser.role === UserRole.ADMIN && (
            <AIReport logs={logs} classes={classes} />
          )}

          {activeTab === 'management' && currentUser.role === UserRole.ADMIN && (
            <AdminManagement 
              users={users}
              classes={classes}
              criteria={criteriaList}
              announcements={announcements}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              onAddCriteria={handleAddCriteria}
              onUpdateCriteria={handleUpdateCriteria}
              onDeleteCriteria={handleDeleteCriteria}
              onAddAnnouncement={handleAddAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;