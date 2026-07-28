import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Eye } from 'lucide-react';
import { Product } from '../../../types/product';
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
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
  const currentPrice = defaultSize ? defaultSize.price : product.price;

  const singleItemCartUrl = buildWhatsAppOrderUrl([
    {
      id: product.id,
      product,
      selectedSize: defaultSize,
      quantity: 1,
      unitPrice: currentPrice
    }
  ]);

  // Always show real price when price is available
  const showRealPrice = Boolean(currentPrice && currentPrice > 0);
  const hasImage = Boolean(product.images && product.images.length > 0 && product.images[0].src);

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
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
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

        {/* Sizes Pill selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className={styles.sizesRow}>
            {product.sizes.map(size => (
              <span key={size.id} className={styles.sizePill}>
                {size.label}
              </span>
            ))}
          </div>
        )}

        {/* Footer Row */}
        <div className={styles.footerRow}>
          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>Qiymət:</span>
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
                onClick={() => addToCart(product, defaultSize)}
                disabled={!product.inStock}
                title="Səbətə əlavə et"
                aria-label={`${product.name} səbətə əlavə et`}
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
