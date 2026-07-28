import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'gold' | 'sage' | 'dark' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'green' }) => {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
};
