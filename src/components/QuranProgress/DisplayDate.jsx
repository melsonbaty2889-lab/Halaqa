/* src/components/QuranProgress/DisplayDate.jsx */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatHijriDate, formatGregorianDate } from '@/utils/dateUtils';

export default function DisplayDate({ 
  date = new Date(), 
  showGregorian = true, // خيار إظهار التاريخ الميلادي
  showHijri = true,     // خيار إظهار التاريخ الهجري
  dayOffset = 0, 
  style = {}, 
  className = "" 
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';

  const hijriStr = formatHijriDate(date, currentLang, dayOffset);
  const gregorianStr = formatGregorianDate(date, currentLang);

  return (
    <div style={style} className={`inline-flex items-center gap-2 text-sm text-gray-700 ${className}`}>
      {showHijri && (
        <span className="font-semibold text-emerald-700">{hijriStr}</span>
      )}
      
      {showHijri && showGregorian && (
        <span className="text-gray-400">|</span>
      )}
      
      {showGregorian && (
        <span className="text-gray-500">{gregorianStr}</span>
      )}
    </div>
  );
}
