import React from 'react';
import NavBar from '../../src/components/NavBar/NavBar';
import SearchBar from '../../src/components/SearchBar/SearchBar';
import Card from '../../src/components/Card/Card';
import Section from '../../src/components/Section/Section';
import styles from './HomePage.module.css';

// Импорт изображения фона
// Если у тебя возникают проблемы с импортом, замени на относительный путь
import backgroundImage from '../../src/assets/background.webp';

const HomePage: React.FC = () => {
  // Обработчики
  const handleNavBarSearch = (query: string) => {
    console.log(`Поиск в NavBar: ${query}`);
  };

  const handleMainSearch = (query: string, location: string) => {
    console.log(`Поиск: ${query} в ${location}`);
  };

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };
  
  // Данные для карточек ресторанов
  const restaurants = [
    {
      id: 1,
      title: "Au Bourguignon Du Marais",
      location: "Paris",
      rating: 4.9,
      // Замени на реальные пути к изображениям или оставь так для использования плейсхолдеров
      image: "/restaurant1.jpg" 
    },
    {
      id: 2,
      title: "La Maison",
      location: "Paris",
      rating: 4.9,
      image: "/restaurant2.jpg"
    },
    {
      id: 3,
      title: "Trattoria Italiana",
      location: "Rome",
      rating: 4.8,
      image: "/restaurant3.jpg"
    },
    {
      id: 4,
      title: "El Tapas",
      location: "Barcelona",
      rating: 4.8,
      image: "/restaurant4.jpg"
    }
  ];

  return (
    <div className={styles.homePage}>
      {/* NavBar вверху страницы */}
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="en"
        logoText="HvalaDviser"
      />
      
      {/* Секция героя */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          {/* Используем импортированное изображение */}
          <img 
            src={backgroundImage} 
            alt="Montenegro" 
            className={styles.heroImage}
          />
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>EXPLORE MONTENEGRO</h1>
          
          {/* Основная строка поиска */}
          <SearchBar
            onSearch={handleMainSearch}
            placeholder="Что-То Для Чего-То"
            defaultLocation="Paris"
          />
        </div>
        
        {/* Волнистая форма для перехода к контенту */}
        <svg className={styles.wave} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="white"
            fillOpacity="1"
            d="M0,160L48,149.3C96,139,192,117,288,133.3C384,149,480,203,576,208C672,213,768,171,864,144C960,117,1056,107,1152,112C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </section>
      
      {/* Секция с контентом */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          {/* Секция с ресторанами, используя компонент Section */}
          <Section 
            title="Лучшие Рестораны 2024 Года" 
            showNavigation={true}
            onNext={() => console.log('Next page')}
            onPrev={() => console.log('Previous page')}
          >
            <div className={styles.cardGrid}>
              {restaurants.map(restaurant => (
                <Card
                  key={restaurant.id}
                  image={restaurant.image}
                  title={restaurant.title}
                  location={restaurant.location}
                  rating={restaurant.rating}
                  onClick={() => console.log(`Clicked on ${restaurant.title}`)}
                />
              ))}
            </div>
          </Section>
          
          {/* Здесь можно добавить другие секции с контентом */}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
