import React from 'react';
import { MessageCircle, Check, Truck, ShieldCheck, Clock, ThumbsUp } from 'lucide-react';
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

          {/* Top Wolt and WhatsApp Options */}
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
                <li><Check size={16} color="var(--color-brand-green)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Operativ kuryer çatdırılması</li>
                <li><Check size={16} color="var(--color-brand-green)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Wolt tətbiqi üzərindən kartla onlayn ödəniş</li>
                <li><Check size={16} color="var(--color-brand-green)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Bakı ərazisi üzrə geniş əhatə</li>
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
                <h3 className={styles.cardTitle}>WhatsApp vasitəsilə sifariş</h3>
              </div>

              <div className={styles.waBodyGroup}>
                <p className={styles.cardText}>
                  Saytımızda məhsulları səbətə əlavə edib, sizə uyğun çatdırılma növünü seçdikdən sonra sifarişinizi birbaşa WhatsApp vasitəsilə menecerimizə göndərə bilərsiniz.
                </p>
                <p className={styles.cardText}>
                  Sifarişiniz təsdiqləndikdən sonra məhsullarınız mağazamızda təzə hazırlanır və seçdiyiniz çatdırılma üsulu ilə sizə göndərilir.
                </p>
              </div>

              <div className={styles.optionsBlock}>
                <h4 className={styles.optionsBlockTitle}>Çatdırılma seçimləri:</h4>
                <ol className={styles.optionsList}>
                  <li>
                    <span className={styles.optNum}>1.</span>
                    <span><strong>Bolt</strong> – Çatdırılma haqqı məsafəyə əsasən hesablanır.</span>
                  </li>
                  <li>
                    <span className={styles.optNum}>2.</span>
                    <span><strong>Metro daxili təhvil</strong> – <span className={styles.pricePill}>4 ₼</span></span>
                  </li>
                  <li>
                    <span className={styles.optNum}>3.</span>
                    <span><strong>Metro çıxışı və yaxınlığına təhvil</strong> – <span className={styles.pricePill}>5 ₼</span></span>
                  </li>
                  <li>
                    <span className={styles.optNum}>4.</span>
                    <span><strong>Rayonlara Expargo ilə (5 kq-a qədər)</strong> – <span className={styles.pricePill}>5 ₼</span></span>
                  </li>
                  <li>
                    <span className={styles.optNum}>5.</span>
                    <span><strong>Naxçıvan MR-ə Expargo ilə (5 kq-a qədər)</strong> – <span className={styles.pricePill}>8 ₼</span></span>
                  </li>
                </ol>
              </div>

              <p className={styles.ctaNoteText}>
                Sifariş vermək üçün WhatsApp vasitəsilə bizimlə əlaqə saxlaya bilərsiniz.
              </p>

              <a href={BUSINESS_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" fullWidth icon={<MessageCircle size={20} />}>
                  WhatsApp vasitəsilə sifariş
                </Button>
              </a>
            </div>
          </div>

          {/* Expargo Section Styling matched to User design banner */}
          <div className={styles.expargoSection}>
            <div className={styles.expargoGrid}>
              <div className={styles.expargoTextCol}>
                <div className={styles.expargoHeader}>
                  <span className={styles.expargoBadge}>
                    <Truck size={14} /> Expargo vasitəsilə həyata keçirilir
                  </span>
                  <h2 className={styles.expargoTitle}>Rayonlara və şəhər ətrafı ərazilərə çatdırılma</h2>
                </div>

                <div className={styles.expargoList}>
                  <div className={styles.expargoItem}>
                    <div className={styles.expargoIconContainer}>
                      <Truck size={24} color="#15803d" />
                    </div>
                    <div className={styles.expargoItemContent}>
                      <h4 className={styles.expargoItemTitle}>ÇATDIRILMA</h4>
                      <p className={styles.expargoItemText}>Çatdırılma Expargo vasitəsilə həyata keçirilir.</p>
                    </div>
                  </div>

                  <div className={styles.expargoItem}>
                    <div className={styles.expargoIconContainer}>
                      <span className={styles.weightIcon}>5 KG</span>
                    </div>
                    <div className={styles.expargoItemContent}>
                      <h4 className={styles.expargoItemTitle}>ÇATDIRILMA ÖDƏNİŞİ</h4>
                      <p className={styles.expargoItemText}>
                        5 kq-a qədər bağlamalar üçün çatdırılma haqqı
                        <span className={styles.greenPriceBadge}>5 ₼</span>
                        təşkil edir.
                      </p>
                    </div>
                  </div>

                  <div className={styles.expargoItem}>
                    <div className={styles.expargoIconContainer}>
                      <span className={styles.calendarIcon}>1-3</span>
                    </div>
                    <div className={styles.expargoItemContent}>
                      <h4 className={styles.expargoItemTitle}>ÇATDIRILMA MÜDDƏTİ</h4>
                      <p className={styles.expargoItemText}>Sifarişlər 1–3 iş günü ərzində ünvanınıza çatdırılır.</p>
                    </div>
                  </div>
                </div>

                {/* Warning note box */}
                <div className={styles.expargoNote}>
                  <span className={styles.noteExclamation}>!</span>
                  <div>
                    <strong>QEYD:</strong> 5 kq-dan artıq sifarişlər üçün çatdırılma haqqı bağlamanın çəkisinə uyğun hesablanır.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom advantages Trust Strip */}
            <div className={styles.expargoTrustStrip}>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} />
                <span>Təhlükəsiz çatdırılma</span>
              </div>
              <div className={styles.trustItem}>
                <Truck size={18} />
                <span>Etibarlı və peşəkar xidmət</span>
              </div>
              <div className={styles.trustItem}>
                <Clock size={18} />
                <span>Dəqiqlik və operativlik</span>
              </div>
              <div className={styles.trustItem}>
                <ThumbsUp size={18} />
                <span>Müştəri məmnuniyyəti</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
