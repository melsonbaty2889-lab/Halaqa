import React, { useState, useEffect } from 'react';

/**
 * مكون اختيار الحفظ الحالي متوافق 100% مع دالة getQuranProgress الحالية
 * @param {number} initialIndex - مؤشر الربع الحالي القادم من قاعدة البيانات Supabase (من 0 إلى 240)
 * @param {function} onIndexChange - الدالة التي ترسل الرقم الجديد المحسوب للمكون الأب (Students.jsx) عند التغيير
 */
export default function QuranProgressSelector({ initialIndex, onIndexChange }) {
  // 1. حالات المكون (States) لتخزين الجزء المختار والربع المختار داخل هذا الجزء
  const [juz, setJuz] = useState(1);
  const [quarterInJuz, setQuarterInJuz] = useState(1);

  // 2. عند فتح النافذة: تحويل الرقم الخطي (1-240) القادم من قاعدة البيانات تلقائياً إلى (جزء وربع) ليظهر في القوائم
  useEffect(() => {
    if (initialIndex && initialIndex >= 1 && initialIndex <= 240) {
      // حساب رقم الجزء بناءً على أن كل جزء يحتوي على 8 أرباع
      const calculatedJuz = Math.ceil(initialIndex / 8);
      // حساب ترتيب الربع داخل هذا الجزء (من 1 إلى 8)
      const calculatedQuarter = initialIndex % 8 === 0 ? 8 : initialIndex % 8;
      
      setJuz(calculatedJuz);
      setQuarterInJuz(calculatedQuarter);
    } else {
      // إذا كان الطالب لم يبدأ بعد (المؤشر يساوي 0 أو غير معرف)
      setJuz(1);
      setQuarterInJuz(1);
    }
  }, [initialIndex]);

  // 3. عند قيام المعلم بتغيير الاختيارات: حساب الـ index الرقمي الجديد وإرساله للأب فوراً لحفظه
  useEffect(() => {
    // للحفاظ على حالة "لم يبدأ بعد" إذا كانت القيمة الابتدائية صفر ولم يغير المعلم شيئاً
    if (initialIndex === 0 && juz === 1 && quarterInJuz === 1) {
      return;
    }
    
    // المعادلة العكسية الذكية: (كل جزء سابق يمثل 8 أرباع كاملة) + أرباع الجزء الحالي
    const newIndex = (juz - 1) * 8 + quarterInJuz;
    onIndexChange(newIndex);
  }, [juz, quarterInJuz, onIndexChange, initialIndex]);

  // دالة مساعدة لتسمية الأرباع الـ 8 وتوضيح رقم الحزب المقابل لها لتسهيل الاختيار على المعلم
  const getQuarterLabel = (qNum) => {
    if (qNum <= 4) {
      return `الربع ${qNum} (الحزب الأول)`;
    } else {
      return `الربع ${qNum - 4} (الحزب الثاني)`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textDirection: 'rtl' }}>
      
      {/* عنوان القسم متناسق مع اللون الذهبي لواجهتك الأنيقة */}
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
              backgroundColor: '#111827', // لون داكن متوافق تماماً مع الوضع المظلم لتطبيقك
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
