import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './OrganicCursor.module.css';

export const OrganicCursor: React.FC = () => {
  const isReducedMotion = useReducedMotion();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isReducedMotion || typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let posX = 0;
    let posY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target && (target.closest('a') || target.closest('button') || target.closest('[data-interactive]'))) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const animate = () => {
      posX += (mouseX - posX) * 0.2;
      posY += (mouseY - posY) * 0.2;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${posX}px`;
        cursorRef.current.style.top = `${posY}px`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isReducedMotion, isVisible]);

  if (isReducedMotion) return null;

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursorDot} ${isActive ? styles.active : ''}`}
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    />
  );
};
