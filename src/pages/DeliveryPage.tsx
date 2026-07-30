import React from 'react';
import { MessageCircle, Check } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { Button } from '../components/common/Button/Button';
import { WoltIcon } from '../components/common/WoltIcon/WoltIcon';
import { SEO } from '../components/common/SEO/SEO';
import styles from './DeliveryPage.module.css';

export const DeliveryPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Çatdırılma və ödəniş - Oilganic"
        description="Oilganic təbii yağları və əzmələrinin çatdırılması və ödəniş şərtləri."
        canonicalPath="/delivery"
      />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <span className={styles.badge}>Çatdırılma və ödəniş</span>
            <h1 className={styles.title}>Çatdırılma və ödəniş</h1>
            <p className={styles.subtitle} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-brand-green)' }}>
              Məhsullarımızın sizə çatdırılması qaydaları
            </p>
            <p className={styles.subtitle} style={{ marginTop: '0.5rem' }}>
              Oilganic təbii yağları və əzmələrini Bakı şəhəri üzrə rahatlıqla sifariş edə bilərsiniz.
            </p>
          </div>

          <div className={styles.grid}>
            {/* Wolt Option */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <WoltIcon size={36} className={styles.woltIcon} />
                <h3 className={styles.cardTitle}>Wolt Bakı ilə çatdırılma</h3>
              </div>
              <p className={styles.cardText}>
                Bakı şəhəri daxilində ünvanınıza 30-45 dəqiqə ərzində kuryer çatdırılması. Wolt tətbiqi vasitəsilə sifarişinizi anlıq izləyə bilərsiniz.
              </p>
              <ul className={styles.featureList}>
                <li><Check size={16} color="var(--color-brand-green)" /> Operativ kuryer çatdırılması</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Wolt tətbiqi üzərindən kartla onlayn ödəniş</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Bakı ərazisi üzrə geniş əhatə</li>
              </ul>
              <a href={BUSINESS_CONFIG.woltUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="wolt" fullWidth icon={<WoltIcon size={20} />}>
                  Wolt mağazamıza keçin
                </Button>
              </a>
            </div>

            {/* WhatsApp Option */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <MessageCircle size={36} className={styles.waIcon} />
                <h3 className={styles.cardTitle}>WhatsApp birbaşa sifariş</h3>
              </div>
              <p className={styles.cardText}>
                Saytımızda səbət toplayaraq birbaşa WhatsApp vasitəsilə menecerimizə yaza bilərsiniz. Sifarişiniz mağazada dərhal təzə hazırlanır.
              </p>
              <ul className={styles.featureList}>
                <li><Check size={16} color="var(--color-brand-green)" /> Canlı operator dəstəyi və məsləhət</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Sifarişin planlaşdırılması</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Öncədən ödəniş</li>
              </ul>
              <a href={BUSINESS_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" fullWidth icon={<MessageCircle size={20} />}>
                  WhatsApp ilə yaza bilərsiniz
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
