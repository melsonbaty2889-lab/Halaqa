/* src/components/UI/Input.jsx */

import React, { useState, forwardRef, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  dir: customDir, // السماح بتمرير الاتجاه يدوياً إذا لزم الأمر
  ...props 
}, ref) => {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  
  // تحديد الاتجاه تلقائياً بناءً على اللغات الست (العربية والأوردو RTL، والباقي LTR)
  const isRtl = customDir ? customDir === 'rtl' : ['ar', 'ur'].includes(currentLang);
  const activeDir = isRtl ? 'rtl' : 'ltr';

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const generatedInputId = useId();
  const generatedDescribedById = useId();
  
  const inputId = customId || generatedInputId;
  const describedById = (errorText || helperText) ? generatedDescribedById : undefined;

  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const borderCol = errorText ? getDanger() : getBorder();

  const handleFocus = (e) => {
    setIsFocused(true);
    if (typeof onFocus === 'function') onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (typeof onBlur === 'function') onBlur(e);
  };

  const baseStyle = { 
    width: "100%", 
    background: getSurface(), 
    border: isFocused ? `1px solid ${errorText ? getDanger() : getPrimary()}` : `1px solid ${borderCol}`, 
    borderRadius: 10, 
    padding: "10px 14px",
    paddingInlineStart: isRtl ? (startIcon ? "40px" : "14px") : (endIcon || isPasswordType ? "40px" : "14px"),
    paddingInlineEnd: isRtl ? (endIcon || isPasswordType ? "40px" : "14px") : (startIcon ? "40px" : "14px"),
    minHeight: as === "textarea" ? "auto" : "44px",
    color: getTextTitle(), 
    fontFamily: "inherit", 
    fontSize: "0.875rem", 
    outline: "none", 
    boxSizing: "border-box",
    textAlign: isRtl ? "right" : "left", 
    direction: activeDir,
    boxShadow: isFocused ? `0 0 0 3px ${errorText ? 'color-mix(in srgb, var(--color-danger) 20%, transparent)' : 'var(--color-action-primary-glow)'}` : "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    colorScheme: "dark",
    ...style
  };

  return (
    <div style={{ marginBottom: 16, width: "100%", boxSizing: "border-box" }} dir={activeDir}>
      {label && (
        <label 
          htmlFor={inputId}
          style={{ fontSize: "0.8rem", color: errorText ? getDanger() : getPrimary(), marginBottom: 6, display: "block", fontWeight: 600, textAlign: isRtl ? "right" : "left" }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        {startIcon && (
          <span style={{ position: "absolute", [isRtl ? "right" : "left"]: 12, display: "flex", alignItems: "center", color: getTextSub(), pointerEvents: "none" }}>
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
            aria-describedby={describedById}
            dir={activeDir}
            autoCorrect="off"
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
            aria-describedby={describedById}
            dir={activeDir}
            autoCorrect="off"
            className={`ui-input ${className}`} 
            style={baseStyle} 
            {...props} 
          />
        )}

        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={isRtl ? "إخفاء كلمة المرور" : "Hide password"}
            style={{
              position: "absolute",
              [isRtl ? "left" : "right"]: 12,
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
            <span style={{ position: "absolute", [isRtl ? "left" : "right"]: 12, display: "flex", alignItems: "center", color: getTextSub(), pointerEvents: "none" }}>
              {endIcon}
            </span>
          )
        )}
      </div>

      {(errorText || helperText) && (
        <span 
          id={describedById}
          role={errorText ? "alert" : undefined} 
          style={{ fontSize: "0.75rem", marginTop: 4, display: "block", textAlign: isRtl ? "right" : "left", color: errorText ? getDanger() : getTextSub() }}
        >
          {errorText || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
