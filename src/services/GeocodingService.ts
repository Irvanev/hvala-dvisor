// src/services/GeocodingService.ts
import { GeoPoint } from 'firebase/firestore';
import { geoPointToGoogleMaps, googleMapsToGeoPoint } from '../utils/geoUtils';

export interface Coordinates {
  lat: number;
  lng: number;
}

class GeocodingService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Получение GeoPoint по адресу (для Firebase)
   */
  async getGeoPointFromAddress(address: string): Promise<GeoPoint | null> {
    const coordinates = await this.getCoordinatesFromAddress(address);
    return coordinates ? googleMapsToGeoPoint(coordinates) : null;
  }

  /**
   * Получение координат по адресу
   */
  async getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
    if (!this.apiKey) {
      console.error('Google Maps API key не найден');
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}&language=ru`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        console.warn('Адрес не найден:', address, data.status);
        return null;
      }
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      return null;
    }
  }

  /**
   * Получение GeoPoint по структурированному адресу
   */
  async getGeoPointFromStructuredAddress(address: {
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  }): Promise<GeoPoint | null> {
    const addressString = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean).join(', ');

    return this.getGeoPointFromAddress(addressString);
  }

  /**
   * Получение адреса по координатам (обратное геокодирование)
   */
  async getAddressFromCoordinates(coordinates: Coordinates): Promise<string | null> {
    if (!this.apiKey) {
      console.error('Google Maps API key не найден');
      return null;
    }

    try {
      const { lat, lng } = coordinates;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&language=ru`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn('Координаты не найдены:', coordinates, data.status);
        return null;
      }
    } catch (error) {
      console.error('Ошибка обратного геокодирования:', error);
      return null;
    }
  }

  /**
   * Получение адреса по GeoPoint
   */
  async getAddressFromGeoPoint(geoPoint: GeoPoint): Promise<string | null> {
    const coordinates = geoPointToGoogleMaps(geoPoint);
    return this.getAddressFromCoordinates(coordinates);
  }

  /**
   * Валидация координат
   */
  isValidCoordinates(coordinates: any): coordinates is Coordinates {
    return (
      coordinates &&
      typeof coordinates.lat === 'number' &&
      typeof coordinates.lng === 'number' &&
      coordinates.lat >= -90 &&
      coordinates.lat <= 90 &&
      coordinates.lng >= -180 &&
      coordinates.lng <= 180
    );
  }

  /**
   * Валидация GeoPoint
   */
  isValidGeoPoint(geoPoint: any): geoPoint is GeoPoint {
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
  }

  /**
   * Расчет расстояния между двумя точками (в километрах)
   */
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Расчет расстояния между GeoPoint'ами
   */
  calculateDistanceGeoPoint(geoPoint1: GeoPoint, geoPoint2: GeoPoint): number {
    const coords1 = geoPointToGoogleMaps(geoPoint1);
    const coords2 = geoPointToGoogleMaps(geoPoint2);
    return this.calculateDistance(coords1, coords2);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const geocodingService = new GeocodingService();