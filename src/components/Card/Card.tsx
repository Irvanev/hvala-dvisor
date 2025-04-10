import React, { useState } from 'react';
import styles from './Card.module.css';

const tagIcons: Record<string, string> = {
  'Французская': '🍽️',
  'Итальянская': '🍽️',
  'Испанская': '🍽️',
  'Веганское меню': '🌱',
  'Фермерские продукты': '🌾',
  'Детское меню': '🧒',
  'Панорамный вид': '🪟',
  'Терраса': '🪟',
  'Винная карта': '🍷',
  'Дровяная печь': '🔥',
};
const priceRangeIcons: Record<string, string> = {
  '€': '💰',
  '€€': '💵',
  '€€€': '💳',
};


interface CardProps {
  id: string;
  image: string;
  title: string;
  location?: string;
  rating?: number;
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
  savedStatus?: boolean;
  onClick?: () => void;
  onSaveToggle?: (saved: boolean, event?: React.MouseEvent) => void;
}

const Card: React.FC<CardProps> = ({
  id,
  image,
  title,
  location,
  rating,
  cuisineTags = [],
  featureTags = [],
  priceRange,
  savedStatus = false,
  onClick,
  onSaveToggle
}) => {
  const renderIconTags = (tags: string[]) => {
    const maxVisible = 3; // показываем максимум 3 тега
    const visibleTags = tags.slice(0, maxVisible);
    const hiddenCount = tags.length - maxVisible;
  
    return (
      <>
        {visibleTags.map((tag, i) => (
          <span key={i} className={styles.iconTag}>
            {tagIcons[tag] || '🔹'} {tag}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className={styles.moreTag}>+{hiddenCount}</span>
        )}
      </>
    );
  };
  

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
  };

  // Обработчик для вызова onClick, если он предоставлен
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

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

        {/* Кнопка "Избранное" */}
        <button
          className={styles.favoriteButton}
          onClick={handleSaveClick}
          aria-label={isSaved ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isSaved ? "#fff" : "none"}
            stroke="#fff"
            strokeWidth="2"
            width="24"
            height="24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Рейтинг на изображении */}
        {rating && (
          <div className={styles.ratingBadge}>
            {rating.toFixed(1)} <span className={styles.starIcon}>★</span>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          {/* Название ресторана */}
          <h3 className={styles.cardTitle}>{title}</h3>

          {/* Ценовой диапазон */}
          {priceRange && (
            <div className={`${styles.priceTag} ${priceRange === '€€€' ? styles.expensivePrice :
                priceRange === '€€' ? styles.moderatePrice :
                  styles.affordablePrice
              }`}>
              {priceRange}
            </div>
          )}
        </div>

        {/* Местоположение */}
        {location && <p className={styles.cardLocation}>{location}</p>}

        {/* Теги */}
        {/* Краткие иконки-теги */}
        <div className={styles.iconTagsRow}>
          {renderIconTags([...cuisineTags, ...featureTags])}
        </div>

      </div>
    </div>
  );
};

export default Card;