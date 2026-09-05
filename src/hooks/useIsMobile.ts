import { useState, useEffect } from 'react';

/**
 * Hook to detect whether the current viewport width is below a specific breakpoint.
 * 
 * @param breakpoint - Threshold in pixels (default: 1024)
 * @returns boolean - True if current width is strictly less than the breakpoint
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
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

    // تعيين الحالة الأولية للتحقق
    setIsMobile(mediaQuery.matches);

    // إضافة المستمع بناءً على توافقية المتصفح
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ('addListener' in mediaQuery) {
      // للتوافق مع المتصفحات القديمة
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
