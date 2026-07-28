import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import styles from './Drawer.module.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  children,
  ariaLabel
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap(panelRef, { isOpen, onClose, initialFocusRef: closeBtnRef });

  if (!isOpen) return null;

  const titleId = title ? 'drawer-title-heading' : undefined;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!titleId ? ariaLabel || 'Səhifə paneli' : undefined}
        tabIndex={-1}
        className={`${styles.drawer} ${styles[position]}`}
      >
        <div className={styles.header}>
          {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Bağla"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
