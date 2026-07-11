import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)]',
  };

  /** Close on Escape key */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  /** Close on backdrop click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && onClose) {
      onClose();
    }
  };

  // Bind/unbind Escape listener and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Focus the modal content when opened for accessibility
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-text-primary)]/40 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`glass-card w-full ${sizes[size]} rounded-2xl border border-[var(--color-brand-border)] shadow-2xl flex flex-col max-h-[calc(100vh-4rem)] outline-none ${className}`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--color-brand-border)]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-bold font-display text-[var(--color-brand-text-primary)] tracking-wide"
              >
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-red)] hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto text-sm text-[var(--color-brand-text-secondary)] font-sans leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-brand-border)] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
