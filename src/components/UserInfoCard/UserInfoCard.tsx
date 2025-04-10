import React from 'react';
import styles from './UserInfoCard.module.css';

interface UserInfoCardProps {
  user: {
    name: string;
    username: string;
    city: string;
    avatar: string;
    reviews?: any[]; // Опционально: массив отзывов пользователя
    favorites?: number; // Опционально: количество избранных ресторанов
    registrationDate?: string; // Опционально: дата регистрации
  };
  onEditClick: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, onEditClick }) => {
  return (
    <div className={styles.userInfoCard}>
      <div className={styles.avatarContainer}>
        <img src={user.avatar} alt={`Аватар ${user.name}`} className={styles.avatar} />
      </div>
      
      <div className={styles.userInfo}>
        <h1 className={styles.userName}>{user.name}</h1>
        <p className={styles.userLogin}>@{user.username}</p>
        
        {/* Информация о городе */}
        <div className={styles.userLocation}>
          <svg className={styles.locationIcon} viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M11.536 3.464a5 5 0 0 1 0 7.072L8 14.07l-3.536-3.535a5 5 0 1 1 7.072-7.072v.001zm1.06 8.132a6.5 6.5 0 1 0-9.192 0l3.535 3.536a1.5 1.5 0 0 0 2.122 0l3.535-3.536zM8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          </svg>
          <span className={styles.cityText}>{user.city}</span>
        </div>
        
        {/* Статистика пользователя */}
        <div className={styles.userStats}>
          {user.reviews && (
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.reviews.length}</div>
              <div className={styles.statLabel}>Отзывов</div>
            </div>
          )}
          
          {user.favorites !== undefined && (
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.favorites}</div>
              <div className={styles.statLabel}>В избранном</div>
            </div>
          )}
          
          {user.registrationDate && (
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.registrationDate}</div>
              <div className={styles.statLabel}>С нами с</div>
            </div>
          )}
        </div>
        
        <button onClick={onEditClick} className={styles.editButton}>
          <span className={styles.editIcon}>✏️</span>
          Редактировать профиль
        </button>
      </div>
      
      {/* Добавляем нижнюю секцию с кнопками быстрого доступа */}
      <div className={styles.quickActions}>
        <button className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>📝</span>
          <span>Написать отзыв</span>
        </button>
        
        <button className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>🔍</span>
          <span>Найти ресторан</span>
        </button>
        
        <button className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>🌟</span>
          <span>Рейтинги</span>
        </button>
      </div>
    </div>
  );
};

export default UserInfoCard;