import React, { useState, useEffect } from 'react';
import { Repeat } from 'lucide-react';
import CustomSelect from './CustomSelect';

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const GREGORIAN_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

function hijriToGregorian(hYear, hMonthIdx, hDay) {
  try {
    const approxGYear = Math.round((hYear - 1397) * 0.970224 + 1977);
    const testDate = new Date(approxGYear, hMonthIdx, Math.min(hDay, 28));
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });

    for (let i = -40; i <= 40; i++) {
      const checkDate = new Date(testDate.getTime() + i * 86400000);
      const parts = formatter.formatToParts(checkDate);
      const hy = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      const hm = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
      const hd = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);

      if (hy === hYear && hm === hMonthIdx && hd === hDay) {
        return checkDate;
      }
    }
    return testDate;
  } catch (e) {
    return new Date();
  }
}

function getHijriDetails(date) {
  if (!date || isNaN(new Date(date).getTime())) return { day: 1, month: 0, year: 1445, text: '' };
  const validDate = new Date(date);
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = formatter.formatToParts(validDate);

    const dayNum = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const monthIdx = Math.max(0, Math.min(11, parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1));
    const yearNum = parseInt(parts.find(p => p.type === 'year')?.value || '1445', 10);

    return {
      day: dayNum,
      month: monthIdx,
      year: yearNum,
      text: `${dayNum} ${HIJRI_MONTHS[monthIdx]} ${yearNum} هـ`
    };
  } catch (e) {
    return { day: 1, month: 0, year: 1445, text: '' };
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
  return age >= 0 ? age : 0;
}

export default function CustomDatePicker({ 
  selectedDate, 
  startDate, 
  onChange, 
  isArabic = true, 
  isRange = false,
  showAge = true
}) {
  const [calendarMode, setCalendarMode] = useState('gregorian');

  const rawDate = isRange ? startDate : selectedDate;
  const mainDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : new Date();

  const hijriDetails = getHijriDetails(mainDate);
  const age = showAge ? calcAge(mainDate) : null;

  // الحالات الميلادية
  const [gDay, setGDay] = useState(mainDate.getDate());
  const [gMonth, setGMonth] = useState(mainDate.getMonth());
  const [gYear, setGYear] = useState(mainDate.getFullYear());

  // الحالات الهجرية
  const [hDay, setHDay] = useState(hijriDetails.day);
  const [hMonth, setHMonth] = useState(hijriDetails.month);
  const [hYear, setHYear] = useState(hijriDetails.year);

  useEffect(() => {
    if (mainDate) {
      setGDay(mainDate.getDate());
      setGMonth(mainDate.getMonth());
      setGYear(mainDate.getFullYear());

      const hd = getHijriDetails(mainDate);
      setHDay(hd.day);
      setHMonth(hd.month);
      setHYear(hd.year);
    }
  }, [mainDate?.getTime()]);

  const currentGregorianYear = new Date().getFullYear();
  const currentHijriYear = getHijriDetails(new Date()).year;

  // خيارات الأيام
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

  // خيارات التقويم الميلادي
  const gMonthOptions = GREGORIAN_MONTHS.map((m, idx) => ({ label: m, value: idx }));
  const gYearOptions = Array.from({ length: 120 }, (_, i) => {
    const y = currentGregorianYear - i;
    return { label: String(y), value: y };
  });

  // خيارات التقويم الهجري
  const hMonthOptions = HIJRI_MONTHS.map((m, idx) => ({ label: m, value: idx }));
  const hYearOptions = Array.from({ length: 120 }, (_, i) => {
    const y = currentHijriYear - i;
    return { label: `${y} هـ`, value: y };
  });

  const handleGregorianChange = (d, m, y) => {
    const cleanD = Number(d);
    const cleanM = Number(m);
    const cleanY = Number(y);
    const maxDays = new Date(cleanY, cleanM + 1, 0).getDate();
    const safeD = Math.min(cleanD, maxDays);

    setGDay(safeD);
    setGMonth(cleanM);
    setGYear(cleanY);

    const newDate = new Date(cleanY, cleanM, safeD);
    onChange(newDate);
  };

  const handleHijriChange = (d, m, y) => {
    const cleanD = Number(d);
    const cleanM = Number(m);
    const cleanY = Number(y);

    setHDay(cleanD);
    setHMonth(cleanM);
    setHYear(cleanY);

    const convertedGregorian = hijriToGregorian(cleanY, cleanM, cleanD);
    onChange(convertedGregorian);
  };

  return (
    <div className="flex flex-col w-full space-y-2 text-start">
      <div className="flex items-center justify-between text-xs gap-2">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--primary)] hover:opacity-80 bg-[var(--primary)]/10 px-2.5 py-1 rounded-lg border border-[var(--primary)]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Repeat size={13} />
          {calendarMode === 'gregorian' 
            ? (isArabic ? 'التحويل للتقويم الهجري' : 'Switch to Hijri') 
            : (isArabic ? 'التحويل للتقويم الميلادي' : 'Switch to Gregorian')}
        </button>

        {age !== null && (
          <span className="text-[11px] font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-lg border border-[var(--primary)]/20 whitespace-nowrap">
            {isArabic ? `العمر: ${age} سنة` : `Age: ${age} yrs`}
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
            options={dayOptions.slice(0, 30)}
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

      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--surface-input)] border border-[var(--border-input)] text-xs text-[var(--text-sub)] font-medium">
          <span>{calendarMode === 'gregorian' ? 'الموافق هجرياً:' : 'الموافق ميلادياً:'}</span>
          <span className="font-semibold text-[var(--primary)] tracking-wide">
            {calendarMode === 'gregorian' 
              ? hijriDetails.text 
              : `${mainDate.getFullYear()}/${String(mainDate.getMonth() + 1).padStart(2, '0')}/${String(mainDate.getDate()).padStart(2, '0')} م`}
          </span>
        </div>
      )}
    </div>
  );
}
