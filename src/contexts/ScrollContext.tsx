import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScrollPositionContextType {
  scrollPositions: Record<string, number>;
  saveScrollPosition: (path: string, position: number) => void;
  getScrollPosition: (path: string) => number | undefined;
}

const ScrollPositionContext = createContext<ScrollPositionContextType>({
  scrollPositions: {},
  saveScrollPosition: () => {},
  getScrollPosition: () => undefined,
});

interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  // Сохраняем позицию прокрутки для указанного пути
  const saveScrollPosition = (path: string, position: number) => {
    setScrollPositions(prev => ({
      ...prev,
      [path]: position,
    }));
  };

  // Получаем позицию прокрутки для указанного пути
  const getScrollPosition = (path: string): number | undefined => {
    return scrollPositions[path];
  };

  return (
    <ScrollPositionContext.Provider
      value={{
        scrollPositions,
        saveScrollPosition,
        getScrollPosition,
      }}
    >
      {children}
    </ScrollPositionContext.Provider>
  );
};

// Хук для использования контекста позиции прокрутки
export const useScrollPosition = () => useContext(ScrollPositionContext);