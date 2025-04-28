import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { getStoredLanguage, storeLanguage } from '../utils/languageUtils';

// Интерфейс контекста языка
export interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lng: string) => void;
  isSerbian: () => boolean;
  isEnglish: () => boolean;
  toggleLanguage: () => void;
}

// Создаем контекст с начальными значениями по умолчанию
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: () => {},
  isSerbian: () => false,
  isEnglish: () => true,
  toggleLanguage: () => {}
});

// Поставщик контекста
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Изменяет язык приложения и сохраняет изменение
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    storeLanguage(lng);
  };

  // При монтировании компонента инициализируем язык из localStorage
  useEffect(() => {
    const savedLanguage = getStoredLanguage();
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  // Если язык меняется извне (например, через прямой вызов i18n.changeLanguage),
  // мы хотим обновить наше состояние
  useEffect(() => {
    if (i18n.language && i18n.language !== currentLanguage) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language]);

  // Проверяет, является ли текущий язык сербским
  const isSerbian = () => currentLanguage === 'sr';

  // Проверяет, является ли текущий язык английским
  const isEnglish = () => currentLanguage === 'en';

  // Переключает язык между английским и сербским
  const toggleLanguage = () => {
    const newLang = isEnglish() ? 'sr' : 'en';
    changeLanguage(newLang);
  };

  // Значение контекста
  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isSerbian,
    isEnglish,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Хук для использования контекста
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context;
};