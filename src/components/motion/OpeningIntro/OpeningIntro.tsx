import React, { useState, useRef, useEffect } from 'react';
import { gsap } from '../../../animations/gsap';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './OpeningIntro.module.css';

const SESSION_KEY = 'oilganic_intro_seen_v1';

export const OpeningIntro: React.FC = () => {
  const isReducedMotion = useReducedMotion();
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (isReducedMotion) return false;
    const hasSeen = sessionStorage.getItem(SESSION_KEY);
    return !hasSeen;
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldRender || typeof window === 'undefined') return;

    // Set session key immediately so route changes don't re-trigger
    sessionStorage.setItem(SESSION_KEY, 'true');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setShouldRender(false);
        },
      });

      tl.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
      })
      .to(contentRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.35,
        delay: 0.25,
        ease: 'power2.in',
      })
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power1.inOut',
      }, '-=0.15');
    }, overlayRef);

    return () => {
      ctx.revert();
    };
  }, [shouldRender]);

  if (!shouldRender || isReducedMotion) {
    return null;
  }

  return (
    <div ref={overlayRef} className={styles.introOverlay} aria-hidden="true">
      <div ref={contentRef} className={styles.introContent}>
        <svg
          className={styles.markSvg}
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z"
            fill="#2F7D32"
          />
          <path
            d="M294 74.9992C271 66.4992 471.224 151.043 435 374.501C392 381 324 -8 82.5 113C234 -89.4996 581 104 448 374.501C470 169.5 317 83.4993 294 74.9992Z"
            fill="#033A25"
          />
        </svg>
        <span className={styles.brandText}>Oilganic</span>
      </div>
    </div>
  );
};
