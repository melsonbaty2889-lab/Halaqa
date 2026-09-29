// src/components/Sidebar/SidebarWidget.jsx
import React, { useMemo } from 'react';
import { Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatHijriDate, formatGregorianDate, formatTimeString, toArNums, toUrNums } from '@/utils/dateUtils';

export default function SidebarWidget({
  academyTime,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl,
  effectiveDaysLeft,
  preferredCalendar = 'gregorian', // يقرأ قيمة calendar_type المباشرة من جدول academies
  t
}) {
  const { i18n } = useTranslation();
  
  const currentLang = useMemo(() => {
    const rawLang = i18n.language || (isRtl ? 'ar' : 'en');
    return rawLang.split('-')[0].toLowerCase();
  }, [i18n.language, isRtl]);

  const translate = (key, fallback) => {
    if (typeof t === 'function') return t(key, fallback);
    return fallback;
  };

  // التحقق مما إذا كان التقويم المعتمد هو الهجري
  const isHijriPreferred = useMemo(() => {
    if (!preferredCalendar) return false;
    return String(preferredCalendar).trim().toLowerCase() === 'hijri';
  }, [preferredCalendar]);

  // معالجة التواريخ والوقت وفق الترتيب المعتمد للأكاديمية
  const { formattedTime, primaryDate, secondaryDate } = useMemo(() => {
    let timeStr = '';
    
    if (academyTime) {
      if (currentLang === 'ar') timeStr = toArNums(academyTime);
      else if (currentLang === 'ur') timeStr = toUrNums(academyTime);
      else timeStr = academyTime;
    } else {
      timeStr = formatTimeString(new Date(), currentLang);
    }

    const gregDate = formatGregorianDate(new Date(), currentLang);
    const hijriDate = formatHijriDate(new Date(), currentLang);

    return {
      formattedTime: timeStr,
      primaryDate: isHijriPreferred ? hijriDate : gregDate,    // التاريخ الأعلى حسب إعداد الأكاديمية
      secondaryDate: isHijriPreferred ? gregDate : hijriDate  // التاريخ الأسفل
    };
  }, [academyTime, currentLang, isHijriPreferred]);

  const isLifetime = effectiveDaysLeft === Infinity;

  return (
    <div 
      className="p-2.5 rounded-xl mb-3 flex items-center justify-between gap-2 shadow-sm backdrop-blur-md select-none bg-semantic-surfaceCard border border-semantic-borderCard transition-colors duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* التوقيت */}
      <div 
        className="flex items-center gap-1.5 text-[11px] font-bold font-mono shrink-0 text-brandEmerald-light"
        title={translate('common.currentTime', 'الوقت الحالي')}
      >
        <Clock size={13} className="shrink-0 text-brandEmerald-light" aria-hidden="true" />
        <span dir="auto">{formattedTime}</span>
      </div>

      {/* التاريخ الرئيسي المعتمد والتاريخ الثانوي */}
      <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1 text-center">
        <span className="text-[11px] font-semibold leading-tight whitespace-nowrap text-brandEmerald-light">
          {primaryDate}
        </span>
        <span className="text-[9.5px] font-medium leading-tight whitespace-nowrap opacity-90 text-semantic-textMuted">
          {secondaryDate}
        </span>
      </div>

      {/* زر الترقية */}
      {!isLifetime && (
        <button
          type="button"
          onClick={() => {
            if (typeof setActiveTab === 'function') setActiveTab('subscriptions');
            if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
            if (isMobile && typeof setSidebarOpen === 'function') setSidebarOpen(false);
          }}
          aria-label={translate('common.upgrade', isRtl ? 'ترقية الحساب' : 'Upgrade Account')}
          className="px-2.5 py-1 bg-semantic-actionPrimary hover:bg-semantic-actionPrimaryHover text-semantic-textPrimary border-0 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shrink-0 shadow-[0_2px_8px_var(--color-action-primary-glow)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-actionPrimary/50 transition-all duration-150"
        >
          <Zap size={11} className="fill-current shrink-0 text-semantic-textPrimary" aria-hidden="true" />
          <span>{translate('common.upgrade', isRtl ? 'ترقية' : 'Upgrade')}</span>
        </button>
      )}
    </div>
  );
}
