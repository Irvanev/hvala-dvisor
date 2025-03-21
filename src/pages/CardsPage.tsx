import React from "react";
import NavBar from "../components/NavBar/NavBar";
import SearchBar from "../components/SearchBar/SearchBar";
import Section from "../components/Section/Section";
import Style from "./CardsPage.module.css";

function CardsPage() {
  const handleLocationClick = () => {
    alert("Location clicked!");
  };

  const handleSearch = (value: string) => {
    console.log("Search value:", value);
  };

  const restaurantCards = [
    { image: "", title: "", location: "", rating: 0 },
    { image: "", title: "", location: "", rating: 0 },
  ];

  const countryCards = [
    { image: "", title: "", location: "", rating: 0 },
    { image: "", title: "", location: "", rating: 0 },
    { image: "", title: "", location: "", rating: 0 },
  ];

  const cuisineCards = [
    { image: "", title: "", location: "", rating: 0 },
    { image: "", title: "", location: "", rating: 0 },
    { image: "", title: "", location: "", rating: 0 },
  ];

  return (
    <div className={Style.cardsPage}>
      <NavBar />
      <div className={Style.hero}>
        <h1>EXPLORE MONTENEGRO</h1>
        <div className={Style.searchBarWrapper}>
          <SearchBar
            location="Paris"
            placeholder="Что-то для чего-то"
            onLocationClick={handleLocationClick}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <div className={Style.sections}>
        <Section title="Лучшие рестораны 2024 года" cards={restaurantCards} />
        <Section title="Популярные страны" cards={countryCards} />
        <Section title="Популярные кухни" cards={cuisineCards} />
      </div>
    </div>
  );
}

export default CardsPage;