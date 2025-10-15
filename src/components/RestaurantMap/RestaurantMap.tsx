// src/components/RestaurantMap/RestaurantMap.tsx
import React, { memo, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { geoPointToGoogleMaps, formatRestaurantAddress } from '../../utils/geoUtils';
import { Restaurant } from '../../models/types';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';
import styles from './RestaurantMap.module.css';

interface RestaurantMapProps {
  restaurant: Restaurant;
  className?: string;
  height?: string;
  zoom?: number;
  showDirectionsButton?: boolean;
}

const defaultCenter = {
  lat: 55.7558,
  lng: 37.6176
};

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurant,
  className,
  height = '400px',
  zoom = 15,
  showDirectionsButton = true
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const mapCenter = restaurant.location 
    ? geoPointToGoogleMaps(restaurant.location)
    : defaultCenter;

  const formattedAddress = formatRestaurantAddress(restaurant.address);

  const handleMarkerClick = useCallback(() => {
    setShowInfoWindow(true);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setShowInfoWindow(false);
  }, []);

  const handleDirectionsClick = () => {
    if (restaurant.location) {
      const coords = geoPointToGoogleMaps(restaurant.location);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
      window.open(url, '_blank');
    }
  };

  const createMarkerIcon = () => {
    if (!isLoaded || !window.google?.maps) {
      return undefined;
    }

    try {
      return {
        url: '/icons/restaurant-marker.png',
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(20, 40)
      };
    } catch (error) {
      console.warn('Не удалось создать кастомную иконку:', error);
      return undefined;
    }
  };

  // Загрузка API
  if (!isLoaded && !loadError) {
    return (
      <div className={`${styles.mapLoading} ${className}`} style={{ height }}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка карты...</p>
      </div>
    );
  }

  // Ошибка загрузки API
  if (loadError) {
    return (
      <div className={`${styles.mapError} ${className}`} style={{ height }}>
        <div className={styles.errorContent}>
          <h3>Карта временно недоступна</h3>
          <p>Адрес: {formattedAddress}</p>
          {showDirectionsButton && (
            <button 
              onClick={handleDirectionsClick}
              className={styles.directionsButton}
            >
              Открыть в Google Maps
            </button>
          )}
        </div>
      </div>
    );
  }

  // Нет координат
  if (!restaurant.location) {
    return (
      <div className={`${styles.mapPlaceholder} ${className}`} style={{ height }}>
        <div className={styles.placeholderContent}>
          <h4>Местоположение не указано</h4>
          <p>Адрес: {formattedAddress}</p>
          {showDirectionsButton && (
            <button 
              onClick={handleDirectionsClick}
              className={styles.directionsButton}
            >
              Открыть в Google Maps
            </button>
          )}
        </div>
      </div>
    );
  }

  // Рендер карты
  return (
    <div className={`${styles.mapContainer} ${className}`}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={mapCenter}
        zoom={zoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'on' }]
            }
          ]
        }}
      >
        <Marker
          position={mapCenter}
          onClick={handleMarkerClick}
          icon={createMarkerIcon()}
        />

        {showInfoWindow && (
          <InfoWindow
            position={mapCenter}
            onCloseClick={handleInfoWindowClose}
          >
            <div className={styles.infoWindow}>
              <h4>{restaurant.title}</h4>
              <p className={styles.address}>{formattedAddress}</p>
              
              {restaurant.contact?.phone && (
                <p className={styles.contact}>
                  📞 {restaurant.contact.phone}
                </p>
              )}
              
              {restaurant.contact?.website && (
                <p className={styles.contact}>
                  🌐 <a 
                    href={restaurant.contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Сайт
                  </a>
                </p>
              )}

              <div className={styles.restaurantInfo}>
                <span className={styles.rating}>
                  ⭐ {restaurant.rating.toFixed(1)}
                </span>
                {restaurant.priceRange && (
                  <span className={styles.priceRange}>
                    {restaurant.priceRange}
                  </span>
                )}
              </div>

              {restaurant.cuisineTags.length > 0 && (
                <div className={styles.cuisineTags}>
                  {restaurant.cuisineTags.slice(0, 3).map((tag, index) => (
                    <span key={index} className={styles.cuisineTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.infoActions}>
                {showDirectionsButton && (
                  <button
                    onClick={handleDirectionsClick}
                    className={styles.directionsLink}
                  >
                    Проложить маршрут
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default memo(RestaurantMap);