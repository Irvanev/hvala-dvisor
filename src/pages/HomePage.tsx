import React from "react";
import NavBar from "../components/NavBar/NavBar";
import  Style  from "./HomePage.module.css";
import SearchBar from "../components/SearchBar/SearchBar.tsx"

function HomePage() {

    const handleLocationClick = () => {
        alert("Location clicked!");
    };

    const handleSearch = (value: string) => {
        console.log("Search value:", value);
    };
    
    return (
        <div className={Style.homePage}>
            <NavBar/>
            <div style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -52px)", color: "white", fontSize: "52px", fontWeight: "bolder", fontFamily: "Poppins, sans-serif"}}>
                EXPLORE MONTENEGRO
            </div>
            <div
                style={{
                position: "absolute",
                top: "calc(50% + 50px)", // Нижний отступ от текста
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%", // Для адаптации SearchBar
                maxWidth: "600px", // Лимит ширины
                }}
            >
                <SearchBar
                location="Paris"
                placeholder="Что-то для чего-то"
                onLocationClick={handleLocationClick}
                onSearch={handleSearch}
                />
            </div>
        </div>
    )
}

export default HomePage;