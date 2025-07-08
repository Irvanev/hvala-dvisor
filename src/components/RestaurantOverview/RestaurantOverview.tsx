import React from 'react';
import styles from './RestaurantOverview.module.css';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Review {
  id: string;
  author: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface RestaurantOverviewProps {
  description?: string;
  features?: string[];
  address?: string | {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phoneNumber?: string;
  website?: string;
  openingHours?: { [key: string]: string };
  reviews?: Review[];
  onShowAllReviews: () => void;
}

const RestaurantOverview: React.FC<RestaurantOverviewProps> = ({
  description,
  features,
  address,
  phoneNumber,
  website,
  openingHours,
  reviews = [],
  onShowAllReviews
}) => {
  const { t } = useAppTranslation();

  // Функция для форматирования адреса независимо от его типа
  const formattedAddress = () => {
    if (typeof address === 'string') {
      return address;
    } else if (address) {
      // Форматируем объект в строку адреса
      return `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
    }
    return t('restaurantOverview.addressNotSpecified');
  };

  return (
    <div className={styles.overviewSection}>
      <div className={styles.overviewColumns}>
        <div className={styles.overviewMainColumn}>
          {description && (
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>{t('restaurantOverview.aboutRestaurant')}</h2>
              <p className={styles.descriptionText}>{description}</p>
            </section>
          )}
          
          {features && features.length > 0 && (
            <section className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>{t('restaurantOverview.features')}</h2>
              <div className={styles.featuresTags}>
                {features.map((feature, index) => (
                  <span key={index} className={styles.featureTag}>
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          <section className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>{t('restaurantOverview.information')}</h2>
            <div className={styles.infoList}>
              {address && (
                <div className={styles.infoItem}>
                  <h3 className={styles.infoTitle}>{t('restaurantOverview.address')}</h3>
                  <div className={styles.infoValue}>{formattedAddress()}</div>
                </div>
              )}
              
              {phoneNumber && (
                <div className={styles.infoItem}>
                  <h3 className={styles.infoTitle}>{t('restaurantOverview.phone')}</h3>
                  <div className={styles.infoValue}>{phoneNumber}</div>
                </div>
              )}
              
              {website && (
                <div className={styles.infoItem}>
                  <h3 className={styles.infoTitle}>{t('restaurantOverview.website')}</h3>
                  <div className={styles.infoValue}>
                    <a href={website} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                      {website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          <section className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>{t('restaurantOverview.location')}</h2>
            <div className={styles.mapContainer}>
              <img
                src="https://placehold.jp/1000x400.png"
                alt={t('restaurantOverview.mapAlt')}
                className={styles.mapImage}
              />
            </div>
          </section>
        </div>
        
        <div className={styles.overviewSidebar}>
          {openingHours && Object.keys(openingHours).length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>{t('restaurantOverview.openingHours')}</h3>
              <div className={styles.sidebarHours}>
                {Object.entries(openingHours).map(([day, hours], index) => (
                  <div key={index} className={styles.sidebarHourRow}>
                    <div className={styles.sidebarDay}>{day}</div>
                    <div className={styles.sidebarTime}>{hours}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {reviews && reviews.length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>{t('restaurantOverview.recentReviews')}</h3>
              {reviews.slice(0, 2).map(review => (
                <div key={review.id} className={styles.sidebarReview}>
                  <div className={styles.sidebarReviewHeader}>
                    <div className={styles.sidebarReviewAuthor}>
                      <img 
                        src={review.authorAvatar || "https://placehold.jp/30x30.png"}
                        alt={review.author}
                        className={styles.sidebarReviewAvatar}
                      />
                      <div className={styles.sidebarReviewName}>{review.author}</div>
                    </div>
                    <div className={styles.sidebarReviewRating}>
                      {review.rating} ★
                    </div>
                  </div>
                  <p className={styles.sidebarReviewText}>
                    {review.comment.length > 120 
                      ? `${review.comment.substring(0, 120)}...` 
                      : review.comment}
                  </p>
                </div>
              ))}
              <button 
                className={styles.sidebarShowMore}
                onClick={onShowAllReviews}
              >
                {t('restaurantOverview.viewAllReviews')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOverview;