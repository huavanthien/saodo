
// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// Helper function to check if the config is valid (not placeholder)
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
         firebaseConfig.projectId !== "your-project-id" &&
         firebaseConfig.apiKey.length > 0;
};

export { app, auth, db };
