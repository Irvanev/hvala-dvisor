import React from 'react';
import { useTranslation, withTranslation as withI18nTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * HOC для удобного использования переводов в компонентах-классах
 * Добавляет как стандартные props из react-i18next, так и
 * дополнительные методы из нашего LanguageContext
 */
export const withTranslation = (
  Component: React.ComponentType<any>,
  namespace?: string | string[]
) => {
  // Оборачиваем компонент в HOC из react-i18next
  const WithI18n = withI18nTranslation(namespace)(Component);
  
  // Создаем промежуточный компонент для добавления контекста
  const WithLanguageContext = (props: any) => {
    const { t, i18n } = useTranslation(namespace);
    const languageContext = useLanguage();
    
    // Объединяем все props и передаем в компонент
    return (
      <WithI18n
        {...props}
        t={t}
        i18n={i18n}
        isSerbian={languageContext.isSerbian}
        isEnglish={languageContext.isEnglish}
        toggleLanguage={languageContext.toggleLanguage}
        currentLanguage={languageContext.currentLanguage}
      />
    );
  };
  
  return WithLanguageContext;
};