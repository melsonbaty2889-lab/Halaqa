import React from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, GraduationCap, HeartHandshake } from 'lucide-react';
import { UI } from '@/theme/styles';
import { ROLES, sanitizeRole } from '@/constants/roles';

export const WelcomeHeader = ({ displayName, userRole, t }) => {
  const cleanRole = sanitizeRole(userRole);

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

  const currentRole = roleConfig[cleanRole] || roleConfig[ROLES.ADMIN];
  const RoleIcon = currentRole.icon;

  return (
    <header className={`${UI.card} p-3.5 sm:p-4 w-full flex flex-col justify-center gap-2`}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* تم ضبط حجم الخط ليكون text-sm إلى text-base ليصبح متناسباً ومتوازناً */}
          <h1 className={`${UI.title} text-sm sm:text-base flex items-center gap-1.5 m-0 font-bold leading-snug flex-wrap`}>
            <span className="shrink-0 text-semantic-textSecondary">{t('dashboard.welcome', 'أهلاً بك،')}</span>
            <span className="text-semantic-actionPrimary font-bold">
              {displayName}
            </span>
          </h1>

          {/* شارة الدور متناسقة الأبعاد */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20 shrink-0">
            <RoleIcon size={12} />
            <span>{t(currentRole.badgeKey, currentRole.defaultBadge)}</span>
          </span>
        </div>

        {/* النص الوصفي */}
        <p className={`${UI.subtitle} text-xs m-0 leading-relaxed text-semantic-textSecondary`}>
          {t(currentRole.subtitleKey, currentRole.defaultSubtitle)}
        </p>
      </div>
    </header>
  );
};
