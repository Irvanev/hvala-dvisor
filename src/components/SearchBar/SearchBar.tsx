import React from "react";
import { Input } from "antd";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import "./SearchBar.module.css";

const { Search } = Input;

interface SearchBarProps {
  location: string;
  placeholder: string;
  onLocationClick?: () => void;
  onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  location,
  placeholder,
  onLocationClick,
  onSearch,
}) => {
  return (
    <div className="search-bar">
      <div className="location" onClick={onLocationClick}>
        <EnvironmentOutlined className="location-icon" />
        <span className="location-text">{location}</span>
      </div>
      <Search
        placeholder={placeholder}
        onSearch={onSearch}
        enterButton={<SearchOutlined />}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
