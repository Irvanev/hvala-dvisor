// src/models/types-extension.ts
import { Restaurant } from './types';

// Расширяем тип Restaurant для страницы результатов поиска
export interface SearchResultRestaurant extends Restaurant {
  coordinates?: {
    lat: number;
    lng: number;
  };
}