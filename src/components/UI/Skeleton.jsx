import React from 'react';

// استخراج أنيميشن الهيكل العظمي لضمان الاتساق
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
          background: `linear-gradient(90deg, var(--color-surface) 25%, var(--color-border-input) 50%, var(--color-surface) 75%)`,
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
  return (
    <div
      role="status"
      aria-hidden="true"
      className={`p-5 rounded-xl border border-semantic-borderInput bg-semantic-card flex flex-col gap-3 w-full select-none ${className}`}
      style={style}
      {...props}
    >
      <Skeleton width="40%" height="14px" />
      <Skeleton width="70%" height="28px" borderRadius="8px" />
    </div>
  );
}

// هيكل كامل للصفحات يُستخدم مع Suspense Fallback
export function PageSkeleton({ className = '', style = {}, ...props }) {
  return (
    <div className={`w-full space-y-6 select-none pointer-events-none ${className}`} style={style} {...props}>
      {/* Header Skeleton */}
      <div className="flex justify-between items-center p-4 rounded-xl border border-semantic-borderInput bg-semantic-card">
        <div className="space-y-2 w-1/3">
          <Skeleton width="60%" height="20px" borderRadius="6px" />
          <Skeleton width="40%" height="12px" borderRadius="4px" />
        </div>
        <Skeleton width="100px" height="36px" borderRadius="8px" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Main Content Skeleton */}
      <div className="border border-semantic-borderInput bg-semantic-card rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-semantic-borderInput">
          <Skeleton width="150px" height="20px" />
          <Skeleton width="80px" height="30px" borderRadius="6px" />
        </div>
        <div className="space-y-3">
          <Skeleton width="100%" height="45px" borderRadius="8px" />
          <Skeleton width="100%" height="45px" borderRadius="8px" />
          <Skeleton width="100%" height="45px" borderRadius="8px" />
          <Skeleton width="100%" height="45px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
