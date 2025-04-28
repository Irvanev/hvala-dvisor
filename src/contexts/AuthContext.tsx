import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  updateProfile,
  getIdTokenResult 
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

// Расширяем типы ролей пользователей
export type UserRole = 'guest' | 'registered' | 'owner' | 'moderator' | 'admin';

// Интерфейс для хранения дополнительной информации о пользователе
interface UserProfile {
  uid: string;
  id: string; // Добавлено для совместимости со старым кодом
  name?: string;
  username?: string;
  email: string;
  city?: string;
  avatar?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  favorites?: string[]; // Список ID избранных ресторанов
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  username?: string;
  city?: string;
  avatar?: File | null;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  user: UserProfile | null; // Алиас для userProfile для совместимости со старым кодом
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean; // Новое свойство
  isModerator: boolean; // Новое свойство
  userRole: UserRole; // Новое свойство
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  registerWithGoogle: () => Promise<boolean>;
  updateUser: (data: Partial<UserProfile>) => Promise<boolean>;
  checkAdminRights: () => boolean; // Новый метод
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState(true);

  // Получение профиля пользователя из Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'uid' | 'id'>;
        const profile = { 
          uid, 
          id: uid, // Добавляем id как алиас для uid
          ...userData 
        };
        
        setUserProfile(profile);
        
        // Устанавливаем роль пользователя из профиля
        if (profile.role) {
          setUserRole(profile.role);
        } else {
          setUserRole('registered');
        }
      } else {
        console.log('Профиль пользователя не найден в Firestore');
        setUserProfile(null);
        setUserRole('guest');
      }
      
      // Проверяем custom claims для получения роли пользователя
      try {
        const idTokenResult = await getIdTokenResult(auth.currentUser!);
        if (idTokenResult.claims.role) {
          const claimRole = idTokenResult.claims.role as UserRole;
          setUserRole(claimRole);
          
          // Если роль в claims отличается от роли в профиле, обновляем профиль
          if (userDoc.exists() && userDoc.data().role !== claimRole) {
            await setDoc(userDocRef, { role: claimRole, updatedAt: new Date() }, { merge: true });
          }
        }
      } catch (error) {
        console.error('Ошибка при получении custom claims:', error);
      }
      
    } catch (error) {
      console.error('Ошибка при получении профиля пользователя:', error);
      setUserProfile(null);
      setUserRole('guest');
    }
  };

  // Создание или обновление профиля пользователя в Firestore
  const createOrUpdateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      // Если профиль уже существует, обновляем его
      if (userDoc.exists()) {
        const updateData = {
          ...data,
          updatedAt: new Date()
        };
        await setDoc(userDocRef, updateData, { merge: true });
      } 
      // Если профиля нет, создаем новый
      else {
        const newProfile = {
          uid,
          id: uid, // Добавляем id как алиас для uid
          email: data.email || '',
          name: data.name || '',
          username: data.username || '',
          city: data.city || '',
          avatar: data.avatar || '',
          role: data.role || 'registered', // По умолчанию зарегистрированный пользователь
          createdAt: new Date(),
          updatedAt: new Date(),
          favorites: [] // Инициализируем пустым массивом
        };
        await setDoc(userDocRef, newProfile);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при создании/обновлении профиля пользователя:', error);
      return false;
    }
  };

  // Отслеживание состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setUserRole('guest');
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Вход с email и паролем
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(userCredential.user.uid);
      return true;
    } catch (e) {
      console.error('Ошибка при входе:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Вход через Google
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);

      // Проверяем, существует ли профиль пользователя
      const userExists = await getDoc(doc(firestore, 'users', result.user.uid));
      
      // Если нет профиля, создаем его
      if (!userExists.exists()) {
        const { user } = result;
        await createOrUpdateUserProfile(user.uid, {
          email: user.email || '',
          name: user.displayName || '',
          avatar: user.photoURL || '',
        });
      }
      
      await fetchUserProfile(result.user.uid);
      return true;
    } catch (e) {
      console.error('Ошибка при входе через Google:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      console.error('Ошибка при сбросе пароля:', e);
      return false;
    }
  };

  // Регистрация нового пользователя
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // Создаем пользователя с email и паролем
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Обновляем профиль пользователя в Firebase Auth
      if (data.name && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.name
        });
      }
      
      // Создаем профиль пользователя в Firestore
      await createOrUpdateUserProfile(userCredential.user.uid, {
        email: data.email,
        name: data.name,
        username: data.username,
        city: data.city,
        role: 'registered', // По умолчанию зарегистрированный пользователь
        // Здесь нужно загрузить аватар на Firebase Storage и получить URL
        // avatar: avatarUrl
      });
      
      await fetchUserProfile(userCredential.user.uid);
      return true;
    } catch (e) {
      console.error('Ошибка при регистрации:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Регистрация через Google
  const registerWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Создаем профиль пользователя в Firestore
      const { user } = result;
      await createOrUpdateUserProfile(user.uid, {
        email: user.email || '',
        name: user.displayName || '',
        avatar: user.photoURL || '',
        role: 'registered', // По умолчанию зарегистрированный пользователь
      });
      
      await fetchUserProfile(user.uid);
      return true;
    } catch (e) {
      console.error('Ошибка при регистрации через Google:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление данных пользователя
  const updateUser = async (data: Partial<UserProfile>) => {
    if (!currentUser) return false;
    
    try {
      setIsLoading(true);
      
      // Если обновляем displayName, обновляем его в Firebase Auth
      if (data.name) {
        await updateProfile(currentUser, { displayName: data.name });
      }
      
      // Обновляем профиль в Firestore
      await createOrUpdateUserProfile(currentUser.uid, data);
      
      // Обновляем локальное состояние
      await fetchUserProfile(currentUser.uid);
      
      return true;
    } catch (e) {
      console.error('Ошибка при обновлении профиля:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Выход из аккаунта
  const logout = async () => {
    try {
      await signOut(auth);
      // После выхода currentUser будет установлен в null через onAuthStateChanged
    } catch (e) {
      console.error('Ошибка при выходе:', e);
    }
  };

  // Проверка прав администратора
  const checkAdminRights = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  // Вычисляемые свойства для проверки ролей
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || userRole === 'admin';

  const value = {
    currentUser,
    userProfile,
    user: userProfile, // Добавляем алиас user для userProfile
    isLoading,
    isAuthenticated: !!currentUser,
    isAdmin,
    isModerator,
    userRole,
    login,
    logout,
    loginWithGoogle,
    register,
    registerWithGoogle,
    updateUser,
    checkAdminRights,
    resetPassword
  };



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);