import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '../../common/Button/Button';
import { WoltIcon } from '../../common/WoltIcon/WoltIcon';
import { OilganicLogo } from '../../common/OilganicLogo/OilganicLogo';
import { SplitTextReveal } from '../../motion/SplitTextReveal/SplitTextReveal';
import { MagneticButton } from '../../motion/MagneticButton/MagneticButton';
import { Reveal } from '../../motion/Reveal/Reveal';
import { useGsapContext } from '../../../hooks/useGsapContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { gsap } from '../../../animations/gsap';
import { BUSINESS_CONFIG } from '../../../config/business';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  const visualRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();

  useGsapContext(visualRef, () => {
    if (isReducedMotion || !visualRef.current) return;

    gsap.to(visualRef.current, {
      y: -14,
      rotation: 2,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }, [isReducedMotion]);

  return (
    <section className={styles.heroSection}>
      <div className={`container ${styles.container}`}>
        {/* Left Column: Text & CTAs */}
        <div className={styles.textContent}>
          <Reveal variant="fade" delay={0.1}>
            <div className={styles.badgeRow}>
              <span className={styles.heroBadge}>Şəffaf və yerli istehsal</span>
            </div>
          </Reveal>

          <SplitTextReveal
            as="h1"
            className={styles.heroTitle}
            text="Təbii yağlar və əzmələr - gözünüzün qarşısında hazırlanır."
            lines={[
              <>Təbii yağlar və əzmələr -</>,
              <><span className={styles.greenHighlight}>gözünüzün qarşısında</span> hazırlanır.</>
            ]}
            delay={0.2}
          />

          <Reveal variant="slideUp" delay={0.4}>
            <p className={styles.heroSubtitle}>
              {BUSINESS_CONFIG.tagline}
            </p>
          </Reveal>

          <Reveal variant="slideUp" delay={0.5}>
            <div className={styles.ctaGroup}>
              <MagneticButton>
                <Link to="/products">
                  <Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
                    Məhsullara bax
                  </Button>
                </Link>
              </MagneticButton>

              <Link to="/process">
                <Button variant="outline" size="lg" icon={<Play size={18} />}>
                  Hazırlanma prosesi
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal variant="fade" delay={0.6}>
            <div className={styles.woltRow}>
              <a
                href={BUSINESS_CONFIG.woltUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.woltLink}
              >
                <WoltIcon size={18} className={styles.woltIcon} />
                <span>Sürətli çatdırılma üçün <strong>Wolt Bakı</strong> mağazamıza keçin</span>
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right Column: Organic Precision Emblem Visual */}
        <div className={styles.visualContent}>
          <div ref={visualRef} className={styles.organicHaloFrame}>
            <div className={styles.outerRing} />
            <div className={styles.innerRing} />
            <div className={styles.centerBadge}>
              <OilganicLogo variant="hero" size={96} />
            </div>
            <div className={styles.floatingTagTop}>
              Təbii Seçim
            </div>
            <div className={styles.floatingTagBottom}>
              Şəffaf İstehsalat
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
