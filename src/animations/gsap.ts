import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Set default GSAP configuration
  gsap.config({
    autoSleep: 60,
    force3D: true,
  });

  // Enable motion-ready class on document element
  document.documentElement.classList.add('motion-ready');
}

export { gsap, ScrollTrigger };
