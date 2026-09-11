import { useState, useEffect } from 'react';

export interface NetworkAndUpdateStatus {
  isOffline: boolean;
  updateAvailable: boolean;
  handleReload: () => void;
}

export function useNetworkAndUpdateStatus(): NetworkAndUpdateStatus {
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return { isOffline, updateAvailable, handleReload };
}

export default useNetworkAndUpdateStatus;
