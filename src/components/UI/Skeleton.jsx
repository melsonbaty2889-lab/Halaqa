import React from 'react';
import C from '@/theme/colors';

// استخراج الأنماط لضمان الاتساق
const KEYFRAMES_STYLE = `
  @keyframes skeletonWave {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  className = '',
  style = {},
  ...props
}) {
  const surfaceColor = C.dark?.surface || '#131B26';
  const borderInputColor = C.dark?.borderInput || C.dark?.border || '#1E293B';

  return (
    <>
      <style>{KEYFRAMES_STYLE}</style>
      <div
        role="status"
        aria-hidden="true"
        className={`select-none pointer-events-none ${className}`}
        style={{
          width,
          height,
          borderRadius,
          background: `linear-gradient(90deg, ${surfaceColor} 25%, ${borderInputColor} 50%, ${surfaceColor} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'skeletonWave 1.6s infinite linear',
          display: 'inline-block',
          ...style,
        }}
        {...props}
      />
    </>
  );
}

// هيكل متموج مخصص للبطاقات الإحصائية
export function CardSkeleton({ className = '', style = {}, ...props }) {
  const cardBg = C.dark?.card || '#111827';
  const borderCol = C.dark?.borderInput || C.dark?.border || '#1F2937';

  return (
    <div
      role="status"
      aria-hidden="true"
      className={`p-5 rounded-xl border flex flex-col gap-3 w-full select-none ${className}`}
      style={{
        backgroundColor: cardBg,
        borderColor: borderCol,
        ...style,
      }}
      {...props}
    >
      <Skeleton width="40%" height="14px" />
      <Skeleton width="70%" height="28px" borderRadius="8px" />
    </div>
  );
}

export default Skeleton;
