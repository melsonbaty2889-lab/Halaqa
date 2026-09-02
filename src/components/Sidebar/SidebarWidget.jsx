// src/components/Sidebar/SidebarWidget.jsx
import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatHijriDate } from '@/utils/dateUtils';

export default function SidebarWidget({
  academyTime,
  hijri,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl,
  effectiveDaysLeft
}) {
  const formattedHijri = formatHijriDate(new Date(), isRtl ? 'ar' : 'en');
  const formattedGregorian = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  // إخفاء زر الترقية إذا كان الاشتراك حسام دائم (Infinity)
  const isLifetime = effectiveDaysLeft === Infinity;

  return (
    <div className="bg-[var(--surface-card,rgba(15,23,42,0.85))] backdrop-blur-md p-2.5 rounded-xl mb-3 border border-[var(--border-card,rgba(255,255,255,0.08))] flex items-center justify-between gap-2 shadow-sm">
      
      {/* الوقت بتنسيق رقمي زمردي مضيء */}
      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono shrink-0">
        <Clock size={14} className="text-emerald-400 shrink-0" />
        <span>{academyTime || '12:24 PM'}</span>
      </div>

      {/* التواريخ (ميلادي وهجري) منظمة رأسياً لتفادي تداخل النصوص */}
      <div className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 overflow-hidden">
        <span className="text-[11px] text-emerald-300 font-semibold whitespace-nowrap leading-tight truncate">
          {formattedGregorian}
        </span>
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap leading-tight truncate">
          {formattedHijri}
        </span>
      </div>

      {/* زر ترقية الذهبي المضيء (يظهر فقط إذا لم يكن الحساب دائماً) */}
      {!isLifetime && (
        <button
          type="button"
          onClick={() => {
            setActiveTab('subscriptions');
            if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
            if (isMobile) setSidebarOpen(false);
          }}
          className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-0 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0 shadow-[0_2px_10px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <Zap size={12} className="fill-slate-950 shrink-0" />
          <span>{isRtl ? 'ترقية' : 'Upgrade'}</span>
        </button>
      )}
    </div>
  );
}
