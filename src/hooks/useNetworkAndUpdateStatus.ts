import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

export interface NetworkAndUpdateStatus {
  isOffline: boolean;
  updateAvailable: boolean;
  handleReload: () => void;
}

// ── Helpers لـ SSR Safe Event Subscriptions ──────────────────

function subscribeNetwork(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getNetworkSnapshot() {
  if (typeof navigator === 'undefined') return false;
  return !navigator.onLine;
}

function getServerNetworkSnapshot() {
  return false;
}

// ── Main Hook ───────────────────────────────────────────────────

export function useNetworkAndUpdateStatus(): NetworkAndUpdateStatus {
  // 1. مراقبة حالة الاتصال بالإنترنت مع مراعاة SSR
  const isOffline = useSyncExternalStore(
    subscribeNetwork,
    getNetworkSnapshot,
    getServerNetworkSnapshot
  );

  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // 2. الاستماع لتحديثات Service Worker (PWA updates)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // تحقق مما إذا كان هناك Service Worker في الانتظار بالفعل
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }

      // الاستماع للنسخ الجديدة التي يتم تثبيتها
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // 3. دالة إعادة التحميل مع تفعيل الـ Service Worker المنتظر
  const handleReload = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [waitingWorker]);

  return { isOffline, updateAvailable, handleReload };
}

export default useNetworkAndUpdateStatus;
