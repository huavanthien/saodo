
import { auth, db } from "../firebaseConfig";
import { User, UserRole, ClassEntity, DailyLog, Announcement, CriteriaConfig, SliderImage } from "../types";
// Using Compat SDK, we don't import modular functions
import firebase from "firebase/compat/app";

// --- COLLECTION REFERENCES ---
const COLLECTIONS = {
  USERS: 'users',
  CLASSES: 'classes',
  LOGS: 'logs',
  CRITERIA: 'criteria',
  ANNOUNCEMENTS: 'announcements',
  IMAGES: 'slider_images'
};

// --- AUTH SERVICES ---

export const loginUser = async (email: string, pass: string) => {
  return await auth.signInWithEmailAndPassword(email, pass);
};

export const registerUser = async (email: string, pass: string) => {
  return await auth.createUserWithEmailAndPassword(email, pass);
};

export const logoutUser = async () => {
  return await auth.signOut();
};

export const resetPassword = async (email: string) => {
  return await auth.sendPasswordResetEmail(email);
};

// Lắng nghe trạng thái đăng nhập và lấy thêm thông tin role từ Firestore
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(async (fbUser) => {
    if (fbUser) {
      // Lấy thông tin role từ Firestore
      const userRef = db.collection(COLLECTIONS.USERS).doc(fbUser.email!);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        callback({ ...userData, password: '' }); // Không trả về password
      } else {
        // Fallback: Nếu user chưa có trong Firestore
        // QUAN TRỌNG: Nếu email là admin... -> Cấp quyền ADMIN luôn
        const isAdminEmail = fbUser.email?.startsWith('admin');
        
        const newUser: User = {
          username: fbUser.email!,
          name: isAdminEmail ? 'Tổng Phụ Trách' : (fbUser.displayName || 'Người dùng mới'),
          role: isAdminEmail ? UserRole.ADMIN : UserRole.RED_STAR,
          assignedClassIds: []
        };
        
        // Tự động lưu user này vào Firestore để lần sau không bị fallback nữa
        await saveUserFirestore(newUser);

        callback(newUser);
      }
    } else {
      callback(null);
    }
  });
};

// --- DATA SERVICES (REALTIME) ---

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const colRef = db.collection(collectionName);
  return colRef.onSnapshot((snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    callback(data);
  });
};

// --- CRUD OPERATIONS ---

// Users
export const saveUserFirestore = async (user: User) => {
  // Dùng email làm Document ID để dễ query
  const email = user.username.includes('@') ? user.username : `${user.username}@nguyenhue.edu.vn`;
  const userRef = db.collection(COLLECTIONS.USERS).doc(email);
  await userRef.set({
    ...user,
    username: email // Chuẩn hóa thành email
  });
};

export const deleteUserFirestore = async (username: string) => {
    // username ở đây đang là email
    const userRef = db.collection(COLLECTIONS.USERS).doc(username);
    await userRef.delete();
};

// Classes
export const addClass = async (cls: ClassEntity) => {
  if(cls.id) {
     const clsRef = db.collection(COLLECTIONS.CLASSES).doc(cls.id);
     await clsRef.set(cls);
  } else {
     const colRef = db.collection(COLLECTIONS.CLASSES);
     await colRef.add(cls);
  }
};
export const updateClass = async (cls: ClassEntity) => {
  const clsRef = db.collection(COLLECTIONS.CLASSES).doc(cls.id);
  await clsRef.update({ ...cls });
};
export const deleteClass = async (id: string) => {
  const clsRef = db.collection(COLLECTIONS.CLASSES).doc(id);
  await clsRef.delete();
};

// Logs
export const addLog = async (log: DailyLog) => {
  const logRef = db.collection(COLLECTIONS.LOGS).doc(log.id);
  await logRef.set(log);
};
export const deleteLog = async (id: string) => {
  const logRef = db.collection(COLLECTIONS.LOGS).doc(id);
  await logRef.delete();
};

