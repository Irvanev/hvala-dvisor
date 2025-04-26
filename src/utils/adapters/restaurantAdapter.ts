// src/utils/adapters/restaurantAdapter.ts

import { Timestamp, GeoPoint } from 'firebase/firestore';
import { Restaurant } from '../../models/types';

/**
 * Адаптер для преобразования данных из Firestore в типизированную модель Restaurant
 * @param docId ID документа
 * @param data Данные из Firestore
 * @returns Объект Restaurant
 */
export function adaptRestaurantFromFirestore(docId: string, data: any): Restaurant {
  return {
    id: docId,
    ownerId: data.ownerId || '',
    title: data.title || '',
    description: data.description || '',
    // Адрес
    address: data.address || {
      street: '',
      city: '',
      country: ''
    },
    // Геолокация
    location: data.location instanceof GeoPoint ? data.location :
              data.coordinates ? new GeoPoint(
                parseFloat(data.coordinates.lat || '0'),
                parseFloat(data.coordinates.lng || '0')
              ) : new GeoPoint(0, 0),
    // Изображения
    mainImageUrl: data.mainImageUrl || '',
    galleryUrls: data.galleryUrls || [],
    // Контактная информация
    contact: data.contact || {
      phone: '',
      website: '',
      social: {}
    },
    // Теги
    cuisineTags: data.cuisineTags || [],
    featureTags: data.featureTags || [],
    tagsSearchable: data.tagsSearchable || [],
    // Ценовой диапазон
    priceRange: data.priceRange || '$', 
    // Рейтинги и счетчики
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
    likesCount: data.likesCount || 0,
    // Меню ресторана
    menu: data.menu || [],
    // Модерация
    moderation: data.moderation || {
      status: data.moderationStatus || 'pending'
    },
    // Даты
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : 
               data.createdAt ? Timestamp.fromDate(new Date(data.createdAt)) : Timestamp.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : 
               data.updatedAt ? Timestamp.fromDate(new Date(data.updatedAt)) : Timestamp.now()
  };
}

/**
 * Адаптер для преобразования данных Restaurant в формат для RestaurantGrid/RestaurantList
 * @param restaurant Объект Restaurant
 * @returns Объект совместимый с компонентами отображения
 */
export function adaptRestaurantForDisplay(restaurant: Restaurant): any {
  return {
    id: restaurant.id,
    title: restaurant.title,
    location: typeof restaurant.address === 'object' 
      ? `${restaurant.address.city || ''}, ${restaurant.address.country || ''}`.trim() 
      : '',
    description: restaurant.description,
    rating: restaurant.rating,
    images: restaurant.galleryUrls || [],
    image: restaurant.mainImageUrl || (restaurant.galleryUrls && restaurant.galleryUrls.length > 0 
      ? restaurant.galleryUrls[0] 
      : ''),
    cuisineTags: restaurant.cuisineTags || [],
    featureTags: restaurant.featureTags || [],
    priceRange: restaurant.priceRange || '',
    likesCount: restaurant.likesCount,
    reviewsCount: restaurant.reviewsCount,
    coordinates: restaurant.location instanceof GeoPoint 
      ? { lat: restaurant.location.latitude, lng: restaurant.location.longitude } 
      : { lat: 0, lng: 0 },
    contact: restaurant.contact || {
      phone: '',
      website: '',
      socialLinks: {}
    },
    moderationStatus: restaurant.moderation?.status || 'pending',
    createdAt: restaurant.createdAt instanceof Timestamp 
      ? restaurant.createdAt.toDate() 
      : new Date(),
    updatedAt: restaurant.updatedAt instanceof Timestamp 
      ? restaurant.updatedAt.toDate() 
      : new Date()
  };
}

/**
 * Группировка элементов меню по категориям
 * @param menuItems Массив блюд
 * @returns Группированный массив по категориям
 */
function groupMenuItems(menuItems: any[]): Array<{ category: string; items: any[] }> {
  const grouped: { [category: string]: any[] } = {};

  menuItems.forEach(item => {
    const category = (item.category || 'Без категории').trim();
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return Object.entries(grouped).map(([category, items]) => ({
    category,
    items
  }));
}

/**
 * Адаптер для преобразования Restaurant в формат для страницы деталей ресторана
 * @param restaurant Объект Restaurant
 * @returns Объект совместимый с RestaurantPage
 */
export function adaptRestaurantForDetailsPage(restaurant: Restaurant): any {
  const displayRestaurant = adaptRestaurantForDisplay(restaurant);
  
  return {
    ...displayRestaurant,
    openingHours: {
      'Понедельник': '10:00 - 22:00',
      'Вторник': '10:00 - 22:00',
      'Среда': '10:00 - 22:00',
      'Четверг': '10:00 - 22:00',
      'Пятница': '10:00 - 23:00',
      'Суббота': '10:00 - 23:00',
      'Воскресенье': '10:00 - 22:00'
    },
    photos: restaurant.galleryUrls || [],
    reviews: [],
    cuisine: restaurant.cuisineTags && restaurant.cuisineTags.length > 0 
      ? restaurant.cuisineTags[0] 
      : '',
    phoneNumber: restaurant.contact?.phone || '',
    website: restaurant.contact?.website || '',
    features: restaurant.featureTags || [],
    groupedMenu: restaurant.menu ? groupMenuItems(restaurant.menu) : []
  };
}
