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

import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n' // 🔥 تم تقديم ملف الترجمة هنا لتهيئة نظام اللغات بالكامل أولاً
import App from './App.jsx' // تم تأخير استدعاء التطبيق ليقلع والبيئة العالمية جاهزة ومستقرة تماماً

// شاشة تحميل مبدئية فائقة السرعة لحماية التطبيق أثناء تحضير ملفات اللغات والـ i18n
const InitialLoader = () => (
  <div style={{ background: '#090F17', color: '#FBBF24', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid rgba(251,191,36,0.1)', borderTop: '2px solid #FBBF24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }}></div>
      <span style={{ fontSize: '13px' }}>جاري تحضير بيئة العمل...</span>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<InitialLoader />}>
      <App />
    </Suspense>
  </React.StrictMode>,
)
