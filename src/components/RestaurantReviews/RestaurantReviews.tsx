import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RestaurantReviews.module.css';
import ReviewForm from '../ReviewForm/ReviewForm';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  likes?: number;
}

// Интерфейс для данных формы отзыва
interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  images: File[];
  recommends: boolean;
}

interface RestaurantReviewsProps {
  reviews: Review[];
  restaurantId: string;
  onWriteReviewClick?: () => void;
  onSubmitReview: (reviewData: ReviewFormData) => Promise<boolean>;
}

const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({
  reviews,
  restaurantId,
  onWriteReviewClick,
  onSubmitReview
}) => {
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Используем хук авторизации для получения информации о пользователе
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Обработчик клика на кнопку "Написать отзыв"
  const handleWriteReviewClick = () => {
    // Если статус авторизации еще загружается, ничего не делаем
    if (isLoading) return;
    
    // Проверяем, авторизован ли пользователь
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      // Сохраняем текущий путь, чтобы вернуться после авторизации
      navigate('/login', { 
        state: { 
          from: location.pathname + location.search,
          showReviewForm: true  // Добавляем флаг, чтобы открыть форму после возвращения
        } 
      });
      return;
    }
    
    setShowReviewForm(true);
    
    // Вызываем колбэк только если он предоставлен
    if (onWriteReviewClick && typeof onWriteReviewClick === 'function') {
      onWriteReviewClick();
    }
  };

  // Обработчик отправки формы отзыва
  const handleReviewSubmit = async (formData: ReviewFormData): Promise<boolean> => {
    // Дополнительная проверка авторизации при отправке
    if (!isAuthenticated) {
      setSubmitError('Для отправки отзыва необходимо авторизоваться');
      return false;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Вызываем обработчик отправки отзыва из родительского компонента
      const success = await onSubmitReview(formData);
      
      // Если отправка успешна, скрываем форму
      if (success) {
        setShowReviewForm(false);
      }
      return success;
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitError('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отмена создания отзыва
  const handleCancelReview = () => {
    setShowReviewForm(false);
  };

  // Проверяем, есть ли в location.state флаг showReviewForm
  // Это нужно для автоматического открытия формы после возвращения со страницы логина
  React.useEffect(() => {
    const state = location.state as { showReviewForm?: boolean } | null;
    if (state?.showReviewForm && isAuthenticated && !showReviewForm) {
      setShowReviewForm(true);
      
      // Очищаем state, чтобы форма не открывалась при обновлении страницы
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [isAuthenticated, location, navigate, showReviewForm]);

  return (
    <div className={styles.reviewsContainer}>
      {showReviewForm ? (
        <ReviewForm 
          restaurantId={restaurantId}
          onReviewSubmit={handleReviewSubmit}
          onCancel={handleCancelReview}
        />
      ) : (
        <>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Отзывы посетителей</h2>
            <button 
              className={styles.writeReviewButton} 
              onClick={handleWriteReviewClick}
            >
              Написать отзыв
            </button>
          </div>
          
          {submitError && (
            <div className={styles.errorMessage}>{submitError}</div>
          )}
          
          {reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      {review.authorAvatar ? (
                        <img 
                          src={review.authorAvatar} 
                          alt={review.author} 
                          className={styles.userAvatar} 
                        />
                      ) : (
                        <div className={styles.userAvatarPlaceholder}>
                          {review.author.charAt(0)}
                        </div>
                      )}
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{review.author}</div>
                        <div className={styles.reviewDate}>{review.date}</div>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`${styles.star} ${i < review.rating ? styles.starFilled : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.reviewContent}>
                    {review.comment}
                  </div>
                  <div className={styles.reviewActions}>
                    <button className={styles.reviewLikeButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 21H5V9H1V21ZM23 10C23 8.9 22.1 8 21 8H14.69L15.64 3.43L15.67 3.11C15.67 2.7 15.5 2.32 15.23 2.05L14.17 1L7.59 7.59C7.22 7.95 7 8.45 7 9V19C7 20.1 7.9 21 9 21H18C18.83 21 19.54 20.5 19.84 19.78L22.86 12.73C22.95 12.5 23 12.26 23 12V10Z" fill="currentColor"/>
                      </svg>
                      {review.likes || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noReviews}>
              <p>У данного ресторана пока нет отзывов.</p>
              <p>Станьте первым, кто поделится своим мнением!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantReviews;