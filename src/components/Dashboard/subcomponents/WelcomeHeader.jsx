import React from 'react';
import { UI } from '@/theme/styles';

export const WelcomeHeader = ({ displayName, userRole, t }) => {
  return (
    <header className={`${UI.card} flex flex-col justify-center p-4 w-full`}>
      <div className="flex flex-col gap-1">
        <h1 className={`${UI.title} text-base sm:text-lg md:text-xl flex items-center gap-1.5 m-0 font-bold text-semantic-textPrimary`}>
          <span>{t('dashboard.welcome', 'أهلاً بك،')}</span>
          <span className="text-semantic-actionPrimary font-black whitespace-nowrap">
            {displayName}
          </span>
        </h1>
        
        <p className={`${UI.subtitle} text-[11px] sm:text-xs m-0 leading-relaxed text-semantic-textMuted`}>
          {userRole === 'teacher' 
            ? t('dashboard.subtitleTeacher', 'جاهز لبدء حلقات اليوم ورصد مستوى الطلاب؟')
            : t('dashboard.subtitleAdmin', 'متابعة أداء الأكاديمية والأنشطة المباشرة اليوم.')}
        </p>
      </div>
    </header>
  );
};
