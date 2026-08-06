import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '6px', className = '' }) {
  return (
    <div 
      className={className}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        background: 'linear-gradient(90deg, #131B26 25%, #1E293B 50%, #131B26 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonWave 1.6s infinite linear',
        display: 'inline-block',
      }}
    >
      <style>{`
        @keyframes skeletonWave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// هيكل متموج مخصص للبطاقات الإحصائية لسهولة الاستخدام
export function CardSkeleton() {
  return (
    <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1F2937', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton width="40%" height="14px" />
      <Skeleton width="70%" height="28px" borderRadius="8px" />
    </div>
  );
}
