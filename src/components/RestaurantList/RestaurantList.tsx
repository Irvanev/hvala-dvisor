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
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  userFavorites,
  onSaveToggle,
  onRestaurantClick,
}) => {
  return (
    <div className={styles.restaurantList}>
      {restaurants.map(restaurant => (
        <Card
          key={restaurant.id}
          id={restaurant.id}
          title={restaurant.title}
          images={restaurant.images}
          location={restaurant.location}
          rating={restaurant.rating}
          cuisineTags={restaurant.cuisineTags}
          featureTags={restaurant.featureTags}
          priceRange={restaurant.priceRange}
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