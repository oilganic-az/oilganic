import React from 'react';
import { Product } from '../../../types/product';
import { ProductCard } from '../ProductCard/ProductCard';
import { Skeleton } from '../../common/Skeleton/Skeleton';
import styles from './ProductGrid.module.css';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = 'Axtarışınıza uyğun heç bir məhsul tapılmadı.'
}) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton height="180px" borderRadius="var(--radius-md)" />
            <Skeleton height="24px" width="70%" />
            <Skeleton height="16px" width="90%" />
            <Skeleton height="40px" borderRadius="var(--radius-full)" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
