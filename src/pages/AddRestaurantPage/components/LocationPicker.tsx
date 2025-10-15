// src/pages/AddRestaurantPage/components/LocationPicker.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { useGoogleMaps } from '../../../contexts/GoogleMapsContext';
import addStyles from '../AddRestaurantPage.module.css';
import editStyles from '../../EditRestaurantPage/EditRestaurantPage.module.css';

interface LocationPickerProps {
  onLocationSelect: (position: { lat: number; lng: number }) => void;
  initialPosition: { lat: number; lng: number } | null;
  error?: string;
  isEdit?: boolean;
}

const defaultCenter = {
  lat: 42.6507, // Дубровник, Хорватия
  lng: 18.0944
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition,
  error,
  isEdit = false
}) => {
  const { t } = useTranslation();
  const styles = isEdit ? editStyles : addStyles;
  const { isLoaded, loadError } = useGoogleMaps();
  
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition || null
  );
  const mapRef = useRef<google.maps.Map | null>(null);

  const mapCenter = selectedPosition || defaultCenter;

  // Обработчик клика по карте
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      setSelectedPosition(position);
      onLocationSelect(position);
    }
  }, [onLocationSelect]);

  // Обработчик загрузки карты
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Функция для определения текущего местоположения
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setSelectedPosition(userPosition);
          onLocationSelect(userPosition);
          
          // Центрируем карту на местоположении пользователя
          if (mapRef.current) {
            mapRef.current.panTo(userPosition);
            mapRef.current.setZoom(15);
          }
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          // Используем Дубровник как fallback
          const fallbackPosition = defaultCenter;
          setSelectedPosition(fallbackPosition);
          onLocationSelect(fallbackPosition);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Обновляем позицию при изменении initialPosition
  useEffect(() => {
    if (initialPosition && !selectedPosition) {
      setSelectedPosition(initialPosition);
    }
  }, [initialPosition, selectedPosition]);

  // API еще загружается
  if (!isLoaded && !loadError) {
    return (
      <div className={styles.locationPickerSection}>
        <h3 className={styles.sectionTitle}>{t('addRestaurantPage.locationPicker.title')}</h3>
        <p className={styles.sectionDescription}>
          {t('addRestaurantPage.locationPicker.description')}
        </p>
        {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}
        
        <div className={styles.mapContainer}>
          <div className={styles.mapLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>{t('addRestaurantPage.locationPicker.loadingMap')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Ошибка загрузки API
  if (loadError) {
    return (
      <div className={styles.locationPickerSection}>
        <h3 className={styles.sectionTitle}>{t('addRestaurantPage.locationPicker.title')}</h3>
        <p className={styles.sectionDescription}>
          {t('addRestaurantPage.locationPicker.description')}
        </p>
        {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}
        
        <div className={styles.mapContainer}>
          <div className={styles.mapError}>
            <div className={styles.mapErrorContent}>
              <h4>Карта временно недоступна</h4>
              <p>Используйте кнопки ниже для выбора местоположения</p>
              
              <div className={styles.locationButtons}>
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  className={styles.locationButton}
                >
                  📍 Использовать мое местоположение
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedPosition(defaultCenter);
                    onLocationSelect(defaultCenter);
                  }}
                  className={styles.locationButton}
                >
                  🏛️ Использовать Дубровник (по умолчанию)
                </button>
              </div>
              
              {selectedPosition && (
                <div className={styles.selectedLocation}>
                  <p>
                    <strong>{t('addRestaurantPage.locationPicker.selectedLocation')}</strong><br />
                    {t('addRestaurantPage.locationPicker.latitude')} {selectedPosition.lat.toFixed(6)}<br />
                    {t('addRestaurantPage.locationPicker.longitude')} {selectedPosition.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.locationNote}>
          <p>
            <strong>{t('common.note')}:</strong> {t('addRestaurantPage.locationPicker.note')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.locationPickerSection}>
      <h3 className={styles.sectionTitle}>{t('addRestaurantPage.locationPicker.title')}</h3>
      <p className={styles.sectionDescription}>
        {t('addRestaurantPage.locationPicker.description')}
      </p>
      {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}
      
      {/* Кнопки быстрого выбора */}
      <div className={styles.quickLocationButtons}>
        <button 
          type="button"
          onClick={getCurrentLocation}
          className={styles.quickLocationButton}
        >
          📍 {t('addRestaurantPage.locationPicker.useMyLocation')}
        </button>
        <button 
          type="button"
          onClick={() => {
            const dubrovnikCenter = defaultCenter;
            setSelectedPosition(dubrovnikCenter);
            onLocationSelect(dubrovnikCenter);
            if (mapRef.current) {
              mapRef.current.panTo(dubrovnikCenter);
              mapRef.current.setZoom(12);
            }
          }}
          className={styles.quickLocationButton}
        >
          🏛️ {t('addRestaurantPage.locationPicker.useDubrovnik')}
        </button>
      </div>

      <div className={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={selectedPosition ? 15 : 12}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'cooperative',
            styles: [
              {
                featureType: 'poi.business',
                stylers: [{ visibility: 'on' }]
              }
            ]
          }}
        >
          {selectedPosition && (
            <Marker
              position={selectedPosition}
              draggable={true}
              onDragEnd={(event) => {
                if (event.latLng) {
                  const newPosition = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                  };
                  setSelectedPosition(newPosition);
                  onLocationSelect(newPosition);
                }
              }}
              icon={isLoaded && window.google?.maps ? {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#E53E3E"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(16, 32)
              } : undefined}
            />
          )}
        </GoogleMap>

        {/* Инструкции по использованию карты */}
        <div className={styles.mapInstructions}>
          <div className={styles.instructionItem}>
            <span className={styles.instructionIcon}>👆</span>
            <span>{t('addRestaurantPage.locationPicker.clickInstruction')}</span>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.instructionIcon}>🖱️</span>
            <span>{t('addRestaurantPage.locationPicker.dragInstruction')}</span>
          </div>
        </div>
      </div>

      {/* Отображение выбранных координат */}
      {selectedPosition && (
        <div className={styles.selectedLocationInfo}>
          <div className={styles.selectedLocation}>
            <h4>{t('addRestaurantPage.locationPicker.selectedLocation')}</h4>
            <div className={styles.coordinates}>
              <div className={styles.coordinateItem}>
                <span className={styles.coordinateLabel}>
                  {t('addRestaurantPage.locationPicker.latitude')}:
                </span>
                <span className={styles.coordinateValue}>
                  {selectedPosition.lat.toFixed(6)}
                </span>
              </div>
              <div className={styles.coordinateItem}>
                <span className={styles.coordinateLabel}>
                  {t('addRestaurantPage.locationPicker.longitude')}:
                </span>
                <span className={styles.coordinateValue}>
                  {selectedPosition.lng.toFixed(6)}
                </span>
              </div>
            </div>
            
            {/* Кнопка для проверки местоположения в Google Maps */}
            <button
              type="button"
              onClick={() => {
                const url = `https://www.google.com/maps/@${selectedPosition.lat},${selectedPosition.lng},15z`;
                window.open(url, '_blank');
              }}
              className={styles.verifyLocationButton}
            >
              🔍 {t('addRestaurantPage.locationPicker.verifyLocation')}
            </button>
          </div>
        </div>
      )}

      <div className={styles.locationNote}>
        <p>
          <strong>{t('common.note')}:</strong> {t('addRestaurantPage.locationPicker.note')}
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;