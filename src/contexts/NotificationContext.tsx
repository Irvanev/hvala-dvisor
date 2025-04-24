// src/contexts/NotificationContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification/Notification';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextProps {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setMessage(message);
    setType(type);
    setIsVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        message={message}
        type={type}
        isVisible={isVisible}
        onClose={handleClose}
        duration={3000} // Уведомление автоматически закроется через 3 секунды
      />
    </NotificationContext.Provider>
  );
};