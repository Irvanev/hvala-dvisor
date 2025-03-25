import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './ProfilePage.module.css';

interface UserProfile {
  name: string;
  city: string;
  additionalInfo: string;
  avatar: string;
  reviews: {
    id: string;
    restaurant: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const ProfilePage: React.FC = () => {
  // Пример данных пользователя (в реальном приложении будут загружаться с сервера)
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Имя Фамилия',
    city: 'Город',
    additionalInfo: 'Еще Данные Из Сущ',
    avatar: 'https://placehold.jp/300x300.png',
    reviews: [
      {
        id: '1',
        restaurant: 'La Maison',
        rating: 4.5,
        comment: 'Отличное место с прекрасной атмосферой и вкусной едой.',
        date: '15.02.2024'
      },
      {
        id: '2',
        restaurant: 'Trattoria Italiana',
        rating: 5,
        comment: 'Невероятная итальянская кухня. Паста просто восхитительна!',
        date: '03.03.2024'
      }
    ]
  });

  const handleEditProfile = () => {
    console.log('Редактировать профиль');
    // Здесь будет логика для редактирования профиля
  };

  const handleAddReview = () => {
    console.log('Оставить отзыв');
    // Здесь будет логика для добавления отзыва
  };

  const handleLinkAccount = () => {
    console.log('Связать аккаунт');
    // Здесь будет логика для связывания аккаунта
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
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img src={profile.avatar} alt="Аватар пользователя" className={styles.avatar} />
          </div>
          
          <div className={styles.profileInfo}>
            <h1 className={styles.userName}>{profile.name}</h1>
            <p className={styles.userLocation}>{profile.city}</p>
            <p className={styles.userAdditionalInfo}>{profile.additionalInfo}</p>
            
            <button onClick={handleEditProfile} className={styles.editButton}>
              Редактировать
            </button>
          </div>
        </div>
        
        <div className={styles.profileContent}>
          <h2 className={styles.reviewsTitle}>История Отзывов</h2>
          
          {profile.reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {profile.reviews.map(review => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <h3 className={styles.restaurantName}>{review.restaurant}</h3>
                    <span className={styles.reviewDate}>{review.date}</span>
                  </div>
                  
                  {renderStars(review.rating)}
                  
                  <p className={styles.reviewText}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noReviews}>У вас пока нет отзывов</p>
          )}
        </div>
        
        <div className={styles.profileActions}>
          <button onClick={handleAddReview} className={styles.actionButton}>
            Оставить Отзыв
          </button>
          <button onClick={handleLinkAccount} className={styles.actionButton}>
            Связать Аккаунт
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;