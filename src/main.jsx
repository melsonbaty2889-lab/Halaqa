// مكتبات خارجية
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

// ملفات CSS
import './index.css';

// ملفات الإعداد
import './i18n';

// Components
import App from './App.jsx';

// Providers
import { AcademyProvider } from './context/AcademyContext';
import { DataProvider } from './context/DataContext';

// =====================================================
// Global Error Handler
// يعرض شاشة طوارئ عند فشل إقلاع التطبيق
// =====================================================
window.onerror = function (message, source, lineno, colno, error) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `<div style="padding: 30px; background: #090F17; color: #EF4444; min-height: 100vh; direction: rtl; text-align: right;"><h2>🚨 عطل في الإقلاع</h2><pre>${message}</pre></div>`;
  }
  return false;
};

const InitialLoader = () => (
  <div style={{ background: '#090F17', color: '#FBBF24', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <div>جاري تحميل النظام...</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AcademyProvider>
      <DataProvider> {/* 👈 تغليف التطبيق بالـ DataProvider ليكون تحت الـ AcademyProvider مباشرة */}
        <Suspense fallback={<InitialLoader />}>
          <App />
        </Suspense>
      </DataProvider>
    </AcademyProvider>
  </React.StrictMode>,
)
