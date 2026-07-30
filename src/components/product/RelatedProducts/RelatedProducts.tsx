import React from 'react';
import { Product } from '../../../types/product';
import { useProducts } from '../../../context/ProductsContext';
import { ProductGrid } from '../../catalog/ProductGrid/ProductGrid';
import styles from './RelatedProducts.module.css';

export interface RelatedProductsProps {
  currentProduct: Product;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProduct }) => {
  const { products } = useProducts();
  const related = products.filter(
    p => p.categoryId === currentProduct.categoryId && p.id !== currentProduct.id
  ).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Oxşar təbii məhsullar</h3>
      <ProductGrid products={related} />
    </div>
  );
};
