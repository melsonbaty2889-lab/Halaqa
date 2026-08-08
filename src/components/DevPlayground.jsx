/* src/components/DevPlayground.jsx */
import React from 'react';
import Logo from '@/components/UI/SmartHalaqaProLogo'; // الاسم الصحيح للملف

export defaultون function DevPlayground() {
  return (
    <div style={{ 
      background: '#090F17', 
      minHeight: '100vh', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl',
      color: '#FFF',
      fontFamily: "'Cairo', system-ui, sans-serif"
    }}>
      {/* عرض الشعار */}
      <Logo size={120} />
      
      <h3 style={{ marginTop: '20px', color: '#C9A84C' }}>مختبر التجارب السريع</h3>
      <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
        هذا العنصر يتم عرضه بمعزل عن التطبيق تماماً للاختبار.
      </p>

      {/* زر تجريبي تفاعلي */}
      <button 
        onClick={() => alert("تم الضغط على الزر بنجاح على الموبايل!")}
        style={{
          background: 'linear-gradient(135deg, #C9A84C, #9A7B30)',
          color: '#000',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(201, 168, 76, 0.4)'
        }}
      >
        اختبار زر تفاعلي
      </button>
    </div>
  );
}
