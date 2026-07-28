import React, { useState, useCallback } from 'react';
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

  // Stabilize onClose with useCallback — prevents useFocusTrap from re-running
  // on every state update (typing in form fields), which was collapsing the mobile keyboard.
  const handleClose = useCallback(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerDetails(prev => ({ ...prev, customerName: e.target.value }));
  }, []);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerDetails(prev => ({ ...prev, deliveryAddress: e.target.value }));
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomerDetails(prev => ({ ...prev, note: e.target.value }));
  }, []);

  const whatsappUrl = buildWhatsAppOrderUrl(cartItems, customerDetails);

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={handleClose}
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
            <Button variant="primary" onClick={handleClose}>
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
                    autoComplete="name"
                    placeholder="Məs: Elvin Məmmədov"
                    value={customerDetails.customerName}
                    onChange={handleNameChange}
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="cart-address" className={styles.fieldLabel}>Çatdırılma ünvanı:</label>
                  <input
                    id="cart-address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Məs: Nizami r-nu, Neftçilər m/st"
                    value={customerDetails.deliveryAddress}
                    onChange={handleAddressChange}
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="cart-note" className={styles.fieldLabel}>Əlavə qeyd:</label>
                  <textarea
                    id="cart-note"
                    placeholder="Məs: Saat 15:00-dan sonra çatdırın"
                    value={customerDetails.note}
                    onChange={handleNoteChange}
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
