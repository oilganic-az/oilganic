import React, { useRef } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { MOTION_TOKENS } from '../../../animations/motionTokens';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = MOTION_TOKENS.magnetic.maxDisplacement
}) => {
  const isReducedMotion = useReducedMotion();
  const btnRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !btnRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const moveX = (distanceX / (rect.width / 2)) * strength;
    const moveY = (distanceY / (rect.height / 2)) * strength;

    btnRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = 'translate3d(0, 0, 0)';
  };

  return (
    <div
      ref={btnRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
