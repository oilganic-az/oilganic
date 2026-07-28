import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement>;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  { isOpen, onClose, initialFocusRef }: UseFocusTrapOptions
) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  // Store onClose in a ref so it never needs to be a reactive dependency.
  // This is the key fix: without this, every re-render that creates a new onClose
  // arrow function (e.g. from parent state updates while typing) would re-run
  // the effect — stealing focus and collapsing the mobile keyboard.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Save currently focused element
    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Helper to get all focusable elements inside container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        el => el.style.display !== 'none' && el.style.visibility !== 'hidden'
      );
    };

    // Move initial focus
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          container.focus();
        }
      }
    }, 20);

    // Keyboard Handler (Tab Trap & Escape)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === container) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);

      // Restore focus to previously focused element
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, containerRef, initialFocusRef]);
}
