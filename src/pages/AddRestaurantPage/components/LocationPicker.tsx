import React from 'react';
import addStyles from '../AddRestaurantPage.module.css';
import editStyles from '../../EditRestaurantPage/EditRestaurantPage.module.css';

interface LocationPickerProps {
  onLocationSelect: (position: { lat: number; lng: number }) => void;
  initialPosition: { lat: number; lng: number } | null;
  error?: string;
  isEdit?: boolean; // Новый параметр для выбора стилей
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition,
  error,
  isEdit = false // По умолчанию - режим добавления
}) => {
  // Выбираем нужный стиль в зависимости от контекста
  const styles = isEdit ? editStyles : addStyles;

  // В реальном приложении здесь будет интеграция с Google Maps или другим сервисом карт
  // Для демонстрации используем заглушку

  const handleMapClick = () => {
    // Имитация выбора местоположения
    const demoPosition = {
      lat: 42.6507,
      lng: 18.0944
    };

    onLocationSelect(demoPosition);
  };

  return (
    <div className={styles.locationPickerSection}>
      <h3 className={styles.sectionTitle}>Местоположение на карте</h3>
      <p className={styles.sectionDescription}>
        Укажите точное местоположение ресторана на карте. Нажмите на карту, чтобы отметить позицию.
      </p>

      {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}

      <div className={styles.mapContainer}>
        {/* В реальном приложении здесь будет компонент карты */}
        <div
          className={styles.mapPlaceholder}
          onClick={handleMapClick}
        >
          <div className={styles.mapInstructions}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.mapIcon}>
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
            </svg>
            <p>Нажмите на карту, чтобы выбрать местоположение ресторана</p>
          </div>

          {initialPosition && (
            <div className={styles.selectedLocation}>
              <p>
                <strong>Выбранное местоположение:</strong><br />
                Широта: {initialPosition.lat.toFixed(6)}<br />
                Долгота: {initialPosition.lng.toFixed(6)}
              </p>
            </div>
          )}

          <img
            src="https://placehold.jp/800x400.png"
            alt="Карта"
            className={styles.mapImage}
          />
        </div>
      </div>

      <div className={styles.locationNote}>
        <p>
          <strong>Примечание:</strong> Точное местоположение важно для корректного отображения ресторана на карте и построения маршрутов для посетителей.
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;