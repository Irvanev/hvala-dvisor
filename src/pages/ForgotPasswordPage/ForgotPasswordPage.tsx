import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from '../ForgotPasswordPage/ForgotPasswordPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!email) {
      setError('Введите электронную почту');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Неверный формат электронной почты');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Отправляем запрос на сброс пароля через Firebase
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error('Ошибка при отправке запроса на сброс пароля:', error);
      setError('Не удалось отправить запрос на сброс пароля. Проверьте правильность email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        onLanguageChange={(language) => console.log(`Язык: ${language}`)}
        currentLanguage="ru"
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />

      <div className={styles.forgotPasswordContainer}>
        <div className={styles.formWrapper}>
          <h1 className={styles.pageTitle}>Восстановление пароля</h1>
          
          {success ? (
            <div className={styles.successBlock}>
              <div className={styles.successMessage}>
                <svg viewBox="0 0 24 24" width="32" height="32" className={styles.successIcon}>
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p>
                  Инструкции по восстановлению пароля отправлены на адрес <strong>{email}</strong>
                </p>
              </div>
              <p className={styles.instructionText}>
                Проверьте вашу электронную почту и следуйте инструкциям для сброса пароля.
              </p>
              <button
                className={styles.backButton}
                onClick={handleBackToLogin}
              >
                ВЕРНУТЬСЯ НА СТРАНИЦУ ВХОДА
              </button>
            </div>
          ) : (
            <>
              <p className={styles.instructionText}>
                Введите электронную почту, связанную с вашим аккаунтом, и мы отправим вам инструкции по восстановлению пароля.
              </p>
              
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
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
                      className={`${styles.input} ${error ? styles.inputError : ''}`}
                      value={email}
                      onChange={handleInputChange}
                      placeholder="Электронная почта"
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleBackToLogin}
                  >
                    ОТМЕНА
                  </button>
                  
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'ОТПРАВКА...' : 'ВОССТАНОВИТЬ ПАРОЛЬ'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;