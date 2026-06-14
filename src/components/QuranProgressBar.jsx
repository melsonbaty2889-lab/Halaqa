import React from 'react';
import { getQuranProgress } from '../utils/quranUtils'; // تأكد من تعديل المسار حسب مكان ملف quranUtils

const QuranProgressBar = ({ currentQuarterIndex }) => {
  // تحويل الرقم القادم من قاعدة البيانات إلى تفاصيل ونسبة مئوية
  const progress = getQuranProgress(currentQuarterIndex);

  return (
    <div style={{
      background: '#1E293B', // خلفية داكنة احترافية مريحة للعين
      padding: '20px',
      borderRadius: '16px',
      direction: 'rtl', // لدعم العرض من اليمين لليسان
      fontFamily: 'sans-serif',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      border: '1px solid #334155',
      maxWidth: '500px',
      margin: '15px auto'
    }}>
      {/* قسم النصوص العلوية */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <span style={{ color: '#94A3B8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>المحطة الحالية</span>
          <span style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: '15px' }}>
            📍 {progress.text}
          </span>
        </div>
        <div style={{ textAlign: 'left' }}>
          <span style={{ color: '#94A3B8', fontSize: '11px', display: 'block', marginBottom: '4px' }}>نسبة التقدم</span>
          <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '18px' }}>
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* شريط خط السير (Progress Bar) */}
      <div style={{
        width: '100%',
        height: '12px',
        background: '#334155',
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: `${progress.percentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #10B981, #34D399)', // تدرج لوني أخضر جذاب
          borderRadius: '6px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' // حركة ناعمة جداً عند تحديث الرقم
        }} />
      </div>

      {/* نص تشجيعي ذكي أسفل الشريط */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
        {progress.percentage === 100 
          ? '🎉 هنيئاً لك ختم القرآن الكريم بالكامل!' 
          : `متبقي ${100 - progress.percentage}% على ختمة كاملة، واصل الهمة!`}
      </div>
    </div>
  );
};

export default QuranProgressBar;
