/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Settings2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { C } from '@/theme/colors';
import CustomSelect from './CustomSelect';
import { 
  HIJRI_MONTHS, 
  getHijriParts, 
  formatHijriDate, 
  getSavedHijriOffset, 
  setSavedHijriOffset,
  toArNums,
  toUrNums,
  calculateAge,
  gregorianToHijri,
  hijriToGregorian
} from '@/utils/dateUtils';

export default function CustomDatePicker({ 
  selectedDate, 
  onChange, 
  variant = 'grid',
  showHijriToggle = true,
  showSightAdjustment = true,
  showAge = true,
  showAgeOnly = false,
  minYear,
  maxYear,
  className = ''
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = i18n?.dir 
    ? i18n.dir() === 'rtl' 
    : ['ar', 'ur', 'fa'].includes(cleanLang);

  const [useHijri, setUseHijri] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hijriOffset, setHijriOffsetState] = useState(getSavedHijriOffset());
  const dropdownRef = useRef(null);

  // تحويل قيمة التاريخ المدخل لكيان Date صحيح
  const dateObj = useMemo(() => {
    if (!selectedDate) return new Date();
    if (selectedDate instanceof Date) return selectedDate;
    if (typeof selectedDate === 'string') {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return new Date(parts[0], parts[1] - 1, parts[2] || 1);
      }
    }
    const parsed = new Date(selectedDate);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [selectedDate]);

  const [viewDate, setViewDate] = useState(dateObj);

  useEffect(() => {
    setViewDate(dateObj);
  }, [dateObj]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOffsetChange = (newOffset) => {
    setHijriOffsetState(newOffset);
    setSavedHijriOffset(newOffset);
  };

  const formatNum = (num) => {
    if (num === null || num === undefined) return '';
    if (cleanLang === 'ur') return toUrNums(num);
    if (cleanLang === 'ar') return toArNums(num);
    return String(num);
  };

  const age = calculateAge(dateObj);

  // إذا تم طلب إظهار العمر فقط (مثلاً في صفحة إضافة طالب)
  if (showAgeOnly) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput ${className}`}>
        <span className="text-xs font-medium text-semantic-textSecondary">
          {t('datePicker.age', 'العمر:')}
        </span>
        <span className="text-sm font-bold text-semantic-actionPrimary">
          {formatNum(age)} {t('datePicker.yearsUnit', 'سنة')}
        </span>
      </div>
    );
  }

  // التاريخ المنسق للعرض النصي
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      if (useHijri) {
        return formatHijriDate(dateObj, currentLang, hijriOffset);
      }
      return new Intl.DateTimeFormat(currentLang, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return String(selectedDate);
    }
  }, [selectedDate, currentLang, useHijri, dateObj, hijriOffset]);

  // التاريخ الرقمي المنسق فوق المكون
  const formattedNumericDate = useMemo(() => {
    if (useHijri) {
      const { day, month, year } = getHijriParts(dateObj, hijriOffset);
      const d = String(day).padStart(2, '0');
      const m = String(month + 1).padStart(2, '0');
      return `${formatNum(year)}-${formatNum(m)}-${formatNum(d)}`;
    }
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${formatNum(y)}-${formatNum(m)}-${formatNum(d)}`;
  }, [useHijri, dateObj, hijriOffset, cleanLang]);

  const handleSelectDate = (dateStr) => {
    if (typeof onChange === 'function') {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    handleSelectDate(`${y}-${m}-${d}`);
  };

  const actionPrimary = C.semantic?.actionPrimary || '#E07A00';
  const surfaceInput = C.semantic?.surfaceInput || '#0A101D';
  const surfaceCard = C.semantic?.surfaceCard || '#0F172A';
  const borderInput = C.semantic?.borderInput || '#1B2738';
  const textPrimary = C.semantic?.textPrimary || '#FFFFFF';
  const textSecondary = C.semantic?.textSecondary || '#94A3B8';

  const dateIsoString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  const currentGregorianYear = new Date().getFullYear();
  const effectiveMinYear = minYear || (currentGregorianYear - 100);
  const effectiveMaxYear = maxYear || (currentGregorianYear + 10);

  // -------------------------------------------------------------
  // نمط القوائم المنسدلة (Select Variant)
  // -------------------------------------------------------------
  if (variant === 'select') {
    const gDay = dateObj.getDate();
    const gMonth = dateObj.getMonth();
    const gYear = dateObj.getFullYear();
    const daysInMonth = new Date(gYear, gMonth + 1, 0).getDate();

    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
      label: formatNum(i + 1),
      value: i + 1
    }));

    const monthOptions = Array.from({ length: 12 }, (_, idx) => ({
      label: new Intl.DateTimeFormat(cleanLang, { month: 'long' }).format(new Date(2026, idx, 1)),
      value: idx
    }));

    const yearOptions = Array.from(
      { length: effectiveMaxYear - effectiveMinYear + 1 }, 
      (_, i) => {
        const y = effectiveMaxYear - i;
        return { label: formatNum(y), value: y };
      }
    );

    const handleSelectChange = (d, m, y) => {
      const safeY = y !== undefined ? y : gYear;
      const safeM = m !== undefined ? m : gMonth;
      const maxDays = new Date(safeY, safeM + 1, 0).getDate();
      const safeD = Math.min(d !== undefined ? d : gDay, maxDays);

      const newD = new Date(safeY, safeM, safeD);
      const str = `${newD.getFullYear()}-${String(newD.getMonth() + 1).padStart(2, '0')}-${String(newD.getDate()).padStart(2, '0')}`;

      if (typeof onChange === 'function') {
        onChange(str);
      }
    };

    return (
      <div className={`flex flex-col w-full space-y-1.5 text-start ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {showAge && age !== null && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-medium text-semantic-textSecondary">
              {t('datePicker.birthDateLabel', 'تاريخ الميلاد')}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border bg-semantic-surfaceInput text-semantic-actionPrimary border-semantic-borderInput">
              {t('datePicker.age', 'العمر:')} {formatNum(age)} {t('datePicker.yearsUnit', 'سنة')}
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <CustomSelect options={dayOptions} value={gDay} onChange={(v) => handleSelectChange(v, gMonth, gYear)} isArabic={isRtl} lang={cleanLang} t={t} />
          <CustomSelect options={monthOptions} value={gMonth} onChange={(v) => handleSelectChange(gDay, v, gYear)} isArabic={isRtl} lang={cleanLang} t={t} />
          <CustomSelect options={yearOptions} value={gYear} onChange={(v) => handleSelectChange(gDay, gMonth, v)} isArabic={isRtl} lang={cleanLang} t={t} />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // نمط التقويم المدمج (Grid Variant)
  // -------------------------------------------------------------
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const firstDayOfWeek = (() => {
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return isRtl ? (day + 1) % 7 : day;
  })();

  const weekDays = (() => {
    const days = [];
    const refDate = new Date(2026, 7, 1);
    const startOffset = isRtl ? 0 : 1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + startOffset + i);
      days.push(new Intl.DateTimeFormat(cleanLang, { weekday: 'narrow' }).format(d));
    }
    return days;
  })();

  // خيارات الأشهر والسنوات التقويمية
  const monthSelectOptions = Array.from({ length: 12 }, (_, idx) => {
    if (useHijri) {
      const monthsList = HIJRI_MONTHS[cleanLang] || HIJRI_MONTHS.ar || HIJRI_MONTHS.en;
      return { label: monthsList[idx] || `شهر ${idx + 1}`, value: idx };
    }
    return {
      label: new Intl.DateTimeFormat(cleanLang, { month: 'short' }).format(new Date(2026, idx, 1)),
      value: idx
    };
  });

  const hijriParts = getHijriParts(viewDate, hijriOffset);

  const yearSelectOptions = Array.from(
    { length: effectiveMaxYear - effectiveMinYear + 1 }, 
    (_, idx) => {
      const y = useHijri ? (hijriParts.year - 50 + idx) : (effectiveMaxYear - idx);
      return { label: `${formatNum(y)} ${useHijri ? 'هـ' : ''}`, value: y };
    }
  );

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full z-40 ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* شريط معلومات العمر وتاريخ الميلاد */}
      {showAge && age !== null && (
        <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-xs font-medium text-semantic-textSecondary">
            {t('datePicker.birthDateLabel', 'تاريخ الميلاد')}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border bg-semantic-surfaceInput text-semantic-actionPrimary border-semantic-borderInput">
            {t('datePicker.age', 'العمر:')} {formatNum(age)} {t('datePicker.yearsUnit', 'سنة')}
          </span>
        </div>
      )}

      {/* الزناد الرئيسي للمكون */}
      <div 
        className="flex items-center justify-between gap-1.5 rounded-xl border px-2.5 py-1.5 whitespace-nowrap min-h-[38px] transition-all hover:border-semantic-borderHover w-full"
        style={{ backgroundColor: surfaceInput, borderColor: borderInput }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-transparent border-0 cursor-pointer text-xs font-semibold text-semantic-textPrimary focus:outline-none"
        >
          <CalendarIcon size={14} className="text-semantic-actionPrimary" />
          <span>{formattedNumericDate}</span>
        </button>

        <span className="text-semantic-textMuted">|</span>

        <span className="text-[11px] font-bold text-semantic-actionPrimary truncate">
          {formattedDisplayDate}
        </span>

        {showHijriToggle && (
          <button
            type="button"
            onClick={() => setUseHijri(!useHijri)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border transition-all"
            style={{
              backgroundColor: useHijri ? 'rgba(224,122,0,0.2)' : surfaceInput,
              color: useHijri ? actionPrimary : textSecondary,
              borderColor: useHijri ? actionPrimary : borderInput
            }}
          >
            <Globe size={11} />
            <span>{useHijri ? t('common.hijri', 'هجري') : t('common.gregorian', 'ميلادي')}</span>
          </button>
        )}
      </div>

      {/* النافذة المنبثقة للتقويم */}
      {isOpen && (
        <div 
          className="absolute top-[110%] z-50 rounded-xl p-3 border shadow-2xl w-72 transition-all text-start"
          style={{
            backgroundColor: surfaceCard,
            borderColor: borderInput,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            [isRtl ? 'right' : 'left']: 0
          }}
        >
          {/* رأس التحكم بالشهر والسنة */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <button 
              type="button" 
              onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} 
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center hover:bg-semantic-surfaceInput"
              style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
            >
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className="flex items-center gap-1 flex-1">
              <div className="w-1/2">
                <CustomSelect
                  options={monthSelectOptions}
                  value={useHijri ? hijriParts.month : currentMonth}
                  onChange={(m) => {
                    if (useHijri) {
                      const gDate = hijriToGregorian(hijriParts.year, Number(m), hijriParts.day);
                      setViewDate(gDate);
                    } else {
                      setViewDate(new Date(currentYear, Number(m), 1));
                    }
                  }}
                  isArabic={isRtl}
                  lang={cleanLang}
                  t={t}
                />
              </div>
              <div className="w-1/2">
                <CustomSelect
                  options={yearSelectOptions}
                  value={useHijri ? hijriParts.year : currentYear}
                  onChange={(y) => {
                    if (useHijri) {
                      const gDate = hijriToGregorian(Number(y), hijriParts.month, hijriParts.day);
                      setViewDate(gDate);
                    } else {
                      setViewDate(new Date(Number(y), currentMonth, 1));
                    }
                  }}
                  isArabic={isRtl}
                  lang={cleanLang}
                  t={t}
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} 
              className="p-1 rounded-lg border cursor-pointer flex items-center justify-center hover:bg-semantic-surfaceInput"
              style={{ backgroundColor: surfaceInput, borderColor: borderInput, color: textPrimary }}
            >
              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-semantic-textSecondary">
                {d}
              </span>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === dateIsoString;
              
              const dayObj = new Date(currentYear, currentMonth, dayNum);
              const rawDisplayNum = useHijri 
                ? getHijriParts(dayObj, hijriOffset).day 
                : dayNum;
              const displayNum = formatNum(rawDisplayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDate(dateStr)}
                  className="py-1 text-xs rounded-md border-0 cursor-pointer transition-all font-semibold flex items-center justify-center hover:bg-semantic-actionPrimary/20"
                  style={{
                    backgroundColor: isSelected ? actionPrimary : surfaceInput,
                    color: isSelected ? '#FFFFFF' : textPrimary,
                  }}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          {/* تعديل الرؤية الهجرية */}
          {useHijri && showSightAdjustment && (
            <div className="mt-2 pt-1.5 border-t border-semantic-borderInput flex items-center justify-between">
              <span className="text-[10px] flex items-center gap-1 font-medium text-semantic-textSecondary">
                <Settings2 size={11} /> {t('datePicker.sightAdjustment', 'تعديل الرؤية:')}
              </span>
              <div className="flex gap-1">
                {[-1, 0, 1].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => handleOffsetChange(offset)}
                    className="px-1.5 py-0.5 text-[9px] rounded border-0 cursor-pointer font-bold transition-all"
                    style={{
                      backgroundColor: hijriOffset === offset ? actionPrimary : surfaceInput,
                      color: hijriOffset === offset ? '#FFFFFF' : textSecondary
                    }}
                  >
                    {offset > 0 ? `+${formatNum(offset)}` : formatNum(offset)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* أزرار اليوم والإغلاق */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-semantic-borderInput">
            <button
              type="button"
              onClick={handleSelectToday}
              className="py-1 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all hover:bg-semantic-actionPrimary/20"
              style={{
                backgroundColor: surfaceInput,
                color: actionPrimary
              }}
            >
              {t('common.today', 'اليوم')}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="py-1 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all hover:bg-semantic-borderInput/80"
              style={{
                backgroundColor: borderInput,
                color: textPrimary
              }}
            >
              {t('common.close', 'إغلاق')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
