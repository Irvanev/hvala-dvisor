import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantHero from '../../components/RestaurantHero/RestaurantHero';
import RestaurantTabs from '../../components/RestaurantTabs/RestaurantTabs';
import RestaurantOverview from '../../components/RestaurantOverview/RestaurantOverview';
import RestaurantMenu from '../../components/RestaurantMenu/RestaurantMenu';
import RestaurantReviews from '../../components/RestaurantReviews/RestaurantReviews';
import RestaurantPhotos from '../../components/RestaurantPhotos/RestaurantPhotos';
import styles from './RestaurantPage.module.css';
import { Restaurant } from '../../models/types';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import { adaptRestaurantFromFirestore, adaptRestaurantForDetailsPage } from '../../utils/adapters/restaurantAdapter';

// Интерфейс для страницы ресторана с дополнительными полями
interface RestaurantDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  contact?: {
    phone?: string;
    website?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
  rating: number;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
  openingHours?: { [key: string]: string };
  reviews?: Array<{
    id: string;
    author: string;
    authorAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    likes?: number;
  }>;
  photos?: string[];
  groupedMenu?: Array<{
    category: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: string;
      isPopular?: boolean;
    }>;
  }>;
  cuisine?: string;
  phoneNumber?: string;
  website?: string;
  features?: string[];
}

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorite, setUserFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Функция загрузки данных из fallback-мок-массива (на случай, если state не передан)
  const loadMockRestaurant = (restaurantId: string): RestaurantDetails | null => {
    const mockRestaurants: RestaurantDetails[] = [
      {
        id: 'rest1',
        title: 'Au Bourguignon Du Marais',
        description: 'Изысканный ресторан с французской кухней',
        location: 'Подгорица',
        coordinates: { lat: 42.4300, lng: 19.2600 },
        images: [
          "https://placehold.jp/800x500.png",
          "https://placehold.jp/900x500.png",
          "https://placehold.jp/850x500.png",
          "https://placehold.jp/950x500.png"
        ],
        contact: {
          phone: "+38212345678",
          website: "https://aubourguignon.example.com",
          socialLinks: {
            facebook: "https://facebook.com/restaurant",
            instagram: "https://instagram.com/restaurant"
          }
        },
        cuisineTags: ['Французская'],
        featureTags: ['Терраса', 'Детское меню'],
        priceRange: '€€€',
        rating: 4.9,
        moderationStatus: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        openingHours: {
          "Понедельник": "12:00 - 22:00",
          "Вторник": "12:00 - 22:00",
          "Среда": "12:00 - 22:00",
          "Четверг": "12:00 - 22:00",
          "Пятница": "12:00 - 23:00",
          "Суббота": "12:00 - 23:00",
          "Воскресенье": "12:00 - 21:00"
        },
        reviews: [
          {
            id: "rev1",
            author: "Анна К.",
            authorAvatar: "https://placehold.jp/80x80.png?text=AK",
            rating: 5,
            comment: "Отличный ресторан!",
            date: "15.01.2024",
            likes: 8
          }
        ],
        groupedMenu: [
          {
            category: "Закуски",
            items: [
              {
                id: "menu1",
                name: "Салат Цезарь",
                description: "Классический салат с курицей",
                price: "12€",
                isPopular: true
              }
            ]
          }
        ],
        photos: [
          "https://placehold.jp/400x300.png",
          "https://placehold.jp/400x300.png"
        ],
        phoneNumber: "+38212345678",
        website: "https://aubourguignon.example.com",
        features: ["Уютная атмосфера", "Обслуживание на высшем уровне"],
        cuisine: "Французская"
      },
    ];

    return mockRestaurants.find(r => r.id === restaurantId) || null;
  };

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        // Если объект ресторана передан через state, используем его
        const stateRestaurant = location.state as RestaurantDetails | undefined;
        
        if (stateRestaurant && stateRestaurant.id === id) {
          setRestaurant(stateRestaurant);
        } else {
          // Пытаемся загрузить данные из Firestore
          if (id) {
            const docRef = doc(firestore, 'restaurants', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              // Преобразуем данные из Firestore в формат для страницы
              const firestoreData = docSnap.data();
              const restaurantData = adaptRestaurantFromFirestore(id, firestoreData);
              const displayRestaurant = adaptRestaurantForDetailsPage(restaurantData);
              
              setRestaurant(displayRestaurant);
            } else {
              // Используем fallback данные
              const mockData = loadMockRestaurant(id);
              if (mockData) {
                setRestaurant(mockData);
              } else {
                setError('Ресторан не найден');
              }
            }
          } else {
            setError('ID ресторана не указан');
          }
        }
        
        // Имитация задержки для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
      } catch (e) {
        console.error('Ошибка при загрузке данных:', e);
        setError(e instanceof Error ? e.message : 'Произошла ошибка при загрузке данных');
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, location.state]);

  const handleNavBarSearch = (query: string) => {
    console.log(`Поиск в NavBar: ${query}`);
  };

  const handleLanguageChange = (language: string) => {
    console.log(`Язык изменен на: ${language}`);
  };

  const handleWelcomeClick = () => {
    navigate('/login');
  };

  const handleFavoriteToggle = () => {
    setUserFavorite(prev => !prev);
    // Реальная логика обновления избранного тут
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleShare = () => {
    console.log('Поделиться ссылкой на ресторан');
  };

  const openPhotoModal = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowPhotoModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    document.body.style.overflow = 'auto';
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

        <RestaurantTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />


        <div className={styles.mainContent}>
          {activeTab === 'overview' && (
            <RestaurantOverview
              description={restaurant.description}
              features={restaurant.features}
              address={restaurant.location}
              phoneNumber={(restaurant.contact?.phone || restaurant.phoneNumber) ?? ''}
              website={(restaurant.contact?.website || restaurant.website) ?? ''}
              openingHours={restaurant.openingHours}
              reviews={restaurant.reviews}
              onShowAllReviews={() => setActiveTab('reviews')}
            />
          )}

          {activeTab === 'menu' && restaurant.groupedMenu && (
            <RestaurantMenu
              menu={restaurant.groupedMenu.map(category => ({
                category: category.category,
                items: category.items.map(item => ({
                  ...item,
                  description: item.description || '' // Гарантируем, что description всегда строка
                }))
              }))}
            />
          )}

          {activeTab === 'reviews' && (
            <RestaurantReviews
              restaurantId={id || ''}
              reviews={restaurant.reviews || []}
              onWriteReviewClick={() => console.log('Write review')}
              onSubmitReview={async () => false}
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