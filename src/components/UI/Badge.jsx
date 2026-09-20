import React, { forwardRef } from 'react';

const getPrimary = () => 'var(--color-action-primary)';

export const Badge = forwardRef(({ children, color, className = "", style = {}, ...props }, ref) => {
  const badgeColor = color || getPrimary();

  return (
    <span 
      ref={ref}
      className={`ui-badge ${className}`}
      style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 6, 
        padding: "4px 12px", 
        minHeight: "28px",
        borderRadius: 20, 
        fontSize: "0.75rem", 
        fontWeight: 700, 
        background: `color-mix(in srgb, ${badgeColor} 12%, transparent)`, 
        color: badgeColor, 
        border: `1px solid color-mix(in srgb, ${badgeColor} 25%, transparent)`, 
        whiteSpace: "nowrap",
        fontFamily: "inherit",
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
