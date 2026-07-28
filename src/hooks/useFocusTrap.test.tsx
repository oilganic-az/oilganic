import React, { useRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

const TestDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(containerRef, { isOpen, onClose, initialFocusRef: closeBtnRef });

  if (!isOpen) return null;

  return (
    <div ref={containerRef} tabIndex={-1} data-testid="dialog-container">
      <button ref={closeBtnRef} data-testid="close-btn" onClick={onClose}>
        Close
      </button>
      <input data-testid="input-field" type="text" />
      <button data-testid="action-btn">Submit</button>
    </div>
  );
};

const TestApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        data-testid="trigger-btn"
        onClick={() => setIsOpen(true)}
      >
        Open Dialog
      </button>
      <TestDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

describe('Accessible Dialog Focus Trap & Escape Key Handler', () => {
  it('triggers onClose when Escape key is pressed inside open dialog', () => {
    const handleClose = vi.fn();
    render(<TestDialog isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab navigation within dialog elements', async () => {
    render(<TestApp />);

    const triggerBtn = screen.getByTestId('trigger-btn');
    fireEvent.click(triggerBtn);

    const closeBtn = await screen.findByTestId('close-btn');
    const actionBtn = screen.getByTestId('action-btn');

    // Focus last element
    actionBtn.focus();
    expect(document.activeElement).toBe(actionBtn);

    // Press Tab on last element -> wraps to closeBtn
    fireEvent.keyDown(actionBtn, { key: 'Tab', code: 'Tab', keyCode: 9, which: 9 });
    expect(document.activeElement).toBe(closeBtn);
  });
});
