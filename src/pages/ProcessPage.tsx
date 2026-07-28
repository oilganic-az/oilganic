import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { PROCESS_STEPS } from '../data/processSteps';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';
import { Link } from 'react-router-dom';
import styles from './ProcessPage.module.css';

export const ProcessPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Hazırlanma Prosesi - Şəffaf Soyuq Sıxım"
        description="Oilganic mağazasında təbii yağlar və əzmələrin hazırlanma prosesi və istehsalat addımları."
        canonicalPath="/process"
      />
      <div className={styles.page}>
        <div className="container">
          {/* Header */}
          <div className={styles.heroHeader}>
            <span className={styles.badge}>Şəffaf İstehsalat</span>
            <h1 className={styles.title}>Təbii Yağlar və Əzmələrin Hazırlanma Prosesi</h1>
            <p className={styles.subtitle}>
              Oilganic-də istehsalat örtülü qapılar arxasında deyil, fiziki mağazamızda müştərilərimizin gözü qarşısında həyata keçirilir.
            </p>
          </div>

          {/* Hygiene Banner */}
          <div className={styles.hygieneBanner}>
            <div className={styles.bannerIcon}>
              <Shield size={32} />
            </div>
            <div>
              <h3 className={styles.bannerTitle}>Mağazada Gigiyena və Keyfiyyət Standartı</h3>
              <p className={styles.bannerText}>
                Bütün cihazlarımız hər sıxımdan sonra təmizlənir, yalnız steril tünd şüşə qablardan istifadə edilir və sıxım zamanı temperatur qətiyyən yüksəldilmir.
              </p>
            </div>
          </div>

          {/* Detailed Timeline Steps */}
          <div className={styles.timeline}>
            {PROCESS_STEPS.map(step => (
              <div key={step.stepNumber} className={styles.timelineItem}>
                <div className={styles.badgeCol}>
                  <div className={styles.numberBadge}>0{step.stepNumber}</div>
                </div>

                <div className={styles.contentCol}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <span className={styles.stepSubtitle}>{step.subtitle}</span>
                  <p className={styles.stepDesc}>{step.description}</p>

                  <div className={styles.detailsBox}>
                    <h4 className={styles.detailsTitle}>İstehsalat Standartları:</h4>
                    <ul className={styles.detailsList}>
                      {step.details.map((detail, idx) => (
                        <li key={idx} className={styles.detailItem}>
                          <CheckCircle2 size={18} className={styles.checkIcon} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={styles.bottomCta}>
            <h3 className={styles.ctaTitle}>Təzə Sıxılmış Məhsullarımızı Sınaqdan Keçirin</h3>
            <p className={styles.ctaSub}>
              Canlı hazırlanmış soyuq sıxım yağlarımızdan və şəkərsiz əzmələrimizdən dərhal sifariş edin.
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Məhsullar kataloquna baxın
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
