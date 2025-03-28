import React, { useState, useEffect } from 'react';
import { geoPath, geoMercator } from 'd3-geo';
import './BalkanMap.module.css';

// Типизация для стран
interface Country {
  id: string;
  name: string;
  path: string;
}

// Типизация пропсов
interface BalkanMapProps {
  onCountryClick: (countryId: string) => void;
}

const BalkanMap: React.FC<BalkanMapProps> = ({ onCountryClick }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем GeoJSON и конвертируем в SVG-пути
  useEffect(() => {
    setLoading(true);
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then((response) => response.json())
      .then((geoJson) => {
        // Фильтруем страны Балкан
        const balkanCountries = geoJson.features.filter((feature: any) =>
          ['MNE', 'HRV', 'SRB', 'BIH', 'ALB', 'MKD'].includes(feature.properties.ISO_A3)
        );

        // Настраиваем проекцию
        const projection = geoMercator()
          .center([19, 43.5]) // Сдвигаем центр немного западнее (19 вместо 20) и чуть севернее (43.5 вместо 43)
          .scale(1800) // Уменьшаем масштаб, чтобы карта лучше помещалась
          .translate([150, 250]); // Оставляем центрирование в SVG

        // Конвертируем в SVG-пути
        const pathGenerator = geoPath().projection(projection);
        const mappedCountries = balkanCountries.map((feature: any) => ({
          id: feature.properties.ISO_A3.toLowerCase(),
          name: feature.properties.NAME,
          path: pathGenerator(feature) || '',
        }));

        setCountries(mappedCountries);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки карты:', error);
        setError('Не удалось загрузить карту. Попробуйте позже.');
        setLoading(false);
      });
  }, []);

  // Обработчики событий
  const handleMouseEnter = (countryId: string) => {
    setHoveredCountry(countryId);
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
  };

  if (loading) {
    return <div>Загрузка карты...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="map-container">
      <svg viewBox="0 0 300 500" preserveAspectRatio="xMidYMid meet">
        {countries.map((country) => (
          <path
            key={country.id}
            d={country.path}
            className={`country ${hoveredCountry === country.id ? 'hovered' : ''}`}
            onMouseEnter={() => handleMouseEnter(country.id)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onCountryClick(country.id)}
          />
        ))}
      </svg>
    </div>
  );
};

export default BalkanMap;