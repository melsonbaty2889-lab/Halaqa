import React from 'react';
import { colors as C } from '@/constants/colors';

// استخراج التأنيمشن ليعمل بشكل نظيف دون تكرار
const SkeletonStyles = () => (
  <style>{`
    @keyframes skeletonWave {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
);

export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', className = '', style = {} }) {
  return (
    <>
      <SkeletonStyles />
      <div 
        className={className}
        style={{
          width,
          height,
          borderRadius,
          background: `linear-gradient(90deg, ${C.dark.surface || '#131B26'} 25%, ${C.dark.border || '#1E293B'} 50%, ${C.dark.surface || '#131B26'} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'skeletonWave 1.6s infinite linear',
          display: 'inline-block',
          ...style,
        }}
      />
    </>
  );
}

// هيكل متموج مخصص للبطاقات الإحصائية لسهولة الاستخدام
export function CardSkeleton() {
  return (
    <div 
      style={{ 
        background: C.dark.card || '#111827', 
        padding: '20px', 
        borderRadius: '12px', 
        border: `1px solid ${C.dark.border || '#1F2937'}`, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}
    >
      <Skeleton width="40%" height="14px" />
      <Skeleton width="70%" height="28px" borderRadius="8px" />
    </div>
  );
}

export default Skeleton;
