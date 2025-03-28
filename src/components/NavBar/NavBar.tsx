import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './NavBar.module.css';

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
  onWelcomeClick = () => {},
  isStatic = false,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(isStatic);
  const [query, setQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleButtonClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };
  
  const handleLogoutClick = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

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