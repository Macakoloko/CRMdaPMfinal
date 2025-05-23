// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRdB1UXfxFLiQrH7oT91SC85loep6VhzY",
  authDomain: "crm-peem.firebaseapp.com",
  projectId: "crm-peem",
  storageBucket: "crm-peem.appspot.com",
  messagingSenderId: "921234567890",
  appId: "1:921234567890:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 