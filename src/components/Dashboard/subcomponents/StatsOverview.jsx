import React from 'react';
import { GraduationCap, Flame, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import { UI } from '@/theme/styles';

export const StatsOverview = ({ stats, userRole, t }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {/* أ) إجمالي الطلاب */}
      <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-semantic-textSecondary">
            {t('dashboard.stats.totalStudents', 'إجمالي الطلاب')}
          </span>
          <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-actionPrimary">
            <GraduationCap size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
            {stats.studentsCount ?? 0}
          </div>
          <span className="text-[10px] text-semantic-success flex items-center gap-1 font-semibold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
            {t('dashboard.stats.activeStatus', 'نشط حالياً')}
          </span>
        </div>
      </div>

      {/* ب) متوسط الاستمرار */}
      <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-semantic-textSecondary">
            {t('dashboard.stats.avgStreak', 'متوسط الاستمرار')}
          </span>
          <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-warning">
            <Flame size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
            {stats.avgStreak ?? 0} <span className="text-xs font-normal text-semantic-textMuted">{t('common.days', 'يوم')}</span>
          </div>
          <span className="text-[10px] text-semantic-warning flex items-center gap-1 font-semibold mt-0.5">
            {t('dashboard.stats.consecutiveDays', 'أيام متتالية بدون انقطاع')}
          </span>
        </div>
      </div>

      {/* ج) حضور اليوم */}
      <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-semantic-textSecondary">
            {t('dashboard.stats.todayAttendance', 'حضور اليوم')}
          </span>
          <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-info">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
            {stats.attendanceRate ?? '0%'}
          </div>
          <span className="text-[10px] text-semantic-info flex items-center gap-1 font-semibold mt-0.5">
            {t('dashboard.stats.ofTotal', 'من إجمالي الطلاب')}
          </span>
        </div>
      </div>

      {/* د) جلسات اليوم */}
      <div className={`${UI.card} p-3.5 flex flex-col justify-between min-h-[100px]`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-semantic-textSecondary">
            {t('dashboard.stats.todaySessions', 'جلسات اليوم')}
          </span>
          <div className="p-1.5 rounded-lg bg-semantic-surfaceInput text-semantic-actionPrimary">
            <BookOpen size={16} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-lg sm:text-xl font-black text-semantic-textPrimary">
            {stats.totalSessions ?? 0} <span className="text-xs font-normal text-semantic-textMuted">{t('common.sessions', 'جلسة')}</span>
          </div>
          <span className="text-[10px] text-semantic-success flex items-center gap-1 font-semibold mt-0.5">
            {t('dashboard.stats.completedSessions', 'تم تسميعها بنجاح')}
          </span>
        </div>
      </div>

      {/* هـ) الاشتراكات المتأخرة */}
      {userRole !== 'teacher' && (
        <div className={`${UI.card} p-3.5 flex items-center justify-between col-span-2 lg:col-span-4 min-h-[64px]`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-semantic-textSecondary block">
                {t('dashboard.stats.overduePaymentsTitle', 'اشتراكات متأخرة')}
              </span>
              <span className="text-[11px] text-semantic-textMuted">
                {stats.overdueCount > 0 
                  ? `${stats.overdueCount} ${t('dashboard.stats.pendingPayments', 'طالب يحتاج تجديد الاشتراك')}`
                  : t('dashboard.stats.noOverdue', 'جميع الاشتراكات مسددة')}
              </span>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-semantic-textPrimary dir-ltr">
            {stats.overdueCount ?? 0}
          </div>
        </div>
      )}
    </section>
  );
};
