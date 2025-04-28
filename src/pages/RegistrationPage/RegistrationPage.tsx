import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './RegistrationPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Добавлен импорт Link


interface RegistrationFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  avatar?: File | null;
  acceptTerms: boolean;
}

interface RegistrationFormErrors extends Partial<Record<keyof RegistrationFormData, string>> {
  general?: string;
}

interface LocationState {
  from?: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, registerWithGoogle, isLoading } = useAuth();

  // Получаем URL для перенаправления из location.state
  const state = location.state as LocationState;
  const redirectUrl = state?.from || '/profile';

  const [avatarPreview, setAvatarPreview] = useState<string>('https://placehold.jp/300x300.png');
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    avatar: null,
    acceptTerms: false
  });
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
  const [registrationStep, setRegistrationStep] = useState<number>(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name as keyof RegistrationFormData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: RegistrationFormErrors = {};
    if (registrationStep === 1) {
      if (!formData.email) newErrors.email = 'Электронная почта обязательна';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Неверный формат электронной почты';
      if (!formData.password) newErrors.password = 'Пароль обязателен';
      else if (formData.password.length < 8) newErrors.password = 'Пароль должен содержать не менее 8 символов';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтверждение пароля обязательно';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    }
    if (registrationStep === 2) {
      if (!formData.name) newErrors.name = 'Имя обязательно';
      if (!formData.username) newErrors.username = 'Имя пользователя обязательно';
      if (!formData.city) newErrors.city = 'Город обязателен';
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Необходимо принять условия использования';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setRegistrationStep(2);
    }
  };

  const handlePrevStep = () => {
    setRegistrationStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.username,
        city: formData.city,
        avatar: formData.avatar
      });
      if (success) {
        // Перенаправляем пользователя на страницу ресторана или профиль
        navigate(redirectUrl);
      }
      else setErrors({ general: 'Не удалось зарегистрироваться. Возможно, такой email уже используется.' });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setErrors({ general: 'Произошла ошибка при регистрации. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegistration = async () => {
    setIsGoogleSubmitting(true);
    try {
      const success = await registerWithGoogle();
      if (success) {
        // Перенаправляем пользователя на страницу ресторана или профиль
        navigate(redirectUrl);
      } else {
        setErrors({ general: 'Не удалось зарегистрироваться через Google. Попробуйте другой способ.' });
      }
    } catch (error) {
      console.error('Ошибка при регистрации через Google:', error);
      setErrors({
        general: error instanceof Error
          ? error.message
          : 'Произошла ошибка при регистрации через Google. Попробуйте позже.'
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className={styles.registrationPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        // onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        // currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />
      <div className={styles.registrationContainer}>
        <div className={styles.formWrapper}>
          <h1 className={styles.pageTitle}>
            {registrationStep === 1 ? 'Создать аккаунт' : 'Завершите регистрацию'}
          </h1>
          {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

          {registrationStep === 1 && (
            <>
              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleRegistration}
                disabled={isSubmitting || isLoading || isGoogleSubmitting}
              >
                <span className={styles.googleIcon}>
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.7895 9.20004C17.7895 8.46937 17.7339 7.88754 17.6113 7.28571H9.1V10.4179H14.1171C14.0245 11.1957 13.4962 12.3768 12.2865 13.1857L12.2695 13.2957L14.9559 15.3714L15.1339 15.3886C16.8481 13.8428 17.7895 11.7214 17.7895 9.20004Z" fill="#4285F4" />
                    <path d="M9.09999 17.9991C11.54 17.9991 13.58 17.2099 15.1339 15.3877L12.2865 13.1848C11.5177 13.7223 10.4734 14.0884 9.09999 14.0884C6.71642 14.0884 4.70106 12.5599 3.98546 10.4062L3.87971 10.4148L1.08046 12.5723L1.04114 12.6719C2.58541 15.7848 5.61972 17.9991 9.09999 17.9991Z" fill="#34A853" />
                    <path d="M3.98545 10.4089C3.79062 9.80708 3.68177 9.16208 3.68177 8.50005C3.68177 7.83802 3.79062 7.19302 3.97609 6.59119L3.97091 6.47338L1.13062 4.27295L1.04112 4.32828C0.380668 5.58585 0 7.00119 0 8.50005C0 9.99891 0.380668 11.4143 1.04112 12.6718L3.98545 10.4089Z" fill="#FBBC05" />
                    <path d="M9.1 2.93413C10.7956 2.93413 11.9307 3.6468 12.5766 4.25127L15.1429 1.76608C13.5708 0.312498 11.54 -0.00195312 9.1 -0.00195312C5.61974 -0.00195312 2.58541 2.21232 1.04114 5.32523L3.97611 7.58814C4.70107 5.43451 6.71643 2.93413 9.1 2.93413Z" fill="#EB4335" />
                  </svg>
                </span>
                {isGoogleSubmitting ? 'Регистрация...' : 'Зарегистрироваться через Google'}
              </button>

              <div className={styles.divider}>
                <span>или</span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            {registrationStep === 1 ? (
              <>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor" />
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
                        <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor" />
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
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Подтвердите пароль"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
                </div>
                <button type="button" className={styles.nextButton} onClick={handleNextStep} disabled={isSubmitting || isGoogleSubmitting}>
                  ДАЛЕЕ
                </button>
                <div className={styles.loginLink}>
                  Уже есть аккаунт? <Link to={`/login${location.search}`} state={{ from: redirectUrl }}>Войти</Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.avatarUploadContainer}>
                  <div className={styles.avatarPreview}>
                    <img src={avatarPreview} alt="Аватар" className={styles.previewImage} />
                  </div>
                  <label htmlFor="avatar" className={styles.uploadButton}>
                    <svg viewBox="0 0 24 24" width="18" height="18" className={styles.uploadIcon}>
                      <path fill="currentColor" d="M19 7v11H5V7h3l1-2h6l1 2h3zm-8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                    Загрузить фото
                  </label>
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={styles.fileInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Имя и Фамилия"
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V18H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Имя пользователя"
                      autoComplete="username"
                    />
                  </div>
                  {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Город"
                      autoComplete="address-level2"
                    />
                  </div>
                  {errors.city && <p className={styles.errorText}>{errors.city}</p>}
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
                      Я принимаю <a href="/terms" className={styles.termsLink}>условия использования</a>
                    </label>
                  </div>
                  {errors.acceptTerms && <p className={styles.errorText}>{errors.acceptTerms}</p>}
                </div>
                <div className={styles.buttonGroup}>
                  <button type="button" className={styles.backButton} onClick={handlePrevStep}>
                    НАЗАД
                  </button>
                  <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Регистрация...' : 'ЗАВЕРШИТЬ'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegistrationPage;