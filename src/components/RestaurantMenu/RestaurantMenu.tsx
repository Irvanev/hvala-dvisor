import React from 'react';
import styles from './RestaurantMenu.module.css';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  isPopular?: boolean;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface RestaurantMenuProps {
  menu: MenuCategory[];
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ menu }) => {
  const { t } = useAppTranslation();

  return (
    <div className={styles.menuSection}>
      <h2 className={styles.sectionTitle}>{t('restaurantMenu.title')}</h2>
      
      {menu.map((category, index) => (
        <div key={index} className={styles.menuCategory}>
          <h3 className={styles.menuCategoryTitle}>{category.category}</h3>
          <div className={styles.menuItems}>
            {category.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={`${styles.menuItem} ${item.isPopular ? styles.popularItem : ''}`}
              >
                <div className={styles.menuItemHeader}>
                  <h4 className={styles.menuItemName}>
                    {item.name}
                    {item.isPopular && (
                      <span className={styles.popularBadge}>
                        {t('restaurantMenu.popular')}
                      </span>
                    )}
                  </h4>
                  <div className={styles.menuItemPrice}>{item.price}</div>
                </div>
                <p className={styles.menuItemDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className={styles.menuNote}>
        <p>{t('restaurantMenu.note')}</p>
      </div>
    </div>
  );
};

export default RestaurantMenu;