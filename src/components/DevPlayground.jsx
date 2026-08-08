/* src/components/DevPlayground.jsx */
import React, { useState } from 'react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';

export default function DevPlayground() {
  // 🎛️ متغيرات تفاعلية لتغيير الشكل مباشرة من الشاشة دون الحاجة لتعديل الكود
  const [logoSize, setLogoSize] = useState(100);
  const [buttonText, setButtonText] = useState('اضغط للاختبار');
  const [bgColor, setBgColor] = useState('#090F17');

  return (
    <div style={{ 
      background: bgColor, 
      minHeight: '100vh', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl',
      color: '#FFF',
      fontFamily: "'Cairo', system-ui, sans-serif",
      transition: 'background 0.3s'
    }}>
      <h3 style={{ color: '#C9A84C', marginBottom: '15px' }}>🧪 المختبر التفاعلي المباشر</h3>
      
      {/* 📦 العنصر التجريبي الذي يتأثر بالتحكم بالأسفل */}
      <div style={{ 
        background: '#111C2A', 
        padding: '24px', 
        borderRadius: '16px', 
        marginBottom: '20px', 
        textAlign: 'center', 
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '350px'
      }}>
        <SmartHalaqaProLogo size={logoSize} />
        <br />
        <button 
          onClick={() => alert("تم التفاعل مع الزر بنجاح!")}
          style={{
            marginTop: '15px',
            background: 'linear-gradient(135deg, #C9A84C, #9A7B30)',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {buttonText}
        </button>
      </div>

      {/* 🎚️ لوحة تحكم مصغرة تتفاعل فوريًا على الموبايل */}
      <div style={{ 
        background: '#1E293B', 
        padding: '15px', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '350px',
        border: '1px solid #334155'
      }}>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px', textAlign: 'center' }}>
          تحكم بالعنصر في الأعلى فوراً دون إعادة تحميل:
        </p>

        {/* التحكم بالحجم */}
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>حجم الشعار: {logoSize}px</label>
        <input 
          type="range" 
          min="50" 
          max="180" 
          value={logoSize} 
          onChange={(e) => setLogoSize(Number(e.target.value))}
          style={{ width: '100%', marginBottom: '12px', cursor: 'pointer' }}
        />

        {/* التحكم بنص الزر */}
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>تعديل نص الزر:</label>
        <input 
          type="text" 
          value={buttonText} 
          onChange={(e) => setButtonText(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '6px', 
            border: '1px solid #334155', 
            background: '#090F17', 
            color: '#FFF', 
            marginBottom: '12px',
            fontSize: '14px'
          }}
        />

        {/* التحكم بلون الخلفية */}
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px' }}>لون خلفية المختبر:</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setBgColor('#090F17')} style={{ flex: 1, background: '#090F17', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>داكن</button>
          <button onClick={() => setBgColor('#111C2A')} style={{ flex: 1, background: '#111C2A', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>أزرق</button>
          <button onClick={() => setBgColor('#1E293B')} style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>فاتح</button>
        </div>
      </div>
    </div>
  );
}
