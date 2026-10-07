import React from 'react';
import { Landmark, User, Clock, ArrowLeft, ArrowRight, Activity, Calendar } from 'lucide-react';
import { UI } from '@/theme/styles';
import { HalaqaStatusBadge } from './HalaqaStatusBadge';

export const ActiveHalaqasSection = ({ activeHalaqasData, safeText, isRtl, setActiveTab, t }) => {
  if (activeHalaqasData && activeHalaqasData.length > 0) {
    return (
      <section className={`${UI.card} p-4 w-full space-y-3`}>
        <div className="flex justify-between items-center border-b border-semantic-borderInput pb-2.5">
          <h2 className="text-xs md:text-sm font-black flex items-center gap-1.5 m-0 text-semantic-textPrimary">
            <Landmark className="text-semantic-actionPrimary shrink-0" size={16} />
            <span>{t('dashboard.sections.activeHalaqas', 'الحلقات النشطة')}</span>
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textSecondary font-bold shrink-0">
            {activeHalaqasData.length} {t('common.halaqaUnit', 'حلقة')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
          {activeHalaqasData.map((halaqa, idx) => {
            const isLive = halaqa.status === 'live';
            const isFinished = halaqa.status === 'finished';
            const halaqaName = safeText(halaqa.name, t('common.defaultHalaqaName', 'حلقة قرآنية'));
            const teacherName = safeText(halaqa.teacher_name, t('common.unspecified', 'غير محدد'));
            const timeDisplay = safeText(isRtl ? halaqa.time_display_ar : halaqa.time_display_en, '');

            return (
              <div 
                key={halaqa.id || idx} 
                className="p-3 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput/70 flex flex-col justify-between space-y-2 w-full"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="m-0 text-xs md:text-sm font-bold text-semantic-textPrimary break-words">
                      {halaqaName}
                    </h3>
                    <HalaqaStatusBadge isLive={isLive} isFinished={isFinished} t={t} />
                  </div>

                  <div className="text-xs mb-1 flex items-center gap-1.5 text-semantic-textSecondary">
                    <User size={13} className="text-semantic-textMuted shrink-0" />
                    <span className="break-words">{t('common.teacher', 'المعلم')}: {teacherName}</span>
                  </div>

                  {timeDisplay && (
                    <div className="text-[11px] mb-1 flex items-center gap-1.5 text-semantic-textMuted">
                      <Clock size={13} className="shrink-0" />
                      <span className="break-words">{timeDisplay}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-semantic-borderInput flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={() => setActiveTab && setActiveTab('halaqas')} 
                    aria-label={t('common.details', 'التفاصيل')}
                    className="text-xs font-bold text-semantic-actionPrimary bg-transparent border-0 cursor-pointer p-0 hover:underline flex items-center gap-1"
                  >
                    <span>{t('common.details', 'التفاصيل')}</span>
                    {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className={`${UI.card} text-center py-6 p-4 w-full space-y-3`}>
      <Activity size={28} className="mx-auto text-semantic-actionPrimary opacity-80" />
      <p className="text-xs font-bold m-0 text-semantic-textSecondary leading-relaxed max-w-sm mx-auto">
        {t('dashboard.emptyHalaqas', 'جميع الحلقات الحية حالياً مكتملة. يمكنك بدء حلقة جديدة أو مراجعة جدول اليوم.')}
      </p>
      <button
        type="button"
        onClick={() => setActiveTab && setActiveTab('halaqas')}
        className={`${UI.btnSecondary} min-h-[40px] py-2 px-4 text-xs mx-auto flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto font-bold`}
      >
        <Calendar size={16} />
        <span>{t('dashboard.actions.viewHalaqasSchedule', 'عرض جدول الحلقات')}</span>
      </button>
    </section>
  );
};
