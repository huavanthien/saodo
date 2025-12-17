// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyWs0H0n3f20RCcV_B32yN-c1yFxemHSA",
  authDomain: "gen-lang-client-0580790563.firebaseapp.com",
  projectId: "gen-lang-client-0580790563",
  storageBucket: "gen-lang-client-0580790563.firebasestorage.app",
  messagingSenderId: "687877182374",
  appId: "1:687877182374:web:f564eb25ae6322b416f567",
  measurementId: "G-ZHGP2P4QM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
