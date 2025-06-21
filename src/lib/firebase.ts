// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvI1dJBATlnbZizkPc_pjZXHq1cyx9azg",
  authDomain: "whatsapp-clone-83920.firebaseapp.com",
  projectId: "whatsapp-clone-83920",
  storageBucket: "whatsapp-clone-83920.firebasestorage.app",
  messagingSenderId: "797443983586",
  appId: "1:797443983586:web:7da162ef01d56ddd0436bb",
  measurementId: "G-8PXQ25XN5T"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

if (typeof window !== 'undefined') {
  // Enable analytics only in the browser
  getAnalytics(app);
}

export { db };
