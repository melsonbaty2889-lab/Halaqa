import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

const getText = (tFunc, key, fallback) => {
  if (typeof tFunc === 'function') {
    const res = tFunc(key, fallback);
    if (res && res !== key) return res;
  }
  return fallback;
};

export default function OfflineAndUpdateBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [needRefresh, setNeedRefresh] = useState(false);
  const { t, language } = useAcademy();
  const currentLang = language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            };
          }
        };
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      {!isOnline && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            background: C.error?.DEFAULT || '#EF4444',
            color: C.text?.title || '#FFFFFF',
            textAlign: 'center',
            padding: '8px 16px',
            position: 'fixed',
            insetBlockStart: 0,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            zIndex: 99999,
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontFamily: "'Cairo', system-ui, sans-serif"
          }}
        >
          <WifiOff size={18} />
          <span>{getText(t, 'system.offline_notice', 'أنت تعمل حالياً بدون اتصال بالإنترنت (وضع الأوفلاين)')}</span>
        </div>
      )}

      {needRefresh && (
        <div 
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            background: C.emerald?.DEFAULT || '#10B981',
            color: C.dark?.bg || '#050811',
            padding: '10px 16px',
            position: 'fixed',
            insetBlockEnd: '16px',
            insetInlineEnd: '16px',
            zIndex: 99999,
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            fontFamily: "'Cairo', system-ui, sans-serif"
          }}
        >
          <span>{getText(t, 'pwa.updateAvailable', 'يتوفر تحديث جديد للمنظومة!')}</span>
          <button
            onClick={handleReload}
            aria-label={getText(t, 'pwa.updateNow', 'تحديث الآن')}
            title={getText(t, 'pwa.updateNow', 'تحديث الآن')}
            style={{
              background: C.dark?.bg || '#050811',
              color: C.emerald?.DEFAULT || '#10B981',
              border: 'none',
              padding: '6px 14px',
              minHeight: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem'
            }}
          >
            <RefreshCw size={14} />
            {getText(t, 'pwa.updateNow', 'تحديث الآن')}
          </button>
        </div>
      )}
    </>
  );
}
export default OfflineAndUpdateBanner;
