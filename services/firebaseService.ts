
import { User, UserRole, ClassEntity, DailyLog, Announcement, CriteriaConfig, SliderImage } from "../types";
import { 
  INITIAL_LOGS_MOCK, 
  CLASSES as MOCK_CLASSES, 
  MOCK_USERS, 
  CRITERIA_LIST as MOCK_CRITERIA, 
  MOCK_ANNOUNCEMENTS, 
  SLIDER_IMAGES as MOCK_IMAGES 
} from "../constants";

// --- LOCAL STORAGE KEYS ---
const KEYS = {
  USERS: 'saodo_users',
  CLASSES: 'saodo_classes',
  LOGS: 'saodo_logs',
  CRITERIA: 'saodo_criteria',
  ANNOUNCEMENTS: 'saodo_announcements',
  IMAGES: 'saodo_images',
  CURRENT_USER: 'saodo_current_user'
};

// --- PUBSUB SYSTEM (Simulate Realtime) ---
// This allows different parts of the app to react when data changes in LocalStorage
const listeners: Record<string, Function[]> = {};

const subscribe = (key: string, callback: Function) => {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
};

const notify = (key: string, data: any) => {
  if (listeners[key]) {
    listeners[key].forEach(cb => cb(data));
  }
};

// --- HELPER FUNCTIONS ---
const getLocal = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  notify(key, data);
};

// Initialize Data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(KEYS.CLASSES)) setLocal(KEYS.CLASSES, MOCK_CLASSES);
  if (!localStorage.getItem(KEYS.CRITERIA)) setLocal(KEYS.CRITERIA, MOCK_CRITERIA);
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) setLocal(KEYS.ANNOUNCEMENTS, MOCK_ANNOUNCEMENTS);
  if (!localStorage.getItem(KEYS.IMAGES)) setLocal(KEYS.IMAGES, MOCK_IMAGES);
  if (!localStorage.getItem(KEYS.USERS)) setLocal(KEYS.USERS, MOCK_USERS);
  // Logs can be empty initially or seeded
  if (!localStorage.getItem(KEYS.LOGS)) setLocal(KEYS.LOGS, []); 
};

// Run initialization once on load
initializeLocalStorage();

// --- AUTH SERVICES (MOCK) ---

export const loginUser = async (email: string, pass: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getLocal<User[]>(KEYS.USERS, []);
  // Simple check (In real local app, passwords should be hashed, but this is a mock)
  const user = users.find(u => 
    (u.username === email || u.username === email + '@nguyenhue.edu.vn') && 
    u.password === pass
  );

  if (user) {
    // Save session
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    notify('auth', user);
    return { user: { email: user.username } };
  } else {
    throw { code: 'auth/invalid-credential', message: 'Sai tài khoản hoặc mật khẩu' };
  }
};

export const registerUser = async (email: string, pass: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const users = getLocal<User[]>(KEYS.USERS, []);
  
  if (users.some(u => u.username === email)) {
    throw { code: 'auth/email-already-in-use', message: 'Tài khoản đã tồn tại' };
  }
  // Note: Actual user creation happens in saveUserFirestore for the metadata
  // Here we just return success to satisfy the interface
  return { user: { email } };
};

export const logoutUser = async () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  notify('auth', null);
};

export const resetPassword = async (email: string) => {
  // Mock sending email
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = getLocal<User[]>(KEYS.USERS, []);
  const user = users.find(u => u.username === email);
  if (!user) throw { code: 'auth/user-not-found' };
  console.log(`[MOCK EMAIL] Password reset link sent to ${email}`);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  // Check initial state
  const storedUser = localStorage.getItem(KEYS.CURRENT_USER);
  if (storedUser) {
    callback(JSON.parse(storedUser));
  } else {
    callback(null);
  }

  // Listen for changes
  return subscribe('auth', callback);
};

// --- DATA SERVICES (REALTIME MOCK) ---

// Map collection names to storage keys
const KEY_MAP: Record<string, string> = {
  'logs': KEYS.LOGS,
  'classes': KEYS.CLASSES,
  'criteria': KEYS.CRITERIA,
  'announcements': KEYS.ANNOUNCEMENTS,
  'slider_images': KEYS.IMAGES,
  'users': KEYS.USERS
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const key = KEY_MAP[collectionName];
  if (!key) return () => {};

  // Initial fetch
  const data = getLocal<any[]>(key, []);
  callback(data);

  // Subscribe to changes
  return subscribe(key, (newData: any[]) => {
    callback(newData);
  });
};

// --- CRUD OPERATIONS ---

// Users
export const saveUserFirestore = async (user: User) => {
  const users = getLocal<User[]>(KEYS.USERS, []);
  const index = users.findIndex(u => u.username === user.username);
  
  if (index >= 0) {
    users[index] = { ...users[index], ...user }; // Update, keeping password if not provided
  } else {
    // New user
    users.push(user);
  }
  setLocal(KEYS.USERS, users);
};

export const deleteUserFirestore = async (username: string) => {
  let users = getLocal<User[]>(KEYS.USERS, []);
  users = users.filter(u => u.username !== username);
  setLocal(KEYS.USERS, users);
};

