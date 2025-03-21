import React, { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  title: string;
  children: ReactNode;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  showNavigation = false,
  onNext,
  onPrev
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {showNavigation && (
          <div className={styles.sectionNavigation}>
            <button
              className={styles.navButton}
              onClick={onPrev}
              aria-label="Previous"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className={styles.navButton}
              onClick={onNext}
              aria-label="Next"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
};

export default Section;