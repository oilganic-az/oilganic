/**
 * ScrollTrigger Defaults & Responsive Breakpoints Config
 */

export const SCROLL_CONFIG = {
  breakpoints: {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    finePointer: '(pointer: fine)',
  },
  defaults: {
    toggleActions: 'play none none reverse',
    start: 'top 85%',
    end: 'bottom 15%',
    scrubSmoothness: 0.6,
  },
} as const;
