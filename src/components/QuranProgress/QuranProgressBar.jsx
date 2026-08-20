/* src/components/QuranProgress/QuranProgressBar.jsx */
import React from 'react';
import { getQuranProgress } from '@/utils/quranUtils';
import colors from '@/theme/colors';

const QuranProgressBar = ({ currentQuarterIndex }) => {
  // تحويل الرقم القادم من قاعدة البيانات إلى تفاصيل ونسبة مئوية
  const progress = getQuranProgress(currentQuarterIndex);

  return (
    <div className="bg-[#1E293B] p-5 rounded-2xl rtl font-sans shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] border border-[#334155] max-w-[500px] my-4 mx-auto">
     
      {/* قسم النصوص العلوية */}
      <div className="flex justify-between items-center mb-3.5">
        <div>
          <span className="text-[#94A3B8] text-[11px] block mb-1">المحطة الحالية</span>
          <span className="text-[#FBBF24] font-bold text-[15px]">
            📍 {progress.text}
          </span>
        </div>
 
        <div className="text-left">
          <span className="text-[#94A3B8] text-[11px] block mb-1">نسبة التقدم</span>
          <span className="text-[#10B981] font-bold text-lg">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* شريط خط السير (Progress Bar) */}
      <div className="w-full h-3 bg-[#334155] rounded-md overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
        <div 
          className={`h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-md transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-[${progress.percentage}%]`} 
        />
      </div>

      {/* نص تشجيعي ذكي أسفل الشريط */}
      <div className="mt-3 text-xs text-[#94A3B8] text-center">
        {progress.percentage === 100 
          ? '🎉 هنيئاً لك ختم القرآن الكريم بالكامل!' 
          : `متبقي ${100 - progress.percentage}% على ختمة كاملة، واصل الهمة!`}
      </div>
    </div>
  );
};

export default QuranProgressBar;
