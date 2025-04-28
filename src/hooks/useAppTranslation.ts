import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Пользовательский хук для типизированного доступа к переводам
 * с дополнительными удобными функциями из контекста языка
 */
export const useAppTranslation = () => {
  // Получаем функцию перевода и i18n экземпляр
  const { t, i18n } = useTranslation();
  
  // Получаем дополнительные функции из контекста языка
  const { isSerbian, isEnglish, toggleLanguage, currentLanguage } = useLanguage();
  
  /**
   * Возвращает значение в зависимости от текущего языка
   * @param enValue - значение для английского языка
   * @param srValue - значение для сербского языка
   */
  const langSwitch = <T>(enValue: T, srValue: T): T => {
    return isEnglish() ? enValue : srValue;
  };
  
  return {
    t,
    i18n,
    isSerbian,
    isEnglish,
    toggleLanguage,
    langSwitch,
    currentLanguage
  };
};