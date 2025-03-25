import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './ProfilePage.module.css';

interface UserProfile {
  name: string;
  username: string;
  city: string;
  avatar: string;
  reviews: {
    id: string;
    restaurant: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  favorites: number;
}

const ProfilePage: React.FC = () => {
  // Пример данных пользователя (в реальном приложении будут загружаться с сервера)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Имя Фамилия',
    username: 'username',
    city: 'Город',
    avatar: 'https://placehold.jp/300x300.png',
    reviews: [
      {
        id: '1',
        restaurant: 'La Maison',
        rating: 4.5,
        comment: 'Отличное место с прекрасной атмосферой и вкусной едой. Рекомендую попробовать фирменные блюда шеф-повара, особенно десерты.',
        date: '15.02.2024'
      },
      {
        id: '2',
        restaurant: 'Trattoria Italiana',
        rating: 5,
        comment: 'Невероятная итальянская кухня. Паста просто восхитительна! Аутентичные рецепты и отличный сервис.',
        date: '03.03.2024'
      }
    ],
    favorites: 14
  });

  // Активная вкладка
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites' | 'activity'>('reviews');

  const handleEditProfile = () => {
    console.log('Редактировать профиль');
    // Здесь будет логика для редактирования профиля
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.star}>★</span>
        ))}
        {halfStar && <span className={styles.star}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.emptyStar}>☆</span>
        ))}
      </div>
    );
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
          {/* Левая колонка с информацией о пользователе */}
          <div className={styles.leftColumn}>
            <div className={styles.avatarContainer}>
              <img src={profile.avatar} alt="Аватар пользователя" className={styles.avatar} />
            </div>
            
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>{profile.name}</h1>
              <p className={styles.userLogin}>@{profile.username}</p>
              <button onClick={handleEditProfile} className={styles.editButton}>
                Редактировать профиль
              </button>
            </div>
            
            <div className={styles.additionalInfo}>
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M11.536 3.464a5 5 0 0 1 0 7.072L8 14.07l-3.536-3.535a5 5 0 1 1 7.072-7.072v.001zm1.06 8.132a6.5 6.5 0 1 0-9.192 0l3.535 3.536a1.5 1.5 0 0 0 2.122 0l3.535-3.536zM8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
                <span>{profile.city}</span>
              </div>
            </div>
          </div>
          
          {/* Правая колонка с контентом */}
          <div className={styles.rightColumn}>
            {/* Вкладки */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Отзывы
                <span className={styles.tabCount}>{profile.reviews.length}</span>
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                Избранное
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'activity' ? styles.active : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Активность
              </button>
            </div>
            
            {/* Контент вкладки */}
            {activeTab === 'reviews' && (
              <div className={styles.reviewsContainer}>
                {profile.reviews.length > 0 ? (
                  <div className={styles.reviewsList}>
                    {profile.reviews.map(review => (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewLeft}>
                            <h3 className={styles.restaurantName}>{review.restaurant}</h3>
                            {renderStars(review.rating)}
                          </div>
                          <span className={styles.reviewDate}>{review.date}</span>
                        </div>
                        
                        <p className={styles.reviewText}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noReviews}>Пока нет отзывов</p>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className={styles.reviewsContainer}>
                <p className={styles.noReviews}>Список избранных ресторанов</p>

              </div>
            )}
            
            {activeTab === 'activity' && (
              <div className={styles.contributionsBlock}>
                <div className={styles.contributionsHeader}>
                  Активность за последний год
                </div>
                <div className={styles.contributionsGraph}>
                  <img 
                    src="https://placehold.jp/800x120.png" 
                    alt="График активности" 
                    style={{ width: '100%', height: 'auto' }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;