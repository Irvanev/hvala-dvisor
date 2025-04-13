// components/RestaurantList/RestaurantList.tsx
import React from 'react';
import Card from '../Card/Card';
import { Restaurant } from '../../models/types';
import styles from './RestaurantList.module.css';

interface RestaurantListProps {
  restaurants: Restaurant[];
  userFavorites: string[];
  onSaveToggle: (id: string, isSaved: boolean, event?: React.MouseEvent) => void;
  onRestaurantClick: (id: string) => void;
  loading?: boolean;
  showFullWidth?: boolean;
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  userFavorites,
  onSaveToggle,
  onRestaurantClick,
  loading = false,
  showFullWidth = false,
}) => {
  // If loading, show skeleton loading UI
  if (loading) {
    return (
      <div className={styles.loading}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className={styles.loadingCard} />
        ))}
      </div>
    );
  }

  // If no restaurants found, show empty state
  if (restaurants.length === 0) {
    return (
      <div className={styles.emptyResults}>
        <svg viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <h2 className={styles.emptyResultsTitle}>Ничего не найдено</h2>
        <p className={styles.emptyResultsSubtitle}>Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className={`${styles.restaurantList} ${showFullWidth ? styles.fullWidthGrid : ''}`}>
      {restaurants.map(restaurant => (
        <Card
          key={restaurant.id}
          id={restaurant.id}
          title={restaurant.title}
          images={restaurant.images}
          location={restaurant.location}
          rating={restaurant.rating}
          cuisineTags={restaurant.cuisineTags || []}
          featureTags={restaurant.featureTags || []}
          priceRange={restaurant.priceRange || ''}
          savedStatus={userFavorites.includes(restaurant.id)}
          onSaveToggle={(saved, event) => onSaveToggle(restaurant.id, saved, event)}
          onClick={() => onRestaurantClick(restaurant.id)}
          variant="default" // Используем стандартный стиль, как на HomePage
        />
      ))}
    </div>
  );
};

export default RestaurantList;

