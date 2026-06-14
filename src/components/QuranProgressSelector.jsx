import React, { useState, useEffect, useRef } from 'react';

/**
 * مكون اختيار الحفظ الحالي المطور والمحمي من حلقة التكرار اللانهائية
 * @param {number} initialIndex - مؤشر الربع الحالي القادم من قاعدة البيانات Supabase (من 0 إلى 240)
 * @param {function} onIndexChange - الدالة التي ترسل الرقم الجديد للمكون الأب عند التغيير
 */
export default function QuranProgressSelector({ initialIndex, onIndexChange }) {
  const [juz, setJuz] = useState(1);
  const [quarterInJuz, setQuarterInJuz] = useState(1);
  
  // 🛡️ مفتاح الأمان الذكي لمنع المكون من إرسال بيانات تلقائية للأب عند فتح الصفحة
  const isInitialized = useRef(false);

  // 1. عند فتح النافذة أو تغير initialIndex: نقوم بتحويل الرقم إلى (جزء وربع) للعرض فقط
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
    
    // بمجرد الانتهاء من القراءة الأولى، نرفع علم الأمان ليصبح المكون جاهزاً لتعديلات المعلم يدوياً
    setTimeout(() => {
      isInitialized.current = true;
    }, 100);
  }, [initialIndex]);

  // 2. عند قيام المعلم بتغيير الاختيارات يدوياً فقط: نحسب الـ index ونرسله للأب
  useEffect(() => {
    // 🛑 إذا كان المكون في مرحلة التحميل الأولي، اخرج فوراً ولا ترسل أي شيء للأب
    if (!isInitialized.current) return;
    
    const newIndex = (juz - 1) * 8 + quarterInJuz;
    
    // نتحقق أن القيمة الجديدة تختلف عن القيمة الأصلية لتجنب أي تحديث غير ضروري
    if (newIndex !== initialIndex) {
      onIndexChange(newIndex);
    }
  }, [juz, quarterInJuz]); // نعتمد فقط على التغيير اليدوي للقوائم

  // دالة مساعدة لتسمية الأرباع الـ 8 وتوضيح رقم الحزب المقابل لها
  const getQuarterLabel = (qNum) => {
    if (qNum <= 4) {
      return `الربع ${qNum} (الحزب الأول)`;
    } else {
      return `الربع ${qNum - 4} (الحزب الثاني)`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      
      <label style={{ color: '#b392ac', fontSize: '14px', fontWeight: '500', textAlign: 'right', display: 'block' }}>
        المستوى الحالي في الحفظ (الورد):
      </label>
      
      <div style={{ display: 'flex', gap: '12px', direction: 'rtl' }}>
        
        {/* قائمة اختيار الجزء (من 1 إلى 30) */}
        <div style={{ flex: 1 }}>
          <select 
            value={juz} 
            onChange={(e) => setJuz(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#111827', 
              color: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #374151',
              outline: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'right'
            }}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>الجزء {num}</option>
            ))}
          </select>
        </div>

        {/* قائمة اختيار الربع داخل الجزء (من 1 إلى 8) */}
        <div style={{ flex: 1 }}>
          <select 
            value={quarterInJuz} 
            onChange={(e) => setQuarterInJuz(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#111827',
              color: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #374151',
              outline: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'right'
            }}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {getQuarterLabel(num)}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