// Classes
export const addClass = async (cls: ClassEntity) => {
  const classes = getLocal<ClassEntity[]>(KEYS.CLASSES, []);
  if (!cls.id) cls.id = cls.name; // Simple ID generation
  classes.push(cls);
  setLocal(KEYS.CLASSES, classes);
};
export const updateClass = async (cls: ClassEntity) => {
  let classes = getLocal<ClassEntity[]>(KEYS.CLASSES, []);
  const idx = classes.findIndex(c => c.id === cls.id);
  if (idx !== -1) {
    classes[idx] = cls;
    setLocal(KEYS.CLASSES, classes);
  }
};
export const deleteClass = async (id: string) => {
  let classes = getLocal<ClassEntity[]>(KEYS.CLASSES, []);
  classes = classes.filter(c => c.id !== id);
  setLocal(KEYS.CLASSES, classes);
};

// Logs
export const addLog = async (log: DailyLog) => {
  const logs = getLocal<DailyLog[]>(KEYS.LOGS, []);
  // Check if exists (overwrite)
  const idx = logs.findIndex(l => l.id === log.id);
  if (idx !== -1) {
    logs[idx] = log;
  } else {
    logs.push(log);
  }
  setLocal(KEYS.LOGS, logs);
};
export const deleteLog = async (id: string) => {
  let logs = getLocal<DailyLog[]>(KEYS.LOGS, []);
  logs = logs.filter(l => l.id !== id);
  setLocal(KEYS.LOGS, logs);
};

// Criteria
export const addCriteria = async (crit: CriteriaConfig) => {
  const list = getLocal<CriteriaConfig[]>(KEYS.CRITERIA, []);
  list.push(crit);
  setLocal(KEYS.CRITERIA, list);
};
export const updateCriteria = async (crit: CriteriaConfig) => {
  let list = getLocal<CriteriaConfig[]>(KEYS.CRITERIA, []);
  const idx = list.findIndex(c => c.id === crit.id);
  if (idx !== -1) {
    list[idx] = crit;
    setLocal(KEYS.CRITERIA, list);
  }
};
export const deleteCriteria = async (id: string) => {
  let list = getLocal<CriteriaConfig[]>(KEYS.CRITERIA, []);
  list = list.filter(c => c.id !== id);
  setLocal(KEYS.CRITERIA, list);
};

// Announcements
export const addAnnouncement = async (ann: Announcement) => {
  const list = getLocal<Announcement[]>(KEYS.ANNOUNCEMENTS, []);
  list.push(ann);
  setLocal(KEYS.ANNOUNCEMENTS, list);
};
export const updateAnnouncement = async (ann: Announcement) => {
  let list = getLocal<Announcement[]>(KEYS.ANNOUNCEMENTS, []);
  const idx = list.findIndex(a => a.id === ann.id);
  if (idx !== -1) {
    list[idx] = ann;
    setLocal(KEYS.ANNOUNCEMENTS, list);
  }
};
export const deleteAnnouncement = async (id: string) => {
  let list = getLocal<Announcement[]>(KEYS.ANNOUNCEMENTS, []);
  list = list.filter(a => a.id !== id);
  setLocal(KEYS.ANNOUNCEMENTS, list);
};

// Images
export const addImage = async (img: SliderImage) => {
  const list = getLocal<SliderImage[]>(KEYS.IMAGES, []);
  list.push(img);
  setLocal(KEYS.IMAGES, list);
};
export const updateImage = async (img: SliderImage) => {
  let list = getLocal<SliderImage[]>(KEYS.IMAGES, []);
  const idx = list.findIndex(i => i.id === img.id);
  if (idx !== -1) {
    list[idx] = img;
    setLocal(KEYS.IMAGES, list);
  }
};
export const deleteImage = async (id: string) => {
  let list = getLocal<SliderImage[]>(KEYS.IMAGES, []);
  list = list.filter(i => i.id !== id);
  setLocal(KEYS.IMAGES, list);
};

// --- DATA MANAGEMENT UTILITIES ---

export const clearDatabase = async () => {
  localStorage.removeItem(KEYS.LOGS);
  localStorage.removeItem(KEYS.CLASSES);
  localStorage.removeItem(KEYS.CRITERIA);
  localStorage.removeItem(KEYS.ANNOUNCEMENTS);
  localStorage.removeItem(KEYS.IMAGES);
  // Keep Users to prevent lockout, or clear them too if requested
  // setLocal(KEYS.LOGS, []); ...
  notify(KEYS.LOGS, []);
  notify(KEYS.CLASSES, []);
  notify(KEYS.CRITERIA, []);
  notify(KEYS.ANNOUNCEMENTS, []);
  notify(KEYS.IMAGES, []);
};

export const seedDatabase = async (
    classes: ClassEntity[], 
    criteria: CriteriaConfig[], 
    logs: DailyLog[],
    announcements: Announcement[],
    images: SliderImage[],
    users: User[]
) => {
    setLocal(KEYS.CLASSES, classes);
    setLocal(KEYS.CRITERIA, criteria);
    setLocal(KEYS.LOGS, logs);
    setLocal(KEYS.ANNOUNCEMENTS, announcements);
    setLocal(KEYS.IMAGES, images);
    
    // Merge users instead of overwrite to keep current session valid if possible
    // But for seeding, overwrite is usually expected.
    // Let's check if Admin exists, if not ensure it does.
    setLocal(KEYS.USERS, users);
};
