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

// models/types.ts
export interface Restaurant {
  id: string;
  title: string;
  description: string;
  // Поддерживаем оба формата - и строку, и объект
  location: string | {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  coordinates?: { lat: number; lng: number };
  images: string[];
  contact?: {
    phone?: string;
    website?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
  rating?: number;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  isPopular?: boolean;
  category?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Review {
  id: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  likes?: number;
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

