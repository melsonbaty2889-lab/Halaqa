// src/components/Sidebar/SidebarFooter.jsx
import React, { useState, useCallback } from 'react';
import { Cloud, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { colors as C } from '@/theme/colors';

export default function SidebarFooter({ isRtl = true, t, onLogoutSuccess }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      const translated = t(key);
      if (translated && translated !== key) return translated;
    }
    return fallback;
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
      aria-label={safeT('sidebar.footer', isRtl ? 'ذيل القائمة الجانبية' : 'Sidebar Footer')}
    >
      <div 
        className="flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-white/5 transition-all duration-300"
        title={safeT('sidebar.cloudSyncTooltip', isRtl ? 'اتصال سحابي آمن ومباشر' : 'Secure real-time cloud sync')}
      >
        <div className="relative flex items-center justify-center">
          {isSynced ? (
            <>
              <Cloud size={14} style={{ color: C.emerald?.light || '#34D399' }} className="shrink-0" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </>
          ) : (
            <CheckCircle2 size={14} className="text-slate-400 shrink-0" />
          )}
        </div>

        <span 
          className="text-[11px] font-medium tracking-wide leading-relaxed py-0.5 select-none"
          style={{ color: C.text?.muted || '#94A3B8' }}
        >
          {safeT('sidebar.cloudSynced', isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized')}
        </span>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={safeT('common.logout', isRtl ? 'تسجيل الخروج' : 'Logout')}
        className={`group w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
          isLoggingOut 
            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
            : 'hover:bg-red-500/15 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10'
        }`}
        style={{
          backgroundColor: isLoggingOut ? undefined : 'rgba(239, 68, 68, 0.08)',
          color: C.error?.DEFAULT || '#EF4444',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {isLoggingOut ? (
          <Loader2 size={15} className="animate-spin shrink-0 text-red-400" />
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
            ? safeT('common.loggingOut', isRtl ? 'جاري الخروج...' : 'Logging out...') 
            : safeT('common.logout', isRtl ? 'تسجيل الخروج' : 'Logout')}
        </span>
      </button>
    </footer>
  );
}
