import { useState, useEffect, useSyncExternalStore } from 'react';

/**
 * Hook to detect whether the current viewport width is below a specific breakpoint.
 * Uses useSyncExternalStore when available for optimal React 18+ SSR & Concurrent Rendering support.
 * 
 * @param breakpoint - Threshold in pixels (default: 1024)
 * @returns boolean - True if current width is strictly less than the breakpoint
 */

export function useIsMobile(breakpoint: number = 1024): boolean {
  // 1. استخدام useSyncExternalStore لتفادي Hydration Mismatch في React 18+
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};

    const query = `(max-width: ${breakpoint - 1}px)`;
    const mediaQuery = window.matchMedia(query);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', callback);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(callback);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', callback);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(callback);
      }
    };
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  };

  const getServerSnapshot = () => false;

  // React 18 Safe Hook
  if (typeof useSyncExternalStore === 'function') {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  // Fallback للنسخ الأقدم من React 18
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = `(max-width: ${breakpoint - 1}px)`;
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
