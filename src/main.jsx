import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. استيراد React Query والـ Client
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

// 2. تهيئة ملفات الـ CSS واللغات من المسار الموحد
import '@/index.css';
import '@/locales/i18n';

// 3. المكونات الرئيسية
import App from '@/App';

// 4. المزودات (مع تصحيح الترتيب الهيكلي)
import { DataProvider } from '@/context/DataContext';
import { AcademyProvider } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

// Global Critical Error Listener
window.addEventListener('error', (event) => {
  console.error('🚨 Critical Boot Error:', event.error || event.message);
});

// شاشة التحميل الأولية المتناسقة مع هوية المنصة v2.5
const InitialLoader = () => (
  <div 
    className="fixed inset-0 z-50 flex flex-col items-center justify-center font-cairo select-none"
    style={{ backgroundColor: C.dark?.surface || '#050811', color: C.text?.title || '#FFFFFF' }}
  >
    <div 
      className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mb-3"
      style={{ borderColor: C.amber?.DEFAULT || '#F59E0B', borderTopColor: 'transparent' }}
    ></div>
    <p 
      className="text-xs font-semibold tracking-wide"
      style={{ color: C.text?.muted || '#94A3B8' }}
    >
      جاري تحميل المنصة...
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AcademyProvider>
          <DataProvider>
            <Suspense fallback={<InitialLoader />}>
              <App />
            </Suspense>
          </DataProvider>
        </AcademyProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// PWA Service Worker مع تحسين التحديث التلقائي
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // التحقق من وجود تحديثات جديدة للتطبيق
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 نسق جديد متوفر، يرجى إغلاق الصفحة وإعادة فتحها.');
              }
            };
          }
        };
      })
      .catch((err) => console.warn('⚠️ ServiceWorker Failed:', err));
  });
}
