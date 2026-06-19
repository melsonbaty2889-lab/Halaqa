import React, { useState, useEffect } from 'react';

// 🚨 رادار فوري لحقن الأخطاء مباشرة على شاشة الموبايل وإلغاء السواد
if (typeof window !== 'undefined') {
  window.onerror = function(msg, url, line) {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#EF4444;color:white;z-index:999999;padding:20px;font-family:monospace;direction:ltr;text-align:left;overflow:auto;';
    errDiv.innerHTML = `<h2>🚨 رادار الأعطال المباشر:</h2><p><b>الخطأ:</b> ${msg}</p><p><b>الملف:</b> ${url}</p><p><b>السطر:</b> ${line}</p>`;
    document.body.appendChild(errDiv);
    return false;
  };
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // إزالة شاشة التحميل القديمة فوراً من الـ DOM
    const staticLoader = document.querySelector('.app-loading-screen');
    if (staticLoader) staticLoader.remove();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div style={{ background: '#1E3A8A', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
        جاري تشغيل محرك ريأكت...
      </div>
    );
  }

  return (
    <div style={{ background: '#065F46', color: 'white', minHeight: '100vh', padding: '30px', direction: 'rtl', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <h1 style={{ color: '#FBBF24', marginBottom: '15px' }}>🎉 تم كسر الكاش وتوصيل كود App بنجاح!</h1>
      <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
        إذا كنت ترى هذه الشاشة الخضراء، فملف App.jsx يعمل الآن بكفاءة وبدون أي سواد. 
      </p>
      <p style={{ marginTop: '20px', color: '#A7F3D0', fontWeight: 'bold' }}>
        بمجرد وصولك إلى هنا، ضع لي كود ملف <b>main.jsx</b> في المحادثة لنعيد ربط المكونات (Login و MainApp) دفعة واحدة وبشكل نهائي.
      </p>
    </div>
  );
}
