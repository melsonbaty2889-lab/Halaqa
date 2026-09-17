import React, { useState, lazy, Suspense, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { C } from '@/theme/colors';

import GlobalErrorBoundary from '@/components/AppLayout/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/AppLayout/OfflineAndUpdateBanner';
import MainContent from '@/components/AppLayout/MainContent';

const TestHooks = lazy(() => import('@/components/TestHooks'));
const SplashScreen = lazy(() => import('@/components/UI/SplashScreen'));
const CertificateVerify = lazy(() => import('@/components/Certificates/CertificateVerify'));
const DevPlayground = lazy(() => {
  // التوافق المعياري مع Vite و Node
  const isDev = import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  const hasTestParam = typeof window !== 'undefined' && window.location.search.includes('view=test');

  if (isDev || hasTestParam) {
    return import('@/components/Dev/DevPlayground');
  }
  return Promise.resolve({ default: () => null });
});

// معالجة أخطاء الـ Dynamic Chunks مع الحماية من التكرار المفرط
if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk|Unexpected token/i.test(errorMsg)) {
      
      // تفادي إعادة التحميل إذا كان الجهاز غير متصل بالإنترنت
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const lastReload = sessionStorage.getItem('chunk_reload_timestamp');
      const now = Date.now();

      // السماح بإنعاش الصفحة مرة واحدة كل 12 ثانية كحد أقصى
      if (!lastReload || now - Number(lastReload) > 12000) {
        sessionStorage.setItem('chunk_reload_timestamp', now.toString());
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (let name of names) caches.delete(name);
          });
        }
        window.location.reload();
      }
    }
  };

  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

// شاشة التحميل المركزية المتوافقة مع متطلبات CSS Variables
const FallbackLoader = () => (
  <div 
    role="status"
    aria-label="جاري التحميل"
    style={{ 
      background: C?.dark?.bg || 'var(--bg-dark, #070B11)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: C?.primary?.DEFAULT || 'var(--primary, #E07A00)' 
    }}
  >
    <Loader2 className="animate-spin" size={32} />
  </div>
);

export default function App() {
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const view = urlParams.get('view');

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('app_splash_seen');
    } catch {
      return false;
    }
  });

  const handleSplashFinish = useCallback(() => {
    try {
      sessionStorage.setItem('app_splash_seen', 'true');
    } catch {
      // Ignored
    }
    setShowSplash(false);
  }, []);

  return (
    <GlobalErrorBoundary>
      {/* بقاء شريط التنبيهات والأوفلاين في أعلى الشجرة دائماً */}
      <OfflineAndUpdateBanner />
      
      <Suspense fallback={<FallbackLoader />}>
        {view === 'test' ? (
          <DevPlayground />
        ) : view === 'splash' || showSplash ? (
          <SplashScreen 
            lang="ar" 
            onFinish={view === 'splash' ? () => alert('انتهى عرض الشاشة الافتتاحية') : handleSplashFinish} 
          />
        ) : (
          <Routes>
            <Route path="/test" element={<TestHooks />} />
            <Route path="/verify/:certId" element={<CertificateVerify />} />
            <Route path="/*" element={<MainContent />} />
          </Routes>
        )}
      </Suspense>
    </GlobalErrorBoundary>
  );
}
