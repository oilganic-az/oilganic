import { useState, useEffect, RefObject } from 'react';

export function useElementInView(
  ref: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = { threshold: 0.15 }
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [ref, options]);

  return isInView;
}
