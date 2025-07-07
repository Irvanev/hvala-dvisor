import React, { useState, useRef } from 'react';
import styles from '../AddRestaurantPage.module.css';

interface MenuImageProcessorProps {
  onMenuExtracted: (items: Array<{name: string; description: string; price: string; category?: string}>) => void;
  onHoursExtracted: (hours: {[key: string]: {open: string; close: string; closed: boolean}}) => void;
}

const MenuImageProcessor: React.FC<MenuImageProcessorProps> = ({
  onMenuExtracted,
  onHoursExtracted
}) => {
  const menuFileInputRef = useRef<HTMLInputElement>(null);
  const hoursFileInputRef = useRef<HTMLInputElement>(null);
  const [menuImage, setMenuImage] = useState<File | null>(null);
  const [hoursImage, setHoursImage] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Обработчик выбора файла для меню
  const handleMenuFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMenuImage(e.target.files[0]);
      setError(null);
    }
  };

  // Обработчик выбора файла для часов работы
  const handleHoursFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHoursImage(e.target.files[0]);
      setError(null);
    }
  };

  // Функция для обработки фото меню
  const processMenuImage = async () => {
    if (!menuImage) {
      setError('Пожалуйста, загрузите фотографию меню');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // В реальном приложении здесь был бы код для отправки изображения в API для OCR
      // и обработки результатов. Для демонстрации мы имитируем процесс.
      
      // Имитация задержки обработки
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Имитация результатов обработки изображения меню
      const extractedMenuItems = [
        {
          category: 'Закуски',
          name: 'Брускетта с томатами',
          description: 'Хрустящие тосты с томатами, базиликом и оливковым маслом',
          price: '250 ₽'
        },
        {
          category: 'Закуски',
          name: 'Карпаччо из говядины',
          description: 'Тонко нарезанная маринованная говядина с рукколой и пармезаном',
          price: '380 ₽'
        },
        {
          category: 'Основные блюда',
          name: 'Паста Карбонара',
          description: 'Классическая итальянская паста с беконом и сливочным соусом',
          price: '420 ₽'
        },
        {
          category: 'Основные блюда',
          name: 'Стейк из лосося',
          description: 'Стейк из лосося с овощами на гриле и лимонным соусом',
          price: '650 ₽'
        }
      ];

      // Отправляем результаты родительскому компоненту
      onMenuExtracted(extractedMenuItems);
      
      setSuccess('Меню успешно обработано и добавлено');
      
      // Сбрасываем выбранный файл, чтобы можно было выбрать тот же файл снова при необходимости
      if (menuFileInputRef.current) {
        menuFileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Произошла ошибка при обработке изображения меню');
      console.error('Ошибка при обработке меню:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Функция для обработки фото часов работы
  const processHoursImage = async () => {
    if (!hoursImage) {
      setError('Пожалуйста, загрузите фотографию часов работы');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Имитация задержки обработки
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Имитация результатов обработки изображения часов работы
      const extractedHours = {
        'Понедельник': { open: '09:00', close: '22:00', closed: false },
        'Вторник': { open: '09:00', close: '22:00', closed: false },
        'Среда': { open: '09:00', close: '22:00', closed: false },
        'Четверг': { open: '09:00', close: '22:00', closed: false },
        'Пятница': { open: '09:00', close: '23:00', closed: false },
        'Суббота': { open: '10:00', close: '23:00', closed: false },
        'Воскресенье': { open: '10:00', close: '21:00', closed: false }
      };

      // Отправляем результаты родительскому компоненту
      onHoursExtracted(extractedHours);
      
      setSuccess('Часы работы успешно обработаны и добавлены');
      
      // Сбрасываем выбранный файл
      if (hoursFileInputRef.current) {
        hoursFileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Произошла ошибка при обработке изображения часов работы');
      console.error('Ошибка при обработке часов работы:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.menuImageProcessor}>
      <h3 className={styles.sectionTitle}>Автоматическое заполнение по фото</h3>
      <p className={styles.sectionDescription}>
        Вы можете сфотографировать меню и часы работы ресторана, и мы автоматически 
        распознаем и добавим эту информацию.
      </p>

      {error && (
        <div className={`${styles.errorMessage} error-message`}>{error}</div>
      )}
      
      {success && (
        <div className={styles.successMessage}>{success}</div>
      )}

      <div className={styles.imageProcessorContainer}>
        <div className={styles.processorSection}>
          <h4 className={styles.subSectionTitle}>Обработка меню</h4>
          <p>Загрузите фотографию меню ресторана, и мы распознаем блюда, описания и цены.</p>
          
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
              Выбрать фото меню
            </label>
            
            {menuImage && (
              <div className={styles.selectedFile}>
                Выбран файл: {menuImage.name}
              </div>
            )}
            
            <button 
              type="button"
              onClick={processMenuImage}
              disabled={!menuImage || processing}
              className={styles.processButton}
            >
              {processing ? 'Обработка...' : 'Обработать фото меню'}
            </button>
          </div>
          
          <div className={styles.tipBox}>
            <h5>Советы для лучшего распознавания:</h5>
            <ul>
              <li>Убедитесь, что фото четкое, с хорошим освещением</li>
              <li>Текст должен быть легко читаем</li>
              <li>Старайтесь фотографировать прямо, без искажений</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.processorSection}>
          <h4 className={styles.subSectionTitle}>Обработка часов работы</h4>
          <p>Загрузите фотографию с часами работы, и мы автоматически добавим их в информацию о ресторане.</p>
          
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
              Выбрать фото часов работы
            </label>
            
            {hoursImage && (
              <div className={styles.selectedFile}>
                Выбран файл: {hoursImage.name}
              </div>
            )}
            
            <button 
              type="button"
              onClick={processHoursImage}
              disabled={!hoursImage || processing}
              className={styles.processButton}
            >
              {processing ? 'Обработка...' : 'Обработать фото часов работы'}
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.note}>
        <p>
          <strong>Примечание:</strong> Вы всегда сможете отредактировать или дополнить 
          автоматически распознанную информацию вручную.
        </p>
      </div>
    </div>
  );
};

export default MenuImageProcessor;