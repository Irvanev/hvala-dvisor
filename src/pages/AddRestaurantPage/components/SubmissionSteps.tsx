import React from 'react';
import addStyles from '../AddRestaurantPage.module.css';
import editStyles from '../../EditRestaurantPage/EditRestaurantPage.module.css';

interface SubmissionStepsProps {
  currentStep: number;
  totalSteps: number;
  isEdit?: boolean; // Новый параметр для выбора стилей
}

const SubmissionSteps: React.FC<SubmissionStepsProps> = ({ 
  currentStep, 
  totalSteps,
  isEdit = false // По умолчанию - режим добавления
}) => {
  // Выбираем нужный стиль в зависимости от контекста
  const styles = isEdit ? editStyles : addStyles;
  
  const steps = [
    {
      number: 1,
      title: 'Основная информация'
    },
    {
      number: 2,
      title: 'Фотографии и особенности'
    },
    {
      number: 3,
      title: 'Меню и часы работы'
    },
    {
      number: 4,
      title: 'Контактная информация'
    }
  ];

  return (
    <div className={styles.stepsContainer}>
      <div className={styles.stepsProgressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      
      <div className={styles.stepsList}>
        {steps.map((step) => (
          <div 
            key={step.number}
            className={`${styles.stepItem} ${
              currentStep === step.number 
                ? styles.active 
                : currentStep > step.number 
                  ? styles.completed 
                  : ''
            }`}
          >
            <div className={styles.stepNumber}>
              {currentStep > step.number ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div className={styles.stepTitle}>{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionSteps;