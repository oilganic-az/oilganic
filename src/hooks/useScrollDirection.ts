import { useState, useEffect } from 'react';

export interface ScrollState {
  scrollDirection: 'up' | 'down' | null;
  scrollY: number;
  isScrolled: boolean;
  progressPercent: number;
}

export function useScrollDirection(threshold = 10): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollDirection: null,
    scrollY: 0,
    isScrolled: false,
    progressPercent: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let previousScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressPercent = docHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100)) : 0;

      const diff = currentScrollY - previousScrollY;

      if (Math.abs(diff) >= threshold) {
        const scrollDirection = diff > 0 ? 'down' : 'up';
        setScrollState({
          scrollDirection,
          scrollY: currentScrollY,
          isScrolled: currentScrollY > 40,
          progressPercent,
        });
        previousScrollY = currentScrollY;
      } else {
        setScrollState(prev => ({
          ...prev,
          scrollY: currentScrollY,
          isScrolled: currentScrollY > 40,
          progressPercent,
        }));
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrollState;
}
