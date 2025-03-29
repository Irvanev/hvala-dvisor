import React, { useState } from 'react';
import styles from './Card.module.css';

interface CardProps {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  location?: string;
  rating?: number;
  size?: 'default' | 'featured' | 'large';
  showButton?: boolean;
  buttonText?: string;
  savedStatus?: boolean;
  onClick?: () => void; // Делаем опциональным, т.к. будет использоваться с Link
  onSaveToggle?: (saved: boolean, event?: React.MouseEvent) => void; // Изменяем сигнатуру для передачи события
}

const Card: React.FC<CardProps> = ({
  id,
  image,
  title,
  subtitle,
  location,
  rating,
  size = 'normal',
  showButton = false,
  buttonText = "Посмотреть Список",
  savedStatus = false,
  onClick,
  onSaveToggle
}) => {
  // Локальное состояние для закладки
  const [isSaved, setIsSaved] = useState(savedStatus);
  
  // Обработчик нажатия на закладку
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем срабатывание onClick родителя
    e.preventDefault(); // Предотвращаем переход по ссылке при клике на кнопку
    
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    // Вызываем callback для обновления в БД, если он предоставлен
    if (onSaveToggle) {
      onSaveToggle(newSavedState, e);
    }
    
    console.log(`${newSavedState ? 'Добавлено в' : 'Удалено из'} избранное: ${title}`);
  };

  // Обработчик для вызова onClick, если он предоставлен
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Карточка в стиле "featured" (полноэкранное изображение с текстом внизу, как на изображении 1)
  if (size === 'featured') {
    return (
      <div className={styles.featuredCard} onClick={handleClick}>
        {image ? (
          <img
            src={image}
            alt={title}
            className={styles.featuredImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>Нет изображения</div>
        )}
        
        {/* Красный флажок в углу */}
        <div className={styles.flagBookmark}>
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
            <path d="M0 0H30V40L15 30L0 40V0Z" fill="#D93F3F"/>
          </svg>
        </div>
        
        <div className={styles.featuredContent}>
          <h2 className={styles.featuredTitle}>{title}</h2>
          {subtitle && <p className={styles.featuredSubtitle}>{subtitle}</p>}
          
          {showButton && (
            <button className={styles.featuredButton} onClick={(e) => {
              e.stopPropagation();
              e.preventDefault(); // Предотвращаем переход по ссылке
              console.log('Button clicked for', title);
            }}>
              {buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Карточка в большом размере (как на изображении 2)
  if (size === 'large') {
    return (
      <div className={styles.cardLarge} onClick={handleClick}>
        {/* Левая часть - изображение */}
        <div className={styles.cardLargeImageContainer}>
          {image ? (
            <img
              src={image}
              alt={title}
              className={styles.cardLargeImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.cardImagePlaceholder}>Нет изображения</div>
          )}
        </div>
        
        {/* Правая часть - контент */}
        <div className={styles.cardLargeContent}>
          {/* Закладка */}
          <button className={styles.bookmarkButton} onClick={handleSaveClick}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isSaved ? "#ef4444" : "none"}
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          
          <h3 className={styles.cardLargeTitle}>{title}</h3>
          
          {location && (
            <div className={styles.locationContainer}>
              <span className={styles.locationIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className={styles.locationText}>{location}</span>
            </div>
          )}
          
          {rating && (
            <div className={styles.ratingContainerLarge}>
              <span className={styles.ratingIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#f59e0b"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span className={styles.ratingText}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Обычная карточка
  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardImageContainer}>
        {image ? (
          <img
            src={image}
            alt={title}
            className={styles.cardImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>Нет изображения</div>
        )}
        
        {/* Кнопка "Сохранить" (красный флажок) */}
        <button className={styles.saveButton} onClick={handleSaveClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isSaved ? "#ef4444" : "none"}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.cardDetails}>
          {location && (
            <div className={styles.locationContainer}>
              <span className={styles.locationIcon}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className={styles.locationText}>{location}</span>
            </div>
          )}
          {rating && (
            <div className={styles.ratingContainer}>
              <span className={styles.ratingIcon}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span className={styles.ratingText}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;