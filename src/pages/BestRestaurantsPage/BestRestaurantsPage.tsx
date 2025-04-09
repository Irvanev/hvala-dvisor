import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import styles from './BestRestaurantsPage.module.css';

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
}

const CONSTANTS = {
  APP_NAME: 'HvalaDviser',
  CURRENT_YEAR: '2024',
  PAGE_TITLE: 'Лучшие Рестораны 2024 Года',
  PAGE_DESCRIPTION: 'Посетите рестораны, которые были признаны лучшими в 2024 году по мнению критиков и посетителей.',
};

const BestRestaurantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Определяем заголовок страницы в зависимости от категории
  const pageTitle = category === 'seaside' 
    ? 'Лучшие Рестораны 2024 Года У Моря' 
    : CONSTANTS.PAGE_TITLE;

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
      features: ['Вид на море', 'Терраса', 'Винная карта', 'Романтическая атмосфера']
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
      features: ['Терраса', 'Подходит для больших групп', 'Детская площадка']
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
      features: ['Вид на море', 'Парковка', 'Безналичный расчет', 'Винная карта']
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
      features: ['Терраса', 'Живая музыка', 'Подходит для больших групп']
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
      features: ['Вид на море', 'Терраса', 'Романтическая атмосфера']
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
      features: ['Вид на море', 'Винная карта', 'Романтическая атмосфера', 'Терраса']
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
      features: ['Терраса', 'Веганское меню', 'Безналичный расчет']
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
      features: ['Вид на реку', 'Историческое здание', 'Романтическая атмосфера', 'Винная карта']
    }
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Имитируем задержку загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Фильтруем рестораны для категории "у моря"
        let filteredRestaurants = [...mockRestaurants];
        if (category === 'seaside') {
          filteredRestaurants = mockRestaurants.filter(
            restaurant => restaurant.features.includes('Вид на море')
          );
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
  }, [category]);

  // Обработчики
  const handleNavBarSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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

  // Функция для фильтрации ресторанов
  const getFilteredRestaurants = () => {
    // Сначала фильтруем по поисковому запросу
    let filtered = restaurants;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        restaurant => 
          restaurant.title.toLowerCase().includes(query) || 
          restaurant.location.toLowerCase().includes(query) || 
          restaurant.cuisine.toLowerCase().includes(query) ||
          restaurant.description.toLowerCase().includes(query)
      );
    }
    
    // Затем применяем фильтры по категориям
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
    
    return filtered;
  };

  // Получаем отфильтрованные рестораны
  const filteredRestaurants = getFilteredRestaurants();

  // Рендеринг
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка списка ресторанов...</p>
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
    <div className={styles.bestRestaurantsPage}>
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="ru"
        logoText={CONSTANTS.APP_NAME}
        onWelcomeClick={handleWelcomeClick}
      />

      {/* Хедер страницы */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageDescription}>{CONSTANTS.PAGE_DESCRIPTION}</p>
        </div>
      </header>

      {/* Основное содержимое */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Фильтры */}
          <div className={styles.filtersContainer}>
            <div className={styles.filtersRow}>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => handleFilterClick('all')}
              >
                Все рестораны
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

          {/* Результаты поиска и количество ресторанов */}
          <div className={styles.resultsInfo}>
            {searchQuery ? (
              <p>Результаты поиска для "{searchQuery}": найдено {filteredRestaurants.length} ресторанов</p>
            ) : (
              <p>Всего ресторанов: {filteredRestaurants.length}</p>
            )}
          </div>

          {/* Список ресторанов */}
          {filteredRestaurants.length > 0 ? (
            <div className={styles.restaurantsGrid}>
              {filteredRestaurants.map(restaurant => (
                <Link 
                  to={`/restaurant/${restaurant.id}`} 
                  key={restaurant.id}
                  className={styles.restaurantLink}
                >
                  <div className={styles.restaurantCard}>
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
                  setActiveFilter('all');
                }}
              >
                Сбросить все фильтры
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Плавающая кнопка добавления ресторана */}
      <div className={styles.floatingAddButton} onClick={() => navigate('/add-restaurant')}>
        <span className={styles.plusIcon}>+</span>
        <span className={styles.buttonText}>Добавить ресторан</span>
      </div>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLogo}>
            <h3>{CONSTANTS.APP_NAME}</h3>
            <p>© {CONSTANTS.CURRENT_YEAR} Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BestRestaurantsPage;