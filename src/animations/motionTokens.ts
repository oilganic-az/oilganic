/**
 * Motion Tokens & Easing Constants - Oilganic Organic Motion System
 */

export const MOTION_TOKENS = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    normal: 0.35,
    slow: 0.6,
    cinematic: 1.0,
    intro: 1.1,
  },

  ease: {
    // Smooth natural organic curves
    organic: 'cubic-bezier(0.22, 1, 0.36, 1)',
    organicOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    organicInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    softSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    linear: 'linear',
  },

  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.15,
  },

  parallax: {
    subtle: 20,
    medium: 40,
    strong: 70,
  },

  magnetic: {
    maxDisplacement: 8,
    textDisplacement: 4,
    speed: 0.3,
  },

  scroll: {
    scrubSpeed: 0.8,
    pinSpacing: true,
  },
} as const;

export type MotionDurationKey = keyof typeof MOTION_TOKENS.duration;
export type MotionEaseKey = keyof typeof MOTION_TOKENS.ease;
