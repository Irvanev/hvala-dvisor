import React from 'react';
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
  isEdit?: boolean; // Новый параметр для выбора стилей
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  formData,
  errors,
  onInputChange,
  onCheckboxChange,
  isEdit = false // По умолчанию - режим добавления
}) => {
  // Выбираем нужный стиль в зависимости от контекста
  const styles = isEdit ? editStyles : addStyles;
  
  const cuisineOptions = [
    'Балканская',
    'Хорватская',
    'Сербская',
    'Боснийская',
    'Черногорская',
    'Македонская',
    'Словенская',
    'Албанская',
    'Греческая',
    'Болгарская',
    'Румынская',
    'Средиземноморская',
    'Итальянская',
    'Интернациональная',
    'Другая'
  ];

  const priceRangeOptions = [
    { value: '€', label: '€ (Бюджетно)' },
    { value: '€€', label: '€€ (Умеренно)' },
    { value: '€€€', label: '€€€ (Дорого)' },
    { value: '€€€€', label: '€€€€ (Очень дорого)' }
  ];

  return (
    <div className={styles.basicInfoForm}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Название ресторана *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Введите название ресторана"
          className={errors.name ? styles.inputError : ''}
        />
        {errors.name && <div className={`${styles.errorMessage} error-message`}>{errors.name}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">Описание ресторана *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Расскажите о ресторане, его концепции, атмосфере и кухне"
          className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
          rows={4}
        />
        {errors.description && <div className={`${styles.errorMessage} error-message`}>{errors.description}</div>}
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cuisine">Тип кухни *</label>
          <select
            id="cuisine"
            name="cuisine"
            value={formData.cuisine}
            onChange={onInputChange}
            className={errors.cuisine ? styles.inputError : ''}
          >
            <option value="" disabled>Выберите тип кухни</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
          {errors.cuisine && <div className={`${styles.errorMessage} error-message`}>{errors.cuisine}</div>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="priceRange">Ценовой диапазон</label>
          <select
            id="priceRange"
            name="priceRange"
            value={formData.priceRange}
            onChange={onInputChange}
          >
            {priceRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={styles.addressSection}>
        <h3 className={styles.subSectionTitle}>Адрес ресторана</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="address.street">Улица и номер дома *</label>
          <input
            type="text"
            id="address.street"
            name="address.street"
            value={formData.address.street}
            onChange={onInputChange}
            placeholder="Например: ул. Примерная, 123"
            className={errors['address.street'] ? styles.inputError : ''}
          />
          {errors['address.street'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.street']}</div>}
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="address.city">Город *</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={onInputChange}
              placeholder="Например: Дубровник"
              className={errors['address.city'] ? styles.inputError : ''}
            />
            {errors['address.city'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.city']}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="address.postalCode">Почтовый индекс</label>
            <input
              type="text"
              id="address.postalCode"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={onInputChange}
              placeholder="Например: 20000"
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="address.country">Страна *</label>
          <select
            id="address.country"
            name="address.country"
            value={formData.address.country}
            onChange={onInputChange}
            className={errors['address.country'] ? styles.inputError : ''}
          >
            <option value="" disabled>Выберите страну</option>
            <option value="Хорватия">Хорватия</option>
            <option value="Сербия">Сербия</option>
            <option value="Черногория">Черногория</option>
            <option value="Босния и Герцеговина">Босния и Герцеговина</option>
            <option value="Словения">Словения</option>
            <option value="Северная Македония">Северная Македония</option>
            <option value="Албания">Албания</option>
            <option value="Греция">Греция</option>
            <option value="Болгария">Болгария</option>
            <option value="Румыния">Румыния</option>
          </select>
          {errors['address.country'] && <div className={`${styles.errorMessage} error-message`}>{errors['address.country']}</div>}
        </div>
      </div>
    </div>
  );
};

export default RestaurantForm;