// src/components/Auth/AuthLayout.jsx
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { colors as C } from '@/theme/colors';

export const AuthLayout = ({ children, langBtn }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : true;

  // دالة الترجمة الآمنة المعتمدة بالدليل
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.bg,
        color: C.text?.main
      }}
    >
      {/* خلفية النجوم والتوهج الزمردي العلوي */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, ${C.emerald?.radialGlow || 'rgba(16, 185, 129, 0.14)'} 0%, transparent 60%),
            radial-gradient(${C.dark?.starDot || 'rgba(255, 255, 255, 0.15)'} 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px'
        }}
      />

      {/* زر اللغة أعلى الكارت بمحاذاة منسقة تمنع التداخل */}
      {langBtn && (
        <div className="w-full max-w-sm sm:max-w-md flex justify-end mb-2 relative z-20">
          {langBtn}
        </div>
      )}

      {/* الحاوية المركزية للنماذج */}
      <main 
        role="main"
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10"
        style={{
          backgroundColor: C.dark?.card,
          borderColor: C.dark?.cardBorder,
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: C.shadows?.xl
        }}
      >
        {children}
      </main>

      {/* رقم الإصدار أسفل الصفحة */}
      <footer 
        role="contentinfo"
        className="mt-3 text-[10px] sm:text-[11px] tracking-wider font-mono z-10"
        style={{ color: C.text?.muted }}
      >
        {safeT('common.appName', 'SMART HALAQA')} • v2.5
      </footer>
    </div>
  );
};

export default AuthLayout;
