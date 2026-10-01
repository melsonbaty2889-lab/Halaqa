// src/components/Sidebar/SidebarFooter.jsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

export default function SidebarFooter({ isRtl, t, onLogoutSuccess }) {
  const { i18n } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // حساب اتجاه اللغة الحالي بدقة مع دعم الـ Prop المُمرر
  const currentLangCode = i18n?.language?.split('-')[0] || 'ar';
  const activeIsRtl = isRtl ?? ['ar', 'ur'].includes(currentLangCode);

  // دالة مساعدة لضمان إرجاع fallback مناسب عبر i18next
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      const translated = t(key, { defaultValue: fallback });
      if (translated && translated !== key) return translated;
    }
    return fallback || key;
  }, [t]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      if (supabase?.auth?.signOut) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      if (typeof onLogoutSuccess === 'function') {
        onLogoutSuccess();
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onLogoutSuccess]);

  return (
    <footer 
      className="w-full flex items-center gap-2 relative z-50 overflow-visible" 
      dir={activeIsRtl ? 'rtl' : 'ltr'}
      aria-label={safeT('sidebar.footer', 'إعدادات الجلسة واللغات')}
    >
      {/* محول اللغات */}
      <div className="shrink-0 relative z-50 overflow-visible">
        <LanguageSwitcher dropDirection="up" placement="footer" />
      </div>

      {/* زر تسجيل الخروج المطابق لنظام التصميم الموحد */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={safeT('common.logout', 'تسجيل الخروج')}
        className="group h-10 flex-1 flex items-center justify-center gap-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-semantic-danger/50 border border-semantic-dangerBg bg-semantic-dangerBg text-semantic-danger hover:border-semantic-danger/40 [-webkit-tap-highlight-color:transparent] shadow-sm"
      >
        {isLoggingOut ? (
          <Loader2 size={15} className="animate-spin shrink-0 text-semantic-danger" />
        ) : (
          <LogOut 
            size={15} 
            className={`shrink-0 text-semantic-danger transition-transform duration-200 ${
              activeIsRtl 
                ? 'scale-x-[-1] group-hover:-translate-x-0.5' 
                : 'group-hover:translate-x-0.5'
            }`} 
          />
        )}

        <span className="select-none truncate">
          {isLoggingOut 
            ? safeT('common.loggingOut', 'جاري تسجيل الخروج...') 
            : safeT('common.logout', 'تسجيل الخروج')}
        </span>
      </button>
    </footer>
  );
}
