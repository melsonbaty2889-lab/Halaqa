// src/components/Header/ProfileMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, LogOut, ShieldCheck, GraduationCap, HeartHandshake, User, Mail } from 'lucide-react';

export default function ProfileMenu({
  showMenu = false,
  onToggle = () => {},
  userName = '',
  userEmail = '',
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
          label: t('roles.admin', activeRtl ? 'مدير النظام' : 'System Admin'),
          icon: ShieldCheck,
          colorClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        };
      case 'teacher':
        return {
          label: t('roles.teacher', activeRtl ? 'معلم / محفظ' : 'Teacher'),
          icon: User,
          colorClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
      case 'student':
        return {
          label: t('roles.student', activeRtl ? 'طالب' : 'Student'),
          icon: GraduationCap,
          colorClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        };
      case 'parent':
        return {
          label: t('roles.parent', activeRtl ? 'ولي أمر' : 'Parent'),
          icon: HeartHandshake,
          colorClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        };
      default:
        return {
          label: t('roles.user', activeRtl ? 'مستخدم' : 'User'),
          icon: User,
          colorClass: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        };
    }
  };

  const roleConfig = getRoleConfig(userRole);
  const RoleIcon = roleConfig.icon;

  const displayName = userName && typeof userName === 'string' && userName.trim() !== ''
    ? userName.trim()
    : t('header.defaultUser', activeRtl ? 'الحساب الشخصي' : 'Personal Profile');

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className="p-1.5 bg-[var(--surface-input)] hover:bg-[var(--border-hover)] border border-[var(--border-input)] rounded-xl transition-all flex items-center justify-center active:scale-95 shadow-sm cursor-pointer"
        title={t('header.profileTitle', activeRtl ? 'حساب المستخدم' : 'User Account')}
      >
        <div className="w-6 h-6 rounded-lg bg-[var(--emerald-bg)] text-[var(--emerald-text)] border border-[var(--emerald-border)] flex items-center justify-center font-bold">
          <UserCheck size={14} />
        </div>
      </button>

      {showMenu && (
        <div 
          className={`absolute top-full mt-2 w-56 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs backdrop-blur-md bg-[var(--surface-card)] ${
            activeRtl ? 'left-0 text-right' : 'right-0 text-left'
          }`}
          style={{ 
            maxWidth: 'calc(100vw - 24px)'
          }}
          dir={activeRtl ? 'rtl' : 'ltr'}
        >
          {/* معلومات المستخدم والدور والبريد */}
          <div className="pb-2 border-b border-[var(--border-card)] mb-2 flex flex-col items-start gap-1">
            <div className="font-extrabold text-[var(--text-main)] text-[12px] truncate w-full">
              {displayName}
            </div>

            {userEmail && (
              <div className="text-[var(--text-sub)] text-[10.5px] w-full flex items-center gap-1.5 font-medium dir-ltr justify-start overflow-hidden">
                <Mail size={12} className="shrink-0 text-[var(--emerald-text)]" />
                <span className="truncate">{userEmail}</span>
              </div>
            )}
            
            <div className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${roleConfig.colorClass}`}>
              <RoleIcon size={11} />
              <span>{roleConfig.label}</span>
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
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-all font-semibold cursor-pointer text-[11.5px]"
            >
              <LogOut size={13} className="shrink-0" />
              <span>{t('header.logout', activeRtl ? 'تسجيل الخروج' : 'Log Out')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
