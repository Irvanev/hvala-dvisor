import React, { useState, useEffect } from 'react';
import styles from './NavBar.module.css';

// Иконка поиска
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

interface NavBarProps {
  onSearch?: (query: string) => void;
  onLanguageChange?: (language: string) => void;
  currentLanguage?: 'en' | 'ru';
  logoText?: string;
  logoUrl?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  onSearch,
  onLanguageChange,
  currentLanguage = 'en',
  logoText = 'HvalaDviser',
  logoUrl = '/'
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');

  // Обработчик события скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const toggleLanguage = () => {
    if (onLanguageChange) {
      onLanguageChange(currentLanguage === 'en' ? 'ru' : 'en');
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <a href={logoUrl} className={styles.logo}>
        {logoText}
      </a>

      <div className={styles.rightSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск..."
            value={query}
            onChange={handleSearch}
          />
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
        </div>

        <div className={styles.languageToggle} onClick={toggleLanguage}>
          en/ru
        </div>
      </div>
    </header>
  );
};

export default NavBar;