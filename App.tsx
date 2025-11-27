
import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { Rankings } from './components/Rankings';
import { AIReport } from './components/AIReport';
import { HomePage } from './components/HomePage';
import { AdminManagement } from './components/AdminManagement';
import { LoginModal } from './components/LoginModal';
import { CLASSES, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_USERS, CRITERIA_LIST, SLIDER_IMAGES } from './constants';
import { DailyLog, User, UserRole, ClassEntity, CriteriaConfig, Announcement, SliderImage } from './types';
import { LayoutDashboard, PenTool, BarChart3, Bot, Menu, X, LogOut, Settings, Award, AlertTriangle, UserCheck, Home, ArrowRight } from 'lucide-react';

type Tab = 'dashboard' | 'input' | 'rankings' | 'ai' | 'management';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInAdminMode, setIsInAdminMode] = useState(false); // New state to control view mode

  // --- GLOBAL STATE ---
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [classes, setClasses] = useState<ClassEntity[]>(CLASSES);
  const [criteriaList, setCriteriaList] = useState<CriteriaConfig[]>(CRITERIA_LIST);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>(SLIDER_IMAGES);

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
    setIsInAdminMode(true); // Automatically go to dashboard on login
    if (user.role === UserRole.ADMIN) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('input');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsInAdminMode(false);
    setActiveTab('dashboard');
  };

  // --- CRUD HANDLERS ---
  const handleAddUser = (user: User) => setUsers([...users, user]);
  const handleUpdateUser = (user: User) => setUsers(users.map(u => u.username === user.username ? user : u));
  const handleDeleteUser = (username: string) => setUsers(users.filter(u => u.username !== username));

  const handleAddClass = (cls: ClassEntity) => setClasses([...classes, cls]);
  const handleUpdateClass = (cls: ClassEntity) => setClasses(classes.map(c => c.id === cls.id ? cls : c));
  const handleDeleteClass = (id: string) => setClasses(classes.filter(c => c.id !== id));

  const handleAddCriteria = (crit: CriteriaConfig) => setCriteriaList([...criteriaList, crit]);
  const handleUpdateCriteria = (crit: CriteriaConfig) => setCriteriaList(criteriaList.map(c => c.id === crit.id ? crit : c));
  const handleDeleteCriteria = (id: string) => setCriteriaList(criteriaList.filter(c => c.id !== id));

  const handleAddAnnouncement = (ann: Announcement) => setAnnouncements([ann, ...announcements]);
  const handleUpdateAnnouncement = (ann: Announcement) => setAnnouncements(announcements.map(a => a.id === ann.id ? ann : a));
  const handleDeleteAnnouncement = (id: string) => setAnnouncements(announcements.filter(a => a.id !== id));

  const handleAddImage = (img: SliderImage) => setSliderImages([...sliderImages, img]);
  const handleUpdateImage = (img: SliderImage) => setSliderImages(sliderImages.map(i => i.id === img.id ? img : i));
  const handleDeleteImage = (id: string) => setSliderImages(sliderImages.filter(i => i.id !== id));

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

  // If not logged in OR (logged in but choosing to view Home Page)
  if (!currentUser || !isInAdminMode) {
    return (
      <>
        <HomePage 
          logs={logs} 
          classes={classes} 
          announcements={announcements}
          criteriaList={criteriaList}
          sliderImages={sliderImages}
          currentUser={currentUser}
          onLoginClick={() => setShowLoginModal(true)}
          onDashboardClick={() => setIsInAdminMode(true)}
        />
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onLoginSuccess={handleLoginSuccess}
          users={users}
        />
      </>
    );
  }

  // Admin/Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">NH</div>
          <span className="font-bold text-slate-800 text-lg">Sao Đỏ</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-30 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/30">
            ★
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-xl leading-none">Sao Đỏ</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Tiểu học Nguyễn Huệ</p>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          {/* Home Link */}
          <button
            onClick={() => setIsInAdminMode(false)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-primary-600 mb-4 group"
          >
            <Home size={20} className="text-slate-400 group-hover:text-primary-600" />
            Về Trang Chủ
          </button>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-2">Quản lý</div>
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
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white mb-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4"></div>
            <p className="text-xs text-slate-400 mb-1 font-bold uppercase">Người dùng</p>
            <p className="font-bold text-lg truncate">{currentUser.name}</p>
            <p className="text-xs text-primary-400 font-medium">{currentUser.role === UserRole.ADMIN ? 'Tổng Phụ Trách' : 'Sao Đỏ'}</p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition text-sm font-bold"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-slate-50/50">
        <header className="mb-8 hidden md:flex justify-between items-center">
           <div>
             <h2 className="text-3xl font-black text-slate-800">
               {navItems.find(i => i.id === activeTab)?.label}
             </h2>
             <p className="text-slate-500 font-medium mt-1">Hệ thống quản lý thi đua trực tuyến</p>
           </div>
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-600">Tuần 12 - Học Kỳ 1</span>
           </div>
        </header>

        <div className="max-w-7xl mx-auto animate-fade-in pb-10">
          {activeTab === 'dashboard' && (
             <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <PenTool size={80} />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                      <PenTool size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Số phiếu chấm</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">{logs.length}</p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Award size={80} />
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4">
                      <Award size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Lớp dẫn đầu</p>
                    <p className="text-4xl font-black text-slate-800 mt-1 truncate">
                       {/* Simplified top logic */}
                       {classes[0]?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertTriangle size={80} />
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                      <AlertTriangle size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Lỗi vi phạm</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">
                      {logs.reduce((acc, log) => acc + log.deductions.length, 0)}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <UserCheck size={80} />
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                      <UserCheck size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Sao Đỏ</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">
                      {users.filter(u => u.role === UserRole.RED_STAR).length}
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Award className="text-primary-600" />
                    Tổng quan xếp hạng tuần này
                  </h3>
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
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
               <Rankings logs={logs} classes={classes} />
            </div>
          )}

          {activeTab === 'ai' && currentUser.role === UserRole.ADMIN && (
            <AIReport logs={logs} classes={classes} criteriaList={criteriaList} />
          )}

          {activeTab === 'management' && currentUser.role === UserRole.ADMIN && (
            <AdminManagement 
              users={users}
              classes={classes}
              criteria={criteriaList}
              announcements={announcements}
              images={sliderImages}
              logs={logs}
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
              onAddImage={handleAddImage}
              onUpdateImage={handleUpdateImage}
              onDeleteImage={handleDeleteImage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
