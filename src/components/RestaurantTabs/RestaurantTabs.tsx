import React from 'react';
import styles from './RestaurantTabs.module.css';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface RestaurantTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  // Removed onShare prop
}

const RestaurantTabs: React.FC<RestaurantTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
  // Removed onShare parameter
}) => {
  // Вычисляем позицию и ширину индикатора
  const getIndicatorPosition = () => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabWidth = 100 / tabs.length;
    const position = tabWidth * activeIndex;
    return {
      left: `${position}%`,
      width: `${tabWidth}%`
    };
  };

  const indicatorStyle = getIndicatorPosition();

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsWrapper}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={styles.tabBadge}>{tab.count}</span>
            )}
          </button>
        ))}
        <div
          className={styles.tabIndicator}
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        ></div>
      </div>
      {/* Removed share button */}
    </div>
  );
};

export default RestaurantTabs;