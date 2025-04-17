import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import ReviewItem from '../../components/ReviewItem/ReviewItem';
import UserInfoCard from '../../components/UserInfoCard/UserInfoCard';
import TabsNavigation from '../../components/TabsNavigation/TabsNavigation';
import styles from './ProfilePage.module.css';
import { db } from '../../firebase/config';


import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy
} from 'firebase/firestore';

// Локальные типы для профиля (их можно объединить с общими моделями)
interface Review {
  id: string;
  restaurant: string;
  rating: number;
  comment: string;
  date: string;
}

interface FavoriteRestaurant {
  id: string;
  name: string;
  address: string;
  image?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites' | 'activity'>('reviews');

  // Функция для загрузки отзывов пользователя
  useEffect(() => {
    const fetchReviews = async () => {
      if (!isAuthenticated || !user) return;
      setIsLoadingReviews(true);

      try {
        const reviewsQuery = query(
          collection(db, 'Reviews'),
          where('FK_userId', '==', user.id),
          orderBy('timestamps.createdAt', 'desc')
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);

        const reviewsPromises = reviewsSnapshot.docs.map(async (reviewDoc) => {
          const reviewData = reviewDoc.data();

          // Получаем название ресторана
          let restaurantName = 'Ресторан';
          try {
            const restaurantDoc = await getDoc(doc(db, 'Restaurants', reviewData.FK_restaurantId));
            if (restaurantDoc.exists()) {
              restaurantName = restaurantDoc.data().name || restaurantName;
            }
          } catch (err) {
            console.error('Ошибка при загрузке данных ресторана:', err);
          }

          // Приведение server timestamp к дате
          const createdAt = reviewData.timestamps?.createdAt;
          let dateString = 'Недавно';
          if (createdAt) {
            const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
            dateString = date.toLocaleDateString('ru-RU');
          }

          return {
            id: reviewDoc.id,
            restaurant: restaurantName,
            rating: reviewData.rating ?? 0,
            comment: reviewData.content || '',
            date: dateString
          };
        });

        const userReviews = await Promise.all(reviewsPromises);
        setReviews(userReviews);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [user, isAuthenticated]);

  // Функция для загрузки избранных ресторанов
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user || !user.favorites || user.favorites.length === 0) {
        setIsLoadingFavorites(false);
        return;
      }
      setIsLoadingFavorites(true);

      try {
        const favoritePromises = user.favorites.map(async (restaurantId: string) => {
          try {
            const restaurantDoc = await getDoc(doc(db, 'Restaurants', restaurantId));
            if (restaurantDoc.exists()) {
              const data = restaurantDoc.data();
              return {
                id: restaurantDoc.id,
                name: data.name || 'Ресторан',
                address: data.address || 'Адрес не указан',
                image: data.mainImage || (data.images && data.images[0]) || undefined
              };
            }
            return null;
          } catch (err) {
            console.error(`Ошибка при загрузке ресторана ${restaurantId}:`, err);
            return null;
          }
        });
        const favoriteRestaurants = (await Promise.all(favoritePromises)).filter(Boolean) as FavoriteRestaurant[];
        setFavorites(favoriteRestaurants);
      } catch (error) {
        console.error('Ошибка при загрузке избранных ресторанов:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [user, isAuthenticated]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.profilePage}>
        <NavBar
          onSearch={(query) => console.log(`Поиск: ${query}`)}
          onLanguageChange={(language) => console.log(`Язык: ${language}`)}
          currentLanguage="ru"
          logoText="HvalaDviser"
          onWelcomeClick={() => console.log('Клик на Welcome')}
          isStatic={true}
        />
        <div className={styles.profileContainer}>
          <div className={styles.unauthorizedMessage}>
            <h2>Вы не авторизованы</h2>
            <p>Для просмотра профиля необходимо войти в систему</p>
            <button className={styles.loginButton} onClick={() => navigate('/login')}>
              Войти
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Отображение контента в зависимости от выбранной вкладки
  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className={styles.reviewsContainer}>
            {isLoadingReviews ? (
              <div className={styles.loadingIndicator}>Загрузка отзывов...</div>
            ) : reviews.length > 0 ? (
              <div className={styles.reviewsList}>
                {reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>У вас пока нет отзывов</p>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className={styles.reviewsContainer}>
            {isLoadingFavorites ? (
              <div className={styles.loadingIndicator}>Загрузка избранных ресторанов...</div>
            ) : favorites.length > 0 ? (
              <div className={styles.favoritesList}>
                {favorites.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={styles.favoriteRestaurant}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    <div className={styles.favoriteImageContainer}>
                      <img
                        src={restaurant.image || 'https://placehold.jp/300x200.png?text=Ресторан'}
                        alt={restaurant.name}
                        className={styles.favoriteImage}
                      />
                    </div>
                    <div className={styles.favoriteDetails}>
                      <h3 className={styles.favoriteName}>{restaurant.name}</h3>
                      <p className={styles.favoriteAddress}>{restaurant.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>У вас пока нет избранных ресторанов</p>
            )}
          </div>
        );
      case 'activity':
        return (
          <div className={styles.contributionsBlock}>
            <div className={styles.contributionsHeader}>Активность за последний год</div>
            <div className={styles.contributionsGraph}>
              <img
                src="https://placehold.jp/800x120.png"
                alt="График активности"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Формируем объект профиля для компонента UserInfoCard
  const userProfile = {
    name: user.name || user.email?.split('@')[0] || 'Пользователь',
    username: user.username || user.email?.split('@')[0] || 'user',
    city: user.city || 'Не указан',
    avatar: user.avatar || 'https://placehold.jp/300x300.png?text=User',
    reviews: reviews,
    favorites: favorites.length
  };

  return (
    <div className={styles.profilePage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <div className={styles.profileContainer}>
        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <UserInfoCard user={userProfile} onEditClick={handleEditProfile} />
          </div>
          <div className={styles.rightColumn}>
            <TabsNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { id: 'reviews', label: 'Отзывы', count: reviews.length },
                { id: 'favorites', label: 'Избранное', count: favorites.length }
              ]}
            />
            {renderTabContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;