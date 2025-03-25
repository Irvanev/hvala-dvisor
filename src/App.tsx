import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import './App.css';

const App: React.FC = () => {

  
  return (
    <Router>
      <Routes>

        <Route path="/profile" element={<ProfilePage />} />
      
      </Routes>
    </Router>
  );
};

export default App;