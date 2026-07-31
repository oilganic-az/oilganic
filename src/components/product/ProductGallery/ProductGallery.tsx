import React from 'react';
import { ProductImage } from '../../../types/product';
import styles from './ProductGallery.module.css';

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const hasImage = Boolean(images && images.length > 0 && images[0].src);

  return (
    <div className={styles.gallery}>
      <div className={styles.mainFrame}>
        {hasImage ? (
          <img
            src={images[0].src}
            alt={images[0].alt || productName}
            loading="lazy"
            className={styles.mainImg}
            onError={e => {
              (e.target as HTMLImageElement).src = '/images/products/placeholder.svg';
            }}
          />
        ) : (
          <>
            <div className={styles.haloEffect} />
            <div className={styles.visualContent}>
              <span className={styles.brandMark}>O</span>
              <span className={styles.productBadge}>Oilganic Təbii Qablaşdırma</span>
              <p className={styles.productTitleOverlay}>{productName}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
