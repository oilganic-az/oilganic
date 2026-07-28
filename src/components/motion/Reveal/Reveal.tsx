import React, { useRef } from 'react';
import { gsap } from '../../../animations/gsap';
import { useGsapContext } from '../../../hooks/useGsapContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import styles from './Reveal.module.css';

interface RevealProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  duration?: number;
  delay?: number;
  className?: string;
  triggerStart?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'slideUp',
  duration = 0.6,
  delay = 0,
  className = '',
  triggerStart = 'top 85%'
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();

  useGsapContext(boxRef, () => {
    if (isReducedMotion || !boxRef.current) return;

    gsap.to(boxRef.current, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: boxRef.current,
        start: triggerStart,
        toggleActions: 'play none none reverse',
      },
    });
  }, [isReducedMotion, duration, delay, triggerStart]);

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={boxRef}
      className={`${styles.revealBox} ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
