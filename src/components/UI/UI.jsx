import React, { useState, useEffect, forwardRef, useId, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import C, { C as C_named, g } from "@/theme/colors";

// استخراج الهوية وثيم الألوان المعياري
const Theme = C || C_named || {};

const getPrimary = () => Theme.primary?.DEFAULT || Theme.primary || Theme.amber?.DEFAULT;
const getSurface = () => Theme.dark?.surface || Theme.surface;
const getCardBg = () => Theme.dark?.card || Theme.card || getSurface();
const getBorder = () => Theme.border || Theme.dark?.borderInput || Theme.dark?.border;
const getTextTitle = () => Theme.text?.title || Theme.text;
const getTextSub = () => Theme.text?.sub || Theme.textSub;
const getDanger = () => Theme.rose?.DEFAULT || Theme.danger;
const getSuccess = () => Theme.emerald?.DEFAULT || Theme.success;

// مؤشر التحميل القياسي الداخلي
const Spinner = ({ size = 18 }) => (
  <svg 
    style={{ animation: "ui-spin 0.8s linear infinite", display: "inline-block" }} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <style>{`@keyframes ui-spin { 100% { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" opacity="0.25" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="15.7 31.4" strokeLinecap="round" />
  </svg>
);

// 1. الميدالية / الشارة (Badge)
const Badge = forwardRef(({ children, color, className = "", style = {}, ...props }, ref) => {
  const badgeColor = color || getPrimary();

  return (
    <span 
      ref={ref}
      className={`ui-badge ${className}`}
      style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 6, 
        padding: "4px 12px", 
        minHeight: "28px",
        borderRadius: 20, 
        fontSize: "0.75rem", 
        fontWeight: 700, 
        background: `${badgeColor}1A`, 
        color: badgeColor, 
        border: `1px solid ${badgeColor}33`, 
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        ...style 
      }}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';

// 2. الزر الاحترافي (Btn / Button)
const Btn = forwardRef(({ 
  children, 
  onClick, 
  variant = "primary", 
  style = {}, 
  disabled = false, 
  loading = false,
  startIcon = null,
  endIcon = null,
  type = "button", 
  className = "", 
  "aria-label": ariaLabel,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryColor = getPrimary();
  const dangerColor = getDanger();
  const successColor = getSuccess();
  const textTitle = getTextTitle();
  const borderCol = getBorder();

  const styles = {
    primary: { background: g?.gold || g?.emerald || primaryColor, color: Theme.white || textTitle, fontWeight: "bold" },
    secondary: { background: `${primaryColor}15`, color: primaryColor, border: `1px solid ${primaryColor}30` },
    ghost: { background: Theme.ghostBg || `${borderCol}20`, color: textTitle, border: `1px solid ${borderCol}` },
    danger: { background: `${dangerColor}15`, color: dangerColor, border: `1px solid ${dangerColor}30` },
    success: { background: successColor, color: Theme.white || textTitle, fontWeight: "bold" },
    failed: { background: dangerColor, color: Theme.white || textTitle, fontWeight: "bold" }
  };

  const isDisabled = disabled || loading;
  const hoverStyle = isHovered && !isDisabled ? { filter: "brightness(1.12)", transform: "translateY(-1px)" } : {};

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`ui-button ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 18px",
        minHeight: "44px", // التزام بقاعدة Mobile-First لمساحات اللمس
        borderRadius: 10,
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: "0.875rem",
        fontWeight: 600,
        opacity: isDisabled ? 0.5 : 1,
        transition: "all 0.2s ease-in-out",
        boxSizing: "border-box",
        ...styles[variant],
        ...hoverStyle,
        ...style
      }}
      {...props}
    >
      {loading ? <Spinner size={18} /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  );
});
Btn.displayName = 'Btn';

// 3. الكارد الموحد (Card & Subcomponents)
const Card = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div 
    ref={ref}
    className={`ui-card ${className}`}
    style={{ 
      background: getCardBg(), 
      border: `1px solid ${getBorder()}`, 
      borderRadius: 16, 
      padding: 20, 
      width: "100%", 
      boxSizing: "border-box", 
      boxShadow: Theme.shadow,
      color: getTextTitle(),
      textAlign: "start", // استخدام خصائص المحاذاة المنطقية
      ...style 
    }}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const CardHeader = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-header ${className}`} style={{ borderBottom: `1px solid ${getBorder()}`, paddingBottom: 12, marginBottom: 16, textAlign: "start", ...style }} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'Card.Header';

const CardBody = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-body ${className}`} style={{ textAlign: "start", ...style }} {...props}>
    {children}
  </div>
));
CardBody.displayName = 'Card.Body';

