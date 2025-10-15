import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  GeoPoint,
  Timestamp
} from "firebase/firestore";
import { Restaurant } from "../models/types";

interface SearchSuggestion {
  id: string;
  title: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  cuisineTags?: string[];
}

class RestaurantSearch {
  private db: Firestore;

  constructor(db: Firestore) {
    if (!db) {
      throw new Error("Firestore instance is required");
    }
    this.db = db;
  }

  /**
   * Транслитерация для поддержки разных алфавитов
   */
  private transliterate(text: string): string[] {
    if (!text.trim()) return [''];

    const cyrillicToLatin: Record<string, string> = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
      з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
      ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "ju",
      я: "ja",
      љ: "lj", њ: "nj", ћ: "ć", ђ: "đ", ј: "j", џ: "dž",
      đ: "ђ", ć: "ћ", lj: "љ", nj: "њ", dž: "џ"
    };

    const lowerText = text.toLowerCase();
    let latinText = '';

    for (let i = 0; i < lowerText.length; i++) {
      const char = lowerText[i];
      if (char === 'l' && lowerText[i+1] === 'j') {
        latinText += 'љ';
        i++;
      } else if (char === 'n' && lowerText[i+1] === 'j') {
        latinText += 'њ';
        i++;
      } else if (char === 'd' && lowerText[i+1] === 'ž') {
        latinText += 'џ';
        i++;
      } else {
        latinText += cyrillicToLatin[char] || char;
      }
    }

    const variants = [
      lowerText,
      latinText,
      ...Object.entries(cyrillicToLatin).reduce((acc, [cyr, lat]) => {
        if (lowerText.includes(cyr)) acc.push(lowerText.replace(new RegExp(cyr, 'g'), lat));
        if (lowerText.includes(lat)) acc.push(lowerText.replace(new RegExp(lat, 'g'), cyr));
        return acc;
      }, [] as string[])
    ];

