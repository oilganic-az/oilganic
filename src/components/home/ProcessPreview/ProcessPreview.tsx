import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PROCESS_STEPS } from '../../../data/processSteps';
import { Button } from '../../common/Button/Button';
import { Reveal } from '../../motion/Reveal/Reveal';
import { useGsapContext } from '../../../hooks/useGsapContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { gsap } from '../../../animations/gsap';
import styles from './ProcessPreview.module.css';

export const ProcessPreview: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isReducedMotion = useReducedMotion();

  useGsapContext(sectionRef, () => {
    if (isReducedMotion || typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    gsap.to({}, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top+=80',
        end: '+=1000',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const stepCount = PROCESS_STEPS.length;
          const newIndex = Math.min(stepCount - 1, Math.floor(self.progress * stepCount));
          setActiveStepIndex(newIndex);
        },
      },
    });
  }, [isReducedMotion]);

  const activeStep = PROCESS_STEPS[activeStepIndex] || PROCESS_STEPS[0];

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">
        <Reveal variant="fade">
          <div className={styles.topBox}>
            <div>
              <span className={styles.sectionBadge}>Brendin fərqi</span>
              <h2 className={styles.sectionTitle}>Gözünüzün qarşısında hazırlanan şəffaf istehsalat</h2>
            </div>
            <p className={styles.sectionSubtitle}>
              Oilganic-də təbii yağlar və çərəz əzmələri mağazamızda müştərilərimizin gözü qarşısında soyuq sıxım texnologiyası ilə təzə sıxılır.
            </p>
          </div>
        </Reveal>

        {/* Desktop Interactive Scrollytelling / Selection System */}
        <div className={styles.scrollyWrapper}>
          <div className={styles.scrollyGrid}>
            <div className={styles.activeStepDisplay}>
              <span className={styles.activeStepNumber}>Mərhələ 0{activeStep.stepNumber} / 04</span>
              <h3 className={styles.activeStepTitle}>{activeStep.title}</h3>
              <span className={styles.activeStepSubtitle}>{activeStep.subtitle}</span>
              <p className={styles.activeStepDesc}>{activeStep.description}</p>

              <ul className={styles.detailList}>
                {activeStep.details.map((detail, dIdx) => (
                  <li key={dIdx} className={styles.detailItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.stepNavList}>
              {PROCESS_STEPS.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className={`${styles.stepNavItem} ${idx === activeStepIndex ? styles.stepNavItemActive : ''}`}
                  onClick={() => setActiveStepIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveStepIndex(idx);
                    }
                  }}
                  aria-label={`Mərhələ ${step.stepNumber}: ${step.title}`}
                >
                  <span className={styles.navStepNum}>0{step.stepNumber}</span>
                  <span className={styles.navStepTitle}>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Reveal variant="fade" delay={0.2}>
          <div className={styles.bottomCta}>
            <Link to="/process">
              <Button variant="dark" size="lg" icon={<ArrowRight size={18} />}>
                Bütün hazırlanma prosesini kəşf edin
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
