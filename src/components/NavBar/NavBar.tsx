import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebase/config';
import { collection, getDocs, query as firestoreQuery, limit } from 'firebase/firestore';
import styles from './NavBar.module.css';


// Иконки
const SearchIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Список стран Балкан для определения, является ли результат местом
const BALKAN_COUNTRIES = [
  "Albania",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Greece",
  "Kosovo",
  "Montenegro",
  "North Macedonia",
  "Romania",
  "Serbia",
  "Slovenia",
  "Turkey"
];

// Список основных городов Балкан
const BALKAN_CITIES = [
  "Tirana", "Durrës", // Albania
  "Sarajevo", "Mostar", "Banja Luka", // Bosnia and Herzegovina
  "Sofia", "Plovdiv", "Varna", // Bulgaria
  "Zagreb", "Split", "Dubrovnik", "Rijeka", // Croatia
  "Athens", "Thessaloniki", "Patras", // Greece
  "Pristina", "Prizren", // Kosovo
  "Podgorica", "Budva", "Kotor", "Herceg Novi", // Montenegro
  "Skopje", "Ohrid", // North Macedonia
  "Bucharest", "Cluj-Napoca", "Timișoara", // Romania
  "Belgrade", "Novi Sad", "Niš", // Serbia
  "Ljubljana", "Maribor", // Slovenia
  "Istanbul", "Ankara", "Antalya" // Turkey
];

// Объединенный список всех мест
const ALL_LOCATIONS = [...BALKAN_COUNTRIES, ...BALKAN_CITIES];

// Типы результатов поиска
interface SearchResult {
  id: string;
  title: string;
  type: 'restaurant' | 'location';
}

interface NavBarProps {
  onSearch?: (query: string) => void;
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
  logoText?: string;
  onWelcomeClick?: () => void;
  isStatic?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  onSearch,
  onLanguageChange,
  currentLanguage = 'ru',
  logoText = 'HvalaDviser',
  onWelcomeClick = () => { },
  isStatic = false,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isModerator } = useAuth();
  const [scrolled, setScrolled] = useState(isStatic);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Реф для выпадающего списка поиска
  const searchRef = useRef<HTMLDivElement>(null);

  // Таймер для debounce поиска
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Эффект для установки события прокрутки
  useEffect(() => {
    if (isStatic) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  // Эффект для закрытия выпадающего списка при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Обработчик клика на кнопку профиля или входа
  const handleButtonClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      if (onWelcomeClick) {
        onWelcomeClick();
      } else {
        navigate('/login');
      }
    }
  };

  // Обработчик клика на профиль
  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  // Обработчик клика на выход
  const handleLogoutClick = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  // Функция поиска ресторанов и локаций
  const fetchSearchResults = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results: SearchResult[] = [];
      const searchTermLower = searchTerm.toLowerCase();

      // Сначала ищем совпадения в локациях
      const matchingLocations = ALL_LOCATIONS.filter(
        location => location.toLowerCase().includes(searchTermLower)
      );

      // Добавляем локации в результаты
      results.push(
        ...matchingLocations.slice(0, 3).map(location => ({
          id: `location-${location}`,
          title: location,
          type: 'location' as const
        }))
      );

      // Затем ищем рестораны в Firebase
      const restaurantsRef = collection(firestore, 'restaurants');
      const querySnapshot = await getDocs(firestoreQuery(restaurantsRef, limit(5)));

      querySnapshot.forEach((doc) => {
        // Используем безопасное приведение типов для данных Firestore
        const data = doc.data() as Record<string, any>;

        // Проверяем статус модерации
        const moderationStatus = data.moderation?.status || data.moderationStatus || 'pending';
        if (moderationStatus !== 'approved' && moderationStatus !== undefined) {
          return; // Пропускаем неодобренные рестораны
        }

        // Проверяем совпадение с запросом
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        const cuisineTags = Array.isArray(data.cuisineTags) ? data.cuisineTags : [];
        const featureTags = Array.isArray(data.featureTags) ? data.featureTags : [];

        if (
          title.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          cuisineTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
          featureTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower))
        ) {
          results.push({
            id: doc.id,
            title: data.title || 'Ресторан без названия',
            type: 'restaurant'
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Ошибка при поиске:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик ввода поискового запроса
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Очистка предыдущего таймера
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Вызываем колбэк onSearch, если он есть
    if (onSearch) {
      onSearch(value);
    }

    if (value.length >= 2) {
      // Устанавливаем новый таймер для debounce
      searchTimerRef.current = setTimeout(() => {
        fetchSearchResults(value);
        setShowSearchResults(true);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Обработчик выбора результата поиска
  const handleResultClick = (result: SearchResult) => {
    setShowSearchResults(false);

    if (result.type === 'location') {
      // Переходим на страницу с результатами поиска по локации
      navigate(`/s?location=${encodeURIComponent(result.title)}`);
    } else {
      // Переходим на страницу ресторана
      navigate(`/restaurant/${result.id}`);
    }
  };

  // Обработчик нажатия Enter в поисковой строке
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearchResults(false);
      navigate(`/s?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isStatic ? styles.static : ''} 
    ${isAdmin ? styles.adminHeader : ''} ${isModerator ? styles.moderatorHeader : ''}`}>
      <Link to="/" className={styles.logo}>{logoText}</Link>
      <div className={styles.controls}>
        <div className={styles.search} ref={searchRef}>
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          <SearchIcon />

          {/* Выпадающий список результатов поиска */}
          {showSearchResults && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {isLoading ? (
                <div className={styles.searchLoading}>Загрузка...</div>
              ) : (
                <>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={styles.searchResultItem}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className={styles.resultTitle}>{result.title}</div>
                      <div className={styles.resultType}>
                        {result.type === 'location' ? 'Место' : 'Ресторан'}
                      </div>
                    </div>
                  ))}

                  {/* Ссылка на полную страницу результатов */}
                  <div
                    className={styles.searchViewAll}
                    onClick={() => {
                      setShowSearchResults(false);
                      navigate(`/s?query=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                  >
                    Посмотреть все результаты
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className={styles.navButtons}>
          {isAuthenticated ? (
            <div className={styles.userContainer}>
              <button className={styles.userButton} onClick={handleButtonClick}>
                <div className={styles.userAvatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Аватар" />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                <span className={styles.userName}>{user?.name || user?.username}</span>
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <button onClick={handleProfileClick} className={styles.menuItem}>
                    Мой профиль
                  </button>
                  {isModerator && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/moderator');
                      }}
                      className={styles.menuItem}
                    >
                      Модерация ресторанов
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/users');
                      }}
                      className={styles.menuItem}
                    >
                      Управление пользователями
                    </button>
                  )}
                  <button onClick={handleLogoutClick} className={styles.menuItem}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.welcomeBtn} onClick={handleButtonClick}>
              <span>Welcome 👋</span>
            </button>
          )}
          <button
            className={styles.language}
            onClick={() => onLanguageChange?.(currentLanguage)}
          >
            {currentLanguage.toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;