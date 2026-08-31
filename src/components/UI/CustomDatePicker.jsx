import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon, Repeat, ChevronRight, ChevronLeft } from 'lucide-react';
import { ar, enUS } from 'date-fns/locale';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';

// قائمة الشهور الهجرية والميلادية
const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const GREGORIAN_MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

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

  // حساب الهجري والميلادي للعرض
  const hijriText = mainDate ? formatHijriDate(mainDate, isArabic) : '';
  const rawAge = (showAge && mainDate) ? calculateAge(mainDate) : null;
  const age = (rawAge !== null && rawAge > 0) ? rawAge : null;

  // توليد السنوات الميلادية والهجرية
  const currentYearGregorian = new Date().getFullYear();
  const gregorianYears = Array.from({ length: 100 }, (_, i) => currentYearGregorian - i);
  
  // تقدير السنة الهجرية الحالية
  const currentYearHijri = Math.floor((currentYearGregorian - 622) * (33 / 32));
  const hijriYears = Array.from({ length: 100 }, (_, i) => currentYearHijri - i);

  // تحويل من هجري إلى ميلادي تقريبي عند تغيير الاختيار في التقويم الهجري
  const handleHijriSelection = (hijriYear, hijriMonthIndex, day = 1) => {
    // معادلة تحويل هجري إلى ميلادي تقريبية لتحديد التاريخ الصحيح
    const gYear = Math.floor(hijriYear + 622 - (hijriYear / 33));
    const newDate = new Date(gYear, hijriMonthIndex, day);
    onChange(newDate);
  };

  const formatFullDayName = (nameOfDay) => {
    if (!isArabic) return nameOfDay;
    const daysMap = {
      'أحد': 'الأحد', 'إثنين': 'الإثنين', 'ثلاثاء': 'الثلاثاء',
      'أربعاء': 'الأربعاء', 'خميس': 'الخميس', 'جمعة': 'الجمعة', 'سبت': 'السبت',
      'Sun': 'الأحد', 'Mon': 'الإثنين', 'Tue': 'الثلاثاء',
      'Wed': 'الأربعاء', 'Thu': 'الخميس', 'Fri': 'الجمعة', 'Sat': 'السبت'
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
          placeholderText={
            placeholder || 
            (calendarMode === 'hijri' 
              ? (isArabic ? "اختر التاريخ الهجري..." : "Select Hijri date...") 
              : (isArabic ? "اختر تاريخ الميلاد..." : "Select date..."))
          }
          formatWeekDay={formatFullDayName}
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
          }) => {
            // في الوضع الهجري يتم استخراج القيم الهجرية الحالية
            const activeHijriYear = Math.floor((date.getFullYear() - 622) * (33 / 32));
            const activeHijriMonth = date.getMonth(); // استخدام كدليل شهر هجري

            return (
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
                  {/* اختيار السنة (هجري / ميلادي) */}
                  <select
                    value={calendarMode === 'hijri' ? activeHijriYear : date.getFullYear()}
                    onChange={({ target: { value } }) => {
                      if (calendarMode === 'hijri') {
                        handleHijriSelection(Number(value), activeHijriMonth);
                      } else {
                        changeYear(Number(value));
                      }
                    }}
                    className="bg-dark-input text-primary font-bold text-xs px-2 py-1 rounded-md border border-appBorder-input focus:outline-none cursor-pointer"
                  >
                    {(calendarMode === 'hijri' ? hijriYears : gregorianYears).map((option) => (
                      <option key={option} value={option}>
                        {option} {calendarMode === 'hijri' ? 'هـ' : ''}
                      </option>
                    ))}
                  </select>

                  {/* اختيار الشهر (هجري / ميلادي) */}
                  <select
                    value={calendarMode === 'hijri' ? activeHijriMonth : date.getMonth()}
                    onChange={({ target: { value } }) => {
                      if (calendarMode === 'hijri') {
                        handleHijriSelection(activeHijriYear, Number(value));
                      } else {
                        changeMonth(Number(value));
                      }
                    }}
                    className="bg-dark-input text-primary font-bold text-xs px-2 py-1 rounded-md border border-appBorder-input focus:outline-none cursor-pointer"
                  >
                    {(calendarMode === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS_AR).map((option, index) => (
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
            );
          }}
        />

        <CalendarIcon 
          size={16} 
          className="absolute right-3 text-primary pointer-events-none" 
        />
      </div>

      {/* شريط المعاينة والربط بين الهجري والميلادي */}
      {mainDate && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-appText-sub font-medium">
          <span>{calendarMode === 'hijri' ? (isArabic ? 'الموافق ميلادياً:' : 'Gregorian:') : (isArabic ? 'الموافق هجرياً:' : 'Hijri:')}</span>
          <span className="font-semibold text-primary">
            {calendarMode === 'hijri' 
              ? `${mainDate.getFullYear()}/${String(mainDate.getMonth() + 1).padStart(2, '0')}/${String(mainDate.getDate()).padStart(2, '0')} م`
              : hijriText}
          </span>
        </div>
      )}
    </div>
  );
}
