// src/components/Sidebar/AcademySelector.jsx
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Building2, Plus, X, Clock } from 'lucide-react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';

export default function AcademySelector({
  academiesList = [],
  currentAcademy,
  currentAcademyId,
  currentAcademyName,
  academyLogo,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  statusBadge,
  effectiveDaysLeft = 0,
  onSwitchAcademy,
  onOpenCreateAcademy,
  onClose,
  getText,
  dropDirection = 'down'
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const resolveText = useCallback((textObj) => {
    if (typeof getText === 'function') {
      const res = getText(textObj);
      if (res) return res;
    }
    if (typeof textObj === 'string') return textObj;
    if (textObj && typeof textObj === 'object') {
      return textObj[i18n.language] || textObj.ar || textObj.en || '';
    }
    return '';
  }, [getText, i18n.language]);

  const activeName = useMemo(() => {
    if (currentAcademyName) return currentAcademyName;
    if (currentAcademy?.name) return resolveText(currentAcademy.name);
    return '';
  }, [currentAcademyName, currentAcademy?.name, resolveText]);

  const activeLogo = academyLogo || currentAcademy?.logo_url;

  const hasMultipleAcademies = academiesList.length > 1;
  const canOpenDropdown = hasMultipleAcademies || Boolean(onOpenCreateAcademy);

  // استخراج تاريخ انتهاء الاشتراك أو الفترة التجريبية
  const formattedExpiryDate = useMemo(() => {
    const rawDate = currentAcademy?.saas_subscription?.expires_at || currentAcademy?.trial_ends_at;
    if (!rawDate) return null;
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  }, [currentAcademy, i18n.language]);

  // عرض شارة الاشتراك وعداد الأيام المتبقية
  const renderSubscriptionBadge = () => {
    return (
      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
        {statusBadge ? (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide"
            style={statusBadge.style}
          >
            {statusBadge.text}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-semantic-surfaceSecondary text-semantic-textMuted border border-semantic-borderCard">
            {t('sidebar.badgeActive', 'اشتراك المنظومة')}
          </span>
        )}

        {/* عرض عداد الأيام التجريبية المتبقية */}
        {effectiveDaysLeft > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20">
            <Clock size={11} />
            <span>{t('sidebar.daysLeft', 'متبقي {{days}} يوم', { days: effectiveDaysLeft })}</span>
          </span>
        )}
      </div>
    );
  };

  const dropdownPositionClasses = dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div ref={dropdownRef} className="relative w-full flex items-center gap-2" dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        type="button"
        disabled={!canOpenDropdown}
        onClick={() => canOpenDropdown && setDropdownOpen(!dropdownOpen)}
        aria-label={activeName || t('sidebar.academyLogo', 'شعار الأكاديمية')}
        className={`w-full flex items-center justify-between p-3 min-h-[72px] rounded-2xl bg-semantic-surfaceCard border transition-all duration-200 select-none group focus:outline-none ${
          dropdownOpen 
            ? 'border-semantic-success ring-1 ring-semantic-success/20 shadow-[0_0_15px_var(--color-shadow-glow)]' 
            : 'border-semantic-borderCard hover:border-semantic-borderHover'
        } ${canOpenDropdown ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* تم تكبير مقاس الحاوية والشعار من w-11 h-11 إلى w-14 h-14 */}
          <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden bg-semantic-surfaceInput border border-semantic-borderCard transition-transform duration-200 group-hover:scale-105 shadow-sm">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt={activeName || ''}
                loading="eager"
                decoding="sync"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <SmartHalaqaProLogo size={34} />
            )}
          </div>

          <div className="flex flex-col text-start min-w-0 flex-1 justify-center gap-0.5">
            <h2 className="text-base font-bold truncate leading-tight text-semantic-textPrimary transition-colors">
              {activeName || t('sidebar.unnamedAcademy', 'أكاديمية بدون اسم')}
            </h2>

            {renderSubscriptionBadge()}

            {/* عرض تاريخ الانتهاء بنص مصغر عند وجوده */}
            {formattedExpiryDate && (
              <span className="text-[10px] text-semantic-textMuted mt-0.5 truncate">
                {t('sidebar.expiresOn', 'ينتهي في:')} {formattedExpiryDate}
              </span>
            )}
          </div>
        </div>

        {canOpenDropdown && (
          <ChevronDown
            size={18}
            className={`shrink-0 ms-2 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-semantic-success' : 'text-semantic-textMuted'
            }`}
          />
        )}
      </button>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close', 'إغلاق')}
          className="md:hidden flex items-center justify-center w-12 h-12 min-h-[48px] rounded-2xl border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textSecondary hover:text-semantic-textPrimary shrink-0 transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>
      )}

      {dropdownOpen && canOpenDropdown && (
        <div className={`absolute ${dropdownPositionClasses} inset-x-0 p-1.5 rounded-xl bg-semantic-surfaceCard border border-semantic-borderCard shadow-main backdrop-blur-2xl z-50 overflow-hidden`}>
          {hasMultipleAcademies && (
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-xs cursor-pointer transition-all duration-150 group ${
                      isSelected
                        ? 'bg-semantic-successBg text-semantic-success font-bold'
                        : 'text-semantic-textSecondary hover:bg-semantic-surfaceHover hover:text-semantic-textPrimary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center overflow-hidden p-0.5 bg-semantic-surfaceInput border border-semantic-borderCard">
                        {accLogo ? (
                          <img src={accLogo} alt={accName} className="w-full h-full object-cover rounded" />
                        ) : (
                          <Building2 size={16} className="text-semantic-success" />
                        )}
                      </div>

                      <span className="truncate text-start font-medium">
                        {accName}
                      </span>
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 ms-1 text-semantic-success" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {onOpenCreateAcademy && (
            <div className={`${hasMultipleAcademies ? 'pt-1 mt-1 border-t border-semantic-borderCard' : ''}`}>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenCreateAcademy();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 min-h-[44px] rounded-lg text-xs font-medium text-semantic-success hover:bg-semantic-successBg/50 transition-colors cursor-pointer"
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
