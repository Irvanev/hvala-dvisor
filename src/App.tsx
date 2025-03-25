import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import './App.css';

const App: React.FC = () => {
  // Здесь в реальном приложении будет проверка аутентификации пользователя
  const isAuthenticated = false; // Изменить на true для отладки защищенных маршрутов
  
  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
      
        {/* Маршрут по умолчанию */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;