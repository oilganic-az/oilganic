import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../../types/cart';
import { formatCurrency } from '../../../utils/formatters';
import styles from './CartItem.module.css';

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, product, selectedSize, quantity, unitPrice } = item;
  const totalPrice = unitPrice * quantity;

  return (
    <div className={styles.cartItem}>
      <div className={styles.imageBox}>
        {/* Placeholder brand SVG or image */}
        <div className={styles.placeholderImg}>
          <span className={styles.brandMark}>O</span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.topRow}>
          <h4 className={styles.name}>{product.name}</h4>
          <button
            className={styles.removeBtn}
            onClick={() => onRemove(id)}
            aria-label={`${product.name} məhsulunu səbətdən sil`}
          >
            <Trash2 size={16} />
          </button>
        </div>

        {selectedSize && (
          <span className={styles.sizeLabel}>Həcm/Çəki: {selectedSize.label}</span>
        )}

        <div className={styles.bottomRow}>
          <div className={styles.quantityControls}>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQuantity(id, quantity - 1)}
              aria-label="Miqdarı azalt"
            >
              <Minus size={14} />
            </button>
            <span className={styles.quantity}>{quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              aria-label="Miqdarı artır"
            >
              <Plus size={14} />
            </button>
          </div>

          <span className={styles.price}>{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};
