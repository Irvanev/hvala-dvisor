// src/components/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC = () => {
  const { currentUser, isAdmin, isLoading } = useAuth();
  
  // Показываем загрузку, пока проверяем состояние аутентификации
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  // Если пользователь не авторизован или не является администратором, перенаправляем на страницу входа
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  // Если пользователь авторизован и является администратором, показываем содержимое защищенного маршрута
  return <Outlet />;
};

export default AdminRoute;