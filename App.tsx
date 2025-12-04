
import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { Rankings } from './components/Rankings';
import { AIReport } from './components/AIReport';
import { HomePage } from './components/HomePage';
import { AdminManagement } from './components/AdminManagement';
import { LoginModal } from './components/LoginModal';
import { Toast, ToastType } from './components/Toast';
import { CLASSES as MOCK_CLASSES, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_USERS, CRITERIA_LIST as MOCK_CRITERIA, SLIDER_IMAGES as MOCK_IMAGES } from './constants';
import { DailyLog, User, UserRole, ClassEntity, CriteriaConfig, Announcement, SliderImage } from './types';
import { LayoutDashboard, PenTool, BarChart3, Bot, Menu, X, LogOut, Settings, Award, AlertTriangle, UserCheck, Home, ArrowRight, Database, ExternalLink, Copy, CheckCircle, Crown } from 'lucide-react';
import { 
  subscribeToAuth, 
  subscribeToCollection, 
  logoutUser,
  addLog,
  deleteLog,
  addClass, updateClass, deleteClass,
  addCriteria, updateCriteria, deleteCriteria,
  addAnnouncement, updateAnnouncement, deleteAnnouncement,
  addImage, updateImage, deleteImage,
  saveUserFirestore, deleteUserFirestore,
  seedDatabase,
  clearDatabase
} from './services/firebaseService';
import { isFirebaseConfigured } from './firebaseConfig';

type Tab = 'dashboard' | 'input' | 'rankings' | 'ai' | 'management';

