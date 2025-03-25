import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './RestaurantPage.module.css';

interface RestaurantDetails {
  id: string;
  title: string;
  location: string;
  rating: number;
  image: string;
  description?: string;
  address?: string;
  cuisine?: string;
  priceRange?: string;
  openingHours?: {
    [key: string]: string;
  };
  phoneNumber?: string;
  website?: string;
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  photos?: string[];
  menu?: Array<{
    category: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
    }>;
  }>;
}

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorite, setUserFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'menu', 'reviews', 'photos', 'contact'

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с демо-данными
        // await fetch(`/api/restaurants/${id}`)...

        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));

        // Демо-данные
        const mockRestaurant: RestaurantDetails = {
          id: id || 'unknown',
          title: id === 'rest1' ? "Au Bourguignon Du Marais" : 
                 id === 'rest2' ? "La Maison" :
                 id === 'rest3' ? "Trattoria Italiana" :
                 id === 'rest4' ? "El Tapas" : "Ресторан",
          location: id === 'rest1' || id === 'rest2' ? "Paris" :
                    id === 'rest3' ? "Rome" :
                    id === 'rest4' ? "Barcelona" : "Unknown",
          rating: 4.8,
          image: "https://placehold.jp/800x500.png",
          description: "Уютный ресторан с превосходной кухней и атмосферой. Здесь вы можете насладиться аутентичными блюдами, приготовленными по традиционным рецептам шеф-поваром с многолетним опытом.",
          address: "123 Restaurant Street, City",
          cuisine: id === 'rest1' || id === 'rest2' ? "Французская" :
                   id === 'rest3' ? "Итальянская" :
                   id === 'rest4' ? "Испанская" : "Европейская",
          priceRange: "€€€",
          openingHours: {
            "Понедельник": "12:00 - 22:00",
            "Вторник": "12:00 - 22:00",
            "Среда": "12:00 - 22:00",
            "Четверг": "12:00 - 22:00",
            "Пятница": "12:00 - 23:00",
            "Суббота": "12:00 - 23:00",
            "Воскресенье": "12:00 - 21:00"
          },
          phoneNumber: "+1 234 567 8901",
          website: "https://restaurant-website.com",
          reviews: [
            {
              id: "rev1",
              author: "Анна К.",
              rating: 5,
              comment: "Отличный ресторан! Обслуживание на высшем уровне, еда невероятно вкусная. Обязательно вернусь!",
              date: "15.01.2024"
            },
            {
              id: "rev2",
              author: "Михаил П.",
              rating: 4,
              comment: "Очень понравилась атмосфера и кухня. Немного долго ждали заказ, но оно того стоило.",
              date: "02.02.2024"
            }
          ],
          photos: [
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png"
          ],
          menu: [
            {
              category: "Закуски",
              items: [
                {
                  name: "Салат Цезарь",
                  description: "Классический салат с куриным филе, хрустящими гренками и соусом",
                  price: "12€"
                },
                {
                  name: "Карпаччо из говядины",
                  description: "Тонко нарезанная говядина с трюфельным маслом и пармезаном",
                  price: "15€"
                }
              ]
            },
            {
              category: "Основные блюда",
              items: [
                {
                  name: "Стейк Рибай",
                  description: "Сочный стейк из мраморной говядины с гарниром",
                  price: "28€"
                },
                {
                  name: "Паста Карбонара",
                  description: "Традиционная итальянская паста с беконом и сливочным соусом",
                  price: "18€"
                }
              ]
            }
          ]
        };

        setRestaurant(mockRestaurant);
        setUserFavorite(Math.random() > 0.5); // Имитация статуса избранного
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Произошла ошибка при загрузке данных');
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
    } else {
      setError('ID ресторана не указан');
      setLoading(false);
    }
  }, [id]);

  const handleNavBarSearch = (query: string) => {
    console.log(`Поиск в NavBar: ${query}`);
  };

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    console.log('Переход на страницу авторизации');
  };

  const handleFavoriteToggle = () => {
    setUserFavorite(prev => !prev);
    // В реальном приложении здесь будет API-запрос для обновления избранного
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleShare = () => {
    console.log('Поделиться ссылкой на ресторан');
    // Здесь можно реализовать логику шаринга
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка информации о ресторане...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error || 'Ресторан не найден'}</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className={styles.restaurantPage}>
      {/* NavBar теперь в обычном потоке документа - как обычный элемент */}
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={handleWelcomeClick}
        isStatic={true}
      />

      <div className={styles.restaurantContentWrapper}>
        {/* Hero Image Section */}
        <div className={styles.restaurantHero}>
          <div className={styles.heroImageContainer}>
            <img 
              src={restaurant.image} 
              alt={restaurant.title} 
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
          </div>
          
          <div className={styles.restaurantInfo}>
            <div className={styles.restaurantName}>
              <h1>{restaurant.title}</h1>
            </div>
            
            <div className={styles.restaurantMeta}>
              <div className={styles.rating}>
                <span className={styles.ratingValue}>★ {restaurant.rating.toFixed(1)}</span>
                <span className={styles.reviewCount}>• 52 Отзыва</span>
              </div>
              <div className={styles.cuisineType}>
                <span>• {restaurant.cuisine}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={styles.tabNavigation}>
          <ul className={styles.tabList}>
            <li 
              className={`${styles.tabItem} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              Обзор
            </li>
            <li 
              className={`${styles.tabItem} ${activeTab === 'menu' ? styles.active : ''}`}
              onClick={() => handleTabChange('menu')}
            >
              Меню
            </li>
            <li 
              className={`${styles.tabItem} ${activeTab === 'reviews' ? styles.active : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              Отзывы
            </li>
            <li 
              className={`${styles.tabItem} ${activeTab === 'photos' ? styles.active : ''}`}
              onClick={() => handleTabChange('photos')}
            >
              Фото
            </li>
            <li 
              className={`${styles.tabItem} ${activeTab === 'menu2' ? styles.active : ''}`}
              onClick={() => handleTabChange('menu2')}
            >
              Меню
            </li>
            <li 
              className={`${styles.tabItem} ${activeTab === 'contacts' ? styles.active : ''}`}
              onClick={() => handleTabChange('contacts')}
            >
              Контакты
            </li>
          </ul>
          
          <div className={styles.actionButtons}>
            <button 
              className={styles.shareButton}
              onClick={handleShare}
            >
              Поделиться
            </button>
            <button 
              className={`${styles.favoriteButton} ${userFavorite ? styles.active : ''}`}
              onClick={handleFavoriteToggle}
            >
              {userFavorite ? 'В Избранном' : 'В Избранное'}
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className={styles.overviewContent}>
              <h2 className={styles.sectionTitle}>Какая-То Информация О Ресторане</h2>
              <p className={styles.descriptionText}>
                {restaurant.description}
                {restaurant.description}
                {restaurant.description}
              </p>
              
              <h2 className={styles.sectionTitle}>Адрес</h2>
              <p className={styles.addressText}>{restaurant.address}</p>
              
              <h2 className={styles.sectionTitle}>Особенности</h2>
              <ul className={styles.featuresList}>
                <li>Уютная атмосфера</li>
                <li>Обслуживание на высшем уровне</li>
                <li>Аутентичные блюда</li>
              </ul>
              
              <h2 className={styles.sectionTitle}>Местоположение</h2>
              <div className={styles.mapContainer}>
                <img 
                  src="https://placehold.jp/1000x400.png" 
                  alt="Карта расположения ресторана" 
                  className={styles.mapImage}
                />
              </div>
            </div>
          )}
          
          {/* Menu Tab Content */}
          {activeTab === 'menu' && (
            <div className={styles.menuContent}>
              {restaurant.menu?.map((category, index) => (
                <div key={index} className={styles.menuCategory}>
                  <h2 className={styles.categoryTitle}>{category.category}</h2>
                  <div className={styles.menuItems}>
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.menuItem}>
                        <div className={styles.menuItemHeader}>
                          <h3 className={styles.menuItemName}>{item.name}</h3>
                          <span className={styles.menuItemPrice}>{item.price}</span>
                        </div>
                        <p className={styles.menuItemDescription}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Reviews Tab Content */}
          {activeTab === 'reviews' && (
            <div className={styles.reviewsContent}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle}>Отзывы посетителей</h2>
                <button className={styles.writeReviewButton}>Написать отзыв</button>
              </div>
              
              <div className={styles.reviewsList}>
                {restaurant.reviews?.map(review => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{review.author}</span>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <div className={styles.reviewRating}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className={styles.reviewText}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Photos Tab Content */}
          {activeTab === 'photos' && (
            <div className={styles.photosContent}>
              <h2 className={styles.sectionTitle}>Фотогалерея</h2>
              <div className={styles.photoGrid}>
                {restaurant.photos?.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img src={photo} alt={`${restaurant.title} - фото ${index + 1}`} className={styles.photo} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contact Tab Content */}
          {activeTab === 'contacts' && (
            <div className={styles.contactContent}>
              <h2 className={styles.sectionTitle}>Контактная информация</h2>
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <h3 className={styles.contactLabel}>Телефон:</h3>
                  <p className={styles.contactValue}>{restaurant.phoneNumber}</p>
                </div>
                <div className={styles.contactItem}>
                  <h3 className={styles.contactLabel}>Веб-сайт:</h3>
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                    {restaurant.website}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <h3 className={styles.contactLabel}>Часы работы:</h3>
                  <div className={styles.openingHours}>
                    {restaurant.openingHours && Object.entries(restaurant.openingHours).map(([day, hours]) => (
                      <div key={day} className={styles.openingHoursRow}>
                        <span className={styles.openingDay}>{day}:</span>
                        <span className={styles.openingTime}>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantPage;