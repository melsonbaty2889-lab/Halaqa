// src/components/Sidebar/SidebarWidget.jsx
import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatHijriDate, toEngNums } from '@/utils/dateUtils';
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
  const translate = (key, fallback) => {
    if (typeof t === 'function') return t(key, fallback);
    return fallback;
  };

  let formattedHijri = formatHijriDate(new Date(), isRtl ? 'ar' : 'en');
  
  if (!isRtl && formattedHijri) {
    formattedHijri = formattedHijri
      .replace("Rabi' al-Awwal", "Rabi I")
      .replace("Rabi' al-Thani", "Rabi II")
      .replace("Jumada al-Awwal", "Jumada I")
      .replace("Jumada al-Thani", "Jumada II")
      .replace("Dhu al-Qi'dah", "Dhu al-Q")
      .replace("Dhu al-Hijjah", "Dhu al-H");
  }

  const rawGregorian = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedGregorian = toEngNums(rawGregorian);
  const formattedTime = toEngNums(academyTime || '12:25 PM');
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
