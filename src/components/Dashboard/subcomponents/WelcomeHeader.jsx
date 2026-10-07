import React from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, GraduationCap, HeartHandshake } from 'lucide-react';
import { UI } from '@/theme/styles';
import { ROLES, sanitizeRole } from '@/constants/roles';

export const WelcomeHeader = ({ displayName, userRole, t }) => {
  const cleanRole = sanitizeRole(userRole);

  // خريطة تهيئة البيانات المعتمدة على قيم ROLES الموحدة
  const roleConfig = {
    [ROLES.SUPER_ADMIN]: {
      subtitleKey: 'dashboard.subtitleSuperAdmin',
      defaultSubtitle: 'متابعة إدارة المنظومة بالكامل والإشراف الشامل.',
      badgeKey: 'roles.superAdmin',
      defaultBadge: 'مدير النظام العام',
      icon: ShieldAlert,
    },
    [ROLES.ADMIN]: {
      subtitleKey: 'dashboard.subtitleAdmin',
      defaultSubtitle: 'متابعة أداء الأكاديمية والأنشطة المباشرة اليوم.',
      badgeKey: 'roles.admin',
      defaultBadge: 'مدير أكاديمية',
      icon: ShieldCheck,
    },
    [ROLES.MANAGER]: {
      subtitleKey: 'dashboard.subtitleManager',
      defaultSubtitle: 'متابعة أداء الفرع والإشراف على الأنشطة الميدانية.',
      badgeKey: 'roles.manager',
      defaultBadge: 'مدير فرعي',
      icon: ShieldCheck,
    },
    [ROLES.TEACHER]: {
      subtitleKey: 'dashboard.subtitleTeacher',
      defaultSubtitle: 'جاهز لبدء حلقات اليوم ورصد مستوى الطلاب؟',
      badgeKey: 'roles.teacher',
      defaultBadge: 'معلم',
      icon: UserCheck,
    },
    [ROLES.STUDENT]: {
      subtitleKey: 'dashboard.subtitleStudent',
      defaultSubtitle: 'مرحباً بك! جاهز لمتابعة وردك اليومي ورحلة حفظك؟',
      badgeKey: 'roles.student',
      defaultBadge: 'طالب',
      icon: GraduationCap,
    },
    [ROLES.PARENT]: {
      subtitleKey: 'dashboard.subtitleParent',
      defaultSubtitle: 'متابعة مستوى أبنائك وحضورهم في الحلقات اليوم.',
      badgeKey: 'roles.parent',
      defaultBadge: 'ولي أمر',
      icon: HeartHandshake,
    },
  };

  // شبكة الأمان: استخدام دور ADMIN كافتراضي إذا لم يتم التعرف على الدور
  const currentRole = roleConfig[cleanRole] || roleConfig[ROLES.ADMIN];
  const RoleIcon = currentRole.icon;

  return (
    <header className={`${UI.card} p-4 sm:p-5 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className={`${UI.title} text-lg sm:text-xl flex items-center gap-1.5 m-0 font-bold leading-tight`}>
            <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-semantic-actionPrimary font-black truncate max-w-[200px] sm:max-w-xs">
              {displayName}
            </span>
          </h1>

          {/* شارة توضح دور المستخدم وفق الهوية */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20 shrink-0">
            <RoleIcon size={12} />
            {t(currentRole.badgeKey, currentRole.defaultBadge)}
          </span>
        </div>

        <p className={`${UI.subtitle} text-xs m-0 leading-relaxed text-semantic-textSecondary`}>
          {t(currentRole.subtitleKey, currentRole.defaultSubtitle)}
        </p>
      </div>
    </header>
  );
};
