import React, { forwardRef } from 'react';

export const Badge = forwardRef(({ children, color = 'var(--color-action-primary)', className = '', style = {}, ...props }, ref) => {
  return (
    <span 
      ref={ref}
      className={`ui-badge inline-flex items-center gap-1.5 px-3 py-1 min-h-[28px] rounded-full text-xs font-bold whitespace-nowrap ${className}`}
      style={{ 
        background: `color-mix(in srgb, ${color} 12%, transparent)`, 
        color: color, 
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, 
        fontFamily: 'inherit',
        ...style 
      }}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
