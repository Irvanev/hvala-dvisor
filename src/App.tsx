import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import CountryPage from './pages/CountryPage/CountryPage';
import BalkanMap from './components/BalkanMap/BalkanMap';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
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
        <Route path="/explore" element={<BalkanMap />} />
        <Route path="/country/:countrySlug" element={<CountryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Защищенные маршруты (требуют авторизации) */}
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} 
        />
        
        {/* Маршрут по умолчанию */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;