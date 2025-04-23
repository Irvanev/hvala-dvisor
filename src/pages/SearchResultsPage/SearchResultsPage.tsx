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

import { collection, getDocs, query as firestoreQuery, where, orderBy, Timestamp, GeoPoint } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

// Функция-адаптер для преобразования данных из Firestore в модель Restaurant
function adaptRestaurantFromFirestore(docId: string, data: any): Restaurant {
  // Создаем объект, соответствующий модели Restaurant
  return {
    id: docId,
    ownerId: data.ownerId || '',
    title: data.title || '',
    description: data.description || '',
    // Обрабатываем адрес
    address: data.address || {
      street: '',
      city: data.location || '', // Для обратной совместимости
      country: ''
    },
    // Обрабатываем геоданные
    location: data.location instanceof GeoPoint ? data.location :
              data.coordinates ? new GeoPoint(
                parseFloat(data.coordinates.lat || '0'),
                parseFloat(data.coordinates.lng || '0')
              ) : new GeoPoint(0, 0),
    // Обрабатываем изображения
    mainImageUrl: data.mainImageUrl || data.image || '',
    galleryUrls: data.galleryUrls || data.images || [],
    // Контактная информация
    contact: data.contact || {
      phone: data.phone || '',
      website: data.website || '',
      social: {}
    },
    // Теги
    cuisineTags: data.cuisineTags || [],
    featureTags: data.featureTags || [],
    tagsSearchable: data.tagsSearchable || [],
    // Ценовой диапазон
    priceRange: data.priceRange || '$',
    // Рейтинги и счетчики
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
    likesCount: data.likesCount || 0,
    // Модерация
    moderation: data.moderation || {
      status: data.moderationStatus || 'pending'
    },
    // Даты
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : 
               data.createdAt ? Timestamp.fromDate(new Date(data.createdAt)) : Timestamp.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : 
               data.updatedAt ? Timestamp.fromDate(new Date(data.updatedAt)) : Timestamp.now()
  };
}

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
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // Создаем запрос к коллекции restaurants (с маленькой буквы)
        const restaurantsCollection = collection(firestore, 'restaurants');
        let querySnapshot;

        try {
          // Пробуем выполнить запрос с фильтрацией по статусу модерации
          const restaurantsQuery = firestoreQuery(
            restaurantsCollection,
            orderBy('createdAt', 'desc')
          );
          querySnapshot = await getDocs(restaurantsQuery);
        } catch (indexError) {
          console.error("Ошибка индекса:", indexError);
          
          // Если получили ошибку индекса, используем более простой запрос без сортировки
          const simpleQuery = firestoreQuery(restaurantsCollection);
          querySnapshot = await getDocs(simpleQuery);
        }
        
        // Преобразуем данные из Firestore в модель Restaurant
        const fetchedRestaurants: Restaurant[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          // Используем функцию-адаптер для преобразования
          const restaurant = adaptRestaurantFromFirestore(doc.id, data);
          
          // Фильтруем только одобренные рестораны или где поле модерации отсутствует
          const moderationStatus = 
            data.moderation?.status || 
            data.moderationStatus ||
            'pending';
            
          if (moderationStatus === 'approved' || !moderationStatus) {
            fetchedRestaurants.push(restaurant);
          }
        });
        
        // Фильтрация на стороне клиента по поисковому запросу
        let filtered = [...fetchedRestaurants];
        
        if (searchQuery) {
          filtered = filtered.filter(restaurant =>
            restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisineTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (restaurant.tagsSearchable && restaurant.tagsSearchable.some(tag => 
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
          );
        }
        
        // Фильтрация по местоположению
        if (locationParam) {
          filtered = filtered.filter(restaurant => {
            // Проверяем адрес
            if (restaurant.address) {
              const { street, city, country } = restaurant.address;
              return (
                (street && street.toLowerCase().includes(locationParam.toLowerCase())) ||
                (city && city.toLowerCase().includes(locationParam.toLowerCase())) ||
                (country && country.toLowerCase().includes(locationParam.toLowerCase()))
              );
            }
            return false;
          });
        }

        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(filtered);
        
        // Получение избранных ресторанов (в реальном приложении нужно загружать из Firebase)
        setUserFavorites(['rest1', 'rest3']);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке ресторанов:', err);
        setError("Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
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