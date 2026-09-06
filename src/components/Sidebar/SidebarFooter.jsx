// src/components/Sidebar/SidebarFooter.jsx
import React, { useState, useCallback } from 'react';
import { Cloud, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/theme/colors';

export default function SidebarFooter({ isRtl = true, t, onLogoutSuccess }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSynced] = useState(true);

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
      className="w-full flex flex-col gap-2.5 pt-1" 
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label={safeT('sidebar.footer', 'حقوق المنظومة محفوظة')}
    >
      <div 
        className="flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg border transition-all duration-300"
        style={{
          backgroundColor: C.card?.bg,
          borderColor: C.border?.subtle
        }}
        title={safeT('sidebar.cloudSyncTooltip', 'جميع البيانات متزامنة ومحفوظة سحابياً')}
      >
        <div className="relative flex items-center justify-center">
          {isSynced ? (
            <>
              <Cloud size={14} style={{ color: C.emerald?.light }} className="shrink-0" />
              <span className="absolute -top-0.5 -pe-0.5 flex h-2 w-2">
                <span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: C.emerald?.light }}
                ></span>
                <span 
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: C.emerald?.DEFAULT }}
                ></span>
              </span>
            </>
          ) : (
            <CheckCircle2 size={14} style={{ color: C.text?.muted }} className="shrink-0" />
          )}
        </div>

        <span 
          className="text-[11px] font-medium tracking-wide leading-relaxed py-0.5 select-none"
          style={{ color: C.text?.muted }}
        >
          {safeT('sidebar.cloudSynced', 'متزامن مع السحابة')}
        </span>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={safeT('common.logout', 'تسجيل الخروج')}
        className={`group w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 border`}
        style={{
          backgroundColor: isLoggingOut ? C.error?.light : C.error?.subtle,
          color: C.error?.DEFAULT,
          borderColor: C.error?.border
        }}
      >
        {isLoggingOut ? (
          <Loader2 size={15} className="animate-spin shrink-0" style={{ color: C.error?.DEFAULT }} />
        ) : (
          <LogOut 
            size={15} 
            className={`shrink-0 transition-transform duration-200 ${
              isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
            }`} 
          />
        )}

        <span className="leading-relaxed py-0.5 inline-block select-none truncate">
          {isLoggingOut 
            ? safeT('common.loggingOut', 'جاري تسجيل الخروج...') 
            : safeT('common.logout', 'تسجيل الخروج')}
        </span>
      </button>
    </footer>
  );
}
