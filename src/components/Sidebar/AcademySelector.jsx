import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';

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
    <div ref={dropdownRef} className="relative w-full">
      {/* الزر الرئيسي الموحد لمنتقي الأكاديمية */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 cursor-pointer text-start group"
      >
        {/* الشعار */}
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0 flex items-center justify-center">
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
            <SmartHalaqaProLogo size={28} />
          )}
        </div>

        {/* الاسم والبادج */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors leading-tight">
            {currentAcademyName}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold ${statusBadge?.className || ''}`}
              style={statusBadge?.style}
            >
              {getText(statusBadge?.text)}
            </span>
          </div>
        </div>

        {/* سهم القائمة المنسدلة */}
        <ChevronDown
          size={15}
          className={`text-slate-400 group-hover:text-slate-200 shrink-0 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* قائمة خيارات الأكاديميات عند الفتح */}
      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60">
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
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700/50 shrink-0 flex items-center justify-center overflow-hidden">
                  {accLogo ? (
                    <img src={accLogo} alt={accName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400">
                      {accName ? accName[0] : 'أ'}
                    </span>
                  )}
                </div>

                <span dir="auto" className="truncate flex-1 text-start">
                  {accName}
                </span>

                {isSelected && (
                  <Check size={14} className="text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
