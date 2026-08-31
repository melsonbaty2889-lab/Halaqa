import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// دالة تحويل دقيقة من هجري (أم القرى) إلى ميلادي
function hijriToGregorianDate(hYear, hMonthIndex, hDay) {
  // نبدأ بتاريخ تقريبي للميلادي
  let gYear = Math.floor(hYear + 622 - (hYear / 33));
  let testDate = new Date(gYear, hMonthIndex, hDay);

  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umaqura', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });

  // معايرة دقيقة للتاريخ الفعلي
  for (let i = -5; i <= 5; i++) {
    let checkDate = new Date(testDate.getTime() + i * 86400000);
    let parts = formatter.formatToParts(checkDate);
    let hy = parseInt(parts.find(p => p.type === 'year')?.value || 0, 10);
    let hm = parseInt(parts.find(p => p.type === 'month')?.value || 0, 10) - 1;
    let hd = parseInt(parts.find(p => p.type === 'day')?.value || 0, 10);

    if (hy === hYear && hm === hMonthIndex && hd === hDay) {
      return checkDate;
    }
  }
  return testDate;
}

// دالة استخراج مكونات التاريخ الهجري الحالي من تاريخ ميلادي
function getHijriParts(date) {
  if (!date) return { day: 1, month: 0, year: 1445 };
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umaqura', {
      day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    return {
      day: parseInt(parts.find(p => p.type === 'day')?.value || 1, 10),
      month: parseInt(parts.find(p => p.type === 'month')?.value || 1, 10) - 1,
      year: parseInt(parts.find(p => p.type === 'year')?.value || 1445, 10)
    };
  } catch (e) {
    return { day: 1, month: 0, year: 1445 };
  }
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
  const [calendarMode, setCalendarMode] = useState('gregorian'); // 'gregorian' | 'hijri'

  const currentLocale = isArabic ? ar : enUS;
  const mainDate = isRange ? startDate : selectedDate;

  // استخراج البيانات الهجرية والحسابات
  const hijriParts = getHijriParts(mainDate || new Date());
  const hijriText = mainDate ? formatHijriDate(mainDate, isArabic) : '';
  const rawAge = (showAge && mainDate) ? calculateAge(mainDate) : null;
  const age = (rawAge !== null && rawAge > 0) ? rawAge : null;

  // قيم الاختيارات الهجرية
  const [hDay, setHDay] = useState(hijriParts.day);
  const [hMonth, setHMonth] = useState(hijriParts.month);
  const [hYear, setHYear] = useState(hijriParts.year);

  // تحديث القيم الهجرية عند تغيير التاريخ الرئيسي من الخارج
  useEffect(() => {
    if (mainDate) {
      const hp = getHijriParts(mainDate);
      setHDay(hp.day);
      setHMonth(hp.month);
      setHYear(hp.year);
    }
  }, [mainDate]);

  // قائمة السنوات الهجرية
  const currentHijriYear = hijriParts.year || 1448;
  const hijriYears = Array.from({ length: 90 }, (_, i) => currentHijriYear - i);

  // معالجة تغيير الإدخال الهجري
  const handleHijriChange = (day, monthIdx, year) => {
    setHDay(day);
    setHMonth(monthIdx);
    setHYear(year);
    const convertedGregorian = hijriToGregorianDate(year, monthIdx, day);
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

      {/* الواجهة بحسب الوضع المختار */}
      {calendarMode === 'gregorian' ? (
        /* الوضع الميلادي: تقويم تفاعلي كامل */
        <div className="relative flex items-center w-full">
          <DatePicker
            selected={selectedDate}
            selectsRange={isRange}
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            locale={currentLocale}
            dateFormat="yyyy/MM/dd"
            maxDate={new Date()}
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
        /* الوضع الهجري: قوائم اختيار سريعة بالهجري (يوم / شهر / سنة) */
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* اختيار اليوم الهجري */}
          <select
            value={hDay}
            onChange={(e) => handleHijriChange(Number(e.target.value), hMonth, hYear)}
            className="bg-dark-input text-appText-main border border-appBorder-input rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover cursor-pointer"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          {/* اختيار الشهر الهجري */}
          <select
            value={hMonth}
            onChange={(e) => handleHijriChange(hDay, Number(e.target.value), hYear)}
            className="bg-dark-input text-appText-main border border-appBorder-input rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover cursor-pointer font-medium"
          >
            {HIJRI_MONTHS.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          {/* اختيار السنة الهجرية */}
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

      {/* الشريط السفلي للتوضيح الدائم */}
      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-appText-sub font-medium">
          <span>{calendarMode === 'gregorian' ? 'الموافق هجرياً:' : 'الموافق ميلادياً:'}</span>
          <span className="font-semibold text-primary">
            {calendarMode === 'gregorian' 
              ? hijriText 
              : `${mainDate.getFullYear()}/${String(mainDate.getMonth() + 1).padStart(2, '0')}/${String(mainDate.getDate()).padStart(2, '0')} م`}
          </span>
        </div>
      )}
    </div>
  );
}
