import React from 'react';
import { MapPin, Clock, Phone, Navigation, ExternalLink, ShoppingBag } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../../config/business';
import { Button } from '../../common/Button/Button';
import styles from './StoreLocationSection.module.css';

export const StoreLocationSection: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Information Side */}
          <div className={styles.infoCol}>
            <span className={styles.badge}>Fiziki mağaza</span>
            <h2 className={styles.title}>Mağazamıza qonaq gəlin</h2>
            <p className={styles.subtitle}>
              Məhsullarımızın hazırlanma prosesini yaxından görmək və təzə sıxılmış yağların ətrini hiss etmək üçün mağazamıza dəvətlisiniz.
            </p>

            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <MapPin className={styles.icon} size={22} />
                <div>
                  <h4 className={styles.cardTitle}>Mağaza ünvanı</h4>
                  <p className={styles.cardText}>{BUSINESS_CONFIG.address}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <Clock className={styles.icon} size={22} />
                <div>
                  <h4 className={styles.cardTitle}>İş saatları</h4>
                  <p className={styles.cardText}>{BUSINESS_CONFIG.workingHours}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <Phone className={styles.icon} size={22} />
                <div>
                  <h4 className={styles.cardTitle}>Əlaqə nömrəsi</h4>
                  <p className={styles.cardText}>
                    <a href={`tel:+${BUSINESS_CONFIG.whatsappRaw}`} className={styles.phoneLink}>
                      {BUSINESS_CONFIG.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <a
              href={BUSINESS_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" icon={<Navigation size={18} />}>
                Xəritədə marşrutu açın
              </Button>
            </a>
          </div>

          {/* Bulletproof Branded Store Location Card */}
          <div className={styles.mapCol}>
            <div className={styles.mapCardContent}>
              <div className={styles.mapHeader}>
                <span className={styles.statusBadge}>
                  <span className={styles.pulseDot} />
                  İndi açıqdır ({BUSINESS_CONFIG.workingHours.replace('Hər gün: ', '')})
                </span>
              </div>

              <div className={styles.mapVisualBox}>
                <div className={styles.pinContainer}>
                  <div className={styles.pulseRing} />
                  <MapPin size={32} className={styles.mapPinIcon} />
                </div>
                <h3 className={styles.storeLocationTitle}>{BUSINESS_CONFIG.name} Shop</h3>
                <p className={styles.storeAddressText}>{BUSINESS_CONFIG.address}</p>
              </div>

              <div className={styles.mapActionRow}>
                <a
                  href={BUSINESS_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapsBtnPrimary}
                >
                  <Navigation size={18} /> Google Maps-də açın
                </a>
                <a
                  href={BUSINESS_CONFIG.woltUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapsBtnSecondary}
                >
                  <ShoppingBag size={18} /> Wolt ilə çatdırılma <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
