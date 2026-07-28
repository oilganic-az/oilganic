import React, { useState } from 'react';
import { Product } from '../../../types/product';
import styles from './ProductTabs.module.css';

export interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'storage'>('desc');

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'desc' ? styles.active : ''}`}
          onClick={() => setActiveTab('desc')}
        >
          Ətraflı təsvir
        </button>
        {product.ingredients && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'ingredients' ? styles.active : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Tərkibi
          </button>
        )}
        {product.usage && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'usage' ? styles.active : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            İstifadə qaydası
          </button>
        )}
        {product.storage && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'storage' ? styles.active : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            Saxlanma şəraiti
          </button>
        )}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'desc' && (
          <div>
            <p className={styles.text}>{product.description || product.shortDescription}</p>
            {product.origin && (
              <p className={styles.metaLine}>
                <strong>Mənşə:</strong> {product.origin}
              </p>
            )}
          </div>
        )}

        {activeTab === 'ingredients' && product.ingredients && (
          <div>
            <ul className={styles.bulletList}>
              {product.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            {product.allergens && product.allergens.length > 0 && (
              <div className={styles.allergenBox}>
                <strong>Allergen xəbərdarlığı:</strong> {product.allergens.join(', ')}
              </div>
            )}
          </div>
        )}

        {activeTab === 'usage' && product.usage && (
          <p className={styles.text}>{product.usage}</p>
        )}

        {activeTab === 'storage' && product.storage && (
          <p className={styles.text}>{product.storage}</p>
        )}
      </div>
    </div>
  );
};
