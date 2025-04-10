// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import AddRestaurantPage from './pages/AddRestaurantPage/AddRestaurantPage';
import BestRestaurantsPage from './pages/BestRestaurantsPage/BestRestaurantsPage';
import SearchResultsPage from './pages/SearchResultsPage/SearchResultsPage';

import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/add-restaurant" element={<AddRestaurantPage />} />
          <Route path="/best" element={<BestRestaurantsPage />} />
          <Route path="/s" element={<SearchResultsPage />} />

          {/* Защищенные маршруты (требуют аутентификации) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            {/* Здесь можно добавить другие защищенные маршруты */}
          </Route>

          {/* Защищенные маршруты только для администраторов */}
          <Route element={<PrivateRoute adminOnly={true} />}>
            <Route path="/admin" element={<div>Админ панель</div>} />
            {/* Здесь можно добавить другие маршруты для администраторов */}
          </Route>
          
          {/* Маршрут для обработки несуществующих страниц */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;