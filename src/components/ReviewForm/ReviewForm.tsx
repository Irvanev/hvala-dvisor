import React, { useState } from 'react';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  restaurantId: string;
  onReviewSubmit: (reviewData: ReviewFormData) => Promise<boolean>;
  onCancel?: () => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  images: File[];
  recommends: boolean;
}

interface ReviewFormErrors extends Partial<Record<keyof ReviewFormData, string>> {
  general?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ restaurantId, onReviewSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: '',
    visitDate: '',
    images: [],
    recommends: true
  });

  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name as keyof ReviewFormData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleRatingChange = (newRating: number) => {
    setFormData({ ...formData, rating: newRating });
    if (errors.rating) {
      setErrors({ ...errors, rating: '' });
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = filesArray.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        
        if (!isImage || !isValidSize) {
          // You could show an error for invalid files here
          return false;
        }
        
        return true;
      });
      
      setFormData({ ...formData, images: [...formData.images, ...validFiles] });
      
      // Create preview URLs for the images
      const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagesPreviews([...imagesPreviews, ...newImagePreviews]);
    }
  };

  const removeImage = (index: number) => {
    // Remove file from formData
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    
    // Remove preview and revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagesPreviews[index]);
    const newPreviews = [...imagesPreviews];
    newPreviews.splice(index, 1);
    setImagesPreviews(newPreviews);
  };

  const validateForm = (): boolean => {
    const newErrors: ReviewFormErrors = {};
    
    if (!formData.rating || formData.rating < 1) {
      newErrors.rating = 'Пожалуйста, выберите оценку';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Пожалуйста, добавьте заголовок для вашего отзыва';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Заголовок не должен превышать 100 символов';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Пожалуйста, напишите отзыв';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Отзыв должен содержать не менее 50 символов';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Отзыв не должен превышать 2000 символов';
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = 'Пожалуйста, укажите дату посещения';
    } else {
      // Check if date is not in the future
      const selectedDate = new Date(formData.visitDate);
      const today = new Date();
      
      if (selectedDate > today) {
        newErrors.visitDate = 'Дата посещения не может быть в будущем';
      }
    }
    
    // Check for profanity or inappropriate content
    const profanityRegex = /\b(блять|хуй|пизда|ебать|сука)\b/i;
    if (profanityRegex.test(formData.title) || profanityRegex.test(formData.content)) {
      newErrors.general = 'Пожалуйста, не используйте ненормативную лексику в отзыве';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onReviewSubmit(formData);
      
      if (success) {
        // Reset form on success
        setFormData({
          rating: 0,
          title: '',
          content: '',
          visitDate: '',
          images: [],
          recommends: true
        });
        setImagesPreviews([]);
      } else {
        setErrors({ general: 'Не удалось отправить отзыв. Пожалуйста, попробуйте позже.' });
      }
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setErrors({ 
        general: error instanceof Error 
          ? error.message 
          : 'Произошла ошибка при отправке отзыва. Попробуйте позже.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewFormContainer}>
      <h2 className={styles.formTitle}>Оставить отзыв</h2>
      
      {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}
      
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Оценка*</label>
          <div className={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starButton} ${formData.rating >= star ? styles.starActive : ''}`}
                onClick={() => handleRatingChange(star)}
                aria-label={`Оценить на ${star} из 5`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" 
                    fill="currentColor" 
                  />
                </svg>
              </button>
            ))}
          </div>
          {errors.rating && <p className={styles.errorText}>{errors.rating}</p>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>Заголовок*</label>
          <input
            type="text"
            id="title"
            name="title"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Краткое резюме вашего опыта"
            maxLength={100}
          />
          {errors.title && <p className={styles.errorText}>{errors.title}</p>}
          <div className={styles.charCounter}>{formData.title.length}/100</div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>Ваш отзыв*</label>
          <textarea
            id="content"
            name="content"
            className={`${styles.textarea} ${errors.content ? styles.inputError : ''}`}
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Расскажите о вашем опыте: что вам понравилось, что можно улучшить?"
            rows={6}
            maxLength={2000}
          />
          {errors.content && <p className={styles.errorText}>{errors.content}</p>}
          <div className={styles.charCounter}>
            {formData.content.length}/2000
            {formData.content.length < 50 && (
              <span className={styles.minCharsWarning}> (минимум 50 символов)</span>
            )}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="visitDate" className={styles.label}>Дата посещения*</label>
          <input
            type="date"
            id="visitDate"
            name="visitDate"
            className={`${styles.input} ${errors.visitDate ? styles.inputError : ''}`}
            value={formData.visitDate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]} // Set max date to today
          />
          {errors.visitDate && <p className={styles.errorText}>{errors.visitDate}</p>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Фотографии (необязательно)</label>
          <div className={styles.imageUploadContainer}>
            {imagesPreviews.length > 0 && (
              <div className={styles.imagePreviewsContainer}>
                {imagesPreviews.map((previewUrl, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={previewUrl} alt={`Предпросмотр ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageButton}
                      aria-label="Удалить изображение"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.images.length < 5 && (
              <div className={styles.uploadButtonContainer}>
                <label htmlFor="images" className={styles.uploadButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7V19H5V7H8L9 5H15L16 7H19ZM20 5H17L16 3H8L7 5H4C3.45 5 3 5.45 3 6V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V6C21 5.45 20.55 5 20 5ZM12 18C14.76 18 17 15.76 17 13C17 10.24 14.76 8 12 8C9.24 8 7 10.24 7 13C7 15.76 9.24 18 12 18ZM12 10C13.65 10 15 11.35 15 13C15 14.65 13.65 16 12 16C10.35 16 9 14.65 9 13C9 11.35 10.35 10 12 10Z" fill="currentColor"/>
                  </svg>
                  Добавить фото
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className={styles.fileInput}
                />
                <p className={styles.uploadHint}>
                  Можно загрузить до 5 фото (макс. 5 МБ каждое)
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="recommends"
              name="recommends"
              checked={formData.recommends}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <label htmlFor="recommends" className={styles.checkboxLabel}>
              Я рекомендую это заведение
            </label>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          {onCancel && (
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          )}
          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;