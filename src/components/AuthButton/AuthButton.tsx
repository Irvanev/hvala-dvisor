import React from 'react';
import styles from './AuthButton.module.css';

interface AuthButtonProps {
  isAuthenticated: boolean;
  avatarUrl?: string;
  onClick: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  isAuthenticated, 
  avatarUrl, 
  onClick 
}) => {
  return (
    <button className={styles.authButton} onClick={onClick}>
      {isAuthenticated ? (
        avatarUrl ? (
          <img src={avatarUrl} alt="Аватар" className={styles.avatar} />
        ) : (
          <span className={styles.userIcon}>👤</span>
        )
      ) : (
        <span className={styles.signInText}>Войти / Регистрация</span>
      )}
    </button>
  );
};

export default AuthButton;