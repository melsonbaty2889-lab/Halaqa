// src/components/Header/ProfileMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, LogOut, ShieldCheck, GraduationCap, HeartHandshake, User, Mail, UserCog } from 'lucide-react';

export default function ProfileMenu({
  showMenu = false,
  onToggle = () => {},
  userName = '',
  userEmail = '',
  userRole = 'admin',
  onLogout,
  onEditProfile,
  activeRtl = true
}) {
  const { t } = useTranslation();

  const getRoleConfig = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
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
          className={`absolute top-full mt-2 w-56 border border-[var(--border-input)] rounded-2xl shadow-2xl z-50 p-2.5 text-xs text-[var(--text-main)] bg-[var(--bg-main)] opacity-100 ${
            activeRtl ? 'left-0' : 'right-0'
          }`}
          style={{ 
            maxWidth: 'calc(100vw - 24px)'
          }}
          dir={activeRtl ? 'rtl' : 'ltr'}
        >
          {/* معلومات المستخدم والدور والبريد */}
          <div className="pb-2 border-b border-[var(--border-card)] mb-2 flex flex-col items-start gap-1">
            <div className="font-extrabold text-[var(--text-main)] text-[12px] truncate w-full text-start">
              {displayName}
            </div>

            {userEmail && (
              <div 
                dir="ltr" 
                className={`text-[var(--text-sub)] text-[10.5px] w-full flex items-center gap-1.5 font-medium overflow-hidden ${
                  activeRtl ? 'justify-end' : 'justify-start'
                }`}
              >
                <Mail size={12} className="shrink-0 text-[var(--emerald-text)]" />
                <span className="truncate">{userEmail}</span>
              </div>
            )}
            
            <div className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${roleConfig.colorClass}`}>
              <RoleIcon size={11} />
              <span>{roleConfig.label}</span>
            </div>
          </div>

          {/* الخيارات والتصرفات */}
          <div className="space-y-1">
            {/* زر تعديل الملف الشخصي */}
            <button
              type="button"
              onClick={() => {
                onToggle();
                if (typeof onEditProfile === 'function') onEditProfile();
              }}
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[var(--text-main)] hover:bg-[var(--surface-input)] transition-all font-semibold cursor-pointer text-[11.5px] text-start"
            >
              <UserCog size={13} className="shrink-0 text-[var(--primary)]" />
              <span>{t('header.editProfile', 'الملف الشخصي')}</span>
            </button>

            {/* زر تسجيل الخروج */}
            <button
              type="button"
              onClick={() => {
                onToggle();
                if (typeof onLogout === 'function') onLogout();
              }}
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-all font-semibold cursor-pointer text-[11.5px] text-start"
            >
              <LogOut size={13} className="shrink-0" />
              <span>{t('header.logout', 'تسجيل الخروج')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
