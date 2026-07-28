import { useEffect, useLayoutEffect, RefObject } from 'react';
import { gsap } from '../animations/gsap';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Safe GSAP context hook scoped to a component container ref
 */
export function useGsapContext(
  scopeRef: RefObject<HTMLElement | null>,
  animationFn: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return;

    const ctx = gsap.context((self) => {
      animationFn(self);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, deps);
}
