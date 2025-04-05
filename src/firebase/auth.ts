// src/firebase/auth.ts
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    UserCredential,
    User
  } from 'firebase/auth';
  import { auth } from './config';
  
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
      default:
        return 'Произошла ошибка аутентификации. Пожалуйста, попробуйте еще раз.';
    }
  };
  