import React, { useState, useRef, ReactNode, useEffect } from 'react';
import styles from './Carousel.module.css';

interface CarouselProps {
  children: ReactNode;
  itemWidth?: number;
  spaceBetween?: number;
  slidesPerView?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  itemWidth = 280,
  spaceBetween = 16,
  slidesPerView = 'auto'
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px tolerance
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      checkScroll(); // Check initially
      return () => carousel.removeEventListener('scroll', checkScroll);
    }
  }, [children]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    if (carouselRef.current) {
      const x = e.pageX - (carouselRef.current.offsetLeft || 0);
      const scroll = scrollLeft - (x - startX);
      carouselRef.current.scrollLeft = scroll;
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
      setScrollLeft(carouselRef.current?.scrollLeft || 0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    if (carouselRef.current) {
      const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
      const scroll = scrollLeft - (x - startX);
      carouselRef.current.scrollLeft = scroll;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ 
        left: itemWidth + spaceBetween, 
        behavior: 'smooth' 
      });
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ 
        left: -(itemWidth + spaceBetween), 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.carousel}
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={typeof slidesPerView === 'number' 
          ? { gridTemplateColumns: `repeat(${slidesPerView}, 1fr)` } 
          : {}}
      >
        {children}
      </div>
      
      <button 
        className={`${styles.navButton} ${styles.prevButton} ${!canScrollLeft ? styles.disabled : ''}`}
        onClick={handlePrev}
        disabled={!canScrollLeft}
        aria-label="Previous"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button 
        className={`${styles.navButton} ${styles.nextButton} ${!canScrollRight ? styles.disabled : ''}`}
        onClick={handleNext}
        disabled={!canScrollRight}
        aria-label="Next"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default Carousel;