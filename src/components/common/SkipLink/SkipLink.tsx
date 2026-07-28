import React from 'react';
import styles from './SkipLink.module.css';

export const SkipLink: React.FC = () => {
  return (
    <a href="#main-content" className={styles.skipLink}>
      Əsas məzmuna keçid
    </a>
  );
};
