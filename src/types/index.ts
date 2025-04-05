// src/types/index.ts

// Тип для метки времени
export interface Timestamp {
  createdAt: Date | any; // Firebase Timestamp
  updatedAt: Date | any; // Firebase Timestamp
}

// Тип для пользователя
export interface User {
  id: string;              // PK // Primary Key
  email: string;           // string
  displayName: string;     // string
  photoURL?: string;       // string
  role: 'user' | 'admin' | 'moderator'; // enum
  timestamps: Timestamp;   // object
  favorites: string[];     // array of restaurant IDs
  settings: any;           // object
}

// Тип для страны
export interface Country {
  id: string;              // PK // Primary Key
  name: string;            // string
  description: string;     // string
  image?: string;          // string
  popularCities: string[]; // array of city IDs
  metadata: any;           // object
}

// Тип для города
export interface City {
  id: string;                         // PK // Primary Key
  name: string;                       // string
  FK_countryId: string;               // Foreign Key referencing Countries
  metadata: any;                      // object
}

// Тип для кухни
export interface Cuisine {
  id: string;              // PK // Primary Key
  name: string;            // string
  description: string;     // string
}

// Тип для координат
export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

// Тип для рейтинга
export interface Rating {
  average: number;
  count: number;
}

// Тип для часов работы
export interface OpeningHours {
  [day: string]: {
    open: string;
    close: string;
    closed?: boolean;
  };
}

// Тип для ресторана
export interface Restaurant {
  id: string;                         // PK // Primary Key
  FK_userId: string;                  // Foreign Key referencing Users
  FK_cityId: string;                  // Foreign Key referencing Cities
  FK_countryId: string;               // Foreign Key referencing Countries
  name: string;                       // string
  description: string;                // string
  address: string;                    // string
  coordinates: Coordinates;           // object
  contactInfo: any;                   // object
  images: string[];                   // array of URLs
  mainImage?: string;                 // string
  cuisine: string[];                  // array of References Cuisines PKs
  priceRange?: 'low' | 'medium' | 'high' | 'luxury'; // enum
  features: {
    hasWifi?: boolean;
    hasParking?: boolean;
    takeaway?: boolean;
    delivery?: boolean;
    outdoorSeating?: boolean;
    [key: string]: boolean | undefined;
  };                                  // object
  openingHours: OpeningHours;         // object
  rating: Rating;                     // object
  status: 'active' | 'closed' | 'temporary_closed'; // enum
  timestamps: Timestamp;              // object
  tags: string[];                     // array
}

// Тип для отзыва
export interface Review {
  id: string;                         // PK // Primary Key
  FK_restaurantId: string;            // Foreign Key referencing Restaurants
  FK_userId: string;                  // Foreign Key referencing Users
  userName: string;                   // string (дублирование для производительности)
  rating: number;                     // number (1-5)
  title: string;                      // string
  content: string;                    // string
  images: string[];                   // array of URLs
  timestamps: Timestamp;              // object
  helpfulCount: number;               // number
  status: 'active' | 'hidden' | 'flagged'; // enum
}

// Тип для избранной карточки
export interface FeaturedCard {
  id: string;              // PK // Primary Key
  title: string;           // string
  subtitle: string;        // string
  image: string;           // string
  buttonText: string;      // string
  type: string;            // string
  filter: string;          // string
  priority: number;        // number
  activeStatus: boolean;   // bool
}

// Тип для фильтров ресторанов
export interface RestaurantFilters {
  priceRange?: 'low' | 'medium' | 'high' | 'luxury';
  minRating?: number;
  cuisine?: string;
  features?: {
    [key: string]: boolean;
  };
}

// Тип для результата запроса с пагинацией
export interface PaginatedResult<T> {
  items: T[];
  lastVisible: any | null; // Firebase DocumentSnapshot
  hasMore: boolean;
}