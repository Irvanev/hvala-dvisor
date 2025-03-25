import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';

const SearchIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface NavBarProps {
  onSearch?: (query: string) => void;
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
  logoText?: string;
  onWelcomeClick?: () => void;
  isStatic?: boolean; // Новый параметр для статичного режима
}

const NavBar: React.FC<NavBarProps> = ({
  onSearch,
  onLanguageChange,
  currentLanguage = 'ru',
  logoText = 'HvalaDviser',
  onWelcomeClick = () => {},
  isStatic = false, // По умолчанию - всплывающий навбар
}) => {
  const [scrolled, setScrolled] = useState(isStatic); // Если статичный, то сразу scrolled = true
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isStatic) {
      // Если navbar статичный, всегда показываем его как scrolled
      setScrolled(true);
      return;
    }

    // Стандартная логика для всплывающего навбара
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    
    // Вызов функции сразу для установки начального состояния
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStatic]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isStatic ? styles.static : ''}`}>
      <Link to="/" className={styles.logo}>{logoText}</Link>
      <div className={styles.controls}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
          <SearchIcon />
        </div>
        <button className={styles.welcomeBtn} onClick={onWelcomeClick}>
          <span>Welcome 👋</span>
        </button>
        <div className={styles.language} onClick={() => onLanguageChange?.(currentLanguage)}>
          {currentLanguage.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default NavBar;