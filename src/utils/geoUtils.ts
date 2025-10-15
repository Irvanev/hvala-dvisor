// src/utils/geoUtils.ts
import { GeoPoint } from 'firebase/firestore';

// Интерфейс для Google Maps координат
export interface GoogleMapsCoordinates {
  lat: number;
  lng: number;
}

// Интерфейс для Firebase GeoPoint координат
export interface FirebaseCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Конвертирует Firebase GeoPoint в формат Google Maps
 */
export const geoPointToGoogleMaps = (geoPoint: GeoPoint): GoogleMapsCoordinates => {
  return {
    lat: geoPoint.latitude,
    lng: geoPoint.longitude
  };
};

/**
 * Конвертирует координаты Google Maps в Firebase GeoPoint
 */
export const googleMapsToGeoPoint = (coordinates: GoogleMapsCoordinates): GeoPoint => {
  return new GeoPoint(coordinates.lat, coordinates.lng);
};

/**
 * Конвертирует обычные координаты в Firebase GeoPoint
 */
export const coordinatesToGeoPoint = (lat: number, lng: number): GeoPoint => {
  return new GeoPoint(lat, lng);
};

/**
 * Проверяет валидность координат
 */
export const isValidCoordinates = (coordinates: any): coordinates is GoogleMapsCoordinates => {
  return (
    coordinates &&
    typeof coordinates.lat === 'number' &&
    typeof coordinates.lng === 'number' &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
};

/**
 * Проверяет валидность GeoPoint
 */
export const isValidGeoPoint = (geoPoint: any): geoPoint is GeoPoint => {
  return (
    geoPoint &&
    geoPoint instanceof GeoPoint &&
    typeof geoPoint.latitude === 'number' &&
    typeof geoPoint.longitude === 'number' &&
    geoPoint.latitude >= -90 &&
    geoPoint.latitude <= 90 &&
    geoPoint.longitude >= -180 &&
    geoPoint.longitude <= 180
  );
};

/**
 * Форматирует адрес из объекта Restaurant
 */
export const formatRestaurantAddress = (address: {
  street: string;
  city: string;
  postalCode?: string;
  country: string;
}): string => {
  const parts = [address.street, address.city];
  
  if (address.postalCode) {
    parts.push(address.postalCode);
  }
  
  parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Расчет расстояния между двумя точками (в километрах)
 */
export const calculateDistance = (
  point1: GoogleMapsCoordinates, 
  point2: GoogleMapsCoordinates
): number => {
  const R = 6371; // Радиус Земли в километрах
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Расчет расстояния между GeoPoint'ами
 */
export const calculateDistanceGeoPoint = (
  geoPoint1: GeoPoint, 
  geoPoint2: GeoPoint
): number => {
  const coords1 = geoPointToGoogleMaps(geoPoint1);
  const coords2 = geoPointToGoogleMaps(geoPoint2);
  return calculateDistance(coords1, coords2);
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Получение центра для массива ресторанов
 */
export const getCenterOfRestaurants = (restaurants: Array<{ location: GeoPoint }>): GoogleMapsCoordinates => {
  if (restaurants.length === 0) {
    // Возвращаем Москву по умолчанию
    return { lat: 55.7558, lng: 37.6176 };
  }

  const totalLat = restaurants.reduce((sum, restaurant) => sum + restaurant.location.latitude, 0);
  const totalLng = restaurants.reduce((sum, restaurant) => sum + restaurant.location.longitude, 0);

  return {
    lat: totalLat / restaurants.length,
    lng: totalLng / restaurants.length
  };
};

/**
 * Проверка, находится ли точка в радиусе от центра
 */
export const isWithinRadius = (
  center: GoogleMapsCoordinates,
  point: GoogleMapsCoordinates,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
};