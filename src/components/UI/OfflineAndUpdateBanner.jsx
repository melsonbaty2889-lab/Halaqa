import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineAndUpdateBanner({ isOffline, updateAvailable, onReload }) {
  const { t } = useTranslation();

  if (!isOffline && !updateAvailable) return null;

  return (
    <div className="w-full sticky top-0 z-50 transition-all duration-300 font-['Cairo',sans-serif]" dir="auto">
      {/* تنبيه انقطاع الإنترنت */}
      {isOffline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md shadow-lg">
          <WifiOff size={16} className="shrink-0 text-amber-400 animate-pulse" />
          <span className="font-medium">{t('common.offlineNotice', 'أنت تعمل حالياً في وضع عدم الاتصال بالإنترنت (Offline)')}</span>
        </div>
      )}

      {/* تنبيه التحديث الجديد */}
      {updateAvailable && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-200 px-4 py-2 text-xs sm:text-sm flex items-center justify-between gap-3 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="shrink-0 text-emerald-400 animate-spin" />
            <span className="font-medium">{t('common.updateAvailable', 'يتوفر تحديث جديد للتطبيق')}</span>
          </div>
          <button
            type="button"
            onClick={onReload}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-md"
          >
            {t('common.reloadNow', 'تحديث الآن')}
          </button>
        </div>
      )}
    </div>
  );
}
