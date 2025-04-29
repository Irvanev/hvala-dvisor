import React, { useRef } from 'react';
import addStyles from '../AddRestaurantPage.module.css';
import editStyles from '../../EditRestaurantPage/EditRestaurantPage.module.css';

interface PhotoUploaderProps {
  photos: File[];
  onPhotoUpload: (files: File[]) => void;
  onPhotoRemove: (index: number) => void;
  error?: string;
  isEdit?: boolean; // Новый параметр для выбора стилей
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onPhotoUpload,
  onPhotoRemove,
  error,
  isEdit = false // По умолчанию - режим добавления
}) => {
  // Выбираем нужный стиль в зависимости от контекста
  const styles = isEdit ? editStyles : addStyles;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onPhotoUpload(newFiles);

      // Сбрасываем input чтобы можно было выбрать те же файлы повторно
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onPhotoUpload(droppedFiles);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.photoUploaderSection}>
      <h3 className={styles.sectionTitle}>Фотографии ресторана</h3>
      <p className={styles.sectionDescription}>
        Загрузите фотографии ресторана, которые помогут посетителям получить представление о заведении.
        Рекомендуем загрузить фото интерьера, экстерьера, фирменных блюд и атмосферы.
      </p>

      {error && <div className={`${styles.errorMessage} error-message`}>{error}</div>}

      <div
        className={styles.dropZone}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <div className={styles.dropZoneContent}>
          <div className={styles.uploadIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7v11H5V7h3l1-2h6l1 2h3zm-8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
            </svg>
          </div>
          <p className={styles.dropZoneText}>
            Перетащите фотографии сюда или нажмите для выбора
          </p>
          <span className={styles.dropZoneHint}>
            Поддерживаются JPG, PNG, WEBP. Максимальный размер файла: 10 МБ
          </span>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          multiple
          className={styles.fileInput}
        />
      </div>

      {photos.length > 0 && (
        <div className={styles.photoPreviewContainer}>
          <h4 className={styles.previewTitle}>Загруженные фотографии ({photos.length})</h4>

          <div className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <div key={`${photo.name}-${index}`} className={styles.photoItem}>
                <div className={styles.photoPreview}>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Фото ${index + 1}`}
                  />
                </div>
                <div className={styles.photoInfo}>
                  <span className={styles.photoName}>{photo.name}</span>
                  <button
                    type="button"
                    onClick={() => onPhotoRemove(index)}
                    className={styles.removePhotoButton}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;