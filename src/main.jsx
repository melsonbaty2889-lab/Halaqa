import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. تهيئة ملفات الـ CSS واللغات من المسار الموحد
import '@/index.css';
import '@/locales/i18n';

// 2. المكونات الرئيسية
import App from '@/App';

// 3. المزودات (مع تصحيح الترتيب الهيكلي)
import { DataProvider } from '@/context/DataContext';
import { AcademyProvider } from '@/context/AcademyContext';

// Global Critical Error Listener
window.addEventListener('error', (event) => {
  console.error('🚨 Critical Boot Error:', event.error || event.message);
});

// شاشة التحميل الأولية المتناسقة مع هوية المنصة
const InitialLoader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-dark,#070B11)] text-[var(--text-main,#FFFFFF)] font-cairo">
    <div className="w-10 h-10 border-3 border-[var(--primary,#E07A00)] border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-xs text-[var(--text-sub,#94A3B8)] font-semibold tracking-wide">جاري تحميل المنصة...</p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* تقديم DataProvider لأعلى الهرم لضمان توفر بيانات المستخدم أولاً */}
      <DataProvider>
        <AcademyProvider>
          <Suspense fallback={<InitialLoader />}>
            <App />
          </Suspense>
        </AcademyProvider>
      </DataProvider>
    </BrowserRouter>
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
