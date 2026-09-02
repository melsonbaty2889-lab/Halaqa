// src/components/Sidebar/SidebarWidget.jsx
import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatHijriDate, toEngNums } from '../../utils/dateUtils';

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

  // جلب التاريخ الهجري
  let formattedHijri = formatHijriDate(new Date(), isRtl ? 'ar' : 'en');
  
  // 🟢 اختصار اسم الشهر في اللغة الإنجليزية لمنع الانقطاع النهائي
  if (!isRtl && formattedHijri) {
    formattedHijri = formattedHijri
      .replace("Rabi' al-Awwal", "Rabi I")
      .replace("Rabi' al-Thani", "Rabi II")
      .replace("Jumada al-Awwal", "Jumada I")
      .replace("Jumada al-Thani", "Jumada II")
      .replace("Dhu al-Qi'dah", "Dhu al-Q")
      .replace("Dhu al-Hijjah", "Dhu al-H");
  }

  // التاريخ الميلادي
  const rawGregorian = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedGregorian = toEngNums(rawGregorian);

  // الوقت
  const formattedTime = toEngNums(academyTime || '12:25 PM');

  const isLifetime = effectiveDaysLeft === Infinity;

  return (
    <div className="bg-[var(--surface-card,rgba(15,23,42,0.85))] backdrop-blur-md p-2 rounded-xl mb-3 border border-[var(--border-card,rgba(255,255,255,0.08))] flex items-center justify-between gap-1.5 shadow-sm">
      
      {/* الوقت */}
      <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold font-mono shrink-0 dir-ltr">
        <Clock size={13} className="text-emerald-400 shrink-0" />
        <span>{formattedTime}</span>
      </div>

      {/* التواريخ - إزالة truncate والسماح بالنصوص بالتكيّف */}
      <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1">
        <span className="text-[11px] text-emerald-300 font-semibold leading-tight whitespace-nowrap">
          {formattedGregorian}
        </span>
        <span className="text-[9.5px] text-slate-400 font-medium leading-tight whitespace-nowrap">
          {formattedHijri}
        </span>
      </div>

      {/* زر الترقية */}
      {!isLifetime && (
        <button
          type="button"
          onClick={() => {
            setActiveTab('subscriptions');
            if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
            if (isMobile && typeof setSidebarOpen === 'function') setSidebarOpen(false);
          }}
          className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-0 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shrink-0 shadow-[0_2px_8px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <Zap size={11} className="fill-slate-950 shrink-0" />
          <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
        </button>
      )}
    </div>
  );
}
