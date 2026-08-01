import React, { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, ExternalLink } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../../config/business';
import { Button } from '../../common/Button/Button';
import styles from './StoreLocationSection.module.css';

export const StoreLocationSection: React.FC = () => {
  const [mapError, setMapError] = useState(false);

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

          {/* Google Maps Embed with Fallback */}
          <div className={styles.mapCol}>
            {!mapError ? (
              <iframe
                className={styles.mapIframe}
                title="Oilganic mağazasının xəritədə yeri"
                src={BUSINESS_CONFIG.googleMapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                onError={() => setMapError(true)}
              />
            ) : (
              <div className={styles.mapFallback}>
                <MapPin size={48} className={styles.fallbackIcon} />
                <h3 className={styles.fallbackTitle}>Oilganic Mağazası</h3>
                <p className={styles.fallbackText}>{BUSINESS_CONFIG.address}</p>
                <a
                  href={BUSINESS_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fallbackBtn}
                >
                  Google Maps-də baxın <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
