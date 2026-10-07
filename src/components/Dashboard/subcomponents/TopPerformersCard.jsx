import React from 'react';
import { Trophy, Plus } from 'lucide-react';
import { UI } from '@/theme/styles';

export const TopPerformersCard = ({ topPerformers, setActiveTab, t }) => {
  return (
    <div className={`${UI.card} p-4 w-full flex flex-col justify-between space-y-3`}>
      <div className="flex items-center justify-between border-b border-semantic-borderInput pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-semantic-warning/10 text-semantic-warning shrink-0">
            <Trophy size={18} />
          </div>
          <h3 className={`${UI.title} text-xs sm:text-sm font-bold m-0 whitespace-nowrap`}>
            {t('dashboard.topPerformers.title', 'أبطال اليوم')}
          </h3>
        </div>

        {topPerformers && topPerformers.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('students')}
            className="text-xs text-semantic-actionPrimary font-bold hover:underline cursor-pointer bg-transparent border-0 p-0 shrink-0"
          >
            {t('common.viewAll', 'عرض الكل')}
          </button>
        )}
      </div>

      {topPerformers && topPerformers.length > 0 ? (
        <div className="flex flex-col gap-2">
          {topPerformers.map((student, index) => (
            <div 
              key={student.id || index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput text-xs hover:border-semantic-actionPrimary/40 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm ${
                  index === 0 
                    ? 'bg-amber-400 text-slate-950 border border-amber-300' 
                    : index === 1 
                    ? 'bg-slate-300 text-slate-950 border border-slate-200'
                    : index === 2
                    ? 'bg-amber-700 text-white border border-amber-600'
                    : 'bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderInput'
                }`}>
                  {index + 1}
                </span>
                
                <span className="font-bold text-semantic-textPrimary truncate">
                  {student.name}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 bg-semantic-actionPrimary/10 px-2.5 py-1 rounded-lg">
                <span className="font-black text-semantic-actionPrimary dir-ltr">
                  {student.sessionsCount ?? 0}
                </span>
                <span className="text-[10px] text-semantic-actionPrimary font-semibold">
                  {t('common.sessions', 'جلسة')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-3 bg-semantic-surfaceInput/40 rounded-xl border border-dashed border-semantic-borderInput">
          <div className="p-3.5 rounded-full bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20">
            <Trophy size={26} />
          </div>
          
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-semantic-textPrimary m-0">
              {t('dashboard.topPerformers.emptyTitle', 'قائمة الأبطال بانتظار الأول!')}
            </p>
            <p className="text-[11px] sm:text-xs text-semantic-textSecondary m-0 max-w-xs leading-relaxed">
              {t('dashboard.topPerformers.emptySubtitle', 'لم تُسجل جلسات اليوم بعد. ابدأ التسميع الآن لتصدر القائمة.')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('halaqas')}
            className={`${UI.btnPrimary} text-xs py-2 px-4 min-h-[36px] w-auto mt-1 flex items-center gap-1.5 shadow-sm font-bold`}
          >
            <Plus size={14} />
            <span>{t('dashboard.actions.startRecitation', 'بدء التسميع الآن')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
