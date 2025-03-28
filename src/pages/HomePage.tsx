import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем импорт useNavigate
import NavBar from '../components/NavBar/NavBar';
import SearchBar from '../components/SearchBar/SearchBar';
import Card from '../components/Card/Card';
import Section from '../components/Section/Section';
import Carousel from '../components/Carousel/Carousel';
import FeaturedBanner from '../components/FeaturedBanner/FeaturedBanner';
import styles from './HomePage.module.css';
import backgroundImage from '../assets/background.webp';

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
  SEARCH_PLACEHOLDER: 'Поиск'
} as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // Используем хук для навигации
  const [loading, setLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const featuredCards: FeaturedCard[] = [
    {
      id: "feat1",
      title: "Лучшие Рестораны 2024 Года",
      subtitle: "Спланируй Посещение Победителей Премии",
      image: "https://placehold.jp/800x400.png"
    },
    {
      id: "feat2",
      title: "Лучшие Рестораны 2024 Года У Моря",
      subtitle: "Спланируй Посещение Победителей Премии",
      image: "https://placehold.jp/800x400.png"
    }
  ];

  const restaurants: Restaurant[] = [
    {
      id: "rest1",
      title: "Au Bourguignon Du Marais",
      location: "Paris",
      rating: 4.9,
      image: "https://placehold.jp/300x200.png"
    },
    {
      id: "rest2",
      title: "La Maison",
      location: "Paris",
      rating: 4.9,
      image: "https://placehold.jp/300x200.png"
    },
    {
      id: "rest3",
      title: "Trattoria Italiana",
      location: "Rome",
      rating: 4.8,
      image: "https://placehold.jp/300x200.png"
    },
    {
      id: "rest4",
      title: "El Tapas",
      location: "Barcelona",
      rating: 4.8,
      image: "https://placehold.jp/300x200.png"
    }
  ];

  const countries: Country[] = [
    {
      id: "country1",
      title: "Черногория",
      image: "https://placehold.jp/400x300.png"
    },
    {
      id: "country2",
      title: "Хорватия",
      image: "https://placehold.jp/400x300.png"
    },
    {
      id: "country3",
      title: "Албания",
      image: "https://placehold.jp/400x300.png"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const demoFavorites = ["rest1", "rest3"];
        setUserFavorites(demoFavorites);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Произошла ошибка');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveToggle = useCallback(async (id: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        setUserFavorites(prev => [...prev, id]);
      } else {
        setUserFavorites(prev => prev.filter(itemId => itemId !== id));
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      if (isSaved) {
        setUserFavorites(prev => prev.filter(itemId => itemId !== id));
      } else {
        setUserFavorites(prev => [...prev, id]);
      }
    }
  }, []);

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
    console.log('Переход на страницу авторизации');
    // window.location.href = '/auth'; // Раскомментировать для реального редиректа
  };

  // Функция для перехода на страницу ресторана
  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Функция для перехода к категории ресторанов
  const handleFeaturedCardClick = (cardId: string) => {
    // В реальном приложении здесь может быть переход на категорию или фильтрацию
    console.log(`Clicked on featured card: ${cardId}`);
    // Пример: navigate(`/restaurants/category/${cardId}`);
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
        logoText="HvalaDviser"
        onWelcomeClick={handleWelcomeClick}
        // isStatic не указываем, чтобы использовать значение по умолчанию (false)
      />

      <section className={styles.hero}>
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>EXPLORE MONTENEGRO</h1>

          <SearchBar
            onSearch={handleMainSearch}
            placeholder="Поиск"
            defaultLocation="Paris"
          />
        </div>

        <div className={styles.curvyBottom}></div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.featuredCardGrid}>
            {featuredCards.map(card => (
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

          <Section title="Лучшие Рестораны 2024 Года" showNavigation={true}>
            <Carousel>
              {restaurants.map(restaurant => (
                <Card
                  key={restaurant.id}
                  id={restaurant.id}
                  image={restaurant.image}
                  title={restaurant.title}
                  location={restaurant.location}
                  rating={restaurant.rating}
                  onClick={() => handleRestaurantClick(restaurant.id)} // Используем новую функцию
                  savedStatus={userFavorites.includes(restaurant.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </Carousel>
          </Section>

          <Section title="Лучшие Рестораны 2024 Года У Моря" showNavigation={true}>
            <Carousel>
              {restaurants.map(restaurant => (
                <Card
                  key={restaurant.id}
                  id={restaurant.id}
                  image={restaurant.image}
                  title={restaurant.title}
                  location={restaurant.location}
                  rating={restaurant.rating}
                  onClick={() => handleRestaurantClick(restaurant.id)} // Используем новую функцию
                  savedStatus={userFavorites.includes(restaurant.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </Carousel>
          </Section>

          <Section title="Популярные Страны" showNavigation={true}>
            <div className={styles.countriesGrid}>
              {countries.map(country => (
                <div
                  key={country.id}
                  className={styles.countryCard}
                  onClick={() => console.log(`Clicked on ${country.title}`)}
                >
                  <img
                    src={country.image}
                    alt={country.title}
                    className={styles.countryImage}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/background.jpg';
                    }}
                  />
                  <div className={styles.countryTitle}>{country.title}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLogo}>
            <h3>HvalaDviser</h3>
            <p>© 2024 Все права защищены</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>О нас</h4>
              <ul>
                <li>О проекте</li>
                <li>Наша команда</li>
                <li>Карьера</li>
                <li>Контакты</li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Помощь</h4>
              <ul>
                <li>FAQ</li>
                <li>Поддержка</li>
                <li>Правила</li>
                <li>Политика конфиденциальности</li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h4>Присоединяйтесь</h4>
              <ul>
                <li>Для бизнеса</li>
                <li>Партнерская программа</li>
                <li>Рекламодателям</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;