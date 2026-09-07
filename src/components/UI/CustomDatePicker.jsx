import React, { useState, useEffect, useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomSelect from './CustomSelect';
import C from '@/theme/colors';

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// دالة تحويل هجري إلى ميلادي معتمدة على التقويم الرسمي للمتصفح
function hijriToGregorian(hYear, hMonthIdx, hDay) {
  if (!hYear || isNaN(hYear)) return null;
  try {
    const targetMonth = Number(hMonthIdx) + 1;
    const targetDay = Number(hDay);
    const targetYear = Number(hYear);

    const approxGYear = Math.round((targetYear - 1397) * 0.970224 + 1977);
    const startDate = new Date(approxGYear, 0, 1);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });

    for (let i = -300; i <= 300; i++) {
      const checkDate = new Date(startDate.getTime() + i * 86400000);
      const parts = formatter.formatToParts(checkDate);
      
      const hy = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      const hm = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10);
      const hd = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);

      if (hy === targetYear && hm === targetMonth && hd === targetDay) {
        return checkDate;
      }
    }
    return new Date(approxGYear, Number(hMonthIdx), targetDay);
  } catch (e) {
    return null;
  }
}

function getHijriDetails(date, lang = 'ar') {
  if (!date || isNaN(new Date(date).getTime())) return null;
  const validDate = new Date(date);
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = formatter.formatToParts(validDate);

    const dayNum = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const yearNum = parseInt(parts.find(p => p.type === 'year')?.value || '1447', 10);

    const monthIdx = Math.max(0, Math.min(11, monthNum - 1));

    let monthName = HIJRI_MONTHS_AR[monthIdx];
    try {
      const hijriMonthFormat = new Intl.DateTimeFormat(`${lang}-u-ca-islamic-umalqura`, { month: 'long' });
      monthName = hijriMonthFormat.format(validDate);
    } catch (err) {
      // الرجوع إلى القائمة العربية في حال عدم دعم المتصفح
    }

    const isRtl = ['ar', 'ur'].includes(lang.toLowerCase().split('-')[0]);
    const suffix = isRtl ? 'هـ' : 'AH';

    return {
      day: dayNum,
      month: monthIdx,
      year: yearNum,
      text: `${dayNum} ${monthName} ${yearNum} ${suffix}`
    };
  } catch (e) {
    return null;
  }
}

function calcAge(date) {
  if (!date || isNaN(new Date(date).getTime())) return null;
  const d = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return (age >= 0 && age < 120) ? age : null;
}

export default function CustomDatePicker({ 
  selectedDate, 
  startDate, 
  onChange, 
  isArabic, 
  isRange = false,
  showAge = true
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : (i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang));

  const [calendarMode, setCalendarMode] = useState('gregorian');

  const rawDate = isRange ? startDate : selectedDate;
  const mainDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : null;

  const hijriDetails = mainDate ? getHijriDetails(mainDate, cleanLang) : null;
  const age = (showAge && mainDate) ? calcAge(mainDate) : null;

  const [gDay, setGDay] = useState(mainDate ? mainDate.getDate() : 1);
  const [gMonth, setGMonth] = useState(mainDate ? mainDate.getMonth() : 0);
  const [gYear, setGYear] = useState(mainDate ? mainDate.getFullYear() : '');

  const [hDay, setHDay] = useState(hijriDetails ? hijriDetails.day : 1);
  const [hMonth, setHMonth] = useState(hijriDetails ? hijriDetails.month : 0);
  const [hYear, setHYear] = useState(hijriDetails ? hijriDetails.year : '');

  // استخراج ألوان الثيم الديناميكية من C
  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8';
  const surfaceBg = C.dark?.surface || '#1E293B';
  const mainBg = C.dark?.bg || '#0F172A';
  const borderCol = C.dark?.borderInput || C.inputs?.border || '#334155';
  const titleColor = C.text?.title || '#F8FAFC';
  const subColor = C.text?.sub || C.text?.muted || '#94A3B8';

  useEffect(() => {
    if (mainDate && calendarMode === 'gregorian') {
      setGDay(mainDate.getDate());
      setGMonth(mainDate.getMonth());
      setGYear(mainDate.getFullYear());

      const hd = getHijriDetails(mainDate, cleanLang);
      if (hd) {
        setHDay(hd.day);
        setHMonth(hd.month);
        setHYear(hd.year);
      }
    }
  }, [mainDate?.getTime(), calendarMode, cleanLang]);

  const currentGregorianYear = new Date().getFullYear();
  const currentHijriYear = getHijriDetails(new Date(), cleanLang)?.year || 1448;

  const dayOptions = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: i + 1 })),
  []);

  const gMonthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const d = new Date(2026, idx, 1);
      const label = new Intl.DateTimeFormat(currentLang, { month: 'long' }).format(d);
      return { label, value: idx };
    });
  }, [currentLang]);

  const gYearOptions = useMemo(() => [
    { label: t('datePicker.selectYear', 'اختر السنة...'), value: '' },
    ...Array.from({ length: 100 }, (_, i) => {
      const y = currentGregorianYear - i;
      return { label: String(y), value: y };
    })
  ], [currentGregorianYear, t]);

  const hMonthOptions = useMemo(() => {
    return HIJRI_MONTHS_AR.map((m, idx) => {
      try {
        const dummyDate = hijriToGregorian(1448, idx, 15) || new Date();
        const label = new Intl.DateTimeFormat(`${currentLang}-u-ca-islamic-umalqura`, { month: 'long' }).format(dummyDate);
        return { label, value: idx };
      } catch (e) {
        return { label: m, value: idx };
      }
    });
  }, [currentLang]);

  const hYearOptions = useMemo(() => [
    { label: t('datePicker.selectYear', 'اختر السنة...'), value: '' },
    ...Array.from({ length: 100 }, (_, i) => {
      const y = currentHijriYear - i;
      const suffix = isRtl ? 'هـ' : 'AH';
      return { label: `${y} ${suffix}`, value: y };
    })
  ], [currentHijriYear, isRtl, t]);

  const handleGregorianChange = (d, m, y) => {
    const numD = Number(d);
    const numM = Number(m);
    const numY = Number(y);

    setGDay(numD);
    setGMonth(numM);
    setGYear(numY);

    if (!numY || isNaN(numY)) return;

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
    setHYear(numY);

    if (!numY || isNaN(numY)) return;

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

        {age !== null && (
          <span 
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap"
            style={{
              color: primaryColor,
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`
            }}
          >
            {t('datePicker.ageFormat', 'العمر: {{age}} سنة', { age })}
          </span>
        )}
      </div>

      {calendarMode === 'gregorian' ? (
        <div className="grid grid-cols-[1fr_1.2fr_1.1fr] gap-1.5 w-full">
          <CustomSelect
            options={dayOptions}
            value={gDay}
            onChange={(val) => handleGregorianChange(val, gMonth, gYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={gMonthOptions}
            value={gMonth}
            onChange={(val) => handleGregorianChange(gDay, val, gYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={gYearOptions}
            value={gYear}
            onChange={(val) => handleGregorianChange(gDay, gMonth, val)}
            className="text-[11px]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_1.2fr_1.1fr] gap-1.5 w-full">
          <CustomSelect
            options={dayOptions}
            value={hDay}
            onChange={(val) => handleHijriChange(val, hMonth, hYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={hMonthOptions}
            value={hMonth}
            onChange={(val) => handleHijriChange(hDay, val, hYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={hYearOptions}
            value={hYear}
            onChange={(val) => handleHijriChange(hDay, hMonth, val)}
            className="text-[11px]"
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
          {mainDate ? (
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
