// src/components/Header/ProfileMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, LogOut, ShieldCheck, GraduationCap, HeartHandshake, User } from 'lucide-react';

export default function ProfileMenu({
  showMenu = false,
  onToggle = () => {},
  userName = '',
  userRole = 'admin',
  onLogout,
  activeRtl = true
}) {
  const { t } = useTranslation();

  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return {
          label: t('roles.admin', 'مدير النظام'),
          icon: ShieldCheck,
          colorClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        };
      case 'teacher':
        return {
          label: t('roles.teacher', 'معلم / محفظ'),
          icon: User,
          colorClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
      case 'student':
        return {
          label: t('roles.student', 'طالب'),
          icon: GraduationCap,
          colorClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        };
      case 'parent':
        return {
          label: t('roles.parent', 'ولي أمر'),
          icon: HeartHandshake,
          colorClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        };
      default:
        return {
          label: t('roles.user', 'مستخدم'),
          icon: User,
          colorClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        };
    }
  };

  const roleConfig = getRoleConfig(userRole);
  const RoleIcon = roleConfig.icon;

  const displayName = userName && typeof userName === 'string' && userName.trim() !== ''
    ? userName.trim()
    : t('header.defaultUser', 'الحساب الشخصي');

  return (
    <div className="relative inline-block">
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
          className={`absolute top-full mt-2 w-56 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-3 text-xs ${
            activeRtl ? 'left-0' : 'right-0'
          }`}
          style={{ 
            backgroundColor: 'var(--surface-card)', 
            opacity: 1,
            maxWidth: 'calc(100vw - 24px)'
          }}
        >
          {/* معلومات المستخدم والدور */}
          <div className="pb-2.5 border-b border-[var(--border-card)] mb-2 flex flex-col items-start gap-1">
            <div className="font-extrabold text-[var(--text-main)] text-[13px] truncate w-full">
              {displayName}
            </div>
            
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${roleConfig.colorClass}`}>
              <RoleIcon size={12} />
              <span>{roleConfig.label}</span>
            </div>

            <div className="text-[var(--emerald-text)] text-[10px] mt-1 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--emerald-text)] inline-block shadow-[0_0_6px_var(--emerald-text)]" />
              <span>{t('header.activeSession', 'جلسة نشطة')}</span>
            </div>
          </div>

          {/* زر تسجيل الخروج */}
          <div>
            <button
              type="button"
              onClick={() => {
                onToggle();
                if (typeof onLogout === 'function') onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-all font-medium text-right ltr:text-left cursor-pointer"
            >
              <LogOut size={14} className="shrink-0" />
              <span>{t('header.logout', 'تسجيل الخروج')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
