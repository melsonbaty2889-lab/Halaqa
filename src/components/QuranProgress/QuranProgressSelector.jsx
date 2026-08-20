/* src/components/QuranProgress/QuranProgressSelector.jsx */
import React, { useState, useEffect, useRef } from 'react';
import colors from '@/theme/colors';

export default function QuranProgressSelector({ initialIndex, onIndexChange, disabled }) {
  const [juz, setJuz] = useState(1);
  const [quarterInJuz, setQuarterInJuz] = useState(1);

  // مفتاح الأمان الذكي لمنع التحديث التلقائي عند فتح الصفحة
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
  }, [juz, quarterInJuz, initialIndex, onIndexChange]);

  const getQuarterLabel = (qNum) => {
    return qNum <= 4 ? `الربع ${qNum} (الحزب الأول)` : `الربع ${qNum - 4} (الحزب الثاني)`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[#b392ac] text-sm font-medium text-right block">
        المستوى الحالي في الحفظ (الورد):
      </label>
      <div className="flex gap-3 dir-rtl">
        <div className="flex-1">
          <select 
            value={juz} 
            onChange={(e) => setJuz(parseInt(e.target.value, 10))}
            disabled={disabled}
            className={`w-full p-3 bg-[${colors.background || '#111827'}] text-white rounded-lg border border-[${colors.border || '#374151'}] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-right`}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} className="bg-[#111827] text-white">الجزء {num}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select 
            value={quarterInJuz} 
            onChange={(e) => setQuarterInJuz(parseInt(e.target.value, 10))}
            disabled={disabled}
            className={`w-full p-3 bg-[${colors.background || '#111827'}] text-white rounded-lg border border-[${colors.border || '#374151'}] ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-right`}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} className="bg-[#111827] text-white">{getQuarterLabel(num)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
