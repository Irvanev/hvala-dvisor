import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';
import { firestore } from '../../firebase/config';
import { collection, getDocs, query as firestoreQuery, where, limit } from 'firebase/firestore';
import { Restaurant } from '../../models/types';

// Иконка лупы для поиска
const SearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Иконка геолокации/точки на карте
const LocationIcon: React.FC<{ size?: number, fill?: string }> = ({ size = 20, fill = "#E74C3C" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 19 16 19 10C19 7.61305 18.0518 5.32387 16.364 3.63604C14.6761 1.94821 12.3869 1 10 1C7.61305 1 5.32387 1.94821 3.63604 3.63604C1.94821 5.32387 1 7.61305 1 10C1 16 8 22 8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" fill={fill}/>
    </svg>
);

// Иконка стрелки вниз для выпадающего списка
const ChevronDownIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="rgb(231, 76, 60)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Список стран Балкан для выбора
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

interface SearchBarProps {
  onSearch?: (searchQuery: string, location: string) => void;
  placeholder?: string;
  defaultLocation?: string;
}

interface SearchResult {
  id: string;
  title: string;
  city?: string;
  country?: string;
  cuisineTags?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
                                               onSearch,
                                               placeholder = "Поиск ресторанов",
                                               defaultLocation = "Montenegro"
                                             }) => {
  // Состояние для поисковых полей
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<string>(defaultLocation);
  const [locationInputValue, setLocationInputValue] = useState<string>(defaultLocation);

  // Состояние для выпадающих меню
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);

  // Состояние для отфильтрованных данных
  const [filteredLocations, setFilteredLocations] = useState<string[]>(BALKAN_COUNTRIES);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ссылки на DOM-элементы выпадающих списков
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Таймер для debounce поиска
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Закрытие выпадающих списков при клике вне них
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
        setLocationInputValue(location);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Переключение выпадающего списка локаций
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
    setFilteredLocations(BALKAN_COUNTRIES);
    setLocationInputValue(location);
  };

  // Обработка выбора локации
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setLocationInputValue(selectedLocation);
    setIsLocationDropdownOpen(false);

    // Если есть поисковый запрос, обновляем результаты
    if (searchQuery.length >= 2) {
      fetchSearchSuggestions(searchQuery, selectedLocation);
    }
  };

  // Фильтрация локаций при вводе
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInputValue(value);
    setFilteredLocations(
        BALKAN_COUNTRIES.filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
    );
  };

  // Загрузка подсказок поиска из Firebase
  // Загрузка подсказок поиска из Firebase
  const fetchSearchSuggestions = async (searchTerm: string, currentLocation?: string) => {
    console.log('🔄 Начало поиска:', { searchTerm, currentLocation, previousLocation: location });

    if (!searchTerm.trim() || searchTerm.length < 2) {
      console.log('❌ Слишком короткий запрос');
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const restaurantsRef = collection(firestore, 'restaurants');
      const locationToUse = currentLocation || location;

      console.log('📍 Используемая локация:', locationToUse);

      // Получаем все рестораны (ограничимся для производительности)
      const q = firestoreQuery(restaurantsRef, limit(50));
      const querySnapshot = await getDocs(q);

      console.log('📊 Всего документов получено:', querySnapshot.size);

      const results: SearchResult[] = [];
      const searchTermLower = searchTerm.toLowerCase();

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        const docId = doc.id;

        console.log(`📄 Обрабатываем документ ${docId}:`, data.title);

        // РАССЛАБЛЕННАЯ проверка модерации - пропускаем только явно отклоненные
        const moderationStatus = data.moderation?.status || data.moderationStatus;
        console.log(`   Статус модерации: ${moderationStatus}`);

        if (moderationStatus === 'rejected') {
          console.log(`   ❌ Пропускаем - отклонен модерацией`);
          //return;
        }

        // Проверяем локацию если указана
        if (locationToUse && locationToUse.trim() && locationToUse !== 'All') {
          const locationNormalized = locationToUse.toLowerCase();
          const restaurantCountry = (data.address?.country || data.country || '').toLowerCase();
          const restaurantCity = (data.address?.city || data.city || '').toLowerCase();

          console.log(`   🌍 Проверка локации: ищем "${locationNormalized}" в стране "${restaurantCountry}" или городе "${restaurantCity}"`);

          const matchesLocation =
              restaurantCountry.includes(locationNormalized) ||
              restaurantCity.includes(locationNormalized);

          if (!matchesLocation) {
            console.log(`   ❌ Пропускаем - не совпадает локация`);
            return;
          }
        }

        // Проверяем совпадение с запросом
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        const cuisineTags = Array.isArray(data.cuisineTags) ? data.cuisineTags : [];
        const featureTags = Array.isArray(data.featureTags) ? data.featureTags : [];
        const tagsSearchable = Array.isArray(data.tagsSearchable) ? data.tagsSearchable : [];

        const matchesSearch =
            title.includes(searchTermLower) ||
            description.includes(searchTermLower) ||
            cuisineTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
            featureTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
            tagsSearchable.some((tag: string) => tag.toLowerCase().includes(searchTermLower));

        if (matchesSearch && data.title) {
          console.log(`   ✅ Найдено совпадение: "${data.title}"`);
          results.push({
            id: docId,
            title: data.title,
            city: data.address?.city || data.city,
            country: data.address?.country || data.country,
            cuisineTags: data.cuisineTags?.slice(0, 2)
          });
        } else {
          console.log(`   ❌ Не подходит по поисковому запросу`);
        }
      });

      // Сортируем результаты по релевантности
      const sortedResults = results.sort((a, b) => {
        const aStartsWith = a.title.toLowerCase().startsWith(searchTermLower);
        const bStartsWith = b.title.toLowerCase().startsWith(searchTermLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.title.localeCompare(b.title);
      });

      console.log('🎯 Итоговые результаты:', sortedResults.length);
      setSearchResults(sortedResults.slice(0, 10));

      // Показываем dropdown если есть результаты
      if (sortedResults.length > 0) {
        setIsSearchDropdownOpen(true);
        console.log('📋 Dropdown открыт с результатами');
      } else {
        setIsSearchDropdownOpen(true); // Все равно показываем, но с сообщением "не найдено"
        console.log('📋 Dropdown открыт, но результатов нет');
      }

    } catch (error) {
      console.error("💥 Ошибка при загрузке подсказок поиска:", error);
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    } finally {
      setIsLoading(false);
      console.log('✅ Поиск завершен');
    }
  };

  // Обработка ввода запроса с debounce
  // Обработка ввода запроса с улучшенным debounce
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('⌨️ Ввод:', value);
    setSearchQuery(value);

    // Очистка предыдущего таймера
    if (searchTimerRef.current) {
      console.log('⏰ Очищаем предыдущий таймер');
      clearTimeout(searchTimerRef.current);
    }

    if (value.length >= 2) {
      console.log('⏳ Устанавливаем таймер поиска');
      searchTimerRef.current = setTimeout(() => {
        console.log('🚀 Запускаем поиск после debounce');
        fetchSearchSuggestions(value);
      }, 400); // Увеличил debounce для стабильности
    } else {
      console.log('❌ Слишком короткий запрос, очищаем результаты');
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };

  // Обработка фокуса на поле поиска
  const handleSearchFocus = () => {
    if (searchQuery.length >= 2 && searchResults.length > 0) {
      setIsSearchDropdownOpen(true);
    }
  };

  // Обработка выбора результата поиска
  const handleResultSelect = (result: SearchResult) => {
    setSearchQuery(result.title);
    setIsSearchDropdownOpen(false);

    // Выполнение поиска при выборе подсказки
    if (onSearch) {
      onSearch(result.title, location);
    }

    // Фокусируемся обратно на input после выбора
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Предотвращение прокрутки страницы при использовании колесика мыши в выпадающем списке
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  // Обработка нажатия Enter для выполнения поиска
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch(searchQuery, location);
      }
      setIsSearchDropdownOpen(false);
    }
  };

  // Отправка поискового запроса
  const handleSubmitSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, location);
    }
    setIsSearchDropdownOpen(false);
  };

  return (
      <div className={styles.searchBarContainer}>
        {/* Секция локации */}
        <div className={styles.locationSection} ref={locationDropdownRef}>
          <div className={styles.locationInputContainer} onClick={toggleLocationDropdown}>
            <div className={styles.locationIconWrapper}>
              <LocationIcon size={24} />
            </div>
            {isLocationDropdownOpen ? (
                <input
                    type="text"
                    value={locationInputValue}
                    onChange={handleLocationInputChange}
                    className={styles.locationInput}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    placeholder="Выберите страну..."
                />
            ) : (
                <div className={styles.locationText}>{location}</div>
            )}
            <ChevronDownIcon />
          </div>

          {/* Выпадающий список локаций */}
          {isLocationDropdownOpen && (
              <div className={styles.locationDropdown} onWheel={handleWheel}>
                {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc, index) => (
                        <div
                            key={index}
                            className={styles.locationOption}
                            onClick={() => handleLocationSelect(loc)}
                        >
                          {loc}
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>Ничего не найдено</div>
                )}
              </div>
          )}
        </div>

        {/* Секция поиска */}
        <div className={styles.searchSection} ref={searchDropdownRef}>
          <div className={styles.searchInputContainer}>
            <div className={styles.searchIconWrapper}>
              <SearchIcon size={22} />
            </div>
            <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={styles.searchInput}
            />
            <button className={styles.searchButton} onClick={handleSubmitSearch}>
              <span>Поиск</span>
            </button>
          </div>

          {/* Выпадающий список результатов поиска */}
          {isSearchDropdownOpen && (
              <div className={styles.searchDropdown} onWheel={handleWheel}>
                {isLoading ? (
                    <div className={styles.loadingResults}>Загрузка...</div>
                ) : searchResults.length > 0 ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <span>Рестораны ({searchResults.length})</span>
                      </div>
                      {searchResults.map((result, index) => (
                          <div
                              key={`${result.id}-${index}`}
                              className={styles.searchResult}
                              onClick={() => handleResultSelect(result)}
                          >
                            <div className={styles.resultTitle}>{result.title}</div>
                            <div className={styles.resultDetails}>
                              {result.city && <span className={styles.resultCity}>{result.city}</span>}
                              {result.cuisineTags && result.cuisineTags.length > 0 && (
                                  <span className={styles.resultTags}>
                          {result.cuisineTags.join(', ')}
                        </span>
                              )}
                            </div>
                          </div>
                      ))}
                    </>
                ) : (
                    searchQuery.length >= 2 && (
                        <div className={styles.noResults}>Рестораны не найдены</div>
                    )
                )}
              </div>
          )}
        </div>
      </div>
  );
};

export default SearchBar;