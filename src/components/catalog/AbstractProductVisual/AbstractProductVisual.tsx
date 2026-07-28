import React from 'react';
import styles from './AbstractProductVisual.module.css';

interface AbstractProductVisualProps {
  categoryId: string;
  name: string;
}

export const AbstractProductVisual: React.FC<AbstractProductVisualProps> = ({
  categoryId,
  name
}) => {
  const getCategoryIcon = () => {
    switch (categoryId) {
      case 'oils':
        return (
          <svg viewBox="0 0 100 100" className={styles.svgIcon} aria-hidden="true">
            <defs>
              <linearGradient id="oilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#287A28" />
                <stop offset="100%" stopColor="#C89A3D" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-sage-200)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M50 20 C50 20 72 48 72 65 C72 77 62 85 50 85 C38 85 28 77 28 65 C28 48 50 20 50 20 Z" fill="url(#oilGrad)" opacity="0.9" />
            <path d="M50 30 M50 40 V65 M50 50 L58 42 M50 56 L42 48" stroke="#FAF8F1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'pastes':
        return (
          <svg viewBox="0 0 100 100" className={styles.svgIcon} aria-hidden="true">
            <defs>
              <linearGradient id="pasteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C89A3D" />
                <stop offset="100%" stopColor="#123B2A" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-sage-200)" strokeWidth="2" />
            <circle cx="50" cy="52" r="30" fill="url(#pasteGrad)" opacity="0.85" />
            <path d="M35 40 C45 30 65 30 70 45 C75 60 55 70 40 65 C30 60 28 48 35 40 Z" fill="#FAF8F1" opacity="0.8" />
          </svg>
        );

      case 'sweeteners':
        return (
          <svg viewBox="0 0 100 100" className={styles.svgIcon} aria-hidden="true">
            <defs>
              <linearGradient id="honeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6B85C" />
                <stop offset="100%" stopColor="#C89A3D" />
              </linearGradient>
            </defs>
            <polygon points="50,15 78,31 78,63 50,79 22,63 22,31" fill="none" stroke="var(--color-oil-gold)" strokeWidth="2.5" />
            <polygon points="50,26 68,36 68,58 50,68 32,58 32,36" fill="url(#honeyGrad)" opacity="0.9" />
          </svg>
        );

      case 'teas':
        return (
          <svg viewBox="0 0 100 100" className={styles.svgIcon} aria-hidden="true">
            <defs>
              <linearGradient id="teaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5C9F4A" />
                <stop offset="100%" stopColor="#123B2A" />
              </linearGradient>
            </defs>
            <path d="M50 15 C70 15 85 30 85 50 C85 70 70 85 50 85 C30 85 15 70 15 50 C15 30 30 15 50 15 Z" fill="none" stroke="var(--color-sage-200)" strokeWidth="2" />
            <path d="M30 60 C30 35 55 25 70 30 C70 55 45 65 30 60 Z" fill="url(#teaGrad)" opacity="0.9" />
            <path d="M40 50 C48 42 58 40 64 42" stroke="#FAF8F1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 100 100" className={styles.svgIcon} aria-hidden="true">
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--color-brand-green)" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="24" fill="var(--color-sage-100)" />
            <path d="M50 35 C58 35 65 42 65 50 C65 58 58 65 50 65 C42 65 35 58 35 50 C35 42 42 35 50 35 Z" fill="var(--color-brand-green)" opacity="0.8" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.wrapper} aria-label={`${name} illüstrasiyası`}>
      {getCategoryIcon()}
    </div>
  );
};
