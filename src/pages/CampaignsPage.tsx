import React from 'react';
import { Gift, Calendar, ArrowRight } from 'lucide-react';
import { useCampaigns } from '../context/CampaignsContext';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';
import { Link } from 'react-router-dom';
import styles from './CampaignsPage.module.css';

export const CampaignsPage: React.FC = () => {
  const { campaigns } = useCampaigns();
  const activeCampaigns = campaigns.filter(c => c.isActive);

  return (
    <>
      <SEO
        title="Kampaniyalar və endirimlər - Oilganic"
        description="Oilganic təbii məhsullarında aktiv kampaniyalar, hədiyyələr və xüsusi təkliflər."
        canonicalPath="/campaigns"
      />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <span className={styles.badge}>Xüsusi təkliflər</span>
            <h1 className={styles.title}>Kampaniyalar</h1>
            <p className={styles.subtitle}>
              Sizin üçün hazırladığımız xüsusi endirimlər, hədiyyə paketləri və mövsümi kampaniyalar.
            </p>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.giftIconBox}>
                <Gift size={48} />
              </div>
              <h3 className={styles.emptyTitle}>Hazırda aktiv kampaniya yoxdur</h3>
              <p className={styles.emptyText}>
                Yeni kampaniyalardan və endirimlərdən ilk siz xəbərdar olmaq üçün səhifəmizi izləmədə qalın.
              </p>
              <Link to="/products">
                <Button variant="primary" size="lg">
                  Məhsullara baxın
                </Button>
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {activeCampaigns.map(camp => (
                <div key={camp.id} className={styles.card}>
                  {camp.imageSrc && (
                    <div className={styles.imageWrapper}>
                      <img src={camp.imageSrc} alt={camp.title} className={styles.image} />
                    </div>
                  )}
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{camp.title}</h3>
                    
                    {(camp.startDate || camp.endDate) && (
                      <div className={styles.dateRow}>
                        <Calendar size={16} />
                        <span>
                          {camp.startDate || 'Başlama tarixi yoxdur'} — {camp.endDate || 'Bitmə tarixi yoxdur'}
                        </span>
                      </div>
                    )}

                    <p className={styles.cardConditions}>{camp.conditions}</p>
                    
                    <div className={styles.cardFooter}>
                      <Link to="/products">
                        <Button variant="primary" icon={<ArrowRight size={16} />}>
                          Alış-verişə başla
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
