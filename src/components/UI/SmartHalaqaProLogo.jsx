import React from 'react';

export const SmartHalaqaProLogo = ({ size = 56 }) => {
  return (
    <div 
      style={{ width: `${size}px`, height: `${size}px` }}
      className="rounded-[15px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-700 via-teal-900 to-slate-950 border border-teal-400/35 flex items-center justify-center shadow-logo-glow shrink-0"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="smartHalaqaGoldGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="smartHalaqaEmeraldGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        <circle cx="16" cy="16" r="12" stroke="url(#smartHalaqaGoldGrad)" strokeWidth="1.8" fill="none" />
        <path d="M16 12C13.5 10.5 10 10.5 7.5 11.5V21C10 20 13.5 20 16 21.5V12Z" fill="url(#smartHalaqaEmeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
        <path d="M16 12C18.5 10.5 22 10.5 24.5 11.5V21C22 20 18.5 20 16 21.5V12Z" fill="url(#smartHalaqaEmeraldGrad)" stroke="#fef08a" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
