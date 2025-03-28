import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import ReviewItem from '../../components/ReviewItem/ReviewItem';
import UserInfoCard from '../../components/UserInfoCard/UserInfoCard';
import TabsNavigation from '../../components/TabsNavigation/TabsNavigation';
import styles from './ProfilePage.module.css';

interface Review {
  id: string;
  restaurant: string;
  rating: number;
  comment: string;
  date: string;
}

interface UserProfile {
  name: string;
  username: string;
  city: string;
  avatar: string;
  reviews: Review[];
  favorites: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
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
    // Перенаправляем на страницу редактирования профиля
    navigate('/edit-profile');
  };

  // Функция для отображения контента в зависимости от активной вкладки
  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className={styles.reviewsContainer}>
            {profile.reviews.length > 0 ? (
              <div className={styles.reviewsList}>
                {profile.reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>Пока нет отзывов</p>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className={styles.reviewsContainer}>
            <p className={styles.noReviews}>Список избранных ресторанов</p>
          </div>
        );
      case 'activity':
        return (
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
        );
      default:
        return null;
    }
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
            <UserInfoCard 
              user={profile}
              onEditClick={handleEditProfile}
            />
          </div>
          
          {/* Правая колонка с контентом */}
          <div className={styles.rightColumn}>
            {/* Вкладки */}
            <TabsNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { id: 'reviews', label: 'Отзывы', count: profile.reviews.length },
                { id: 'favorites', label: 'Избранное', count: undefined },
                { id: 'activity', label: 'Активность', count: undefined }
              ]}
            />
            
            {/* Контент вкладки */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;