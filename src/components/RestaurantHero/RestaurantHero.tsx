import React from 'react';
import styles from './RestaurantHero.module.css';

interface RestaurantHeroProps {
  title: string;
  rating: number;
  reviewCount: number;
  cuisine?: string;
  priceRange?: string;
  images: string[];
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onViewAllPhotos: () => void;
}

const RestaurantHero: React.FC<RestaurantHeroProps> = ({
  title,
  rating,
  reviewCount,
  cuisine,
  priceRange,
  images,
  isFavorite,
  onFavoriteToggle,
  onViewAllPhotos
}) => {
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

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroImageContainer}>
        {images && images.length > 0 ? (
          <>
            <img
              src={images[0]}
              alt={title}
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
          </>
        ) : (
          <div className={styles.noImage}>Изображение отсутствует</div>
        )}
      </div>
      
      <div className={styles.heroContent}>
        <div className={styles.restaurantInfo}>
          <h1 className={styles.restaurantTitle}>{title}</h1>
          
          <div className={styles.restaurantMeta}>
            <div className={styles.ratingSummary}>
              <div className={styles.ratingValue}>{rating.toFixed(1)}</div>
              <div className={styles.ratingStars}>
                {renderStars(rating)}
              </div>
              <span className={styles.reviewCount}>
                ({reviewCount} отзывов)
              </span>
            </div>
            
            <div className={styles.cuisineAndPrice}>
              {cuisine && <span className={styles.cuisineTag}>{cuisine}</span>}
              {priceRange && <span className={styles.priceRange}>{priceRange}</span>}
            </div>
            
            <button 
              className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
              onClick={onFavoriteToggle}
            >
              <span className={styles.heartIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </span>
              <span className={styles.favoriteText}>
                {isFavorite ? 'В избранном' : 'В избранное'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHero;