import React, { useState, useEffect, forwardRef } from 'react';
import { C, g } from "../constants/colors";

// 1. الميدالية / الشارة (Badge)
const Badge = forwardRef(({ children, color = C.green, className = "", style = {}, ...props }, ref) => (
  <span 
    ref={ref}
    className={`ui-badge ${className}`}
    style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      gap: 4, 
      padding: "4px 12px", 
      borderRadius: 20, 
      fontSize: "0.72rem", 
      fontWeight: 700, 
      background: `${color}1A`, 
      color, 
      border: `1px solid ${color}33`, 
      whiteSpace: "nowrap",
      ...style 
    }}
    {...props}
  >
    {children}
  </span>
));
Badge.displayName = 'Badge';

// 2. الزر الاحترافي مع دعم الـ Hover (Btn)
const Btn = forwardRef(({ children, onClick, variant = "primary", style = {}, disabled = false, type = "button", className = "", ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const styles = {
    primary: { background: g.gold, color: "#1A1208" },
    secondary: { background: `${C.gold}15`, color: C.gold, border: `1px solid ${C.gold}30` },
    ghost: { background: "rgba(255,255,255,0.04)", color: C.text, border: "1px solid rgba(255,255,255,0.08)" },
    danger: { background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` },
    success: { background: C.green, color: "#0C1520", fontWeight: "bold" },
    failed: { background: C.red, color: "#fff", fontWeight: "bold" }
  };

  // إضافة تأثير بصري خفيف عند التحويم (Hover)
  const hoverStyle = isHovered && !disabled ? { filter: "brightness(1.15)", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" } : {};

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`ui-button ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Cairo', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s ease-in-out",
        ...styles[variant],
        ...hoverStyle,
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
});
Btn.displayName = 'Btn';

// 3. الكارد (Card)
const Card = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div 
    ref={ref}
    className={`ui-card ${className}`}
    style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 16, 
      padding: 20, 
      width: "100%", 
      boxSizing: "border-box", 
      ...style 
    }}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

// 4. حقل الإدخال الذكي مع دعم الـ Focus المضيء (Input)
const Input = forwardRef(({ label, value, onChange, type = "text", placeholder = "", as = "input", className = "", style = {}, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle = { 
    width: "100%", 
    background: "#1A2638", 
    border: isFocused ? `1px solid ${C.gold}` : `1px solid rgba(201,168,76,0.25)`, 
    borderRadius: 10, 
    padding: "12px 14px", 
    color: C.text, 
    fontFamily: "'Cairo', sans-serif", 
    fontSize: "0.85rem", 
    outline: "none", 
    boxSizing: "border-box",
    textAlign: "start",
    boxShadow: isFocused ? `0 0 0 3px ${C.gold}15` : "none",
    transition: "all 0.2s ease",
    ...style
  };

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      {label && <label style={{ fontSize: "0.8rem", color: C.gold, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}>{label}</label>}
      {as === "textarea"
        ? <textarea ref={ref} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className={`ui-textarea ${className}`} style={{ ...baseStyle, resize: "vertical", minHeight: 80 }} {...props} />
        : <input ref={ref} type={type} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className={`ui-input ${className}`} style={baseStyle} {...props} />
      }
    </div>
  );
});
Input.displayName = 'Input';

// 5. قائمة الاختيارات الذكية (Select)
const Select = forwardRef(({ label, value, onChange, options = [], className = "", style = {}, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      {label && <label style={{ fontSize: "0.8rem", color: C.gold, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}>{label}</label>}
      <select 
        ref={ref}
        value={value} 
        onChange={onChange} 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`ui-select ${className}`}
        style={{ 
          width: "100%", 
          background: "#1A2638", 
          border: isFocused ? `1px solid ${C.gold}` : `1px solid rgba(201,168,76,0.25)`, 
          borderRadius: 10, 
          padding: "12px 14px", 
          color: C.text, 
          fontFamily: "'Cairo', sans-serif", 
          fontSize: "0.85rem", 
          outline: "none", 
          cursor: "pointer", 
          boxSizing: "border-box",
          textAlign: "start",
          boxShadow: isFocused ? `0 0 0 3px ${C.gold}15` : "none",
          transition: "all 0.2s ease",
          ...style 
        }}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
});
Select.displayName = 'Select';

// 6. النافذة المنبثقة الذكية العالمية (Modal)
const Modal = ({ open, onClose, title, children, className = "", style = {} }) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { e.key === 'Escape' && onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 16 }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`ui-modal ${className}`}
        style={{ 
          background: C.surface, 
          border: `1px solid ${C.border}`, 
          borderRadius: 20, 
          padding: 24, 
          width: "100%", 
          maxWidth: 460, 
          maxHeight: "85vh", 
          overflowY: "auto", 
          boxSizing: "border-box", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          textAlign: "start",
          ...style 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, color: C.gold, fontSize: "1.05rem", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 28, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
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
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: C.gold, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "0.82rem", color: C.muted, marginTop: 4, margin: 0 }}>{sub}</p>}
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{action}</div>
  </div>
));
PageHeader.displayName = 'PageHeader';

// 8. خلايا الجداول العالمية المستجيبة للغات (TH & TD)
const TH = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <th 
    ref={ref}
    className={`ui-th ${className}`}
    style={{ 
      padding: "14px 12px", 
      textAlign: "start", 
      fontSize: "0.75rem", 
      color: C.gold, 
      fontWeight: 700, 
      borderBottom: `2px solid ${C.border}`, 
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
      fontSize: "0.85rem", 
      borderBottom: "1px solid rgba(255,255,255,0.04)", 
      color: C.text, 
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

export {
  Badge,
  Btn,
  Card,
  Input,
  Select,
  Modal,
  PageHeader,
  TH,
  TD
};
