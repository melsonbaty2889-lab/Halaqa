import React, { useState, forwardRef, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const getPrimary = () => 'var(--color-action-primary)';
const getSurface = () => 'var(--color-surface-input)';
const getBorder = () => 'var(--color-border-input)';
const getTextTitle = () => 'var(--color-text-primary)';
const getTextSub = () => 'var(--color-text-secondary)';
const getDanger = () => 'var(--color-danger)';

export const Input = forwardRef(({ 
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
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const autoId = useId();
  const inputId = customId || autoId;

  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const borderCol = errorText ? getDanger() : getBorder();

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const baseStyle = { 
    width: "100%", 
    background: getSurface(), 
    border: isFocused ? `1px solid ${errorText ? getDanger() : getPrimary()}` : `1px solid ${borderCol}`, 
    borderRadius: 10, 
    padding: "10px 14px",
    paddingInlineStart: startIcon ? "40px" : "14px",
    paddingInlineEnd: (endIcon || isPasswordType) ? "40px" : "14px",
    minHeight: as === "textarea" ? "auto" : "44px",
    color: getTextTitle(), 
    fontFamily: "inherit", 
    fontSize: "0.875rem", 
    outline: "none", 
    boxSizing: "border-box",
    textAlign: "start",
    boxShadow: isFocused ? `0 0 0 3px ${errorText ? 'color-mix(in srgb, var(--color-danger) 20%, transparent)' : 'var(--color-action-primary-glow)'}` : "none",
    transition: "all 0.2s ease",
    colorScheme: "dark",
    ...style
  };

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }}>
      {label && (
        <label 
          htmlFor={inputId}
          style={{ fontSize: "0.8rem", color: errorText ? getDanger() : getPrimary(), marginBottom: 6, display: "block", fontWeight: 600, textAlign: "start" }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        {startIcon && (
          <span style={{ position: "absolute", insetInlineStart: 12, display: "flex", alignItems: "center", color: getTextSub(), pointerEvents: "none" }}>
            {startIcon}
          </span>
        )}

        {as === "textarea" ? (
          <textarea 
            ref={ref} 
            id={inputId}
            value={value} 
            onChange={onChange} 
            onFocus={handleFocus} 
            onBlur={handleBlur} 
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
            type={actualType} 
            value={value} 
            onChange={onChange} 
            onFocus={handleFocus} 
            onBlur={handleBlur} 
            placeholder={placeholder} 
            aria-invalid={!!errorText}
            className={`ui-input ${className}`} 
            style={baseStyle} 
            {...props} 
          />
        )}

        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            style={{
              position: "absolute",
              insetInlineEnd: 12,
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: getTextSub(),
              cursor: "pointer"
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          endIcon && (
            <span style={{ position: "absolute", insetInlineEnd: 12, display: "flex", alignItems: "center", color: getTextSub() }}>
              {endIcon}
            </span>
          )
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
export default Input;
