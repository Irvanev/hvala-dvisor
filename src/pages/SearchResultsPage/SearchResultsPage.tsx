import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from '../SearchResultsPage/SearchResultsPage.module.css';

// Интерфейсы
interface Restaurant {
  id: string;
  title: string;
  location: string;
  rating: number;
  image: string;
  cuisine: string;
  priceRange: string;
  description: string;
  features: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

const CONSTANTS = {
  APP_NAME: 'HvalaDviser',
  CURRENT_YEAR: '2024',
  SEARCH_RESULTS_TITLE: 'Результаты поиска',
};

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [isMapVisible, setIsMapVisible] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>('rating-high');
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);

  // Извлекаем параметры поиска из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    const locationParam = params.get('location') || '';
    
    setSearchQuery(query);
    setSearchLocation(locationParam);
  }, [location]);

  // Фиктивные данные для примера
  const mockRestaurants: Restaurant[] = [
    {
      id: 'rest1',
      title: 'La Petite Maison',
      location: 'Будва, Черногория',
      rating: 4.9,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Французская',
      priceRange: '€€€',
      description: 'Изысканный ресторан с видом на Адриатическое море, предлагающий великолепные блюда французской кухни в сочетании с местными ингредиентами.',
      features: ['Вид на море', 'Терраса', 'Винная карта', 'Романтическая атмосфера'],
      coordinates: { lat: 42.278, lng: 18.846 }
    },
    {
      id: 'rest2',
      title: 'Konoba Portun',
      location: 'Котор, Черногория',
      rating: 4.8,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Средиземноморская',
      priceRange: '€€',
      description: 'Аутентичная конобa, предлагающая традиционные черногорские блюда, свежие морепродукты и отличный выбор местных вин.',
      features: ['Терраса', 'Подходит для больших групп', 'Детская площадка'],
      coordinates: { lat: 42.424, lng: 18.771 }
    },
    {
      id: 'rest3',
      title: 'Adriatic Restaurant',
      location: 'Тиват, Черногория',
      rating: 4.7,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Морепродукты',
      priceRange: '€€€',
      description: 'Роскошный ресторан в Porto Montenegro с панорамным видом на Бока-Которскую бухту, специализирующийся на блюдах из свежайших морепродуктов.',
      features: ['Вид на море', 'Парковка', 'Безналичный расчет', 'Винная карта'],
      coordinates: { lat: 42.436, lng: 18.691 }
    },
    {
      id: 'rest4',
      title: 'Balkan Grill',
      location: 'Подгорица, Черногория',
      rating: 4.7,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Балканская',
      priceRange: '€€',
      description: 'Лучший гриль-ресторан в столице Черногории, известный своим мясным ассорти, пльескавицей и чевапчичами.',
      features: ['Терраса', 'Живая музыка', 'Подходит для больших групп'],
      coordinates: { lat: 42.441, lng: 19.263 }
    },
    {
      id: 'rest5',
      title: 'Ribarski Priča',
      location: 'Герцег-Нови, Черногория',
      rating: 4.8,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Морепродукты',
      priceRange: '€€',
      description: 'Семейный ресторан морепродуктов с традиционными рецептами, расположенный прямо у воды с прекрасным видом на залив.',
      features: ['Вид на море', 'Терраса', 'Романтическая атмосфера'],
      coordinates: { lat: 42.453, lng: 18.538 }
    },
    {
      id: 'rest6',
      title: 'Villa Montenegro',
      location: 'Свети-Стефан, Черногория',
      rating: 4.9,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Средиземноморская',
      priceRange: '€€€€',
      description: 'Эксклюзивный ресторан с видом на знаменитый остров-отель Свети-Стефан, предлагающий изысканные блюда высокой кухни.',
      features: ['Вид на море', 'Винная карта', 'Романтическая атмосфера', 'Терраса'],
      coordinates: { lat: 42.256, lng: 18.900 }
    },
    {
      id: 'rest7',
      title: 'Olive Garden',
      location: 'Улцинь, Черногория',
      rating: 4.6,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Итальянская',
      priceRange: '€€',
      description: 'Уютный ресторан, расположенный среди оливковых рощ, предлагающий домашнюю итальянскую кухню и органические вина.',
      features: ['Терраса', 'Веганское меню', 'Безналичный расчет'],
      coordinates: { lat: 41.928, lng: 19.201 }
    },
    {
      id: 'rest8',
      title: 'Stari Mlini',
      location: 'Котор, Черногория',
      rating: 4.8,
      image: 'https://placehold.jp/600x400.png',
      cuisine: 'Черногорская',
      priceRange: '€€€',
      description: 'Исторический ресторан, расположенный в старой мельнице XV века на берегу реки, предлагающий аутентичные черногорские блюда.',
      features: ['Вид на реку', 'Историческое здание', 'Романтическая атмосфера', 'Винная карта'],
      coordinates: { lat: 42.421, lng: 18.768 }
    }
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Имитируем задержку загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Фильтруем рестораны по запросу и локации
        let filteredRestaurants = [...mockRestaurants];
        
        if (searchQuery || searchLocation) {
          filteredRestaurants = mockRestaurants.filter(restaurant => {
            const matchesQuery = !searchQuery || 
              restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
              restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
              
            const matchesLocation = !searchLocation ||
              restaurant.location.toLowerCase().includes(searchLocation.toLowerCase());
              
            return matchesQuery && matchesLocation;
          });
        }
        
        setRestaurants(filteredRestaurants);
        setUserFavorites(['rest1', 'rest3']); // Пример избранных ресторанов
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchQuery, searchLocation]);

  // Обработчики
  const handleNavBarSearch = useCallback((query: string) => {
    // Обновляем URL с новым поисковым запросом
    const params = new URLSearchParams(location.search);
    params.set('query', query);
    navigate(`${location.pathname}?${params.toString()}`);
  }, [location, navigate]);

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    navigate('/auth');
  };

  const handleSaveToggle = useCallback(
    (id: string, isSaved: boolean, event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      setUserFavorites((prev) =>
        isSaved ? [...prev, id] : prev.filter((itemId) => itemId !== id)
      );
    },
    []
  );

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleToggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const handleCardHover = (id: string | null) => {
    setActiveRestaurantId(id);
  };

  // Функция для фильтрации ресторанов
  const getFilteredAndSortedRestaurants = () => {
    // Сначала применяем фильтры по категориям
    let filtered = [...restaurants];
    
    if (activeFilter !== 'all') {
      if (activeFilter === 'top-rated') {
        filtered = filtered.filter(restaurant => restaurant.rating >= 4.8);
      } else if (activeFilter === 'affordable') {
        filtered = filtered.filter(restaurant => restaurant.priceRange.length <= 2);
      } else if (activeFilter === 'luxury') {
        filtered = filtered.filter(restaurant => restaurant.priceRange.length >= 3);
      } else if (activeFilter === 'seafood') {
        filtered = filtered.filter(restaurant => restaurant.cuisine === 'Морепродукты');
      } else if (activeFilter === 'mediterranean') {
        filtered = filtered.filter(restaurant => restaurant.cuisine === 'Средиземноморская');
      }
    }
    
    // Затем сортируем результаты
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'price-high':
          return b.priceRange.length - a.priceRange.length;
        case 'price-low':
          return a.priceRange.length - b.priceRange.length;
        default:
          return b.rating - a.rating;
      }
    });
  };

  // Получаем отфильтрованные и отсортированные рестораны
  const filteredAndSortedRestaurants = getFilteredAndSortedRestaurants();

  // Рендеринг
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка результатов поиска...</p>
      </div>
    );
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
        logoText={CONSTANTS.APP_NAME}
        onWelcomeClick={handleWelcomeClick}
      />

      <div className={styles.searchResultsContainer}>
        <div className={styles.searchHeader}>
          <div className={styles.searchHeaderContent}>
            <h1 className={styles.searchTitle}>
              {searchQuery || searchLocation ? 
                `Рестораны ${searchLocation ? `в "${searchLocation}"` : ''} ${searchQuery ? `по запросу "${searchQuery}"` : ''}` : 
                'Все рестораны'}
            </h1>
            <div className={styles.searchStats}>
              Найдено: <span className={styles.resultCount}>{filteredAndSortedRestaurants.length}</span> ресторанов
            </div>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Боковая панель с фильтрами и списком ресторанов */}
          <div className={styles.sidebarContainer}>
            {/* Панель фильтров */}
            <div className={styles.filtersContainer}>
              <div className={styles.filterHeader}>
                <h3 className={styles.filterTitle}>Фильтры</h3>
                <button 
                  className={styles.clearFiltersButton}
                  onClick={() => {
                    setActiveFilter('all');
                    setSortOption('rating-high');
                  }}
                >
                  Сбросить
                </button>
              </div>
              
              <div className={styles.filterSortRow}>
                <div className={styles.toggleMapContainer}>
                  <button 
                    className={styles.toggleMapButton} 
                    onClick={handleToggleMap}
                  >
                    {isMapVisible ? 'Скрыть карту' : 'Показать карту'}
                  </button>
                </div>
                
                <div className={styles.sortContainer}>
                  <label htmlFor="sort" className={styles.sortLabel}>Сортировка:</label>
                  <select 
                    id="sort" 
                    className={styles.sortSelect}
                    value={sortOption}
                    onChange={handleSortChange}
                  >
                    <option value="rating-high">По рейтингу (высокий)</option>
                    <option value="rating-low">По рейтингу (низкий)</option>
                    <option value="price-high">По цене (высокая)</option>
                    <option value="price-low">По цене (низкая)</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.filtersRow}>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('all')}
                >
                  Все
                </button>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'top-rated' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('top-rated')}
                >
                  Лучший рейтинг
                </button>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'affordable' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('affordable')}
                >
                  Доступные
                </button>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'luxury' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('luxury')}
                >
                  Премиум
                </button>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'seafood' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('seafood')}
                >
                  Морепродукты
                </button>
                <button 
                  className={`${styles.filterButton} ${activeFilter === 'mediterranean' ? styles.active : ''}`}
                  onClick={() => handleFilterClick('mediterranean')}
                >
                  Средиземноморская
                </button>
              </div>
            </div>

            {/* Список ресторанов */}
            {filteredAndSortedRestaurants.length > 0 ? (
              <div className={styles.restaurantsList}>
                {filteredAndSortedRestaurants.map(restaurant => (
                  <Link 
                    to={`/restaurant/${restaurant.id}`} 
                    key={restaurant.id}
                    className={styles.restaurantLink}
                    onMouseEnter={() => handleCardHover(restaurant.id)}
                    onMouseLeave={() => handleCardHover(null)}
                  >
                    <div className={`${styles.restaurantCard} ${activeRestaurantId === restaurant.id ? styles.activeCard : ''}`}>
                      <div className={styles.restaurantImageContainer}>
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.title} 
                          className={styles.restaurantImage}
                          loading="lazy"
                        />
                        <div 
                          className={styles.saveButton}
                          onClick={(e) => handleSaveToggle(restaurant.id, !userFavorites.includes(restaurant.id), e)}
                        >
                          <span className={userFavorites.includes(restaurant.id) ? styles.savedIcon : styles.saveIcon}>
                            {userFavorites.includes(restaurant.id) ? '❤️' : '🤍'}
                          </span>
                        </div>
                        <div className={styles.ratingBadge}>
                          {restaurant.rating} ★
                        </div>
                      </div>
                      <div className={styles.restaurantInfo}>
                        <h2 className={styles.restaurantTitle}>{restaurant.title}</h2>
                        <p className={styles.restaurantLocation}>{restaurant.location}</p>
                        <div className={styles.restaurantMeta}>
                          <span className={styles.cuisine}>{restaurant.cuisine}</span>
                          <span className={styles.priceRange}>{restaurant.priceRange}</span>
                        </div>
                        <p className={styles.restaurantDescription}>{restaurant.description}</p>
                        <div className={styles.restaurantFeatures}>
                          {restaurant.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className={styles.featureTag}>{feature}</span>
                          ))}
                          {restaurant.features.length > 3 && (
                            <span className={styles.moreFeatures}>+{restaurant.features.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <h3>Рестораны не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
                <button 
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchLocation('');
                    setActiveFilter('all');
                    navigate('/search');
                  }}
                >
                  Сбросить все фильтры
                </button>
              </div>
            )}
          </div>

          {/* Карта */}
          {isMapVisible && (
            <div className={styles.mapContainer}>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapControls}>
                  <button className={styles.zoomInButton}>+</button>
                  <button className={styles.zoomOutButton}>−</button>
                  <button className={styles.fullscreenButton}>⛶</button>
                </div>
                <div className={styles.mapContent}>
                  <p>Здесь будет карта с ресторанами</p>
                  <p>Всего отмечено: {filteredAndSortedRestaurants.length} ресторанов</p>
                  {activeRestaurantId && (
                    <div className={styles.activeMarkerInfo}>
                      Активный маркер: {filteredAndSortedRestaurants.find(r => r.id === activeRestaurantId)?.title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка добавления ресторана */}
      <div className={styles.floatingAddButton} onClick={() => navigate('/add-restaurant')}>
        <span className={styles.plusIcon}>+</span>
        <span className={styles.buttonText}>Добавить ресторан</span>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;