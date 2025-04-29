import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer/Footer';
import styles from './EditProfilePage.module.css';
// Импортируем хук для переводов
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface EditProfileFormData {
  name: string;
  username: string;
  email: string;
  city: string;
  avatar?: File | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  // Используем хук для переводов
  const { t } = useAppTranslation();
  
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: '',
    username: '',
    email: '',
    city: '',
    avatar: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        city: user.city || '',
        avatar: null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очистить ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Очистить сообщение об успехе при любом изменении формы
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        avatar: file
      });
      
      // Показать превью аватара
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name) {
      newErrors.name = t('editProfile.errors.nameRequired');
    }
    
    if (!formData.username) {
      newErrors.username = t('editProfile.errors.usernameRequired');
    }
    
    if (!formData.email) {
      newErrors.email = t('editProfile.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('editProfile.errors.invalidEmail');
    }
    
    // Валидация пароля только если пользователь пытается его изменить
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('editProfile.errors.currentPasswordRequired');
      }
      
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = t('editProfile.errors.passwordTooShort');
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('editProfile.errors.passwordsDoNotMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Подготовка данных для обновления профиля
      const updatedUserData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        city: formData.city,
        // Если есть новый аватар, используем его превью URL
        // (в реальном приложении здесь будет загрузка файла в Firebase Storage)
        avatar: formData.avatar ? avatarPreview : user?.avatar
      };
      
      // Обновление пользователя через контекст аутентификации
      const success = await updateUser(updatedUserData);
      
      // Обновление пароля, если пользователь ввел новый пароль
      if (success && formData.newPassword && auth.currentUser) {
        try {
          // В реальном приложении здесь должна быть проверка текущего пароля
          // через повторную аутентификацию (reauthenticateWithCredential)
          await updatePassword(auth.currentUser, formData.newPassword);
          console.log('Пароль успешно обновлен');
        } catch (passwordError) {
          console.error('Ошибка при обновлении пароля:', passwordError);
          setErrors({
            ...errors,
            currentPassword: t('editProfile.errors.passwordUpdateFailed')
          });
          // Несмотря на ошибку с паролем, профиль считаем обновленным
          setSuccessMessage(t('editProfile.success.profileUpdatedPasswordFailed'));
          setIsSubmitting(false);
          return;
        }
      }
      
      if (success) {
        setSuccessMessage(t('editProfile.success.profileUpdated'));
        
        // Если пользователь изменил пароль, очищаем поля пароля
        if (formData.newPassword) {
          setFormData({
            ...formData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } else {
        setErrors({
          ...errors,
          general: t('editProfile.errors.updateFailed')
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setErrors({
        ...errors,
        general: t('editProfile.errors.generalError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/profile');
  };
  
  return (
    <div className={styles.editProfilePage}>
      <NavBar
        onSearch={(query) => console.log(`Поиск: ${query}`)}
        logoText="HvalaDviser"
        onWelcomeClick={() => console.log('Клик на Welcome')}
        isStatic={true}
      />
      
      <div className={styles.editProfileContainer}>
        <div className={styles.formWrapper}>
          <h1 className={styles.pageTitle}>{t('editProfile.title')}</h1>
          
          {errors.general && (
            <div className={styles.errorMessage}>{errors.general}</div>
          )}
          
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.editProfileForm}>
            <div className={styles.avatarUploadContainer}>
              <div className={styles.avatarPreview}>
                <img 
                  src={avatarPreview || 'https://placehold.jp/300x300.png'} 
                  alt={t('editProfile.avatarAlt')} 
                  className={styles.previewImage} 
                />
              </div>
              <label htmlFor="avatar" className={styles.uploadButton}>
                <svg viewBox="0 0 24 24" width="18" height="18" className={styles.uploadIcon}>
                  <path fill="currentColor" d="M19 7v11H5V7h3l1-2h6l1 2h3zm-8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                </svg>
                {t('editProfile.changePhoto')}
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
            
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <h2 className={styles.sectionTitle}>{t('editProfile.basicInfo')}</h2>
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.namePlaceholder')}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V18H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.usernamePlaceholder')}
                      autoComplete="username"
                    />
                  </div>
                  {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                </div>
                
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
                      placeholder={t('editProfile.emailPlaceholder')}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.cityPlaceholder')}
                      autoComplete="address-level2"
                    />
                  </div>
                  {errors.city && <p className={styles.errorText}>{errors.city}</p>}
                </div>
              </div>
              
              <div className={styles.formColumn}>
                <h2 className={styles.sectionTitle}>{t('editProfile.changePassword')}</h2>
                <p className={styles.sectionDescription}>{t('editProfile.passwordHint')}</p>
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="currentColor"/>
                      </svg>
                    </span>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.currentPasswordPlaceholder')}
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.currentPassword && <p className={styles.errorText}>{errors.currentPassword}</p>}
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
                      id="newPassword"
                      name="newPassword"
                      className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.newPasswordPlaceholder')}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.newPassword && <p className={styles.errorText}>{errors.newPassword}</p>}
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
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t('editProfile.confirmPasswordPlaceholder')}
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                {t('buttons.cancel')}
              </button>
              
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('editProfile.saving') : t('editProfile.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditProfilePage;