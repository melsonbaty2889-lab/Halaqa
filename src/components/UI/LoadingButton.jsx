import React from 'react';
import { Loader2 } from 'lucide-react';

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
  'aria-label': ariaLabel,
  ...restProps
}) {
  const isDisabled = isLoading || disabled;

  // الأحجام الموحدة مع الالتزام بمعيار 44px كحد أدنى للهواتف المحمولة
  const sizeClasses = {
    sm: 'px-4 py-2 min-h-[44px] text-xs',
    md: 'px-6 py-3 min-h-[44px] text-sm',
    lg: 'px-8 py-3.5 min-h-[52px] text-base'
  };

  // الأنماط البصرية المعتمدة على كلاسات Tailwind والرموز التعبيرية للألوان
  const variantClasses = {
    primary: 'bg-semantic-actionPrimary hover:opacity-90 text-white border-none shadow-md',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-none shadow-md',
    outline: 'bg-transparent border border-semantic-borderInput text-semantic-textPrimary hover:bg-semantic-borderCard'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedVariant = variantClasses[variant] || variantClasses.primary;

  const computedAriaLabel = ariaLabel || (typeof children === 'string' ? children : undefined);

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={isDisabled} 
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      aria-label={computedAriaLabel}
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold transition-all duration-200 ease-in-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary active:scale-[0.98] ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${
        isDisabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'
      } ${selectedSize} ${selectedVariant} ${className}`}
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
