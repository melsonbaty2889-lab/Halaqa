import React from 'react';
import { Loader2 } from 'lucide-react';
import C from '@/theme/colors';

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

  // الأحجام الموحدة مع الالتزام التام بمعيار 44px كحد أدنى للهواتف المحمولة
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', minHeight: '44px', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', minHeight: '44px', fontSize: '0.95rem' },
    lg: { padding: '0.875rem 2rem', minHeight: '52px', fontSize: '1.05rem' }
  };

  // الأنماط البصرية المستخرجة حصرياً من كائن الألوان C مع حماية متكاملة
  const variants = {
    primary: { 
      backgroundColor: C.amber?.DEFAULT || C.primary?.DEFAULT || '#F59E0B', 
      color: C.dark?.bg || '#0F172A',
      border: 'none'
    },
    emerald: { 
      backgroundColor: C.emerald?.DEFAULT || C.success?.DEFAULT || '#10B981', 
      color: C.dark?.bg || '#0F172A',
      border: 'none'
    },
    danger: { 
      backgroundColor: C.error?.DEFAULT || '#EF4444', 
      color: C.text?.title || '#FFFFFF',
      border: 'none'
    },
    outline: { 
      backgroundColor: 'transparent', 
      borderColor: C.dark?.borderInput || C.inputs?.border || '#374151',
      borderWidth: '1px',
      borderStyle: 'solid',
      color: C.text?.title || C.text?.body || '#F9FAFB'
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

  // إعداد aria-label تلقائياً في حال عدم إرساله صراحةً
  const computedAriaLabel = ariaLabel || (typeof children === 'string' ? children : undefined);

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={isDisabled} 
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      aria-label={computedAriaLabel}
      className={`transition-all duration-200 ease-in-out select-none focus:outline-none focus-visible:ring-2 active:scale-[0.98] ${className}`}
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
