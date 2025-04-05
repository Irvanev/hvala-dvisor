// src/services/firebaseServices.ts
import { db, storage } from '../../firebase/config';
import { 
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, limit, startAfter, serverTimestamp,
  arrayUnion, arrayRemove, increment, DocumentSnapshot, DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  User, Country, City, Cuisine, Restaurant, 
  Review, FeaturedCard, PaginatedResult 
} from '../../types/index';

// Сервис для работы с пользователями
export const userService = {
  // Получить пользователя по ID
  async getById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  },

  // Обновить данные пользователя
  async update(userId: string, data: Partial<User>): Promise<boolean> {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      ...data,
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Добавить ресторан в избранное пользователя
  async addToFavorites(userId: string, restaurantId: string): Promise<boolean> {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(restaurantId),
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Удалить ресторан из избранного пользователя
  async removeFromFavorites(userId: string, restaurantId: string): Promise<boolean> {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(restaurantId),
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Обновить настройки пользователя
  async updateSettings(userId: string, settings: any): Promise<boolean> {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      settings: settings,
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  }
};

// Сервис для работы со странами
export const countryService = {
  // Получить все страны
  async getAll(): Promise<Country[]> {
    const querySnapshot = await getDocs(collection(db, 'Countries'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Country));
  },

  // Получить страну по ID
  async getById(countryId: string): Promise<Country | null> {
    const countryDoc = await getDoc(doc(db, 'Countries', countryId));
    if (!countryDoc.exists()) return null;
    return { id: countryDoc.id, ...countryDoc.data() } as Country;
  },

  // Создать новую страну
  async create(countryData: Omit<Country, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'Countries'), countryData);
    return docRef.id;
  },

  // Обновить данные страны
  async update(countryId: string, data: Partial<Country>): Promise<boolean> {
    const countryRef = doc(db, 'Countries', countryId);
    await updateDoc(countryRef, data);
    return true;
  },

  // Удалить страну
  async delete(countryId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'Countries', countryId));
    return true;
  }
};

// Сервис для работы с городами
export const cityService = {
  // Получить все города
  async getAll(): Promise<City[]> {
    const querySnapshot = await getDocs(collection(db, 'Cities'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as City));
  },

  // Получить города по ID страны
  async getByCountryId(countryId: string): Promise<City[]> {
    const q = query(
      collection(db, 'Cities'), 
      where('FK_countryId', '==', countryId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as City));
  },

  // Получить город по ID
  async getById(cityId: string): Promise<City | null> {
    const cityDoc = await getDoc(doc(db, 'Cities', cityId));
    if (!cityDoc.exists()) return null;
    return { id: cityDoc.id, ...cityDoc.data() } as City;
  },

  // Создать новый город
  async create(cityData: Omit<City, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'Cities'), cityData);
    return docRef.id;
  },

  // Обновить данные города
  async update(cityId: string, data: Partial<City>): Promise<boolean> {
    const cityRef = doc(db, 'Cities', cityId);
    await updateDoc(cityRef, data);
    return true;
  },

  // Удалить город
  async delete(cityId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'Cities', cityId));
    return true;
  }
};

// Сервис для работы с кухнями
export const cuisineService = {
  // Получить все кухни
  async getAll(): Promise<Cuisine[]> {
    const querySnapshot = await getDocs(collection(db, 'Cuisines'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Cuisine));
  },

  // Получить кухню по ID
  async getById(cuisineId: string): Promise<Cuisine | null> {
    const cuisineDoc = await getDoc(doc(db, 'Cuisines', cuisineId));
    if (!cuisineDoc.exists()) return null;
    return { id: cuisineDoc.id, ...cuisineDoc.data() } as Cuisine;
  },

  // Создать новую кухню
  async create(cuisineData: Omit<Cuisine, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'Cuisines'), cuisineData);
    return docRef.id;
  },

  // Обновить данные кухни
  async update(cuisineId: string, data: Partial<Cuisine>): Promise<boolean> {
    const cuisineRef = doc(db, 'Cuisines', cuisineId);
    await updateDoc(cuisineRef, data);
    return true;
  },

  // Удалить кухню
  async delete(cuisineId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'Cuisines', cuisineId));
    return true;
  }
};

