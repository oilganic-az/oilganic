import React from 'react';
import { OilganicLogoSVG } from './OilganicLogoSVG';

export interface OilganicLogoProps {
  variant?: 'header' | 'hero' | 'footer' | 'symbol';
  theme?: 'light' | 'dark';
  className?: string;
  height?: number;
  size?: number;
  mode?: 'svg' | 'png';
  showSubtitle?: boolean;
}

export const OilganicLogo: React.FC<OilganicLogoProps> = ({
  variant = 'header',
  theme = 'light',
  className = '',
  height,
  size,
  mode = 'svg',
  showSubtitle = true
}) => {
  if (mode === 'png') {
    const src = theme === 'dark'
      ? '/brand/oilganic-logo-official-dark.png'
      : '/brand/oilganic-logo-official.png';

    const targetHeight = height || size || (variant === 'hero' ? 100 : variant === 'footer' ? 50 : 52);

    return (
      <img
        src={src}
        alt="Oilganic — Təbii yağlar və əzmələr"
        className={className}
        style={{ height: `${targetHeight}px`, width: 'auto', objectFit: 'contain' }}
      />
    );
  }

  return (
    <OilganicLogoSVG
      variant={variant}
      theme={theme}
      className={className}
      height={height}
      size={size}
      showSubtitle={showSubtitle}
    />
  );
};
