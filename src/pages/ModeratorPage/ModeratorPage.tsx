// src/pages/ModeratorPage/ModeratorPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import { firestore } from '../../firebase/config';
import styles from './ModeratorPage.module.css';
import { Restaurant } from '../../models/types';
import {
    moderateRestaurant,
    toggleRestaurantArchive,
    deleteRestaurant,
    updateRestaurantFields
} from '../../firebase/functions';

const ModeratorPage: React.FC = () => {
    const navigate = useNavigate();
    const { userRole, isModerator } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'archived'>('pending');
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [moderationComment, setModerationComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState('');

    // Проверяем, имеет ли пользователь доступ к странице модератора
    useEffect(() => {
        if (!isModerator) {
            navigate('/');
        }
    }, [isModerator, navigate]);

    // Загружаем список ресторанов в зависимости от активной вкладки
    // Модифицируйте функцию fetchRestaurants, добавив дополнительное логирование:
    // Упрощенный запрос для отладки
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            console.log("Загрузка ресторанов - отладочный режим");

            // Получаем ВСЕ рестораны без фильтрации для отладки
            const q = query(collection(firestore, 'restaurants'));

            const querySnapshot = await getDocs(q);
            console.log("Всего ресторанов в коллекции:", querySnapshot.size);

            const restaurantsData: Restaurant[] = [];
            let withModerationStatus = 0;
            let withoutModerationStatus = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Проверяем наличие полей moderation и status
                if (data.moderation && data.moderation.status) {
                    withModerationStatus++;
                    console.log(`Ресторан ${doc.id} имеет статус: ${data.moderation.status}`);

                    // Добавляем только если статус соответствует фильтру или если просматриваем архив
                    if (data.moderation.status === activeTab ||
                        (activeTab === 'archived' && data.isArchived === true)) {
                        restaurantsData.push({
                            id: doc.id,
                            ...data
                        } as Restaurant);
                    }
                } else {
                    withoutModerationStatus++;
                    console.log(`Ресторан ${doc.id} НЕ имеет поля moderation.status`);
                }
            });

            console.log("Статистика: с moderation.status:", withModerationStatus,
                "без moderation.status:", withoutModerationStatus);
            console.log("Отфильтровано ресторанов:", restaurantsData.length);

            setRestaurants(restaurantsData);
            setError(null);
        } catch (err) {
            console.error('Ошибка при загрузке ресторанов:', err);
            setError('Не удалось загрузить список ресторанов. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Загружаем рестораны при изменении активной вкладки
    useEffect(() => {
        fetchRestaurants();
    }, [activeTab]);

    // Обработчик выбора ресторана для просмотра деталей
    // При загрузке одного ресторана проверим всю структуру документа
    const handleRestaurantSelect = async (restaurant: Restaurant) => {
        try {
            setLoading(true);
            console.log("Загрузка ресторана с ID:", restaurant.id);

            // Получаем полные данные ресторана
            const restaurantDoc = await getDoc(doc(firestore, 'restaurants', restaurant.id));

            if (restaurantDoc.exists()) {
                const data = restaurantDoc.data();
                console.log("Полная структура ресторана:", JSON.stringify(data, null, 2));

                // Проверяем наличие поля moderation
                if (!data.moderation) {
                    console.warn("У ресторана отсутствует поле moderation!");
                }

                setSelectedRestaurant({
                    id: restaurantDoc.id,
                    ...data
                } as Restaurant);

                setModerationComment('');
            } else {
                console.error("Ресторан не найден в Firestore");
                setError('Ресторан не найден');
            }
        } catch (err) {
            console.error('Ошибка при загрузке данных ресторана:', err);
            setError('Не удалось загрузить данные ресторана. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Обработчик отправки решения о модерации
    const handleModerate = async (status: 'approved' | 'rejected') => {
        try {
            if (!selectedRestaurant) return;

            setIsSubmitting(true);

            await moderateRestaurant(
                selectedRestaurant.id,
                status,
                moderationComment
            );

            // Обновляем список ресторанов
            fetchRestaurants();

            // Закрываем детали ресторана
            setSelectedRestaurant(null);

            // Показываем сообщение об успешной модерации
            alert(`Ресторан ${status === 'approved' ? 'одобрен' : 'отклонен'}`);
        } catch (error) {
            setError('Не удалось изменить статус ресторана. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Обработчик архивирования/разархивирования ресторана
    const handleToggleArchive = async (isArchived: boolean) => {
        try {
            if (!selectedRestaurant) return;

            setIsSubmitting(true);

            await toggleRestaurantArchive(selectedRestaurant.id, isArchived);

            // Обновляем список ресторанов
            fetchRestaurants();

            // Закрываем детали ресторана
            setSelectedRestaurant(null);

            alert(isArchived ? 'Ресторан скрыт (перемещен в архив)' : 'Ресторан восстановлен из архива');
        } catch (error) {
            setError('Не удалось изменить статус архивации ресторана. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Обработчик удаления ресторана
    const handleDeleteRestaurant = async () => {
        try {
            if (!selectedRestaurant) return;

            // Проверяем корректность ввода подтверждения
            if (confirmDeleteText !== selectedRestaurant.title) {
                alert('Текст подтверждения не соответствует названию ресторана');
                return;
            }

            setIsSubmitting(true);

            await deleteRestaurant(selectedRestaurant.id);

            // Обновляем список ресторанов
            fetchRestaurants();

            // Закрываем модальное окно и детали ресторана
            setIsDeleteModalOpen(false);
            setSelectedRestaurant(null);
            setConfirmDeleteText('');

            alert(`Ресторан "${selectedRestaurant.title}" был удален`);
        } catch (error) {
            setError('Не удалось удалить ресторан. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Функция для форматирования даты
    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'Не указана';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.moderatorPage}>
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
                    <h1 className={styles.pageTitle}>Панель модератора</h1>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Табы для переключения между статусами ресторанов */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            На рассмотрении
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'approved' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('approved')}
                        >
                            Одобренные
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('rejected')}
                        >
                            Отклоненные
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'archived' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('archived')}
                        >
                            Архив
                        </button>
                    </div>

                    {/* Список ресторанов */}
                    <div className={styles.contentSection}>
                        {loading ? (
                            <div className={styles.loadingSpinner}>Загрузка...</div>
                        ) : restaurants.length === 0 ? (
                            <p className={styles.emptyMessage}>Рестораны не найдены</p>
                        ) : (
                            <div className={styles.restaurantsGrid}>
                                {restaurants.map((restaurant) => (
                                    <div
                                        key={restaurant.id}
                                        className={`${styles.restaurantCard} ${restaurant.isArchived ? styles.archivedCard : ''}`}
                                        onClick={() => handleRestaurantSelect(restaurant)}
                                    >
                                        <div className={styles.restaurantImageWrapper}>
                                            <img
                                                src={restaurant.mainImageUrl || 'https://placehold.jp/300x200.png'}
                                                alt={restaurant.title}
                                                className={styles.restaurantImage}
                                            />
                                            {restaurant.isArchived && (
                                                <div className={styles.archivedBadge}>Архив</div>
                                            )}
                                        </div>
                                        <div className={styles.restaurantInfo}>
                                            <h3 className={styles.restaurantTitle}>{restaurant.title}</h3>
                                            <p className={styles.restaurantAddress}>
                                                {restaurant.address?.city}, {restaurant.address?.street}
                                            </p>
                                            <p className={styles.restaurantDate}>
                                                Дата добавления: {formatDate(restaurant.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Модальное окно с деталями ресторана */}
                    {selectedRestaurant && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>
                                        {selectedRestaurant.title}
                                        {selectedRestaurant.isArchived && <span className={styles.archivedTag}> (В архиве)</span>}
                                    </h2>
                                    <button
                                        className={styles.closeButton}
                                        onClick={() => setSelectedRestaurant(null)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.restaurantDetails}>
                                        <div className={styles.imageGallery}>
                                            {selectedRestaurant.galleryUrls?.map((url, index) => (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt={`${selectedRestaurant.title} - фото ${index + 1}`}
                                                    className={styles.galleryImage}
                                                />
                                            ))}
                                        </div>

                                        <div className={styles.infoSection}>
                                            <h3>Основная информация</h3>
                                            <p><strong>Название:</strong> {selectedRestaurant.title}</p>
                                            <p><strong>Описание:</strong> {selectedRestaurant.description}</p>
                                            <p><strong>Адрес:</strong> {selectedRestaurant.address?.country}, {selectedRestaurant.address?.city}, {selectedRestaurant.address?.street}</p>
                                            <p><strong>Кухня:</strong> {selectedRestaurant.cuisineTags?.join(', ')}</p>
                                            <p><strong>Ценовая категория:</strong> {selectedRestaurant.priceRange}</p>
                                        </div>

                                        <div className={styles.infoSection}>
                                            <h3>Контактная информация</h3>
                                            <p><strong>Телефон:</strong> {selectedRestaurant.contact?.phone}</p>
                                            <p><strong>Сайт:</strong> {selectedRestaurant.contact?.website}</p>
                                            {selectedRestaurant.moderation?.contactPerson && (
                                                <>
                                                    <p><strong>Контактное лицо:</strong> {selectedRestaurant.moderation.contactPerson.name}</p>
                                                    <p><strong>Email:</strong> {selectedRestaurant.moderation.contactPerson.email}</p>
                                                    <p><strong>Телефон:</strong> {selectedRestaurant.moderation.contactPerson.phone}</p>
                                                </>
                                            )}
                                        </div>

                                        <div className={styles.infoSection}>
                                            <h3>Особенности</h3>
                                            <div className={styles.tagsList}>
                                                {selectedRestaurant.featureTags?.map((tag, index) => (
                                                    <span key={index} className={styles.tag}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.infoSection}>
                                            <h3>Меню</h3>
                                            {selectedRestaurant.menu ? (
                                                <div className={styles.menuList}>
                                                    {Array.from(new Set(selectedRestaurant.menu.map(item => item.category || 'Без категории'))).map((category) => (
                                                        <div key={category} className={styles.menuCategory}>
                                                            <h4>{category}</h4>
                                                            <ul>
                                                                {selectedRestaurant.menu
                                                                    ?.filter(item => (item.category || 'Без категории') === category)
                                                                    .map((item, index) => (
                                                                        <li key={index} className={styles.menuItem}>
                                                                            <span className={styles.menuItemName}>{item.name}</span>
                                                                            <span className={styles.menuItemDescription}>{item.description}</span>
                                                                            <span className={styles.menuItemPrice}>{item.price}</span>
                                                                        </li>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>Меню не заполнено</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Действия модератора */}
                                    <div className={styles.moderationSection}>
                                        <h3>Действия модератора</h3>

                                        {/* Комментарий для модерации (опционально) */}
                                        <div className={styles.commentField}>
                                            <label htmlFor="moderation-comment">Комментарий (опционально):</label>
                                            <textarea
                                                id="moderation-comment"
                                                value={moderationComment}
                                                onChange={(e) => setModerationComment(e.target.value)}
                                                placeholder="Укажите причину отклонения или другие комментарии"
                                                rows={4}
                                                className={styles.commentTextarea}
                                            />
                                        </div>

                                        {/* Действия для ресторанов на рассмотрении */}
                                        {activeTab === 'pending' && (
                                            <div className={styles.moderationActions}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => navigate(`/edit-restaurant/${selectedRestaurant.id}`)}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleModerate('approved')}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Обработка...' : 'Одобрить'}
                                                </button>
                                                <button
                                                    className={styles.rejectButton}
                                                    onClick={() => handleModerate('rejected')}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Обработка...' : 'Отклонить'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Действия для одобренных ресторанов */}
                                        {(activeTab === 'approved' || activeTab === 'rejected') && (
                                            <div className={styles.moderationActions}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => navigate(`/edit-restaurant/${selectedRestaurant.id}`)}
                                                >
                                                    Редактировать
                                                </button>
                                                {selectedRestaurant.isArchived ? (
                                                    <button
                                                        className={styles.restoreButton}
                                                        onClick={() => handleToggleArchive(false)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Обработка...' : 'Восстановить из архива'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={styles.archiveButton}
                                                        onClick={() => handleToggleArchive(true)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Обработка...' : 'Скрыть (в архив)'}
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Обработка...' : 'Удалить'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Действия для архивированных ресторанов */}
                                        {activeTab === 'archived' && (
                                            <div className={styles.moderationActions}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => navigate(`/edit-restaurant/${selectedRestaurant.id}`)}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className={styles.restoreButton}
                                                    onClick={() => handleToggleArchive(false)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Обработка...' : 'Восстановить из архива'}
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Обработка...' : 'Удалить'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Модальное окно подтверждения удаления */}
                    {isDeleteModalOpen && selectedRestaurant && (
                        <div className={styles.modalOverlay}>
                            <div className={`${styles.modal} ${styles.deleteModal}`}>
                                <div className={styles.modalHeader}>
                                    <h2 className={`${styles.modalTitle} ${styles.deleteTitle}`}>Удаление ресторана</h2>
                                    <button
                                        className={styles.closeButton}
                                        onClick={() => {
                                            setIsDeleteModalOpen(false);
                                            setConfirmDeleteText('');
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className={styles.modalBody}>
                                    <div className={styles.deleteWarning}>
                                        <p>Вы собираетесь <strong>полностью удалить</strong> ресторан "{selectedRestaurant.title}".</p>
                                        <p>Это действие <strong>невозможно отменить</strong>. Все данные ресторана будут безвозвратно удалены.</p>
                                        <p>Если вы хотите только временно скрыть ресторан, используйте функцию "Скрыть (в архив)".</p>
                                    </div>

                                    <div className={styles.confirmField}>
                                        <label htmlFor="confirm-delete">Для подтверждения введите название ресторана:</label>
                                        <input
                                            id="confirm-delete"
                                            type="text"
                                            className={styles.confirmInput}
                                            value={confirmDeleteText}
                                            onChange={(e) => setConfirmDeleteText(e.target.value)}
                                            placeholder={selectedRestaurant.title}
                                        />
                                    </div>

                                    <div className={styles.deleteActions}>
                                        <button
                                            className={styles.cancelButton}
                                            onClick={() => {
                                                setIsDeleteModalOpen(false);
                                                setConfirmDeleteText('');
                                            }}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            className={styles.confirmedDeleteButton}
                                            onClick={handleDeleteRestaurant}
                                            disabled={confirmDeleteText !== selectedRestaurant.title || isSubmitting}
                                        >
                                            {isSubmitting ? 'Удаление...' : 'Подтвердить удаление'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ModeratorPage;