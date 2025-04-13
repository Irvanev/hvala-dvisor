// src/pages/RestaurantPage/RestaurantPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantHero from '../../components/RestaurantHero/RestaurantHero';
import RestaurantTabs from '../../components/RestaurantTabs/RestaurantTabs';
import RestaurantOverview from '../../components/RestaurantOverview/RestaurantOverview';
import RestaurantMenu from '../../components/RestaurantMenu/RestaurantMenu';
import RestaurantReviews from '../../components/RestaurantReviews/RestaurantReviews';
import RestaurantPhotos from '../../components/RestaurantPhotos/RestaurantPhotos';
import styles from './RestaurantPage.module.css';
// Импорт базовой модели ресторана
import { Restaurant, MenuItem, Review, MenuCategory } from '../../models/types';

// Расширяем базовую модель для страницы
interface RestaurantDetails extends Restaurant {
  // Дополнительные поля для страницы
  openingHours?: { [key: string]: string };
  // Здесь можно использовать нашу модель Review или задать расширенный тип
  reviews?: Array<{
    id: string;
    author: string;
    authorAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    likes?: number;
  }>;
  // Если фото для раздела "Фото" отличаются от основного массива изображений
  photos?: string[];
  // Группированное меню для отображения по категориям
  groupedMenu?: MenuCategory[];
  // Если нужно отобразить кухню как строку (например, объединённые теги)
  cuisine?: string;
  // Для обратной совместимости с компонентом обзора ресторана
  phoneNumber?: string;
  website?: string;
  // Если требуется дополнительное поле для функций
  features?: string[];
}

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Используем новый тип RestaurantDetails
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorite, setUserFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'menu', 'reviews', 'photos'
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с демо-данными

        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 800));

        // Моковые данные с использованием модели Restaurant + расширений
        const mockRestaurant: RestaurantDetails = {
          id: id || 'unknown',
          title:
            id === 'rest1'
              ? "Au Bourguignon Du Marais"
              : id === 'rest2'
                ? "La Maison"
                : id === 'rest3'
                  ? "Trattoria Italiana"
                  : id === 'rest4'
                    ? "El Tapas"
                    : "Ресторан",
          description:
            "Уютный ресторан с превосходной кухней и атмосферой. Здесь вы можете насладиться аутентичными блюдами, приготовленными по традиционным рецептам шеф-повара с многолетним опытом.",
          // Используем поле location вместо address – на странице можно передавать location как адрес
          location: "123 Restaurant Street, City",
          // Пример координат (если нужны)
          coordinates: {
            lat: 48.8566,
            lng: 2.3522,
          },
          // Заполняем массив изображений (основной фон и галерея)
          images: [
            "https://placehold.jp/800x500.png",
            "https://placehold.jp/900x500.png",
            "https://placehold.jp/850x500.png",
            "https://placehold.jp/950x500.png"
          ],
          // Обязательное поле contact согласно модели Restaurant
          contact: {
            phone: "+1 234 567 8901",
            website: "https://restaurant-website.com",
            socialLinks: {
              facebook: "https://facebook.com/restaurant",
              instagram: "https://instagram.com/restaurant"
            }
          },
          // Можно задать теги кухни и особенностей
          cuisineTags: id === 'rest1' || id === 'rest2' ? ["Французская"] : id === 'rest3' ? ["Итальянская"] : id === 'rest4' ? ["Испанская"] : ["Европейская"],
          featureTags: [
            "Уютная атмосфера",
            "Обслуживание на высшем уровне",
            "Аутентичные блюда",
            "Панорамный вид"
          ],
          priceRange: "€€€",
          // Для демонстрации оставляем меню пустым, а сгруппированное меню заполняем отдельно
          menu: [],
          groupedMenu: [
            {
              category: "Закуски",
              items: [
                {
                  id: "menu1",
                  name: "Салат Цезарь",
                  description: "Классический салат с куриным филе, хрустящими гренками и соусом",
                  price: "12€",
                  isPopular: true
                },
                {
                  id: "menu2",
                  name: "Карпаччо из говядины",
                  description: "Тонко нарезанная говядина с трюфельным маслом и пармезаном",
                  price: "15€"
                },
                {
                  id: "menu3",
                  name: "Брускетта с томатами",
                  description: "Хрустящий багет с томатами, чесноком и базиликом",
                  price: "9€"
                }
              ]
            },
            {
              category: "Основные блюда",
              items: [
                {
                  id: "menu4",
                  name: "Стейк Рибай",
                  description: "Сочный стейк из мраморной говядины с гарниром",
                  price: "28€",
                  isPopular: true
                },
                {
                  id: "menu5",
                  name: "Паста Карбонара",
                  description: "Традиционная итальянская паста с беконом и сливочным соусом",
                  price: "18€"
                },
                {
                  id: "menu6",
                  name: "Ризотто с грибами",
                  description: "Кремовое ризотто с белыми грибами и трюфельным маслом",
                  price: "22€"
                }
              ]
            },
            {
              category: "Десерты",
              items: [
                {
                  id: "menu7",
                  name: "Тирамису",
                  description: "Классический итальянский десерт с кофейным вкусом",
                  price: "8€",
                  isPopular: true
                },
                {
                  id: "menu8",
                  name: "Шоколадный фондан",
                  description: "Теплый шоколадный кекс с жидкой сердцевиной и ванильным мороженым",
                  price: "10€"
                }
              ]
            }
          ],
          // Для рейтинга оставляем то же значение
          rating: 4.8,
          // Обязательное поле в модели – статус модерации
          moderationStatus: 'approved',
          createdBy: "user123",
          createdAt: new Date(),
          updatedAt: new Date(),
          // Дополнительные поля для страницы
          openingHours: {
            "Понедельник": "12:00 - 22:00",
            "Вторник": "12:00 - 22:00",
            "Среда": "12:00 - 22:00",
            "Четверг": "12:00 - 22:00",
            "Пятница": "12:00 - 23:00",
            "Суббота": "12:00 - 23:00",
            "Воскресенье": "12:00 - 21:00"
          },
          // Используем моковые отзывы – их можно будет заменить запросом к API
          reviews: [
            {
              id: "rev1",
              author: "Анна К.",
              authorAvatar: "https://placehold.jp/80x80.png?text=AK",
              rating: 5,
              comment: "Отличный ресторан! Обслуживание на высшем уровне, еда невероятно вкусная. Обязательно вернусь!",
              date: "15.01.2024",
              likes: 8
            },
            {
              id: "rev2",
              author: "Михаил П.",
              authorAvatar: "https://placehold.jp/80x80.png?text=МП",
              rating: 4,
              comment: "Очень понравилась атмосфера и кухня. Немного долго ждали заказ, но оно того стоило.",
              date: "02.02.2024",
              likes: 3
            },
            {
              id: "rev3",
              author: "Елена С.",
              authorAvatar: "https://placehold.jp/80x80.png?text=ЕС",
              rating: 5,
              comment: "Прекрасная атмосфера, изысканные блюда и безупречное обслуживание! Особенно рекомендую фирменный десерт.",
              date: "20.02.2024",
              likes: 12
            }
          ],
          // Массив фото для раздела "Фото" (если отличается от основного массива изображений)
          photos: [
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png",
            "https://placehold.jp/400x300.png"
          ],
          // Для совместимости с компонентами, если нужно – задаём дополнительные поля
          phoneNumber: "+1 234 567 8901",
          website: "https://restaurant-website.com",
          // Можно передать объединённую информацию из featureTags
          features: [
            "Уютная атмосфера",
            "Обслуживание на высшем уровне",
            "Аутентичные блюда",
            "Панорамный вид",
            "Веганское меню",
            "Винная карта"
          ],
          // Можно задать кухню как строку, объединив теги кухни
          cuisine: (id === 'rest1' || id === 'rest2') ? "Французская" : id === 'rest3' ? "Итальянская" : id === 'rest4' ? "Испанская" : "Европейская"
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

  const openPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
    document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    document.body.style.overflow = 'auto'; // Разрешаем прокрутку страницы
  };

  const nextPhoto = () => {
    if (restaurant?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % restaurant.photos!.length);
    }
  };

  const prevPhoto = () => {
    if (restaurant?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + restaurant.photos!.length) % restaurant.photos!.length);
    }
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

  // Определяем вкладки для страницы
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'menu', label: 'Меню' },
    { id: 'reviews', label: 'Отзывы', count: restaurant.reviews?.length || 0 },
    { id: 'photos', label: 'Фото', count: restaurant.photos?.length || 0 }
  ];

  return (
    <div className={styles.restaurantPage}>
      <NavBar
        onSearch={handleNavBarSearch}
        onLanguageChange={handleLanguageChange}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={handleWelcomeClick}
        isStatic={true}
      />

      <div className={styles.pageContainer}>
        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbLink} onClick={() => navigate('/')}>Главная</span>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbLink} onClick={() => navigate('/restaurants')}>Рестораны</span>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{restaurant.title}</span>
        </div>

        {/* Hero Section */}
        <RestaurantHero
          title={restaurant.title}
          rating={restaurant.rating ?? 0}
          reviewCount={restaurant.reviews?.length || 0}
          cuisine={restaurant.cuisine}
          priceRange={restaurant.priceRange}
          images={restaurant.images}
          isFavorite={userFavorite}
          onFavoriteToggle={handleFavoriteToggle}
          onViewAllPhotos={() => setActiveTab('photos')}
        />

        {/* Navigation Tabs */}
        <RestaurantTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        // onShare={handleShare}
        />

        {/* Main Content */}
        <div className={styles.mainContent}>
          {activeTab === 'overview' && (
            <RestaurantOverview
              description={restaurant.description}
              features={restaurant.features}
              // Передаём адрес как location из модели
              address={restaurant.location}
              // Используем данные из contact для телефона и сайта, либо поля phoneNumber и website
              phoneNumber={restaurant.contact.phone || restaurant.phoneNumber}
              website={restaurant.contact.website || restaurant.website}
              openingHours={restaurant.openingHours}
              reviews={restaurant.reviews}
              onShowAllReviews={() => setActiveTab('reviews')}
            />
          )}

          {activeTab === 'menu' && restaurant.groupedMenu && (
            <RestaurantMenu menu={restaurant.groupedMenu} />
          )}

          {activeTab === 'reviews' && (
            <RestaurantReviews
              rating={restaurant.rating ?? 0}
              reviews={restaurant.reviews || []}
              onWriteReview={() => console.log('Write review')}
            />
          )}

          {activeTab === 'photos' && (
            <RestaurantPhotos
              photos={restaurant.photos || []}
              onPhotoClick={openPhotoModal}
            />
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && restaurant.photos && (
        <div className={styles.photoModal} onClick={closePhotoModal}>
          <div className={styles.photoModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.photoModalClose} onClick={closePhotoModal}>✕</button>

            <div className={styles.photoModalImageContainer}>
              <img
                src={restaurant.photos[currentPhotoIndex]}
                alt={`${restaurant.title} - фото ${currentPhotoIndex + 1}`}
                className={styles.photoModalImage}
              />

              <button
                className={`${styles.photoModalButton} ${styles.photoModalPrev}`}
                onClick={prevPhoto}
              >
                ❮
              </button>

              <button
                className={`${styles.photoModalButton} ${styles.photoModalNext}`}
                onClick={nextPhoto}
              >
                ❯
              </button>

              <div className={styles.photoModalCounter}>
                {currentPhotoIndex + 1} / {restaurant.photos.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RestaurantPage;