// src/hooks/useRestaurantCoordinates.ts
import { useState, useEffect } from 'react';
import { geocodingService, Coordinates } from '../services/GeocodingService';

interface UseRestaurantCoordinatesProps {
  initialCoordinates?: Coordinates;
  address: string;
  autoGeocodeIfMissing?: boolean;
}

interface UseRestaurantCoordinatesReturn {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  refetchCoordinates: () => Promise<void>;
}

export const useRestaurantCoordinates = ({
  initialCoordinates,
  address,
  autoGeocodeIfMissing = true
}: UseRestaurantCoordinatesProps): UseRestaurantCoordinatesReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinates = async (addressToGeocode: string) => {
    if (!addressToGeocode.trim()) {
      setError('Адрес не указан');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const coords = await geocodingService.getCoordinatesFromAddress(addressToGeocode);
      
      if (coords) {
        setCoordinates(coords);
      } else {
        setError('Не удалось определить координаты по адресу');
      }
    } catch (err) {
      console.error('Ошибка получения координат:', err);
      setError('Ошибка при получении координат');
    } finally {
      setLoading(false);
    }
  };

  const refetchCoordinates = async () => {
    await fetchCoordinates(address);
  };

  useEffect(() => {
    // Если координаты есть и они валидны, используем их
    if (initialCoordinates && geocodingService.isValidCoordinates(initialCoordinates)) {
      setCoordinates(initialCoordinates);
      return;
    }

    // Если автогеокодирование включено и координат нет, получаем их по адресу
    if (autoGeocodeIfMissing && address && !coordinates) {
      fetchCoordinates(address);
    }
  }, [initialCoordinates, address, autoGeocodeIfMissing]);

  // Обновляем координаты если изменился адрес
  useEffect(() => {
    if (autoGeocodeIfMissing && address && !initialCoordinates) {
      const debounceTimer = setTimeout(() => {
        fetchCoordinates(address);
      }, 1000); // Дебаунс для избежания частых запросов

      return () => clearTimeout(debounceTimer);
    }
  }, [address, autoGeocodeIfMissing, initialCoordinates]);

  return {
    coordinates,
    loading,
    error,
    refetchCoordinates
  };
};