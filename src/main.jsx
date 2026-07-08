import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { AcademyProvider } from './context/AcademyContext' 

// رادار الأعطال
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
      <Suspense fallback={<InitialLoader />}>
        <App />
      </Suspense>
    </AcademyProvider>
  </React.StrictMode>,
)
