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

import { Review as ReviewModel, User as UserModel } from '../../models/types';

/* ---------- ДОПОЛНЯЕМ ТИП ---------- */
interface UserExtended extends UserModel {
  /** Поля, которые есть в Firestore, но отсутствуют в старом интерфейсе */
  name?: string;
  username?: string;
}

/* ---------- UI-типы ---------- */
interface ExtendedReview extends Omit<ReviewModel, 'reply'> {
  restaurantName: string;
  date: string;
}

interface ExtendedRestaurant {
  id: string;
  title: string;
  address: string;
  mainImageUrl?: string;
}

interface RestaurantLikeUI {
  restaurantId: string;
  restaurantName: string;
  createdAt: Timestamp;
}

interface UserProfile {
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  city: string;
  avatar: string;
  reviewsCount: number;
  likesCount: number;
}

/* ---------- КОМПОНЕНТ ---------- */
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    user,            // профиль из Firestore
    currentUser,     // объект Firebase Auth
    isAuthenticated,
    isLoading
  } = useAuth();

  // теперь в typedUser доступны name и username
  const typedUser = user as UserExtended | null;

  /* --- состояния --- */
  const [reviews, setReviews]         = useState<ExtendedReview[]>([]);
  const [favorites, setFavorites]     = useState<ExtendedRestaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [likes, setLikes]             = useState<RestaurantLikeUI[]>([]);

  const [isLoadingReviews,   setIsLoadingReviews]   = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isLoadingLikes,     setIsLoadingLikes]     = useState(true);

  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');

  /* ---------- ЗАГРУЗКА ОТЗЫВОВ ---------- */
  useEffect(() => {
    const fetchReviews = async () => {
      if (!isAuthenticated || !typedUser) return;
      setIsLoadingReviews(true);

      try {
        if (!typedUser.id) {
          console.error('ID пользователя отсутствует');
          setIsLoadingReviews(false);
          return;
        }

        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('authorId', '==', typedUser.id),
          orderBy('createdAt', 'desc')
        );

        const snap = await getDocs(reviewsQuery);

        const mapped = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();

            let restaurantName = 'Ресторан';
            try {
              const rest = await getDoc(doc(db, 'restaurants', data.restaurantId));
              if (rest.exists()) restaurantName = rest.data().title || restaurantName;
            } catch (e) {
              console.error('Ошибка ресторана:', e);
            }

            const createdAt = data.createdAt;
            const dateStr = createdAt
              ? (createdAt.toDate ? createdAt.toDate() : new Date(createdAt)
                ).toLocaleDateString('ru-RU')
              : 'Недавно';

            return {
              id: d.id,
              restaurantId: data.restaurantId,
              authorId: data.authorId,
              authorName: data.authorName || typedUser.firstName || '',
              authorAvatarUrl: data.authorAvatarUrl,
              rating: data.rating ?? 0,
              comment: data.comment || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt || data.createdAt,
              likesCount: data.likesCount || 0,
              restaurantName,
              date: dateStr
            } as ExtendedReview;
          })
        );

        setReviews(mapped);
      } catch (e) {
        console.error('Ошибка отзывов:', e);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [typedUser, isAuthenticated]);

  /* ---------- ЗАГРУЗКА ИЗБРАННЫХ ---------- */
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !typedUser) {
        setIsLoadingFavorites(false);
        return;
      }
      setIsLoadingFavorites(true);

      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', typedUser.id)
        );

        const likeSnap = await getDocs(likesQuery);
        if (likeSnap.empty) {
          setFavorites([]);
          setFavoriteIds([]);
          setIsLoadingFavorites(false);
          return;
        }

        const restIds = likeSnap.docs.map((d) => d.data().restaurantId);
        setFavoriteIds(restIds);

        const favs = await Promise.all(
          restIds.map(async (id) => {
            try {
              const rest = await getDoc(doc(db, 'restaurants', id));
              if (!rest.exists()) return null;
              const r = rest.data();
              return {
                id: rest.id,
                title: r.title || 'Ресторан',
                address: r.address
                  ? `${r.address.street}, ${r.address.city}, ${r.address.country}`
                  : 'Адрес не указан',
                mainImageUrl: r.mainImageUrl || (r.galleryUrls && r.galleryUrls[0])
              } as ExtendedRestaurant;
            } catch (e) {
              console.error(`Ошибка ресторана ${id}:`, e);
              return null;
            }
          })
        );

        setFavorites(favs.filter(Boolean) as ExtendedRestaurant[]);
      } catch (e) {
        console.error('Ошибка избранных:', e);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, [typedUser, isAuthenticated]);

  /* ---------- ЗАГРУЗКА ЛАЙКОВ ОТЗЫВОВ ---------- */
  useEffect(() => {
    const fetchLikes = async () => {
      if (!isAuthenticated || !typedUser) {
        setIsLoadingLikes(false);
        return;
      }
      setIsLoadingLikes(true);

      try {
        const restaurantLikes: RestaurantLikeUI[] = [];

        const restSnap = await getDocs(collection(db, 'restaurants'));
        await Promise.all(
          restSnap.docs.map(async (restDoc) => {
            const restId = restDoc.id;
            const restData = restDoc.data();

            const revSnap = await getDocs(
              collection(db, 'restaurants', restId, 'reviews')
            );

            for (const rev of revSnap.docs) {
              const likeDoc = await getDoc(
                doc(db,
                    'restaurants',
                    restId,
                    'reviews',
                    rev.id,
                    'likes',
                    typedUser.id)
              );
              if (likeDoc.exists()) {
                restaurantLikes.push({
                  restaurantId: restId,
                  restaurantName: restData.title || 'Ресторан',
                  createdAt: likeDoc.data().createdAt
                });
                break;
              }
            }
          })
        );

        restaurantLikes.sort(
          (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );

        setLikes(restaurantLikes);
      } catch (e) {
        console.error('Ошибка лайков:', e);
      } finally {
        setIsLoadingLikes(false);
      }
    };

    fetchLikes();
  }, [typedUser, isAuthenticated]);

  /* ---------- ОБРАБОТЧИК ---------- */
  const handleEditProfile = () => navigate('/edit-profile');

  /* ---------- УСТОЙЧИВАЯ ЛОГИКА ИМЕНИ ---------- */
  const authDisplayName = currentUser?.displayName?.trim() || '';
  const firestoreName   = typedUser?.name?.trim()          || '';

  const fullName =
    firestoreName ||
    authDisplayName ||
    `${typedUser?.firstName || ''} ${typedUser?.lastName || ''}`.trim() ||
    typedUser?.email?.split('@')[0] ||
    'Пользователь';

  const [fName = '', ...lNameParts] = fullName.split(' ');

  const userProfile: UserProfile = {
    name: fullName,
    firstName: typedUser?.firstName || fName,
    lastName:  typedUser?.lastName  || lNameParts.join(' '),
    username:
      typedUser?.username ||
      typedUser?.nickname ||
      typedUser?.email?.split('@')[0] ||
      'user',
    city:   typedUser?.city || 'Не указан',
    avatar: typedUser?.avatarUrl || 'https://placehold.jp/300x300.png?text=User',
    reviewsCount: typedUser?.reviewsCount ?? reviews.length,
    likesCount:   typedUser?.likesCount   ?? likes.length
  };

  /* ---------- РЕНДЕР ---------- */
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Загрузка…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.profilePage}>
        <NavBar
          onSearch={(q) => console.log(`Поиск: ${q}`)}
          onLanguageChange={(l) => console.log(`Язык: ${l}`)}
          currentLanguage="ru"
          logoText="HvalaDviser"
          onWelcomeClick={() => console.log('Welcome')}
          isStatic
        />
        <div className={styles.profileContainer}>
          <div className={styles.unauthorizedMessage}>
            <h2>Вы не авторизованы</h2>
            <p>Для просмотра профиля необходимо войти</p>
            <button
              className={styles.loginButton}
              onClick={() => navigate('/login')}
            >
              Войти
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderTabContent = () =>
    activeTab === 'reviews' ? (
      <div className={styles.reviewsContainer}>
        {isLoadingReviews ? (
          <div className={styles.loadingIndicator}>Загрузка отзывов…</div>
        ) : reviews.length ? (
          <div className={styles.reviewsList}>
            {reviews.map((r) => (
              <div
                key={r.id}
                className={styles.reviewItem}
                onClick={() => navigate(`/restaurant/${r.restaurantId}`)}
              >
                <div className={styles.reviewHeader}>
                  <h3 className={styles.restaurantName}>{r.restaurantName}</h3>
                  <div className={styles.reviewRating}>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < r.rating ? styles.starFilled : styles.starEmpty
                          }
                        >
                          ★
                        </span>
                      ))}
                  </div>
                  <span className={styles.reviewDate}>{r.date}</span>
                </div>
                <p className={styles.reviewText}>{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>У вас пока нет отзывов</p>
        )}
      </div>
    ) : (
      <div className={styles.reviewsContainer}>
        {isLoadingFavorites ? (
          <div className={styles.loadingIndicator}>Загрузка избранного…</div>
        ) : favorites.length ? (
          <div className={styles.favoritesList}>
            {favorites.map((rest) => (
              <div
                key={rest.id}
                className={styles.favoriteRestaurant}
                onClick={() => navigate(`/restaurant/${rest.id}`)}
              >
                <div className={styles.favoriteImageContainer}>
                  <img
                    src={
                      rest.mainImageUrl ||
                      'https://placehold.jp/300x200.png?text=Ресторан'
                    }
                    alt={rest.title}
                    className={styles.favoriteImage}
                  />
                </div>
                <div className={styles.favoriteDetails}>
                  <h3 className={styles.favoriteName}>{rest.title}</h3>
                  <p className={styles.favoriteAddress}>{rest.address}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>У вас пока нет избранных ресторанов</p>
        )}
      </div>
    );

  return (
    <div className={styles.profilePage}>
      <NavBar
        onSearch={(q) => console.log(`Поиск: ${q}`)}
        onLanguageChange={(l) => console.log(`Язык: ${l}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Welcome')}
        isStatic
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
                { id: 'reviews',   label: 'Отзывы',     count: reviews.length },
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
