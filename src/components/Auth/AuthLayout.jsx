import React from 'react';

export const AuthLayout = ({ children, langBtn }) => {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden font-cairo">
      
      {/* خلفية النجوم والتوهج الزمردي العلوي */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, var(--emerald-radial-glow, rgba(16, 185, 129, 0.14)) 0%, transparent 60%),
            radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px'
        }}
      />

      {/* زر اللغة أعلي الكارت مباشرة بمحاذاة منسقة تمنع التداخل */}
      {langBtn && (
        <div className="w-full max-w-sm sm:max-w-md flex justify-end mb-2 relative z-20">
          {langBtn}
        </div>
      )}

      {/* الحاوية المركزية للنماذج */}
      <div className="w-full max-w-sm sm:max-w-md bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] backdrop-blur-md rounded-2xl p-5 sm:p-8 shadow-2xl relative z-10">
        {children}
      </div>

      {/* رقم الإصدار أسفل الصفحة */}
      <div className="mt-3 text-[10px] sm:text-[11px] text-[var(--text-muted,#475569)] tracking-wider font-mono z-10">
        SMART HALAQA • v2.5
      </div>
    </div>
  );
};

export default AuthLayout;
