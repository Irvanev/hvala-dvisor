import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
  updatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { auth, db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  city?: string;
  avatar?: string;
  favorites?: string[];
  role?: string;
  // Добавлены недостающие свойства
  displayName?: string;  // Имя пользователя из Firebase Auth
  photoURL?: string;     // URL фото профиля из Firebase Auth
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  addToFavorites: (restaurantId: string) => Promise<boolean>;
  removeFromFavorites: (restaurantId: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>; // Добавляем метод для входа через Google
  // Для совместимости с PrivateRoute
  currentUser: FirebaseUser | null;
  userProfile: User | null;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  city?: string;
  avatar?: File | null;
}

// Функция для загрузки изображения в Firebase Storage
const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateUser: async () => false,
  addToFavorites: async () => false,
  removeFromFavorites: async () => false,
  resetPassword: async () => false,
  loginWithGoogle: async () => false, // Добавляем пустую реализацию
  currentUser: null,
  userProfile: null
});

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Функция для получения расширенных данных пользователя из Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Создаем базовый объект пользователя из Firebase Auth
    const userObj: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || '',  // используем displayName из Firebase
      email: firebaseUser.email || '',
      username: firebaseUser.displayName?.split(' ')[0].toLowerCase() || '',
      avatar: firebaseUser.photoURL || 'https://placehold.jp/150x150.png?text=User', // используем photoURL из Firebase
      favorites: []
    };
    
    try {
      // Пытаемся получить расширенные данные из Firestore
      const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Копируем существующие свойства из Firestore
        if (userData.name) userObj.name = userData.name;
        if (userData.username) userObj.username = userData.username;
        if (userData.city) userObj.city = userData.city;
        if (userData.avatar) userObj.avatar = userData.avatar;
        if (userData.favorites) userObj.favorites = userData.favorites;
        if (userData.role) userObj.role = userData.role;
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя из Firestore:', error);
    }
    
    return userObj;
  };
  
  // Следим за изменением состояния аутентификации
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser); // Устанавливаем currentUser для совместимости с PrivateRoute
      
      if (firebaseUser) {
        // Получаем расширенные данные пользователя
        const userObj = await getUserData(firebaseUser);
        setUser(userObj);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    // Отписываемся при размонтировании компонента
    return () => unsubscribe();
  }, []);
  
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Создаем провайдер Google
      const provider = new GoogleAuthProvider();
      
      // Предпочтение для выбора аккаунта каждый раз
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Выполняем вход с помощью popup
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Проверяем, есть ли документ пользователя в Firestore
      const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Если пользователь входит впервые, создаем его документ в Firestore
        await setDoc(doc(db, 'Users', firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          username: firebaseUser.displayName?.split(' ')[0].toLowerCase() || '',
          avatar: firebaseUser.photoURL || 'https://placehold.jp/150x150.png?text=User',
          role: 'user',
          favorites: [],
          timestamps: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при входе через Google:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
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
      
      // Сохраняем данные пользователя в Firestore
      await setDoc(doc(db, 'Users', firebaseUser.uid), {
        email: userData.email,
        displayName: userData.name,
        name: userData.name,
        username: userData.username,
        photoURL: photoURL,
        avatar: photoURL,
        city: userData.city || '',
        role: 'user',
        favorites: [],
        timestamps: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      });
      
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
  
  // Функция сброса пароля
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      return false;
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
      
      // Обновляем данные в Firestore
      const userDocRef = doc(db, 'Users', firebaseUser.uid);
      
      // Подготавливаем данные для обновления
      const updateData: any = {
        ...userData,
        'timestamps.updatedAt': serverTimestamp()
      };
      
      // Если изменилось имя, обновляем оба поля - name и displayName
      if (userData.name) {
        updateData.name = userData.name;
        updateData.displayName = userData.name;
      }
      
      // Если изменился аватар, обновляем оба поля - avatar и photoURL
      if (photoURL) {
        updateData.avatar = photoURL;
        updateData.photoURL = photoURL;
      }
      
      // Обновляем документ в Firestore
      await updateDoc(userDocRef, updateData);
      
      // Обновляем состояние пользователя
      if (user) {
        setUser({
          ...user,
          ...userData,
          avatar: photoURL || user.avatar
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
  
  // Функция добавления ресторана в избранное
  const addToFavorites = async (restaurantId: string): Promise<boolean> => {
    if (!user || !auth.currentUser) return false;
    
    try {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      
      // Добавляем ID ресторана в массив favorites в Firestore
      await updateDoc(userRef, {
        favorites: arrayUnion(restaurantId),
        'timestamps.updatedAt': serverTimestamp()
      });
      
      // Обновляем локальное состояние
      setUser({
        ...user,
        favorites: [...(user.favorites || []), restaurantId]
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error);
      return false;
    }
  };
  
  // Функция удаления ресторана из избранного
  const removeFromFavorites = async (restaurantId: string): Promise<boolean> => {
    if (!user || !auth.currentUser) return false;
    
    try {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      
      // Удаляем ID ресторана из массива favorites в Firestore
      await updateDoc(userRef, {
        favorites: arrayRemove(restaurantId),
        'timestamps.updatedAt': serverTimestamp()
      });
      
      // Обновляем локальное состояние
      setUser({
        ...user,
        favorites: (user.favorites || []).filter(id => id !== restaurantId)
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      return false;
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
    updateUser,
    addToFavorites,
    removeFromFavorites,
    resetPassword,
    loginWithGoogle, // Добавляем метод для входа через Google
    currentUser,
    userProfile: user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;