import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import colors, { colors as themeColors } from '@/theme/colors';

const C = colors || themeColors || {};

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
        backgroundColor: C?.dark?.bg || '#030712',
        color: C?.text?.main || C?.text?.primary || '#FFFFFF',
      }}
    >
      {/* الخلفية والتوهج */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, ${C?.emerald?.radialGlow || 'rgba(16, 185, 129, 0.14)'} 0%, transparent 60%),
            radial-gradient(${C?.dark?.starDot || 'rgba(255, 255, 255, 0.15)'} 1.2px, transparent 0)
          `,
          backgroundSize: '100% 100%, 24px 24px',
        }}
      />

      {/* زر اللغة */}
      {langBtn && (
        <div className="w-full max-w-sm sm:max-w-md flex justify-end mb-2 relative z-20">
          {langBtn}
        </div>
      )}

      {/* حاوية المحتوى */}
      <main
        role="main"
        aria-label={safeT('auth.containerLabel', 'حاوية تسجيل الدخول')}
        className="w-full max-w-sm sm:max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-8 relative z-10"
        style={{
          backgroundColor: C?.dark?.card || '#0F172A',
          borderColor: C?.dark?.cardBorder || C?.dark?.border || '#1B2738',
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: C?.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {children}
      </main>

      {/* الفوتر السفلي */}
      <footer
        role="contentinfo"
        className="mt-4 text-[10px] sm:text-[11px] tracking-wider font-mono z-10 opacity-60 pointer-events-none"
        style={{ color: C?.text?.muted || C?.text?.secondary || '#94A3B8' }}
      >
        {safeT('common.appName', defaultAppName)} • v2.5
      </footer>
    </div>
  );
}
