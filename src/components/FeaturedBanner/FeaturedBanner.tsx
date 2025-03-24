// src/components/FeaturedBanner/FeaturedBanner.tsx
import React from 'react';
import styles from './FeaturedBanner.module.css';

interface FeaturedBannerProps {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  onClick?: () => void;
  buttonText?: string;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({
  id,
  title,
  subtitle,
  image,
  onClick,
  buttonText = "Посмотреть Список"
}) => {
  return (
    <div className={styles.featuredBanner} onClick={onClick}>
      <div className={styles.imageContainer}>
        {image ? (
          <img
            src={image}
            alt={title}
            className={styles.bannerImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>800 x 400</div>
        )}
        
        {/* Красный флажок в углу */}
        <div className={styles.flagBookmark}>
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
            <path d="M0 0H30V40L15 30L0 40V0Z" fill="#D93F3F"/>
          </svg>
        </div>
        
        <div className={styles.overlayGradient}></div>
      </div>
      
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        
        <button className={styles.actionButton} onClick={(e) => {
          e.stopPropagation();
          console.log('Button clicked for', title);
        }}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default FeaturedBanner;