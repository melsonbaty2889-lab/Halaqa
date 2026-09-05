// src/components/Sidebar/SidebarWidget.jsx
import React, { useMemo } from 'react';
import { Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatHijriDate, formatGregorianDate, formatTimeString, toEngNums } from '@/utils/dateUtils';
import { colors as C } from '@/theme/colors';

export default function SidebarWidget({
  academyTime,
  hijri,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl,
  effectiveDaysLeft,
  t
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || (isRtl ? 'ar' : 'en');

  const translate = (key, fallback) => {
    if (typeof t === 'function') return t(key, fallback);
    return fallback;
  };

  // تنسيق التاريخ الهجري بناءً على اللغة الحالية المعتمدة في التطبيق
  const formattedHijri = useMemo(() => {
    if (hijri && typeof hijri === 'string') return hijri;
    return formatHijriDate(new Date(), currentLang);
  }, [hijri, currentLang]);

  // تنسيق التاريخ الميلادي بأمان وبدون رموز تشويش
  const formattedGregorian = useMemo(() => {
    return formatGregorianDate(new Date(), currentLang, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [currentLang]);

  // تنسيق الوقت لمنع ظهور رموز مثل (ÖÖ) والاعتماد على أرقام وصيغة نظيفة
  const formattedTime = useMemo(() => {
    if (academyTime) return toEngNums(academyTime);
    return formatTimeString(new Date());
  }, [academyTime]);

  const isLifetime = effectiveDaysLeft === Infinity;

  return (
    <div 
      className="p-2 rounded-xl mb-3 flex items-center justify-between gap-1.5 shadow-sm backdrop-blur-md"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
        borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold font-mono shrink-0 ltr:flex-row rtl:flex-row-reverse" style={{ color: C.emerald?.light || '#34D399' }}>
        <Clock size={13} className="shrink-0" style={{ color: C.emerald?.light || '#34D399' }} />
        <span>{formattedTime}</span>
      </div>

      <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1">
        <span className="text-[11px] font-semibold leading-tight whitespace-nowrap" style={{ color: C.emerald?.light || '#34D399' }}>
          {formattedGregorian}
        </span>
        <span className="text-[9.5px] font-medium leading-tight whitespace-nowrap" style={{ color: C.text?.muted || '#94A3B8' }}>
          {formattedHijri}
        </span>
      </div>

      {!isLifetime && (
        <button
          type="button"
          onClick={() => {
            setActiveTab('subscriptions');
            if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
            if (isMobile && typeof setSidebarOpen === 'function') setSidebarOpen(false);
          }}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-0 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shrink-0 shadow-[0_2px_8px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <Zap size={11} className="fill-slate-950 shrink-0" />
          <span>{translate('common.upgrade', isRtl ? 'ترقية' : 'Upgrade')}</span>
        </button>
      )}
    </div>
  );
}
