import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Building2, Plus, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';
import { colors as C } from '@/theme/colors';

export default function AcademySelector({
  academiesList = [],
  currentAcademy, // يمكن تمرير كائن الأكاديمية بالكامل من Supabase
  currentAcademyId,
  currentAcademyName,
  academyLogo,
  trialEndsAt, // تاريخ انتهاء الاشتراك/التجربة من السحابة
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onSwitchAcademy,
  onOpenCreateAcademy,
  getText
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // استخراج البيانات في حال تمرير كائن الأكاديمية مباشرة
  const activeName = currentAcademyName || (currentAcademy?.name ? (typeof currentAcademy.name === 'object' ? currentAcademy.name[i18n.language] || currentAcademy.name.ar : currentAcademy.name) : '');
  const activeLogo = academyLogo || currentAcademy?.logo_url;
  const activeTrialExpiry = trialEndsAt || currentAcademy?.trial_ends_at;

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

  // حساب حالة الاشتراك تلقائياً
  const getSubStatus = () => {
    if (!activeTrialExpiry) return { type: 'lifetime' };

    const now = new Date();
    const expiry = new Date(activeTrialExpiry);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { type: 'expired' };
    } else if (diffDays <= 7) {
      return { type: 'expiring_soon', daysLeft: diffDays };
    } else {
      const formattedDate = expiry.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short'
      });
      return { type: 'active', expiryDate: formattedDate };
    }
  };

  const subStatus = getSubStatus();

  const renderSubscriptionBadge = () => {
    if (subStatus.type === 'lifetime') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
          style={{
            backgroundColor: C.badge?.activeBg || 'rgba(16, 185, 129, 0.1)',
            color: C.emerald?.light,
            border: `1px solid ${C.brandEmerald?.border || C.emerald?.light}`
          }}
        >
          <Sparkles size={10} className="shrink-0" />
          <span>{t('sidebar.badgeLifetime', 'خطة مدى الحياة ∞')}</span>
        </span>
      );
    }

    if (subStatus.type === 'expiring_soon') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
          style={{
            backgroundColor: C.warning?.bg || 'rgba(245, 158, 11, 0.1)',
            color: C.warning?.text || C.amber?.light,
            border: `1px solid ${C.warning?.border || C.amber?.light}`
          }}
        >
          <AlertTriangle size={10} className="shrink-0" />
          <span>
            {t('sidebar.badgeExpiringSoon', 'ينتهي خلال {{days}} أيام', { days: subStatus.daysLeft })}
          </span>
        </span>
      );
    }

    if (subStatus.type === 'expired') {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
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

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium tracking-wide"
        style={{
          backgroundColor: C.badge?.activeBg || 'rgba(16, 185, 129, 0.1)',
          color: C.emerald?.light,
          border: `1px solid ${C.brandEmerald?.border || C.emerald?.light}`
        }}
      >
        <Clock size={10} className="shrink-0" />
        <span>
          {t('sidebar.badgeActiveUntil', 'تجربة • تنتهي {{date}}', { date: subStatus.expiryDate })}
        </span>
      </span>
    );
  };

  return (
    <div ref={dropdownRef} className="relative w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        type="button"
        disabled={!hasMultipleAcademies}
        onClick={() => hasMultipleAcademies && setDropdownOpen(!dropdownOpen)}
        aria-label={activeName || t('sidebar.academyLogo', 'شعار الأكاديمية')}
        className={`w-full flex items-center justify-between p-3 min-h-[62px] rounded-2xl backdrop-blur-md transition-all duration-200 select-none group focus:outline-none ${
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
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* إطار الشعار */}
          <div 
            className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden p-0.5 transition-all duration-200 group-hover:scale-105"
            style={{
              backgroundColor: C.dark?.surface,
              borderColor: C.dark?.cardBorder,
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            {activeLogo ? (
              <img
                src={activeLogo}
                alt={activeName || ''}
                loading="eager"
                decoding="sync"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <SmartHalaqaProLogo size={24} />
            )}
          </div>

          {/* تفاصيل الاسم والحالة الديناميكية */}
          <div className="flex flex-col text-start min-w-0 flex-1 justify-center gap-1">
            <h2 
              className="text-sm font-bold truncate leading-tight transition-colors"
              style={{ color: C.text?.title }}
            >
              {activeName || t('sidebar.unnamedAcademy', 'أكاديمية بدون اسم')}
            </h2>

            <div className="flex items-center">
              {renderSubscriptionBadge()}
            </div>
          </div>
        </div>

        {hasMultipleAcademies && (
          <ChevronDown
            size={18}
            className={`shrink-0 ms-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            style={{ color: dropdownOpen ? C.emerald?.light : C.text?.muted }}
          />
        )}
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
