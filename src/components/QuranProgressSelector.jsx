import React, { useState, useEffect, useRef } from 'react';

export default function QuranProgressSelector({ initialIndex, onIndexChange, disabled }) {
  const [juz, setJuz] = useState(1);
  const [quarterInJuz, setQuarterInJuz] = useState(1);
  
  // 🛡️ مفتاح الأمان الذكي لمنع التحديث التلقائي عند فتح الصفحة
  const isInitialized = useRef(false);

  // عند فتح النافذة: نقوم بتحويل الرقم إلى (جزء وربع) للعرض فقط
  useEffect(() => {
    if (initialIndex && initialIndex >= 1 && initialIndex <= 240) {
      const calculatedJuz = Math.ceil(initialIndex / 8);
      const calculatedQuarter = initialIndex % 8 === 0 ? 8 : initialIndex % 8;
      
      setJuz(calculatedJuz);
      setQuarterInJuz(calculatedQuarter);
    } else {
      setJuz(1);
      setQuarterInJuz(1);
    }
    
    // نرفع علم الأمان ليصبح المكون جاهزاً لتعديلات المعلم يدوياً
    setTimeout(() => {
      isInitialized.current = true;
    }, 100);
  }, [initialIndex]);

  // عند تغيير الاختيارات يدوياً فقط: نحسب الـ index ونرسله للأب
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const newIndex = (juz - 1) * 8 + quarterInJuz;
    if (newIndex !== initialIndex) {
      onIndexChange(newIndex);
    }
  }, [juz, quarterInJuz]);

  const getQuarterLabel = (qNum) => {
    return qNum <= 4 ? `الربع ${qNum} (الحزب الأول)` : `الربع ${qNum - 4} (الحزب الثاني)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <label style={{ color: '#b392ac', fontSize: '14px', fontWeight: '500', textAlign: 'right', display: 'block' }}>
        المستوى الحالي في الحفظ (الورد):
      </label>
      <div style={{ display: 'flex', gap: '12px', direction: 'rtl' }}>
        <div style={{ flex: 1 }}>
          <select 
            value={juz} 
            onChange={(e) => setJuz(parseInt(e.target.value, 10))}
            disabled={disabled}
            style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '8px', border: '1px solid #374151', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'right' }}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>الجزء {num}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <select 
            value={quarterInJuz} 
            onChange={(e) => setQuarterInJuz(parseInt(e.target.value, 10))}
            disabled={disabled}
            style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '8px', border: '1px solid #374151', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'right' }}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>{getQuarterLabel(num)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
