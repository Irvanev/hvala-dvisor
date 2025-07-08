// src/pages/RestaurantPage/RestaurantPage.tsx
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
import { Restaurant, User } from '../../models/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { adaptRestaurantFromFirestore, adaptRestaurantForDetailsPage } from '../../utils/adapters/restaurantAdapter';
import { favoriteService } from '../../services/FavoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

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
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as User | null;
  const { t } = useAppTranslation();

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorite, setUserFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const { showNotification } = useNotification();

  // Функция для проверки, является ли ресторан избранным
  const checkIfFavorite = async () => {
    if (!isAuthenticated || !typedUser || !id) return;
    
    try {
      const isFavorite = await favoriteService.isRestaurantFavorite(typedUser.id, id);
      setUserFavorite(isFavorite);
    } catch (error) {
      console.error('Ошибка при проверке избранного:', error);
    }
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
            const docRef = doc(db, 'restaurants', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              // Преобразуем данные из Firestore в формат для страницы
              const firestoreData = docSnap.data();
              const restaurantData = adaptRestaurantFromFirestore(id, firestoreData);
              const displayRestaurant = adaptRestaurantForDetailsPage(restaurantData);
              
              setRestaurant(displayRestaurant);
            } else {
              setError(t('restaurantPage.notFound'));
            }
          } else {
            setError(t('restaurantPage.notFound'));
          }
        }
        
        // Имитация задержки для лучшего UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
        
        // После загрузки ресторана проверяем, находится ли он в избранном
        await checkIfFavorite();
      } catch (e) {
        console.error('Ошибка при загрузке данных:', e);
        setError(e instanceof Error ? e.message : t('common.error'));
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, location.state, isAuthenticated, typedUser, t]);

  const handleNavBarSearch = (query: string) => {
    console.log(`${t('common.search')}: ${query}`);
  };

  const handleWelcomeClick = () => {
    navigate('/login');
  };

  // Обновленная функция для добавления/удаления из избранного
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !typedUser) {
      showNotification(t('restaurantPage.favorites.loginRequired'), 'info');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (!id) return;
    
    setFavoritesLoading(true);
    
    try {
      if (userFavorite) {
        await favoriteService.removeFromFavorites(typedUser.id, id);
        showNotification(t('restaurantPage.favorites.removed'), 'success');
      } else {
        await favoriteService.addToFavorites(typedUser.id, id);
        showNotification(t('restaurantPage.favorites.added'), 'success');
      }
      
      await favoriteService.updateUserFavoritesCount(typedUser.id);
      setUserFavorite(!userFavorite);
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
      showNotification(t('restaurantPage.favorites.error'), 'error');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleShare = () => {
    console.log(t('restaurantPage.share'));
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
        <p>{t('restaurantPage.loading')}</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error || t('restaurantPage.notFound')}</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          {t('common.backToHome')}
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('restaurantPage.tabs.overview') },
    { id: 'menu', label: t('restaurantPage.tabs.menu') },
    { id: 'reviews', label: t('restaurantPage.tabs.reviews'), count: restaurant.reviews?.length || 0 },
    { id: 'photos', label: t('restaurantPage.tabs.photos'), count: restaurant.photos?.length || 0 }
  ];

  return (
    <div className={styles.restaurantPage}>
      <NavBar
        onSearch={handleNavBarSearch}
        logoText="HvalaDviser"
        onWelcomeClick={handleWelcomeClick}
        isStatic={true}
      />

      <div className={styles.pageContainer}>
        <div className={styles.breadcrumbs}>
          <span className={styles.breadcrumbLink} onClick={() => navigate('/')}>
            {t('restaurantPage.breadcrumbs.home')}
          </span>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbLink} onClick={() => navigate('/restaurants')}>
            {t('restaurantPage.breadcrumbs.restaurants')}
          </span>
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
                  description: item.description || ''
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
                alt={`${restaurant.title} - ${t('restaurant.photo')} ${currentPhotoIndex + 1}`}
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