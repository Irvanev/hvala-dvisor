// Типы ролей пользователей
export type UserRole = 'guest' | 'registered' | 'owner' | 'moderator' | 'admin';

// Модель пользователя с дополнительными полями аудита
export interface User {
  id: string;                        // Уникальный идентификатор
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  city: string;
  password: string;                  // Используется при собственной регистрации
  role: UserRole;
  googleProfile?: {                  // Данные из Google
    googleId: string;
    avatarUrl: string;
  };
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
  // Поле для хранения истории входов или дополнительного аудита (можно хранить массив записей)
  auditLogs?: Array<{
    loginAt: Date;
    ipAddress: string;
  }>;
}

// Модель ресторана с расширенной информацией и гибкими полями
export interface Restaurant {
  id: string;
  title: string;
  description: string;
  location: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialLinks?: { [platform: string]: string };
  };
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
  menu?: MenuItem[];
  rating?: number;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  changeHistory?: Array<{
    modifiedAt: Date;
    modifiedBy: string;
    changes: string;
  }>;
}


// Модель позиции меню с уникальным идентификатором для расширения функционала
export interface MenuItem {
  id: string;
  name: string;
  description: string; // Теперь обязательно
  price: string;       // Используем string, чтобы можно было указывать "12€" и т.п.
  isPopular?: boolean; // Опциональное поле
  image?: string;
  category?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

// Модель отзыва с флагом модерации
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  content: string;
  rating: number;                  // Например, значение от 1 до 5
  createdAt: Date;
  updatedAt?: Date;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  // Можно добавлять дополнительные поля, например, для редактирования отзыва
  changeHistory?: Array<{
    modifiedAt: Date;
    modifiedBy: string;
    changes: string;
  }>;
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

