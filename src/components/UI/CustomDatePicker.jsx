/* src/components/UI/CustomDatePicker.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { Repeat } from 'lucide-react';
import CustomSelect from './CustomSelect';
import C from '@/theme/colors';
import { 
  HIJRI_MONTHS, 
  getHijriParts, 
  hijriToGregorian,
  calculateAge, 
  toArNums, 
  toUrNums 
} from '@/utils/dateUtils';

function getHijriDetailsFormatted(date, lang = 'ar') {
  if (!date || isNaN(new Date(date).getTime())) return null;
  try {
    const validDate = new Date(date);
    const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
    const isRtl = ['ar', 'ur'].includes(cleanLang);

    const { day, month, year } = getHijriParts(validDate);
    if (!year) return null;

    const currentLangMap = HIJRI_MONTHS[cleanLang] ? cleanLang : 'ar';
    const monthName = HIJRI_MONTHS[currentLangMap][month] || HIJRI_MONTHS.ar[month];

    let dayStr = String(day);
    let yearStr = String(year);
    let suffix = isRtl ? 'هـ' : 'AH';

    if (cleanLang === 'ar') {
      dayStr = toArNums(day);
      yearStr = toArNums(year);
    } else if (cleanLang === 'ur') {
      dayStr = toUrNums(day);
      yearStr = toUrNums(year);
      suffix = 'ء';
    }

    return {
      day,
      month,
      year,
      text: `${dayStr} ${monthName} ${yearStr} ${suffix}`
    };
  } catch (e) {
    return null;
  }
}

export default function CustomDatePicker({ 
  selectedDate, 
  startDate, 
  onChange, 
  isArabic = true, 
  lang = 'ar',
  t = (key, fallback) => fallback,
  isRange = false,
  showAge = true
}) {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  const [calendarMode, setCalendarMode] = useState('gregorian');

  const rawDate = isRange ? startDate : selectedDate;
  const mainDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : null;

  const hijriDetails = mainDate ? getHijriDetailsFormatted(mainDate, cleanLang) : null;
  const age = (showAge && mainDate) ? calculateAge(mainDate) : null;

  const [gDay, setGDay] = useState(mainDate ? mainDate.getDate() : 1);
  const [gMonth, setGMonth] = useState(mainDate ? mainDate.getMonth() : 0);
  const [gYear, setGYear] = useState(mainDate ? mainDate.getFullYear() : '');

  const [hDay, setHDay] = useState(hijriDetails ? hijriDetails.day : 1);
  const [hMonth, setHMonth] = useState(hijriDetails ? hijriDetails.month : 0);
  const [hYear, setHYear] = useState(hijriDetails ? hijriDetails.year : '');

  const primaryColor = C?.amber?.DEFAULT || C?.primary?.DEFAULT || '#38BDF8';
  const surfaceBg = C?.dark?.surface || '#1E293B';
  const borderCol = C?.dark?.borderInput || C?.inputs?.border || '#334155';
  const subColor = C?.text?.sub || C?.text?.muted || '#94A3B8';

  useEffect(() => {
    if (mainDate) {
      setGDay(mainDate.getDate());
      setGMonth(mainDate.getMonth());
      setGYear(mainDate.getFullYear());

      const hd = getHijriDetailsFormatted(mainDate, cleanLang);
      if (hd) {
        setHDay(hd.day);
        setHMonth(hd.month);
        setHYear(hd.year);
      }
    }
  }, [mainDate?.getTime(), cleanLang]);

  const currentGregorianYear = new Date().getFullYear();
  const currentHijriYear = getHijriParts(new Date())?.year || 1448;

  const daysInMonth = useMemo(() => {
    if (calendarMode === 'gregorian') {
      const year = Number(gYear) || currentGregorianYear;
      return new Date(year, Number(gMonth) + 1, 0).getDate();
    }
    return 30;
  }, [calendarMode, gYear, gMonth, currentGregorianYear]);

  const dayOptions = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const val = i + 1;
      let label = String(val);
      if (cleanLang === 'ar') label = toArNums(val);
      else if (cleanLang === 'ur') label = toUrNums(val);
      return { label, value: val };
    });
  }, [daysInMonth, cleanLang]);

  const gMonthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const d = new Date(2026, idx, 1);
      const label = new Intl.DateTimeFormat(cleanLang, { month: 'long' }).format(d);
      return { label, value: idx };
    });
  }, [cleanLang]);

  const gYearOptions = useMemo(() => [
    { label: t('datePicker.selectYearPlaceholder', 'السنة...'), value: '' },
    ...Array.from({ length: 100 }, (_, i) => {
      const y = currentGregorianYear - i;
      let label = String(y);
      if (cleanLang === 'ar') label = toArNums(y);
      else if (cleanLang === 'ur') label = toUrNums(y);
      return { label, value: y };
    })
  ], [currentGregorianYear, cleanLang, t]);

  const hMonthOptions = useMemo(() => {
    const currentLangMap = HIJRI_MONTHS[cleanLang] ? cleanLang : 'ar';
    const list = HIJRI_MONTHS[currentLangMap] || HIJRI_MONTHS.ar;
    return list.map((m, idx) => ({ label: m, value: idx }));
  }, [cleanLang]);

  const hYearOptions = useMemo(() => [
    { label: t('datePicker.selectYearPlaceholder', 'السنة...'), value: '' },
    ...Array.from({ length: 100 }, (_, i) => {
      const y = currentHijriYear - i;
      let yStr = String(y);
      let suffix = isRtl ? 'هـ' : 'AH';
      if (cleanLang === 'ar') yStr = toArNums(y);
      else if (cleanLang === 'ur') {
        yStr = toUrNums(y);
        suffix = 'ء';
      }
      return { label: `${yStr} ${suffix}`, value: y };
    })
  ], [currentHijriYear, cleanLang, isRtl, t]);

  const handleGregorianChange = (d, m, y) => {
    const numD = Number(d);
    const numM = Number(m);
    const numY = Number(y);

    setGDay(numD);
    setGMonth(numM);
    setGYear(y);

    if (!y || isNaN(numY) || numY < 1900 || numY > 2100) return;

    const maxDays = new Date(numY, numM + 1, 0).getDate();
    const safeD = Math.min(numD, maxDays);

    const newDate = new Date(numY, numM, safeD);
    onChange(newDate);
  };

  const handleHijriChange = (d, m, y) => {
    const numD = Number(d);
    const numM = Number(m);
    const numY = Number(y);

    setHDay(numD);
    setHMonth(numM);
    setHYear(y);

    if (!y || isNaN(numY) || numY < 1000 || numY > 1600) return;

    const convertedGregorian = hijriToGregorian(numY, numM, numD);
    if (convertedGregorian) {
      onChange(convertedGregorian);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-2 text-start" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between text-xs gap-2">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          aria-label={t('datePicker.switchCalendar', 'تبديل نوع التقويم')}
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer whitespace-nowrap min-h-[36px]"
          style={{
            color: primaryColor,
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}30`
          }}
        >
          <Repeat size={13} />
          <span>
            {calendarMode === 'gregorian' 
              ? t('datePicker.switchToHijri', 'التحويل للتقويم الهجري') 
              : t('datePicker.switchToGregorian', 'التحويل للتقويم الميلادي')}
          </span>
        </button>

        {age !== null && age >= 0 && (
          <span 
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`
            }}
          >
            {t('datePicker.ageFormat', `العمر: ${cleanLang === 'ar' ? toArNums(age) : (cleanLang === 'ur' ? toUrNums(age) : age)} سنة`)}
          </span>
        )}
      </div>

      {calendarMode === 'gregorian' ? (
        <div className="grid grid-cols-[0.8fr_1.4fr_1.2fr] gap-1.5 w-full">
          <CustomSelect
            options={dayOptions}
            value={gDay}
            onChange={(val) => handleGregorianChange(val, gMonth, gYear)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
          <CustomSelect
            options={gMonthOptions}
            value={gMonth}
            onChange={(val) => handleGregorianChange(gDay, val, gYear)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
          <CustomSelect
            options={gYearOptions}
            value={gYear}
            onChange={(val) => handleGregorianChange(gDay, gMonth, val)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[0.8fr_1.4fr_1.2fr] gap-1.5 w-full">
          <CustomSelect
            options={dayOptions}
            value={hDay}
            onChange={(val) => handleHijriChange(val, hMonth, hYear)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
          <CustomSelect
            options={hMonthOptions}
            value={hMonth}
            onChange={(val) => handleHijriChange(hDay, val, hYear)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
          <CustomSelect
            options={hYearOptions}
            value={hYear}
            onChange={(val) => handleHijriChange(hDay, hMonth, val)}
            isArabic={isRtl}
            lang={cleanLang}
            t={t}
          />
        </div>
      )}

      <div 
        className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium"
        style={{
          backgroundColor: surfaceBg,
          borderColor: borderCol,
          color: subColor
        }}
      >
        <span>
          {calendarMode === 'gregorian' 
            ? t('datePicker.correspondingHijri', 'الموافق هجرياً:') 
            : t('datePicker.correspondingGregorian', 'الموافق ميلادياً:')}
        </span>
        <span className="font-semibold tracking-wide" style={{ color: primaryColor }}>
          {mainDate && gYear && hYear ? (
            calendarMode === 'gregorian' 
              ? (hijriDetails?.text || '—') 
              : `${mainDate.getFullYear()}/${String(mainDate.getMonth() + 1).padStart(2, '0')}/${String(mainDate.getDate()).padStart(2, '0')} ${isRtl ? 'م' : 'AD'}`
          ) : (
            t('datePicker.pleaseSelectYear', 'يرجى اختيار السنة')
          )}
        </span>
      </div>
    </div>
  );
}
