import React from 'react';
import styles from './ContactInfo.module.css';

interface ContactInfoProps {
  address?: string;
  phoneNumber?: string;
  website?: string;
  showHours?: boolean;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  address,
  phoneNumber,
  website,
  showHours = true // По умолчанию показываем часы работы
}) => {
  return (
    <div className={styles.contactContainer}>
      <h2 className={styles.sectionTitle}>Контактная информация</h2>
      
      <div className={styles.contactGrid}>
        {address && (
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>📍</div>
            <div className={styles.contactInfo}>
              <div className={styles.contactLabel}>Адрес</div>
              <div className={styles.contactValue}>{address}</div>
            </div>
          </div>
        )}
        
        {phoneNumber && (
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>📞</div>
            <div className={styles.contactInfo}>
              <div className={styles.contactLabel}>Телефон</div>
              <a href={`tel:${phoneNumber}`} className={styles.contactLink}>{phoneNumber}</a>
            </div>
          </div>
        )}
        
        {website && (
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>🌐</div>
            <div className={styles.contactInfo}>
              <div className={styles.contactLabel}>Сайт</div>
              <a href={website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                {website}
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ContactInfo;