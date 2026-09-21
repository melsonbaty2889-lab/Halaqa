// 0. كاشف الأخطاء المباشر للشاشة
window.onerror = function (message, source, lineno, colno, error) {
  const errorBox = document.createElement('div');
  errorBox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#ff5555;padding:20px;z-index:99999;overflow:auto;font-family:monospace;font-size:12px;direction:ltr;text-align:left;';
  errorBox.innerHTML = '<h3>⚠️ Runtime Error Found:</h3><p><b>Message:</b> ' + message + '</p><p><b>File:</b> ' + source + '</p><p><b>Line:</b> ' + lineno + ':' + colno + '</p><pre>' + (error && error.stack ? error.stack : '') + '</pre>';
  document.body.appendChild(errorBox);
};

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// 1. إدارة استعلامات البيانات
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

// 2. إعدادات الأنماط واللغات
import '@/index.css';
import '@/locales/i18n';

// 3. المكون الرئيسي ومُعالج الأخطاء العام
import App from '@/App';
import GlobalErrorBoundary from '@/components/AppLayout/GlobalErrorBoundary';

// 4. مزودات السياق (Context Providers) والألوان
import { DataProvider } from '@/context/DataContext';
import { AcademyProvider } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

// لالتقاط أخطاء الإقلاع الحرجة على مستوى النافذة
window.addEventListener('error', (event) => {
  console.error('🚨 Critical Boot Error:', event.error || event.message);
});

// شاشة التحميل الأولية المربوطة بنظام الألوان الموحد
const InitialLoader = () => (
  <div 
    className="fixed inset-0 z-50 flex flex-col items-center justify-center font-cairo select-none"
    style={{ backgroundColor: C.dark.bg, color: C.appText.main }}
  >
    <div 
      className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mb-3"
      style={{ borderColor: C.primary.DEFAULT, borderTopColor: 'transparent' }}
    ></div>
    <p 
      className="text-xs font-semibold tracking-wide"
      style={{ color: C.appText.sub }}
    >
      جاري تحميل المنصة...
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
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
    </GlobalErrorBoundary>
  </React.StrictMode>
);

// تسجيل وتحديث الـ Service Worker لتطبيقات الـ PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 نسق جديد متوفر، يرجى إعادة تحميل الصفحة.');
              }
            };
          }
        };
      })
      .catch((err) => console.warn('⚠️ ServiceWorker Failed:', err));
  });
}
