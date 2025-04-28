import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируем файлы переводов
import translationEN from './locales/en/translation.json';
import translationSR from './locales/sr/translation.json';

// Ключ для хранения в localStorage
const LANGUAGE_KEY = 'hvala_dvisor_lang';

// Определяем язык браузера, чтобы выбрать подходящий по умолчанию
const detectBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Проверяем, является ли язык браузера сербским или относится к сербскоговорящим регионам
  if (browserLang.startsWith('sr') || 
      browserLang.startsWith('hr') || 
      browserLang.startsWith('bs') || 
      browserLang.startsWith('me')) {
    return 'sr';
  }
  
  return 'en'; // По умолчанию английский
};

// Получаем сохраненный язык или определяем язык браузера
const getSavedLanguage = (): string => {
  const savedLang = localStorage.getItem(LANGUAGE_KEY);
  return savedLang || detectBrowserLanguage();
};

// Ресурсы с переводами
const resources = {
  en: {
    translation: translationEN
  },
  sr: {
    translation: translationSR
  }
};

// Инициализируем i18next
i18n
  // Используем детектор языка
  .use(LanguageDetector)
  // Передаем i18n в react-i18next
  .use(initReactI18next)
  // Инициализируем
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_KEY,
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // не нужно экранировать для React
    }
  });

// Сохраняем язык при его изменении
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;