import React from 'react';
import { Loader2 } from 'lucide-react';
import { C } from '@/theme/colors';

export default function LoadingButton({ 
  children, 
  onClick, 
  isLoading = false, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  style = {},
  'aria-label': ariaLabel,
  ...restProps
}) {
  const isDisabled = isLoading || disabled;

  // الأحجام الموحدة مع مراعاة معايير الهواتف المحمولة
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', minHeight: '38px', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', minHeight: '44px', fontSize: '0.95rem' },
    lg: { padding: '0.875rem 2rem', minHeight: '52px', fontSize: '1.05rem' }
  };

  // الأنماط البصرية المستخرجة حصرياً من كائن الألوان C
  const variants = {
    primary: { 
      background: C.amber?.DEFAULT || C.primary?.DEFAULT, 
      color: C.dark?.bg 
    },
    emerald: { 
      background: C.emerald?.DEFAULT, 
      color: C.dark?.bg 
    },
    danger: { 
      background: C.error?.DEFAULT, 
      color: C.text?.title 
    },
    outline: { 
      background: 'transparent', 
      border: `1px solid ${C.inputs?.border}`, 
      color: C.text?.body 
    }
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variants[variant] || variants.primary;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.625rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    width: fullWidth ? '100%' : 'auto',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.65 : 1,
    ...selectedSize,
    ...selectedVariant,
    ...style
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={isDisabled} 
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      className={`transition-all duration-200 ease-in-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 active:scale-[0.98] ${className}`}
      style={baseStyle}
      {...restProps}
    >
      {isLoading && (
        <Loader2 
          className="w-5 h-5 animate-spin shrink-0" 
          aria-hidden="true" 
        />
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}
