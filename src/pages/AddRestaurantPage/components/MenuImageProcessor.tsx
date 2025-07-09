import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../AddRestaurantPage.module.css';

interface MenuImageProcessorProps {
  onMenuExtracted: (items: Array<{name: string; description: string; price: string; category?: string}>) => void;
  onHoursExtracted: (hours: {[key: string]: {open: string; close: string; closed: boolean}}) => void;
}

const MenuImageProcessor: React.FC<MenuImageProcessorProps> = ({
  onMenuExtracted,
  onHoursExtracted
}) => {
  const { t } = useTranslation();
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const hoursFileInputRef = useRef<HTMLInputElement>(null);
  const [menuImage, setMenuImage] = useState<File | null>(null);
  const [hoursImage, setHoursImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMenuFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMenuImage(e.target.files[0]);
      setError(null);
    }
  };

  const handleHoursFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHoursImage(e.target.files[0]);
      setError(null);
    }
  };

  const processMenuImage = async () => {
    if (!menuImage) {
      setError(t('addRestaurantPage.errors.selectMenuImage'));
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ИСПРАВЛЕНИЕ: Используем переводы для категорий
      const extractedMenuItems = [
        {
          category: t('addRestaurantPage.menuImageProcessor.demoData.appetizers'),
          name: t('addRestaurantPage.menuImageProcessor.demoData.bruschetta'),
          description: t('addRestaurantPage.menuImageProcessor.demoData.bruschettaDesc'),
          price: '250 ₽'
        },
        {
          category: t('addRestaurantPage.menuImageProcessor.demoData.appetizers'),
          name: t('addRestaurantPage.menuImageProcessor.demoData.carpaccio'),
          description: t('addRestaurantPage.menuImageProcessor.demoData.carpaccioDesc'),
          price: '380 ₽'
        },
        {
          category: t('addRestaurantPage.menuImageProcessor.demoData.mainDishes'),
          name: t('addRestaurantPage.menuImageProcessor.demoData.carbonara'),
          description: t('addRestaurantPage.menuImageProcessor.demoData.carbonaraDesc'),
          price: '420 ₽'
        },
        {
          category: t('addRestaurantPage.menuImageProcessor.demoData.mainDishes'),
          name: t('addRestaurantPage.menuImageProcessor.demoData.salmon'),
          description: t('addRestaurantPage.menuImageProcessor.demoData.salmonDesc'),
          price: '650 ₽'
        }
      ];

      onMenuExtracted(extractedMenuItems);
      setSuccess(t('addRestaurantPage.success.menuProcessed'));
      
      if (menuFileInputRef.current) {
        menuFileInputRef.current.value = '';
      }
    } catch (error) {
      setError(t('addRestaurantPage.errors.processingMenuImage'));
      console.error('Ошибка при обработке меню:', error);
    } finally {
      setProcessing(false);
    }
  };

  const processHoursImage = async () => {
    if (!hoursImage) {
      setError(t('addRestaurantPage.errors.selectHoursImage'));
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const extractedHours = {
        [t('addRestaurantPage.openingHours.monday')]: { open: '09:00', close: '22:00', closed: false },
        [t('addRestaurantPage.openingHours.tuesday')]: { open: '09:00', close: '22:00', closed: false },
        [t('addRestaurantPage.openingHours.wednesday')]: { open: '09:00', close: '22:00', closed: false },
        [t('addRestaurantPage.openingHours.thursday')]: { open: '09:00', close: '22:00', closed: false },
        [t('addRestaurantPage.openingHours.friday')]: { open: '09:00', close: '23:00', closed: false },
        [t('addRestaurantPage.openingHours.saturday')]: { open: '10:00', close: '23:00', closed: false },
        [t('addRestaurantPage.openingHours.sunday')]: { open: '10:00', close: '21:00', closed: false }
      };

      onHoursExtracted(extractedHours);
      setSuccess(t('addRestaurantPage.success.hoursProcessed'));
      
      if (hoursFileInputRef.current) {
        hoursFileInputRef.current.value = '';
      }
    } catch (error) {
      setError(t('addRestaurantPage.errors.processingHoursImage'));
      console.error('Ошибка при обработке часов работы:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.menuImageProcessor}>
      <h3 className={styles.sectionTitle}>{t('addRestaurantPage.menuImageProcessor.title')}</h3>
      <p className={styles.sectionDescription}>
        {t('addRestaurantPage.menuImageProcessor.description')}
      </p>

      {error && (
        <div className={`${styles.errorMessage} error-message`}>{error}</div>
      )}
      
      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      <div className={styles.imageProcessorContainer}>
        <div className={styles.processorSection}>
          <h4 className={styles.subSectionTitle}>
            {t('addRestaurantPage.menuImageProcessor.menuProcessing.title')}
          </h4>
          <p>{t('addRestaurantPage.menuImageProcessor.menuProcessing.description')}</p>
          
          <div className={styles.imageUploader}>
            <input
              type="file"
              ref={menuFileInputRef}
              id="menu-image-edit"
              onChange={handleMenuFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
            />
            <label htmlFor="menu-image-edit" className={styles.uploadButton}>
              {t('addRestaurantPage.menuImageProcessor.menuProcessing.selectPhoto')}
            </label>
            
            {menuImage && (
              <div className={styles.selectedFile}>
                {t('common.selectedFile')}: {menuImage.name}
              </div>
            )}
            
            <button 
              type="button"
              onClick={processMenuImage}
              disabled={!menuImage || processing}
              className={styles.processButton}
            >
              {processing ? t('addRestaurantPage.menuImageProcessor.menuProcessing.processing') : t('addRestaurantPage.menuImageProcessor.menuProcessing.process')}
            </button>
          </div>
          
          <div className={styles.tipBox}>
            <h5>{t('addRestaurantPage.menuImageProcessor.tips.title')}</h5>
            <ul>
              <li>{t('addRestaurantPage.menuImageProcessor.tips.clearPhoto')}</li>
              <li>{t('addRestaurantPage.menuImageProcessor.tips.readableText')}</li>
              <li>{t('addRestaurantPage.menuImageProcessor.tips.straightPhoto')}</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.processorSection}>
          <h4 className={styles.subSectionTitle}>
            {t('addRestaurantPage.menuImageProcessor.hoursProcessing.title')}
          </h4>
          <p>{t('addRestaurantPage.menuImageProcessor.hoursProcessing.description')}</p>
          
          <div className={styles.imageUploader}>
            <input
              type="file"
              ref={hoursFileInputRef}
              id="hours-image-edit"
              onChange={handleHoursFileSelect}
              accept="image/jpeg,image/png,image/webp"
              className={styles.fileInput}
            />
            <label htmlFor="hours-image-edit" className={styles.uploadButton}>
              {t('addRestaurantPage.menuImageProcessor.hoursProcessing.selectPhoto')}
            </label>
            
            {hoursImage && (
              <div className={styles.selectedFile}>
                {t('common.selectedFile')}: {hoursImage.name}
              </div>
            )}
            
            <button 
              type="button"
              onClick={processHoursImage}
              disabled={!hoursImage || processing}
              className={styles.processButton}
            >
              {/* ИСПРАВЛЕНИЕ: Используем правильный перевод */}
              {processing ? t('addRestaurantPage.menuImageProcessor.hoursProcessing.processing') : t('addRestaurantPage.menuImageProcessor.hoursProcessing.process')}
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.note}>
        <p>
          <strong>{t('common.note')}:</strong> {t('addRestaurantPage.menuImageProcessor.note')}
        </p>
      </div>
    </div>
  );
};

export default MenuImageProcessor;