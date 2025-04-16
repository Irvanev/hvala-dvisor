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

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';



const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const query = searchParams.get('query') || '';
  const locationParam = searchParams.get('location') || '';

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // Пример запроса: выбираем рестораны со статусом "approved"
        const restaurantsQuery = query(
          collection(db, 'Restaurants'),
          where('moderationStatus', '==', 'approved'),
          // Если нужно сортировать, например, по рейтингу или дате создания:
          orderBy('rating', 'desc')
        );
        const querySnapshot = await getDocs(restaurantsQuery);
  
        const fetchedRestaurants: Restaurant[] = querySnapshot.docs.map(doc => {
          // Приводим данные к типу Restaurant. Возможно, понадобится дополнительная обработка,
          // если поля, например, timestamps, приходят в виде объектов.
          return {
            id: doc.id,
            ...doc.data()
          } as Restaurant;
        });
  
        // Фильтруем данные по поисковому запросу и локации, если они заданы в параметрах URL
        let filtered = [...fetchedRestaurants];
        if (query) {
          filtered = filtered.filter(restaurant =>
            restaurant.title.toLowerCase().includes(query.toLowerCase()) ||
            restaurant.description.toLowerCase().includes(query.toLowerCase())
          );
        }
        if (location) {
          filtered = filtered.filter(restaurant =>
            restaurant.location.toLowerCase().includes(location.toLowerCase())
          );
        }
  
        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(filtered);
        // Можно по умолчанию загрузить избранные рестораны, если такая логика нужна
        setUserFavorites(['rest1', 'rest3']);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        setLoading(false);
      }
    };
  
    fetchRestaurants();
  }, [query, location]);

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