    return Array.from(new Set(variants.filter(v => v)));
  }

  /**
   * Конвертация данных из Firestore в тип Restaurant
   */
  private convertToRestaurant(docId: string, data: any): Restaurant {
    console.log('Конвертируем ресторан:', docId, data);

    return {
      id: docId,
      ownerId: data.ownerId || '',
      title: data.title || '',
      description: data.description || '',
      address: {
        street: data.address?.street || data.street || '',
        city: data.address?.city || data.city || '',
        country: data.address?.country || data.country || '',
        postalCode: data.address?.postalCode || data.postalCode || ''
      },
      location: data.location || new GeoPoint(0, 0),
      mainImageUrl: data.mainImageUrl,
      galleryUrls: data.galleryUrls || [],
      contact: {
        phone: data.contact?.phone || data.phone || '',
        website: data.contact?.website || data.website || '',
        social: data.contact?.social || data.social || {}
      },
      cuisineTags: data.cuisineTags || [],
      featureTags: data.featureTags || [],
      tagsSearchable: data.tagsSearchable || [],
      priceRange: data.priceRange as '$' | '$$' | '$$$' || '$',
      rating: data.rating || 0,
      reviewsCount: data.reviewsCount || 0,
      likesCount: data.likesCount || 0,
      menu: data.menu || [],
      openingHours: data.openingHours,
      isArchived: data.isArchived || false,
      moderation: {
        status: data.moderation?.status || data.moderationStatus || 'pending',
        moderatorId: data.moderation?.moderatorId,
        reviewedAt: data.moderation?.reviewedAt,
        rejectionReason: data.moderation?.rejectionReason,
        contactPerson: data.moderation?.contactPerson
      },
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now()
    };
  }

  /**
   * Поиск ресторанов с поддержкой мультиязычности
   */
  async searchRestaurants(queryStr: string, location?: string): Promise<Restaurant[]> {
    console.log('Начинаем поиск:', { queryStr, location });

    const restaurantsRef = collection(this.db, "restaurants");
    const results = new Map<string, Restaurant>();

    try {
      // Если есть поисковый запрос
      if (queryStr.trim()) {
        const searchTerms = this.transliterate(queryStr);
        console.log('Варианты поиска:', searchTerms);

        for (const term of searchTerms) {
          if (!term) continue;

          try {
            console.log('Ищем по термину:', term);
            const searchQuery = query(
                restaurantsRef,
                where("searchKeywords", "array-contains", term.toLowerCase())
            );

            const querySnapshot = await getDocs(searchQuery);
            console.log(`Найдено документов по термину "${term}":`, querySnapshot.size);

            querySnapshot.forEach(doc => {
              console.log('Найден документ:', doc.id, doc.data());
              const restaurant = this.processRestaurant(doc.id, doc.data(), location);
              if (restaurant) {
                console.log('Ресторан прошел фильтрацию:', restaurant.title);
                results.set(doc.id, restaurant);
              } else {
                console.log('Ресторан отфильтрован:', doc.id);
              }
            });
          } catch (error) {
            console.error(`Ошибка поиска по термину ${term}:`, error);
          }
        }
      } else {
        // Если только локация - получаем все рестораны и фильтруем
        console.log('Поиск только по локации:', location);
        const querySnapshot = await getDocs(restaurantsRef);
        console.log('Всего документов в коллекции:', querySnapshot.size);

        querySnapshot.forEach(doc => {
          const restaurant = this.processRestaurant(doc.id, doc.data(), location);
          if (restaurant) {
            results.set(doc.id, restaurant);
          }
        });
      }
    } catch (error) {
      console.error("Ошибка при поиске ресторанов:", error);
    }

    console.log('Итоговые результаты:', Array.from(results.values()));
    return Array.from(results.values());
  }

  /**
   * Обработка ресторана с проверкой модерации и локации
   */
  private processRestaurant(docId: string, data: any, location?: string): Restaurant | null {
    // Проверяем модерацию - РАССЛАБЛЯЕМ ФИЛЬТРАЦИЮ
    const moderationStatus = data.moderation?.status || data.moderationStatus;
    console.log('Проверка модерации для', docId, 'статус:', moderationStatus);

    // Если статус модерации явно не 'rejected', пропускаем
    if (moderationStatus === 'rejected') {
      console.log('Ресторан отклонен:', docId);
      // return null;
    }

    // Проверяем локацию
    if (location && location.trim() && location.trim() !== 'All') {
      const locationNormalized = location.trim().toLowerCase();
      const restaurantCountry = data.address?.country || data.country || '';
      const restaurantCity = data.address?.city || data.city || '';

      console.log('Проверка локации:', {
        ищем: locationNormalized,
        страна: restaurantCountry,
        город: restaurantCity
      });

      const matchesLocation =
          restaurantCountry.toLowerCase().includes(locationNormalized) ||
          restaurantCity.toLowerCase().includes(locationNormalized);

      if (!matchesLocation) {
        console.log('Локация не совпадает:', docId);
        // return null;
      }
    }

    const restaurant = this.convertToRestaurant(docId, data);
    console.log('Ресторан прошел все проверки:', restaurant.title);
    return restaurant;
  }

  /**
   * Получить все одобренные рестораны
   */
  async getAllApprovedRestaurants(): Promise<Restaurant[]> {
    const restaurantsRef = collection(this.db, "restaurants");
    const results = new Map<string, Restaurant>();

    try {
      const querySnapshot = await getDocs(restaurantsRef);
      console.log('Всего ресторанов в базе:', querySnapshot.size);

      querySnapshot.forEach(doc => {
        const restaurant = this.processRestaurant(doc.id, doc.data());
        if (restaurant) {
          results.set(doc.id, restaurant);
        }
      });
    } catch (error) {
      console.error("Ошибка при загрузке ресторанов:", error);
    }

    return Array.from(results.values());
  }

  /**
   * Метод для обновления searchKeywords для всех имеющихся ресторанов
   */
  async updateAllRestaurantsKeywords(): Promise<void> {
    const restaurantsRef = collection(this.db, "restaurants");
    const snapshot = await getDocs(restaurantsRef);

    const updatePromises = snapshot.docs.map(doc =>
        this.updateSearchKeywords(doc.id)
    );

    await Promise.all(updatePromises);
  }

  /**
   * Метод для обновления searchKeywords при создании/изменении ресторана
   */
  async updateSearchKeywords(restaurantId: string): Promise<void> {
    const docRef = doc(this.db, "restaurants", restaurantId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const keywords = new Set<string>();

    // Добавляем ключевые поля для поиска
    const fieldsToIndex = [
      data?.title,
      data?.description,
      data?.address?.city,
      data?.address?.country,
      data?.city, // для обратной совместимости
      data?.country, // для обратной совместимости
      ...(data?.cuisineTags || []),
      ...(data?.featureTags || [])
    ];

    fieldsToIndex.forEach(field => {
      if (typeof field === 'string' && field.trim()) {
        this.transliterate(field).forEach(term => {
          if (term.trim()) {
            keywords.add(term.toLowerCase());
          }
        });
      }
    });

    const keywordsArray = Array.from(keywords);
    console.log('Обновляемые ключевые слова для', restaurantId, ':', keywordsArray);

    await updateDoc(docRef, {
      searchKeywords: keywordsArray
    });
  }

  /**
   * Получить поисковые подсказки (для автодополнения)
   */
  async getSearchSuggestions(searchTerm: string, location?: string, limit: number = 5): Promise<SearchSuggestion[]> {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      return [];
    }

    console.log('Получение подсказок для:', { searchTerm, location });

    const restaurantsRef = collection(this.db, "restaurants");
    const suggestions: SearchSuggestion[] = [];
    const seenTitles = new Set<string>();

    try {
      const searchTerms = this.transliterate(searchTerm);

      for (const term of searchTerms) {
        if (!term || suggestions.length >= limit) break;

        try {
          const searchQuery = query(
              restaurantsRef,
              where("searchKeywords", "array-contains", term.toLowerCase())
          );

          const querySnapshot = await getDocs(searchQuery);

          querySnapshot.forEach(doc => {
            if (suggestions.length >= limit) return;

            const data = doc.data();
            const title = data.title || '';

            // Проверяем локацию если указана
            if (location && location.trim() && location.trim() !== 'All') {
              const locationNormalized = location.trim().toLowerCase();
              const restaurantCountry = data.address?.country || data.country || '';
              const restaurantCity = data.address?.city || data.city || '';

              const matchesLocation =
                  restaurantCountry.toLowerCase().includes(locationNormalized) ||
                  restaurantCity.toLowerCase().includes(locationNormalized);

              if (!matchesLocation) return;
            }

            // Убираем дубликаты по названию
            if (title && !seenTitles.has(title.toLowerCase())) {
              seenTitles.add(title.toLowerCase());

              suggestions.push({
                id: doc.id,
                title: title,
                city: data.address?.city || data.city,
                country: data.address?.country || data.country,
                imageUrl: data.mainImageUrl,
                cuisineTags: data.cuisineTags?.slice(0, 2) // Берем только 2 первых тега
              });
            }
          });
        } catch (error) {
          console.error(`Ошибка при получении подсказок по термину ${term}:`, error);
        }
      }
    } catch (error) {
      console.error("Ошибка при получении поисковых подсказок:", error);
    }

    console.log('Найдены подсказки:', suggestions);
    return suggestions.slice(0, limit);
  }

  /**
   * Получить популярные поисковые запросы (для начальных подсказок)
   */
  async getPopularSearches(limit: number = 5): Promise<string[]> {
    // Здесь можно реализовать логику для популярных запросов
    // Пока возвращаем заглушку
    return [
      "Рестораны с балканской кухней",
      "Паста",
      "Пицца",
      "Морепродукты",
      "Вегетарианская кухня"
    ].slice(0, limit);
  }

  /**
   * Получить ресторан по ID
   */
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    try {
      const docRef = doc(this.db, "restaurants", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertToRestaurant(id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error("Ошибка при получении ресторана:", error);
      return null;
    }
  }
}

export default RestaurantSearch;