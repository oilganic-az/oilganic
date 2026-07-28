# MOTION_WALKTHROUGH.md - Oilganic Organic Motion Architecture

This document catalogs every motion interaction, trigger, easing, responsive adaptation, and reduced-motion fallback in the Oilganic web application.

---

## 1. Animation System Overview

- **Core Concept**: *"Organic Motion — Nature in Flow"* (Flowing oils, rotating seeds, organic leaf masks, fluid transitions).
- **Core Technology Stack**: GSAP + GSAP ScrollTrigger + `@gsap/react`, CSS Modules, Native CSS transitions.
- **Reliability Architecture**: Progressive enhancement (`html.motion-ready`). Core content remains 100% visible by default even if JavaScript or GSAP fail to execute.

---

## 2. Animation Catalog

### A. Non-Intrusive Page Entry (`OpeningIntro`)
- **File**: [`OpeningIntro.tsx`](file:///d:/github_repos/oilganic/src/components/motion/OpeningIntro/OpeningIntro.tsx)
- **Trigger**: First visit per session (`sessionStorage.getItem('oilganic_intro_seen_v1')`).
- **Duration**: ~950ms total sequence.
- **Easing**: `power2.out` (enter) -> `power2.in` (exit).
- **Responsive Behavior**: Centers on viewports of all sizes.
- **Reduced-Motion Fallback**: Automatically skipped (`return null`).

---

### B. Global Scroll Progress Indicator (`ScrollProgress`)
- **File**: [`ScrollProgress.tsx`](file:///d:/github_repos/oilganic/src/components/motion/ScrollProgress/ScrollProgress.tsx)
- **Trigger**: Scroll position (`window.scrollY` / document scroll height).
- **Duration**: Real-time progress updates (`0.1s` ease-out).
- **Easing**: `linear` scrub.
- **Responsive Behavior**: Top progress bar active on all devices; circular desktop widget appears on viewports >= 768px when scrolled down (>40px).
- **Reduced-Motion Fallback**: Disabled (`return null`).

---

### C. Smart Scroll-Direction Header (`Header`)
- **File**: [`Header.tsx`](file:///d:/github_repos/oilganic/src/components/layout/Header/Header.tsx)
- **Trigger**: Scroll direction change & Y threshold (>40px).
- **Duration**: `300ms`.
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Responsive Behavior**: Shrinks from 72px to 62px height when scrolled; hides smoothly on downward scroll and reveals on upward scroll. Always remains visible when mobile drawer, search modal, cart, or keyboard focus are active.
- **Reduced-Motion Fallback**: Standard sticky header without translation animations.

---

### D. Hero Line-by-Line Headline Reveal (`SplitTextReveal`)
- **File**: [`SplitTextReveal.tsx`](file:///d:/github_repos/oilganic/src/components/motion/SplitTextReveal/SplitTextReveal.tsx)
- **Trigger**: ScrollTrigger viewport entrance (`top 88%`).
- **Duration**: `0.7s` per line.
- **Easing**: `power3.out`.
- **Responsive Behavior**: Recalculates lines responsively.
- **Reduced-Motion Fallback**: Lines render static and fully visible (`transform: none`, `opacity: 1`). Accessible continuous text is preserved in `sr-only` container.

---

### E. Organic Halo Depth Movement (`HeroSection`)
- **File**: [`HeroSection.tsx`](file:///d:/github_repos/oilganic/src/components/home/HeroSection/HeroSection.tsx)
- **Trigger**: Infinite gentle yoyo loop.
- **Duration**: `3.5s`.
- **Easing**: `sine.inOut`.
- **Responsive Behavior**: Vertical shift -14px and rotation 2deg.
- **Reduced-Motion Fallback**: Static halo visual.

---

### F. Signature Preparation Process Scrollytelling (`ProcessPreview`)
- **File**: [`ProcessPreview.tsx`](file:///d:/github_repos/oilganic/src/components/home/ProcessPreview/ProcessPreview.tsx)
- **Trigger**: Desktop pinned ScrollTrigger (`pin: true`, `end: "+=1000"`).
- **Duration**: Tied to scroll distance.
- **Easing**: Smooth scrub `0.5s`.
- **Responsive Behavior**:
  - **Desktop (>= 1024px)**: Pinned 4-stage interactive sequence (1. Seçilmiş Xammal -> 2. Soyuq Sıxım -> 3. Qablaşdırma -> 4. Təzə Təhvil).
  - **Mobile (< 1024px)**: Standard scrollable vertical step grid.
- **Reduced-Motion Fallback**: Static step card grid without scroll pinning.

---

### G. Magnetic CTA Buttons (`MagneticButton`)
- **File**: [`MagneticButton.tsx`](file:///d:/github_repos/oilganic/src/components/motion/MagneticButton/MagneticButton.tsx)
- **Trigger**: Mouse hover/move on primary CTAs.
- **Duration**: Immediate displacement, `0.3s` return ease.
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Responsive Behavior**: Active on fine-pointer desktop devices (`(pointer: fine)`). Disabled on touch screens.
- **Reduced-Motion Fallback**: Returns static button without displacement.

---

### H. Organic Cursor Ring (`OrganicCursor`)
- **File**: [`OrganicCursor.tsx`](file:///d:/github_repos/oilganic/src/components/motion/OrganicCursor/OrganicCursor.tsx)
- **Trigger**: Desktop mouse movement.
- **Duration**: Continuous `requestAnimationFrame` lerp.
- **Easing**: Smooth follow.
- **Responsive Behavior**: Desktop fine-pointer devices only. Scales up when hovering interactive elements. Does not interfere with form inputs.
- **Reduced-Motion Fallback**: Disabled (`return null`).

---

### I. Section & Card Scroll Reveals (`Reveal`)
- **File**: [`Reveal.tsx`](file:///d:/github_repos/oilganic/src/components/motion/Reveal/Reveal.tsx)
- **Trigger**: ScrollTrigger entering viewport (`top 85%`).
- **Duration**: `0.6s`.
- **Easing**: `power3.out`.
- **Responsive Behavior**: Active across all viewports.
- **Reduced-Motion Fallback**: Content rendered 100% visible immediately.
