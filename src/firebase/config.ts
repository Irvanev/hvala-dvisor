// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов Firebase
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Установка персистентности для аутентификации
// Это позволит пользователям оставаться в системе даже после закрытия браузера
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Ошибка при установке персистентности авторизации:', error);
  });

// Алиас для firestore для совместимости с существующим кодом
const db = firestore;

export { auth, firestore, db, storage };