// src/components/AdminNavigation/AdminNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminNavigation.module.css';

const AdminNavigation: React.FC = () => {
  const { userRole, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  
  // Если пользователь не модератор и не админ, не показываем навигацию
  if (!isModerator) {
    return null;
  }
  
  return (
    <div className={styles.adminNavContainer}>
      <div className={styles.adminNav}>
        <h2 className={styles.navTitle}>Панель управления</h2>
        
        <ul className={styles.navList}>
          {/* Ссылка на модерацию ресторанов (доступна модераторам и админам) */}
          <li className={styles.navItem}>
            <Link 
              to="/moderator" 
              className={`${styles.navLink} ${location.pathname === '/moderator' ? styles.activeLink : ''}`}
            >
              <span className={styles.navIcon}>🍽️</span>
              Модерация ресторанов
            </Link>
          </li>
          
          {/* Ссылка на управление пользователями (только для администраторов) */}
          {isAdmin && (
            <li className={styles.navItem}>
              <Link 
                to="/admin/users" 
                className={`${styles.navLink} ${location.pathname === '/admin/users' ? styles.activeLink : ''}`}
              >
                <span className={styles.navIcon}>👥</span>
                Управление пользователями
              </Link>
            </li>
          )}
        </ul>
        
        <div className={styles.roleInfo}>
          <div className={styles.roleTag}>
            {userRole === 'admin' ? 'Администратор' : 'Модератор'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;