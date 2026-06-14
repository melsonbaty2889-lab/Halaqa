import React, { useState, useEffect, useRef } from 'react';

export default function QuranProgressSelector({ initialIndex, onIndexChange }) {
  const [juz, setJuz] = useState(1);
  const [quarterInJuz, setQuarterInJuz] = useState(1);
  // مفتاح أمان لمنع التحديث عند التحميل الأولي
  const isInitialized = useRef(false);

  // 1. عند تغير initialIndex (القادم من قاعدة البيانات)
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
    // بعد أول جلب للبيانات، نسمح للمكون بالعمل
    isInitialized.current = true;
  }, [initialIndex]);

  // 2. عند تغيير الاختيارات يدوياً من قبل المعلم
  useEffect(() => {
    // لا ترسل أي شيء للأب إذا كان المكون لم يتم تهيئته بعد
    if (!isInitialized.current) return;
    
    const newIndex = (juz - 1) * 8 + quarterInJuz;
    onIndexChange(newIndex);
  }, [juz, quarterInJuz, onIndexChange]);

  const getQuarterLabel = (qNum) => {
    return qNum <= 4 ? `الربع ${qNum} (الحزب الأول)` : `الربع ${qNum - 4} (الحزب الثاني)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <label style={{ color: '#b392ac', fontSize: '14px', fontWeight: '500', textAlign: 'right' }}>
        المستوى الحالي في الحفظ (الورد):
      </label>
      
      <div style={{ display: 'flex', gap: '12px', direction: 'rtl' }}>
        <div style={{ flex: 1 }}>
          <select 
            value={juz} 
            onChange={(e) => setJuz(parseInt(e.target.value, 10))}
            style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer' }}
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
            style={{ width: '100%', padding: '12px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '8px', border: '1px solid #374151', cursor: 'pointer' }}
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
