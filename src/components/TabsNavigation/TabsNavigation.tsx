import React from 'react';
import styles from './TabsNavigation.module.css';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string; // Опциональная иконка для вкладки
}

interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: any) => void;
  tabs: Tab[];
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      
      <div className={styles.tabIndicator}>
        <div 
          className={styles.indicator} 
          style={{ 
            left: `calc(${100 / tabs.length * tabs.findIndex(tab => tab.id === activeTab)}% + 10px)`,
            width: `calc(${100 / tabs.length}% - 20px)`
          }}
        />
      </div>
    </div>
  );
};

export default TabsNavigation;