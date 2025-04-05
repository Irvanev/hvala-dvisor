import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { uploadImage } from '../firebase/storage';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  city?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  city?: string;
  avatar?: File | null;
}

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateUser: async () => false
});

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Следим за изменением состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Преобразуем Firebase User в наш формат User
        const userObj: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          username: firebaseUser.displayName?.split(' ')[0].toLowerCase() || '',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || 'https://placehold.jp/150x150.png',
        };
        
        // Храним дополнительные данные в localStorage для демонстрации
        // В реальном приложении эти данные должны быть в Firestore
        const userData = localStorage.getItem(`userData_${firebaseUser.uid}`);
        if (userData) {
          const parsedData = JSON.parse(userData);
          userObj.city = parsedData.city;
          userObj.username = parsedData.username || userObj.username;
        }
        
        setUser(userObj);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    // Отписываемся при размонтировании компонента
    return () => unsubscribe();
  }, []);
  
  // Функция аутентификации
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      await signInWithEmailAndPassword(auth, email, password);
      
      // Настраиваем персистенцию в зависимости от rememberMe
      // Это просто демонстрация, Firebase сам управляет персистенцией
      if (rememberMe) {
        localStorage.setItem('authPersistence', 'local');
      } else {
        localStorage.setItem('authPersistence', 'session');
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция регистрации
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Создаем пользователя в Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      let photoURL = 'https://placehold.jp/150x150.png?text=User';
      
      // Если есть аватар, загружаем его в Firebase Storage
      if (userData.avatar) {
        try {
          photoURL = await uploadImage(userData.avatar, `avatars/${firebaseUser.uid}`);
        } catch (uploadError) {
          console.error('Ошибка при загрузке аватара:', uploadError);
          // Продолжаем с дефолтным аватаром
        }
      }
      
      // Обновляем профиль пользователя в Firebase
      await updateProfile(firebaseUser, {
        displayName: userData.name,
        photoURL: photoURL
      });
      
      // Сохраняем дополнительные данные в localStorage (демонстрационный подход)
      // В реальном приложении используйте Firestore
      localStorage.setItem(`userData_${firebaseUser.uid}`, JSON.stringify({
        username: userData.username,
        city: userData.city
      }));
      
      return true;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция выхода из аккаунта
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  // Функция обновления данных пользователя
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return false;
      
      let photoURL = user?.avatar;
      
      // Если есть новый аватар (файл), загружаем его в Firebase Storage
      if (userData.avatar && typeof userData.avatar === 'string' && userData.avatar.startsWith('data:')) {
        // В этом случае нам нужно конвертировать Data URL в File
        try {
          const response = await fetch(userData.avatar);
          const blob = await response.blob();
          const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          
          photoURL = await uploadImage(file, `avatars/${firebaseUser.uid}`);
          userData.avatar = photoURL;
        } catch (uploadError) {
          console.error('Ошибка при загрузке аватара:', uploadError);
        }
      }
      
      // Обновляем основные данные профиля в Firebase
      if (userData.name || userData.avatar) {
        await updateProfile(firebaseUser, {
          displayName: userData.name || firebaseUser.displayName,
          photoURL: photoURL || firebaseUser.photoURL
        });
      }
      
      // Обновляем email, если он изменился
      if (userData.email && userData.email !== firebaseUser.email) {
        await updateEmail(firebaseUser, userData.email);
      }
      
      // Сохраняем дополнительные данные в localStorage (демонстрационный подход)
      // В реальном приложении используйте Firestore
      const existingData = localStorage.getItem(`userData_${firebaseUser.uid}`);
      const parsedData = existingData ? JSON.parse(existingData) : {};
      
      localStorage.setItem(`userData_${firebaseUser.uid}`, JSON.stringify({
        ...parsedData,
        username: userData.username || parsedData.username,
        city: userData.city || parsedData.city
      }));
      
      // Обновляем состояние пользователя
      if (user) {
        setUser({
          ...user,
          ...userData
        });
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Значение провайдера
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;