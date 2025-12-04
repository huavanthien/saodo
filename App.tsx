import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { Rankings } from './components/Rankings';
import { AIReport } from './components/AIReport';
import { HomePage } from './components/HomePage';
import { AdminManagement } from './components/AdminManagement';
import { LoginModal } from './components/LoginModal';
import { Toast, ToastType } from './components/Toast'; // Đảm bảo bạn có file component Toast, nếu không hãy comment dòng này và xóa usage
import { CLASSES as MOCK_CLASSES, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_USERS, CRITERIA_LIST as MOCK_CRITERIA, SLIDER_IMAGES as MOCK_IMAGES } from './constants';
import { DailyLog, User, UserRole, ClassEntity, CriteriaConfig, Announcement, SliderImage } from './types';
import { LayoutDashboard, PenTool, BarChart3, Bot, Menu, X, LogOut, Settings, Award, AlertTriangle, UserCheck, Home, Database, ExternalLink } from 'lucide-react';
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

  const showToast = (message: string, type: ToastType = 'success') => {
    if (setToast) setToast({ message, type });
    else alert(message);
  };

  const handleSaveLog = async (newLog: DailyLog) => {
    try {
      await addLog(newLog);
      showToast("Đã lưu kết quả chấm điểm!", 'success');
    } catch (e) {
      showToast("Lỗi khi lưu dữ liệu!", 'error');
    }
  };

  const handleDeleteLog = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Bạn có chắc chắn muốn xóa phiếu chấm này?")) {
        try {
            await deleteLog(id);
            showToast("Đã xóa phiếu chấm!", 'info');
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
  };

  // --- CRUD HANDLERS ---
  const handleAddUser = async (user: User) => { await saveUserFirestore(user); };
  const handleUpdateUser = async (user: User) => { await saveUserFirestore(user); };
  const handleDeleteUser = async (username: string) => { await deleteUserFirestore(username); };

  const handleAddClass = async (cls: ClassEntity) => { await addClass(cls); };
  const handleUpdateClass = async (cls: ClassEntity) => { await updateClass(cls); };
  const handleDeleteClass = async (id: string) => { await deleteClass(id); };

  const handleAddCriteria = async (crit: CriteriaConfig) => { await addCriteria(crit); };
  const handleUpdateCriteria = async (crit: CriteriaConfig) => { await updateCriteria(crit); };
  const handleDeleteCriteria = async (id: string) => { await deleteCriteria(id); };

  const handleAddAnnouncement = async (ann: Announcement) => { await addAnnouncement(ann); };
  const handleUpdateAnnouncement = async (ann: Announcement) => { await updateAnnouncement(ann); };
  const handleDeleteAnnouncement = async (id: string) => { await deleteAnnouncement(id); };

  const handleAddImage = async (img: SliderImage) => { await addImage(img); };
  const handleUpdateImage = async (img: SliderImage) => { await updateImage(img); };
  const handleDeleteImage = async (id: string) => { await deleteImage(id); };

  const handleSeedData = async () => {
    try {
        await seedDatabase(MOCK_CLASSES, MOCK_CRITERIA, INITIAL_LOGS_MOCK, MOCK_ANNOUNCEMENTS, MOCK_IMAGES, MOCK_USERS);
        showToast("Đã khởi tạo dữ liệu mẫu!", 'success');
    } catch (e: any) {
        alert("Lỗi: " + e.message);
    }
  };

  const handleClearData = async () => {
     await clearDatabase();
     showToast("Chức năng xóa sạch chưa được kích hoạt.", 'info');
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
         <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-10">
           <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
           <h1 className="text-2xl font-bold mb-2">Chưa cấu hình Firebase</h1>
           <p className="text-slate-600 mb-6">Vui lòng cập nhật file <code>src/firebaseConfig.ts</code> với thông tin dự án của bạn.</p>
         </div>
      </div>
    );
  }

  // --- LOADING SCREEN ---
  if (loadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
              <p className="text-slate-500 font-bold">Đang tải dữ liệu...</p>
          </div>
      );
  }

  return (
    <>
      {toast && typeof Toast !== 'undefined' && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
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
            onLoginSuccess={() => {}} 
            users={users} 
          />
          
          {classes.length === 0 && (
             <div className="fixed bottom-4 right-4 z-50">
                 <button 
                    onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        if (confirm("Ghi đè dữ liệu mẫu vào Database?")) {
                            handleSeedData();
                        }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2"
                 >
                    <Database size={14} /> Khởi tạo dữ liệu
                 </button>
             </div>
          )}
        </>
      ) : (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
          {/* Mobile Header */}
          <div className="md:hidden bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-lg">i-Sao đỏ</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Sidebar */}
          <nav className={`
            fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-30 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            flex flex-col
          `}>
            <div className="p-8">
                <h1 className="font-extrabold text-slate-800 text-xl">i-Sao đỏ</h1>
            </div>

            <div className="flex-1 px-4 space-y-1 overflow-y-auto">
              <button onClick={() => setIsInAdminMode(false)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50">
                <Home size={20} /> Về Trang Chủ
              </button>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-4">Quản lý</div>
              {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as Tab); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm ${activeTab === item.id ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <item.icon size={20} /> {item.label}
                  </button>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-100">
              <div className="mb-4">
                 <p className="font-bold">{currentUser.name}</p>
                 <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </nav>

          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          )}

          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50/50 h-screen">
            <div className="max-w-7xl mx-auto pb-10">
              {activeTab === 'dashboard' && (
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase">Số phiếu chấm</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{logs.length}</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase">Lớp dẫn đầu</p>
                        <p className="text-4xl font-black text-slate-800 mt-1 truncate">{classes.length > 0 ? classes[0].name : 'N/A'}</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase">Lỗi vi phạm</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{logs.reduce((acc, log) => acc + log.deductions.length, 0)}</p>
                      </div>
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-bold uppercase">Sao Đỏ</p>
                        <p className="text-4xl font-black text-slate-800 mt-1">{users.filter(u => u.role === UserRole.RED_STAR).length}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                      <Rankings logs={logs} classes={classes} />
                    </div>
                 </div>
              )}

              {activeTab === 'input' && (
                <InputForm onSave={handleSaveLog} classes={classes} criteriaList={criteriaList} currentUser={currentUser} />
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
                  users={users} classes={classes} criteria={criteriaList} announcements={announcements} images={sliderImages} logs={logs}
                  onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
                  onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass}
                  onAddCriteria={handleAddCriteria} onUpdateCriteria={handleUpdateCriteria} onDeleteCriteria={handleDeleteCriteria}
                  onAddAnnouncement={handleAddAnnouncement} onUpdateAnnouncement={handleUpdateAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement}
                  onAddImage={handleAddImage} onUpdateImage={handleUpdateImage} onDeleteImage={handleDeleteImage}
                  onSeedData={handleSeedData} onClearData={handleClearData} onDeleteLog={handleDeleteLog}
                  // @ts-ignore
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
