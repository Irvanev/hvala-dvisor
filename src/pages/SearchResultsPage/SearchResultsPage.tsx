// SearchResultsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantList from '../../components/RestaurantList/RestaurantList';
import MapPlaceholder from '../../components/MapPlaceholder/MapPlaceholder';
import FilterBar from '../../components/FilterBar/FilterBar';
import styles from './SearchResultsPage.module.css';
import { Restaurant } from '../../models/types';

import { collection, getDocs, query as firestoreQuery, where, orderBy } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const searchQuery = searchParams.get('query') || '';
  const locationParam = searchParams.get('location') || '';

  useEffect(() => {
    // Модифицированный fetchRestaurants:
const fetchRestaurants = async () => {
  setLoading(true);
  try {
    // Создаем запрос с учетом возможного отсутствия индекса
    let fetchedRestaurants: Restaurant[] = [];
    
    try {
      // Пробуем выполнить запрос с фильтрацией и сортировкой
      const restaurantsQuery = firestoreQuery(
        collection(firestore, 'Restaurants'),
        where('moderationStatus', '==', 'approved'),
        orderBy('rating', 'desc')
      );
      const querySnapshot = await getDocs(restaurantsQuery);
      
      fetchedRestaurants = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          rating: data.rating || 0,
          images: data.images || [],
          cuisineTags: data.cuisineTags || [],
          featureTags: data.featureTags || [],
          priceRange: data.priceRange || '',
          ...data
        } as Restaurant;
      });
    } catch (indexError) {
      console.error("Ошибка индекса:", indexError);
      
      // Если получили ошибку индекса, используем более простой запрос без сортировки
      const simpleQuery = firestoreQuery(
        collection(firestore, 'Restaurants')
      );
      const simpleSnapshot = await getDocs(simpleQuery);
      
      fetchedRestaurants = simpleSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            rating: data.rating || 0,
            images: data.images || [],
            cuisineTags: data.cuisineTags || [],
            featureTags: data.featureTags || [],
            priceRange: data.priceRange || '',
            ...data
          } as Restaurant;
        })
        .filter(restaurant => restaurant.moderationStatus === 'approved');
    }
    
    // Если даже простой запрос не сработал, используем мок-данные

    
    // Фильтрация на стороне клиента
    let filtered = [...fetchedRestaurants];
    
    if (searchQuery) {
      filtered = filtered.filter(restaurant =>
        restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.description && restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (locationParam) {
      filtered = filtered.filter(restaurant => {
        if (typeof restaurant.location === 'string') {
          return restaurant.location.toLowerCase().includes(locationParam.toLowerCase());
        } else if (typeof restaurant.location === 'object' && restaurant.location) {
          const locationObj = restaurant.location as any;
          return Object.values(locationObj).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(locationParam.toLowerCase())
          );
        }
        return false;
      });
    }

    setRestaurants(fetchedRestaurants);
    setFilteredRestaurants(filtered);
    setUserFavorites(['rest1', 'rest3']);
    setLoading(false);
  } catch (err) {
    setError("Ошибка загрузки данных. Требуется создать индекс в Firebase. Перейдите в консоль Firebase и создайте индекс для коллекции 'Restaurants' с полями 'moderationStatus' и 'rating'.");
    console.error('Ошибка при загрузке ресторанов:', err);
    setLoading(false);
  }
};
  
    fetchRestaurants();
  }, [searchQuery, locationParam]);

  // Передаем также выбранный ресторан объект через state
  const handleRestaurantClick = useCallback(
    (id: string) => {
      const selected = filteredRestaurants.find(r => r.id === id);
      if (selected) {
        navigate(`/restaurant/${id}`, { state: selected });
      } else {
        navigate(`/restaurant/${id}`);
      }
    },
    [filteredRestaurants, navigate]
  );

  const handleSaveToggle = useCallback((id: string, isSaved: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setUserFavorites(prev =>
      isSaved ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  }, []);

  const handleMapToggle = () => {
    setShowMap(prev => !prev);
  };

  const handleNavBarSearch = useCallback((searchQuery: string) => {
    navigate(`/s?query=${encodeURIComponent(searchQuery)}`);
  }, [navigate]);

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    navigate('/login');
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Загрузка...</div>;
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsPage}>
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={handleWelcomeClick}
        isStatic={true}
      />
      <div className={styles.pageContainer}>
        <FilterBar showMap={showMap} onMapToggle={handleMapToggle} />
        <div className={styles.contentContainer}>
          <div className={showMap ? '' : styles.fullWidth}>
            <RestaurantList
              restaurants={filteredRestaurants}
              userFavorites={userFavorites}
              onSaveToggle={handleSaveToggle}
              onRestaurantClick={handleRestaurantClick}
              showFullWidth={!showMap}
            />
          </div>
          {showMap && <MapPlaceholder />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;