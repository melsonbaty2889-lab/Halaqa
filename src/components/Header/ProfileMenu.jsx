// src/components/Header/ProfileMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Settings, LogOut } from 'lucide-react';

export default function ProfileMenu({
  showMenu = false,
  onToggle = () => {},
  academyName = '',
  setActiveTab,
  onLogout,
  activeRtl = true
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';

  // معالجة اسم الأكاديمية في حال كان كائناً يحتوي على لغات متعدّدة أو نصاً عادياً
  const getDisplayAcademyName = () => {
    if (!academyName) return t('header.academyOwner', 'صاحب الأكاديمية');
    if (typeof academyName === 'object') {
      return academyName[currentLang] || academyName.ar || academyName.en || t('header.academyOwner', 'صاحب الأكاديمية');
    }
    return academyName;
  };

  return (
    <div className="relative">
      {/* زر البروفايل */}
      <button
        type="button"
        onClick={onToggle}
        className="p-1.5 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-sm"
      >
        <div className="w-6 h-6 rounded-lg bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] flex items-center justify-center font-bold">
          <UserCheck size={14} />
        </div>
      </button>

      {/* قائمة البروفايل المنسدلة */}
      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-56 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs ${activeRtl ? 'left-0' : 'right-0'}`}
          style={{ backgroundColor: 'var(--surface-card)', opacity: 1 }}
        >
          <div className="p-2 border-b border-[var(--border-card)] mb-1">
            <div className="font-extrabold text-[var(--text-main)] text-[13px] truncate">
              {getDisplayAcademyName()}
            </div>
            <div className="text-[var(--emerald-text)] text-[10px] mt-1 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--emerald-text)] inline-block shadow-[0_0_6px_var(--emerald-text)]" />
              <span>{t('header.activeSession', 'جلسة نشطة')}</span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (setActiveTab) setActiveTab('settings');
                onToggle();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--surface-input)] transition-all font-medium text-right"
            >
              <Settings size={14} className="text-[var(--primary)]" />
              <span>{t('header.settings', 'إعدادات المنظومة')}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onToggle();
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-all font-medium text-right"
              >
                <LogOut size={14} />
                <span>{t('header.logout', 'تسجيل الخروج')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
