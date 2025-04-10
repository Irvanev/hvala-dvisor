import React from 'react';
import styles from './ReviewItem.module.css';

interface ReviewProps {
  review: {
    id: string;
    restaurant: string;
    rating: number;
    comment: string;
    date: string;
  };
}

const ReviewItem: React.FC<ReviewProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.star}>★</span>
        ))}
        {halfStar && <span className={styles.star}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.emptyStar}>☆</span>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewLeft}>
          <h3 className={styles.restaurantName}>{review.restaurant}</h3>
          {renderStars(review.rating)}
        </div>
        <span className={styles.reviewDate}>{review.date}</span>
      </div>
      
      <p className={styles.reviewText}>{review.comment}</p>
      
      <div className={styles.reviewActions}>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>👍</span>
          <span className={styles.actionText}>Полезно</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>💬</span>
          <span className={styles.actionText}>Комментировать</span>
        </button>
        <button className={styles.actionButton}>
          <span className={styles.actionIcon}>🔗</span>
          <span className={styles.actionText}>Поделиться</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;