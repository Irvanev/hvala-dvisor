// src/pages/EditRestaurantPage/EditRestaurantPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import RestaurantForm from '../../components/Form/RestaurantForm';
import PhotoUploader from '../../pages/AddRestaurantPage/components/PhotoUploader';
import LocationPicker from '../../pages/AddRestaurantPage/components/LocationPicker';
import SubmissionSteps from '../../pages/AddRestaurantPage/components/SubmissionSteps';
import styles from './EditRestaurantPage.module.css';
import { Restaurant, MenuItem } from '../../models/types';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { GeoPoint } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// Интерфейс данных формы (такой же как в AddRestaurantPage)
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
    existingPhotos: string[]; // Добавляем для хранения уже загруженных фото
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

// Пустое начальное состояние формы
const EMPTY_FORM_DATA: RestaurantFormData = {
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
    existingPhotos: [],
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

const EditRestaurantPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { currentUser, isModerator } = useAuth();
    const [originalRestaurant, setOriginalRestaurant] = useState<Restaurant | null>(null);
    const [formData, setFormData] = useState<RestaurantFormData>(EMPTY_FORM_DATA);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
    const formRef = useRef<HTMLDivElement>(null);
    const totalSteps = 4;

    // Загрузка данных ресторана при монтировании компонента
    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!restaurantId) {
                setError('Идентификатор ресторана не указан');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const restaurantRef = doc(db, 'restaurants', restaurantId);
                const restaurantSnap = await getDoc(restaurantRef);

                if (!restaurantSnap.exists()) {
                    setError('Ресторан не найден');
                    setLoading(false);
                    return;
                }

                const restaurantData = { id: restaurantSnap.id, ...restaurantSnap.data() } as Restaurant;
                setOriginalRestaurant(restaurantData);

                // Проверяем права доступа
                if (!isModerator && restaurantData.ownerId !== currentUser?.uid) {
                    setError('У вас нет прав для редактирования этого ресторана');
                    setLoading(false);
                    return;
                }

                // Преобразуем данные ресторана в формат формы
                const formattedData: RestaurantFormData = {
                    name: restaurantData.title || '',
                    description: restaurantData.description || '',
                    cuisine: restaurantData.cuisineTags && restaurantData.cuisineTags.length > 0 ? restaurantData.cuisineTags[0] : '',
                    priceRange: restaurantData.priceRange === '$' ? '€' :
                        restaurantData.priceRange === '$$' ? '€€' :
                            restaurantData.priceRange === '$$$' ? '€€€' : '€€',
                    address: {
                        street: restaurantData.address?.street || '',
                        city: restaurantData.address?.city || '',
                        postalCode: restaurantData.address?.postalCode || '',
                        country: restaurantData.address?.country || ''
                    },
                    phoneNumber: restaurantData.contact?.phone || '',
                    website: restaurantData.contact?.website || '',
                    openingHours: restaurantData.openingHours || {
                        'Понедельник': { open: '09:00', close: '22:00', closed: false },
                        'Вторник': { open: '09:00', close: '22:00', closed: false },
                        'Среда': { open: '09:00', close: '22:00', closed: false },
                        'Четверг': { open: '09:00', close: '22:00', closed: false },
                        'Пятница': { open: '09:00', close: '23:00', closed: false },
                        'Суббота': { open: '09:00', close: '23:00', closed: false },
                        'Воскресенье': { open: '10:00', close: '21:00', closed: false }
                    },
                    features: restaurantData.featureTags || [],
                    photos: [],
                    existingPhotos: restaurantData.galleryUrls || [],
                    menuItems: [],
                    contactPerson: {
                        name: restaurantData.moderation?.contactPerson?.name || '',
                        email: restaurantData.moderation?.contactPerson?.email || '',
                        phone: restaurantData.moderation?.contactPerson?.phone || '',
                        isOwner: restaurantData.moderation?.contactPerson?.isOwner || false
                    },
                    position: restaurantData.location ? {
                        lat: restaurantData.location.latitude,
                        lng: restaurantData.location.longitude
                    } : null
                };

                // Преобразуем меню в формат формы
                if (restaurantData.menu && restaurantData.menu.length > 0) {
                    // Сгруппируем блюда по категориям
                    const menuByCategory: Record<string, any[]> = {};
                    restaurantData.menu.forEach(item => {
                        const category = item.category || 'Без категории';
                        if (!menuByCategory[category]) {
                            menuByCategory[category] = [];
                        }
                        menuByCategory[category].push({
                            name: item.name,
                            description: item.description || '',
                            price: item.price || ''
                        });
                    });

                    // Преобразуем группы в формат для формы
                    formattedData.menuItems = Object.entries(menuByCategory).map(([category, items]) => ({
                        category,
                        items
                    }));
                } else {
                    // Если меню нет, добавляем пустую категорию
                    formattedData.menuItems = [
                        {
                            category: 'Закуски',
                            items: [{ name: '', description: '', price: '' }]
                        }
                    ];
                }

                setFormData(formattedData);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке ресторана:', error);
                setError('Произошла ошибка при загрузке данных ресторана.');
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [restaurantId, currentUser, isModerator]);

    // Функции обработки формы (аналогичны AddRestaurantPage)
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
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

    const handleExistingPhotoRemove = (index: number) => {
        const photoUrl = formData.existingPhotos[index];
        const updatedExistingPhotos = [...formData.existingPhotos];
        updatedExistingPhotos.splice(index, 1);

        setFormData({ ...formData, existingPhotos: updatedExistingPhotos });
        setPhotosToDelete([...photosToDelete, photoUrl]);
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

    // Валидация для текущего шага
    const validateCurrentStep = (): boolean => {
        const newErrors: FormErrors = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors['name'] = 'Название ресторана обязательно';
            if (!formData.description.trim()) newErrors['description'] = 'Описание ресторана обязательно';
            if (!formData.cuisine.trim()) newErrors['cuisine'] = 'Укажите тип кухни';
            if (!formData.address.street.trim()) newErrors['address.street'] = 'Укажите улицу';
            if (!formData.address.city.trim()) newErrors['address.city'] = 'Укажите город';
            if (!formData.address.country.trim()) newErrors['address.country'] = 'Укажите страну';
            if (!formData.position) newErrors['position'] = 'Укажите местоположение на карте';
        } else if (currentStep === 2) {
            if (formData.photos.length === 0 && formData.existingPhotos.length === 0) {
                newErrors['photos'] = 'Должна быть хотя бы одна фотография';
            }
        } else if (currentStep === 3) {
            let hasMenuItems = false;
            for (const category of formData.menuItems) {
                if (category.category.trim() && category.items.some(item => item.name.trim())) {
                    hasMenuItems = true;
                    break;
                }
            }
            if (!hasMenuItems) newErrors['menuItems'] = 'Добавьте хотя бы одно блюдо в меню';
        } else if (currentStep === 4) {
            if (!formData.contactPerson.name.trim()) newErrors['contactPerson.name'] = 'Укажите имя контактного лица';
            if (!formData.contactPerson.email.trim()) {
                newErrors['contactPerson.email'] = 'Укажите email контактного лица';
            } else if (!/\S+@\S+\.\S+/.test(formData.contactPerson.email)) {
                newErrors['contactPerson.email'] = 'Некорректный формат email';
            }
            if (!formData.contactPerson.phone.trim()) newErrors['contactPerson.phone'] = 'Укажите телефон контактного лица';
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

    // Функция для преобразования данных формы в объект ресторана
    const transformFormDataToRestaurant = (): Partial<Restaurant> => {
        if (!originalRestaurant) return {};

        // Создаем GeoPoint для локации
        const geoPoint = formData.position
            ? new GeoPoint(formData.position.lat, formData.position.lng)
            : originalRestaurant.location;

        // Формируем адрес
        const address = {
            street: formData.address.street,
            city: formData.address.city,
            postalCode: formData.address.postalCode,
            country: formData.address.country
        };

        // Преобразуем меню
        const menu: MenuItem[] = [];
        formData.menuItems.forEach((category, catIndex) => {
            category.items.forEach((item, itemIndex) => {
                if (item.name.trim()) { // Добавляем только заполненные позиции
                    menu.push({
                        id: `${catIndex}-${itemIndex}`,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        // category: category.category
                    });
                }
            });
        });

        // Составляем объект контакта
        const contact = {
            phone: formData.phoneNumber,
            website: formData.website,
            social: originalRestaurant.contact?.social || {}
        };

        // Приводим priceRange к правильному формату
        let formattedPriceRange: '$' | '$$' | '$$$' | undefined;
        if (formData.priceRange === '€') formattedPriceRange = '$';
        else if (formData.priceRange === '€€') formattedPriceRange = '$$';
        else if (formData.priceRange === '€€€') formattedPriceRange = '$$$';

        // Собираем обновленный объект ресторана
        return {
            title: formData.name,
            description: formData.description,
            address: address,
            location: geoPoint,
            contact: contact,
            cuisineTags: formData.cuisine ? [formData.cuisine] : [],
            featureTags: formData.features,
            priceRange: formattedPriceRange,
            menu: menu,
            // Не меняем рейтинг и счетчики
            moderation: {
                ...originalRestaurant.moderation,
                contactPerson: {
                    name: formData.contactPerson.name,
                    email: formData.contactPerson.email,
                    phone: formData.contactPerson.phone,
                    isOwner: formData.contactPerson.isOwner
                }
            },
            // Галерея обновляется отдельно
        };
    };

    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCurrentStep() || !restaurantId || !originalRestaurant) return;

        setSubmitting(true);
        try {
            // 1. Загружаем новые фотографии в Storage
            const newPhotoUrls: string[] = [];

            for (const file of formData.photos) {
                const photoRef = ref(storage, `restaurants/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(photoRef, file);
                const url = await getDownloadURL(snapshot.ref);
                newPhotoUrls.push(url);
            }

            // 2. Удаляем фотографии, отмеченные для удаления
            for (const photoUrl of photosToDelete) {
                try {
                    // Извлекаем путь к файлу из URL
                    const urlPath = photoUrl.split('?')[0]; // Убираем параметры запроса
                    const pathSegments = urlPath.split('/');
                    const fileName = pathSegments[pathSegments.length - 1];
                    const decodedFileName = decodeURIComponent(fileName);

                    // Пытаемся сделать ссылку на файл в Storage
                    const photoRef = ref(storage, `restaurants/${decodedFileName}`);
                    await deleteObject(photoRef);
                } catch (error) {
                    console.error('Ошибка при удалении фото:', error);
                    // Продолжаем даже при ошибке удаления
                }
            }

            // 3. Преобразуем данные формы в модель Restaurant
            const restaurantData = transformFormDataToRestaurant();

            // 4. Объединяем существующие и новые фото
            const updatedGalleryUrls = [...formData.existingPhotos, ...newPhotoUrls];

            // 5. Обновляем главное фото, если нужно
            let mainImageUrl = originalRestaurant.mainImageUrl || '';
            if (updatedGalleryUrls.length > 0 && (!mainImageUrl || !updatedGalleryUrls.includes(mainImageUrl))) {
                mainImageUrl = updatedGalleryUrls[0]; // Первое фото становится главным
            }


            // 6. Обновляем в Firestore
            await updateDoc(doc(db, 'restaurants', restaurantId), {
                ...restaurantData,
                galleryUrls: updatedGalleryUrls,
                mainImageUrl: mainImageUrl,
                updatedAt: serverTimestamp()
            });

            // 7. Перенаправляем обратно на страницу модерации
            alert('Ресторан успешно обновлен!');
            navigate('/moderator');
        } catch (error) {
            console.error('Ошибка при обновлении ресторана:', error);
            let errorMessage = 'Произошла ошибка при сохранении данных.';

            if (error instanceof Error) {
                errorMessage += ` Детали: ${error.message}`;
            }

            setError(errorMessage);
            window.scrollTo(0, 0);
        } finally {
            setSubmitting(false);
        }
    };

    // Компонент для отображения существующих фотографий
    const ExistingPhotos = () => (
        <div className={styles.existingPhotosSection}>
            <h4 className={styles.subSectionTitle}>Текущие фотографии</h4>
            {formData.existingPhotos.length === 0 ? (
                <p>Нет загруженных фотографий</p>
            ) : (
                <div className={styles.photoGrid}>
                    {formData.existingPhotos.map((url, index) => (
                        <div key={`existing-${index}`} className={styles.photoItem}>
                            <div className={styles.photoPreview}>
                                <img src={url} alt={`Фото ${index + 1}`} />
                            </div>
                            <div className={styles.photoInfo}>
                                <span className={styles.photoName}>Фото {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => handleExistingPhotoRemove(index)}
                                    className={styles.removePhotoButton}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Загрузка данных ресторана...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    Вернуться назад
                </button>
            </div>
        );
    }

    return (
        <div className={styles.editRestaurantPage}>
            <NavBar
                onSearch={(query) => console.log(`Поиск: ${query}`)}
                // onLanguageChange={(language) => console.log(`Язык: ${language}`)}
                // currentLanguage="ru"
                logoText="HvalaDviser"
                onWelcomeClick={() => console.log('Клик на Welcome')}
                isStatic={true}
            />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>Редактирование ресторана</h1>
                    <p className={styles.pageDescription}>
                        Внесите необходимые изменения в информацию о ресторане.
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
                                    <h2 className={styles.stepTitle}>Основная информация</h2>
                                    <RestaurantForm
                                        formData={formData}
                                        errors={errors}
                                        onInputChange={handleInputChange}
                                        onCheckboxChange={handleCheckboxChange}
                                        isEdit={true}
                                    />
                                    <LocationPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialPosition={formData.position}
                                        error={errors['position']}
                                        isEdit={true}
                                    />
                                </div>
                            )}

                            {/* Шаг 2: Фотографии и особенности */}
                            {currentStep === 2 && (
                                <div className={styles.formStep}>
                                    <h2 className={styles.stepTitle}>Фотографии и особенности</h2>

                                    {/* Отображаем существующие фотографии */}
                                    <ExistingPhotos />

                                    {/* Загрузка новых фотографий */}
                                    <PhotoUploader
                                        photos={formData.photos}
                                        onPhotoUpload={handlePhotoUpload}
                                        onPhotoRemove={handlePhotoRemove}
                                        error={errors['photos']}
                                        isEdit={true}
                                    />

                                    <div className={styles.featuresSection}>
                                        <h3 className={styles.sectionTitle}>Особенности ресторана</h3>
                                        <div className={styles.sectionDescription}>
                                            <p>Выберите особенности, которые характеризуют ресторан:</p>
                                        </div>
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
                                            Отредактируйте категории и блюда меню:
                                        </p>
                                        {errors['menuItems'] && (
                                            <div className={`${styles.errorMessage} error-message`}>
                                                {errors['menuItems']}
                                            </div>
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
                                            Укажите контактную информацию для связи:
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
                                                    <div className={`${styles.errorMessage} error-message`}>
                                                        {errors['contactPerson.name']}
                                                    </div>
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
                                                    <div className={`${styles.errorMessage} error-message`}>
                                                        {errors['contactPerson.email']}
                                                    </div>
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
                                                    Контактное лицо является владельцем/представителем ресторана
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.navigationButtons}>
                                {currentStep > 1 && (
                                    <button type="button" className={styles.prevButton} onClick={handlePrevStep}>
                                        Назад
                                    </button>
                                )}
                                {currentStep < totalSteps ? (
                                    <button type="button" className={styles.nextButton} onClick={handleNextStep}>
                                        Далее
                                    </button>
                                ) : (
                                    <div className={styles.finalButtons}>
                                        <button
                                            type="button"
                                            className={styles.cancelButton}
                                            onClick={() => navigate('/moderator')}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EditRestaurantPage;