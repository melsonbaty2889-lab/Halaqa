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
      {/* الزر الرئيسي */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer text-start select-none group focus:outline-none"
        style={{
          backgroundColor: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
          borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {/* الشعار */}
        <div 
          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: C.dark?.surface || '#0A0F1C',
            borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
            borderWidth: '1px',
            borderStyle: 'solid'
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
            <SmartHalaqaProLogo size={24} />
          )}
        </div>

        {/* الاسم وشارة الحالة */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 
            className="text-xs font-bold truncate leading-snug transition-colors"
            style={{ color: C.text?.title || '#FFFFFF' }}
          >
            {currentAcademyName}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold leading-none"
              style={statusBadge?.style || {
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: C.emerald?.light || '#34D399',
                border: `1px solid ${C.brandEmerald?.border || '#0D5C4D'}`
              }}
            >
              {getText(statusBadge?.text)}
            </span>
          </div>
        </div>

        {/* سهم القائمة المنسدلة */}
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          style={{ color: dropdownOpen ? (C.emerald?.light || '#34D399') : (C.text?.muted || '#94A3B8') }}
        />
      </button>

      {/* القائمة المنسدلة */}
      {dropdownOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          style={{
            backgroundColor: C.dark?.surface || '#0A0F1C',
            borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
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
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors duration-150"
                  style={{
                    backgroundColor: isSelected 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : 'transparent',
                    color: isSelected 
                      ? (C.emerald?.light || '#34D399') 
                      : (C.text?.body || '#E2E8F0'),
                    fontWeight: isSelected ? '700' : '500'
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: C.dark?.bg || '#070B11',
                      borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    {accLogo ? (
                      <img src={accLogo} alt={accName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={13} style={{ color: C.emerald?.light || '#34D399' }} />
                    )}
                  </div>

                  <span className="truncate flex-1 text-start">
                    {accName}
                  </span>

                  {isSelected && (
                    <Check size={14} className="shrink-0" style={{ color: C.emerald?.light || '#34D399' }} />
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
