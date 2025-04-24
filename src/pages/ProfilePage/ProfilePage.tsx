// src/pages/ProfilePage/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
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
  orderBy,
  Timestamp
} from 'firebase/firestore';

// Импортируем типы из файла с моделями
import { Review as ReviewModel, Restaurant, Like, User as UserModel } from '../../models/types';

// Расширенный интерфейс для отзывов с дополнительными полями для UI
interface ExtendedReview extends Omit<ReviewModel, 'reply'> {
  restaurantName: string; // Добавлено для отображения 
  date: string; // Форматированная дата для отображения
}

// Интерфейс для избранных ресторанов
interface ExtendedRestaurant {
  id: string;
  title: string;
  address: string;
  mainImageUrl?: string;
}

// Интерфейс для элемента лайков в UI
interface RestaurantLikeUI {
  restaurantId: string;
  restaurantName: string;
  createdAt: Timestamp;
}

// Тип для UserInfoCard
interface UserProfile {
  name: string;
  firstName: string;  // Добавлено имя
  lastName: string;   // Добавлена фамилия
  username: string;
  city: string;
  avatar: string;
  reviewsCount: number;
  likesCount: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  // Используем приведение типа, а не null assertion
  const typedUser = user as UserModel | null;

  const [reviews, setReviews] = useState<ExtendedReview[]>([]);
  const [favorites, setFavorites] = useState<ExtendedRestaurant[]>([]);
  // Для хранения ID ресторанов в избранном (лайкнутых)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [likes, setLikes] = useState<RestaurantLikeUI[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(true);
  const [isLoadingLikes, setIsLoadingLikes] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');

