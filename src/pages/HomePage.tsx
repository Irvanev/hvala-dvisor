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
// Импортируем типы из единого файла моделей
import { Restaurant, Country, FeaturedCard } from '../models/types';

const CONSTANTS = {
  APP_NAME: 'HvalaDviser',
  CURRENT_YEAR: '2024',
  DEFAULT_LOCATION: 'Paris',
  HERO_TITLE: 'EXPLORE MONTENEGRO',
  SEARCH_PLACEHOLDER: 'Поиск',
} as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingButtonText, setShowFloatingButtonText] = useState<boolean>(true);

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

  // Массив ресторанов с обновлённой структурой (используем поле images вместо устаревшего image, но для обратной совместимости оставляем его тоже)
  const restaurants: Restaurant[] = [
    {
      id: 'rest1',
      title: 'Au Bourguignon Du Marais',
      location: 'Paris',
      description: 'Изысканный ресторан с французской кухней',
      rating: 4.9,
      images: [
        'https://placehold.jp/300x200.png',
        'https://placehold.jp/400x200.png',
        'https://placehold.jp/350x200.png'
      ],
      image: 'https://placehold.jp/300x200.png',
      cuisineTags: ['Французская'],
      featureTags: ['Терраса', 'Детское меню'],
      priceRange: '€€€',
      moderationStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      contact: {
        phone: '+38212345678',
        website: 'https://aubourguignon.example.com'
      }
    },
    {
      id: 'rest2',
      title: 'La Maison',
      location: 'Paris',
      description: 'Современная французская кухня с акцентом на местные продукты',
      rating: 4.9,
      images: [
        'https://placehold.jp/300x200.png',
        'https://placehold.jp/300x210.png'
      ],
      image: 'https://placehold.jp/300x200.png',
      cuisineTags: ['Французская'],
      featureTags: ['Панорамный вид', 'Винная карта', 'Веганское меню', 'Терраса'],
      priceRange: '€€',
      moderationStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      contact: {
        phone: '+38298765432',
        website: 'https://lamaison.example.com'
      }
    },
    {
      id: 'rest3',
      title: 'Trattoria Italiana',
      location: 'Rome',
      description: 'Итальянская кухня с домашними пастами и пиццей',
      rating: 4.8,
      images: [
        'https://placehold.jp/300x200.png',
        'https://placehold.jp/320x200.png',
        'https://placehold.jp/310x200.png',
        'https://placehold.jp/330x200.png'
      ],
      image: 'https://placehold.jp/300x200.png',
      cuisineTags: ['Итальянская'],
      featureTags: ['Домашняя паста', 'Дровяная печь'],
      priceRange: '€€',
      moderationStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      contact: {
        phone: '+38211223344',
        website: 'https://trattoria.example.com'
      }
    },
    {
      id: 'rest4',
      title: 'El Tapas',
      location: 'Barcelona',
      description: 'Испанская кухня с акцентом на тапас и паэлью',
      rating: 4.8,
      images: [
        'https://placehold.jp/300x200.png',
        'https://placehold.jp/305x200.png'
      ],
      image: 'https://placehold.jp/300x200.png',
      cuisineTags: ['Испанская'],
      featureTags: ['Винная карта', 'Панорамный вид'],
      priceRange: '€€€',
      moderationStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
      contact: {
        phone: '+38255667788',
        website: 'https://eltapas.example.com'
      }
    },
  ];

  const countries: Country[] = [
    { id: 'mne', title: 'Черногория', image: 'https://placehold.jp/400x300.png' },
    { id: 'hrv', title: 'Хорватия', image: 'https://placehold.jp/400x300.png' },
    { id: 'alb', title: 'Албания', image: 'https://placehold.jp/400x300.png' },
  ];

  // Загрузка данных: здесь используем mock-данные
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Имитация избранных ресторанов
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

          <Section title="Top">
            {/* Для демонстрации используем дублирование ресторана, чтобы получить 8 карточек */}
            <RestaurantGrid
              restaurants={[...restaurants, ...restaurants]}
              userFavorites={userFavorites}
              onSaveToggle={handleSaveToggle}
            />
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
