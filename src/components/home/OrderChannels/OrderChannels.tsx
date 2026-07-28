import React from 'react';
import { ShoppingBag, MessageCircle, ExternalLink } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../../config/business';
import { Button } from '../../common/Button/Button';
import { Reveal } from '../../motion/Reveal/Reveal';
import { MagneticButton } from '../../motion/MagneticButton/MagneticButton';
import styles from './OrderChannels.module.css';

export const OrderChannels: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal variant="fade">
          <div className={styles.header}>
            <span className={styles.badge}>Sifariş kanalları</span>
            <h2 className={styles.title}>Sizə ən rahat üsulla sifariş edin</h2>
            <p className={styles.subtitle}>
              Sifarişlərinizi istərsəniz Wolt vasitəsilə dərhal qapınıza, istərsəniz WhatsApp vasitəsilə birbaşa operatorumuza yaza bilərsiniz.
            </p>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {/* Wolt Card */}
          <Reveal variant="slideRight" delay={0.1}>
            <div className={`${styles.channelCard} ${styles.woltCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.woltIconBox}>
                  <ShoppingBag size={28} />
                </div>
                <span className={styles.channelBadge}>Sürətli çatdırılma</span>
              </div>
              <h3 className={styles.channelTitle}>Wolt Bakı mağazası</h3>
              <p className={styles.channelDesc}>
                Bakı şəhəri daxilində ünvanınıza operativ kuryer çatdırılması üçün Wolt Baku tətbiqindən istifadə edin.
              </p>
              <MagneticButton>
                <a href={BUSINESS_CONFIG.woltUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="wolt" size="lg" icon={<ExternalLink size={18} />}>
                    Wolt-da sifariş et
                  </Button>
                </a>
              </MagneticButton>
            </div>
          </Reveal>

          {/* WhatsApp Card */}
          <Reveal variant="slideLeft" delay={0.2}>
            <div className={`${styles.channelCard} ${styles.waCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.waIconBox}>
                  <MessageCircle size={28} />
                </div>
                <span className={styles.channelBadge}>Canlı əlaqə</span>
              </div>
              <h3 className={styles.channelTitle}>WhatsApp birbaşa sifariş</h3>
              <p className={styles.channelDesc}>
                Səbətinizi saytımızda toplayın və ya birbaşa WhatsApp nömrəmizə yazaraq suallarınızı verib sifarişinizi rəsmiləşdirin.
              </p>
              <MagneticButton>
                <a href={BUSINESS_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="whatsapp" size="lg" icon={<MessageCircle size={18} />}>
                    WhatsApp-da əlaqə saxla
                  </Button>
                </a>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
