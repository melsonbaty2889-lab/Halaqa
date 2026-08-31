import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import CustomSelect from './CustomSelect';
import 'react-datepicker/dist/react-datepicker.css';

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

function hijriToGregorian(hYear, hMonthIdx, hDay) {
  try {
    const approxGYear = Math.round((hYear - 1397) * 0.970224 + 1977);
    const testDate = new Date(approxGYear, hMonthIdx, Math.min(hDay, 28));
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });

    for (let i = -35; i <= 35; i++) {
      const checkDate = new Date(testDate.getTime() + i * 86400000);
      const parts = formatter.formatToParts(checkDate);
      const hy = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      const hm = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1;
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
    const monthIdx = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
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
  endDate, 
  onChange, 
  isArabic = true, 
  isRange = false,
  placeholder,
  showAge = true
}) {
  const [calendarMode, setCalendarMode] = useState('gregorian');
  const currentLocale = isArabic ? ar : enUS;

  const rawDate = isRange ? startDate : selectedDate;
  const mainDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : new Date();

  const hijriDetails = getHijriDetails(mainDate);
  const age = showAge ? calcAge(mainDate) : null;

  const [hDay, setHDay] = useState(hijriDetails.day);
  const [hMonth, setHMonth] = useState(hijriDetails.month);
  const [hYear, setHYear] = useState(hijriDetails.year);

  useEffect(() => {
    if (mainDate) {
      const hd = getHijriDetails(mainDate);
      setHDay(hd.day);
      setHMonth(hd.month);
      setHYear(hd.year);
    }
  }, [mainDate?.getTime()]);

  const currentHijriYear = getHijriDetails(new Date()).year;
  
  const dayOptions = Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
  const monthOptions = HIJRI_MONTHS.map((m, idx) => ({ label: m, value: idx }));
  
  // سنوات هجرية بأسماء واضحة ومحددة العرض بدون "اختر من الـ..."
  const yearOptions = Array.from({ length: 90 }, (_, i) => {
    const y = currentHijriYear - i;
    return { label: `${y} هـ`, value: y };
  });

  const handleHijriChange = (d, m, y) => {
    setHDay(d);
    setHMonth(m);
    setHYear(y);
    const convertedGregorian = hijriToGregorian(y, m, d);
    onChange(convertedGregorian);
  };

  const formatShortDayName = (nameOfDay) => {
    if (!isArabic) return nameOfDay.substring(0, 3);
    const daysMap = {
      'أحد': 'أحد', 'إثنين': 'إثن', 'ثلاثاء': 'ثلا',
      'أربعاء': 'أرب', 'خميس': 'خمي', 'جمعة': 'جمع', 'سبت': 'سبت',
      'Sun': 'أحد', 'Mon': 'إثن', 'Tue': 'ثلا',
      'Wed': 'أرب', 'Thu': 'خمي', 'Fri': 'جمع', 'Sat': 'سبت'
    };
    return daysMap[nameOfDay.trim()] || nameOfDay.substring(0, 3);
  };

  return (
    <div className="flex flex-col w-full space-y-2 text-start">
      {/* شريط الأدوات العلوي: زر التبديل وحساب العمر */}
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

      {/* نموذج الإدخال (الميلادي / الهجري) */}
      {calendarMode === 'gregorian' ? (
        <div className="relative flex items-center w-full">
          <DatePicker
            selected={mainDate}
            selectsRange={isRange}
            startDate={startDate}
            endDate={endDate}
            onChange={(date) => onChange(date)}
            locale={currentLocale}
            dateFormat="yyyy/MM/dd"
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={90}
            placeholderText={placeholder || (isArabic ? "اختر تاريخ الميلاد..." : "Select date...")}
            formatWeekDay={formatShortDayName}
            showMonthDropdown
            useShortMonthInDropdown
            className="app-input w-full pr-10 pl-4 py-2 text-xs transition-all cursor-pointer"
            calendarClassName="custom-dark-calendar"
            popperClassName="z-[9999]"
            popperPlacement="bottom-start"
          />
          <CalendarIcon size={16} className="absolute start-3 text-[var(--primary)] pointer-events-none" />
        </div>
      ) : (
        /* توزيع المساحات وتفادي القَطْع: اليوم (1fr)، الشهر (1.2fr)، السنة (1.1fr) */
        <div className="grid grid-cols-[1fr_1.2fr_1.1fr] gap-1.5 w-full">
          <CustomSelect
            options={dayOptions}
            value={hDay}
            onChange={(val) => handleHijriChange(Number(val), hMonth, hYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={monthOptions}
            value={hMonth}
            onChange={(val) => handleHijriChange(hDay, Number(val), hYear)}
            className="text-[11px]"
          />
          <CustomSelect
            options={yearOptions}
            value={hYear}
            onChange={(val) => handleHijriChange(hDay, hMonth, Number(val))}
            className="text-[11px]"
          />
        </div>
      )}

      {/* الشريط السفلي للموافق بالميلادي/الهجري */}
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
