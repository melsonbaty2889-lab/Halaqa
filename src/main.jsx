import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'; // 👈 هذا هو السطر المفقود الذي يربط محرك الترجمة بالمنصة ويمنع اختفاء الواجهة

window.onerror = function (message, source, lineno, colno, error) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 30px; background: #090F17; color: #EF4444; min-height: 100vh; font-family: sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #FBBF24;">🚨 رادار النظام: عطل في الإقلاع</h2>
        <pre style="background: #111827; padding: 20px; color: #F3F4F6; direction: ltr; text-align: left; overflow: auto;">${message}</pre>
      </div>
    `;
  }
  return false;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
