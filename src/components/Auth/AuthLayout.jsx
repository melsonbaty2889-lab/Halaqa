import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { C } from '@/theme/colors';

export default function AuthLayout({ children, langBtn }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const defaultAppName = isRtl ? 'الحلقة الذكية' : 'Smart Halaqa';

  const safeT = useCallback(
    (key, fallback) => {
      if (typeof t === 'function') {
        return t(key, { defaultValue: fallback || key });
      }
      return fallback || key;
    },
    [t]
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-x-hidden font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.bg,
        color: C.text?.title,
      }}
    >
      {/* الخلفية والتوهج الزمردي العلوي */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: C.gradients?.starsBg,
          backgroundSize: '100% 100%, 24px 24px',
        }}
      />

      {/* زر اللغة */}
      {langBtn && (
        <div className="w-full max-w-sm sm:max-w-md flex justify-end mb-2 relative z-20">
          {langBtn}
        </div>
      )}

      {/* حاوية المحتوى الرئيسية */}
      <main
        role="main"
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10 border shadow-2xl space-y-6"
        style={{
          backgroundColor: C.dark?.card,
          borderColor: C.dark?.cardBorder,
        }}
      >
        {/* ترويسة الشعار الموحدة */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg"
            style={{ 
              background: C.gradients?.logoBox, 
              borderColor: C.emerald?.light,
              boxShadow: `0 0 20px ${C.emerald?.logoGlow}` 
            }}
          >
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            {safeT('common.appName', defaultAppName)}
          </h1>
        </div>

        {children}
      </main>

      {/* الفوتر السفلي */}
      <footer
        role="contentinfo"
        className="mt-4 text-[10px] sm:text-[11px] tracking-wider font-mono z-10 opacity-60 pointer-events-none"
        style={{ color: C.text?.muted }}
      >
        {safeT('common.appName', defaultAppName)} • v2.5
      </footer>
      </div>
  );
}
