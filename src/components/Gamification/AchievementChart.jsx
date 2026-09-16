import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar } from 'lucide-react';
import { C } from '@/theme/colors';

export default function AchievementChart({ weeklyData = [] }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const totalPages = weeklyData.reduce((acc, curr) => acc + (curr.pages || 0), 0);
  const maxPages = Math.max(...weeklyData.map(d => d.pages || 0), 1);
  const peakItem = weeklyData.reduce(
    (prev, current) => ((prev.pages || 0) > (current.pages || 0) ? prev : current), 
    { pages: 0 }
  );

  return (
    <div 
      className="border rounded-2xl p-4 shadow-lg space-y-4"
      style={{ 
        backgroundColor: C.dark?.card, 
        borderColor: C.dark?.cardBorder,
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: C.text?.title }}>
            {t('gamification.chartTitle', 'مخطط الإنجاز الأسبوعي')}
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: C.text?.muted }}>
            {t('gamification.chartSubtitle', 'إجمالي الصفحات المقروءة وأيام الذروة')}
          </p>
        </div>
      </div>

      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-2 gap-2">
        <div 
          className="p-2.5 rounded-xl border flex items-center gap-2.5"
          style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
        >
          <BookOpen className="w-4 h-4 shrink-0" style={{ color: C.amber?.DEFAULT }} />
          <div>
            <span className="text-[10px] block leading-none mb-1" style={{ color: C.text?.muted }}>
              {t('gamification.totalWeekly', 'المجموع الأسبوعي')}
            </span>
            <span className="text-xs font-bold" style={{ color: C.text?.title }}>
              {totalPages} {t('gamification.pages', 'صفحة')}
            </span>
          </div>
        </div>

        <div 
          className="p-2.5 rounded-xl border flex items-center gap-2.5"
          style={{ backgroundColor: C.dark?.surface, borderColor: C.dark?.cardBorder }}
        >
          <Calendar className="w-4 h-4 shrink-0" style={{ color: C.amber?.DEFAULT }} />
          <div>
            <span className="text-[10px] block leading-none mb-1" style={{ color: C.text?.muted }}>
              {t('gamification.peakDay', 'أعلى يوم إنجاز')}
            </span>
            <span className="text-xs font-bold" style={{ color: C.amber?.DEFAULT }}>
              {peakItem.dayKey ? t(`gamification.days.${peakItem.dayKey}`, peakItem.dayKey) : '-'} ({peakItem.pages || 0})
            </span>
          </div>
        </div>
      </div>

      {/* الرسم البياني للأعمدة */}
      <div className="pt-2">
        {weeklyData.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: C.text?.muted }}>
            {t('common.noResults', 'لا توجد بيانات متاحة')}
          </p>
        ) : (
          <div className="h-24 w-full flex items-end justify-between gap-1.5 px-1">
            {weeklyData.map((item, idx) => {
              const pagesCount = item.pages || 0;
              const heightPercent = maxPages > 0 ? (pagesCount / maxPages) * 100 : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full relative group flex items-end justify-center h-full">
                    <div 
                      className="w-full border-t-2 rounded-t-sm transition-all duration-300 hover:opacity-80"
                      style={{ 
                        height: pagesCount > 0 ? `${Math.max(heightPercent, 8)}%` : '2px',
                        backgroundColor: pagesCount > 0 ? `${C.amber?.DEFAULT}25` : C.dark?.surface,
                        borderColor: pagesCount > 0 ? C.amber?.DEFAULT : C.dark?.cardBorder
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: C.text?.muted }}>
                    {t(`gamification.days.${item.dayKey}`, item.dayKey)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
