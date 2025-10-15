// src/contexts/GoogleMapsContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: false
});

interface GoogleMapsProviderProps {
  children: ReactNode;
}

// Библиотеки которые нужно загрузить один раз для всего приложения
const libraries: Array<"places" | "geometry"> = ["places"];

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('Google Maps API загружен успешно');
  };

  const handleError = (error: Error) => {
    setLoadError(true);
    console.error('Ошибка загрузки Google Maps API:', error);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p>Загрузка Google Maps...</p>
          </div>
        </div>
      }
    >
      <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
};