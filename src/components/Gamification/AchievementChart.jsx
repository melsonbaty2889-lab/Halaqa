import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, BookOpen, Calendar } from 'lucide-react';

export default function AchievementChart() {
  const { t } = useTranslation();

  const daysKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  const chartData = [
    { dayKey: 'sat', pages: 45 },
    { dayKey: 'sun', pages: 65 },
    { dayKey: 'mon', pages: 50 },
    { dayKey: 'tue', pages: 80 },
    { dayKey: 'wed', pages: 60 },
    { dayKey: 'thu', pages: 95 },
    { dayKey: 'fri', pages: 55 },
  ];

  const peakDay = t('gamification.chart.days.thu');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('gamification.chart.title')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {t('gamification.chart.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold dir-ltr">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-none mb-1">
              {t('gamification.chart.totalWeekly')}
            </span>
            <span className="text-xs font-bold text-white">
              475 {t('gamification.chart.pages')}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-none mb-1">
              {t('gamification.chart.peakDay')}
            </span>
            <span className="text-xs font-bold text-amber-400">
              {peakDay} (95)
            </span>
          </div>
        </div>
      </div>

      {/* المحور والأيام */}
      <div className="pt-2">
        <div className="h-24 w-full flex items-end justify-between gap-1 px-1">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div 
                className="w-full bg-amber-500/20 hover:bg-amber-500/40 border-t-2 border-amber-400 rounded-t-sm transition-all"
                style={{ height: `${(item.pages / 95) * 100}%` }}
              />
              <span className="text-[10px] font-medium text-slate-400">
                {t(`gamification.chart.days.${item.dayKey}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