const CardFooter = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div ref={ref} className={`ui-card-footer ${className}`} style={{ borderTop: `1px solid ${getBorder()}`, paddingTop: 12, marginTop: 16, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, ...style }} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'Card.Footer';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// 4. حقل الإدخال الذكي (Input)
const Input = forwardRef(({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "", 
  as = "input", 
  className = "", 
  style = {}, 
  id: customId, 
  startIcon = null,
  endIcon = null,
  errorText = "",
  helperText = "",
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const autoId = useId();
  const inputId = customId || autoId;

  const primaryColor = getPrimary();
  const borderCol = errorText ? getDanger() : getBorder();

  const baseStyle = { 
    width: "100%", 
    background: getSurface(), 
    border: isFocused ? `1px solid ${errorText ? getDanger() : primaryColor}` : `1px solid ${borderCol}`, 
    borderRadius: 10, 
    padding: "10px 14px",
    paddingLeft: startIcon ? "40px" : "14px",
    paddingRight: endIcon ? "40px" : "14px",
    minHeight: as === "textarea" ? "auto" : "44px",
    color: getTextTitle(), 
    fontFamily: "inherit", 
    fontSize: "0.875rem", 
    outline: "none", 
    boxSizing: "border-box",
    textAlign: "start",
    boxShadow: isFocused ? `0 0 0 3px ${errorText ? `${getDanger()}20` : `${primaryColor}15`}` : "none",
    transition: "all 0.2s ease",
    colorScheme: "dark",
    ...style
  };

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      {label && (
        <label 
          htmlFor={inputId}
          style={{ fontSize: "0.8rem", color: errorText ? getDanger() : primaryColor, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        {startIcon && (
          <span style={{ position: "absolute", left: 12, display: "flex", alignItems: "center", color: getTextSub(), pointerEvents: "none" }}>
            {startIcon}
          </span>
        )}

        {as === "textarea" ? (
          <textarea 
            ref={ref} 
            id={inputId}
            value={value} 
            onChange={onChange} 
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            placeholder={placeholder} 
            aria-invalid={!!errorText}
            className={`ui-textarea ${className}`} 
            style={{ ...baseStyle, resize: "vertical", minHeight: 90 }} 
            {...props} 
          />
        ) : (
          <input 
            ref={ref} 
            id={inputId}
            type={type} 
            value={value} 
            onChange={onChange} 
            onFocus={() => setIsFocused(true)} 
            onBlur={() => setIsFocused(false)} 
            placeholder={placeholder} 
            aria-invalid={!!errorText}
            className={`ui-input ${className}`} 
            style={baseStyle} 
            {...props} 
          />
        )}

        {endIcon && (
          <span style={{ position: "absolute", right: 12, display: "flex", alignItems: "center", color: getTextSub() }}>
            {endIcon}
          </span>
        )}
      </div>

      {(errorText || helperText) && (
        <span role={errorText ? "alert" : undefined} style={{ fontSize: "0.75rem", marginTop: 4, display: "block", textAlign: "start", color: errorText ? getDanger() : getTextSub() }}>
          {errorText || helperText}
        </span>
      )}
    </div>
  );
});
Input.displayName = 'Input';

// 5. قائمة الاختيارات المخصصة (Select عبر React Portal)
const Select = forwardRef(({ label, value, onChange, options = [], className = "", style = {}, id: customId, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const autoId = useId();
  const selectId = customId || autoId;

  const selectedOption = options.find(o => o.value === value) || options[0];
  const primaryColor = getPrimary();
  const borderCol = getBorder();
  const textTitle = getTextTitle();

  const handleToggle = useCallback(() => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width
      });
    }
    setIsOpen(prev => !prev);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box", position: "relative" }}>
      {label && (
        <label 
          htmlFor={selectId}
          style={{ fontSize: "0.8rem", color: primaryColor, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}
        >
          {label}
        </label>
      )}
      
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`ui-select ${className}`}
        style={{
          width: "100%",
          minHeight: "44px",
          background: getSurface(),
          border: isOpen ? `1px solid ${primaryColor}` : `1px solid ${borderCol}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: textTitle,
          fontFamily: "inherit",
          fontSize: "0.875rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxSizing: "border-box",
          boxShadow: isOpen ? `0 0 0 3px ${primaryColor}15` : "none",
          transition: "all 0.2s ease",
          ...style
        }}
        {...props}
      >
        <span>{selectedOption?.label || "اختر..."}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "0.7rem", color: primaryColor }}>▼</span>
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <ul
            role="listbox"
            aria-activedescendant={value}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              background: getSurface(),
              border: `1px solid ${borderCol}`,
              borderRadius: 12,
              padding: "6px 0",
              margin: 0,
              listStyle: "none",
              zIndex: 9999,
              maxHeight: 220,
              overflowY: "auto",
              boxShadow: Theme.shadow,
              backdropFilter: "blur(12px)"
            }}
          >
            {options.map(o => (
              <li
                key={o.value}
                id={o.value}
                role="option"
                aria-selected={value === o.value}
                onClick={() => {
                  onChange({ target: { value: o.value } });
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  minHeight: "44px",
                  fontSize: "0.875rem",
                  color: value === o.value ? primaryColor : textTitle,
                  background: value === o.value ? `${primaryColor}1A` : "transparent",
                  cursor: "pointer",
                  textAlign: "start",
                  fontWeight: value === o.value ? 700 : 400,
                  transition: "background 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <span>{o.label}</span>
                {value === o.value && <span style={{ color: primaryColor, fontSize: "0.8rem" }}>✓</span>}
              </li>
            ))}
          </ul>
        </>,
        document.body
      )}
    </div>
  );
});
Select.displayName = 'Select';

// 6. النافذة المنبثقة (Modal عبر React Portal)
const Modal = ({ open, onClose, title, children, className = "", style = {} }) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { e.key === 'Escape' && onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      style={{ position: "fixed", inset: 0, background: Theme.overlayBg || `${getSurface()}E6`, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`ui-modal ${className}`}
        style={{ 
          background: getSurface(), 
          border: `1px solid ${getBorder()}`, 
          borderRadius: 20, 
          padding: 24, 
          width: "100%", 
          maxWidth: 460, 
          maxHeight: "85vh", 
          overflowY: "auto", 
          boxSizing: "border-box", 
          boxShadow: Theme.shadow,
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

// 7. ترويسة الصفحة (PageHeader)
const PageHeader = forwardRef(({ title, sub, action, className = "", style = {} }, ref) => (
  <div 
    ref={ref}
    className={`ui-pageheader ${className}`}
    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24, ...style }}
  >
    <div style={{ textAlign: "start" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: getPrimary(), margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "0.85rem", color: getTextSub(), marginTop: 4, margin: 0 }}>{sub}</p>}
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{action}</div>
  </div>
));
PageHeader.displayName = 'PageHeader';

// 8. مكونات الجداول (Table, THead, TBody, TR, TH, TD)
const Table = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div style={{ width: "100%", overflowX: "auto" }}>
    <table ref={ref} className={`ui-table ${className}`} style={{ width: "100%", borderCollapse: "collapse", ...style }} {...props}>
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

const THead = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <thead ref={ref} className={className} style={style} {...props}>{children}</thead>
));
THead.displayName = 'THead';

const TBody = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <tbody ref={ref} className={className} style={style} {...props}>{children}</tbody>
));
TBody.displayName = 'TBody';

const TR = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <tr ref={ref} className={className} style={style} {...props}>{children}</tr>
));
TR.displayName = 'TR';

const TH = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <th 
    ref={ref}
    className={`ui-th ${className}`}
    style={{ 
      padding: "14px 12px", 
      textAlign: "start", 
      fontSize: "0.75rem", 
      color: getPrimary(), 
      fontWeight: 700, 
      borderBottom: `2px solid ${getBorder()}`, 
      whiteSpace: "nowrap", 
      ...style 
    }}
    {...props}
  >
    {children}
  </th>
));
TH.displayName = 'TH';

const TD = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <td 
    ref={ref}
    className={`ui-td ${className}`}
    style={{ 
      padding: "14px 12px", 
      fontSize: "0.875rem", 
      borderBottom: `1px solid ${getBorder()}`, 
      color: getTextTitle(), 
      whiteSpace: "nowrap", 
      textAlign: "start", 
      ...style 
    }}
    {...props}
  >
    {children}
  </td>
));
TD.displayName = 'TD';

export { Badge, Btn, Btn as Button, Card, Input, Select, Modal, PageHeader, Table, THead, TBody, TR, TH, TD };
