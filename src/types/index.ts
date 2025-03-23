// src/types/index.ts

export interface Restaurant {
    id: string;
    title: string;
    location: string;
    rating: number;
    image: string;
    description?: string;
    category?: string;
    isFeatured?: boolean;
    isSeaSide?: boolean;
  }
  
  export interface Country {
    id: string;
    title: string;
    image: string;
    description?: string;
  }
  
  export interface FeaturedCard {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    buttonText?: string;
    type: 'restaurants' | 'seaside-restaurants' | 'popular-countries';
  }