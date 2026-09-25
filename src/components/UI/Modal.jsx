// src/components/UI/Modal.jsx
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const getPrimary = () => 'var(--color-action-primary)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getCardBg = () => 'var(--color-surface-card)';
const getOverlayBg = () => 'var(--color-surface-overlay, rgba(7, 11, 17, 0.8))';

let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalBodyTouchAction = '';
const modalStack = [];

export const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  className = "", 
  style = {},
  closeOnBackdropClick = true 
}) => {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const modalIdRef = useRef(titleId);

  // حفظ مرجع دالة onClose الحالية تجنباً لإعادة تشغيل الـ Lifecycle
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const currentModalId = modalIdRef.current;
    modalStack.push(currentModalId);

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
      const isTopModal = modalStack[modalStack.length - 1] === currentModalId;
      if (!isTopModal) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

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

      const stackIndex = modalStack.indexOf(currentModalId);
      if (stackIndex !== -1) {
        modalStack.splice(stackIndex, 1);
      }

      activeModalsCount--;
      
      if (activeModalsCount <= 0) {
        activeModalsCount = 0;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
      }

      const prevEl = previousActiveElementRef.current;
      if (prevEl && typeof prevEl.focus === 'function' && document.body.contains(prevEl)) {
        prevEl.focus();
      }
    };
  }, [open]);

  if (!open || typeof window === 'undefined') return null;

  const handleBackdropClick = (e) => {
    const isTopModal = modalStack[modalStack.length - 1] === modalIdRef.current;
    if (closeOnBackdropClick && isTopModal && e.target === e.currentTarget) {
      onCloseRef.current?.();
    }
  };

  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : true;

  return createPortal(
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: getOverlayBg(), 
        backdropFilter: "blur(6px)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 9999, 
        padding: "16px 12px",
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
          padding: "20px 16px", 
          width: "min(92vw, 500px)", 
          maxHeight: "90vh", 
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", 
          overscrollBehavior: "contain", 
          touchAction: "pan-y", 
          boxSizing: "border-box", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          textAlign: "start",
          color: getTextTitle(),
          ...style 
        }}
      >
        {/* Header ثابت لعدم اختفائه عند التمرير */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexShrink: 0 }}>
          {title && <h3 id={titleId} style={{ fontWeight: 800, color: getPrimary(), fontSize: "1.05rem", margin: 0 }}>{title}</h3>}
          <button 
            type="button"
            onClick={() => onCloseRef.current?.()} 
            aria-label={t('common.close', 'إغلاق')}
            style={{ 
              background: "none", 
              border: "none", 
              color: getTextSub(), 
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
            <X size={20} />
          </button>
        </div>

        {/* جسم المودال القابل للتمرير للمحتوى الطويل */}
        <div 
          style={{ 
            flex: 1, 
            minHeight: 0, 
            display: "flex", 
            flexDirection: "column",
            overflowY: "auto",
            overscrollBehavior: "contain"
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
