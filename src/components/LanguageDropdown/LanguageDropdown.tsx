import React, { useState, useRef, useEffect } from 'react';
import i18n from 'i18next';
import styles from './LanguageDropdown.module.css';

interface LanguageOption {
  code: string;
  name: string;
  flag?: string; // Опционально: путь к изображению флага или эмодзи
}

interface LanguageDropdownProps {
  className?: string; // Дополнительные CSS классы
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Доступные языки
  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];
  
  // Текущий язык
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Переключение языка
  const changeLanguage = (code: string) => {
    localStorage.setItem('hvala_dvisor_lang', code);
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Закрытие выпадающего меню при клике вне него
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.languageDropdown} ${className || ''}`} ref={dropdownRef}>
      <button 
        className={styles.languageButton} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={styles.languageFlag}>{currentLanguage.flag}</span>
        <span className={styles.languageCode}>{currentLanguage.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.languageOption} ${lang.code === i18n.language ? styles.active : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className={styles.optionFlag}>{lang.flag}</span>
              <span className={styles.optionName}>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;