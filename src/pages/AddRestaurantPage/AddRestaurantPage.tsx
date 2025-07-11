import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantForm from '../../components/Form/RestaurantForm';
import PhotoUploader from '../../pages/AddRestaurantPage/components/PhotoUploader';
import LocationPicker from '../../pages/AddRestaurantPage/components/LocationPicker';
import SubmissionSteps from '../../pages/AddRestaurantPage/components/SubmissionSteps';
import SuccessModal from '../../pages/AddRestaurantPage/components/SuccessModal';
import styles from './AddRestaurantPage.module.css';
import { Restaurant, MenuItem } from '../../models/types';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GeoPoint } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

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
  position: { lat: number; lng: number } | null;
}

interface FormErrors {
  [key: string]: string;
}

const AddRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  
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
      [t('daysOfWeek.monday')]: { open: '09:00', close: '22:00', closed: false },
      [t('daysOfWeek.tuesday')]: { open: '09:00', close: '22:00', closed: false },
      [t('daysOfWeek.wednesday')]: { open: '09:00', close: '22:00', closed: false },
      [t('daysOfWeek.thursday')]: { open: '09:00', close: '22:00', closed: false },
      [t('daysOfWeek.friday')]: { open: '09:00', close: '23:00', closed: false },
      [t('daysOfWeek.saturday')]: { open: '09:00', close: '23:00', closed: false },
      [t('daysOfWeek.sunday')]: { open: '10:00', close: '21:00', closed: false }
    },
    features: [],
    photos: [],
    menuItems: [
      {
        category: t('addRestaurantPage.menu.categoryPlaceholder'),
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

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RestaurantFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;

  const featuresData = [
    { key: 'wifi', label: t('addRestaurantPage.features.wifi') },
    { key: 'terrace', label: t('addRestaurantPage.features.terrace') },
    { key: 'airConditioning', label: t('addRestaurantPage.features.airConditioning') },
    { key: 'parking', label: t('addRestaurantPage.features.parking') },
    { key: 'delivery', label: t('addRestaurantPage.features.delivery') },
    { key: 'reservation', label: t('addRestaurantPage.features.reservation') },
    { key: 'liveMusic', label: t('addRestaurantPage.features.liveMusic') },
    { key: 'veganMenu', label: t('addRestaurantPage.features.veganMenu') },
    { key: 'playground', label: t('addRestaurantPage.features.playground') },
    { key: 'sportsViewing', label: t('addRestaurantPage.features.sportsViewing') },
    { key: 'cashless', label: t('addRestaurantPage.features.cashless') },
    { key: 'seaView', label: t('addRestaurantPage.features.seaView') },
    { key: 'largeGroups', label: t('addRestaurantPage.features.largeGroups') },
    { key: 'romantic', label: t('addRestaurantPage.features.romantic') },
    { key: 'wineList', label: t('addRestaurantPage.features.wineList') }
  ];

  const daysData = [
    { key: 'monday', label: t('daysOfWeek.monday') },
    { key: 'tuesday', label: t('daysOfWeek.tuesday') },
    { key: 'wednesday', label: t('daysOfWeek.wednesday') },
    { key: 'thursday', label: t('daysOfWeek.thursday') },
    { key: 'friday', label: t('daysOfWeek.friday') },
    { key: 'saturday', label: t('daysOfWeek.saturday') },
    { key: 'sunday', label: t('daysOfWeek.sunday') }
  ];

  const handleContactPersonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    
    const updatedContactPerson = {
      ...formData.contactPerson,
      [child]: value
    };
    
    if (child === 'phone' && formData.contactPerson.isOwner) {
      setFormData({
        ...formData,
        phoneNumber: value,
        contactPerson: updatedContactPerson
      });
    } else {
      setFormData({
        ...formData,
        contactPerson: updatedContactPerson
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactPerson.')) {
      handleContactPersonChange(e);
      return;
    }
    
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
      if (name === 'phoneNumber' || name === 'website') {
        if (value.trim() && formData.contactPerson.isOwner) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            contactPerson: {
              ...prev.contactPerson,
              isOwner: false
            }
          }));
        } else {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }

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
        if (index !== -1) updatedFeatures.splice(index, 1);
      }
      setFormData({ ...formData, features: updatedFeatures });
    } else if (name.includes('openingHours')) {
      const [parent, day, field] = name.split('.');
      setFormData({
        ...formData,
        openingHours: {
          ...formData.openingHours,
          [day]: { ...formData.openingHours[day], [field]: checked }
        }
      });
    } else if (name === 'contactPerson.isOwner') {
      if (checked) {
        setFormData({
          ...formData,
          phoneNumber: formData.contactPerson.phone,
          website: formData.website,
          contactPerson: {
            ...formData.contactPerson,
            isOwner: true
          }
        });
      } else {
        setFormData({
          ...formData,
          contactPerson: {
            ...formData.contactPerson,
            isOwner: false
          }
        });
      }
    } else {
      setFormData({ ...formData, [name]: checked });
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
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleAddMenuItem = (categoryIndex: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items.push({ name: '', description: '', price: '' });
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleRemoveMenuItem = (categoryIndex: number, itemIndex: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleAddCategory = () => {
    setFormData({
      ...formData,
      menuItems: [
        ...formData.menuItems,
        { category: '', items: [{ name: '', description: '', price: '' }] }
      ]
    });
  };

  const handleRemoveCategory = (index: number) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems.splice(index, 1);
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleMenuItemChange = (categoryIndex: number, itemIndex: number, field: string, value: string) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[categoryIndex].items[itemIndex] = {
      ...updatedMenuItems[categoryIndex].items[itemIndex],
      [field]: value
    };
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleCategoryNameChange = (index: number, value: string) => {
    const updatedMenuItems = [...formData.menuItems];
    updatedMenuItems[index].category = value;
    setFormData({ ...formData, menuItems: updatedMenuItems });
  };

  const handleLocationSelect = (position: { lat: number; lng: number }) => {
    setFormData({ ...formData, position: position });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors['name'] = t('addRestaurantPage.validation.nameRequired');
      if (!formData.description.trim()) newErrors['description'] = t('addRestaurantPage.validation.descriptionRequired');
      if (!formData.cuisine.trim()) newErrors['cuisine'] = t('addRestaurantPage.validation.cuisineRequired');
      if (!formData.address.street.trim()) newErrors['address.street'] = t('addRestaurantPage.validation.streetRequired');
      if (!formData.address.city.trim()) newErrors['address.city'] = t('addRestaurantPage.validation.cityRequired');
      if (!formData.address.country.trim()) newErrors['address.country'] = t('addRestaurantPage.validation.countryRequired');
      if (!formData.position) newErrors['position'] = t('addRestaurantPage.validation.positionRequired');
    } else if (currentStep === 2) {
      if (formData.photos.length === 0) newErrors['photos'] = t('addRestaurantPage.validation.photosRequired');
    } else if (currentStep === 3) {
      // УБРАНА ВАЛИДАЦИЯ МЕНЮ
    } else if (currentStep === 4) {
      if (!formData.contactPerson.name.trim()) newErrors['contactPerson.name'] = t('addRestaurantPage.validation.contactNameRequired');
      if (!formData.contactPerson.email.trim()) {
        newErrors['contactPerson.email'] = t('addRestaurantPage.validation.contactEmailRequired');
      } else if (!/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
        newErrors['contactPerson.email'] = t('addRestaurantPage.validation.contactEmailInvalid');
      }
      if (!formData.contactPerson.phone.trim()) newErrors['contactPerson.phone'] = t('addRestaurantPage.validation.contactPhoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      window.scrollTo(0, 0);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
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

  const transformFormDataToRestaurant = (data: RestaurantFormData): Partial<Restaurant> => {
    const geoPoint = data.position
      ? new GeoPoint(data.position.lat, data.position.lng)
      : new GeoPoint(0, 0);

    const address = {
      street: data.address.street,
      city: data.address.city,
      postalCode: data.address.postalCode,
      country: data.address.country
    };

    const menu: MenuItem[] = [];
    data.menuItems.forEach((category, catIndex) => {
      category.items.forEach((item, itemIndex) => {
        if (item.name.trim()) {
          menu.push({
            id: `${catIndex}-${itemIndex}`,
            name: item.name,
            description: item.description,
            price: item.price,
            category: category.category
          });
        }
      });
    });

    const contact = {
      phone: data.phoneNumber,
      website: data.website,
      social: {}
    };

    let formattedPriceRange: '$' | '$$' | '$$$' | undefined;
    if (data.priceRange === '€') formattedPriceRange = '$';
    else if (data.priceRange === '€€') formattedPriceRange = '$$';
    else if (data.priceRange === '€€€') formattedPriceRange = '$$$';

    return {
      title: data.name,
      description: data.description,
      address: address,
      location: geoPoint,
      contact: contact,
      cuisineTags: data.cuisine ? [data.cuisine] : [],
      featureTags: data.features,
      priceRange: formattedPriceRange,
      menu: menu,
      rating: 0,
      reviewsCount: 0,
      likesCount: 0,
      galleryUrls: [],
      moderation: {
        status: 'pending',
        contactPerson: {
          name: data.contactPerson.name,
          email: data.contactPerson.email,
          phone: data.contactPerson.phone,
          isOwner: data.contactPerson.isOwner
        }
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (validateCurrentStep()) {
      setSubmitting(true);
      try {
        const galleryUrls: string[] = [];
        let mainImageUrl: string | undefined = undefined;
  
        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];
          const photoRef = ref(storage, `restaurants/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(photoRef, file);
          const url = await getDownloadURL(snapshot.ref);
  
          if (i === 0) mainImageUrl = url;
          galleryUrls.push(url);
        }
  
        const restaurantData = transformFormDataToRestaurant(formData);
  
        const restaurantToSave = {
          ...restaurantData,
          galleryUrls,
          mainImageUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ownerId: currentUser?.uid || "guest"
        };
  
        await addDoc(collection(db, 'restaurants'), restaurantToSave);
  
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Ошибка:', error);
        setErrors({
          general: t('addRestaurantPage.errors.savingError', { 
            message: error instanceof Error ? error.message : t('addRestaurantPage.errors.unknownError') 
          })
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className={styles.addRestaurantPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>{t('addRestaurantPage.title')}</h1>
          <p className={styles.pageDescription}>
            {t('addRestaurantPage.description')}
          </p>

          <SubmissionSteps currentStep={currentStep} totalSteps={totalSteps} />

          {errors.general && (
            <div className={`${styles.generalError} error-message`}>
              {errors.general}
            </div>
          )}

          <div className={styles.formContainer} ref={formRef}>
            <form onSubmit={handleSubmit}>
              {/* Шаг 1: Основная информация */}
              {currentStep === 1 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>{t('addRestaurantPage.steps.basicInfo')}</h2>
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
                  <h2 className={styles.stepTitle}>{t('addRestaurantPage.steps.photosAndFeatures')}</h2>
                  <PhotoUploader
                    photos={formData.photos}
                    onPhotoUpload={handlePhotoUpload}
                    onPhotoRemove={handlePhotoRemove}
                    error={errors['photos']}
                  />
                  <div className={styles.featuresSection}>
                    <h3 className={styles.sectionTitle}>{t('addRestaurantPage.features.title')}</h3>
                    <p className={styles.sectionDescription}>
                      {t('addRestaurantPage.features.description')}
                    </p>
                    <div className={styles.featuresGrid}>
                      {featuresData.map(feature => (
                        <div key={feature.key} className={styles.featureCheckbox}>
                          <input
                            type="checkbox"
                            id={`feature-${feature.key}`}
                            name="features"
                            value={feature.label}
                            checked={formData.features.includes(feature.label)}
                            onChange={handleCheckboxChange}
                          />
                          <label htmlFor={`feature-${feature.key}`}>{feature.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 3: Меню и часы работы */}
              {currentStep === 3 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>{t('addRestaurantPage.steps.menuAndHours')}</h2>
                  
                  <div className={styles.menuSection}>
                    <h3 className={styles.sectionTitle}>{t('addRestaurantPage.menu.title')}</h3>
                    <p className={styles.sectionDescription}>
                      {t('addRestaurantPage.menu.description')}
                    </p>
                    {formData.menuItems.map((category, categoryIndex) => (
                      <div key={categoryIndex} className={styles.menuCategory}>
                        <div className={styles.categoryHeader}>
                          <input
                            type="text"
                            placeholder={t('addRestaurantPage.menu.categoryPlaceholder')}
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
                            {t('addRestaurantPage.menu.removeCategory')}
                          </button>
                        </div>
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className={styles.menuItem}>
                            <div className={styles.menuItemRow}>
                              <div className={styles.menuItemField}>
                                <input
                                  type="text"
                                  placeholder={t('addRestaurantPage.menu.dishNamePlaceholder')}
                                  value={item.name}
                                  onChange={(e) => handleMenuItemChange(categoryIndex, itemIndex, 'name', e.target.value)}
                                  className={styles.menuItemInput}
                                />
                              </div>
                              <div className={styles.menuItemField}>
                                <input
                                  type="text"
                                  placeholder={t('addRestaurantPage.menu.pricePlaceholder')}
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
                                {t('addRestaurantPage.menu.removeItem')}
                              </button>
                            </div>
                            <textarea
                              placeholder={t('addRestaurantPage.menu.dishDescriptionPlaceholder')}
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
                          {t('addRestaurantPage.menu.addDish')}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className={styles.addCategoryButton}
                    >
                      {t('addRestaurantPage.menu.addCategory')}
                    </button>
                  </div>

                  <div className={styles.hoursSection}>
                    <h3 className={styles.sectionTitle}>{t('addRestaurantPage.openingHours.title')}</h3>
                    <div className={styles.openingHoursGrid}>
                      {daysData.map(day => {
                        const hours = formData.openingHours[day.label];
                        return (
                          <div key={day.key} className={styles.dayRow}>
                            <div className={styles.dayName}>{day.label}</div>
                            <div className={styles.dayHours}>
                              <div className={styles.closedCheckbox}>
                                <input
                                  type="checkbox"
                                  id={`closed-${day.key}`}
                                  name={`openingHours.${day.label}.closed`}
                                  checked={hours.closed}
                                  onChange={handleCheckboxChange}
                                />
                                <label htmlFor={`closed-${day.key}`}>{t('addRestaurantPage.openingHours.closed')}</label>
                              </div>
                              {!hours.closed && (
                                <div className={styles.timeInputs}>
                                  <input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => handleTimeChange(day.label, 'open', e.target.value)}
                                    className={styles.timeInput}
                                  />
                                  <span>–</span>
                                  <input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => handleTimeChange(day.label, 'close', e.target.value)}
                                    className={styles.timeInput}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 4: Контактная информация */}
              {currentStep === 4 && (
                <div className={styles.formStep}>
                  <h2 className={styles.stepTitle}>{t('addRestaurantPage.steps.contactInfo')}</h2>
                  <div className={styles.contactSection}>
                    <h3 className={styles.sectionTitle}>{t('addRestaurantPage.contactInfo.restaurantContacts')}</h3>
                    {formData.contactPerson.isOwner && (
                      <div className={styles.infoNote}>
                        <span>ℹ️</span>
                        <p>{t('addRestaurantPage.contactInfo.ownerNote')}</p>
                      </div>
                    )}
                    <div className={styles.inputGroup}>
                      <label htmlFor="phoneNumber">
                        {t('addRestaurantPage.contactInfo.phoneLabel')}
                        {formData.contactPerson.isOwner && (
                          <span className={styles.autoFilled}> ({t('addRestaurantPage.contactInfo.autoFilled')})</span>
                        )}
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder={t('addRestaurantPage.contactInfo.phoneContactPlaceholder')}
                        className={formData.contactPerson.isOwner ? styles.autoFilledInput : ''}
                        style={{
                          backgroundColor: formData.contactPerson.isOwner ? '#f0f9f0' : 'white',
                          borderColor: formData.contactPerson.isOwner ? '#4CAF50' : '#e4e9f2'
                        }}
                      />
                      {!formData.contactPerson.isOwner && formData.phoneNumber && (
                        <div className={styles.helpText}>
                          <span>💡</span>
                          <small>{t('addRestaurantPage.contactInfo.helpText')}</small>
                        </div>
                      )}
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="website">{t('addRestaurantPage.contactInfo.websiteLabel')}</label>
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
                    <h3 className={styles.sectionTitle}>{t('addRestaurantPage.contactInfo.contactPerson')}</h3>
                    <p className={styles.sectionDescription}>
                      {t('addRestaurantPage.contactInfo.contactDescription')}
                    </p>
                    <div className={styles.contactPersonForm}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.name">{t('addRestaurantPage.contactInfo.nameLabel')}</label>
                        <input
                          type="text"
                          id="contactPerson.name"
                          name="contactPerson.name"
                          value={formData.contactPerson.name}
                          onChange={handleInputChange}
                          placeholder={t('addRestaurantPage.contactInfo.namePlaceholder')}
                          className={errors['contactPerson.name'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.name'] && (
                          <div className={`${styles.errorMessage} error-message`}>
                            {errors['contactPerson.name']}
                          </div>
                        )}
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.email">{t('addRestaurantPage.contactInfo.emailLabel')}</label>
                        <input
                          type="email"
                          id="contactPerson.email"
                          name="contactPerson.email"
                          value={formData.contactPerson.email}
                          onChange={handleInputChange}
                          placeholder={t('addRestaurantPage.contactInfo.emailPlaceholder')}
                          className={errors['contactPerson.email'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.email'] && (
                          <div className={`${styles.errorMessage} error-message`}>
                            {errors['contactPerson.email']}
                          </div>
                        )}
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="contactPerson.phone">{t('addRestaurantPage.contactInfo.phoneContactLabel')}</label>
                        <input
                          type="tel"
                          id="contactPerson.phone"
                          name="contactPerson.phone"
                          value={formData.contactPerson.phone}
                          onChange={handleInputChange}
                          placeholder={t('addRestaurantPage.contactInfo.phoneContactPlaceholder')}
                          className={errors['contactPerson.phone'] ? styles.inputError : ''}
                        />
                        {errors['contactPerson.phone'] && (
                          <div className={`${styles.errorMessage} error-message`}>
                            {errors['contactPerson.phone']}
                          </div>
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
                          {t('addRestaurantPage.contactInfo.isOwner')}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className={styles.termsAgreement}>
                    <p>
                      {t('addRestaurantPage.contactInfo.termsAgreement')}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.navigationButtons}>
                {currentStep > 1 && (
                  <button type="button" className={styles.prevButton} onClick={handlePrevStep}>
                    {t('addRestaurantPage.navigationButtons.back')}
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" className={styles.nextButton} onClick={handleNextStep}>
                    {t('addRestaurantPage.navigationButtons.next')}
                  </button>
                ) : (
                  <button type="submit" className={styles.submitButton} disabled={submitting}>
                    {submitting ? t('addRestaurantPage.navigationButtons.submitting') : t('addRestaurantPage.navigationButtons.submit')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      {showSuccessModal && <SuccessModal onClose={handleDone} />}
    </div>
  );
};

export default AddRestaurantPage;