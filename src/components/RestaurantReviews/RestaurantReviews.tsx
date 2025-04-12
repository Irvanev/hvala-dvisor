import React, { useState } from 'react';
import styles from './RestaurantReviews.module.css';

interface Review {
  id: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  likes?: number;
}

interface RestaurantReviewsProps {
  rating: number;
  reviews: Review[];
  onWriteReview: () => void;
}

const RestaurantReviews: React.FC<RestaurantReviewsProps> = ({
  rating,
  reviews,
  onWriteReview
}) => {
  const [filterType, setFilterType] = useState<'newest' | 'positive' | 'critical'>('newest');

  // Рендер звездочек для рейтинга
  const renderStars = (rating: number) => {
    const stars = [];
    // Количество полных звезд
    const fullStars = Math.floor(rating);
    // Есть ли половина звезды
    const hasHalfStar = rating % 1 >= 0.5;
    // Количество пустых звезд
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    // Добавляем полные звезды
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className={styles.star}>★</span>);
    }
    
    // Добавляем половину звезды, если есть
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>★</span>);
    }
    
    // Добавляем пустые звезды
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.emptyStar}>☆</span>);
    }
    
    return stars;
  };

  // Фильтруем отзывы в зависимости от выбранного фильтра
  const getFilteredReviews = () => {
    switch (filterType) {
      case 'positive':
        return [...reviews].filter(review => review.rating >= 4).sort((a, b) => b.rating - a.rating);
      case 'critical':
        return [...reviews].filter(review => review.rating < 4).sort((a, b) => a.rating - b.rating);
      case 'newest':
      default:
        return [...reviews]; // По умолчанию отзывы уже отсортированы по дате
    }
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <div className={styles.reviewsSummary}>
          <h2 className={styles.sectionTitle}>Отзывы посетителей</h2>
          <div className={styles.reviewsOverview}>
            <div className={styles.reviewsRating}>
              <div className={styles.ratingBig}>{rating.toFixed(1)}</div>
              <div className={styles.ratingStarsBig}>
                {renderStars(rating)}
              </div>
            </div>
            <div className={styles.reviewsCount}>
              Всего {reviews.length} отзывов
            </div>
          </div>
        </div>
        
        <button className={styles.writeReviewButton} onClick={onWriteReview}>
          <span className={styles.writeReviewIcon}>✏️</span>
          Написать отзыв
        </button>
      </div>
      
      <div className={styles.reviewFilters}>
        <div className={styles.filterLabel}>Сортировать по:</div>
        <div className={styles.filterOptions}>
          <button 
            className={`${styles.filterOption} ${filterType === 'newest' ? styles.active : ''}`}
            onClick={() => setFilterType('newest')}
          >
            Новые
          </button>
          <button 
            className={`${styles.filterOption} ${filterType === 'positive' ? styles.active : ''}`}
            onClick={() => setFilterType('positive')}
          >
            Положительные
          </button>
          <button 
            className={`${styles.filterOption} ${filterType === 'critical' ? styles.active : ''}`}
            onClick={() => setFilterType('critical')}
          >
            Критические
          </button>
        </div>
      </div>
      
      {filteredReviews.length > 0 ? (
        <div className={styles.reviewsList}>
          {filteredReviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewAuthorSection}>
                <img 
                  src={review.authorAvatar || "https://placehold.jp/50x50.png"}
                  alt={review.author}
                  className={styles.reviewAuthorAvatar}
                />
                <div className={styles.reviewAuthorInfo}>
                  <h3 className={styles.reviewAuthorName}>{review.author}</h3>
                  <div className={styles.reviewMetaInfo}>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.reviewContent}>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
                
                <div className={styles.reviewActions}>
                  <button className={styles.reviewLikeButton}>
                    <span className={styles.likeIcon}>👍</span>
                    <span>Полезно</span>
                    {review.likes && review.likes > 0 && (
                      <span className={styles.likesCount}>{review.likes}</span>
                    )}
                  </button>
                  <button className={styles.reviewReplyButton}>
                    <span className={styles.replyIcon}>💬</span>
                    <span>Ответить</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noReviews}>
          <div className={styles.noReviewsIcon}>📝</div>
          <h3 className={styles.noReviewsTitle}>
            {filterType === 'newest' 
              ? 'Пока нет отзывов' 
              : filterType === 'positive' 
                ? 'Положительных отзывов пока нет' 
                : 'Критических отзывов пока нет'}
          </h3>
          <p className={styles.noReviewsText}>
            {filterType === 'newest' 
              ? 'Будьте первым, кто поделится своим мнением об этом ресторане!' 
              : 'Попробуйте изменить фильтр для просмотра других отзывов.'}
          </p>
          {filterType === 'newest' && (
            <button className={styles.writeFirstReviewButton} onClick={onWriteReview}>
              Написать первый отзыв
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;