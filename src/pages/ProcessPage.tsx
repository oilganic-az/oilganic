import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { PROCESS_STEPS } from '../data/processSteps';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';
import { Link } from 'react-router-dom';
import styles from './ProcessPage.module.css';

export const ProcessPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Hazırlanma prosesi - Şəffaf sıxım"
        description="Oilganic mağazasında təbii yağlar və əzmələrin hazırlanma prosesi və istehsalat addımları."
        canonicalPath="/process"
      />
      <div className={styles.page}>
        
        {/* Section 1: Sunflower Background (Hero + Steps 1-2) */}
        <section className={`${styles.section} ${styles.sectionOne}`}>
          <video autoPlay loop muted playsInline className={styles.videoBg}>
            <source src="/videos/sunflower-process.mp4" type="video/mp4" />
          </video>
          <div className={styles.videoOverlay} />

          <div className={`container ${styles.contentWrapper}`}>
            {/* Hero Header */}
            <div className={styles.heroHeader}>
              <span className={styles.badge}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Şəffaf istehsalat
              </span>
              <h1 className={styles.title}>Təbii yağlar və əzmələrin hazırlanma prosesi</h1>
              <p className={styles.subtitle}>
                Oilganic-də istehsalat örtülü qapılar arxasında deyil, mağazamızda müştərilərimizin gözü qarşısında həyata keçirilir.
              </p>
            </div>

            {/* Timeline Steps 1 & 2 */}
            <div className={styles.timeline}>
              {PROCESS_STEPS.slice(0, 2).map(step => (
                <div key={step.stepNumber} className={styles.timelineItem}>
                  <div className={styles.badgeCol}>
                    <div className={styles.numberBadge}>0{step.stepNumber}</div>
                  </div>

                  <div className={styles.contentCol}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <span className={styles.stepSubtitle}>{step.subtitle}</span>
                    <p className={styles.stepDesc}>{step.description}</p>

                    {step.details && step.details.length > 0 && (
                      <div className={styles.detailsBox}>
                        <ul className={styles.detailsList}>
                          {step.details.map((detail, idx) => (
                            <li key={idx} className={styles.detailItem}>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Black Seed Background (Hygiene Banner + Steps 3-4 + CTA) */}
        <section className={`${styles.section} ${styles.sectionTwo}`}>
          <video autoPlay loop muted playsInline className={styles.videoBg}>
            <source src="/videos/black-seed-process.mp4" type="video/mp4" />
          </video>
          <div className={styles.videoOverlay} />

          <div className={`container ${styles.contentWrapper}`}>
            {/* Timeline Steps 3 & 4 */}
            <div className={styles.timeline}>
              {PROCESS_STEPS.slice(2).map(step => (
                <div key={step.stepNumber} className={styles.timelineItem}>
                  <div className={styles.badgeCol}>
                    <div className={styles.numberBadge}>0{step.stepNumber}</div>
                  </div>

                  <div className={styles.contentCol}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <span className={styles.stepSubtitle}>{step.subtitle}</span>
                    <p className={styles.stepDesc}>{step.description}</p>

                    {step.details && step.details.length > 0 && (
                      <div className={styles.detailsBox}>
                        <ul className={styles.detailsList}>
                          {step.details.map((detail, idx) => (
                            <li key={idx} className={styles.detailItem}>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hygiene Banner */}
            <div className={styles.hygieneBanner} style={{ marginTop: '3rem', marginBottom: '3rem' }}>
              <div className={styles.bannerIcon}>
                <Shield size={32} />
              </div>
              <div>
                <h3 className={styles.bannerTitle}>Mağazada gigiyena və keyfiyyət standartı</h3>
                <p className={styles.bannerText}>
                  Bütün cihazlarımız hər sıxımdan sonra təmizlənir və tam gigiyenik hazırlanma prosesi qorunur.
                </p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className={styles.bottomCta}>
              <h3 className={styles.ctaTitle}>Yeni hazırlanmış məhsullarimizi sınaqdan keçirin</h3>
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
        </section>

      </div>
    </>
  );
};
