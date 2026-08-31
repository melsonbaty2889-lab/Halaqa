import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// دالة تحويل دقيقة من هجري إلى ميلادي
function hijriToGregorian(hYear, hMonthIdx, hDay) {
  try {
    const gYearEst = Math.round((hYear - 1397) * 0.970224 + 1977);
    const testDate = new Date(gYearEst, hMonthIdx, Math.min(hDay, 28));
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umaqura', {
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

// استخراج المكونات الهجرية والنص التوضيحي
function getHijriDetails(date) {
  const validDate = (date && !isNaN(new Date(date).getTime())) ? new Date(date) : new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umaqura', {
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

// حساب العمر
function calcAge(date) {
  if (!date || isNaN(new Date(date).getTime())) return null;
  const d = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function CustomDatePicker({ 
  selectedDate, 
  startDate, 
  endDate, 
  onChange, 
  isArabic = true, 
  isRange = false,
  placeholder,
  showAge = false
}) {
  const [calendarMode, setCalendarMode] = useState('gregorian');
  const currentLocale = isArabic ? ar : enUS;

  // تأمين التمرير والتأكد من تحويل النص لـ Date إن وجد
  const rawDate = isRange ? startDate : selectedDate;
  const mainDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : null;

  const hijriDetails = getHijriDetails(mainDate);
  const age = (showAge && mainDate) ? calcAge(mainDate) : null;

  const [hDay, setHDay] = useState(hijriDetails.day);
  const [hMonth, setHMonth] = useState(hijriDetails.month);
  const [hYear, setHYear] = useState(hijriDetails.year);

  // مزامنة القيم عند تغير DatePicker الميلادي
  useEffect(() => {
    if (mainDate) {
      const hd = getHijriDetails(mainDate);
      setHDay(hd.day);
      setHMonth(hd.month);
      setHYear(hd.year);
    }
  }, [mainDate?.getTime()]);

  // توليد السنوات الهجرية (السنة الحالية - 90 سنة)
  const currentHijriYear = getHijriDetails(new Date()).year;
  const hijriYears = Array.from({ length: 90 }, (_, i) => currentHijriYear - i);

  const handleHijriChange = (d, m, y) => {
    setHDay(d);
    setHMonth(m);
    setHYear(y);
    const convertedGregorian = hijriToGregorian(y, m, d);
    onChange(convertedGregorian);
  };

  const formatFullDayName = (nameOfDay) => {
    if (!isArabic) return nameOfDay;
    const daysMap = {
      'أحد': 'الأحد', 'إثنين': 'الإثنين', 'ثلاثاء': 'الثلاثاء',
      'أربعاء': 'الأربعاء', 'خميس': 'الخميس', 'جمعة': 'الجمعة', 'سبت': 'السبت',
      'Sun': 'الأحد', 'Mon': 'الإثنين', 'Tue': 'الثلاثاء',
      'Wed': 'الأربعاء', 'Thu': 'الخميس', 'Fri': 'الجمعة', 'Sat': 'السبت'
    };
    return daysMap[nameOfDay.trim()] || nameOfDay;
  };

  return (
    <div className="flex flex-col w-full space-y-2">
      {/* شريط التحويل العلوي */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary-hover bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 transition-all active:scale-95"
        >
          <Repeat size={13} />
          {calendarMode === 'gregorian' 
            ? (isArabic ? 'التحويل للتقويم الهجري' : 'Switch to Hijri') 
            : (isArabic ? 'التحويل للتقويم الميلادي' : 'Switch to Gregorian')}
        </button>

        {age !== null && (
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            {isArabic ? `العمر: ${age} سنة` : `Age: ${age} yrs`}
          </span>
        )}
      </div>

      {/* حقول الإدخال */}
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
            formatWeekDay={formatFullDayName}
            withPortal={typeof window !== 'undefined' && window.innerWidth < 640}
            className="w-full bg-dark-input text-appText-main border border-appBorder-input rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover transition-all cursor-pointer shadow-inner placeholder:text-appText-sub/50"
            calendarClassName="custom-dark-calendar"
            popperClassName="z-[9999]"
            popperPlacement="bottom-start"
          />
          <CalendarIcon size={16} className="absolute right-3 text-primary pointer-events-none" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* اليوم الهجري */}
          <select
            value={hDay}
            onChange={(e) => handleHijriChange(Number(e.target.value), hMonth, hYear)}
            className="bg-dark-input text-appText-main border border-appBorder-input rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover cursor-pointer"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          {/* الشهر الهجري */}
          <select
            value={hMonth}
            onChange={(e) => handleHijriChange(hDay, Number(e.target.value), hYear)}
            className="bg-dark-input text-appText-main border border-appBorder-input rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover cursor-pointer font-medium"
          >
            {HIJRI_MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          {/* السنة الهجرية */}
          <select
            value={hYear}
            onChange={(e) => handleHijriChange(hDay, hMonth, Number(e.target.value))}
            className="bg-dark-input text-appText-main border border-appBorder-input rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover cursor-pointer font-bold"
          >
            {hijriYears.map((yr) => (
              <option key={yr} value={yr}>{yr} هـ</option>
            ))}
          </select>
        </div>
      )}

      {/* الشريط السفلي للتأكيد */}
      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-appText-sub font-medium">
          <span>{calendarMode === 'gregorian' ? 'الموافق هجرياً:' : 'الموافق ميلادياً:'}</span>
          <span className="font-semibold text-primary">
            {calendarMode === 'gregorian' 
              ? hijriDetails.text 
              : `${mainDate.getFullYear()}/${String(mainDate.getMonth() + 1).padStart(2, '0')}/${String(mainDate.getDate()).padStart(2, '0')} م`}
          </span>
        </div>
      )}
    </div>
  );
}
