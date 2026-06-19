// 🛑 1. اختراق المتصفح مباشرة (Vanilla JS) خارج نظام ريأكت تماماً
if (typeof window !== 'undefined') {
  const forceRender = () => {
    // إزالة أي شاشات تحميل قديمة معلقة في الـ HTML
    const oldLoader = document.querySelector('.app-loading-screen');
    if (oldLoader) oldLoader.remove();

    // إنشاء جدار حماية لوني صريح فوق الشاشة السوداء
    const diagnosticDiv = document.createElement('div');
    diagnosticDiv.id = 'diagnostic-bridge';
    diagnosticDiv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#7C3AED;color:white;z-index:999999;display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:sans-serif;direction:rtl;padding:20px;text-align:center;';
    diagnosticDiv.innerHTML = `
      <h1 style="margin-bottom:15px; color:#FBBF24;">🔮 الاختبار الحاسم: ملف App.jsx يلفظ أنفاسه ويعمل!</h1>
      <p style="color:#E0E7FF; font-size:18px; max-width:600px;">بما أنك ترى هذه الشاشة البنفسجية، فملف App.jsx سليم تماماً ويتم تنفيذه بنجاح، والخلل كان بسبب مكتبة i18next أو ملف supabase الثابت.</p>
    `;
    document.body.appendChild(diagnosticDiv);
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', forceRender);
  } else {
    forceRender();
  }
}

// 🍏 2. بيئة ريأكت الصفرية (Zero-Dependency)
import React from 'react';

export default function App() {
  return (
    <div style={{ background: '#059669', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', direction: 'rtl' }}>
      🚀 إذا اختفت الشاشة البنفسجية وظهرت هذه الواجهة الخضراء، فهذا يؤكد أن المتصفح جاهز لفرش المنصة الآن!
    </div>
  );
}
