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
  const ambientGlowId = `smartHalaqaAmbientGlow_${idPrefix}`;
  const glassGradId = `smartHalaqaGlassGrad_${idPrefix}`;

  // نظام ألوان عالمي دقيق ومحسّن
  const primaryGold = C.amber?.DEFAULT || '#F59E0B';
  const goldLight = C.amber?.light || '#FDE68A';
  const goldDark = C.amber?.dark || '#D97706';

  const emeraldLight = '#34D399';
  const emeraldMain = C.emerald?.DEFAULT || '#10B981';
  const emeraldDark = '#047857';

  return (
    <div
      role="img"
      aria-label="Smart Halaqa Pro Logo"
      className={`rounded-2xl bg-gradient-to-br from-semantic-surfacePrimary via-semantic-bgCard to-semantic-bgPage border border-semantic-borderCard/60 flex items-center justify-center shadow-2xl shrink-0 relative overflow-hidden backdrop-blur-md ${className}`}
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
        className="drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
      >
        <defs>
          {/* توهج محيطي ناعم بريميوم */}
          <radialGradient
            id={ambientGlowId}
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={emeraldLight} stopOpacity="0.35" />
            <stop offset="100%" stopColor={emeraldDark} stopOpacity="0" />
          </radialGradient>

          {/* تدرج زجاجي خلفي يعكس الحداثة */}
          <linearGradient
            id={glassGradId}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* تدرج ذهبي معدني فاخر بالحسابات الهندسية */}
          <linearGradient
            id={goldGradId}
            x1="2"
            y1="2"
            x2="30"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={goldLight} />
            <stop offset="40%" stopColor={primaryGold} />
            <stop offset="100%" stopColor={goldDark} />
          </linearGradient>

          {/* تدرج زمردي عميق للصفحات */}
          <linearGradient
            id={emeraldGradId}
            x1="16"
            y1="8"
            x2="16"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={emeraldLight} />
            <stop offset="60%" stopColor={emeraldMain} />
            <stop offset="100%" stopColor={emeraldDark} />
          </linearGradient>
        </defs>

        {/* خلفية الإضاءة الهادئة */}
        <circle cx="16" cy="16" r="14" fill={`url(#${ambientGlowId})`} />
        <circle cx="16" cy="16" r="14" fill={`url(#${glassGradId})`} />

        {/* الحلقة الذهبية العصرية بفتحة ونسب هندسية قياسية */}
        <circle
          cx="16"
          cy="16"
          r="13.2"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* المصحف الأخضر الأنيق بخطوط نظيفة وعصرية */}
        <g transform="translate(0, -0.2)">
          {/* الصفحة اليسرى */}
          <path
            d="M16 10.8C13.2 9.2 9.3 9.2 6.2 10.3V21.2C9.3 20.1 13.2 20.1 16 21.7V10.8Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
          {/* الصفحة اليمنى */}
          <path
            d="M16 10.8C18.8 9.2 22.7 9.2 25.8 10.3V21.2C22.7 20.1 18.8 20.1 16 21.7V10.8Z"
            fill={`url(#${emeraldGradId})`}
            stroke={goldLight}
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
          {/* الفاصل الذهبي الأنيق في المنتصف */}
          <path
            d="M16 10.8V21.7"
            stroke={goldLight}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
