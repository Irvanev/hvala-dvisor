// Ключ для хранения выбранного языка в localStorage
const LANGUAGE_KEY = 'hvala_dvisor_lang';

/**
 * Получает текущий язык из localStorage или возвращает язык по умолчанию
 * @param defaultLang - Язык по умолчанию, если в localStorage ничего не найдено
 * @returns Код языка (например, 'en', 'sr')
 */
export const getStoredLanguage = (defaultLang = 'en'): string => {
  if (typeof window === 'undefined') return defaultLang;
  
  const storedLang = localStorage.getItem(LANGUAGE_KEY);
  return storedLang || defaultLang;
};

/**
 * Сохраняет выбранный язык в localStorage
 * @param lang - Код языка для сохранения
 */
export const storeLanguage = (lang: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(LANGUAGE_KEY, lang);
};

/**
 * Определяет предпочтительный язык пользователя на основе настроек браузера
 * @returns Код языка ('en' или 'sr')
 */
export const detectBrowserLanguage = (): string => {
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