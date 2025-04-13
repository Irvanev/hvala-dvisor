// components/MapPlaceholder/MapPlaceholder.tsx
import React from 'react';
import styles from './MapPlaceholder.module.css';

const mapPlaceholderUrl = 'https://placehold.jp/e6eef7/a6bfdf/800x600.png?text=Restaurant%20Map';

const MapPlaceholder: React.FC = () => {
  return (
    <div className={styles.mapContainer}>
      <img
        src={mapPlaceholderUrl}
        alt="Карта ресторанов"
        className={styles.mapImage}
      />
    </div>
  );
};

export default MapPlaceholder;