import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Компонент-обертка для защищенных маршрутов
const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Показываем индикатор загрузки, пока проверяется аутентификация
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="loading-spinner"></div>
        <p>Проверка аутентификации...</p>
      </div>
    );
  }
  
  // Перенаправляем на страницу входа, если пользователь не аутентифицирован
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Если пользователь аутентифицирован, рендерим защищенный контент
  return <Outlet />;
};

export default PrivateRoute;