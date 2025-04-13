// components/FilterBar/FilterBar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  showMap: boolean;
  onMapToggle: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  showMap, 
  onMapToggle 
}) => {
  const navigate = useNavigate();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Balkan cities and countries
  const locations = [
    'Подгорица', 'Будва', 'Котор', 'Бечичи', 'Тиват',
    'Черногория', 'Сербия', 'Белград', 'Босния', 'Хорватия', 'Сараево'
  ];

  const filteredLocations = locations.filter(location => 
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    navigate(`/s?location=${encodeURIComponent(location)}`);
    setCityDropdownOpen(false);
    setSearchTerm(location);
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filtersContainer}>
        {/* Тип заведения */}
        <div className={styles.filterDropdown}>
          <button className={styles.filterButton}>
            Тип заведения
            <svg className={styles.dropdownIcon} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem}>Все типы</div>
            <div className={styles.dropdownItem}>Ресторан</div>
            <div className={styles.dropdownItem}>Кафе</div>
            <div className={styles.dropdownItem}>Бар</div>
            <div className={styles.dropdownItem}>Таверна</div>
            <div className={styles.dropdownItem}>Кофейня</div>
          </div>
        </div>

        {/* Тип кухни */}
        <div className={styles.filterDropdown}>
          <button className={styles.filterButton}>
            Тип кухни
            <svg className={styles.dropdownIcon} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem}>Все кухни</div>
            <div className={styles.dropdownItem}>Французская</div>
            <div className={styles.dropdownItem}>Итальянская</div>
            <div className={styles.dropdownItem}>Черногорская</div>
            <div className={styles.dropdownItem}>Испанская</div>
            <div className={styles.dropdownItem}>Балканская</div>
            <div className={styles.dropdownItem}>Домашняя</div>
          </div>
        </div>

        {/* Ценовой диапазон */}
        <div className={styles.filterDropdown}>
          <button className={styles.filterButton}>
            Ценовой диапазон
            <svg className={styles.dropdownIcon} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem}>Любая цена</div>
            <div className={styles.dropdownItem}>€ - Бюджетно</div>
            <div className={styles.dropdownItem}>€€ - Средне</div>
            <div className={styles.dropdownItem}>€€€ - Дорого</div>
          </div>
        </div>

        {/* Рейтинг */}
        <div className={styles.filterDropdown}>
          <button className={styles.filterButton}>
            Рейтинг
            <svg className={styles.dropdownIcon} viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem}>Любой рейтинг</div>
            <div className={styles.dropdownItem}>4.0+</div>
            <div className={styles.dropdownItem}>4.5+</div>
            <div className={styles.dropdownItem}>4.8+</div>
          </div>
        </div>

        {/* Поиск по стране/городу */}
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <div className={styles.locationInputContainer}>
            <input 
              className={styles.locationInput} 
              placeholder="Город или страна"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value && !cityDropdownOpen) {
                  setCityDropdownOpen(true);
                }
              }}
              onFocus={() => setCityDropdownOpen(true)}
              onBlur={() => setTimeout(() => setCityDropdownOpen(false), 200)}
            />
            {cityDropdownOpen && filteredLocations.length > 0 && (
              <div className={styles.locationDropdown}>
                {filteredLocations.map(location => (
                  <div 
                    key={location} 
                    className={styles.locationItem}
                    onClick={() => handleLocationSelect(location)}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.resultsAndMapContainer}>
        <div className={styles.resultsCount}>0 результатов</div>
        <div className={styles.sortSection}>
          <span>Рекомендуемые</span>
          <svg className={styles.sortIcon} viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <div className={styles.mapToggleContainer}>
          <span>Карта</span>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={showMap} 
              onChange={onMapToggle}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;