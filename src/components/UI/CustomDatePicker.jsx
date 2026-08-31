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
  
  // حساب النص الهجري
  const hijriText = mainDate ? formatHijriDate(mainDate, isArabic) : '';
  
  // حساب العمر
  const rawAge = (showAge && mainDate) ? calculateAge(mainDate) : null;
  const age = (rawAge !== null && rawAge > 0) ? rawAge : null;

  // توليد السنوات (من 100 سنة مضت حتى السنة الحالية)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const monthsArabic = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  // خريطة أسماء الأيام
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
    <div className="flex flex-col w-full space-y-2">
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setCalendarMode(calendarMode === 'gregorian' ? 'hijri' : 'gregorian')}
          className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary-hover bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 transition-all active:scale-95"
        >
          <Repeat size={13} />
          {calendarMode === 'gregorian' 
            ? (isArabic ? 'عرض التقويم الهجري' : 'Switch to Hijri') 
            : (isArabic ? 'عرض التقويم الميلادي' : 'Switch to Gregorian')}
        </button>

        {age !== null && (
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
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
          placeholderText={placeholder || (isArabic ? "اختر تاريخ الميلاد..." : "Select date...")}
          formatWeekDay={formatFullDayName}
          /* معالجة فتح التقويم بأسلوب portal لمنع التداخل والـ overflow داخل المودال */
          withPortal={typeof window !== 'undefined' && window.innerWidth < 640}
          className="w-full bg-dark-input text-appText-main border border-appBorder-input rounded-xl pr-10 pl-4 py-2.5 text-xs focus:outline-none focus:border-appBorder-hover transition-all cursor-pointer shadow-inner placeholder:text-appText-sub/50"
          calendarClassName="custom-dark-calendar"
          popperClassName="z-[9999]"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: 'preventOverflow',
              options: {
                boundary: 'viewport',
              },
            },
          ]}
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex items-center justify-between px-3 py-2 bg-dark-card rounded-t-xl border-b border-appBorder-card">
              <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="p-1 text-appText-sub hover:text-appText-main disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {/* اختيار السنة */}
                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(Number(value))}
                  className="bg-dark-input text-primary font-bold text-xs px-2 py-1 rounded-md border border-appBorder-input focus:outline-none cursor-pointer"
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {/* اختيار الشهر */}
                <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) => changeMonth(Number(value))}
                  className="bg-dark-input text-primary font-bold text-xs px-2 py-1 rounded-md border border-appBorder-input focus:outline-none cursor-pointer"
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
                className="p-1 text-appText-sub hover:text-appText-main disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        />

        <CalendarIcon 
          size={16} 
          className="absolute right-3 text-primary pointer-events-none" 
        />
      </div>

      {/* شريط المعاينة الهجرية */}
      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-appText-sub font-medium">
          <span>{isArabic ? 'الموافق هجرياً:' : 'Hijri:'}</span>
          <span className="font-semibold text-primary">{hijriText}</span>
        </div>
      )}
    </div>
  );
}
