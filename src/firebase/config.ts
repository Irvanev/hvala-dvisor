// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


// Конфигурация Firebase - замените на вашу конфигурацию из консоли Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXCr0S1qCXSHVBM82UIFP_3N480Nux6z0",
  authDomain: "restoranta-2e4fb.firebaseapp.com",
  projectId: "restoranta-2e4fb",
  storageBucket: "restoranta-2e4fb.firebasestorage.app",
  messagingSenderId: "214427041766",
  appId: "1:214427041766:web:9e27efd38aae8b9c9d6027",
  measurementId: "G-6JXE878T5G"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);