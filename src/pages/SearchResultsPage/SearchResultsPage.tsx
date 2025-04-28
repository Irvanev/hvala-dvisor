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
    // Updated fetchRestaurants function for SearchResultsPage.tsx
    // This should replace the existing fetchRestaurants function

    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // Create a reference to the restaurants collection
        const restaurantsCollection = collection(firestore, 'restaurants');
        let querySnapshot;
        let queryBuilder;

        // Start with a base query
        queryBuilder = firestoreQuery(restaurantsCollection);

        // If we have location param, try to filter by it in Firestore
        // Note: For optimal performance, you may need to create composite indexes in Firebase
        if (locationParam) {
          try {
            // Try different location fields - adjust based on your data structure
            queryBuilder = firestoreQuery(
              restaurantsCollection,
              where('address.country', '==', locationParam)
            );
            querySnapshot = await getDocs(queryBuilder);

            // If no results with country, try city
            if (querySnapshot.empty) {
              queryBuilder = firestoreQuery(
                restaurantsCollection,
                where('address.city', '==', locationParam)
              );
              querySnapshot = await getDocs(queryBuilder);
            }
          } catch (indexError) {
            console.warn("Index error for location query, falling back to client-side filtering", indexError);
            // If we hit an index error, fall back to basic query
            queryBuilder = firestoreQuery(restaurantsCollection);
            querySnapshot = await getDocs(queryBuilder);
          }
        } else {
          // If no location specified, get all restaurants
          querySnapshot = await getDocs(queryBuilder);
        }

        // Convert Firestore documents to Restaurant objects
        const fetchedRestaurants: Restaurant[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          // Use adapter function to convert to Restaurant type
          const restaurant = adaptRestaurantFromFirestore(doc.id, data);

          // Filter approved restaurants only (or where moderation is not defined)
          const moderationStatus =
            data.moderation?.status ||
            data.moderationStatus ||
            'pending';

          if (moderationStatus === 'approved' || moderationStatus === undefined) {
            fetchedRestaurants.push(restaurant);
          }
        });

        // Client-side filtering for search query and further location refinement
        let filtered = [...fetchedRestaurants];

        // Filter by search query if provided
        if (searchQuery) {
          const searchTermLower = searchQuery.toLowerCase();
          filtered = filtered.filter(restaurant =>
            // Check title, description and tags
            restaurant.title.toLowerCase().includes(searchTermLower) ||
            restaurant.description.toLowerCase().includes(searchTermLower) ||
            (restaurant.cuisineTags && restaurant.cuisineTags.some(tag =>
              tag.toLowerCase().includes(searchTermLower)
            )) ||
            (restaurant.featureTags && restaurant.featureTags.some(tag =>
              tag.toLowerCase().includes(searchTermLower)
            )) ||
            (restaurant.tagsSearchable && restaurant.tagsSearchable.some(tag =>
              tag.toLowerCase().includes(searchTermLower)
            ))
          );
        }

        // Further filter by location (case insensitive and partial matching)
        if (locationParam) {
          const locationLower = locationParam.toLowerCase();
          filtered = filtered.filter(restaurant => {
            // Check all address fields
            if (restaurant.address) {
              const { street, city, country } = restaurant.address;
              return (
                (street && street.toLowerCase().includes(locationLower)) ||
                (city && city.toLowerCase().includes(locationLower)) ||
                (country && country.toLowerCase().includes(locationLower))
              );
            }
            return false;
          });
        }

        // Set state with fetched and filtered restaurants
        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(filtered);

        // Set favorites (in a real app, load this from user profile in Firebase)
        setUserFavorites(['rest1', 'rest3']);

        setLoading(false);
      } catch (err) {
        console.error('Error loading restaurants:', err);
        setError("An error occurred while loading data. Please try again later.");
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
        // onLanguageChange={handleLanguageChange}
        // currentLanguage="ru"
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