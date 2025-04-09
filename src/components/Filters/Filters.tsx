import React from 'react';
import styles from './Filters.module.css';

interface FiltersProps {
  selectedTypes: string[];
  priceRangeValue: number;
  ratingValue: number;
  selectedCuisines: string[];
  collapsedFilters: {
    typeFilter: boolean;
    priceFilter: boolean;
    ratingFilter: boolean;
    cuisineFilter: boolean;
  };
  onTypeChange: (type: string) => void;
  onCuisineChange: (cuisine: string) => void;
  onPriceChange: (value: number) => void;
  onRatingChange: (value: number) => void;
  onToggleFilter: (filterName: string) => void;
  onApplyFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  selectedTypes,
  priceRangeValue,
  ratingValue,
  selectedCuisines,
  collapsedFilters,
  onTypeChange,
  onCuisineChange,
  onPriceChange,
  onRatingChange,
  onToggleFilter,
  onApplyFilters
}) => {
  return (
    <div className={styles.filtersContainer}>
      {/* Фильтр по типу заведения */}
      <div className={styles.filterSection}>
        <h3 onClick={() => onToggleFilter('typeFilter')}>
          Тип Кухни
          <span className={styles.arrowIcon}>
            {collapsedFilters.typeFilter ? '▶' : '▼'}
          </span>
        </h3>
        
        {!collapsedFilters.typeFilter && (
          <div className={styles.filterContent}>
            <div className={styles.filterOptions}>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes('Ресторан')}
                  onChange={() => onTypeChange('Ресторан')}
                />
                <span>Ресторан</span>
              </label>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes('Кафе')}
                  onChange={() => onTypeChange('Кафе')}
                />
                <span>Кафе</span>
              </label>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes('Бар')}
                  onChange={() => onTypeChange('Бар')}
                />
                <span>Бар</span>
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Фильтр по цене */}
      <div className={styles.filterSection}>
        <h3 onClick={() => onToggleFilter('priceFilter')}>
          По Цене
          <span className={styles.arrowIcon}>
            {collapsedFilters.priceFilter ? '▶' : '▼'}
          </span>
        </h3>
        
        {!collapsedFilters.priceFilter && (
          <div className={styles.filterContent}>
            <div className={styles.rangeSlider}>
              <input 
                type="range" 
                min="1" 
                max="4" 
                value={priceRangeValue}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className={styles.rangeInput}
              />
              <div className={styles.rangeLabels}>
                <span>$</span>
                <span>$$</span>
                <span>$$$</span>
                <span>$$$$</span>
              </div>
              <div className={styles.selectedValue}>
                Выбрано: {Array(priceRangeValue).fill('$').join('')}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Фильтр по рейтингу */}
      <div className={styles.filterSection}>
        <h3 onClick={() => onToggleFilter('ratingFilter')}>
          Рейтинг
          <span className={styles.arrowIcon}>
            {collapsedFilters.ratingFilter ? '▶' : '▼'}
          </span>
        </h3>
        
        {!collapsedFilters.ratingFilter && (
          <div className={styles.filterContent}>
            <div className={styles.rangeSlider}>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.5"
                value={ratingValue}
                onChange={(e) => onRatingChange(Number(e.target.value))}
                className={styles.rangeInput}
              />
              <div className={styles.selectedValue}>
                {ratingValue === 0 ? 'Любой' : `От ${ratingValue} звёзд`}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Фильтр по кухням */}
      <div className={styles.filterSection}>
        <h3 onClick={() => onToggleFilter('cuisineFilter')}>
          Кухни
          <span className={styles.arrowIcon}>
            {collapsedFilters.cuisineFilter ? '▶' : '▼'}
          </span>
        </h3>
        
        {!collapsedFilters.cuisineFilter && (
          <div className={styles.filterContent}>
            <div className={styles.filterOptions}>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedCuisines.includes('Кавказская кухня')}
                  onChange={() => onCuisineChange('Кавказская кухня')}
                />
                <span>Кавказа</span>
              </label>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedCuisines.includes('Европейская')}
                  onChange={() => onCuisineChange('Европейская')}
                />
                <span>Европы</span>
              </label>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedCuisines.includes('Средиземноморская')}
                  onChange={() => onCuisineChange('Средиземноморская')}
                />
                <span>Средиземноморская</span>
              </label>
              <label className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={selectedCuisines.includes('Итальянская')}
                  onChange={() => onCuisineChange('Итальянская')}
                />
                <span>Итальянская</span>
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопка применения фильтров */}
      <button 
        className={styles.applyFiltersButton}
        onClick={onApplyFilters}
      >
        Применить фильтры
      </button>
    </div>
  );
};

export default Filters;