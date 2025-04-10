// src/components/FeaturedBanner/FeaturedBanner.tsx
import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${styles.featuredBanner} ${isHovered ? styles.hovered : ''}`} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
        <div className={styles.textContent}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.detailsWrapper}>
            <p className={styles.subtitle}>{subtitle}</p>
            <button 
              className={styles.actionButton} 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Button clicked for', title);
              }}
            >
              <span className={styles.buttonText}>{buttonText}</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;