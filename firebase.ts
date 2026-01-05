import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuL68F78-8cMf7CSg4ZG8tOABn7GYl_iM",
  authDomain: "kumar-47d31.firebaseapp.com",
  projectId: "kumar-47d31",
  storageBucket: "kumar-47d31.firebasestorage.app",
  messagingSenderId: "256601999734",
  appId: "1:256601999734:web:4ebe549f2f31d910159257",
  measurementId: "G-KPCGMWRTDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);