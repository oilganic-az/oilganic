import React, { useRef } from 'react';
import { gsap } from '../../../animations/gsap';
import { useGsapContext } from '../../../hooks/useGsapContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './SplitTextReveal.module.css';

interface SplitTextRevealProps {
  lines: React.ReactNode[];
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  delay?: number;
  stagger?: number;
}

export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  lines,
  text,
  as: Component = 'div',
  className = '',
  delay = 0,
  stagger = 0.12
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const isReducedMotion = useReducedMotion();

  useGsapContext(containerRef, () => {
    if (isReducedMotion || !containerRef.current) return;

    const lineElements = containerRef.current.querySelectorAll(`.${styles.lineContent}`);
    if (lineElements.length === 0) return;

    gsap.to(lineElements, {
      y: '0%',
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger,
      delay,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  }, [isReducedMotion, delay, stagger]);

  return (
    <Component ref={containerRef as React.Ref<never>} className={`${styles.container} ${className}`}>
      {/* Screen reader accessible continuous text */}
      <span className={styles.srOnly}>{text}</span>

      {/* Visual animated lines */}
      <span aria-hidden="true" style={{ display: 'block' }}>
        {lines.map((lineContent, index) => (
          <span key={index} className={styles.lineMask}>
            <span
              className={styles.lineContent}
              style={isReducedMotion ? { transform: 'none', opacity: 1 } : undefined}
            >
              {lineContent}
            </span>
          </span>
        ))}
      </span>
    </Component>
  );
};
