import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, ariaLabel }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap(modalRef, { isOpen, onClose, initialFocusRef: closeBtnRef });

  if (!isOpen) return null;

  const titleId = title ? 'modal-title-heading' : undefined;

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={!titleId ? ariaLabel || 'Dialoq pəncərəsi' : undefined}
        tabIndex={-1}
        className={styles.modal}
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
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
