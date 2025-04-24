import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where, 
    updateDoc, 
    Timestamp, 
    addDoc,
    orderBy,
    limit,
    startAfter
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { Restaurant, ModerationAction, Notification } from '../models/types';
  
  class ModerationService {
    /**
     * Получить список ресторанов, ожидающих модерации
     * @param lastDoc Последний документ для пагинации
     * @param pageSize Размер страницы
     */
    async getPendingRestaurants(lastDoc: any = null, pageSize: number = 10) {
      try {
        let restaurantsQuery = query(
          collection(db, 'restaurants'),
          where('moderation.status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
  
        // Если передан последний документ, используем его для пагинации
        if (lastDoc) {
          restaurantsQuery = query(
            collection(db, 'restaurants'),
            where('moderation.status', '==', 'pending'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(pageSize)
          );
        }
  
        const snapshot = await getDocs(restaurantsQuery);
        
        const restaurants: Restaurant[] = [];
        snapshot.forEach((doc) => {
          restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
        });
  
        // Возвращаем список ресторанов и последний документ для пагинации
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        return { restaurants, lastVisible };
      } catch (error) {
        console.error('Ошибка при получении списка ресторанов:', error);
        throw error;
      }
    }
  
    /**
     * Получить информацию о конкретном ресторане
     * @param restaurantId ID ресторана
     */
    async getRestaurantById(restaurantId: string) {
      try {
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        const restaurantSnap = await getDoc(restaurantRef);
        
        if (restaurantSnap.exists()) {
          return { id: restaurantSnap.id, ...restaurantSnap.data() } as Restaurant;
        } else {
          throw new Error('Ресторан не найден');
        }
      } catch (error) {
        console.error('Ошибка при получении информации о ресторане:', error);
        throw error;
      }
    }
  
    /**
     * Одобрить ресторан
     * @param restaurantId ID ресторана
     * @param moderatorId ID модератора
     */
    async approveRestaurant(restaurantId: string, moderatorId: string) {
      try {
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        
        // Обновляем статус ресторана
        await updateDoc(restaurantRef, {
          'moderation.status': 'approved',
          'moderation.moderatorId': moderatorId,
          'moderation.reviewedAt': Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        // Получаем данные о ресторане для создания уведомления
        const restaurantSnap = await getDoc(restaurantRef);
        if (restaurantSnap.exists()) {
          const restaurant = { id: restaurantSnap.id, ...restaurantSnap.data() } as Restaurant;
          
          // Создаем запись о модерации
          await this.createModerationAction(restaurantId, moderatorId, 'approved');
          
          // Создаем уведомление для владельца
          if (restaurant.ownerId !== 'guest') {
            await this.createUserNotification(
              restaurant.ownerId,
              'Ресторан одобрен',
              `Ваш ресторан "${restaurant.title}" прошел модерацию и теперь доступен на сайте.`,
              'restaurant_approved',
              restaurantId
            );
          }
          
          // Если есть контактное лицо, отправляем уведомление на email (в будущем)
          // ...
  
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Ошибка при одобрении ресторана:', error);
        throw error;
      }
    }
  
    /**
     * Отклонить ресторан
     * @param restaurantId ID ресторана
     * @param moderatorId ID модератора
     * @param reason Причина отклонения
     */
    async rejectRestaurant(restaurantId: string, moderatorId: string, reason: string) {
      try {
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        
        // Обновляем статус ресторана
        await updateDoc(restaurantRef, {
          'moderation.status': 'rejected',
          'moderation.moderatorId': moderatorId,
          'moderation.reviewedAt': Timestamp.now(),
          'moderation.rejectionReason': reason,
          updatedAt: Timestamp.now()
        });
        
        // Получаем данные о ресторане для создания уведомления
        const restaurantSnap = await getDoc(restaurantRef);
        if (restaurantSnap.exists()) {
          const restaurant = { id: restaurantSnap.id, ...restaurantSnap.data() } as Restaurant;
          
          // Создаем запись о модерации
          await this.createModerationAction(restaurantId, moderatorId, 'rejected', reason);
          
          // Создаем уведомление для владельца
          if (restaurant.ownerId !== 'guest') {
            await this.createUserNotification(
              restaurant.ownerId,
              'Ресторан отклонен',
              `Ваш ресторан "${restaurant.title}" не прошел модерацию. Причина: ${reason}`,
              'restaurant_rejected',
              restaurantId
            );
          }
          
          // Если есть контактное лицо, отправляем уведомление на email (в будущем)
          // ...
  
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Ошибка при отклонении ресторана:', error);
        throw error;
      }
    }
  
    /**
     * Создать запись об действии модерации
     */
    private async createModerationAction(
      restaurantId: string, 
      moderatorId: string, 
      action: 'approved' | 'rejected', 
      reason?: string
    ) {
      try {
        const moderationAction: Omit<ModerationAction, 'id'> = {
          restaurantId,
          moderatorId,
          action,
          reason,
          createdAt: Timestamp.now()
        };
        
        await addDoc(collection(db, 'moderationActions'), moderationAction);
      } catch (error) {
        console.error('Ошибка при создании записи о модерации:', error);
        // Не блокируем основной процесс модерации, если не получилось создать запись
      }
    }
  
    /**
     * Создать уведомление для пользователя
     */
    private async createUserNotification(
      userId: string,
      title: string,
      message: string,
      type: 'restaurant_approved' | 'restaurant_rejected' | 'other',
      relatedEntityId?: string
    ) {
      try {
        const notification: Omit<Notification, 'id'> = {
          userId,
          title,
          message,
          type,
          relatedEntityId,
          isRead: false,
          createdAt: Timestamp.now()
        };
        
        await addDoc(collection(db, 'notifications'), notification);
      } catch (error) {
        console.error('Ошибка при создании уведомления:', error);
        // Не блокируем основной процесс модерации, если не получилось создать уведомление
      }
    }
  }
  
  // Экспортируем синглтон
  export default new ModerationService();