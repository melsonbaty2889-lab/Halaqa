import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Building2, Plus, Sparkles, Clock, AlertTriangle } from 'lucide-react';
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
  subscriptionType = 'lifetime', // 'lifetime' | 'active' | 'expiring_soon' | 'expired'
  expiryDate, // مثال: '2026-10-12' أو عدد الأيام المتبقية
  daysLeft,
  onSwitchAcademy,
  onOpenCreateAcademy,
  getText
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

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

  // تحديد مظهر ونشاط الشارة بناءً على حالة الاشتراك
  const renderSubscriptionBadge = () => {
    if (subscriptionType === 'lifetime') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide"
          style={{
            backgroundColor: C.badge?.activeBg || 'rgba(16, 185, 129, 0.1)',
            color: C.emerald?.light,
            border: `1px solid ${C.brandEmerald?.border || C.emerald?.light}`
          }}
        >
          <Sparkles size={11} className="shrink-0" />
          <span>{t('sidebar.badgeLifetime', 'خطة مدى الحياة ∞')}</span>
        </span>
      );
    }

    if (subscriptionType === 'expiring_soon') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide"
          style={{
            backgroundColor: C.warning?.bg || 'rgba(245, 158, 11, 0.1)',
            color: C.warning?.text || C.amber?.light,
            border: `1px solid ${C.warning?.border || C.amber?.light}`
          }}
        >
          <AlertTriangle size={11} className="shrink-0" />
          <span>
            {t('sidebar.badgeExpiringSoon', 'ينتهي خلال {{days}} أيام', { days: daysLeft || 3 })}
          </span>
        </span>
      );
    }

    if (subscriptionType === 'expired') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide"
          style={{
            backgroundColor: C.error?.bg || 'rgba(239, 68, 68, 0.1)',
            color: C.error?.text || C.rose?.light,
            border: `1px solid ${C.error?.border || C.rose?.light}`
          }}
        >
          <span>{t('sidebar.badgeExpired', 'باقة منتهية')}</span>
        </span>
      );
    }

    // افتراضي: نشط ومحدد بتاريخ
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide"
        style={{
          backgroundColor: C.badge?.activeBg || 'rgba(16, 185, 129, 0.1)',
          color: C.text?.body,
          border: `1px solid ${C.dark?.cardBorder}`
        }}
      >
        <Clock size={11} className="shrink-0" style={{ color: C.emerald?.light }} />
        <span>
          {t('sidebar.badgeActiveUntil', 'نشط • ينتهي {{date}}', { date: expiryDate || '' })}
        </span>
      </span>
    );
  };

  return (
    <div ref={dropdownRef} className="relative w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* كارت الأكاديمية الرئيسي */}
      <button
        type="button"
        disabled={!hasMultipleAcademies}
        onClick={() => hasMultipleAcademies && setDropdownOpen(!dropdownOpen)}
        aria-label={currentAcademyName || t('sidebar.academyLogo', 'شعار الأكاديمية')}
        className={`w-full flex items-center justify-between p-3 min-h-[64px] rounded-2xl backdrop-blur-md transition-all duration-200 select-none group focus:outline-none ${
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
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* إطار اللوجو الأنيق */}
          <div 
            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden p-1 transition-all duration-200 group-hover:scale-105"
            style={{
              backgroundColor: C.dark?.surface,
              borderColor: C.dark?.cardBorder,
              borderWidth: '1px',
              borderStyle: 'solid',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
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
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <SmartHalaqaProLogo size={26} />
            )}
          </div>

          {/* تفاصيل الاسم والحالة */}
          <div className="flex flex-col text-start min-w-0 flex-1 justify-center gap-1.5">
            <h2 
              className="text-base font-bold truncate leading-tight transition-colors"
              style={{ color: C.text?.title }}
            >
              {currentAcademyName || t('sidebar.unnamedAcademy', 'أكاديمية بدون اسم')}
            </h2>

            <div className="flex items-center">
              {renderSubscriptionBadge()}
            </div>
          </div>
        </div>

        {/* سهم التبديل */}
        {hasMultipleAcademies && (
          <ChevronDown
            size={18}
            className={`shrink-0 ms-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            style={{ color: dropdownOpen ? C.emerald?.light : C.text?.muted }}
          />
        )}
      </button>

      {/* القائمة المنسدلة للتبديل بين الأكاديميات */}
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-150 group"
                  style={{
                    backgroundColor: isSelected ? C.badge?.activeBg : 'transparent',
                    color: isSelected ? C.emerald?.light : C.text?.body
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                      className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center overflow-hidden p-0.5"
                      style={{
                        backgroundColor: C.dark?.bg,
                        borderColor: C.dark?.cardBorder,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {accLogo ? (
                        <img src={accLogo} alt={accName} className="w-full h-full object-contain rounded" />
                      ) : (
                        <Building2 size={14} style={{ color: C.emerald?.light }} />
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
