// src/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './config';

// Создаем провайдер Google
const googleProvider = new GoogleAuthProvider();

/**
 * Вход с использованием всплывающего окна Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Добавляем scope для получения доступа к профилю пользователя
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    // Показываем UI выбора аккаунта даже если у пользователя только один аккаунт
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Ошибка при входе через Google:', error);
    throw error;
  }
};

/**
 * Вход с использованием редиректа Google (лучше для мобильных устройств)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    // Добавляем scope для получения доступа к профилю пользователя
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    
    // Показываем UI выбора аккаунта даже если у пользователя только один аккаунт
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Ошибка при редиректе на Google:', error);
    throw error;
  }
};

/**
 * Получение результата после редиректа от Google
 */
export const getGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error('Ошибка при получении результата Google авторизации:', error);
    throw error;
  }
};

/**
 * Регистрация нового пользователя с email и паролем
 */
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Если указано отображаемое имя, обновляем профиль пользователя
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
};

/**
 * Вход пользователя с email и паролем
 */
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};

/**
 * Анонимный вход
 */
export const loginAnonymously = async (): Promise<UserCredential> => {
  try {
    return await signInAnonymously(auth);
  } catch (error) {
    console.error('Ошибка при анонимном входе:', error);
    throw error;
  }
};

/**
 * Выход пользователя
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    throw error;
  }
};

/**
 * Отправка письма для сброса пароля
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Ошибка при отправке письма для сброса пароля:', error);
    throw error;
  }
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Преобразование ошибок Firebase в понятные сообщения для пользователя
 */
export const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Этот email уже используется другим аккаунтом.';
    case 'auth/invalid-email':
      return 'Указан неверный email.';
    case 'auth/weak-password':
      return 'Пароль слишком слабый. Используйте не менее 6 символов.';
    case 'auth/user-not-found':
      return 'Пользователь с таким email не найден.';
    case 'auth/wrong-password':
      return 'Неверный пароль.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток входа. Пожалуйста, попробуйте позже.';
    case 'auth/network-request-failed':
      return 'Проблема с сетевым подключением. Пожалуйста, проверьте ваше интернет-соединение.';
    case 'auth/popup-closed-by-user':
      return 'Окно авторизации было закрыто до завершения входа.';
    case 'auth/cancelled-popup-request':
      return 'Запрос на всплывающее окно был отменен.';
    case 'auth/popup-blocked':
      return 'Всплывающее окно было заблокировано браузером. Пожалуйста, разрешите всплывающие окна для этого сайта.';
    case 'auth/account-exists-with-different-credential':
      return 'Email уже используется другим методом входа. Попробуйте войти другим способом.';
    default:
      return 'Произошла ошибка аутентификации. Пожалуйста, попробуйте еще раз.';
  }
};