import React, { useState } from 'react';
import styles from './SearchBar.module.css';

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

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  placeholder?: string;
  defaultLocation?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Поиск",
  defaultLocation = "Montenegro"
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(defaultLocation);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value, location);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query, location);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <div className={styles.locationSection}>
          <span className={styles.locationIcon}>
            <LocationIcon />
          </span>
          <span className={styles.locationText}>{location}</span>
        </div>
        <div className={styles.searchSection}>
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
        </div>
      </div>
    </div>
  );
};

export default SearchBar;