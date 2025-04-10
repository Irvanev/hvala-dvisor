import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card/Card';
import styles from './RestaurantGrid.module.css';

interface Restaurant {
  id: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  image: string;
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  userFavorites: string[];
  onSaveToggle: (id: string, isSaved: boolean, event?: React.MouseEvent) => void;
}

const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  restaurants,
  userFavorites,
  onSaveToggle
}) => {
  return (
    <div className={styles.restaurantGrid}>
      {restaurants.map((restaurant) => (
        <Link
          key={restaurant.id}
          to={`/restaurant/${restaurant.id}`}
          className={styles.restaurantLink}
        >
          <Card
            id={restaurant.id}
            image={restaurant.image}
            title={restaurant.title}
            location={restaurant.location}
            rating={restaurant.rating}
            cuisineTags={restaurant.cuisineTags}
            featureTags={restaurant.featureTags}
            priceRange={restaurant.priceRange}
            savedStatus={userFavorites.includes(restaurant.id)}
            onSaveToggle={(isSaved, event) =>
              onSaveToggle(restaurant.id, isSaved, event)
            }
          />
        </Link>
      ))}
    </div>
  );
};

export default RestaurantGrid;