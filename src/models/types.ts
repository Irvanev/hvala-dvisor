// models/types.ts
// Создаем единый файл с типами для использования во всем приложении

export interface Restaurant {
    id: string;
    title: string;
    location: string;
    description: string;
    rating: number;
    images: string[]; // Используем массив изображений вместо одного
    image?: string;   // Опциональное поле для обратной совместимости
    cuisineTags?: string[];
    featureTags?: string[];
    priceRange?: string;
  }
  
  export interface Country {
    id: string;
    title: string;
    image: string;
  }
  
  export interface FeaturedCard {
    id: string;
    title: string;
    subtitle: string;
    image: string;
  }