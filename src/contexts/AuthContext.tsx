import React, { createContext, useState, useEffect, useContext } from 'react';

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
  logout: () => void;
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
  logout: () => {},
  updateUser: async () => false
});

// Тестовые аккаунты для демонстрации
// (в реальном приложении эти данные будут храниться в базе данных на сервере)
const TEST_ACCOUNTS = [
  {
    id: 'test-1',
    name: 'Иван Петров',
    username: 'ivanp',
    email: 'test@example.com',
    password: 'password123',
    city: 'Москва',
    avatar: 'https://placehold.jp/150x150.png'
  }
];

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем наличие токена в localStorage или sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (token) {
          // Получаем id пользователя из токена 
          // (в реальном приложении будет декодирование JWT)
          const userId = token.split('-').pop();
          
          // Находим пользователя по id в тестовых данных
          // (в реальном приложении будет запрос к API)
          const testUser = TEST_ACCOUNTS.find(account => account.id === userId);
          
          if (testUser) {
            // Устанавливаем данные пользователя (без пароля)
            const { password, ...userData } = testUser;
            setUser(userData);
          } else {
            // Если пользователь не найден, очищаем токены
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        // Очищаем токены в случае ошибки
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Функция аутентификации
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Имитация запроса к API - поиск пользователя в тестовых данных
      // (в реальном приложении будет запрос к API)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const foundUser = TEST_ACCOUNTS.find(
        account => account.email === email && account.password === password
      );
      
      if (foundUser) {
        // Генерируем токен с id пользователя
        // (в реальном приложении токен будет генерироваться на сервере)
        const token = `auth-token-${Date.now()}-${foundUser.id}`;
        
        // Сохраняем токен в зависимости от выбора "Запомнить меня"
        if (rememberMe) {
          localStorage.setItem('authToken', token);
        } else {
          sessionStorage.setItem('authToken', token);
        }
        
        // Устанавливаем данные пользователя (без пароля)
        const { password, ...userData } = foundUser;
        setUser(userData);
        
        return true;
      }
      
      return false;
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
      
      // Имитация запроса к API для регистрации
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Проверка, что email не занят
      const emailExists = TEST_ACCOUNTS.some(account => account.email === userData.email);
      if (emailExists) {
        return false;
      }
      
      // Создаем нового пользователя 
      // (в реальном приложении это будет делать сервер)
      const newUserId = `user-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        city: userData.city,
        avatar: userData.avatar ? URL.createObjectURL(userData.avatar) : 'https://placehold.jp/150x150.png?text=User'
      };
      
      // Генерируем токен
      const token = `auth-token-${Date.now()}-${newUserId}`;
      sessionStorage.setItem('authToken', token);
      
      // Устанавливаем данные пользователя
      setUser(newUser);
      
      // В реальном приложении здесь будет сохранение на сервере
      
      return true;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция выхода из аккаунта
  const logout = () => {
    // Удаляем токен из хранилища
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Очищаем данные пользователя
    setUser(null);
  };
  
  // Функция обновления данных пользователя
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Обновляем данные пользователя
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        return true;
      }
      
      return false;
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