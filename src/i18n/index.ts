import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем файлы переводов
import translationEN from './locales/en/translation.json';
import translationSR from './locales/sr/translation.json';
import translationRU from './locales/ru/translation.json';

// Получаем сохраненный язык из localStorage или используем язык браузера
const getUserLanguage = () => {
  const savedLanguage = localStorage.getItem('hvala_dvisor_lang');
  if (savedLanguage) return savedLanguage;
  
  // Определяем язык браузера
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('sr') || 
      browserLang.startsWith('hr') || 
      browserLang.startsWith('bs')) return 'sr';
  
  return 'en'; // Язык по умолчанию - английский
};

// Инициализируем i18next с нашими переводами
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      sr: {
        translation: translationSR
      },
      ru: {
        translation: translationRU
      }
    },
    lng: getUserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // не экранируем строки для React
    }
  });

export default i18n;