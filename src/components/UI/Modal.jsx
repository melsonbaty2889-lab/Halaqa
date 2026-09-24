// src/components/UI/Modal.jsx
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const getPrimary = () => 'var(--color-action-primary)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getCardBg = () => 'var(--color-surface-card)';

// إدارة الحالة العالمية للـ Nested Modals والوقاية من تسريب التمرير
let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalBodyTouchAction = '';
const modalStack = []; // مكدس لتحديد Top-most Modal

export const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  className = "", 
  style = {},
  closeOnBackdropClick = true 
}) => {
  const { t } = useTranslation();
  const titleId = useId();
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const modalIdRef = useRef(titleId);

  useEffect(() => {
    if (!open) return;

    const currentModalId = modalIdRef.current;
    modalStack.push(currentModalId);

    // حفظ العنصر الذي كان يمتلك التركيز قبل الفتح
    if (typeof document !== 'undefined' && document.activeElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    // قفل تمرير الـ body فقط عند فتح المودال الأول
    if (activeModalsCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      originalBodyTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
    activeModalsCount++;

    // نقل التركيز فوراً للنافذة
    const focusTimeout = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      // تنفيذ الأحداث فقط إذا كان هذا المودال هو الأخير في المكدس (Top-most)
      const isTopModal = modalStack[modalStack.length - 1] === currentModalId;
      if (!isTopModal) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      // إدارة Focus Trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

      // إزالة هذا المودال من المكدس
      const stackIndex = modalStack.indexOf(currentModalId);
      if (stackIndex !== -1) {
        modalStack.splice(stackIndex, 1);
      }

      activeModalsCount--;
      
      // استعادة التمرير فقط عند إغلاق جميع المودالات
      if (activeModalsCount <= 0) {
        activeModalsCount = 0;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
      }

      // إعادة التركيز بأمان للعنصر السابق
      const prevEl = previousActiveElementRef.current;
      if (prevEl && typeof prevEl.focus === 'function' && document.body.contains(prevEl)) {
        prevEl.focus();
      }
    };
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  const handleBackdropClick = (e) => {
    // التأكد من أن النقر تم على الخلفية المعتمة للمودال الأعلى فقط
    const isTopModal = modalStack[modalStack.length - 1] === modalIdRef.current;
    if (closeOnBackdropClick && isTopModal && e.target === e.currentTarget) {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
          {title && <h3 id={titleId} style={{ fontWeight: 800, color: getPrimary(), fontSize: "1.05rem", margin: 0 }}>{title}</h3>}
          <button 
            type="button"
            onClick={onClose} 
            aria-label={t('common.close', 'إغلاق')}
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
