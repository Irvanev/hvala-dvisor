import React from 'react';
import styles from './RestaurantPhotos.module.css';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface RestaurantPhotosProps {
  photos: string[];
  onPhotoClick: (index: number) => void;
}

const RestaurantPhotos: React.FC<RestaurantPhotosProps> = ({ photos, onPhotoClick }) => {
  const { t } = useAppTranslation();

  return (
    <div className={styles.photosSection}>
      <h2 className={styles.sectionTitle}>{t('restaurantPhotos.title')}</h2>
      
      {photos.length > 0 ? (
        <>
          <div className={styles.photosGrid}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className={styles.photoCard}
                onClick={() => onPhotoClick(index)}
              >
                <img
                  src={photo}
                  alt={`${t('restaurantPhotos.photo')} ${index + 1}`}
                  className={styles.photoImage}
                />
                <div className={styles.photoOverlay}>
                  <span className={styles.photoExpand}>🔍</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.photosNote}>
            <p>{t('restaurantPhotos.clickToView')}</p>
          </div>
        </>
      ) : (
        <div className={styles.noPhotos}>
          <div className={styles.noPhotosIcon}>📷</div>
          <h3 className={styles.noPhotosTitle}>{t('restaurantPhotos.noPhotos')}</h3>
          <p className={styles.noPhotosText}>
            {t('restaurantPhotos.noPhotosText')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantPhotos;