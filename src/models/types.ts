// Типы ролей пользователей
export type UserRole =
  | 'guest'       // аноним (не залогинен)
  | 'registered'  // обычный пользователь
  | 'owner'       // владелец ресторана
  | 'moderator'   // проверяет заявки / отзывы
  | 'admin';      // бог‑режим
import { Timestamp, GeoPoint } from 'firebase/firestore';

// Модель пользователя с дополнительными полями аудита
// export interface User {
//   id: string;                        // Уникальный идентификатор
//   firstName: string;
//   lastName: string;
//   nickname: string;
//   email: string;
//   city: string;
//   password: string;                  // Используется при собственной регистрации
//   role: UserRole;
//   googleProfile?: {                  // Данные из Google
//     googleId: string;
//     avatarUrl: string;
//   };
//   createdAt: Date;
//   lastLoginAt?: Date;
//   updatedAt: Date;
//   // Поле для хранения истории входов или дополнительного аудита (можно хранить массив записей)
//   auditLogs?: Array<{
//     loginAt: Date;
//     ipAddress: string;
//   }>;
// }

export interface User {
  /** UID из Firebase Auth — используем как id в Firestore */
  id: string;

  /** Основные данные профиля */
  firstName: string;
  lastName: string;
  nickname?: string;          // показываем в UI, если есть
  city?: string;

  /** Контакты */
  email: string;              // дублируем для быстрого поиска по email
  isEmailVerified: boolean;   // полезно для UI (значок «Подтверждён»)

  /** Аватар и провайдер входа */
  avatarUrl?: string;         // ссылка на Storage или Google
  provider: 'password' | 'google' | 'github' | 'apple';

  /** Роль в системе */
  role: UserRole;

  /** Агрегированные счётчики (денормализация) */
  reviewsCount?: number;      // сколько отзывов написал
  likesCount?: number;        // сколько лайков поставил

  /** Служебные метки времени */
  createdAt: Timestamp;       // serverTimestamp()
  updatedAt: Timestamp;       // serverTimestamp()
  lastLoginAt?: Timestamp;    // обновляем onAuthStateChanged + server timestamp
}

/** Лог входа храним в под‑коллекции /users/{uid}/logins/{loginId} */
export interface UserLoginLog {
  id: string;                 // = loginId
  ipAddress?: string;
  userAgent?: string;
  loginAt: Timestamp;         // serverTimestamp()
}

// export interface Restaurant {
//   id: string;
//   title: string;
//   description: string;
//   // Поддерживаем оба формата - и строку, и объект
//   location: string | {
//     street: string;
//     city: string;
//     postalCode: string;
//     country: string;
//   };
//   coordinates?: { lat: number; lng: number };
//   images: string[];
//   contact?: {
//     phone?: string;
//     website?: string;
//     socialLinks?: {
//       facebook?: string;
//       instagram?: string;
//       twitter?: string;
//     };
//   };
//   cuisineTags?: string[];
//   featureTags?: string[];
//   priceRange?: string;
//   rating?: number;
//   moderationStatus?: 'pending' | 'approved' | 'rejected';
//   createdAt?: Date;
//   updatedAt?: Date;
// }

export interface Restaurant {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  location: GeoPoint;
  mainImageUrl?: string;
  galleryUrls: string[];
  contact?: {
    phone?: string;
    website?: string;
    social: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  cuisineTags: string[];
  featureTags: string[];
  tagsSearchable?: string[];            // для поиска
  priceRange?: '$' | '$$' | '$$$';
  rating: number;
  reviewsCount: number;
  likesCount: number;
  isArchived?: boolean;                 // для скрытия
  moderation: {
    status: 'pending' | 'approved' | 'rejected';
    moderatorId?: string;
    reviewedAt?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  isPopular?: boolean;
  category?: string;
  availability?: 'available' | 'sold_out';
}


export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

// export interface Review {
//   id: string;
//   author: string;
//   authorAvatar?: string;
//   rating: number;
//   comment: string;
//   date: string;
//   likes?: number;
// }

// export interface Review {
//   id: string;                // = reviewId в Firestore
//   authorId: string;          // uid автора из Firebase Auth
//   authorName: string;        // денормализованное имя (чтобы не делать join)
//   authorAvatarUrl?: string;  // ссылка на Storage, если есть
//   rating: number;            // 1–5
//   comment: string;
//   createdAt: Timestamp;      // serverTimestamp()
//   updatedAt: Timestamp;      // serverTimestamp()
//   likesCount: number;        // счётчик лайков
// }


export interface Review {
  id: string;
  restaurantId: string;                 // добавлено
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;
  comment: string;
  reply?: string;                       // ответ владельца
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likesCount: number;
}

/** Лайк в под‑коллекции
 *  /restaurants/{restaurantId}/reviews/{reviewId}/likes/{userId}
 *  Тело документа можно оставить пустым ‑— наличие == лайк.
 */
export interface ReviewLike {
  userId: string;            // uid лайкнувшего
  createdAt: Timestamp;
}

// Модель лайка, реализуемая как отдельная сущность для гибкости
export interface Like {
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: Date;
}

// Модель предложения ресторана, если планируется отдельный процесс модерации новых заведений
export interface RestaurantProposal {
  id: string;
  proposedBy: string;              // ID пользователя, предложившего ресторан
  restaurantData: Partial<Restaurant>; // Предварительные данные, которые будут проверены модераторами
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
}

