import React from 'react';
import ContactInfo from '../ContactInfo/ContactInfo';
import styles from './RestaurantOverview.module.css';

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
  address?: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    [key: string]: string;
  };
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
  return (
    <div className={styles.overviewSection}>
      <div className={styles.overviewColumns}>
        <div className={styles.overviewMainColumn}>
          {description && (
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>О ресторане</h2>
              <p className={styles.descriptionText}>{description}</p>
            </section>
          )}
          
          {features && features.length > 0 && (
            <section className={styles.featuresSection}>
              <h2 className={styles.sectionTitle}>Особенности</h2>
              <div className={styles.featuresTags}>
                {features.map((feature, index) => (
                  <span key={index} className={styles.featureTag}>
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          <ContactInfo
            address={address}
            phoneNumber={phoneNumber}
            website={website}
            openingHours={openingHours}
            showHours={false} // Не показываем часы в контактной секции
          />
          
          <section className={styles.mapSection}>
            <h2 className={styles.sectionTitle}>Местоположение</h2>
            <div className={styles.mapContainer}>
              <img
                src="https://placehold.jp/1000x400.png"
                alt="Карта расположения ресторана"
                className={styles.mapImage}
              />
            </div>
          </section>
        </div>
        
        <div className={styles.overviewSidebar}>
          {openingHours && Object.keys(openingHours).length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Часы работы</h3>
              <div className={styles.sidebarHours}>
                {Object.entries(openingHours).map(([day, hours], index) => (
                  <div key={index} className={styles.sidebarHourRow}>
                    <div className={styles.sidebarDay}>{day.substring(0, 3)}</div>
                    <div className={styles.sidebarTime}>{hours}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {reviews && reviews.length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Последние отзывы</h3>
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
                Смотреть все отзывы
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantOverview;