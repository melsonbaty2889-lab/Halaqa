import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, BookOpen, Calendar } from 'lucide-react';

export default function AchievementChart({ weeklyData = [] }) {
  const { t } = useTranslation();

  const totalPages = weeklyData.reduce((acc, curr) => acc + (curr.pages || 0), 0);
  const maxPages = Math.max(...weeklyData.map(d => d.pages || 0), 1);
  const peakItem = weeklyData.reduce((prev, current) => ((prev.pages || 0) > (current.pages || 0) ? prev : current), { pages: 0 });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('gamification.chart.title', 'منحنى الإنجاز الأسبوعي')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {t('gamification.chart.subtitle', 'مجموع الصفحات المنجزة (حفظ ومراجعة)')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-none mb-1">
              {t('gamification.chart.totalWeekly', 'إجمالي صفحات الأسبوع')}
            </span>
            <span className="text-xs font-bold text-white">
              {totalPages} {t('gamification.chart.pages', 'صفحة')}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-none mb-1">
              {t('gamification.chart.peakDay', 'أعلى يوم إنجاز')}
            </span>
            <span className="text-xs font-bold text-amber-400">
              {peakItem.dayKey ? t(`gamification.chart.days.${peakItem.dayKey}`) : '-'} ({peakItem.pages || 0})
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {weeklyData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            {t('common.noResults', 'لا توجد بيانات')}
          </p>
        ) : (
          <div className="h-24 w-full flex items-end justify-between gap-1 px-1">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-amber-500/20 hover:bg-amber-500/40 border-t-2 border-amber-400 rounded-t-sm transition-all"
                  style={{ height: `${((item.pages || 0) / maxPages) * 100}%` }}
                />
                <span className="text-[10px] font-medium text-slate-400">
                  {t(`gamification.chart.days.${item.dayKey}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
