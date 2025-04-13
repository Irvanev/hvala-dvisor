import React, { useEffect, useRef, useState } from 'react';
import styles from './RestaurantMap.module.css';
import { Restaurant } from '../../models/types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  onRestaurantSelect: (id: string) => void;
  // center и zoom можно задать по умолчанию или убрать, пока не задействованы
}

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Имитация загрузки карты
  useEffect(() => {
    const loadMap = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setMapLoaded(true);
      } catch {
        setError('Не удалось загрузить карту. Пожалуйста, обновите страницу.');
      }
    };
    loadMap();
  }, []);

  // Рендер маркеров для каждого ресторана (пока с рандомным позиционированием)
  const renderMarkers = () => {
    return restaurants.map(restaurant => (
      <div 
        key={restaurant.id}
        className={`${styles.mapMarker} ${selectedRestaurantId === restaurant.id ? styles.selectedMarker : ''}`}
        style={{
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`
        }}
        onClick={() => onRestaurantSelect(restaurant.id)}
      >
        <div className={styles.markerContent}>
          <span className={styles.markerRating}>
            {restaurant.rating ? restaurant.rating.toFixed(1) : "N/A"}
          </span>
          <div className={styles.markerTooltip}>
            <div className={styles.markerTitle}>{restaurant.title}</div>
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className={styles.mapError}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.reloadButton}>
          Перезагрузить
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer} ref={mapRef}>
      {!mapLoaded ? (
        <div className={styles.mapLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Загрузка карты...</p>
        </div>
      ) : (
        <div className={styles.map}>
          <div className={styles.mapBackground}>
            {renderMarkers()}
          </div>
          <div className={styles.mapInfo}>
            <div className={styles.mapZoomControls}>
              <button className={styles.zoomButton}>+</button>
              <button className={styles.zoomButton}>−</button>
            </div>
            <div className={styles.mapAttribution}>
              © HvalaDviser Maps 2024
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMap;
