// src/components/UI/UI.jsx
import React, { useState, useEffect, forwardRef } from 'react';
import { C, g } from "@/constants/colors";

// 1. الميدالية / الشارة (Badge)
const Badge = forwardRef(({ children, color = C.primary, className = "", style = {}, ...props }, ref) => (
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
      fontFamily: "inherit",
      ...style 
    }}
    {...props}
  >
    {children}
  </span>
));
Badge.displayName = 'Badge';

// 2. الزر الاحترافي (Btn)
const Btn = forwardRef(({ children, onClick, variant = "primary", style = {}, disabled = false, type = "button", className = "", ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const styles = {
    primary: { background: g.gold || g.emerald, color: "#ffffff", fontWeight: "bold" },
    secondary: { background: `${C.primary}15`, color: C.primary, border: `1px solid ${C.primary}30` },
    ghost: { background: "rgba(255,255,255,0.04)", color: C.text, border: "1px solid rgba(255,255,255,0.08)" },
    danger: { background: `${C.danger}15`, color: C.danger, border: `1px solid ${C.danger}30` },
    success: { background: C.success, color: "#ffffff", fontWeight: "bold" },
    failed: { background: C.danger, color: "#ffffff", fontWeight: "bold" }
  };

  const hoverStyle = isHovered && !disabled ? { filter: "brightness(1.12)", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" } : {};

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
        fontFamily: "inherit",
        fontSize: "0.82rem",
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

// 3. الكارد الموحد (Card)
const Card = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <div 
    ref={ref}
    className={`ui-card ${className}`}
    style={{ 
      background: C.card || C.surface, 
      border: `1px solid ${C.border}`, 
      borderRadius: 16, 
      padding: 20, 
      width: "100%", 
      boxSizing: "border-box", 
      boxShadow: C.shadow,
      ...style 
    }}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

// 4. حقل الإدخال الذكي (Input & Textarea)
const Input = forwardRef(({ label, value, onChange, type = "text", placeholder = "", as = "input", className = "", style = {}, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle = { 
    width: "100%", 
    background: C.surface || "#0f172a", 
    border: isFocused ? `1px solid ${C.primary}` : `1px solid ${C.border}`, 
    borderRadius: 10, 
    padding: "12px 14px", 
    color: C.text || "#f8fafc", 
    fontFamily: "inherit", 
    fontSize: "0.85rem", 
    outline: "none", 
    boxSizing: "border-box",
    textAlign: "start",
    boxShadow: isFocused ? `0 0 0 3px ${C.primary}15` : "none",
    transition: "all 0.2s ease",
    colorScheme: "dark",
    ...style
  };

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      {label && <label style={{ fontSize: "0.8rem", color: C.primary, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}>{label}</label>}
      {as === "textarea"
        ? <textarea ref={ref} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className={`ui-textarea ${className}`} style={{ ...baseStyle, resize: "vertical", minHeight: 80 }} {...props} />
        : <input ref={ref} type={type} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} className={`ui-input ${className}`} style={baseStyle} {...props} />
      }
    </div>
  );
});
Input.displayName = 'Input';

// 5. قائمة الاختيارات الذكية المخصصة (Custom Floating Select)
const Select = forwardRef(({ label, value, onChange, options = [], className = "", style = {}, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box", position: "relative" }}>
      {label && (
        <label style={{ fontSize: "0.8rem", color: C.primary, marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}>
          {label}
        </label>
      )}
      
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ui-select ${className}`}
        style={{
          width: "100%",
          background: C.surface || "#0f172a",
          border: isOpen ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text || "#f8fafc",
          fontFamily: "inherit",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          boxSizing: "border-box",
          boxShadow: isOpen ? `0 0 0 3px ${C.primary}15` : "none",
          transition: "all 0.2s ease",
          ...style
        }}
        {...props}
      >
        <span>{selectedOption?.label || "اختر..."}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "0.7rem", color: C.primary }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setIsOpen(false)} />
          <ul
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              left: 0,
              marginTop: 6,
              background: C.surface || "#0f172a",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "6px 0",
              margin: 0,
              listStyle: "none",
              zIndex: 100,
              maxHeight: 220,
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              backdropFilter: "blur(12px)"
            }}
          >
            {options.map(o => (
              <li
                key={o.value}
                onClick={() => {
                  onChange({ target: { value: o.value } });
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: value === o.value ? C.primary : C.text,
                  background: value === o.value ? `${C.primary}1A` : "transparent",
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
                {value === o.value && <span style={{ color: C.primary, fontSize: "0.8rem" }}>✓</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
});
Select.displayName = 'Select';

// 6. النافذة المنبثقة (Modal)
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
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 16 }} 
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`ui-modal ${className}`}
        style={{ 
          background: C.surface || "#0f172a", 
          border: `1px solid ${C.border}`, 
          borderRadius: 20, 
          padding: 24, 
          width: "100%", 
          maxWidth: 460, 
          maxHeight: "85vh", 
          overflowY: "auto", 
          boxSizing: "border-box", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          textAlign: "start",
          ...style 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, color: C.primary, fontSize: "1.05rem", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, fontSize: 28, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
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
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: C.primary, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "0.82rem", color: C.textSub, marginTop: 4, margin: 0 }}>{sub}</p>}
    </div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{action}</div>
  </div>
));
PageHeader.displayName = 'PageHeader';

// 8. خلايا الجداول (TH & TD)
const TH = forwardRef(({ children, style = {}, className = "", ...props }, ref) => (
  <th 
    ref={ref}
    className={`ui-th ${className}`}
    style={{ 
      padding: "14px 12px", 
      textAlign: "start", 
      fontSize: "0.75rem", 
      color: C.primary, 
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

export { Badge, Btn, Btn as Button, Card, Input, Select, Modal, PageHeader, TH, TD };
