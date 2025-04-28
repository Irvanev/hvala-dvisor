import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
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

interface NavBarProps {
  onSearch?: (query: string) => void;
  logoText?: string;
  onWelcomeClick?: () => void;
  isStatic?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  onSearch,
  logoText = 'HvalaDviser',
  onWelcomeClick = () => { },
  isStatic = false,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isModerator } = useAuth();
  const [scrolled, setScrolled] = useState(isStatic);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Используем наш хук для переводов
  const { t, toggleLanguage, currentLanguage } = useAppTranslation();

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

  // Обработчик ввода поискового запроса
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Обработчик нажатия Enter в поисковой строке
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/s?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isStatic ? styles.static : ''} 
    ${isAdmin ? styles.adminHeader : ''} ${isModerator ? styles.moderatorHeader : ''}`}>
      <Link to="/" className={styles.logo}>{logoText}</Link>
      <div className={styles.controls}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyDown={handleSearchKeyDown}
          />
          <SearchIcon />
        </div>
        <div className={styles.navButtons}>
          {isAuthenticated ? (
            <div className={styles.userContainer}>
              <button className={styles.userButton} onClick={handleButtonClick}>
                <div className={styles.userAvatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={t('navbar.avatar')} />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                <span className={styles.userName}>{user?.name || user?.username}</span>
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <button onClick={handleProfileClick} className={styles.menuItem}>
                    {t('profile.personalInfo')}
                  </button>
                  {isModerator && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/moderator');
                      }}
                      className={styles.menuItem}
                    >
                      {t('navbar.moderation')}
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
                      {t('navbar.userManagement')}
                    </button>
                  )}
                  <button onClick={handleLogoutClick} className={styles.menuItem}>
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.welcomeBtn} onClick={handleButtonClick}>
              <span>{t('navbar.welcome')} 👋</span>
            </button>
          )}
          <button
            className={styles.language}
            onClick={toggleLanguage}
          >
            {currentLanguage.toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;