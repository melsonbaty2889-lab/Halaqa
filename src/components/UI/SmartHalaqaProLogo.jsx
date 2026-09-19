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
  const goldGradId = `smartHalaqaGoldGrad_${idPrefix}`;
  const emeraldGradId = `smartHalaqaEmeraldGrad_${idPrefix}`;
  const glowGradId = `smartHalaqaGlowGrad_${idPrefix}`;

  // استخراج الألوان من نظام الألوان C مع تحسين درجات النصوع للزمردي والذهبي
  const primaryGold = C.amber?.DEFAULT || '#f59e0b';
  const goldLight = C.amber?.light || '#fef08a';
  const goldDark = C.amber?.dark || '#b45309';

  // درجات زمردية مشرقة وواضحة جداً لزيادة التباين
  const emeraldLight = '#34d399'; // Emerald-400 ناصع
  const emeraldMain = C.emerald?.DEFAULT || '#10b981'; // Emerald-500
  const emeraldDark = '#059669'; // Emerald-600

  return (
    <div
      role="img"
      aria-label="Smart Halaqa Pro Logo"
      className={`rounded-[15px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-semantic-surfacePrimary via-semantic-bgCard to-semantic-bgPage border border-semantic-borderCard flex items-center justify-center shadow-logo-glow shrink-0 relative overflow-hidden ${className}`}
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
        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]"
      >
        <defs>
          {/* تدرج التوهج الخلفي المشرق */}
          <radialGradient
            id={glowGradId}
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={emeraldLight} stopOpacity="0.4" />
            <stop offset="100%" stopColor={emeraldDark} stopOpacity="0" />
          </radialGradient>

          {/* تدرج ذهبي محسّن غني بالبريق */}
          <linearGradient
            id={goldGradId}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={goldLight} />
            <stop offset="45%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={goldDark} />
          </linearGradient>

          {/* تدرج زمردي مشرق وبارز للأوراق */}
          <linearGradient
            id={emeraldGradId}
            x1="16"
            y1="8"
            x2="16"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={emeraldLight} />
            <stop offset="50%" stopColor={emeraldMain} />
            <stop offset="100%" stopColor={emeraldDark} />
          </linearGradient>
        </defs>

        {/* هالة توهج زمردية خلف المصحف */}
        <circle cx="16" cy="16" r="13" fill={`url(#${glowGradId})`} />

        {/* الحلقة الذهبية المحسّنة (تم تكبير قطرها وسُككها) */}
        <circle
          cx="16"
          cy="16"
          r="13.5"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.2"
          fill="none"
        />

        {/* المصحف الأخضر المطور (تم تكبير الحجم وتحسين انحناءات الصفحات والحدود) */}
        <g transform="translate(0, -0.5)">
          {/* الصفحة اليسرى */}
          <path
            d="M16 10.5C13 8.8 9 8.8 6 10V21.5C9 20.3 13 20.3 16 22V10.5Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* الصفحة اليمنى */}
          <path
            d="M16 10.5C19 8.8 23 8.8 26 10V21.5C23 20.3 19 20.3 16 22V10.5Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* خط الفاصل الذهبي لمنتصف المصحف */}
          <path
            d="M16 10.5V22"
            stroke={goldLight}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
