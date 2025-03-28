import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './LoginPage.module.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Очистить ошибку при изменении поля
    if (errors[name as keyof LoginFormData]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Очистить общую ошибку при любом изменении формы
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
    
    if (!formData.email) {
      newErrors.email = 'Электронная почта обязательна';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат электронной почты';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Используем функцию login из AuthContext
      const success = await login(formData.email, formData.password, formData.rememberMe);
      
      if (success) {
        // После успешной аутентификации перенаправление на страницу профиля
        navigate('/profile');
      } else {
        setGeneralError('Неверный email или пароль');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при входе. Попробуйте позже.';
      setGeneralError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.loginPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <div className={styles.loginContainer}>
        <div className={styles.formWrapper}>
          <h1 className={styles.pageTitle}>Вход в аккаунт</h1>
          
          {generalError && (
            <div className={styles.errorMessage}>{generalError}</div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Электронная почта"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className={styles.errorText}>{errors.email}</p>}
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Пароль"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className={styles.errorText}>{errors.password}</p>}
            </div>
            
            <div className={styles.formOptions}>
              <div className={styles.rememberMeContainer}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                  Запомнить меня
                </label>
              </div>
              
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={handleForgotPassword}
              >
                Забыли пароль?
              </button>
            </div>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting || authLoading ? 'Выполняется вход...' : 'ВОЙТИ'}
            </button>
            
            <div className={styles.registerLink}>
              Нет аккаунта? <a href="/register">Зарегистрироваться</a>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;