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
  if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.search.includes('view=test'))) {
    return import('@/components/Dev/DevPlayground');
  }
  return Promise.resolve({ default: () => null });
});

if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk|Unexpected token/i.test(errorMsg)) {
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (let name of names) caches.delete(name);
        });
      }
      window.location.reload();
    }
  };
  window.addEventListener('unhandledrejection', (event) => handleChunkError(event.reason));
  window.addEventListener('error', (event) => handleChunkError(event.error), true);
}

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
      <Suspense fallback={
        <div style={{ background: C.dark?.bg || '#050811', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.amber?.DEFAULT || '#D97706' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      }>
        {view === 'test' ? (
          <DevPlayground />
        ) : view === 'splash' || showSplash ? (
          <SplashScreen lang="ar" onFinish={view === 'splash' ? () => alert('انتهى عرض الشاشة الافتتاحية') : handleSplashFinish} />
        ) : (
          <>
            <OfflineAndUpdateBanner />
            <Routes>
              <Route path="/test" element={<TestHooks />} />
              <Route path="/verify/:certId" element={<CertificateVerify />} />
              <Route path="/*" element={<MainContent />} />
            </Routes>
          </>
        )}
      </Suspense>
    </GlobalErrorBoundary>
  );
}
