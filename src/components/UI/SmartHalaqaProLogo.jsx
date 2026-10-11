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
  const gold3dGlowId = `shGold3dGlow_${idPrefix}`;
  const emeraldGradId = `shEmeraldGrad_${idPrefix}`;
  const pageHighlightId = `shPageHighlight_${idPrefix}`;
  const coreLightId = `shCoreLight_${idPrefix}`;

  return (
    <div
      role="img"
      aria-label="Smart Halaqa Pro Ultra Logo"
      className={`rounded-2xl bg-gradient-to-b from-[#0F231C] via-[#091511] to-[#040907] border border-[#10B981]/30 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] shrink-0 relative overflow-hidden group ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
      {...props}
    >
      {/* خلفية التوهج الداخلي المصقول */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(52,211,153,0.15),transparent_70%)]" />

      <svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* تدرج ذهبي ملكي متعدد الدرجات (Multi-stop Gold 3D) */}
          <linearGradient id={goldGradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF5C0" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="75%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* تدرج زمردي كريستالي مشع */}
          <linearGradient id={emeraldGradId} x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="40%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#044E33" />
          </linearGradient>

          {/* خط التوهج الأبيض العلوي لصفحات المصحف */}
          <linearGradient id={pageHighlightId} x1="20" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>

          {/* إضاءة قلب المصحف والمركز */}
          <radialGradient id={coreLightId} cx="20" cy="20" r="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* هالة الضوء المركزية */}
        <circle cx="20" cy="20" r="14" fill={`url(#${coreLightId})`} />

        {/* 1. الحلقة الذهبية الخارجية المجسدة (Outer 3D Golden Crown / Ring) */}
        <circle
          cx="20"
          cy="20"
          r="17"
          stroke={`url(#${goldGradId})`}
          strokeWidth="2.5"
          strokeDasharray="100 8"
          strokeLinecap="round"
          className="transform origin-center rotate-45"
        />

        <circle
          cx="20"
          cy="20"
          r="14.2"
          stroke="#F59E0B"
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />

        {/* 2. حامل المصحف الخشبي/الذهبي المبتكر (الكرسي / الرحل 3D Rehal Base) */}
        <path
          d="M12 28.5L20 24.5L28 28.5M14 29.5L20 26.5L26 29.5"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. المصحف المجسم ثلاثي الأبعاد (3D Royal Quran Pages) */}
        <g transform="translate(0, -1)">
          {/* ظلال الصفحات الخلفية لإعطاء عمق ثنائي */}
          <path
            d="M20 13.5C16 11.2 10.5 11.5 6.5 13V24.5C10.5 23 16 22.8 20 25C24 22.8 29.5 23 33.5 24.5V13C29.5 11.5 24 11.2 20 13.5Z"
            fill="#022C22"
            opacity="0.6"
          />

          {/* الصفحة اليسرى الرئيسية */}
          <path
            d="M20 12C15.5 9.8 9.5 10.2 5.5 11.8V23.2C9.5 21.6 15.5 21.2 20 23.4V12Z"
            fill={`url(#${emeraldGradId})`}
            stroke={`url(#${goldGradId})`}
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* الصفحة اليمنى الرئيسية */}
          <path
            d="M20 12C24.5 9.8 30.5 10.2 34.5 11.8V23.2C30.5 21.6 24.5 21.2 20 23.4V12Z"
            fill={`url(#${emeraldGradId})`}
            stroke={`url(#${goldGradId})`}
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* تفاصيل طيات الصفحات الداخلية (3D Page Curves) */}
          <path
            d="M7.5 13.8C11 12.5 16.2 12.2 20 14.2M32.5 13.8C29 12.5 23.8 12.2 20 14.2"
            stroke={`url(#${pageHighlightId})`}
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* الفاصل العمودي المضيء (Spine of Quran) */}
          <path
            d="M20 11.5V23.8"
            stroke="#FFF5C0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* 4. الجوهرة / النجمة الإشعاعية التاجية (Top Radiant Star Accent) */}
        <polygon
          points="20,3 21.2,5.5 23.8,5.5 21.7,7.2 22.5,9.8 20,8.2 17.5,9.8 18.3,7.2 16.2,5.5 18.8,5.5"
          fill={`url(#${goldGradId})`}
        />
      </svg>
    </div>
  );
};

export default SmartHalaqaProLogo;
