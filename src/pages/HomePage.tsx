import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import SearchBar from '../components/SearchBar/SearchBar';
import Section from '../components/Section/Section';
import FeaturedBanner from '../components/FeaturedBanner/FeaturedBanner';
import BalkanMap from '../components/BalkanMap/BalkanMap';
import styles from './HomePage.module.css';
import backgroundImage from '../assets/background.webp';
import Footer from '../components/Footer/Footer';
import RestaurantGrid from '../components/RestaurantGrid/RestaurantGrid';
// Импортируем только тип Restaurant
import { Restaurant } from '../models/types';
// Импортируем необходимые функции Firebase
import { collection, getDocs, query, orderBy, limit, Timestamp, GeoPoint } from 'firebase/firestore';
import { firestore } from '../firebase/config'; // Импортируем конфигурацию Firebase

const CONSTANTS = {
  APP_NAME: 'HvalaDviser',
  CURRENT_YEAR: '2024',
  DEFAULT_LOCATION: 'Paris',
  HERO_TITLE: 'EXPLORE MONTENEGRO',
  SEARCH_PLACEHOLDER: 'Поиск',
} as const;

// Определяем отсутствующие типы локально
interface Country {
  id: string;
  title: string;
  image: string;
}

interface FeaturedCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

// Адаптер для преобразования данных из Firestore в формат для RestaurantGrid
function adaptRestaurantForGrid(firestoreData: any, docId: string): Restaurant {
  return {
    id: docId,
    ownerId: firestoreData.ownerId || '',
    title: firestoreData.title || '',
    description: firestoreData.description || '',
    address: firestoreData.address || {
      street: '',
      city: '',
      country: ''
    },
    location: firestoreData.location || new GeoPoint(0, 0),
    mainImageUrl: firestoreData.mainImageUrl || 'https://placehold.jp/300x200.png',
    galleryUrls: firestoreData.galleryUrls || [],
    contact: firestoreData.contact || {
      phone: '',
      website: '',
      social: {}
    },
    cuisineTags: firestoreData.cuisineTags || [],
    featureTags: firestoreData.featureTags || [],
    priceRange: firestoreData.priceRange || '$',
    rating: firestoreData.rating || 0,
    reviewsCount: firestoreData.reviewsCount || 0,
    likesCount: firestoreData.likesCount || 0,
    moderation: firestoreData.moderation || {
      status: 'pending'
    },
    createdAt: firestoreData.createdAt || Timestamp.now(),
    updatedAt: firestoreData.updatedAt || Timestamp.now()
  };
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingButtonText, setShowFloatingButtonText] = useState<boolean>(true);
  // Состояние для хранения ресторанов из Firebase
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Данные для секций
  const featuredCards: FeaturedCard[] = [
    {
      id: 'feat1',
      title: 'Лучшие Рестораны 2024 Года',
      subtitle: 'Спланируй Посещение Победителей Премии',
      image: 'https://placehold.jp/800x400.png',
    },
    {
      id: 'feat2',
      title: 'Лучшие Рестораны 2024 Года У Моря',
      subtitle: 'Спланируй Посещение Победителей Премии',
      image: 'https://placehold.jp/800x400.png',
    },
  ];

  const countries: Country[] = [
    { id: 'mne', title: 'Черногория', image: 'https://placehold.jp/400x300.png' },
    { id: 'hrv', title: 'Хорватия', image: 'https://placehold.jp/400x300.png' },
    { id: 'alb', title: 'Албания', image: 'https://placehold.jp/400x300.png' },
  ];

  // Загрузка данных из Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем рестораны из Firestore
        const restaurantsQuery = query(
          collection(firestore, 'restaurants'),
          orderBy('createdAt', 'desc'), // Сортируем по дате создания (новые первыми)
          limit(8) // Ограничиваем выборку до 8 ресторанов
        );
        
        const restaurantsSnapshot = await getDocs(restaurantsQuery);
        const restaurantsData: Restaurant[] = [];
        
        restaurantsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Используем функцию-адаптер для преобразования данных
          const restaurant = adaptRestaurantForGrid(data, doc.id);
          
          // Проверка на статус модерации - показываем только одобренные рестораны
          if (data.moderation && data.moderation.status === 'approved') {
            restaurantsData.push(restaurant);
          } else if (!data.moderation) {
            // Для обратной совместимости: если поле модерации отсутствует, показываем ресторан
            restaurantsData.push(restaurant);
          }
        });
        
        setRestaurants(restaurantsData);
        
        // Загружаем избранные рестораны пользователя
        // Здесь можно добавить логику получения избранных ресторанов, если пользователь авторизован
        const demoFavorites: string[] = [];
        setUserFavorites(demoFavorites);
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Восстановление позиции прокрутки и управление видимостью плавающей кнопки
  useEffect(() => {
    const savedPosition = Number(localStorage.getItem('scrollPosition') || 0);
    window.scrollTo(0, savedPosition);

    const handleScroll = () => {
      localStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    const updateButtonTextVisibility = () => {
      setShowFloatingButtonText(window.innerWidth > 768);
    };

    updateButtonTextVisibility();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateButtonTextVisibility);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateButtonTextVisibility);
    };
  }, []);

  const handleSaveToggle = useCallback(
    (id: string, isSaved: boolean, event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      setUserFavorites((prev) =>
        isSaved ? [...prev, id] : prev.filter((itemId) => itemId !== id)
      );
      
      // Здесь можно добавить логику сохранения избранных ресторанов в Firebase
      // для авторизованных пользователей
    },
    []
  );

  const handleNavBarSearch = useCallback((query: string) => {
    console.log(`Поиск в NavBar: ${query}`);
  }, []);

  const handleMainSearch = useCallback((query: string, location: string) => {
    console.log(`Поиск: ${query} в ${location}`);
    navigate(`/s?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  }, [navigate]);

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    navigate('/login');
  };

  const handleFeaturedCardClick = (cardId: string) => {
    console.log(`Clicked on featured card: ${cardId}`);
    navigate(`/best?category=${cardId}`);
  };

  const handleAddRestaurantClick = () => {
    navigate('/add-restaurant');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка данных...</p>
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
    <div className={styles.homePage}>
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="ru"
        logoText={CONSTANTS.APP_NAME}
        onWelcomeClick={handleWelcomeClick}
      />

      <section className={styles.hero}>
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{CONSTANTS.HERO_TITLE}</h1>
          <SearchBar
            onSearch={handleMainSearch}
            placeholder={CONSTANTS.SEARCH_PLACEHOLDER}
            defaultLocation={CONSTANTS.DEFAULT_LOCATION}
          />
        </div>
        <div className={styles.curvyBottom}></div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.sloganSection}>
            <h2 className={styles.sloganTitle}>Откройте для себя аутентичные балканские вкусы</h2>
            <p className={styles.sloganText}>
              HvalaDviser — это ваш надежный путеводитель по лучшим ресторанам Балкан.
              Мы помогаем путешественникам и местным жителям находить уникальные гастрономические впечатления, сохранять любимые места и делиться своими открытиями.
            </p>
            <div className={styles.sloganDivider}></div>
          </div>

          <div className={styles.featuredCardGrid}>
            {featuredCards.map((card) => (
              <FeaturedBanner
                key={card.id}
                id={card.id}
                title={card.title}
                subtitle={card.subtitle}
                image={card.image}
                onClick={() => handleFeaturedCardClick(card.id)}
                buttonText="Посмотреть Список"
              />
            ))}
          </div>

          <Section title="Новые рестораны">
            {restaurants.length > 0 ? (
              <RestaurantGrid
                restaurants={restaurants}
                userFavorites={userFavorites}
                onSaveToggle={handleSaveToggle}
              />
            ) : (
              <div className={styles.noDataMessage}>
                <p>Пока нет доступных ресторанов. Станьте первым, кто добавит ресторан!</p>
              </div>
            )}
          </Section>

          <Section title="Популярные Страны">
            <div className={styles.countriesGrid}>
              {countries.map((country) => (
                <Link
                  key={country.id}
                  to={`/country/${country.id}`}
                  className={styles.countryCard}
                  style={{ textDecoration: 'none' }}
                >
                  <img
                    src={country.image}
                    alt={country.title}
                    className={styles.countryImage}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/background.jpg';
                    }}
                  />
                  <div className={styles.countryTitle}>{country.title}</div>
                </Link>
              ))}
            </div>
          </Section>

          <Section title="Исследуйте Балканы">
            <div className={styles.balkanMapSection}>
              <p className={styles.balkanDescription}>
                Наведите курсор на страну, чтобы узнать больше, или нажмите для перехода к ресторанам
              </p>
              <div className={styles.interactiveMapContainer}>
                <BalkanMap onCountryClick={(countryId) => navigate(`/country/${countryId}`)} />
              </div>
            </div>
          </Section>
        </div>
      </section>

      <div className={styles.floatingAddButton} onClick={handleAddRestaurantClick}>
        <span className={styles.plusIcon}>+</span>
        {showFloatingButtonText && (
          <span className={styles.buttonText}>Добавить ресторан</span>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;