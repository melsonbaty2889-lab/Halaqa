// 🚨 رادار الأعطال الشامل في القمة تماماً لضمان لقط أي خطأ أثناء حقن الموديلات (Module Evaluation)
window.onerror = function (message, source, lineno, colno, error) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 30px; background: #090F17; color: #EF4444; min-height: 100vh; font-family: sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #FBBF24; font-size: 1.5rem; margin-bottom: 10px;">🚨 رادار النظام: عطل أثناء الإقلاع</h2>
        <p style="color: #94A3B8; margin-bottom: 20px;">حدث خطأ غير متوقع منع التطبيق من العمل. إليك تفاصيل العطل المباشرة:</p>
        <pre style="background: #111827; padding: 20px; color: #F3F4F6; direction: ltr; text-align: left; overflow: auto; border-radius: 12px; border: 1px solid #374151; font-size: 0.9rem;">${message}\nفي الملف: ${source}\nالسطر: ${lineno} | العمود: ${colno}</pre>
      </div>
    `;
  }
  return false;
};

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
