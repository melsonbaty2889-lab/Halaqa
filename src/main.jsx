// مكتبات خارجية
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ملفات CSS والإعدادات (باستخدام @/)
import '@/index.css';
import '@/locales/i18n';

// Components (باستخدام @/)
import App from '@/App';

// Providers / Context (باستخدام @/)
import { AcademyProvider } from '@/context/AcademyContext';
import { DataProvider } from '@/context/DataContext';

// =====================================================
// Global Error Handler (تحسين للتعامل مع أخطاء الإقلاع فقط)
// =====================================================
window.onerror = function (message, source, lineno, colno, error) {
  // نطبع الخطأ في الكونسول للتتبع
  console.error("🚨 Critical Boot Error Detected:", { message, source, lineno, colno, error });
  return false;
};

const InitialLoader = () => (
  <div style={{ background: '#090F17', color: '#FBBF24', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Cairo', system-ui, sans-serif" }}>
    <div>جاري تحميل النظام...</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AcademyProvider>
        <DataProvider>
          <Suspense fallback={<InitialLoader />}>
            <App />
          </Suspense>
        </DataProvider>
      </AcademyProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// =====================================================
// PWA Service Worker Registration
// =====================================================
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ PWA ServiceWorker Registered with scope:', registration.scope);
      },
      (err) => {
        console.warn('⚠️ ServiceWorker registration failed:', err);
      }
    );
  });
}
