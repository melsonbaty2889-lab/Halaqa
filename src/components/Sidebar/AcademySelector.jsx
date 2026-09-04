import React from 'react';
import { ChevronDown, Check, Building2 } from 'lucide-react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';
import { colors as C } from '@/theme/colors';

export default function AcademySelector({
  academiesList = [],
  currentAcademyId,
  currentAcademyName,
  academyLogo,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  statusBadge,
  onSwitchAcademy,
  getText,
  isRtl
}) {
  return (
    <div ref={dropdownRef} className="relative w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الزر الرئيسي الموحد كارت واحد */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition-all duration-200 cursor-pointer text-start select-none group focus:outline-none focus:ring-1 focus:ring-slate-700"
      >
        {/* الحاوية الخاصة بالشعار */}
        <div className="w-9 h-9 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
          {academyLogo ? (
            <img
              src={academyLogo}
              alt={currentAcademyName}
              loading="eager"
              decoding="sync"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <SmartHalaqaProLogo size={24} />
          )}
        </div>

        {/* الاسم وشارة الحالة */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors truncate leading-snug">
            {currentAcademyName}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${statusBadge?.className || ''}`}
            >
              {getText(statusBadge?.text)}
            </span>
          </div>
        </div>

        {/* سهم القائمة المنسدلة */}
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* القائمة المنسدلة للتبديل بين الأكاديميات */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden divide-y divide-slate-800/40">
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
            {academiesList.map((acc) => {
              const isSelected = acc.id === currentAcademyId;
              const accName = getText(acc.name);
              const accLogo = acc.logo_url;

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    if (onSwitchAcademy) onSwitchAcademy(acc.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-emerald-950/40 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                    {accLogo ? (
                      <img src={accLogo} alt={accName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={13} className="text-emerald-400" />
                    )}
                  </div>

                  <span className="truncate flex-1 text-start">
                    {accName}
                  </span>

                  {isSelected && (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