function App() {
  const [isConfigured] = useState(isFirebaseConfigured());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInAdminMode, setIsInAdminMode] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  // --- GLOBAL STATE (MANAGED BY FIREBASE) ---
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [criteriaList, setCriteriaList] = useState<CriteriaConfig[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);

  const [loadingData, setLoadingData] = useState(true);

  // --- FIREBASE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!isConfigured) return;

    // 1. Subscribe to Auth State
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setIsInAdminMode(true);
        showToast(`Xin chào ${user.name}!`, 'success');
        if (user.role === UserRole.ADMIN) {
            setActiveTab('dashboard');
        } else {
            setActiveTab('input');
        }
      } else {
        setIsInAdminMode(false);
      }
    });

    // 2. Subscribe to Collections
    const unsubLogs = subscribeToCollection('logs', (data) => setLogs(data as DailyLog[]));
    const unsubClasses = subscribeToCollection('classes', (data) => setClasses(data as ClassEntity[]));
    const unsubCriteria = subscribeToCollection('criteria', (data) => setCriteriaList(data as CriteriaConfig[]));
    const unsubAnnounce = subscribeToCollection('announcements', (data) => setAnnouncements(data as Announcement[]));
    const unsubImages = subscribeToCollection('slider_images', (data) => setSliderImages(data as SliderImage[]));
    const unsubUsers = subscribeToCollection('users', (data) => setUsers(data as User[]));

    setLoadingData(false);

    return () => {
      unsubscribeAuth();
      unsubLogs();
      unsubClasses();
      unsubCriteria();
      unsubAnnounce();
      unsubImages();
      unsubUsers();
    };
  }, [isConfigured]);

  // --- HANDLERS ---
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleSaveLog = async (newLog: DailyLog) => {
    try {
      await addLog(newLog);
      showToast("Đã lưu kết quả chấm điểm lên Firebase!", 'success');
    } catch (e) {
      showToast("Lỗi khi lưu dữ liệu!", 'error');
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiếu chấm này? Hành động này sẽ cập nhật lại xếp hạng.")) {
        try {
            await deleteLog(id);
            showToast("Đã xóa phiếu chấm thành công!", 'info');
        } catch (e) {
            showToast("Lỗi khi xóa phiếu chấm", 'error');
        }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsInAdminMode(false);
    setActiveTab('dashboard');
    showToast("Đã đăng xuất.", 'info');
  };

  // --- CRUD HANDLERS (Async Firebase) ---
  const handleAddUser = async (user: User) => { 
      try {
          await saveUserFirestore(user); 
          showToast("Đã lưu thông tin người dùng (Cần tạo tài khoản Auth riêng)!"); 
      } catch (e) { showToast("Lỗi lưu người dùng", 'error'); }
  };
  const handleUpdateUser = async (user: User) => { 
      try {
          await saveUserFirestore(user);
          showToast("Cập nhật người dùng thành công!");
      } catch (e) { showToast("Lỗi cập nhật", 'error'); }
  };
  const handleDeleteUser = async (username: string) => { 
      try {
          await deleteUserFirestore(username);
          showToast("Đã xóa người dùng khỏi CSDL.", 'info'); 
      } catch (e) { showToast("Lỗi xóa", 'error'); }
  };

  const handleAddClass = async (cls: ClassEntity) => { await addClass(cls); showToast("Thêm lớp học thành công!"); };
  const handleUpdateClass = async (cls: ClassEntity) => { await updateClass(cls); showToast("Cập nhật lớp học thành công!"); };
  const handleDeleteClass = async (id: string) => { await deleteClass(id); showToast("Đã xóa lớp học.", 'info'); };

  const handleAddCriteria = async (crit: CriteriaConfig) => { await addCriteria(crit); showToast("Thêm quy định thành công!"); };
  const handleUpdateCriteria = async (crit: CriteriaConfig) => { await updateCriteria(crit); showToast("Cập nhật quy định thành công!"); };
  const handleDeleteCriteria = async (id: string) => { await deleteCriteria(id); showToast("Đã xóa quy định.", 'info'); };

  const handleAddAnnouncement = async (ann: Announcement) => { await addAnnouncement(ann); showToast("Đăng thông báo thành công!"); };
  const handleUpdateAnnouncement = async (ann: Announcement) => { await updateAnnouncement(ann); showToast("Cập nhật thông báo thành công!"); };
  const handleDeleteAnnouncement = async (id: string) => { await deleteAnnouncement(id); showToast("Đã xóa thông báo.", 'info'); };

  const handleAddImage = async (img: SliderImage) => { await addImage(img); showToast("Thêm hình ảnh thành công!"); };
  const handleUpdateImage = async (img: SliderImage) => { await updateImage(img); showToast("Cập nhật hình ảnh thành công!"); };
  const handleDeleteImage = async (id: string) => { await deleteImage(id); showToast("Đã xóa hình ảnh.", 'info'); };

  // --- DATA MANAGEMENT ---
  const handleSeedData = async () => {
    try {
        await seedDatabase(MOCK_CLASSES, MOCK_CRITERIA, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_IMAGES, MOCK_USERS);
        showToast("Khởi tạo dữ liệu mẫu thành công!", 'success');
    } catch (e: any) {
        console.error(e);
        if (e.code === 'permission-denied' || e.message?.includes('Missing or insufficient permissions')) {
            alert("🛑 LỖI QUYỀN TRUY CẬP FIREBASE!\n\nNguyên nhân: Firestore Rules đang chặn ghi dữ liệu.\n\nCách khắc phục:\n1. Vào Firebase Console -> Firestore Database -> Tab 'Rules'.\n2. Sửa code thành:\n   allow read, write: if true;\n3. Bấm 'Publish' và thử lại nút này.");
        } else {
            showToast("Lỗi khi khởi tạo dữ liệu: " + e.message, 'error');
        }
    }
  };

  const handleClearData = async () => {
     try {
        await clearDatabase();
        showToast("Đã xóa sạch cơ sở dữ liệu!", 'success');
     } catch (e) {
        console.error(e);
        showToast("Lỗi khi xóa dữ liệu", 'error');
     }
  };

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

  // --- FIREBASE NOT CONFIGURED SCREEN ---
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
         <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center">
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                 <AlertTriangle size={32} />
               </div>
               <h1 className="text-3xl font-black mb-2">Chưa kết nối Firebase</h1>
               <p className="text-orange-100">Ứng dụng cần cơ sở dữ liệu để hoạt động.</p>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                     <Database size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Tại sao tôi thấy màn hình này?</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                       File <code>firebaseConfig.ts</code> hiện đang chứa thông tin mẫu (placeholder). Bạn cần tạo một dự án Firebase miễn phí và dán cấu hình vào để tiếp tục.
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2">Hướng dẫn cài đặt nhanh</h3>
                  
                  <ol className="list-decimal pl-5 space-y-4 text-slate-600 text-sm">
                     <li className="pl-2">
                        Truy cập <a href="https://console.firebase.google.com/" target="_blank" className="text-primary-600 font-bold hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink size={12}/></a> và đăng nhập bằng Google.
                     </li>
                     <li className="pl-2">
                        Tạo một dự án mới (Đặt tên là "Sao Do App" hoặc tùy ý).
                     </li>
                     <li className="pl-2">
                        Trong trang tổng quan dự án:
                   <ul className="list-disc pl-5 mt-2 space-y-2 text-xs">
  <li>
    Vào <strong>Build</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>Get Started</strong> &rarr; Bật <strong>Email/Password</strong>.
  </li>
  <li>
    Vào <strong>Build</strong> &rarr; <strong>Firestore Database</strong> &rarr; <strong>Create Database</strong> &rarr; Chọn <strong>Start in test mode</strong>.
  </li>
  <li className="pl-2">
    Vào <strong>Project settings</strong> (icon bánh răng) &rarr; Kéo xuống phần <strong>Your apps</strong> &rarr; Chọn icon <strong>Web (&lt;/&gt;)</strong> để đăng ký app.
  </li>
</ul>
                     <li className="pl-2">
                        Copy đoạn mã <code>firebaseConfig</code> và dán đè vào file <code>firebaseConfig.ts</code> trong code editor của bạn.
                     </li>
                  </ol>
               </div>

               <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto relative group">
                  <pre>{`const firebaseConfig = {
  apiKey: "AIzaSyD-...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};`}</pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                     <span className="text-[10px] bg-slate-700 px-2 py-1 rounded">Mẫu config</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- LOADING SCREEN ---
  if (loadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
              <p className="text-slate-500 font-bold animate-pulse">Đang tải dữ liệu từ Firebase...</p>
          </div>
      );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {(!currentUser || !isInAdminMode) ? (
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
            onLoginSuccess={() => {}} // Handled by auth listener
            users={users} // For debug reference only
          />
          
          {/* Seed Data Button for Empty State (Helper for initial setup) */}
          {classes.length === 0 && (
             <div className="fixed bottom-4 right-4 z-50">
                 <button 
                    onClick={() => {
                        if (confirm("Hành động này sẽ ghi đè dữ liệu mẫu vào Firebase Database. Bạn có chắc chắn không?")) {
                            handleSeedData();
                        }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce"
                 >
                    <Database size={14} /> Khởi tạo dữ liệu mẫu
                 </button>
             </div>
          )}
        </>
      ) : (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
          {/* Mobile Header */}
          <div className="md:hidden bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">NH</div>
              <span className="font-bold text-slate-800 text-lg">i-Sao đỏ</span>
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
                <h1 className="font-extrabold text-slate-800 text-xl leading-none">i-Sao đỏ</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Thi đua liên đội TH Nguyễn Huệ</p>
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
                <div className="flex items-center gap-2 mb-1">
                   <p className="text-xs text-slate-400 font-bold uppercase">Người dùng</p>
                   {currentUser.role === UserRole.ADMIN && <Crown size={14} className="text-yellow-400" />}
                </div>
                <p className="font-bold text-lg truncate">{currentUser.name}</p>
                <p className={`text-xs font-medium ${currentUser.role === UserRole.ADMIN ? 'text-yellow-400 font-black uppercase tracking-wider' : 'text-primary-400'}`}>
                    {currentUser.role === UserRole.ADMIN ? 'Tổng Phụ Trách' : 'Sao Đỏ'}
                </p>
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
                 <p className="text-slate-500 font-medium mt-1">Hệ thống quản lý thi đua trực tuyến (Firebase Realtime)</p>
               </div>
               <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-600">Tuần 12 - Học Kỳ 1</span>
               </div>
            </header>

            <div className="max-w-7xl mx-auto animate-fade-in pb-10">
              {activeTab === 'dashboard' && (
                 <div className="space-y-8">
                    {/* Quick Action Section */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                                <PenTool size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Bắt đầu phiên làm việc</h3>
                                <p className="text-slate-500 text-sm">Cập nhật điểm thi đua và nề nếp cho các lớp.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTab('input')}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-500/30 flex items-center gap-2 transition transform hover:scale-105 active:scale-95 w-full md:w-auto justify-center"
                        >
                            <PenTool size={18} />
                            Chấm điểm cho lớp
                        </button>
                    </div>

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
                           {/* Simple logic for demo */}
                           {classes.length > 0 ? classes[0].name : 'N/A'}
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
                  logs={logs}
                  onDelete={handleDeleteLog}
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
                  onSeedData={handleSeedData}
                  onClearData={handleClearData}
                  onDeleteLog={handleDeleteLog}
                  showToast={showToast}
                />
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