// Criteria
export const addCriteria = async (crit: CriteriaConfig) => {
   const critRef = db.collection(COLLECTIONS.CRITERIA).doc(crit.id);
   await critRef.set(crit);
};
export const updateCriteria = async (crit: CriteriaConfig) => {
  const critRef = db.collection(COLLECTIONS.CRITERIA).doc(crit.id);
  await critRef.update({ ...crit });
};
export const deleteCriteria = async (id: string) => {
  const critRef = db.collection(COLLECTIONS.CRITERIA).doc(id);
  await critRef.delete();
};

// Announcements
export const addAnnouncement = async (ann: Announcement) => {
    const annRef = db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(ann.id);
    await annRef.set(ann);
};
export const updateAnnouncement = async (ann: Announcement) => {
    const annRef = db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(ann.id);
    await annRef.update({ ...ann });
};
export const deleteAnnouncement = async (id: string) => {
    const annRef = db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id);
    await annRef.delete();
};

// Images
export const addImage = async (img: SliderImage) => {
    const imgRef = db.collection(COLLECTIONS.IMAGES).doc(img.id);
    await imgRef.set(img);
};
export const updateImage = async (img: SliderImage) => {
    const imgRef = db.collection(COLLECTIONS.IMAGES).doc(img.id);
    await imgRef.update({ ...img });
};
export const deleteImage = async (id: string) => {
    const imgRef = db.collection(COLLECTIONS.IMAGES).doc(id);
    await imgRef.delete();
};

// --- DATA MANAGEMENT UTILITIES ---

const clearCollection = async (collectionName: string) => {
    const colRef = db.collection(collectionName);
    const snapshot = await colRef.get();
    
    // Batch only supports 500 ops.
    const chunk_size = 500;
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += chunk_size) {
        const chunk = docs.slice(i, i + chunk_size);
        const batch = db.batch();
        chunk.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
    }
};

export const clearDatabase = async () => {
    await clearCollection(COLLECTIONS.LOGS);
    await clearCollection(COLLECTIONS.CLASSES);
    await clearCollection(COLLECTIONS.CRITERIA);
    await clearCollection(COLLECTIONS.ANNOUNCEMENTS);
    await clearCollection(COLLECTIONS.IMAGES);
};

// Helper function to execute batch operations
const executeBatch = async (operations: { type: 'set', ref: any, data: any }[]) => {
    const CHUNK_SIZE = 500; // Firestore limit
    for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
        const chunk = operations.slice(i, i + CHUNK_SIZE);
        const batch = db.batch();
        chunk.forEach(op => {
            batch.set(op.ref, op.data);
        });
        await batch.commit();
        console.log(`Committed batch ${i / CHUNK_SIZE + 1} with ${chunk.length} operations.`);
    }
};

export const seedDatabase = async (
    classes: ClassEntity[], 
    criteria: CriteriaConfig[], 
    logs: DailyLog[],
    announcements: Announcement[],
    images: SliderImage[],
    users: User[]
) => {
    const operations: { type: 'set', ref: any, data: any }[] = [];

    classes.forEach(c => {
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.CLASSES).doc(c.id), data: c });
    });
    criteria.forEach(c => {
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.CRITERIA).doc(c.id), data: c });
    });
    logs.forEach(l => {
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.LOGS).doc(l.id), data: l });
    });
    announcements.forEach(a => {
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(a.id), data: a });
    });
    images.forEach(i => {
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.IMAGES).doc(i.id), data: i });
    });
    users.forEach(u => {
        const email = u.username.includes('@') ? u.username : `${u.username}@nguyenhue.edu.vn`;
        // Normalize username to email for ID
        operations.push({ type: 'set', ref: db.collection(COLLECTIONS.USERS).doc(email), data: { ...u, username: email } });
    });

    console.log(`Starting seed with ${operations.length} records...`);
    await executeBatch(operations);
    console.log("Database seeded successfully!");
};
