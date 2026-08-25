import React from 'react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';

export const AuthLayout = ({ children, langBtn }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto select-none bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] p-4 font-cairo"
    >
      {/* خلفية النجوم والتوهج الزمردي العلوي المطابقة للشاشة الافتتاحية 100% */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, var(--emerald-radial-glow, rgba(16, 185, 129, 0.14)) 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px'
        }}
      />

      {/* زر اللغة إن وجد في الصفحة */}
      {langBtn && (
        <div className="absolute top-4 start-4 z-20">
          {langBtn}
        </div>
      )}

      {/* الحاوية المركزية للنماذج (مطابقة لأبعاد وتصميم بطاقة الشاشة الافتتاحية) */}
      <div className="w-full max-w-sm sm:max-w-md bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 my-auto">
        {children}
      </div>

      {/* رقم الإصدار أسفل الصفحة */}
      <div className="mt-4 text-[11px] text-[var(--text-muted,#475569)] tracking-wider font-mono z-10">
        SMART HALAQA • v2.5
      </div>
    </div>
  );
};

export default AuthLayout;
