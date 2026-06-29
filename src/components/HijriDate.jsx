// src/components/HijriDate.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatHijriDate } from '../utils/dateUtils';

export default function HijriDate({ date = new Date(), style = {}, className = "" }) {
  const { i18n } = useTranslation();
  
  // الحصول على اللغة الحالية، وتعيين العربية كافتراضية
  const currentLang = i18n.language || 'ar';

  return (
    <span style={style} className={`hijri-date ${className}`}>
      {formatHijriDate(date, currentLang)}
    </span>
  );
}
