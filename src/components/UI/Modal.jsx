import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

const getPrimary = () => 'var(--color-action-primary)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getCardBg = () => 'var(--color-surface-card)';

export const Modal = ({ open, onClose, title, children, className = "", style = {} }) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    // قفل تمرير خلفية الصفحة عند فتح النافذة
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => { 
      if (e.key === 'Escape') onClose(); 
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      style={{ position: "fixed", inset: 0, background: "rgba(7, 11, 17, 0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`ui-modal ${className}`}
        style={{ 
          background: getCardBg(), 
          border: `1px solid ${getBorder()}`, 
          borderRadius: 20, 
          padding: 24, 
          width: "100%", 
          maxWidth: 460, 
          maxHeight: "85vh", 
          overflowY: "auto", 
          boxSizing: "border-box", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          textAlign: "start",
          color: getTextTitle(),
          ...style 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          {title && <h3 id={titleId} style={{ fontWeight: 800, color: getPrimary(), fontSize: "1.05rem", margin: 0 }}>{title}</h3>}
          <button 
            type="button"
            onClick={onClose} 
            aria-label="إغلاق النافذة"
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
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
