import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Eye } from 'lucide-react';
import { Product, ProductSize } from '../../../types/product';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../utils/formatters';
import { Badge } from '../../common/Badge/Badge';
import { buildWhatsAppOrderUrl } from '../../../utils/whatsapp';
import { AbstractProductVisual } from '../AbstractProductVisual/AbstractProductVisual';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    sizes.length > 0 ? sizes[0] : undefined
  );

  const currentPrice = selectedSize ? selectedSize.price : product.price;

  // Active Image for selected size variant
  const currentImageSrc = selectedSize?.imageSrc || (product.images && product.images.length > 0 ? product.images[0].src : '');
  const hasImage = Boolean(currentImageSrc);

  const singleItemCartUrl = buildWhatsAppOrderUrl([
    {
      id: product.id,
      product,
      selectedSize: selectedSize,
      quantity: 1,
      unitPrice: currentPrice
    }
  ]);

  const showRealPrice = Boolean(currentPrice && currentPrice > 0);

  return (
    <article className={styles.card}>
      {/* Visual Image / Frame with Badges contained inside */}
      <Link to={`/products/${product.slug}`} className={styles.imageLink} aria-label={product.name}>
        <div className={styles.imageFrame}>
          {/* Inner Badges Overlay */}
          <div className={styles.badgeRow}>
            {product.productionType === 'oilganic' && (
              <Badge variant="green">Oilganic istehsalı</Badge>
            )}
            {!product.inStock && <Badge variant="dark">Tükənib</Badge>}
          </div>

          {hasImage ? (
            <img
              key={currentImageSrc} // Key prop ensures instant re-render on image swap
              src={currentImageSrc}
              alt={`${product.name} ${selectedSize ? selectedSize.label : ''}`}
              loading="lazy"
              className={styles.productImg}
            />
          ) : (
            <AbstractProductVisual categoryId={product.categoryId} name={product.name} />
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link to={`/products/${product.slug}`} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        <p className={styles.description}>{product.shortDescription}</p>

        {/* Sizes Pill selector - Dynamic variant switcher */}
        {sizes.length > 0 && (
          <div className={styles.sizesRow}>
            {sizes.map(size => {
              const isActive = selectedSize?.id === size.id || selectedSize?.label === size.label;
              return (
                <button
                  type="button"
                  key={size.id}
                  className={`${styles.sizePill} ${isActive ? styles.sizePillActive : ''}`}
                  onClick={() => setSelectedSize(size)}
                  title={`${size.label} variantını seçin`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Row */}
        <div className={styles.footerRow}>
          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>
              {selectedSize ? selectedSize.label : 'Qiymət'}:
            </span>
            <span className={styles.priceValue}>
              {showRealPrice ? formatCurrency(currentPrice) : 'Qiyməti öyrən'}
            </span>
          </div>

          <div className={styles.actionsGroup}>
            <Link to={`/products/${product.slug}`} className={styles.viewBtn} title="Ətraflı bax" aria-label={`${product.name} məhsuluna bax`}>
              <Eye size={18} />
            </Link>

            {showRealPrice && (
              <button
                type="button"
                className={styles.addBtn}
                onClick={() => addToCart(product, selectedSize)}
                disabled={!product.inStock}
                title="Səbətə əlavə et"
                aria-label={`${product.name} (${selectedSize?.label || ''}) səbətə əlavə et`}
              >
                <ShoppingBag size={18} />
              </button>
            )}

            <a
              href={singleItemCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
              title="WhatsApp ilə sifariş et"
              aria-label={`${product.name} WhatsApp vasitəsilə sifariş et`}
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
