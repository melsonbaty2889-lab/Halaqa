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
      defaultSubtitle: 'جاهز لمتابعة وردك اليومي ورحلة حفظك؟',
    },
    [ROLES.PARENT]: {
      subtitleKey: 'dashboard.subtitleParent',
      defaultSubtitle: 'متابعة مستوى أبنائك وحضورهم في الحلقات اليوم.',
    },
  };

  const currentRole = roleConfig[cleanRole] || roleConfig[ROLES.ADMIN];

  return (
    <header className={`${UI.card} p-3 sm:p-4 w-full flex flex-col justify-center gap-1 min-w-0`}>
      {/* الترحيب والاسم مجتمعان في سطر واحد بدون UI.title */}
      <h1 className="text-sm sm:text-base font-bold m-0 p-0 leading-tight inline-flex items-center gap-1.5 flex-wrap min-w-0">
        <span className="text-semantic-textSecondary shrink-0">
          {t('dashboard.welcome', 'أهلاً بك،')}
        </span>
        <span className="text-semantic-actionPrimary font-extrabold truncate max-w-full">
          {displayName}
        </span>
      </h1>

      {/* النص الوصفي تحت الاسم مباشرة */}
      <p className="text-xs m-0 leading-relaxed text-semantic-textSecondary opacity-80 font-normal">
        {t(currentRole.subtitleKey, currentRole.defaultSubtitle)}
      </p>
    </header>
  );
};
