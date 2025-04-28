// // src/services/firebase.ts

// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { Restaurant } from '../models/types';

// // Конфигурация Firebase (заполните своими данными)
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// // Инициализация Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// // Сервисы для работы с ресторанами
// export const restaurantService = {
//   // Получить все рестораны
//   getRestaurants: async (): Promise<Restaurant[]> => {
//     const restaurantsRef = collection(db, 'restaurants');
//     const snapshot = await getDocs(restaurantsRef);
    
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     } as Restaurant));
//   },
  
//   // Получить лучшие рестораны
//   getTopRestaurants: async (limitCount = 10): Promise<Restaurant[]> => {
//     const restaurantsRef = collection(db, 'restaurants');
//     const q = query(restaurantsRef, orderBy('rating', 'desc'), limit(limitCount));
//     const snapshot = await getDocs(q);
    
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     } as Restaurant));
//   },
  
  
//   // Получить рестораны у моря
//   getSeaSideRestaurants: async (limitCount = 10): Promise<Restaurant[]> => {
//     const restaurantsRef = collection(db, 'restaurants');
//     const q = query(restaurantsRef, where('isSeaSide', '==', true), orderBy('rating', 'desc'), limit(limitCount));
//     const snapshot = await getDocs(q);
    
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     } as Restaurant));
//   }
// };

// // Сервисы для работы со странами
// export const countryService = {
//   // Получить все страны
//   getCountries: async (): Promise<Country[]> => {
//     const countriesRef = collection(db, 'countries');
//     const snapshot = await getDocs(countriesRef);
    
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     } as Country));
//   },
  
//   // Получить популярные страны
// // Получить популярные страны
// getPopularCountries: async (limitCount = 3): Promise<Country[]> => {
//   const countriesRef = collection(db, 'countries');
//   const q = query(countriesRef, orderBy('popularity', 'desc'), limit(limitCount));
//   const snapshot = await getDocs(q);
  
//   return snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   } as Country));
// }
// };

// // Сервисы для работы с фичеринговыми карточками
// export const featuredCardService = {
//   // Получить карточки для главной страницы
//   getFeaturedCards: async (): Promise<FeaturedCard[]> => {
//     const cardsRef = collection(db, 'featuredCards');
//     const snapshot = await getDocs(cardsRef);
    
//     return snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     } as FeaturedCard));
//   }
// };