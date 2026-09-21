// src/components/UI/Badge.jsx
import React, { forwardRef } from 'react';

const variantClasses = {
  default: 'bg-semantic-surfaceInput text-semantic-textSecondary border-semantic-borderCard',
  primary: 'bg-semantic-actionPrimary/10 text-semantic-actionPrimary border-semantic-actionPrimary/20',
  success: 'bg-semantic-success/10 text-semantic-success border-semantic-success/20',
  danger: 'bg-semantic-error/10 text-semantic-error border-semantic-error/20',
  warning: 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20',
  info: 'bg-semantic-actionPrimary/10 text-semantic-actionPrimary border-semantic-actionPrimary/20',
};

export const Badge = forwardRef(({ 
  children, 
  variant = 'default', 
  color, 
  className = '', 
  style = {}, 
  ...props 
}, ref) => {
  // إذا تم تمرير color مباشر يتم استخدامه، وإلا يتم الاعتماد على الكلاسات الدلالية الموحدة
  const hasCustomColor = Boolean(color && typeof color === 'string');
  const selectedClass = variantClasses[variant] || variantClasses.default;

  const dynamicStyle = hasCustomColor ? {
    background: `color-mix(in srgb, ${color} 12%, transparent)`,
    color: color,
    border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    ...style
  } : style;

  return (
    <span 
      ref={ref}
      className={`ui-badge inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[26px] rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
        !hasCustomColor ? selectedClass : ''
      } ${className}`}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
