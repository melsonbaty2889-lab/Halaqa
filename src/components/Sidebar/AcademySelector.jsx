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
      {/* الكارت الرئيسي الموحد */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer select-none group focus:outline-none"
        style={{
          backgroundColor: C.dark?.card || 'rgba(15, 23, 42, 0.85)',
          borderColor: dropdownOpen ? (C.emerald?.light || '#34D399') : (C.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'),
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: dropdownOpen ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none'
        }}
      >
        {/* الجزء الأيمن (الشعار + الاسم والحالة) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* حاوية الشعار */}
          <div 
            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: C.dark?.surface || '#0A0F1C',
              borderColor: 'rgba(255, 255, 255, 0.12)',
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
              <SmartHalaqaProLogo size={22} />
            )}
          </div>

          {/* الاسم وشارة الحالة */}
          <div className="flex flex-col text-start min-w-0 flex-1 justify-center gap-1">
            <h2 
              className="text-xs font-bold truncate leading-none transition-colors"
              style={{ color: C.text?.title || '#FFFFFF' }}
            >
              {currentAcademyName}
            </h2>

            <div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-medium leading-none tracking-wide"
                style={statusBadge?.style || {
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: C.emerald?.light || '#34D399',
                  border: `1px solid ${C.brandEmerald?.border || '#0D5C4D'}`
                }}
              >
                {getText(statusBadge?.text)}
              </span>
            </div>
          </div>
        </div>

        {/* الجزء الأيسر (أيقونة السهم) */}
        <div 
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ml-1"
          style={{
            backgroundColor: dropdownOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            style={{ color: dropdownOpen ? (C.emerald?.light || '#34D399') : (C.text?.muted || '#94A3B8') }}
          />
        </div>
      </button>

      {/* القائمة المنسدلة للتبديل بين الأكاديميات */}
      {dropdownOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
          style={{
            backgroundColor: C.dark?.surface || '#0A0F1C',
            borderColor: C.dark?.cardBorder || 'rgba(255, 255, 255, 0.12)',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
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
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 group"
                  style={{
                    backgroundColor: isSelected 
                      ? 'rgba(16, 185, 129, 0.12)' 
                      : 'transparent',
                    color: isSelected 
                      ? (C.emerald?.light || '#34D399') 
                      : (C.text?.body || '#E2E8F0')
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: C.dark?.bg || '#070B11',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {accLogo ? (
                        <img src={accLogo} alt={accName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={12} style={{ color: C.emerald?.light || '#34D399' }} />
                      )}
                    </div>

                    <span className="truncate text-start font-medium">
                      {accName}
                    </span>
                  </div>

                  {isSelected && (
                    <Check size={14} className="shrink-0 ml-1" style={{ color: C.emerald?.light || '#34D399' }} />
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