  // Функция для загрузки отзывов пользователя
  useEffect(() => {
    const fetchReviews = async () => {
      if (!isAuthenticated || !typedUser) return;
      setIsLoadingReviews(true);

      try {
        // Проверяем существует ли typedUser.id
        if (!typedUser.id) {
          console.error('ID пользователя отсутствует');
          setIsLoadingReviews(false);
          return;
        }

        // Запрос в Firebase - используем обновленную структуру
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('authorId', '==', typedUser.id),
          orderBy('createdAt', 'desc')
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);

        const reviewsPromises = reviewsSnapshot.docs.map(async (reviewDoc) => {
          const reviewData = reviewDoc.data();

          // Получаем название ресторана
          let restaurantName = 'Ресторан';
          try {
            const restaurantDoc = await getDoc(doc(db, 'restaurants', reviewData.restaurantId));
            if (restaurantDoc.exists()) {
              restaurantName = restaurantDoc.data().title || restaurantName;
            }
          } catch (err) {
            console.error('Ошибка при загрузке данных ресторана:', err);
          }

          // Приведение server timestamp к дате
          const createdAt = reviewData.createdAt;
          let dateString = 'Недавно';
          if (createdAt) {
            const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
            dateString = date.toLocaleDateString('ru-RU');
          }

          return {
            id: reviewDoc.id,
            restaurantId: reviewData.restaurantId,
            authorId: reviewData.authorId,
            authorName: reviewData.authorName || typedUser?.firstName || '',
            authorAvatarUrl: reviewData.authorAvatarUrl,
            rating: reviewData.rating ?? 0,
            comment: reviewData.comment || '',
            createdAt: reviewData.createdAt,
            updatedAt: reviewData.updatedAt || reviewData.createdAt,
            likesCount: reviewData.likesCount || 0,
            restaurantName: restaurantName,
            date: dateString
          } as ExtendedReview;
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
  }, [typedUser, isAuthenticated]);

  // Функция для загрузки избранных ресторанов
  // Теперь мы будем искать лайки в подколлекции "likes"
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !typedUser) {
        setIsLoadingFavorites(false);
        return;
      }
      setIsLoadingFavorites(true);

      try {
        // Получаем лайки пользователя из коллекции "likes"
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', typedUser.id)
        );
        
        const likesSnapshot = await getDocs(likesQuery);
        
        if (likesSnapshot.empty) {
          setFavorites([]);
          setFavoriteIds([]);
          setIsLoadingFavorites(false);
          return;
        }
        
        // Получаем ID ресторанов, которые лайкнул пользователь
        const restaurantIds = likesSnapshot.docs.map(doc => doc.data().restaurantId);
        setFavoriteIds(restaurantIds);
        
        // Получаем данные ресторанов
        const favoritePromises = restaurantIds.map(async (restaurantId) => {
          try {
            const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
            if (restaurantDoc.exists()) {
              const data = restaurantDoc.data();
              return {
                id: restaurantDoc.id,
                title: data.title || 'Ресторан',
                address: data.address ? 
                  `${data.address.street}, ${data.address.city}, ${data.address.country}` : 
                  'Адрес не указан',
                mainImageUrl: data.mainImageUrl || (data.galleryUrls && data.galleryUrls[0]) || undefined
              } as ExtendedRestaurant;
            }
            return null;
          } catch (err) {
            console.error(`Ошибка при загрузке ресторана ${restaurantId}:`, err);
            return null;
          }
        });
        
        const favoriteRestaurants = (await Promise.all(favoritePromises)).filter(Boolean) as ExtendedRestaurant[];
        setFavorites(favoriteRestaurants);
      } catch (error) {
        console.error('Ошибка при загрузке избранных ресторанов:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [typedUser, isAuthenticated]);

  // Новая функция для загрузки лайков отзывов
  useEffect(() => {
    const fetchLikes = async () => {
      if (!isAuthenticated || !typedUser) {
        setIsLoadingLikes(false);
        return;
      }
      setIsLoadingLikes(true);

      try {
        // Получаем все рестораны, у которых пользователь лайкнул хотя бы один отзыв
        const restaurantLikes: RestaurantLikeUI[] = [];
        
        // Сначала получаем все рестораны
        const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
        
        // Для каждого ресторана проверяем, есть ли лайки пользователя
        const likePromises = restaurantsSnapshot.docs.map(async (restaurantDoc) => {
          const restaurantId = restaurantDoc.id;
          const restaurantData = restaurantDoc.data();
          
          // Получаем все отзывы для этого ресторана
          const reviewsSnapshot = await getDocs(collection(db, 'restaurants', restaurantId, 'reviews'));
          
          for (const reviewDoc of reviewsSnapshot.docs) {
            const reviewId = reviewDoc.id;
            
            // Проверяем есть ли лайк от текущего пользователя
            const likeDoc = await getDoc(doc(db, 'restaurants', restaurantId, 'reviews', reviewId, 'likes', typedUser.id));
            
            if (likeDoc.exists()) {
              // Этот отзыв был лайкнут пользователем
              restaurantLikes.push({
                restaurantId: restaurantId,
                restaurantName: restaurantData.title || 'Ресторан',
                createdAt: likeDoc.data().createdAt
              });
              // Достаточно найти один лайк для этого ресторана
              break;
            }
          }
        });
        
        await Promise.all(likePromises);
        
        // Сортируем по дате создания (новые вверху)
        restaurantLikes.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
          return dateB - dateA;
        });
        
        setLikes(restaurantLikes);
      } catch (error) {
        console.error('Ошибка при загрузке лайков:', error);
      } finally {
        setIsLoadingLikes(false);
      }
    };

    fetchLikes();
  }, [typedUser, isAuthenticated]);

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
                  <div key={review.id} className={styles.reviewItem} onClick={() => navigate(`/restaurant/${review.restaurantId}`)}>
                    <div className={styles.reviewHeader}>
                      <h3 className={styles.restaurantName}>{review.restaurantName}</h3>
                      <div className={styles.reviewRating}>
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>★</span>
                        ))}
                      </div>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <p className={styles.reviewText}>{review.comment}</p>
                  </div>
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
                        src={restaurant.mainImageUrl || 'https://placehold.jp/300x200.png?text=Ресторан'}
                        alt={restaurant.title}
                        className={styles.favoriteImage}
                      />
                    </div>
                    <div className={styles.favoriteDetails}>
                      <h3 className={styles.favoriteName}>{restaurant.title}</h3>
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
      default:
        return null;
    }
  };

  // Формируем объект профиля для компонента UserInfoCard
  const userProfile: UserProfile = {
    name: typedUser?.email?.split('@')[0] || 'Пользователь',
    firstName: typedUser?.firstName || '',
    lastName: typedUser?.lastName || '',
    username: typedUser?.nickname || typedUser?.email?.split('@')[0] || 'user',
    city: typedUser?.city || 'Не указан',
    avatar: typedUser?.avatarUrl || 'https://placehold.jp/300x300.png?text=User',
    reviewsCount: typedUser?.reviewsCount || reviews.length,
    likesCount: typedUser?.likesCount || likes.length
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