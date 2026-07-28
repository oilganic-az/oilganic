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

          {/* Real Google Maps Embed */}
          <div className={styles.mapCol}>
            <iframe
              className={styles.mapIframe}
              title="Oilganic mağazasının xəritədə yeri"
              src={BUSINESS_CONFIG.googleMapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};
