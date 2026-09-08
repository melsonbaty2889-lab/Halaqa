import { useState, useEffect } from 'react';

interface NetworkAndUpdateStatus {
  isOffline: boolean;
  updateAvailable: boolean;
  handleReload: () => void;
}

export default function useNetworkAndUpdateStatus(): NetworkAndUpdateStatus {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
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
