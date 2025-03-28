import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HomePage from '../src/pages/HomePage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';

// import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage/ForgotPasswordPage';
// import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          
          {/* Защищенные маршруты (требуют аутентификации) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            {/* Здесь можно добавить другие защищенные маршруты */}
          </Route>
          
          {/* Маршрут для обработки несуществующих страниц */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;