import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Building2, Plus } from 'lucide-react';
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
  onOpenCreateAcademy,
  getText
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // دالة مساعدة لفك ترجمة النصوص الديناميكية
  const resolveText = (textObj) => {
    if (typeof getText === 'function') {
      const res = getText(textObj);
      if (res) return res;
    }
    if (typeof textObj === 'string') return textObj;
    if (textObj && typeof textObj === 'object') {
      return textObj[i18n.language] || textObj.ar || textObj.en || '';
    }
    return '';
  };

  const hasMultipleAcademies = academiesList.length > 1;

  return (
    <div ref={dropdownRef} className="relative w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* زر تحديد الأكاديمية الحالية */}
      <button
        type="button"
        disabled={!hasMultipleAcademies}
        onClick={() => hasMultipleAcademies && setDropdownOpen(!dropdownOpen)}
        className={`w-full flex items-center justify-between p-2 rounded-xl backdrop-blur-md transition-all duration-200 select-none group focus:outline-none ${
          hasMultipleAcademies ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{
          backgroundColor: C.dark?.card,
          borderColor: dropdownOpen ? C.emerald?.light : C.dark?.cardBorder,
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: dropdownOpen ? C.shadows?.emeraldGlow : 'none'
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* شعار الأكاديمية */}
          <div 
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: C.dark?.surface,
              borderColor: C.dark?.cardBorder,
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            {academyLogo ? (
              <img
                src={academyLogo}
                alt={currentAcademyName || ''}
                loading="eager"
                decoding="sync"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <SmartHalaqaProLogo size={20} />
            )}
          </div>

          {/* اسم الأكاديمية والسهم وشارة الحالة */}
          <div className="flex flex-col text-start min-w-0 flex-1 justify-center gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 
                className="text-xs font-bold truncate leading-none transition-colors"
                style={{ color: C.text?.title }}
              >
                {currentAcademyName}
              </h2>

              {hasMultipleAcademies && (
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: dropdownOpen ? C.emerald?.light : C.text?.muted }}
                />
              )}
            </div>

            {statusBadge && (
              <div>
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium leading-none tracking-wide"
                  style={statusBadge?.style || {
                    backgroundColor: C.badge?.activeBg,
                    color: C.emerald?.light,
                    border: `1px solid ${C.brandEmerald?.border}`
                  }}
                >
                  {resolveText(statusBadge?.text)}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* القائمة المنسدلة */}
      {dropdownOpen && hasMultipleAcademies && (
        <div 
          className="absolute top-full inset-x-0 mt-2 p-1.5 rounded-xl backdrop-blur-2xl z-50 overflow-hidden"
          style={{
            backgroundColor: C.dark?.surface,
            borderColor: C.dark?.cardBorder,
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: C.shadows?.dropdown
          }}
        >
          <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
            {academiesList.map((acc) => {
              const isSelected = acc.id === currentAcademyId;
              const accName = resolveText(acc.name);
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
                    backgroundColor: isSelected ? C.badge?.activeBg : 'transparent',
                    color: isSelected ? C.emerald?.light : C.text?.body
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: C.dark?.bg,
                        borderColor: C.dark?.cardBorder,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {accLogo ? (
                        <img src={accLogo} alt={accName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={12} style={{ color: C.emerald?.light }} />
                      )}
                    </div>

                    <span className="truncate text-start font-medium">
                      {accName}
                    </span>
                  </div>

                  {isSelected && (
                    <Check size={14} className="shrink-0 ms-1" style={{ color: C.emerald?.light }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* خيار إنشاء أكاديمية جديدة */}
          {onOpenCreateAcademy && (
            <div className="pt-1 mt-1 border-t" style={{ borderColor: C.dark?.cardBorder }}>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCreateAcademy();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{ color: C.emerald?.light }}
              >
                <Plus size={14} />
                <span>{t('sidebar.createNewAcademy', 'إنشاء أكاديمية جديدة')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
