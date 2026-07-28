import React from 'react';
import { ShoppingBag, MessageCircle, Check } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { Button } from '../components/common/Button/Button';
import styles from './DeliveryPage.module.css';

export const DeliveryPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.hero}>
          <span className={styles.badge}>Çatdırılma və ödəniş</span>
          <h1 className={styles.title}>Məhsullarımızın sizə çatdırılması qaydaları</h1>
          <p className={styles.subtitle}>
            Oilganic təbii yağları və əzmələrini Bakı şəhəri üzrə rahatlıqla sifariş edə bilərsiniz.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Wolt Option */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ShoppingBag size={32} className={styles.woltIcon} />
              <h3 className={styles.cardTitle}>Wolt Bakı ilə çatdırılma</h3>
            </div>
            <p className={styles.cardText}>
              Bakı şəhəri daxilində ünvanınıza 30–45 dəqiqə ərzində kuryer çatdırılması. Wolt tətbiqi vasitəsilə sifarişinizi anlıq izləyə bilərsiniz.
            </p>
            <ul className={styles.featureList}>
              <li><Check size={16} color="var(--color-brand-green)" /> Operativ kuryer çatdırılması</li>
              <li><Check size={16} color="var(--color-brand-green)" /> Wolt tətbiqi üzərindən kartla onlayn ödəniş</li>
              <li><Check size={16} color="var(--color-brand-green)" /> Bakı ərazisi üzrə geniş əhatə</li>
            </ul>
            <a href={BUSINESS_CONFIG.woltUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="wolt" fullWidth>Wolt mağazamıza keçin</Button>
            </a>
          </div>

          {/* WhatsApp Option */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MessageCircle size={32} className={styles.waIcon} />
              <h3 className={styles.cardTitle}>WhatsApp birbaşa sifariş</h3>
            </div>
            <p className={styles.cardText}>
              Saytımızda səbət toplayaraq birbaşa WhatsApp vasitəsilə menecerimizə yaza bilərsiniz. Sifarişiniz mağazada dərhal təzə hazırlanır.
            </p>
            <ul className={styles.featureList}>
              <li><Check size={16} color="var(--color-brand-green)" /> Canlı operator dəstəyi və məsləhət</li>
              <li><Check size={16} color="var(--color-brand-green)" /> Qapıda nağd və ya köçürmə yolu ilə ödəniş</li>
              <li><Check size={16} color="var(--color-brand-green)" /> Xüsusi həcm və ya çəki istəklərinin qəbulu</li>
            </ul>
            <a href={BUSINESS_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" fullWidth>WhatsApp ilə yaza bilərsiniz</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
