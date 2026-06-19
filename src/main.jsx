import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 🚨 صمام الأمان الحرج الأخير: إذا انهار التطبيق لأي سبب خارج الـ React، سيتم طباعة السبب فوراً ومنع السواد
window.onerror = function (message, source, lineno, colno, error) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 30px; background: #090F17; color: #EF4444; min-height: 100vh; font-family: sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #FBBF24;">🚨 رادار النظام: عطل حرج في الإقلاع</h2>
        <p style="color: #9CA3AF;">لم يتمكن المتصفح من تشغيل الأكواد الأساسية للمنصة:</p>
        <pre style="background: #111827; padding: 20px; color: #F3F4F6; direction: ltr; text-align: left; overflow: auto; border: 1px solid #374151; font-family: monospace; font-size: 13px;">${message}\nat ${source}:${lineno}:${colno}</pre>
        <button onClick="window.location.reload(true)" style="background: #FBBF24; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; mt: 15px;">تحديث إجباري 🔄</button>
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
