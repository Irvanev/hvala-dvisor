import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';
import { firestore } from '../../firebase/config';
import { collection, getDocs, query as firestoreQuery, where, limit } from 'firebase/firestore';
import { Restaurant } from '../../models/types';

// Иконка лупы для поиска
// const SearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// );

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
  const fetchSearchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const restaurantsRef = collection(firestore, 'restaurants');
      
      // Получаем все рестораны (ограничимся 20)
      const querySnapshot = await getDocs(firestoreQuery(restaurantsRef, limit(20)));
      
      const results: SearchResult[] = [];
      const searchTermLower = searchTerm.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        // Используем безопасное приведение типов для firestore
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
        const tagsSearchable = Array.isArray(data.tagsSearchable) ? data.tagsSearchable : [];
        
        // Проверяем все поля для поиска
        if (
          title.includes(searchTermLower) || 
          description.includes(searchTermLower) ||
          cuisineTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
          featureTags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
          tagsSearchable.some((tag: string) => tag.toLowerCase().includes(searchTermLower))
        ) {
          results.push({
            id: doc.id,
            title: data.title || 'Ресторан без названия'
          });
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Ошибка при загрузке подсказок поиска:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработка ввода запроса с debounce
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Очистка предыдущего таймера
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    if (value.length >= 2) {
      // Устанавливаем новый таймер для debounce
      searchTimerRef.current = setTimeout(() => {
        fetchSearchSuggestions(value);
        setIsSearchDropdownOpen(true);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };
  
  // Обработка выбора результата поиска
  const handleResultSelect = (result: string) => {
    setSearchQuery(result);
    setIsSearchDropdownOpen(false);
    
    // Выполнение поиска при выборе подсказки
    if (onSearch) {
      onSearch(result, location);
    }
  };
  
  // Предотвращение прокрутки страницы при использовании колесика мыши в выпадающем списке
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };
  
  // Обработка нажатия Enter для выполнения поиска
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchQuery, location);
      setIsSearchDropdownOpen(false);
    }
  };
  
  // Отправка поискового запроса
  const handleSubmitSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, location);
      setIsSearchDropdownOpen(false);
    }
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
            {/* <SearchIcon size={22} /> */}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
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
              searchResults.map((result, index) => (
                <div
                  key={index}
                  className={styles.searchResult}
                  onClick={() => handleResultSelect(result.title)}
                >
                  {result.title}
                </div>
              ))
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