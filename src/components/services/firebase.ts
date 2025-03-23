// src/services/firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Restaurant, Country, FeaturedCard } from '../types';

// Конфигурация Firebase (заполните своими данными)
const firebaseConfig = {
  apiKey: "ваш_api_key",
  authDomain: "ваш_auth_domain",
  projectId: "ваш_project_id",
  storageBucket: "ваш_storage_bucket",
  messagingSenderId: "ваш_messaging_sender_id",
  appId: "ваш_app_id"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Сервисы для работы с ресторанами
export const restaurantService = {
  // Получить все рестораны
  getRestaurants: async (): Promise<Restaurant[]> => {
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));
  },
  
  // Получить лучшие рестораны
  getTopRestaurants: async (limitCount = 10): Promise<Restaurant[]> => {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, orderBy('rating', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));
  },
  
  
  // Получить рестораны у моря
  getSeaSideRestaurants: async (limitCount = 10): Promise<Restaurant[]> => {
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, where('isSeaSide', '==', true), orderBy('rating', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));
  }
};

// Сервисы для работы со странами
export const countryService = {
  // Получить все страны
  getCountries: async (): Promise<Country[]> => {
    const countriesRef = collection(db, 'countries');
    const snapshot = await getDocs(countriesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Country));
  },
  
  // Получить популярные страны
// Получить популярные страны
getPopularCountries: async (limitCount = 3): Promise<Country[]> => {
  const countriesRef = collection(db, 'countries');
  const q = query(countriesRef, orderBy('popularity', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Country));
}
};

// Сервисы для работы с фичеринговыми карточками
export const featuredCardService = {
  // Получить карточки для главной страницы
  getFeaturedCards: async (): Promise<FeaturedCard[]> => {
    const cardsRef = collection(db, 'featuredCards');
    const snapshot = await getDocs(cardsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeaturedCard));
  }
};