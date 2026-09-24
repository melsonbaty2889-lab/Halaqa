import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const getPrimary = () => 'var(--color-action-primary)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getCardBg = () => 'var(--color-surface-card)';

let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalBodyTouchAction = '';

export const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  className = "", 
  style = {},
  closeOnBackdropClick = true // خيار التحكم بالإغلاق عند النقر بالخارج
}) => {
  const titleId = useId();
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (typeof document !== 'undefined' && document.activeElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    if (activeModalsCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      originalBodyTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
    activeModalsCount++;

    const focusTimeout = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);

      activeModalsCount--;
      if (activeModalsCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
      }

      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(7, 11, 17, 0.8)", 
        backdropFilter: "blur(6px)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 9999, 
        padding: 16,
        touchAction: "none"
      }} 
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`ui-modal outline-none ${className}`}
        style={{ 
          background: getCardBg(), 
          border: `1px solid ${getBorder()}`, 
          borderRadius: 20, 
          padding: 24, 
          width: "100%", 
          maxWidth: 460, 
          maxHeight: "85vh", 
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", 
          overscrollBehavior: "contain", 
          touchAction: "pan-y", 
          boxSizing: "border-box", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          textAlign: "start",
          color: getTextTitle(),
          ...style 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, shrink: 0 }}>
          {title && <h3 id={titleId} style={{ fontWeight: 800, color: getPrimary(), fontSize: "1.05rem", margin: 0 }}>{title}</h3>}
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close modal"
            style={{ 
              background: "none", 
              border: "none", 
              color: getTextSub(), 
              fontSize: 28, 
              cursor: "pointer", 
              padding: 0, 
              lineHeight: 1,
              minWidth: "44px",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
