import React, { useState, lazy, Suspense, useCallback } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { C } from '@/theme/colors';

import GlobalErrorBoundary from '@/components/AppLayout/GlobalErrorBoundary';
import OfflineAndUpdateBanner from '@/components/AppLayout/OfflineAndUpdateBanner';
import MainContent from '@/components/AppLayout/MainContent';

const TestHooks = lazy(() => import('@/components/TestHooks'));
const SplashScreen = lazy(() => import('@/components/UI/SplashScreen'));
const CertificateVerify = lazy(() => import('@/components/Certificates/CertificateVerify'));
const DevPlayground = lazy(() => {
  const isDev = import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
  const hasTestParam = typeof window !== 'undefined' && window.location.search.includes('view=test');

  if (isDev || hasTestParam) {
    return import('@/components/Dev/DevPlayground');
  }
  return Promise.resolve({ default: () => null });
});

// 🌟 مكون الوهج الزمردي الديناميكي الخفيف (بدون طبقة سوداء مصمتة)
const GlobalEmeraldBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
    <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-[#10B981]/20 rounded-full blur-[140px]" />
    <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-[#10B981]/15 rounded-full blur-[130px]" />
    <div className="absolute -bottom-[10%] right-[15%] w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-[160px]" />
  </div>
);

if (typeof window !== 'undefined') {
  const handleChunkError = (error) => {
    const errorMsg = error?.message || error?.toString() || '';
    if (/Failed to fetch dynamically imported module|chunk load error|loading chunk|Unexpected token/i.test(errorMsg)) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const lastReload = sessionStorage.getItem('chunk_reload_timestamp');
      const now = Date.now();

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

const FallbackLoader = () => (
  <div 
    role="status"
    aria-label="جاري التحميل"
    className="bg-transparent min-h-screen flex items-center justify-center"
    style={{ 
      color: C?.primary?.DEFAULT || 'var(--primary, #E07A00)' 
    }}
  >
    <Loader2 className="animate-spin" size={32} />
  </div>
);

export default function App() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  // فحص حالة الشاشة الافتتاحية مع السماح بإظهارها عبر ?view=splash
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return view === 'splash' || !sessionStorage.getItem('app_splash_seen');
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
      <div className="relative min-h-screen bg-transparent text-white font-cairo overflow-hidden">
        {/* 🌟 إدراج خلفية الوهج الزمردي الثابتة لتعمل خلف كل المكونات */}
        <GlobalEmeraldBackground />

        {/* 🌟 تم إضافة pb-24 للجوال لرفع المحتوى فوق شريط التنقل السفلي */}
        <div className="relative z-10 min-h-screen flex flex-col bg-transparent pb-24 md:pb-0">
          <OfflineAndUpdateBanner />
          
          <Suspense fallback={<FallbackLoader />}>
            {view === 'test' ? (
              <DevPlayground />
            ) : showSplash ? (
              <SplashScreen 
                lang="ar" 
                onFinish={handleSplashFinish} 
              />
            ) : (
              <Routes>
                <Route path="/test" element={<TestHooks />} />
                <Route path="/verify/:certId" element={<CertificateVerify />} />
                <Route path="/*" element={<MainContent />} />
              </Routes>
            )}
          </Suspense>
        </div>
      </div>
    </GlobalErrorBoundary>
  );
}
