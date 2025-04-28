import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import BalkanMap from '../../components/BalkanMap/BalkanMap';
import styles from './CountryPage.module.css';

interface Restaurant {
  id: string;
  title: string;
  location: string;
  rating: number;
  image: string;
  cuisine: string;
  priceLevel: string;
}

interface CountryData {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  capital: string;
  language: string;
  currency: string;
  population: string;
  restaurants: Restaurant[];
}

const CountryPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        // В реальном приложении здесь будет API-запрос
        // Имитация задержки загрузки данных
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Тестовые данные о стране
        const countryData: Record<string, CountryData> = {
          'montenegro': {
            id: 'montenegro',
            name: 'Черногория',
            description: 'Черногория — прекрасная страна на Адриатическом побережье с богатым культурным наследием и красивыми пейзажами.',
            longDescription: 'Черногория — это маленькая балканская страна с потрясающей природой, включающей красивые пляжи Адриатического моря, горные массивы и живописные каньоны. Страна также славится своей богатой историей, средневековыми городами и радушным гостеприимством. Традиционная черногорская кухня включает в себя блюда из свежей рыбы, мяса и локальных ингредиентов.',
            image: 'https://placehold.jp/800x400.png',
            capital: 'Подгорица',
            language: 'Черногорский',
            currency: 'Евро (EUR)',
            population: '622,000',
            restaurants: [
              {
                id: 'mont1',
                title: 'Konoba Akustik',
                location: 'Будва',
                rating: 4.7,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Местная',
                priceLevel: '$$'
              },
              {
                id: 'mont2',
                title: 'Restaurant Galion',
                location: 'Котор',
                rating: 4.9,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Средиземноморская',
                priceLevel: '$$$'
              },
              {
                id: 'mont3',
                title: 'Stari Mlini',
                location: 'Котор',
                rating: 4.8,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Морепродукты',
                priceLevel: '$$$'
              },
              {
                id: 'mont4',
                title: ' Črnogorska Kafana',
                location: 'Будва',
                rating: 4.6,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Традиционная',
                priceLevel: '$$'
              }
            ]
          },
          'croatia': {
            id: 'croatia',
            name: 'Хорватия',
            description: 'Хорватия известна своими кристально чистыми водами, историческими городами и изумительными национальными парками.',
            longDescription: 'Хорватия - это средиземноморская страна с богатым историческим и культурным наследием. Ее побережье Адриатического моря включает более тысячи островов, а исторические города, такие как Дубровник и Сплит, привлекают туристов со всего мира. Хорватская кухня сочетает в себе средиземноморские традиции с элементами центральноевропейской кухни.',
            image: 'https://placehold.jp/800x400.png',
            capital: 'Загреб',
            language: 'Хорватский',
            currency: 'Евро (EUR)',
            population: '4,047,000',
            restaurants: [
              {
                id: 'cro1',
                title: 'Pelegrini',
                location: 'Шибеник',
                rating: 4.9,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Хорватская',
                priceLevel: '$$$'
              },
              {
                id: 'cro2',
                title: 'Restaurant 360°',
                location: 'Дубровник',
                rating: 4.8,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Средиземноморская',
                priceLevel: '$$$$'
              },
              {
                id: 'cro3',
                title: 'Konoba Fetivi',
                location: 'Сплит',
                rating: 4.7,
                image: 'https://placehold.jp/300x200.png',
                cuisine: 'Местная',
                priceLevel: '$$'
              }
            ]
          },
          // Добавьте данные для других стран аналогичным образом
        };
        
        if (!countryId || !countryData[countryId]) {
          throw new Error('Страна не найдена');
        }
        
        setCountry(countryData[countryId]);
        
        // Демо-данные избранных ресторанов
        setUserFavorites(['mont1', 'cro2']);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных о стране:', error);
        setError(error instanceof Error ? error.message : 'Произошла ошибка');
        setLoading(false);
      }
    };
    
    fetchCountryData();
  }, [countryId]);

  const handleSaveToggle = (isSaved: boolean, event?: React.MouseEvent) => {
    const id = (event?.currentTarget as HTMLElement).dataset.id;
    if (!id) return;

    try {
      if (isSaved) {
        setUserFavorites(prev => [...prev, id]);
      } else {
        setUserFavorites(prev => prev.filter(itemId => itemId !== id));
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
    }
  };

  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleCountryClick = (newCountryId: string) => {
    navigate(`/country/${newCountryId}`);
  };
  
  const filterRestaurants = () => {
    if (!country) return [];
    if (activeFilter === 'all') return country.restaurants;
    
    return country.restaurants.filter(restaurant => {
      if (activeFilter === 'top') return restaurant.rating >= 4.8;
      if (activeFilter === 'budget') return restaurant.priceLevel.length <= 2;
      if (activeFilter === 'luxury') return restaurant.priceLevel.length >= 3;
      return true;
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error || 'Страна не найдена'}</p>
        <button onClick={() => navigate('/')}>Вернуться на главную</button>
      </div>
    );
  }

  return (
    <div className={styles.countryPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        // onLanguageChange={(language) => console.log(`Язык изменен на: ${language}`)}
        // currentLanguage="ru"
        logoText="HvalaDviser"
        isStatic={true}
      />
      
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <img 
          src={country.image} 
          alt={country.name} 
          className={styles.heroImage} 
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{country.name}</h1>
          <p className={styles.heroDescription}>{country.description}</p>
        </div>
      </div>
      
      <div className={styles.contentContainer}>
        <div className={styles.countryInfoSection}>
          <div className={styles.infoCard}>
            <h2>О стране</h2>
            <p>{country.longDescription}</p>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Столица:</span>
                <span className={styles.infoValue}>{country.capital}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Язык:</span>
                <span className={styles.infoValue}>{country.language}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Валюта:</span>
                <span className={styles.infoValue}>{country.currency}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Население:</span>
                <span className={styles.infoValue}>{country.population}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.mapSection}>
            <h2>Расположение</h2>
            {/* <BalkanMap  */}
              {/* // onCountryClick={handleCountryClick} */}
              // highlightedCountry={countryId}
            {/* /> */}
          </div>
        </div>
        
        <div className={styles.restaurantsSection}>
          <div className={styles.sectionHeader}>
            <h2>Лучшие рестораны {country.name}</h2>
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Все
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'top' ? styles.active : ''}`}
                onClick={() => setActiveFilter('top')}
              >
                Высший рейтинг
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'budget' ? styles.active : ''}`}
                onClick={() => setActiveFilter('budget')}
              >
                Бюджетные
              </button>
              <button 
                className={`${styles.filterButton} ${activeFilter === 'luxury' ? styles.active : ''}`}
                onClick={() => setActiveFilter('luxury')}
              >
                Премиум
              </button>
            </div>
          </div>
          
          <div className={styles.restaurantsGrid}>
            {filterRestaurants().map(restaurant => (
                <div key={restaurant.id} className={styles.restaurantCardWrapper}>
                <Card
                  id={restaurant.id}
                  images={[restaurant.image]} // Updated to pass an array of images
                  title={restaurant.title}
                  location={restaurant.location}
                  rating={restaurant.rating}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  savedStatus={userFavorites.includes(restaurant.id)}
                  onSaveToggle={handleSaveToggle}
                />
                <div className={styles.restaurantTags}>
                  <span className={styles.cuisineTag}>{restaurant.cuisine}</span>
                  <span className={styles.priceTag}>{restaurant.priceLevel}</span>
                </div>
                </div>
            ))}
          </div>
          
          {filterRestaurants().length === 0 && (
            <p className={styles.noResults}>
              Ресторанов, соответствующих фильтру, не найдено. Попробуйте изменить параметры поиска.
            </p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CountryPage;