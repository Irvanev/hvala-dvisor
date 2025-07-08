// src/App.tsx
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ModeratorRoute from './components/ModeratorRoute';
import AdminRoute from './components/AdminRoute';
import { NotificationProvider } from './contexts/NotificationContext';

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
import ModeratorPage from './pages/ModeratorPage/ModeratorPage';
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';
import EditRestaurantPage from './pages/EditRestaurantPage/EditRestaurantPage';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './App.css';

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <NotificationProvider>
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


                {/* Маршруты для модераторов */}
                <Route element={<ModeratorRoute />}>
                  <Route path="/moderator" element={<ModeratorPage />} />
                  <Route path="/edit-restaurant/:restaurantId" element={<EditRestaurantPage />} />
                </Route>

                {/* Маршруты только для администраторов */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>

                {/* Маршрут для обработки несуществующих страниц */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default App;