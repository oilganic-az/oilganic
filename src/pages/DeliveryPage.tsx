import React from 'react';
import { MessageCircle, Check, Truck } from 'lucide-react';
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

            {/* Expargo Option */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Truck size={36} style={{ color: '#15803d' }} />
                <h3 className={styles.cardTitle}>Rayonlara və şəhər ətrafı ərazilərə çatdırılma</h3>
              </div>
              <div className={styles.cardText} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p>
                  <strong>Çatdırılma:</strong> Çatdırılma Expargo vasitəsilə həyata keçirilir.
                </p>
                <p>
                  <strong>Çatdırılma ödənişi:</strong> 5 kq-a qədər bağlamalar üçün çatdırılma haqqı 5 ₼ təşkil edir.
                </p>
                <p>
                  <strong>Çatdırılma müddəti:</strong> Sifarişlər 1–3 iş günü ərzində ünvanınıza çatdırılır.
                </p>
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-subtle)' }}>
                  <strong>Qeyd:</strong> 5 kq-dan artıq sifarişlər üçün çatdırılma haqqı bağlamanın çəkisinə uyğun hesablanır.
                </p>
              </div>
              <ul className={styles.featureList}>
                <li><Check size={16} color="var(--color-brand-green)" /> Təhlükəsiz çatdırılma</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Etibarlı və peşəkar xidmət</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Zamana dəqiq</li>
                <li><Check size={16} color="var(--color-brand-green)" /> Müştəri məmnuniyyəti</li>
              </ul>
              <a href={BUSINESS_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" fullWidth icon={<Truck size={20} />}>
                  Expargo ilə sifariş et
                </Button>
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
