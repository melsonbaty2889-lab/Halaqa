// src/components/Sidebar/SidebarWidget.jsx
import React, { useMemo } from 'react';
import { Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatHijriDate, formatGregorianDate, formatTimeString, toArNums, toUrNums } from '@/utils/dateUtils';
import UI from '@/theme/styles';

export default function SidebarWidget({
  user,
  academyTime,
  setActiveTab,
  setShowEarlyUpgrade,
  isMobile,
  setSidebarOpen,
  isRtl,
  effectiveDaysLeft,
  preferredCalendar = 'gregorian',
  t: propsT
}) {
  const { t: hookT, i18n } = useTranslation();

  // استخدام دالة الترجمة الممررة أولاً، وإن لم توجد يُستخدم hookT
  const t = propsT || hookT;

  const currentLang = useMemo(() => {
    const rawLang = i18n?.language || (isRtl ? 'ar' : 'en');
    return rawLang.split('-')[0].toLowerCase();
  }, [i18n?.language, isRtl]);

  const isHijriPreferred = useMemo(() => {
    if (!preferredCalendar) return false;
    return String(preferredCalendar).trim().toLowerCase() === 'hijri';
  }, [preferredCalendar]);

  const { formattedTime, primaryDate, secondaryDate } = useMemo(() => {
    let timeStr = '';

    if (academyTime) {
      if (currentLang === 'ar') timeStr = toArNums(academyTime);
      else if (currentLang === 'ur') timeStr = toUrNums(academyTime);
      else timeStr = academyTime;
    } else {
      timeStr = formatTimeString(new Date(), currentLang);
    }

    const gregDate = formatGregorianDate(new Date(), currentLang);
    const hijriDate = formatHijriDate(new Date(), currentLang);

    return {
      formattedTime: timeStr,
      primaryDate: isHijriPreferred ? hijriDate : gregDate,
      secondaryDate: isHijriPreferred ? gregDate : hijriDate
    };
  }, [academyTime, currentLang, isHijriPreferred]);

  const isLifetime = effectiveDaysLeft === Infinity;

  const handleUpgradeClick = () => {
    if (typeof setActiveTab === 'function') setActiveTab('subscriptions');
    if (typeof setShowEarlyUpgrade === 'function') setShowEarlyUpgrade(false);
    if (isMobile && typeof setSidebarOpen === 'function') setSidebarOpen(false);
  };

  const userName = user?.user_metadata?.full_name || user?.name || user?.email || '';
  const userRole = user?.role_title || user?.role || t('user.role', 'مستخدم');

  return (
    <div className="flex flex-col gap-2.5 w-full mb-3 select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* كارت بيانات المستخدم */}
      {userName && (
        <div className={`${UI.cardGlass} p-3 flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-semantic-borderCard bg-semantic-surfaceInput flex items-center justify-center">
              {user?.user_metadata?.avatar_url || user?.avatar ? (
                <img
                  src={user?.user_metadata?.avatar_url || user?.avatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-semantic-textPrimary font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-semantic-textPrimary text-xs font-bold truncate">
                {userName}
              </span>
              {userRole && (
                <span className="text-semantic-textMuted text-[10.5px] font-medium truncate">
                  {userRole}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* كارت التوقيت والتاريخ والترقية */}
      <div className={`${UI.cardGlass} p-2.5 flex items-center justify-between gap-2`}>
        {/* الوقت والتاريخ */}
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div
            className="flex items-center gap-1.5 text-[11.5px] font-bold text-semantic-success"
            title={t('common.currentTime', 'الوقت الحالي')}
          >
            <Clock size={12} className="shrink-0 text-semantic-success" aria-hidden="true" />
            <span dir="auto" className="truncate">{formattedTime}</span>
          </div>
          <span dir="auto" className="text-[11px] font-bold leading-tight whitespace-nowrap text-semantic-textSecondary truncate">
            {primaryDate}
          </span>
          <span dir="auto" className="text-[9.5px] font-medium leading-tight whitespace-nowrap text-semantic-textMuted truncate">
            {secondaryDate}
          </span>
        </div>

        {/* زر الترقية */}
        {!isLifetime && (
          <button
            type="button"
            onClick={handleUpgradeClick}
            aria-label={t('common.upgradeAccount', 'ترقية الحساب')}
            className="px-2.5 py-1.5 bg-gradient-to-r from-primary-btnStart to-primary-btnEnd text-semantic-textPrimary border-0 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Zap size={11} className="fill-current shrink-0 text-semantic-textPrimary" aria-hidden="true" />
            <span>{t('common.upgrade', 'ترقية')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
