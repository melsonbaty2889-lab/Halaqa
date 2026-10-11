/* src/main.jsx */

// معالجة آمنة لأخطاء الإقلاع وأخطاء التحميل الديناميكي للوحدات القديمة
window.onerror = function (message, source, lineno, colno, error) {
  const isChunkError = 
    (message && typeof message === 'string' && (message.includes('Dynamically imported module') || message.includes('Failed to fetch') || message.includes('Importing a module script failed'))) ||
    (error && error.message && (error.message.includes('Dynamically imported module') || error.message.includes('Failed to fetch')));

  if (isChunkError) {
    const reloadKey = 'pwa_reload_attempt_' + source;
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
      return;
    }
  }

  // في بيئة الإنتاج، لا تعرض تفاصيل الأخطاء الحساسة للمستخدم نهائياً
  if (import.meta.env.PROD) return;

  const errorBox = document.createElement('div');
  errorBox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#ff5555;padding:20px;z-index:99999;overflow:auto;font-family:monospace;font-size:12px;direction:ltr;text-align:left;';
  
  const title = document.createElement('h3');
  title.textContent = '⚠️ Runtime Error Found:';
  errorBox.appendChild(title);

  const msgP = document.createElement('p');
  msgP.textContent = 'Message: ' + message;
  errorBox.appendChild(msgP);

  document.body.appendChild(errorBox);
};

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

import '@/index.css';
import '@/locales/i18n';

import App from '@/App';
import GlobalErrorBoundary from '@/components/AppLayout/GlobalErrorBoundary';

import { DataProvider } from '@/context/DataContext';
import { AcademyProvider } from '@/context/AcademyContext';
import { C } from '@/theme/colors';

window.addEventListener('error', (event) => {
  const errorMsg = event.error?.message || event.message || '';
  if (errorMsg.includes('Dynamically imported module') || errorMsg.includes('Failed to fetch')) {
    const reloadKey = 'pwa_reload_attempt_global';
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
      return;
    }
  }
  console.error('🚨 Critical Boot Error:', event.error || event.message);
});

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
