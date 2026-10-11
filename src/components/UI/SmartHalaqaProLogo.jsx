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
  const goldGradId = `shGoldGrad_${idPrefix}`;
  const emeraldGradId = `shEmeraldGrad_${idPrefix}`;
  const innerEmeraldId = `shInnerEmerald_${idPrefix}`;

  const primaryGold = C.amber?.DEFAULT || '#f59e0b';
  const goldLight = C.amber?.light || '#fef08a';
  const goldDark = C.amber?.dark || '#b45309';

  const emeraldLight = '#34d399';
  const emeraldMain = C.emerald?.DEFAULT || '#10b981';
  const emeraldDark = '#047857';

  return (
    <div
      role="img"
      aria-label="Smart Halaqa Pro Logo"
      className={`rounded-2xl bg-gradient-to-br from-semantic-surfacePrimary via-semantic-bgCard to-semantic-bgPage border border-semantic-borderCard flex items-center justify-center shadow-lg shrink-0 relative overflow-hidden ${className}`}
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
          <linearGradient id={goldGradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={goldLight} />
            <stop offset="50%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={goldDark} />
          </linearGradient>

          <linearGradient id={emeraldGradId} x1="16" y1="9" x2="16" y2="23" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={emeraldLight} />
            <stop offset="60%" stopColor={emeraldMain} />
            <stop offset="100%" stopColor={emeraldDark} />
          </linearGradient>

          {/* تدرج للطبقة الداخلية الإضافية لإبراز العمق الـ 3D */}
          <linearGradient id={innerEmeraldId} x1="16" y1="11" x2="16" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
        </defs>

        {/* الحلقة الذهبية المتناسقة */}
        <circle
          cx="16"
          cy="16"
          r="13.5"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.2"
          fill="none"
        />

        {/* المصحف المجسم ثلاثي الأبعاد */}
        <g transform="translate(0, -0.5)">
          {/* 1. الطبقة السفلى (الظل والعمق الخلفي للكتلة) */}
          <path
            d="M16 11.8C12.5 10 8.5 10 5.5 11.3V22.8C8.5 21.5 12.5 21.5 16 23.3C19.5 21.5 23.5 21.5 26.5 22.8V11.3C23.5 10 19.5 10 16 11.8Z"
            fill={`url(#${innerEmeraldId})`}
            opacity="0.8"
          />

          {/* 2. الصفحة اليسرى الرئيسية (بارزة للأمام) */}
          <path
            d="M16 10.2C12.8 8.4 8.8 8.4 5.8 9.7V21.2C8.8 19.9 12.8 19.9 16 21.7V10.2Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* 3. الصفحة اليمنى الرئيسية (بارزة للأمام) */}
          <path
            d="M16 10.2C19.2 8.4 23.2 8.4 26.2 9.7V21.2C23.2 19.9 19.2 19.9 16 21.7V10.2Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* 4. خطوط انحناء الصفحات الداخلية لتعزيز التجسيد */}
          <path
            d="M8 11.2C11 10.2 14.5 10.2 16 11.5M24 11.2C21 10.2 17.5 10.2 16 11.5"
            stroke={goldLight}
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* الفاصل الذهبي لمنتصف المصحف */}
          <path
            d="M16 10.2V21.7"
            stroke={goldLight}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