// Сервис для работы с ресторанами
export const restaurantService = {
  // Получить все рестораны (с пагинацией)
  async getAll(pageSize: number = 10, lastVisible?: DocumentSnapshot<DocumentData>): Promise<PaginatedResult<Restaurant>> {
    let q = query(
      collection(db, 'Restaurants'),
      orderBy('name'),
      limit(pageSize)
    );
    
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    const querySnapshot = await getDocs(q);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));

    return {
      items: restaurants,
      lastVisible: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  // Получить рестораны по ID города
  async getByCityId(cityId: string, pageSize: number = 10, lastVisible?: DocumentSnapshot<DocumentData>): Promise<PaginatedResult<Restaurant>> {
    let q = query(
      collection(db, 'Restaurants'),
      where('FK_cityId', '==', cityId),
      orderBy('name'),
      limit(pageSize)
    );
    
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    const querySnapshot = await getDocs(q);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));

    return {
      items: restaurants,
      lastVisible: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  // Получить рестораны по ID страны
  async getByCountryId(countryId: string, pageSize: number = 10, lastVisible?: DocumentSnapshot<DocumentData>): Promise<PaginatedResult<Restaurant>> {
    let q = query(
      collection(db, 'Restaurants'),
      where('FK_countryId', '==', countryId),
      orderBy('name'),
      limit(pageSize)
    );
    
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    const querySnapshot = await getDocs(q);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));

    return {
      items: restaurants,
      lastVisible: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  // Получить рестораны по типу кухни
  async getByCuisine(cuisineId: string, pageSize: number = 10, lastVisible?: DocumentSnapshot<DocumentData>): Promise<PaginatedResult<Restaurant>> {
    let q = query(
      collection(db, 'Restaurants'),
      where('cuisine', 'array-contains', cuisineId),
      orderBy('name'),
      limit(pageSize)
    );
    
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    
    const querySnapshot = await getDocs(q);
    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Restaurant));

    return {
      items: restaurants,
      lastVisible: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  // Получить ресторан по ID
  async getById(restaurantId: string): Promise<Restaurant | null> {
    const restaurantDoc = await getDoc(doc(db, 'Restaurants', restaurantId));
    if (!restaurantDoc.exists()) return null;
    return { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
  },

  // Создать новый ресторан
  async create(restaurantData: Omit<Restaurant, 'id' | 'timestamps'>): Promise<string> {
    const dataWithTimestamps = {
      ...restaurantData,
      timestamps: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    const docRef = await addDoc(collection(db, 'Restaurants'), dataWithTimestamps);
    return docRef.id;
  },

  // Обновить данные ресторана
  async update(restaurantId: string, data: Partial<Restaurant>): Promise<boolean> {
    const restaurantRef = doc(db, 'Restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      ...data,
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Удалить ресторан
  async delete(restaurantId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'Restaurants', restaurantId));
    return true;
  },

  // Загрузить изображение для ресторана
  async uploadImage(restaurantId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `restaurants/${restaurantId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    
    // Добавляем URL изображения в массив images ресторана
    const restaurantRef = doc(db, 'Restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      images: arrayUnion(imageUrl),
      'timestamps.updatedAt': serverTimestamp()
    });
    
    return imageUrl;
  },

  // Установить главное изображение ресторана
  async setMainImage(restaurantId: string, imageUrl: string): Promise<boolean> {
    const restaurantRef = doc(db, 'Restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      mainImage: imageUrl,
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Обновить рейтинг ресторана после добавления/изменения отзыва
  async updateRating(restaurantId: string, newRatingData: { average: number; count: number }): Promise<boolean> {
    const restaurantRef = doc(db, 'Restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      rating: newRatingData,
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  }
};

// Сервис для работы с отзывами
export const reviewService = {
  // Получить все отзывы для ресторана
  async getByRestaurantId(restaurantId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'Reviews'),
      where('FK_restaurantId', '==', restaurantId),
      orderBy('timestamps.createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Review));
  },

  // Получить отзывы пользователя
  async getByUserId(userId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'Reviews'),
      where('FK_userId', '==', userId),
      orderBy('timestamps.createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Review));
  },

  // Получить отзыв по ID
  async getById(reviewId: string): Promise<Review | null> {
    const reviewDoc = await getDoc(doc(db, 'Reviews', reviewId));
    if (!reviewDoc.exists()) return null;
    return { id: reviewDoc.id, ...reviewDoc.data() } as Review;
  },

  // Создать новый отзыв
  async create(reviewData: Omit<Review, 'id' | 'timestamps' | 'helpfulCount' | 'status'>, userDisplayName: string): Promise<string> {
    // Добавляем имя пользователя для оптимизации
    const fullReviewData = {
      ...reviewData,
      userName: userDisplayName,
      helpfulCount: 0,
      status: 'active' as const,
      timestamps: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    };
    
    // Сохраняем отзыв
    const docRef = await addDoc(collection(db, 'Reviews'), fullReviewData);
    
    // Обновляем рейтинг ресторана
    const restaurantRef = doc(db, 'Restaurants', reviewData.FK_restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);
    if (!restaurantDoc.exists()) throw new Error('Ресторан не найден');
    
    const restaurant = restaurantDoc.data() as Restaurant;
    
    // Рассчитываем новый средний рейтинг
    const newCount = (restaurant.rating?.count || 0) + 1;
    const newAverage = ((restaurant.rating?.average || 0) * (restaurant.rating?.count || 0) + reviewData.rating) / newCount;
    
    // Обновляем рейтинг ресторана
    await updateDoc(restaurantRef, {
      'rating.average': newAverage,
      'rating.count': newCount,
      'timestamps.updatedAt': serverTimestamp()
    });
    
    return docRef.id;
  },

  // Обновить отзыв
  async update(reviewId: string, data: Partial<Review>): Promise<boolean> {
    const reviewRef = doc(db, 'Reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    if (!reviewDoc.exists()) throw new Error('Отзыв не найден');
    
    const oldReview = reviewDoc.data() as Review;
    
    await updateDoc(reviewRef, {
      ...data,
      'timestamps.updatedAt': serverTimestamp()
    });
    
    // Если рейтинг изменился, обновляем рейтинг ресторана
    if (data.rating !== undefined && oldReview.rating !== data.rating) {
      const restaurantRef = doc(db, 'Restaurants', oldReview.FK_restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      if (!restaurantDoc.exists()) throw new Error('Ресторан не найден');
      
      const restaurant = restaurantDoc.data() as Restaurant;
      
      // Рассчитываем новый средний рейтинг
      const newAverage = ((restaurant.rating?.average || 0) * (restaurant.rating?.count || 0) - oldReview.rating + data.rating) / (restaurant.rating?.count || 1);
      
      // Обновляем рейтинг ресторана
      await updateDoc(restaurantRef, {
        'rating.average': newAverage,
        'timestamps.updatedAt': serverTimestamp()
      });
    }
    
    return true;
  },

  // Удалить отзыв
  async delete(reviewId: string): Promise<boolean> {
    const reviewRef = doc(db, 'Reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    if (!reviewDoc.exists()) throw new Error('Отзыв не найден');
    
    const review = reviewDoc.data() as Review;
    
    // Удаляем отзыв
    await deleteDoc(reviewRef);
    
    // Обновляем рейтинг ресторана
    const restaurantRef = doc(db, 'Restaurants', review.FK_restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);
    if (!restaurantDoc.exists()) throw new Error('Ресторан не найден');
    
    const restaurant = restaurantDoc.data() as Restaurant;
    
    // Рассчитываем новый средний рейтинг и количество отзывов
    const newCount = (restaurant.rating?.count || 1) - 1;
    const newAverage = newCount > 0
      ? ((restaurant.rating?.average || 0) * (restaurant.rating?.count || 1) - review.rating) / newCount
      : 0;
    
    // Обновляем рейтинг ресторана
    await updateDoc(restaurantRef, {
      'rating.average': newAverage,
      'rating.count': newCount,
      'timestamps.updatedAt': serverTimestamp()
    });
    
    return true;
  },

  // Отметить отзыв как полезный (увеличить счетчик helpfulCount)
  async markAsHelpful(reviewId: string): Promise<boolean> {
    const reviewRef = doc(db, 'Reviews', reviewId);
    await updateDoc(reviewRef, {
      helpfulCount: increment(1),
      'timestamps.updatedAt': serverTimestamp()
    });
    return true;
  },

  // Загрузить изображение для отзыва
  async uploadImage(reviewId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `reviews/${reviewId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    
    // Добавляем URL изображения в массив images отзыва
    const reviewRef = doc(db, 'Reviews', reviewId);
    await updateDoc(reviewRef, {
      images: arrayUnion(imageUrl),
      'timestamps.updatedAt': serverTimestamp()
    });
    
    return imageUrl;
  }
};

// Сервис для работы с избранными карточками
export const featuredCardService = {
  // Получить все карточки
  async getAll(): Promise<FeaturedCard[]> {
    const q = query(
      collection(db, 'FeaturedCards'),
      where('activeStatus', '==', true),
      orderBy('priority', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeaturedCard));
  },

  // Получить карточку по ID
  async getById(cardId: string): Promise<FeaturedCard | null> {
    const cardDoc = await getDoc(doc(db, 'FeaturedCards', cardId));
    if (!cardDoc.exists()) return null;
    return { id: cardDoc.id, ...cardDoc.data() } as FeaturedCard;
  },

  // Создать новую карточку
  async create(cardData: Omit<FeaturedCard, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'FeaturedCards'), cardData);
    return docRef.id;
  },

  // Обновить данные карточки
  async update(cardId: string, data: Partial<FeaturedCard>): Promise<boolean> {
    const cardRef = doc(db, 'FeaturedCards', cardId);
    await updateDoc(cardRef, data);
    return true;
  },

  // Удалить карточку
  async delete(cardId: string): Promise<boolean> {
    await deleteDoc(doc(db, 'FeaturedCards', cardId));
    return true;
  },

  // Изменить статус активности карточки
  async toggleActiveStatus(cardId: string, status: boolean): Promise<boolean> {
    const cardRef = doc(db, 'FeaturedCards', cardId);
    await updateDoc(cardRef, {
      activeStatus: status
    });
    return true;
  }
};