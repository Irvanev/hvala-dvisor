// pages/SearchResultsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantList from '../../components/RestaurantList/RestaurantList';
import MapPlaceholder from '../../components/MapPlaceholder/MapPlaceholder';
import styles from './SearchResultsPage.module.css';
import { Restaurant } from '../../models/types';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockRestaurants: Restaurant[] = [
          {
            id: 'rest1',
            title: 'Au Bourguignon Du Marais',
            location: 'Подгорица',
            description: 'Изысканный ресторан с французской кухней',
            rating: 4.9,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Французская'],
            featureTags: ['Терраса', 'Детское меню'],
            priceRange: '€€€'
          },
          {
            id: 'rest2',
            title: 'La Maison',
            location: 'Подгорица',
            description: 'Современная французская кухня',
            rating: 4.7,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Французская'],
            featureTags: ['Панорамный вид', 'Винная карта'],
            priceRange: '€€'
          },
          {
            id: 'rest3',
            title: 'Trattoria Italiana',
            location: 'Будва',
            description: 'Итальянская кухня с домашними пастами',
            rating: 4.8,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Итальянская'],
            featureTags: ['Домашняя паста'],
            priceRange: '€€'
          },
          {
            id: 'rest4',
            title: 'El Tapas',
            location: 'Бечичи',
            description: 'Испанская кухня с тапас и паэльей',
            rating: 4.5,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Испанская'],
            featureTags: ['Винная карта'],
            priceRange: '€€€'
          },
          {
            id: 'rest5',
            title: 'Konoba Stari Mlini',
            location: 'Котор',
            description: 'Традиционная черногорская кухня',
            rating: 4.9,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Черногорская'],
            featureTags: ['Вид на море'],
            priceRange: '€€'
          },
          {
            id: 'rest6',
            title: 'Balkan Grill',
            location: 'Подгорица',
            description: 'Лучшие блюда балканской кухни',
            rating: 4.6,
            images: ['https://placehold.jp/300x200.png'],
            cuisineTags: ['Балканская'],
            featureTags: ['Терраса'],
            priceRange: '€'
          }
        ];

        let filtered = [...mockRestaurants];
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

        setRestaurants(mockRestaurants);
        setFilteredRestaurants(filtered);
        setUserFavorites(['rest1', 'rest3']);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [query, location]);

  const handleSaveToggle = useCallback((id: string, isSaved: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setUserFavorites(prev =>
      isSaved ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  }, []);

  const handleRestaurantClick = (id: string) => {
    navigate(`/restaurant/${id}`);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.searchResultsPage}>
      <NavBar
        onSearch={(searchQuery: string) => navigate(`/s?query=${encodeURIComponent(searchQuery)}`)}
        onLanguageChange={(language: string) => console.log(`Язык изменен на: ${language}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => navigate('/login')}
        isStatic={true}
      />
      
      <div className={styles.pageContainer}>
        <div className={styles.resultsInfo}>
          <span>{filteredRestaurants.length} результатов</span>
        </div>
        <div className={styles.contentContainer}>
          <RestaurantList
            restaurants={filteredRestaurants}
            userFavorites={userFavorites}
            onSaveToggle={handleSaveToggle}
            onRestaurantClick={handleRestaurantClick}
          />
          <MapPlaceholder />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SearchResultsPage;