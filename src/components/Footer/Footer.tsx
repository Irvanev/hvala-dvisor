import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLogo}>
          <h3>HvalaDviser</h3>
          <p>© 2024 Все права защищены</p>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.footerColumn}>
            <h4>О нас</h4>
            <ul>
              <li>О проекте</li>
              <li>Наша команда</li>
              <li>Карьера</li>
              <li>Контакты</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Помощь</h4>
            <ul>
              <li>FAQ</li>
              <li>Поддержка</li>
              <li>Правила</li>
              <li>Политика конфиденциальности</li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Присоединяйтесь</h4>
            <ul>
              <li>Для бизнеса</li>
              <li>Партнерская программа</li>
              <li>Рекламодателям</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;