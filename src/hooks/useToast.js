import { useState, useCallback } from 'react';

export function useToast() {
  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message, type = 'info') => {
    setToastState({
      isOpen: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toastState,
    showToast,
    hideToast,
  };
}
