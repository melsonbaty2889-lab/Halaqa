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
      {/* الزر الرئيسي لمنتقي الأكاديمية - تصميم زجاجي عالي الجودة */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all duration-200 cursor-pointer text-start group select-none"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${C.dark.border || 'rgba(255, 255, 255, 0.08)'}`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        {/* الشعار برابط متناسق وحواف احترافية */}
        <div 
          className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: `1px solid ${C.dark.border || 'rgba(255, 255, 255, 0.1)'}`
          }}
        >
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
            <SmartHalaqaProLogo size={26} />
          )}
        </div>

        {/* معلومات الأكاديمية والحالة */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h2 
              className="text-xs font-bold truncate transition-colors leading-snug"
              style={{ color: C.text.primary || '#f8fafc' }}
            >
              {currentAcademyName}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide ${statusBadge?.className || ''}`}
              style={{
                ...statusBadge?.style,
                lineHeight: 1
              }}
            >
              {getText(statusBadge?.text)}
            </span>
          </div>
        </div>

        {/* سهم التنسديل مع دوران ناعم */}
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-300 ${
            dropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* القائمة المنسدلة بتصميم العصر الحادي والعشرين */}
      {dropdownOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${C.dark.border || 'rgba(255, 255, 255, 0.1)'}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
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
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700/50 shrink-0 flex items-center justify-center overflow-hidden">
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
