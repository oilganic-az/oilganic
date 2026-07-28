import React from 'react';
import { useScrollDirection } from '../../../hooks/useScrollDirection';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './ScrollProgress.module.css';

export const ScrollProgress: React.FC = () => {
  const { progressPercent, isScrolled } = useScrollDirection();
  const isReducedMotion = useReducedMotion();

  if (isReducedMotion) {
    return null;
  }

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      {/* Top progress line */}
      <div className={styles.topProgressBar} aria-hidden="true">
        <div
          className={styles.topProgressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Circular desktop badge widget */}
      <div
        className={styles.circularWidget}
        style={{ opacity: isScrolled ? 1 : 0, transform: isScrolled ? 'scale(1)' : 'scale(0.8)' }}
        aria-hidden="true"
      >
        <svg className={styles.circularSvg} viewBox="0 0 44 44">
          <circle
            className={styles.bgRing}
            cx="22"
            cy="22"
            r={radius}
            fill="none"
          />
          <circle
            className={styles.fillRing}
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Miniature Oilganic O symbol inside indicator */}
        <svg className={styles.centerMark} viewBox="0 0 512 512" fill="none">
          <path
            d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z"
            fill="#2F7D32"
          />
        </svg>
      </div>
    </>
  );
};
