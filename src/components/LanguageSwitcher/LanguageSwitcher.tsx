import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`} 
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button 
        className={`language-btn ${i18n.language === 'sr' ? 'active' : ''}`} 
        onClick={() => changeLanguage('sr')}
        title="Srpski"
      >
        SR
      </button>
    </div>
  );
};

export default LanguageSwitcher;