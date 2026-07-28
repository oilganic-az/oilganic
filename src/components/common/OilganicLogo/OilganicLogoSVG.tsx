import React from 'react';
import styles from './OilganicLogo.module.css';

export interface OilganicLogoSVGProps {
  variant?: 'header' | 'hero' | 'footer' | 'symbol';
  theme?: 'light' | 'dark';
  className?: string;
  height?: number;
  size?: number;
  showSubtitle?: boolean;
}

export const OilganicEmblemSVG: React.FC<{ size?: number; theme?: 'light' | 'dark'; className?: string }> = ({
  size = 200,
  theme = 'light',
  className = ''
}) => {
  const isDark = theme === 'dark';
  const ribbonColor = isDark ? '#FFFFFF' : '#2F7D32';
  const leafColor = isDark ? '#FFFFFF' : '#033A25';

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z" fill={ribbonColor}/>
      <path d="M294 74.9992C271 66.4992 471.224 151.043 435 374.501C392 381 324 -8 82.5 113C234 -89.4996 581 104 448 374.501C470 169.5 317 83.4993 294 74.9992Z" fill={leafColor}/>
    </svg>
  );
};

export const OilganicLogoSVG: React.FC<OilganicLogoSVGProps> = ({
  variant = 'header',
  theme = 'light',
  className = '',
  height,
  size,
  showSubtitle = true
}) => {
  const isDark = theme === 'dark';
  const mainColor = isDark ? '#FFFFFF' : '#237A2B';
  const subtitleColor = isDark ? '#C0E0C4' : '#237A2B';

  // Both parts of O emblem fully white for dark theme (footer section)
  const emblemRibbonColor = isDark ? '#FFFFFF' : '#2F7D32';
  const emblemLeafColor = isDark ? '#FFFFFF' : '#033A25';

  const targetHeight = height || size || (variant === 'hero' ? 100 : variant === 'footer' ? 50 : 52);

  if (variant === 'symbol') {
    return (
      <div className={`${styles.symbolVariant} ${className}`}>
        <OilganicEmblemSVG size={targetHeight} theme={theme} />
      </div>
    );
  }

  return (
    <div
      className={`${styles.svgLogoContainer} ${styles[`${variant}Variant`]} ${className}`}
      style={{ height: `${targetHeight}px` }}
      role="img"
      aria-label="Oilganic - Təbii yağlar və əzmələr"
    >
      <svg
        viewBox="15 15 450 150"
        height="100%"
        width="auto"
        className={styles.svgElement}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* O Emblem Mark: Fully white for dark theme */}
          <g transform="translate(24, 20) scale(0.192)">
            <path d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z" fill={emblemRibbonColor}/>
            <path d="M294 74.9992C271 66.4992 471.224 151.043 435 374.501C392 381 324 -8 82.5 113C234 -89.4996 581 104 448 374.501C470 169.5 317 83.4993 294 74.9992Z" fill={emblemLeafColor}/>
          </g>

          {/* Wordmark 'ilganic' starting at x=122 */}
          <text
            x="122"
            y="112"
            fill={mainColor}
            fontSize="94"
            fontWeight="700"
            fontFamily="var(--font-logo)"
            letterSpacing="-2"
          >
            ilganic
          </text>

          {/* Subtitle 'təbii yağlar və əzmələr' starting at x=124 */}
          {showSubtitle && (
            <text
              x="124"
              y="152"
              fill={subtitleColor}
              fontSize="24"
              fontWeight="400"
              fontFamily="var(--font-heading)"
              letterSpacing="3.2"
            >
              təbii yağlar və əzmələr
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};
