// src/components/Header/ProfileMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, LogOut } from 'lucide-react';

export default function ProfileMenu({
  showMenu = false,
  onToggle = () => {},
  userName = '',
  userRole = '',
  onLogout,
  activeRtl = true
}) {
  const { t } = useTranslation();

  const getDisplayName = () => {
    if (userName && typeof userName === 'string' && userName.trim() !== '') {
      return userName.trim();
    }
    return t('header.defaultUser', 'الحساب الشخصي');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="p-1.5 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
        title={t('header.profileTitle', 'حساب المستخدم')}
      >
        <div className="w-6 h-6 rounded-lg bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] flex items-center justify-center font-bold">
          <UserCheck size={14} />
        </div>
      </button>

      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-56 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs ${
            activeRtl ? 'left-0' : 'right-0'
          }`}
          style={{ backgroundColor: 'var(--surface-card)', opacity: 1 }}
        >
          <div className="p-2 border-b border-[var(--border-card)] mb-1">
            <div className="font-extrabold text-[var(--text-main)] text-[13px] truncate">
              {getDisplayName()}
            </div>
            {userRole && (
              <div className="text-[var(--text-sub)] text-[11px] mt-0.5 truncate font-medium">
                {userRole}
              </div>
            )}
            <div className="text-[var(--emerald-text)] text-[10px] mt-1.5 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--emerald-text)] inline-block shadow-[0_0_6px_var(--emerald-text)]" />
              <span>{t('header.activeSession', 'اتصال مباشر')}</span>
            </div>
          </div>

          <div className="space-y-1">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onToggle();
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-all font-medium text-right ltr:text-left cursor-pointer"
              >
                <LogOut size={14} className="shrink-0" />
                <span>{t('header.logout', 'تسجيل الخروج')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
