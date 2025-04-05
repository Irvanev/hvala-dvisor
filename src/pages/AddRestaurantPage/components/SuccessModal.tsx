import React from 'react';
import styles from '../AddRestaurantPage.module.css';

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#4CAF50"/>
            </svg>
          </div>
          
          <h2 className={styles.modalTitle}>Ресторан успешно отправлен на модерацию</h2>
          
          <p className={styles.modalDescription}>
            Благодарим за добавление ресторана! Наши модераторы проверят информацию в ближайшее время.
            Мы свяжемся с вами по указанным контактным данным, если потребуется дополнительная информация.
          </p>
          
          <p className={styles.modalInfo}>
            Обычно проверка занимает от 1 до 3 рабочих дней. После успешной проверки ресторан появится на сайте.
          </p>
          
          <button 
            className={styles.modalButton}
            onClick={onClose}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;