import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import styles from './RestaurantGrid.module.css';
import { Restaurant } from '../../models/types';

interface RestaurantGridProps {
  restaurants: Restaurant[];
  userFavorites: string[];
  onSaveToggle: (id: string, isSaved: boolean, event?: React.MouseEvent) => void;
}

const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  restaurants,
  userFavorites,
  onSaveToggle,
}) => {
  const navigate = useNavigate();

  const handleCardClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  return (
    <div className={styles.restaurantGrid}>
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className={styles.gridItem}>
          <Card
            id={restaurant.id}
            images={restaurant.galleryUrls.length > 0 ? restaurant.galleryUrls : restaurant.mainImageUrl ? [restaurant.mainImageUrl] : []}
            title={restaurant.title}
            location={`${restaurant.address.city}, ${restaurant.address.country}`}
            rating={restaurant.rating}
            cuisineTags={restaurant.cuisineTags}
            featureTags={restaurant.featureTags}
            priceRange={restaurant.priceRange}
            savedStatus={userFavorites.includes(restaurant.id)}
            onClick={() => handleCardClick(restaurant.id)}
            onSaveToggle={(saved, event) =>
              onSaveToggle(restaurant.id, saved, event)
            }
          />

        </div>
      ))}
    </div>
  );
};

export default RestaurantGrid;