// src/services/favoriteService.ts
import { 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs, 
    getDoc,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { Like, Restaurant } from '../models/types';
  
  // Сервис для управления избранными ресторанами
  export const favoriteService = {
    // Добавить ресторан в избранное
    async addToFavorites(userId: string, restaurantId: string): Promise<void> {
      try {
        // Создаем запись в коллекции "likes"
        const likeId = `${userId}_${restaurantId}`;
        const likeRef = doc(db, 'likes', likeId);
        
        // Проверяем, существует ли уже такой лайк
        const existingLike = await getDoc(likeRef);
        if (existingLike.exists()) {
          console.log('Этот ресторан уже в избранном');
          return;
        }
        
        await setDoc(likeRef, {
          userId: userId,
          restaurantId: restaurantId,
          createdAt: serverTimestamp()
        });
        
        console.log('Ресторан добавлен в избранное');
        
        // Увеличиваем счетчик likesCount в коллекции restaurants
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (restaurantDoc.exists()) {
          const restaurantData = restaurantDoc.data();
          const currentLikesCount = restaurantData.likesCount || 0;
          
          // Увеличиваем счетчик лайков на 1
          await setDoc(restaurantRef, 
            { likesCount: currentLikesCount + 1 }, 
            { merge: true }
          );
        }
      } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        throw error;
      }
    },
    
    // Удалить ресторан из избранного
    async removeFromFavorites(userId: string, restaurantId: string): Promise<void> {
      try {
        // Удаляем запись из коллекции "likes"
        const likeId = `${userId}_${restaurantId}`;
        const likeRef = doc(db, 'likes', likeId);
        
        // Проверяем, существует ли такой лайк
        const existingLike = await getDoc(likeRef);
        if (!existingLike.exists()) {
          console.log('Этого ресторана нет в избранном');
          return;
        }
        
        await deleteDoc(likeRef);
        
        console.log('Ресторан удален из избранного');
        
        // Уменьшаем счетчик likesCount в коллекции restaurants
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (restaurantDoc.exists()) {
          const restaurantData = restaurantDoc.data();
          const currentLikesCount = restaurantData.likesCount || 0;
          
          // Уменьшаем счетчик лайков на 1 (но не меньше 0)
          await setDoc(restaurantRef, 
            { likesCount: Math.max(0, currentLikesCount - 1) }, 
            { merge: true }
          );
        }
      } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        throw error;
      }
    },
    
    // Проверить, находится ли ресторан в избранном у пользователя
    async isRestaurantFavorite(userId: string, restaurantId: string): Promise<boolean> {
      try {
        const likeId = `${userId}_${restaurantId}`;
        const likeRef = doc(db, 'likes', likeId);
        const likeDoc = await getDoc(likeRef);
        
        return likeDoc.exists();
      } catch (error) {
        console.error('Ошибка при проверке избранного:', error);
        return false;
      }
    },
    
    // Получить все избранные рестораны пользователя
    async getUserFavorites(userId: string): Promise<string[]> {
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', userId)
        );
        
        const likesSnapshot = await getDocs(likesQuery);
        
        return likesSnapshot.docs.map(doc => doc.data().restaurantId);
      } catch (error) {
        console.error('Ошибка при получении избранного:', error);
        return [];
      }
    },
    
    // Получить все избранные рестораны пользователя с данными ресторанов
    async getUserFavoritesWithDetails(userId: string): Promise<Restaurant[]> {
      try {
        // Сначала получаем ID всех избранных ресторанов
        const restaurantIds = await this.getUserFavorites(userId);
        
        if (restaurantIds.length === 0) {
          return [];
        }
        
        // Затем загружаем данные каждого ресторана
        const restaurantsPromises = restaurantIds.map(async (restaurantId) => {
          const restaurantRef = doc(db, 'restaurants', restaurantId);
          const restaurantDoc = await getDoc(restaurantRef);
          
          if (restaurantDoc.exists()) {
            const data = restaurantDoc.data();
            return {
              id: restaurantDoc.id,
              ...data
            } as Restaurant;
          }
          
          return null;
        });
        
        const restaurants = await Promise.all(restaurantsPromises);
        
        // Фильтруем null значения (если какие-то рестораны не найдены)
        return restaurants.filter(restaurant => restaurant !== null) as Restaurant[];
      } catch (error) {
        console.error('Ошибка при получении избранного с деталями:', error);
        return [];
      }
    },
    
    // Обновить счетчик избранного у пользователя
    async updateUserFavoritesCount(userId: string): Promise<void> {
      try {
        // Получаем количество лайков пользователя
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', userId)
        );
        
        const likesSnapshot = await getDocs(likesQuery);
        const likesCount = likesSnapshot.docs.length;
        
        // Обновляем счетчик в профиле пользователя
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, 
          { likesCount: likesCount }, 
          { merge: true }
        );
      } catch (error) {
        console.error('Ошибка при обновлении счетчика избранного:', error);
        throw error;
      }
    }
  };