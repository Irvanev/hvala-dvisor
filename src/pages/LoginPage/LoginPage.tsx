import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Добавлен импорт Link
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './LoginPage.module.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LocationState {
  from?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading: authLoading } = useAuth();

  // Получаем URL для перенаправления из location.state
  const state = location.state as LocationState;
  const redirectUrl = state?.from || '/profile';

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name as keyof LoginFormData]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (generalError) setGeneralError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) newErrors.email = 'Электронная почта обязательна';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Неверный формат электронной почты';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        // Перенаправляем пользователя на предыдущую страницу или профиль по умолчанию
        navigate(redirectUrl);
      } else {
        setGeneralError('Неверный email или пароль');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setGeneralError(error instanceof Error ? error.message : 'Произошла ошибка при входе. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setGeneralError('');
    try {
      const success = await loginWithGoogle();
      if (success) {
        // Перенаправляем пользователя на предыдущую страницу или профиль по умолчанию
        navigate(redirectUrl);
      }
      else setGeneralError('Не удалось войти через Google. Попробуйте другой способ.');
    } catch (error) {
      console.error('Ошибка при входе через Google:', error);
      setGeneralError(error instanceof Error ? error.message : 'Произошла ошибка при входе через Google. Попробуйте позже.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.loginPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        // onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        // currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />
      <div className={styles.loginContainer}>
        <div className={styles.formWrapper}>
          <h1 className={styles.pageTitle}>Вход в аккаунт</h1>
          {generalError && <div className={styles.errorMessage}>{generalError}</div>}
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
                  placeholder="Пароль (минимум 8 символов)"
                  autoComplete="new-password"
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
              <button type="button" className={styles.forgotPasswordLink} onClick={handleForgotPassword}>
                Забыли пароль?
              </button>
            </div>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting || authLoading || isGoogleSubmitting}>
              {isSubmitting || (authLoading && !isGoogleSubmitting) ? 'Выполняется вход...' : 'ВОЙТИ'}
            </button>
            <div className={styles.divider}>
              <span>или</span>
            </div>
            <button type="button" className={styles.googleButton} onClick={handleGoogleLogin} disabled={isSubmitting || authLoading || isGoogleSubmitting}>
              <span className={styles.googleIcon}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7895 9.20004C17.7895 8.46937 17.7339 7.88754 17.6113 7.28571H9.1V10.4179H14.1171C14.0245 11.1957 13.4962 12.3768 12.2865 13.1857L12.2695 13.2957L14.9559 15.3714L15.1339 15.3886C16.8481 13.8428 17.7895 11.7214 17.7895 9.20004Z" fill="#4285F4"/>
                  <path d="M9.09999 17.9991C11.54 17.9991 13.58 17.2099 15.1339 15.3877L12.2865 13.1848C11.5177 13.7223 10.4734 14.0884 9.09999 14.0884C6.71642 14.0884 4.70106 12.5599 3.98546 10.4062L3.87971 10.4148L1.08046 12.5723L1.04114 12.6719C2.58541 15.7848 5.61972 17.9991 9.09999 17.9991Z" fill="#34A853"/>
                  <path d="M3.98545 10.4089C3.79062 9.80708 3.68177 9.16208 3.68177 8.50005C3.68177 7.83802 3.79062 7.19302 3.97609 6.59119L3.97091 6.47338L1.13062 4.27295L1.04112 4.32828C0.380668 5.58585 0 7.00119 0 8.50005C0 9.99891 0.380668 11.4143 1.04112 12.6718L3.98545 10.4089Z" fill="#FBBC05"/>
                  <path d="M9.1 2.93413C10.7956 2.93413 11.9307 3.6468 12.5766 4.25127L15.1429 1.76608C13.5708 0.312498 11.54 -0.00195312 9.1 -0.00195312C5.61974 -0.00195312 2.58541 2.21232 1.04114 5.32523L3.97611 7.58814C4.70107 5.43451 6.71643 2.93413 9.1 2.93413Z" fill="#EB4335"/>
                </svg>
              </span>
              {isGoogleSubmitting ? 'Выполняется вход...' : 'Войти через Google'}
            </button>
            <div className={styles.registerLink}>
              {/* Заменяем тег <a> на компонент <Link> */}
              Нет аккаунта? <Link to={`/register${location.search}`} state={{ from: redirectUrl }}>Зарегистрироваться</Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;