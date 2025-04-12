import React from 'react';
import styles from './RestaurantPhotos.module.css';

interface RestaurantPhotosProps {
  photos: string[];
  onPhotoClick: (index: number) => void;
}

const RestaurantPhotos: React.FC<RestaurantPhotosProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className={styles.photosSection}>
      <h2 className={styles.sectionTitle}>Фотогалерея</h2>
      
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
                  alt={`Фото ${index + 1}`} 
                  className={styles.photoImage} 
                />
                <div className={styles.photoOverlay}>
                  <span className={styles.photoExpand}>🔍</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.photosNote}>
            <p>Нажмите на фото для просмотра в полном размере. Фотографии могут не отражать актуальный вид ресторана и блюд.</p>
          </div>
        </>
      ) : (
        <div className={styles.noPhotos}>
          <div className={styles.noPhotosIcon}>📷</div>
          <h3 className={styles.noPhotosTitle}>Фотографии отсутствуют</h3>
          <p className={styles.noPhotosText}>
            У этого ресторана пока нет фотографий. Вы можете помочь другим посетителям, 
            загрузив фотографии после посещения.
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantPhotos;