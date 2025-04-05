import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantForm from '../../components/Form/RestaurantForm';
import PhotoUploader from '../../pages/AddRestaurantPage/components/PhotoUploader';
import LocationPicker from '../../pages/AddRestaurantPage/components/LocationPicker';
import SubmissionSteps from '../../pages/AddRestaurantPage/components/SubmissionSteps';
import SuccessModal from '../../pages/AddRestaurantPage/components/SuccessModal';
import styles from './AddRestaurantPage.module.css';

interface RestaurantFormData {
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
  phoneNumber: string;
  website: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    }
  };
  features: string[];
  photos: File[];
  menuItems: {
    category: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
    }>;
  }[];
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    isOwner: boolean;
  };
  position: {
    lat: number;
    lng: number;
  } | null;
}

const INITIAL_FORM_DATA: RestaurantFormData = {
  name: '',
  description: '',
  cuisine: '',
  priceRange: '€€',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: ''
  },
  phoneNumber: '',
  website: '',
  openingHours: {
    'Понедельник': { open: '09:00', close: '22:00', closed: false },
    'Вторник': { open: '09:00', close: '22:00', closed: false },
    'Среда': { open: '09:00', close: '22:00', closed: false },
    'Четверг': { open: '09:00', close: '22:00', closed: false },
    'Пятница': { open: '09:00', close: '23:00', closed: false },
    'Суббота': { open: '09:00', close: '23:00', closed: false },
    'Воскресенье': { open: '10:00', close: '21:00', closed: false }
  },
  features: [],
  photos: [],
  menuItems: [
    {
      category: 'Закуски',
      items: [{ name: '', description: '', price: '' }]
    }
  ],
  contactPerson: {
    name: '',
    email: '',
    phone: '',
    isOwner: false
  },
  position: null
};

interface FormErrors {
  [key: string]: string;
}

const AddRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RestaurantFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Обработка вложенных полей через точечную нотацию (например, address.city)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
    setFormData({
      ...formData,
      [parent]: {
        ...(formData[parent as keyof RestaurantFormData] as Record<string, any>),
        [child]: value
      }
    });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    
    if (name === 'features') {
      const updatedFeatures = [...formData.features];
      
      if (checked) {
        updatedFeatures.push(value);
      } else {
        const index = updatedFeatures.indexOf(value);
        if (index !== -1) {
          updatedFeatures.splice(index, 1);
        }
      }
      
      setFormData({
        ...formData,
        features: updatedFeatures
      });
    } else if (name.includes('openingHours')) {
      // Например, openingHours.Понедельник.closed
      const [parent, day, field] = name.split('.');
      
      setFormData({
        ...formData,
        openingHours: {
          ...formData.openingHours,
          [day]: {
            ...formData.openingHours[day],
            [field]: checked
          }
        }
      });
    } else if (name === 'contactPerson.isOwner') {
      setFormData({
        ...formData,
        contactPerson: {
          ...formData.contactPerson,
          isOwner: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked
      });
    }
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [type]: value
        }
      }
    });
  };

  const handlePhotoUpload = (files: File[]) => {
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files]
    });
  };

  const handlePhotoRemove = (index: number) => {
    const updatedPhotos = [...formData.photos];
    updatedPhotos.splice(index, 1);
    
    setFormData({
      ...formData,
      photos: updatedPhotos
    });
  };

  const handleAddMenuItem = (categoryIndex: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items.push({ name: '', description: '', price: '' });
    
    setFormData({
      ...formData,
      menuItems: updatedMenuItems
    });
  };

  const handleRemoveMenuItem = (categoryIndex: number, itemIndex: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items.splice(itemIndex, 1);
    
    setFormData({
      ...formData,
      menuItems: updatedMenuItems
    });
  };

  const handleAddCategory = () => {
    setFormData({
      ...formData,
      menuItems: [
        ...formData.menuItems,
        {
          category: '',
          items: [{ name: '', description: '', price: '' }]
        }
      ]
    });
  };

  const handleRemoveCategory = (index: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems.splice(index, 1);
    
    setFormData({
      ...formData,
      menuItems: updatedMenuItems
    });
  };

  const handleMenuItemChange = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items[itemIndex] = {
      ...updatedMenuItems[categoryIndex].items[itemIndex],
      [field]: value
    };
    
    setFormData({
      ...formData,
      menuItems: updatedMenuItems
    });
  };

  const handleCategoryNameChange = (index: number, value: string) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[index].category = value;
    
    setFormData({
      ...formData,
      menuItems: updatedMenuItems
    });
  };

  const handleLocationSelect = (position: { lat: number; lng: number }) => {
    setFormData({
      ...formData,
      position
    });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Валидация для первого шага (основная информация)
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors['name'] = 'Название ресторана обязательно';
      if (!formData.description.trim()) newErrors['description'] = 'Описание ресторана обязательно';
      if (!formData.cuisine.trim()) newErrors['cuisine'] = 'Выберите тип кухни';
      if (!formData.address.street.trim()) newErrors['address.street'] = 'Укажите улицу';
      if (!formData.address.city.trim()) newErrors['address.city'] = 'Укажите город';
      if (!formData.address.country.trim()) newErrors['address.country'] = 'Укажите страну';
      if (!formData.position) newErrors['position'] = 'Укажите местоположение на карте';
    }
    
    // Валидация для второго шага (фотографии и особенности)
    else if (currentStep === 2) {
      if (formData.photos.length === 0) {
        newErrors['photos'] = 'Загрузите хотя бы одну фотографию';
      }
    }
    
    // Валидация для третьего шага (меню и часы работы)
    else if (currentStep === 3) {
      let hasMenuItems = false;
      
      for (const category of formData.menuItems) {
        if (category.category.trim() && category.items.some(item => item.name.trim())) {
          hasMenuItems = true;
          break;
        }
      }
      
      if (!hasMenuItems) {
        newErrors['menuItems'] = 'Добавьте хотя бы одно блюдо в меню';
      }
    }
    
    // Валидация для четвертого шага (контактная информация)
    else if (currentStep === 4) {
      if (!formData.contactPerson.name.trim()) {
        newErrors['contactPerson.name'] = 'Укажите имя контактного лица';
      }
      if (!formData.contactPerson.email.trim()) {
        newErrors['contactPerson.email'] = 'Укажите email контактного лица';
      } else if (!/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
        newErrors['contactPerson.email'] = 'Некорректный формат email';
      }
      if (!formData.contactPerson.phone.trim()) {
        newErrors['contactPerson.phone'] = 'Укажите телефон контактного лица';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      window.scrollTo(0, 0);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      // Прокрутка к первой ошибке
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.error-message');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handlePrevStep = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
      setSubmitting(true);
      
      try {
        // Имитация отправки данных на сервер
        console.log('Отправка данных о ресторане:', formData);
        
        // Имитация задержки запроса
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        setErrors({
          ...errors,
          general: 'Произошла ошибка при отправке данных. Пожалуйста, попробуйте позже.'
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigate('/'); // Перенаправление на главную страницу
  };

  return (
    <div className={styles.addRestaurantPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Добавить ресторан</h1>
          <p className={styles.pageDescription}>
            Заполните информацию о ресторане, который вы хотите добавить в нашу базу данных. 
            После проверки модераторами, ресторан будет опубликован на сайте.
          </p>
          
          <SubmissionSteps currentStep={currentStep} totalSteps={totalSteps} />

          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          <div className={styles.formContainer} ref={formRef}>
            <form onSubmit={handleSubmit}>
              {/* Шаг 1: Основная информация */}
              {currentStep === 1 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>Основная информация</h2>
                  
                  <RestaurantForm
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                    onCheckboxChange={handleCheckboxChange}
                  />
                  
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={formData.position}
                    error={errors['position']}
                  />
                </div>
              )}

              {/* Шаг 2: Фотографии и особенности */}
              {currentStep === 2 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>Фотографии и особенности</h2>
                  
                  <PhotoUploader
                    photos={formData.photos}
                    onPhotoUpload={handlePhotoUpload}
                    onPhotoRemove={handlePhotoRemove}
                    error={errors['photos']}
                  />
                  
                  <div className={styles.featuresSection}>
                    <h3 className={styles.sectionTitle}>Особенности ресторана</h3>
                    <p className={styles.sectionDescription}>
                      Выберите особенности, которые характеризуют ваш ресторан:
                    </p>
                    
                    <div className={styles.featuresGrid}>
                      {['Wi-Fi', 'Терраса', 'Кондиционер', 'Парковка', 'Доставка', 'Бронирование', 
                        'Живая музыка', 'Веганское меню', 'Детская площадка', 'Просмотр спортивных трансляций',
                        'Безналичный расчет', 'Вид на море', 'Подходит для больших групп', 'Романтическая атмосфера',
                        'Винная карта'].map(feature => (
                        <div key={feature} className={styles.featureCheckbox}>
                          <input
                            type="checkbox"
                            id={`feature-${feature}`}
                            name="features"
                            value={feature}
                            checked={formData.features.includes(feature)}
                            onChange={handleCheckboxChange}
                          />
                          <label htmlFor={`feature-${feature}`}>{feature}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 3: Меню и часы работы */}
              {currentStep === 3 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>Меню и часы работы</h2>
                  
                  <div className={styles.menuSection}>
                    <h3 className={styles.sectionTitle}>Меню ресторана</h3>
                    <p className={styles.sectionDescription}>
                      Добавьте категории и блюда вашего меню:
                    </p>
                    
                    {errors['menuItems'] && (
                      <div className={`${styles.errorMessage} error-message`}>{errors['menuItems']}</div>
                    )}
                    
                    {formData.menuItems.map((category, categoryIndex) => (
                      <div key={categoryIndex} className={styles.menuCategory}>
                        <div className={styles.categoryHeader}>
                          <input
                            type="text"
                            placeholder="Название категории"
                            value={category.category}
                            onChange={(e) => handleCategoryNameChange(categoryIndex, e.target.value)}
                            className={styles.categoryInput}
                          />
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(categoryIndex)}
                            className={styles.removeButton}
                            disabled={formData.menuItems.length === 1}
                          >
                            Удалить категорию
                          </button>
                        </div>
                        
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className={styles.menuItem}>
                            <div className={styles.menuItemRow}>
                              <div className={styles.menuItemField}>
                                <input
                                  type="text"
                                  placeholder="Название блюда"
                                  value={item.name}
                                  onChange={(e) => handleMenuItemChange(categoryIndex, itemIndex, 'name', e.target.value)}
                                  className={styles.menuItemInput}
                                />
                              </div>
                              
                              <div className={styles.menuItemField}>
                                <input
                                  type="text"
                                  placeholder="Цена"
                                  value={item.price}
                                  onChange={(e) => handleMenuItemChange(categoryIndex, itemIndex, 'price', e.target.value)}
                                  className={styles.menuItemPriceInput}
                                />
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveMenuItem(categoryIndex, itemIndex)}
                                className={styles.removeButton}
                                disabled={category.items.length === 1}
                              >
                                ✕
                              </button>
                            </div>
                            
                            <textarea
                              placeholder="Описание блюда"
                              value={item.description}
                              onChange={(e) => handleMenuItemChange(categoryIndex, itemIndex, 'description', e.target.value)}
                              className={styles.menuItemDescription}
                              rows={2}
                            />
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => handleAddMenuItem(categoryIndex)}
                          className={styles.addButton}
                        >
                          + Добавить блюдо
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className={styles.addCategoryButton}
                    >
                      + Добавить категорию меню
                    </button>
                  </div>
                  
                  <div className={styles.hoursSection}>
                    <h3 className={styles.sectionTitle}>Часы работы</h3>
                    
                    <div className={styles.openingHoursGrid}>
                      {Object.entries(formData.openingHours).map(([day, hours]) => (
                        <div key={day} className={styles.dayRow}>
                          <div className={styles.dayName}>{day}</div>
                          
                          <div className={styles.dayHours}>
                            <div className={styles.closedCheckbox}>
                              <input
                                type="checkbox"
                                id={`closed-${day}`}
                                name={`openingHours.${day}.closed`}
                                checked={hours.closed}
                                onChange={handleCheckboxChange}
                              />
                              <label htmlFor={`closed-${day}`}>Закрыто</label>
                            </div>
                            
                            {!hours.closed && (
                              <div className={styles.timeInputs}>
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                  className={styles.timeInput}
                                />
                                <span>–</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                  className={styles.timeInput}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 4: Контактная информация */}
              {currentStep === 4 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>Контактная информация</h2>
                  
                  <div className={styles.contactSection}>
                    <h3 className={styles.sectionTitle}>Контактные данные ресторана</h3>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="phoneNumber">Телефон ресторана</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="website">Веб-сайт ресторана (если есть)</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.contactPersonSection}>
                    <h3 className={styles.sectionTitle}>Контактное лицо</h3>
                    <p className={styles.sectionDescription}>
                      Укажите контактную информацию для связи с вами по вопросам модерации:
                    </p>
                    
                    <div className={styles.contactPersonForm}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.name">Имя и фамилия *</label>
                        <input
                          type="text"
                          id="contactPerson.name"
                          name="contactPerson.name"
                          value={formData.contactPerson.name}
                          onChange={handleInputChange}
                          placeholder="Иван Иванов"
                          className={errors['contactPerson.name'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.name'] && (
                          <div className={`${styles.errorMessage} error-message`}>{errors['contactPerson.name']}</div>
                        )}
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.email">Email *</label>
                        <input
                          type="email"
                          id="contactPerson.email"
                          name="contactPerson.email"
                          value={formData.contactPerson.email}
                          onChange={handleInputChange}
                          placeholder="example@example.com"
                          className={errors['contactPerson.email'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.email'] && (
                          <div className={`${styles.errorMessage} error-message`}>{errors['contactPerson.email']}</div>
                        )}
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.phone">Телефон *</label>
                        <input
                          type="tel"
                          id="contactPerson.phone"
                          name="contactPerson.phone"
                          value={formData.contactPerson.phone}
                          onChange={handleInputChange}
                          placeholder="+7 (___) ___-__-__"
                          className={errors['contactPerson.phone'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.phone'] && (
                          <div className={`${styles.errorMessage} error-message`}>{errors['contactPerson.phone']}</div>
                        )}
                      </div>
                      
                      <div className={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          id="contactPerson.isOwner"
                          name="contactPerson.isOwner"
                          checked={formData.contactPerson.isOwner}
                          onChange={handleCheckboxChange}
                        />
                        <label htmlFor="contactPerson.isOwner">
                          Я являюсь владельцем/представителем ресторана
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.termsAgreement}>
                    <p>
                      Отправляя форму, вы соглашаетесь с <a href="/terms" target="_blank">условиями использования</a> и подтверждаете, 
                      что предоставленная информация является достоверной.
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.navigationButtons}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className={styles.prevButton}
                    onClick={handlePrevStep}
                  >
                    Назад
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    className={styles.nextButton}
                    onClick={handleNextStep}
                  >
                    Далее
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Отправка...' : 'Отправить на модерацию'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      {showSuccessModal && (
        <SuccessModal onClose={handleDone} />
      )}
    </div>
  );
};

export default AddRestaurantPage;