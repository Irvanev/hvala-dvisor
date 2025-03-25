import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage/RestaurantPage';
import './App.css';

const App: React.FC = () => {

  
  return (
    <Router>
      <Routes>

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/" element={<HomePage />} />
      
      </Routes>
    </Router>
  );
};

export default App;