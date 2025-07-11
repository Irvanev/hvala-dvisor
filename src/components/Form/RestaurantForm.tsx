import React from 'react';
import { useTranslation } from 'react-i18next'; // Предполагаем использование react-i18next
import addStyles from '../../pages/AddRestaurantPage/AddRestaurantPage.module.css';
import editStyles from '../../pages/EditRestaurantPage/EditRestaurantPage.module.css';

interface RestaurantFormProps {
  formData: {
    name: string;
    description: string;
    cuisine: string;
    priceRange: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  errors: {
    [key: string]: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEdit?: boolean;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  isEdit = false
}) => {
  const { t } = useTranslation();
  
  // Выбираем нужный стиль в зависимости от контекста
  const styles = isEdit ? editStyles : addStyles;
  
  const cuisineOptions = [
    { key: 'balkan', value: 'Балканская' },
    { key: 'croatian', value: 'Хорватская' },
    { key: 'serbian', value: 'Сербская' },
    { key: 'bosnian', value: 'Боснийская' },
    { key: 'montenegrin', value: 'Черногорская' },
    { key: 'macedonian', value: 'Македонская' },
    { key: 'slovenian', value: 'Словенская' },
    { key: 'albanian', value: 'Албанская' },
    { key: 'greek', value: 'Греческая' },
    { key: 'bulgarian', value: 'Болгарская' },
    { key: 'romanian', value: 'Румынская' },
    { key: 'mediterranean', value: 'Средиземноморская' },
    { key: 'italian', value: 'Итальянская' },
    { key: 'international', value: 'Интернациональная' },
    { key: 'other', value: 'Другая' }
  ];

  const priceRangeOptions = [
    { key: 'budget', value: '€', label: '€ (Бюджетно)' },
    { key: 'moderate', value: '€€', label: '€€ (Умеренно)' },
    { key: 'expensive', value: '€€€', label: '€€€ (Дорого)' },
    { key: 'veryExpensive', value: '€€€€', label: '€€€€ (Очень дорого)' }
  ];

  const countryOptions = [
    { key: 'croatia', value: 'Хорватия' },
    { key: 'serbia', value: 'Сербия' },
    { key: 'montenegro', value: 'Черногория' },
    { key: 'bosnia', value: 'Босния и Герцеговина' },
    { key: 'slovenia', value: 'Словения' },
    { key: 'northMacedonia', value: 'Северная Македония' },
    { key: 'albania', value: 'Албания' },
    { key: 'greece', value: 'Греция' },
    { key: 'bulgaria', value: 'Болгария' },
    { key: 'romania', value: 'Румыния' }
  ];

  return (
    <div className={styles.basicInfoForm}>
      <div className={styles.formGroup}>
        <label htmlFor="name">{t('restaurantForm.labels.name')}</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder={t('restaurantForm.labels.namePlaceholder')}
          className={errors.name ? styles.inputError : ''}
        />
        {errors.name && <div className={`${styles.errorMessage} error-message`}>{errors.name}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">{t('restaurantForm.labels.description')}</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder={t('restaurantForm.labels.descriptionPlaceholder')}
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          rows={4}
        />
        {errors.description && <div className={`${styles.errorMessage} error-message`}>{errors.description}</div>}
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cuisine">{t('restaurantForm.labels.cuisine')}</label>
          <select
            id="cuisine"
            name="cuisine"
            value={formData.cuisine}
            onChange={onInputChange}
            className={errors.cuisine ? styles.inputError : ''}
          >
            <option value="" disabled>{t('restaurantForm.labels.cuisinePlaceholder')}</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine.key} value={cuisine.value}>
                {t(`restaurantForm.cuisineOptions.${cuisine.key}`)}
              </option>
            ))}
          </select>
          {errors.cuisine && <div className={`${styles.errorMessage} error-message`}>{errors.cuisine}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="priceRange">{t('restaurantForm.labels.priceRange')}</label>
          <select
            id="priceRange"
            name="priceRange"
            value={formData.priceRange}
            onChange={onInputChange}
          >
            {priceRangeOptions.map(option => (
              <option key={option.key} value={option.value}>
                {t(`restaurantForm.priceRangeOptions.${option.key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={styles.addressSection}>
        <h3 className={styles.subSectionTitle}>{t('restaurantForm.labels.addressSection')}</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="address.street">{t('restaurantForm.labels.street')}</label>
          <input
            type="text"
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={onInputChange}
            placeholder={t('restaurantForm.labels.streetPlaceholder')}
            className={errors['address.street'] ? styles.inputError : ''}
          />
          {errors['address.street'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.street']}</div>}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="address.city">{t('restaurantForm.labels.city')}</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={onInputChange}
              placeholder={t('restaurantForm.labels.cityPlaceholder')}
              className={errors['address.city'] ? styles.inputError : ''}
            />
            {errors['address.city'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.city']}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="address.postalCode">{t('restaurantForm.labels.postalCode')}</label>
            <input
              type="text"
              id="address.postalCode"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={onInputChange}
              placeholder={t('restaurantForm.labels.postalCodePlaceholder')}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="address.country">{t('restaurantForm.labels.country')}</label>
          <select
            id="address.country"
            name="address.country"
            value={formData.address.country}
            onChange={onInputChange}
            className={errors['address.country'] ? styles.inputError : ''}
          >
            <option value="" disabled>{t('restaurantForm.labels.countryPlaceholder')}</option>
            {countryOptions.map(country => (
              <option key={country.key} value={country.value}>
                {t(`restaurantForm.countryOptions.${country.key}`)}
              </option>
            ))}
          </select>
          {errors['address.country'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.country']}</div>}
        </div>
      </div>
    </div>
  );
};

export default RestaurantForm;