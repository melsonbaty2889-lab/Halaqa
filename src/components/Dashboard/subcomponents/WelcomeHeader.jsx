import React from 'react';
import { UI } from '@/theme/styles';
import { ROLES, sanitizeRole } from '@/constants/roles';

export const WelcomeHeader = ({ displayName, userRole, t }) => {
  const cleanRole = sanitizeRole(userRole);

  const roleConfig = {
    [ROLES.SUPER_ADMIN]: {
      subtitleKey: 'dashboard.subtitleSuperAdmin',
      defaultSubtitle: 'متابعة إدارة المنظومة بالكامل والإشراف الشامل.',
    },
    [ROLES.ADMIN]: {
      subtitleKey: 'dashboard.subtitleAdmin',
      defaultSubtitle: 'متابعة أداء الأكاديمية والأنشطة المباشرة اليوم.',
    },
    [ROLES.MANAGER]: {
      subtitleKey: 'dashboard.subtitleManager',
      defaultSubtitle: 'متابعة أداء الفرع والإشراف على الأنشطة الميدانية.',
    },
    [ROLES.TEACHER]: {
      subtitleKey: 'dashboard.subtitleTeacher',
      defaultSubtitle: 'جاهز لبدء حلقات اليوم ورصد مستوى الطلاب؟',
    },
    [ROLES.STUDENT]: {
      subtitleKey: 'dashboard.subtitleStudent',
      defaultSubtitle: 'مرحباً بك! جاهز لمتابعة وردك اليومي ورحلة حفظك؟',
    },
    [ROLES.PARENT]: {
      subtitleKey: 'dashboard.subtitleParent',
      defaultSubtitle: 'متابعة مستوى أبنائك وحضورهم في الحلقات اليوم.',
    },
  };

  const currentRole = roleConfig[cleanRole] || roleConfig[ROLES.ADMIN];

  return (
    <header className={`${UI.card} p-3.5 sm:p-4 w-full flex flex-col justify-center gap-1.5`}>
      <div className="flex flex-col gap-1 min-w-0">
        {/* الترحيب والاسم في سطر أفقي انسيابي متناسق */}
        <h1 className={`${UI.title} text-sm sm:text-base flex items-center gap-1.5 m-0 font-bold leading-snug flex-wrap`}>
          <span className="text-semantic-textSecondary shrink-0">
            {t('dashboard.welcome', 'أهلاً بك،')}
          </span>
          <span className="text-semantic-actionPrimary font-bold break-words">
            {displayName}
          </span>
        </h1>

        {/* الجملة تحت الاسم بتباين واضح وحجم متناسق */}
        <p className={`${UI.subtitle} text-xs m-0 leading-relaxed text-semantic-textSecondary opacity-90`}>
          {t(currentRole.subtitleKey, currentRole.defaultSubtitle)}
        </p>
      </div>
    </header>
  );
};
