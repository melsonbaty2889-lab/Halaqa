import React, { useState, forwardRef } from 'react';

// مؤشر التحميل الداخلي للزر
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

export const Btn = forwardRef(({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  fullWidth = false,
  style = {}, 
  disabled = false, 
  loading = false,
  isLoading = false,
  startIcon = null,
  endIcon = null,
  type = "button", 
  className = "", 
  "aria-label": ariaLabel,
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const isBtnLoading = loading || isLoading;
  const isDisabled = disabled || isBtnLoading;

  const sizeStyles = {
    sm: { padding: "6px 12px", minHeight: "36px", fontSize: "0.75rem" },
    md: { padding: "10px 18px", minHeight: "44px", fontSize: "0.875rem" },
    lg: { padding: "12px 24px", minHeight: "52px", fontSize: "1rem" }
  };

  const styles = {
    primary: { 
      background: "linear-gradient(180deg, var(--primary-btn-start) 0%, var(--primary-btn-end) 100%)", 
      color: "var(--color-text-primary)", 
      fontWeight: "bold", 
      boxShadow: "0 4px 14px var(--color-action-primary-glow)" 
    },
    emerald: { 
      background: "var(--color-success)", 
      color: "var(--color-text-primary)", 
      fontWeight: "bold",
      boxShadow: "0 4px 14px color-mix(in srgb, var(--color-success) 25%, transparent)"
    },
    secondary: { 
      background: "color-mix(in srgb, var(--color-action-primary) 12%, transparent)", 
      color: "var(--color-action-primary)", 
      border: "1px solid color-mix(in srgb, var(--color-action-primary) 25%, transparent)" 
    },
    outline: { 
      background: "transparent", 
      color: "var(--color-text-primary)", 
      border: "1px solid var(--color-border-input)" 
    },
    ghost: { 
      background: "var(--color-surface-input)", 
      color: "var(--color-text-primary)", 
      border: "1px solid var(--color-border-input)" 
    },
    danger: { 
      background: "var(--color-danger-bg)", 
      color: "var(--color-danger)", 
      border: "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)" 
    },
    success: { 
      background: "var(--color-success-bg)", 
      color: "var(--color-success)", 
      border: "1px solid var(--color-success-border)",
      fontWeight: "bold" 
    },
    failed: { 
      background: "var(--color-danger)", 
      color: "var(--color-text-primary)", 
      fontWeight: "bold" 
    },
    google: {
      background: "var(--color-surface-secondary)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border-input)"
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const hoverStyle = isHovered && !isDisabled ? { filter: "brightness(1.12)", transform: "translateY(-1px)" } : {};

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isBtnLoading}
      aria-disabled={isDisabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`ui-button ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        borderRadius: 12,
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontWeight: 600,
        opacity: isDisabled ? 0.65 : 1,
        transition: "all 0.2s ease-in-out",
        boxSizing: "border-box",
        ...currentSize,
        ...(styles[variant] || styles.primary),
        ...hoverStyle,
        ...style
      }}
      {...props}
    >
      {isBtnLoading ? <Spinner size={18} /> : startIcon}
      {children}
      {!isBtnLoading && endIcon}
    </button>
  );
});

Btn.displayName = 'Btn';
export default Btn;
