import React from 'react';
import { useTranslation } from 'react-i18next';
import addStyles from '../AddRestaurantPage.module.css';
import editStyles from '../../EditRestaurantPage/EditRestaurantPage.module.css';

interface LocationPickerProps {
  onLocationSelect: (position: { lat: number; lng: number }) => void;
  initialPosition: { lat: number; lng: number } | null;
  error?: string;
  isEdit?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialPosition,
  error,
  isEdit = false
}) => {
  const { t } = useTranslation();
  const styles = isEdit ? editStyles : addStyles;

  const handleMapClick = () => {
    const demoPosition = {
      lat: 42.6507,
      lng: 18.0944
    };
    onLocationSelect(demoPosition);
  };

  return (
    <div className={styles.locationPickerSection}>
      <h3 className={styles.sectionTitle}>{t('addRestaurantPage.locationPicker.title')}</h3>
      <p className={styles.sectionDescription}>
        {t('addRestaurantPage.locationPicker.description')}
      </p>

      {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}

      <div className={styles.mapContainer}>
        <div className={styles.mapPlaceholder} onClick={handleMapClick}>
          <div className={styles.mapInstructions}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.mapIcon}>
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
            </svg>
            <p>{t('addRestaurantPage.locationPicker.instruction')}</p>
          </div>

          {initialPosition && (
            <div className={styles.selectedLocation}>
              <p>
                <strong>{t('addRestaurantPage.locationPicker.selectedLocation')}</strong><br />
                {t('addRestaurantPage.locationPicker.latitude')} {initialPosition.lat.toFixed(6)}<br />
                {t('addRestaurantPage.locationPicker.longitude')} {initialPosition.lng.toFixed(6)}
              </p>
            </div>
          )}

          <img
            src="https://placehold.jp/800x400.png"
            alt={t('addRestaurantPage.locationPicker.mapAlt')}
            className={styles.mapImage}
          />
        </div>
      </div>

      <div className={styles.locationNote}>
        <p>
          <strong>{t('common.note')}:</strong> {t('addRestaurantPage.locationPicker.note')}
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;