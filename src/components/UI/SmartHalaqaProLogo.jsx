/* src/components/SmartHalaqaProLogo.jsx */
import React from 'react';

export default function SmartHalaqaProLogo({ size = 36, style = {} }) {
  // حساب الأبعاد والنسب تلقائياً بناءً على الحجم الممرر
  const svgSize = Math.round(size * 0.61);
  const borderRadius = Math.round(size * 0.28);

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}px`,
      background: 'radial-gradient(circle at 30% 20%, #0f766e 0%, #042f2e 100%)',
      border: '1px solid rgba(45, 212, 191, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.35)',
      flexShrink: 0,
      ...style
    }}>
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        
        {/* الحلقة الذهبية المحيطة */}
        <circle cx="16" cy="16" r="12" stroke="url(#goldGrad)" strokeWidth="1.8" strokeDasharray="40 12" />
        
        {/* المصحف باللون الأخضر الزمردي مع إطار ذهبي دقيق */}
        <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
        <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#emeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
