// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX-fHnsm9F8HyYB-qOPR5sXVlz26fWR3A",
  authDomain: "whereismybus-5df3c.firebaseapp.com",
  projectId: "whereismybus-5df3c",
  storageBucket: "whereismybus-5df3c.firebasestorage.app",
  messagingSenderId: "544235470024",
  appId: "1:544235470024:web:8d621b704c070802a239fd",
  measurementId: "G-F1LWBX3CF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
