// src/components/ModeratorRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ModeratorRoute: React.FC = () => {
  const { currentUser, isModerator, isLoading } = useAuth();
  
  // Показываем загрузку, пока проверяем состояние аутентификации
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  // Если пользователь не авторизован или не имеет прав модератора, перенаправляем на страницу входа
  if (!currentUser || !isModerator) {
    return <Navigate to="/login" replace />;
  }
  
  // Если пользователь авторизован и имеет права модератора, показываем содержимое защищенного маршрута
  return <Outlet />;
};

export default ModeratorRoute;