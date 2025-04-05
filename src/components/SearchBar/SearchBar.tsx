import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';
import { db } from '../../firebase/config';


// Иконки
const SearchIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LocationIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#ef4444' }}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronDownIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Список стран Балкан для выбора
const LOCATIONS = [
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

// Моковые результаты поиска
const SEARCH_RESULTS = [
  "Restaurant Bakar",
  "Restaurant Jadran",
  "Restaurant Galeb",
  "Restaurant Stara Čaršija",
  "Restaurant Palata"
];

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  placeholder?: string;
  defaultLocation?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Поиск ресторанов",
  defaultLocation = "Serbia"
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(LOCATIONS);
  const [filteredResults, setFilteredResults] = useState<string[]>([]);
  const [locationInputValue, setLocationInputValue] = useState(defaultLocation);
  
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  // Обработчик клика вне дропдауна для его закрытия
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
        // Восстанавливаем текущую локацию в поле ввода при закрытии дропдауна
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
  
  // Открытие/закрытие дропдауна локаций
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
    setFilteredLocations(LOCATIONS);
    setLocationInputValue(location);
  };
  
  // Обработка выбора локации
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setLocationInputValue(selectedLocation);
    setIsLocationDropdownOpen(false);
    
    // Без перенаправления на страницу страны
    
    if (onSearch) {
      onSearch(query, selectedLocation);
    }
  };
  
  // Фильтрация локаций при вводе
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInputValue(value);
    setFilteredLocations(
      LOCATIONS.filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
    );
  };
  
  // Обработка ввода в поисковую строку
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 0) {
      setFilteredResults(
        SEARCH_RESULTS.filter(result => 
          result.toLowerCase().includes(value.toLowerCase())
        )
      );
      setIsSearchDropdownOpen(true);
    } else {
      setFilteredResults([]);
      setIsSearchDropdownOpen(false);
    }
    
    if (onSearch) {
      onSearch(value, location);
    }
  };
  
  // Обработка выбора результата поиска
  const handleResultSelect = (result: string) => {
    setQuery(result);
    setIsSearchDropdownOpen(false);
    if (onSearch) {
      onSearch(result, location);
    }
  };
  
  // Обработка нажатия колесика мыши в выпадающем списке
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Предотвращаем прокрутку страницы, когда прокручиваем список
    e.stopPropagation();
  };
  
  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query, location);
      setIsSearchDropdownOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        {/* Секция локации */}
        <div 
          className={styles.locationSection}
          onClick={toggleLocationDropdown}
          ref={locationDropdownRef}
          aria-expanded={isLocationDropdownOpen}
        >
          <span className={styles.locationIcon}>
            <LocationIcon />
          </span>
          {isLocationDropdownOpen ? (
            <input
              type="text"
              className={styles.locationInput}
              value={locationInputValue}
              onChange={handleLocationInputChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className={styles.locationText}>{location}</span>
          )}
          <span className={styles.chevronIcon}>
            <ChevronDownIcon />
          </span>
          
          {/* Выпадающий список локаций */}
          {isLocationDropdownOpen && (
            <div 
              className={styles.locationDropdown}
              onWheel={handleWheel}
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <div 
                    key={index} 
                    className={styles.locationItem}
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
        <div 
          className={styles.searchSection}
          ref={searchDropdownRef}
        >
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
          />
          
          {/* Выпадающий список результатов поиска */}
          {isSearchDropdownOpen && filteredResults.length > 0 && (
            <div className={styles.searchDropdown}>
              {filteredResults.map((result, index) => (
                <div 
                  key={index} 
                  className={styles.searchResultItem}
                  onClick={() => handleResultSelect(result)}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;