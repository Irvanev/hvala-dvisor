// src/components/Card/Card.tsx
import React, { useState, useEffect } from 'react';
import styles from './Card.module.css';
import cx from 'classnames';
import { favoriteService } from '../../services/FavoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../models/types';
import { useNotification } from '../../contexts/NotificationContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface CardProps {
  id: string;
  images: string[];
  image?: string;
  title: string;
  location?: string | {
    city?: string;
    country?: string;
    address?: string;
    street?: string;
    postalCode?: string;
  };
  rating?: number;
  cuisineTags?: string[];
  featureTags?: string[];
  priceRange?: string;
  savedStatus?: boolean;
  onClick?: () => void;
  onSaveToggle?: (saved: boolean, event?: React.MouseEvent) => void;
  variant?: 'default' | 'square';
}

const Card: React.FC<CardProps> = ({
  id,
  images = [],
  image,
  title,
  location,
  rating,
  cuisineTags = [],
  featureTags = [],
  priceRange,
  savedStatus,
  onClick,
  onSaveToggle,
  variant = 'default',
}) => {
  const { t } = useAppTranslation();
  const allImages = images.length > 0 ? images : image ? [image] : [];
  const [isSaved, setIsSaved] = useState(savedStatus || false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as User | null;
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { showNotification } = useNotification();

 const translateFeature = (feature: string) => {
  // 🆕 Добавляем отладку чтобы видеть что приходит из Firebase
  console.log('Переводим тег:', feature);
  
  const featureMap: { [key: string]: string } = {
    // WiFi варианты
    'wifi': t('features.wifi'),
    'wi-fi': t('features.wifi'),
    'features.wifi': t('features.wifi'), // 🆕 Добавляем этот вариант
    
    // Основные особенности
    'терраса': t('features.terrace'),
    'детское меню': t('features.kidsMenu'),
    'парковка': t('features.parking'),
    'живая музыка': t('features.liveMusic'),
    'навынос': t('features.takeaway'),
    'доставка': t('features.delivery'),
    'можно с питомцами': t('features.petFriendly'),
    'доступно для инвалидов': t('features.wheelchair'),
    'открытая терраса': t('features.outdoorSeating'),
    'бар': t('features.bar'),
    'завтрак': t('features.breakfast'),
    'обед': t('features.lunch'),
    'ужин': t('features.dinner'),
    'банковские карты': t('features.creditCards'),
    'бронирование': t('features.reservation'),
    
    // Английские варианты
    'terrace': t('features.terrace'),
    'kids menu': t('features.kidsMenu'),
    'parking': t('features.parking'),
    'live music': t('features.liveMusic'),
    'takeaway': t('features.takeaway'),
    'delivery': t('features.delivery'),
    'pet friendly': t('features.petFriendly'),
    'wheelchair accessible': t('features.wheelchair'),
    'outdoor seating': t('features.outdoorSeating'),
    'bar': t('features.bar'),
    'breakfast': t('features.breakfast'),
    'lunch': t('features.lunch'),
    'dinner': t('features.dinner'),
    'credit cards': t('features.creditCards'),
    'reservation': t('features.reservation'),
    
    // Сербские варианты
    'terasa': t('features.terrace'),
    'dečji meni': t('features.kidsMenu'),
    'živa muzika': t('features.liveMusic'),
    'za poneti': t('features.takeaway'),
    'dostava': t('features.delivery'),
    'dozvoljeni ljubimci': t('features.petFriendly'),
    'pristupačno za invalidska kolica': t('features.wheelchair'),
    'spoljašnje sedište': t('features.outdoorSeating'),
    'doručak': t('features.breakfast'),
    'ručak': t('features.lunch'),
    'večera': t('features.dinner'),
    'kreditne kartice': t('features.creditCards'),
    'rezervacija': t('features.reservation'),
    
    // Кухни - добавляем больше вариантов
    'сербская': t('features.serbian'),
    'черногорская': t('features.montenegrin'),
    'боснийская': t('features.bosnian'),
    'хорватская': t('features.croatian'),
    'македонская': t('features.macedonian'),
    'французская': t('features.french'),
    'итальянская': t('features.italian'),
    'испанская': t('features.spanish'),
    
    // Варианты на латинице
    'srpska': t('features.serbian'),
    'crnogorska': t('features.montenegrin'), 
    'bosanska': t('features.bosnian'),
    'hrvatska': t('features.croatian'),
    'makedonska': t('features.macedonian'),
    'francuska': t('features.french'),
    'italijanska': t('features.italian'),
    'španska': t('features.spanish'),
    
    // Английские варианты кухонь
    'serbian': t('features.serbian'),
    'montenegrin': t('features.montenegrin'),
    'bosnian': t('features.bosnian'),
    'croatian': t('features.croatian'),
    'macedonian': t('features.macedonian'),
    'french': t('features.french'),
    'italian': t('features.italian'),
    'spanish': t('features.spanish'),
    
    // 🆕 Дополнительные варианты которые могут быть в Firebase
    'историческое здание': t('features.historicBuilding'),
    'historic building': t('features.historicBuilding'),
    'istorijska zgrada': t('features.historicBuilding'),
    
    'живописный вид': t('features.scenicView'),
    'scenic view': t('features.scenicView'),
    'slikovit pogled': t('features.scenicView'),
    
    'семейный ресторан': t('features.familyFriendly'),
    'family friendly': t('features.familyFriendly'),
    'porodično': t('features.familyFriendly'),
  };
  
  const translated = featureMap[feature.toLowerCase()];
  
  if (!translated) {
    console.warn('❌ Перевод не найден для тега:', feature);
    return feature; // Возвращаем оригинал если перевод не найден
  }
  
  console.log('✅ Переведено:', feature, '->', translated);
  return translated;
};

  // Проверяем статус избранного при монтировании
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && typedUser) {
        try {
          const isFavorite = await favoriteService.isRestaurantFavorite(typedUser.id, id);
          setIsSaved(isFavorite);
        } catch (error) {
          console.error('Ошибка при проверке избранного:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [id, isAuthenticated, typedUser]);

  // Обновление статуса при изменении savedStatus
  useEffect(() => {
    if (savedStatus !== undefined) {
      setIsSaved(savedStatus);
    }
  }, [savedStatus]);

  // Форматируем местоположение для отображения
  const formattedLocation = () => {
    if (!location) return '';

    if (typeof location === 'string') {
      return location;
    }

    // Если location - объект, форматируем его в строку
    if (typeof location === 'object') {
      const locationObj = location as any;

      if (locationObj.city && locationObj.country) {
        return `${locationObj.city}, ${locationObj.country}`;
      } else if (locationObj.address) {
        return locationObj.address;
      } else if (locationObj.street && locationObj.city) {
        return `${locationObj.street}, ${locationObj.city}${locationObj.postalCode ? `, ${locationObj.postalCode}` : ''}`;
      } else {
        // Собираем все непустые значения
        return Object.values(locationObj)
          .filter(val => val && typeof val === 'string')
          .join(', ');
      }
    }

    return '';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prevIndex =>
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  // Обновленная функция рендера тегов со стилизацией
  const renderTags = (tags: string[]) => {
    const maxVisible = 2; // Уменьшаем количество для лучшего вида
    const visibleTags = tags.slice(0, maxVisible);
    const hiddenCount = tags.length - maxVisible;

    return (
      <div className={styles.tagsContainer}>
        {visibleTags.map((tag, i) => (
          <span key={i} className={styles.tag}>
            {translateFeature(tag)}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className={styles.moreTag}>+{hiddenCount}</span>
        )}
      </div>
    );
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated || !typedUser) {
      showNotification(t('restaurantPage.favorites.loginRequired'), 'info');
      navigate('/login', { state: { from: locationHook.pathname } });
      return;
    }

    setIsLoading(true);

    try {
      const newSavedState = !isSaved;

      if (newSavedState) {
        await favoriteService.addToFavorites(typedUser.id, id);
        showNotification(t('restaurantPage.favorites.added'), 'success');
      } else {
        await favoriteService.removeFromFavorites(typedUser.id, id);
        showNotification(t('restaurantPage.favorites.removed'), 'success');
      }

      await favoriteService.updateUserFavoritesCount(typedUser.id);
      setIsSaved(newSavedState);

      if (onSaveToggle) {
        onSaveToggle(newSavedState, e);
      }
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
      showNotification(t('restaurantPage.favorites.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const hasMultipleImages = allImages.length > 1;

  return (
    <div className={cx(styles.card, { [styles.squareCard]: variant === 'square' })} onClick={handleClick}>
      <div className={cx(styles.cardImageContainer, { [styles.squareImageContainer]: variant === 'square' })}>
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - фото ${currentImageIndex + 1}`}
              className={styles.cardImage}
              loading="lazy"
            />
            {hasMultipleImages && (
              <>
                <button
                  className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                  onClick={prevImage}
                  aria-label="Предыдущее изображение"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                  onClick={nextImage}
                  aria-label="Следующее изображение"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
            {hasMultipleImages && (
              <div className={styles.carouselIndicators}>
                {allImages.map((_, index) => (
                  <span
                    key={index}
                    className={`${styles.carouselIndicator} ${index === currentImageIndex ? styles.carouselIndicatorActive : ''}`}
                    onClick={e => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.cardImagePlaceholder}>Нет изображения</div>
        )}
        <button
          className={cx(styles.favoriteButton, { [styles.favoriteLoading]: isLoading })}
          onClick={handleSaveClick}
          aria-label={isSaved ? 'Удалить из избранного' : 'Добавить в избранное'}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.loadingSpinner}></div>
          ) : (
            <svg viewBox="0 0 24 24" fill={isSaved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" width="24" height="24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </button>
        {rating && (
          <div className={styles.ratingBadge}>
            {rating.toFixed(1)} <span className={styles.starIcon}>★</span>
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {priceRange && (
            <div
              className={`${styles.priceTag} ${priceRange === '€€€' ? styles.expensivePrice : priceRange === '€€' ? styles.moderatePrice : styles.affordablePrice
                }`}
            >
              {priceRange}
            </div>
          )}
        </div>
        {location && <p className={styles.cardLocation}>{formattedLocation()}</p>}
        {/* Обновленные теги */}
        {[...cuisineTags, ...featureTags].length > 0 && renderTags([...cuisineTags, ...featureTags])}
      </div>
    </div>
  );
};

export default Card;