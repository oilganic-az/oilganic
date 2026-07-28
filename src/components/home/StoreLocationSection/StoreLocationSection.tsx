import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
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
                  <p className={styles.cardText}>{BUSINESS_CONFIG.phoneDisplay}</p>
                </div>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_CONFIG.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" icon={<Navigation size={18} />}>
                Xəritədə marşrutu açın
              </Button>
            </a>
          </div>

          {/* Interactive Map Visual Placeholder */}
          <div className={styles.mapCol}>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapPinGraphic}>
                <MapPin size={48} className={styles.pinIcon} />
                <span className={styles.pinLabel}>Oilganic mağazası</span>
              </div>
              <p className={styles.mapSubtext}>
                Nizami rayonu, Cəmşid Naxçıvanski küçəsi 49C<br />
                (8-ci km bazarı)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
