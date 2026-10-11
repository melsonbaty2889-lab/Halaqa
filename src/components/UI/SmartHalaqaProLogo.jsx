/* src/components/UI/SmartHalaqaProLogo.jsx */
import React, { useId } from 'react';
import C from '@/theme/colors';

export const SmartHalaqaProLogo = ({
  size = 56,
  className = '',
  style = {},
  ...props
}) => {
  const rawId = useId();
  const idPrefix = rawId.replace(/:/g, '');
  const goldGradId = `shEnterpriseGold_${idPrefix}`;
  const emeraldGradId = `shEnterpriseEmerald_${idPrefix}`;
  const strokeGradId = `shEnterpriseStroke_${idPrefix}`;

  const primaryGold = C.amber?.DEFAULT || '#f59e0b';
  const goldLight = C.amber?.light || '#fef08a';
  const goldDark = C.amber?.dark || '#b45309';

  const emeraldLight = '#6ee7b7';
  const emeraldMain = C.emerald?.DEFAULT || '#10b981';
  const emeraldDark = '#047857';

  return (
    <div
      role="img"
      aria-label="Smart Halaqa Pro Logo"
      className={`rounded-2xl bg-gradient-to-br from-semantic-surfacePrimary via-semantic-bgCard to-semantic-bgPage border border-semantic-borderCard flex items-center justify-center shadow-xl shrink-0 relative overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
      {...props}
    >
      <svg
        width={size * 0.72}
        height={size * 0.72}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* تدرج الذهبي المعدني المقنع */}
          <linearGradient id={goldGradId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={goldLight} />
            <stop offset="45%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={goldDark} />
          </linearGradient>

          {/* تدرج الزمرد المضيء المنعكس */}
          <linearGradient id={emeraldGradId} x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={emeraldLight} />
            <stop offset="35%" stopColor={emeraldMain} />
            <stop offset="100%" stopColor={emeraldDark} />
          </linearGradient>

          {/* تدرج الحواف الذهبية النظيفة */}
          <linearGradient id={strokeGradId} x1="16" y1="9" x2="16" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={goldLight} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 1. الحلقة الذهبية المصقولة بنسب هندسية دقيقة */}
        <circle
          cx="16"
          cy="16"
          r="13.2"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.1"
          fill="none"
        />

        {/* 2. المصحف الشريف المصمم بالكهرباء والإنحناء المنظم */}
        <g transform="translate(0, -0.2)">
          {/* الصفحة اليسرى */}
          <path
            d="M16 10.8C12.8 9 8.8 9 5.8 10.3V21.8C8.8 20.5 12.8 20.5 16 22.3V10.8Z"
            fill={`url(#${emeraldGradId})`}
            stroke={`url(#${strokeGradId})`}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {/* الصفحة اليمنى */}
          <path
            d="M16 10.8C19.2 9 23.2 9 26.2 10.3V21.8C23.2 20.5 19.2 20.5 16 22.3V10.8Z"
            fill={`url(#${emeraldGradId})`}
            stroke={`url(#${strokeGradId})`}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {/* طية وانحناءة الصفحة اليسرى متصلة وموزونة */}
          <path
            d="M7.2 12C9.8 11.1 13 11.2 15 12.3"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* طية وانحناءة الصفحة اليمنى متصلة وموزونة */}
          <path
            d="M24.8 12C22.2 11.1 19 11.2 17 12.3"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* الفاصل الذهبي لمنتصف المصحف */}
          <path
            d="M16 10.8V22.3"
            stroke={`url(#${strokeGradId})`}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
