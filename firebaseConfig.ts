// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_2hVBGnEErKuEOcBWEIajrRJBGSZXOBo",
  authDomain: "saodo-app.firebaseapp.com",
  projectId: "saodo-app",
  storageBucket: "saodo-app.firebasestorage.app",
  messagingSenderId: "51876429552",
  appId: "1:51876429552:web:20b80cf0fc0b1e79c04c35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Hàm kiểm tra xem người dùng đã điền config chưa
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";
};

// Khởi tạo Firebase (Singleton pattern để tránh lỗi duplicate app)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
