import React from 'react';
import { ProductSize } from '../../../types/product';
import { formatCurrency } from '../../../utils/formatters';
import styles from './SizeSelector.module.css';

export interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize?: ProductSize;
  onSelectSize: (size: ProductSize) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize
}) => {
  return (
    <div className={styles.sizeSelector} role="group" aria-labelledby="size-selector-label">
      <span id="size-selector-label" className={styles.label}>Həcm / Çəki seçin:</span>
      <div className={styles.optionsGrid}>
        {sizes.map(size => {
          const isSelected = size.id === selectedSize?.id;
          return (
            <button
              key={size.id}
              type="button"
              className={`${styles.sizeBtn} ${isSelected ? styles.selected : ''}`}
              onClick={() => onSelectSize(size)}
              disabled={!size.inStock}
              aria-pressed={isSelected}
            >
              <span className={styles.sizeName}>{size.label}</span>
              <span className={styles.sizePrice}>{formatCurrency(size.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
