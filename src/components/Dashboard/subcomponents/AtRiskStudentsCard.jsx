import React from 'react';
import { UserX, CheckCircle2 } from 'lucide-react';
import { UI } from '@/theme/styles';

export const AtRiskStudentsCard = ({ atRiskStudents, setActiveTab, t }) => {
  return (
    <div className={`${UI.card} p-4 w-full flex flex-col justify-between space-y-3`}>
      <div className="flex flex-wrap items-center justify-between border-b border-semantic-borderInput pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-semantic-danger/10 text-semantic-danger shrink-0">
            <UserX size={18} />
          </div>
          <h3 className={`${UI.title} text-xs sm:text-sm font-bold m-0 whitespace-nowrap`}>
            {t('dashboard.atRiskStudents.title', 'طلاب غائبون (يحتاجون متابعة)')}
          </h3>
        </div>

        <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
          (atRiskStudents?.length || 0) > 0
            ? 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/30'
            : 'bg-semantic-surfaceInput text-semantic-textMuted border-semantic-borderInput'
        }`}>
          {atRiskStudents?.length || 0} {t('dashboard.atRiskStudents.needsFollowUp', 'يحتاج متابعة')}
        </span>
      </div>

      {atRiskStudents && atRiskStudents.length > 0 ? (
        <div className="flex flex-col gap-2">
          {atRiskStudents.map((student, index) => (
            <div 
              key={student.id || index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-semantic-surfaceInput border border-semantic-borderInput text-xs"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-semantic-textPrimary truncate">
                  {student.name}
                </span>
                <span className="text-[10px] text-semantic-danger font-medium truncate">
                  {student.reason}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('students')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-semantic-actionPrimary/10 text-semantic-actionPrimary hover:bg-semantic-actionPrimary/20 transition-all border-0 cursor-pointer shrink-0"
              >
                {t('common.followUp', 'متابعة')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-3 px-3 text-center flex items-center justify-center gap-2 text-semantic-success bg-semantic-success/10 rounded-xl border border-semantic-success/20">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="text-xs font-bold">
            {t('dashboard.atRiskStudents.allGood', 'جميع الطلاب مستمرون بنجاح هذا اليوم!')}
          </span>
        </div>
      )}
    </div>
  );
};
