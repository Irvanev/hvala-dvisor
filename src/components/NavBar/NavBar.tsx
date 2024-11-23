import React, { useState } from 'react';
import { handleSearch } from '../../utils/searchUtil'; // Import business logic
import styles from './NavBar.module.css'; // Import CSS module
import SearchBar from "../SearchBar/SearchBar.tsx";

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const onSearch = () => {
    handleSearch(searchQuery); // Call business logic function
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>HvalaDviser</div>
      <ul className={styles.navLinks}>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Contact</a></li>
        <li><a href="#">Blog</a></li>
      </ul>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.searchButton} onClick={onSearch}>
          <img
            src="https://img.icons8.com/ios-glyphs/30/ffffff/search--v1.png"
            alt="Search Icon"
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
