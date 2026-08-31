import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat, ChevronRight, ChevronLeft } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

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
  const hijriText = mainDate ? formatHijriDate(mainDate, isArabic) : '';
  const age = (showAge && mainDate) ? calculateAge(mainDate) : null;

  // توليد السنوات لاختيار سريع
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthsArabic = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // خريطة تحويل الأيام لضمان ظهور الاسم الكامل دائماً
  const formatFullDayName = (nameOfDay) => {
    if (!isArabic) return nameOfDay;
    
    const daysMap = {
      'أحد': 'الأحد',
      'إثنين': 'الإثنين',
      'ثلاثاء': 'الثلاثاء',
      'أربعاء': 'الأربعاء',
      'خميس': 'الخميس',
      'جمعة': 'الجمعة',
      'سبت': 'السبت',
      'الأحد': 'الأحد',
      'الإثنين': 'الإثنين',
      'الثلاثاء': 'الثلاثاء',
      'الأربعاء': 'الأربعاء',
      'الخميس': 'الخميس',
      'الجمعة': 'الجمعة',
      'السبت': 'السبت',
      'Sun': 'الأحد',
      'Mon': 'الإثنين',
      'Tue': 'الثلاثاء',
      'Wed': 'الأربعاء',
      'Thu': 'الخميس',
      'Fri': 'الجمعة',
      'Sat': 'السبت'
    };

    const cleanName = nameOfDay.trim();
    return daysMap[cleanName] || cleanName;
  };

  return (
    <div className="flex flex-col w-full space-y-2 dir-rtl">
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all active:scale-95"
        >
          <Repeat size={13} />
          {calendarMode === 'gregorian' 
            ? (isArabic ? 'عرض التقويم الهجري' : 'Switch to Hijri') 
            : (isArabic ? 'عرض التقويم الميلادي' : 'Switch to Gregorian')}
        </button>

        {age !== null && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {isArabic ? `العمر: ${age} سنة` : `Age: ${age} yrs`}
          </span>
        )}
      </div>

      {/* حقل الإدخال والتقويم */}
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
          placeholderText={placeholder || (isArabic ? "اختر التاريخ..." : "Select date...")}
          formatWeekDay={formatFullDayName}
          className="w-full bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500/80 transition-all cursor-pointer shadow-inner placeholder:text-slate-500"
          calendarClassName="custom-dark-calendar"
          popperClassName="z-[9999]"
          popperPlacement="bottom-start"
          
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 rounded-t-xl border-b border-slate-700/60">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(Number(value))}
                  className="bg-slate-900 text-emerald-400 font-bold text-xs px-2 py-1 rounded-md border border-slate-700 focus:outline-none"
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) => changeMonth(Number(value))}
                  className="bg-slate-900 text-emerald-400 font-bold text-xs px-2 py-1 rounded-md border border-slate-700 focus:outline-none"
                >
                  {monthsArabic.map((option, index) => (
                    <option key={option} value={index}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        />

        <CalendarIcon 
          size={16} 
          className="absolute right-3 text-emerald-400 pointer-events-none" 
        />
      </div>

      {/* شريط المعاينة الهجرية والميلادية */}
      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          <span>{isArabic ? 'الموافق هجرياً:' : 'Hijri:'}</span>
          <span className="font-semibold">{hijriText}</span>
        </div>
      )}
    </div>
  );
}
