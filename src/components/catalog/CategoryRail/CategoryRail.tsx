import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../../data/categories';
import styles from './CategoryRail.module.css';

export interface CategoryRailProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  return (
    <div className={styles.container} role="region" aria-label="Kateqoriya naviqasiyası">
      <button
        type="button"
        className={styles.arrowBtn}
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        aria-label="Əvvəlki kateqoriyalar"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className={styles.scrollArea}
        onScroll={checkScroll}
        onWheel={handleWheel}
        aria-label="Kateqoriya siyahısı"
      >
        <button
          type="button"
          className={`${styles.tab} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <span className={styles.iconDot} />
          <span>Bütün məhsullar</span>
        </button>

        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.tab} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className={styles.iconDot} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.arrowBtn}
        onClick={() => handleScroll('right')}
        disabled={!canScrollRight}
        aria-label="Növbəti kateqoriyalar"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
