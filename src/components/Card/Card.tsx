import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  image?: string;
  title: string;
  location: string;
  rating: number;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  location,
  rating,
  onClick
}) => {
  return (
    <div className={styles.card} onClick={onClick}>
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
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
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
      </div>
    </div>
  );
};

export default Card;
