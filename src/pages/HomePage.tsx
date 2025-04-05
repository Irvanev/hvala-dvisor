import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar/NavBar';
import SearchBar from '../components/SearchBar/SearchBar';
import Card from '../components/Card/Card';
import Section from '../components/Section/Section';
import Carousel from '../components/Carousel/Carousel';
import FeaturedBanner from '../components/FeaturedBanner/FeaturedBanner';
import BalkanMap from '../components/BalkanMap/BalkanMap';
import styles from './HomePage.module.css';
import backgroundImage from '../assets/background.webp';
import Footer from '../components/Footer/Footer';


// Интерфейсы
interface Restaurant {
  id: string;
  title: string;
  location: string;
  rating: number;
  image: string;
}

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

const CONSTANTS = {
  APP_NAME: 'HvalaDviser',
  CURRENT_YEAR: '2024',
  DEFAULT_LOCATION: 'Paris',
  HERO_TITLE: 'EXPLORE MONTENEGRO',
  SEARCH_PLACEHOLDER: 'Поиск',
} as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingButtonText, setShowFloatingButtonText] = useState(true);

  // Данные
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

  const restaurants: Restaurant[] = [
    {
      id: 'rest1',
      title: 'Au Bourguignon Du Marais',
      location: 'Paris',
      rating: 4.9,
      image: 'https://placehold.jp/300x200.png',
    },
    {
      id: 'rest2',
      title: 'La Maison',
      location: 'Paris',
      rating: 4.9,
      image: 'https://placehold.jp/300x200.png',
    },
    {
      id: 'rest3',
      title: 'Trattoria Italiana',
      location: 'Rome',
      rating: 4.8,
      image: 'https://placehold.jp/300x200.png',
    },
    {
      id: 'rest4',
      title: 'El Tapas',
      location: 'Barcelona',
      rating: 4.8,
      image: 'https://placehold.jp/300x200.png',
    },
  ];

  const countries: Country[] = [
    { id: 'mne', title: 'Черногория', image: 'https://placehold.jp/400x300.png' },
    { id: 'hrv', title: 'Хорватия', image: 'https://placehold.jp/400x300.png' },
    { id: 'alb', title: 'Албания', image: 'https://placehold.jp/400x300.png' },
  ];

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const demoFavorites = ['rest1', 'rest3'];
        setUserFavorites(demoFavorites);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Сохранение и восстановление позиции прокрутки через localStorage
  useEffect(() => {
    const savedPosition = Number(localStorage.getItem('scrollPosition') || 0);
    window.scrollTo(0, savedPosition);

    const handleScroll = () => {
      localStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    // Обновляем отображение текста на плавающей кнопке в зависимости от ширины экрана
    const updateButtonTextVisibility = () => {
      setShowFloatingButtonText(window.innerWidth > 768);
    };

    // Вызываем один раз при монтировании
    updateButtonTextVisibility();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateButtonTextVisibility);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateButtonTextVisibility);
    };
  }, []); 

  // Обработчики
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

  const handleNavBarSearch = useCallback((query: string) => {
    console.log(`Поиск в NavBar: ${query}`);
  }, []);

  const handleMainSearch = useCallback((query: string, location: string) => {
    console.log(`Поиск: ${query} в ${location}`);
  }, []);

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    navigate('/auth');
  };

  const handleFeaturedCardClick = (cardId: string) => {
    console.log(`Clicked on featured card: ${cardId}`);
  };

  // Обработчик для кнопки добавления ресторана
  const handleAddRestaurantClick = () => {
    navigate('/add-restaurant');
  };

  // Рендеринг
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

          <Section title="Лучшие Рестораны 2024 Года">
            <Carousel>
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card
                    id={restaurant.id}
                    image={restaurant.image}
                    title={restaurant.title}
                    location={restaurant.location}
                    rating={restaurant.rating}
                    savedStatus={userFavorites.includes(restaurant.id)}
                    onSaveToggle={(isSaved, event) =>
                      handleSaveToggle(restaurant.id, isSaved, event)
                    }
                  />
                </Link>
              ))}
            </Carousel>
          </Section>

          <Section title="Лучшие Рестораны 2024 Года У Моря">
            <Carousel>
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/restaurant/${restaurant.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card
                    id={restaurant.id}
                    image={restaurant.image}
                    title={restaurant.title}
                    location={restaurant.location}
                    rating={restaurant.rating}
                    savedStatus={userFavorites.includes(restaurant.id)}
                    onSaveToggle={(isSaved) => handleSaveToggle(restaurant.id, isSaved)}
                  />
                </Link>
              ))}
            </Carousel>
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

      {/* Плавающая кнопка добавления ресторана */}
      <div className={styles.floatingAddButton} onClick={handleAddRestaurantClick}>
        <span className={styles.plusIcon}>+</span>
        {showFloatingButtonText && (
          <span className={styles.buttonText}>Добавить ресторан</span>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLogo}>
            <h3>{CONSTANTS.APP_NAME}</h3>
            <p>© {CONSTANTS.CURRENT_YEAR} Все права защищены</p>
          </div>
          {/* Остальной код футера остается без изменений */}
        </div>
      </footer>

      <Footer />

    </div>

    
  );
};

export default HomePage;