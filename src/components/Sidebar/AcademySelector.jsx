import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function AcademySelector({
  academiesList,
  currentAcademyId,
  currentAcademyName,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  statusBadge,
  onSwitchAcademy,
  getText,
  isRtl
}) {
  return (
    <div ref={dropdownRef} className="mb-3 relative">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-300 font-semibold">
          {isRtl ? 'الأكاديمية' : 'Academy'}
        </span>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusBadge?.className || ''}`}
          style={statusBadge?.style}
        >
          {getText(statusBadge?.text)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-100 flex items-center justify-between cursor-pointer text-xs font-semibold hover:border-slate-700 transition-all duration-200"
      >
        <span dir="auto" className="truncate">
          {currentAcademyName}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/50">
          {academiesList.map((acc) => {
            const isSelected = acc.id === currentAcademyId;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  if (onSwitchAcademy) onSwitchAcademy(acc.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 border-0 text-xs cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? 'bg-emerald-950/40 text-emerald-400 font-bold'
                    : 'bg-transparent text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span dir="auto" className="truncate">{getText(acc.name)}</span>
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className="accent-emerald-500 cursor-pointer"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
