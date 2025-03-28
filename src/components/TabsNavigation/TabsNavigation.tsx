import React from 'react';
import styles from './TabsNavigation.module.css';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: any) => void;
  tabs: Tab[];
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab, index) => (
        <button 
          key={tab.id}
          className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={styles.tabLabel}>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={styles.tabCount}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabsNavigation;