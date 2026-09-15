import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineAndUpdateBanner({ isOffline, updateAvailable, onReload }) {
  const { t, i18n } = useTranslation();
  
  const currentLang = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  if (!isOffline && !updateAvailable) return null;

  return (
    <>
      {/* 1. شريط انقطاع الإنترنت (الأعلى) */}
      {isOffline && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          className="w-full fixed top-0 left-0 right-0 z-[99999] bg-red-600/90 border-b border-red-500/40 text-white px-4 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-lg font-['Cairo',sans-serif]"
        >
          <WifiOff size={16} className="shrink-0 text-white animate-pulse" />
          <span className="font-bold">
            {t('common.offlineNotice', 'أنت تعمل حالياً بدون اتصال بالإنترنت (وضع الأوفلاين)')}
          </span>
        </div>
      )}

      {/* 2. تنبيه التحديث الجديد (عائم ومستجيب للاتجاه واللغة) */}
      {updateAvailable && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md font-['Cairo',sans-serif]"
        >
          <div className="bg-emerald-950/95 border border-emerald-500/40 text-emerald-100 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <RefreshCw size={18} className="shrink-0 text-emerald-400 animate-spin" />
              <span className="text-xs sm:text-sm font-medium truncate">
                {t('common.updateAvailable', 'يتوفر تحديث جديد للتطبيق')}
              </span>
            </div>
            
            <button
              type="button"
              onClick={onReload}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-md"
            >
              {t('common.reloadNow', 'تحديث الآن')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
