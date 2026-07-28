import React, { useState } from 'react';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../utils/formatters';
import { buildWhatsAppOrderUrl, CustomerDetails } from '../../../utils/whatsapp';
import { Drawer } from '../../common/Drawer/Drawer';
import { Button } from '../../common/Button/Button';
import { CartItem } from '../CartItem/CartItem';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { cartItems, isCartOpen, setIsCartOpen, subtotal, updateQuantity, removeFromCart } = useCart();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    customerName: '',
    deliveryAddress: '',
    note: ''
  });

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const whatsappUrl = buildWhatsAppOrderUrl(cartItems, customerDetails);

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="Sifariş səbəti"
      position="right"
    >
      <div className={styles.drawerBody}>
        {cartItems.length === 0 ? (
          <div className={styles.emptyBox}>
            <div className={styles.emptyIconBox}>
              <ShoppingBag size={48} className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyTitle}>Səbətiniz boşdur</p>
            <p className={styles.emptySubtitle}>
              Təbii yağlar, əzmələr və wellness məhsullarımızı kəşf edin.
            </p>
            <Button variant="primary" onClick={() => setIsCartOpen(false)}>
              Məhsullara bax
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}

              {/* Customer Checkout Info Form */}
              <div className={styles.customerFormSection}>
                <span className={styles.formTitle}>Çatdırılma məlumatları</span>
                
                <div className={styles.fieldGroup}>
                  <label htmlFor="cart-name" className={styles.fieldLabel}>Ad və soyad:</label>
                  <input
                    id="cart-name"
                    type="text"
                    placeholder="Məs: Elvin Məmmədov"
                    value={customerDetails.customerName}
                    onChange={e => handleInputChange('customerName', e.target.value)}
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="cart-address" className={styles.fieldLabel}>Çatdırılma ünvanı:</label>
                  <input
                    id="cart-address"
                    type="text"
                    placeholder="Məs: Nizami r-nu, Neftçilər m/st"
                    value={customerDetails.deliveryAddress}
                    onChange={e => handleInputChange('deliveryAddress', e.target.value)}
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="cart-note" className={styles.fieldLabel}>Əlavə qeyd:</label>
                  <textarea
                    id="cart-note"
                    placeholder="Məs: Saat 15:00-dan sonra çatdırın"
                    value={customerDetails.note}
                    onChange={e => handleInputChange('note', e.target.value)}
                    className={styles.fieldTextarea}
                  />
                </div>
              </div>
            </div>

            <div className={styles.footerSummary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Ümumi məbləğ:</span>
                <span className={styles.summaryValue}>{formatCurrency(subtotal)}</span>
              </div>

              <p className={styles.noticeText}>
                Məlumatlar avtomatik WhatsApp sifariş mesajınıza əlavə olunacaq.
              </p>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                <Button
                  variant="whatsapp"
                  fullWidth
                  size="lg"
                  icon={<MessageCircle size={20} />}
                >
                  WhatsApp ilə sifariş et
                </Button>
              </a>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};
