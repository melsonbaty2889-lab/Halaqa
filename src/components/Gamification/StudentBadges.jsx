/* src/components/Gamification/StudentBadges.jsx */
import React, { useMemo } from 'react';
import { Award, Flame, Star, Crown, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StudentBadges({ student = {}, weeklyData = [], isRtl: propIsRtl }) {
  const { t, i18n } = useTranslation();
  const isRtl = propIsRtl !== undefined ? propIsRtl : (i18n?.dir() === 'rtl');

  const badges = useMemo(() => {
    const streak = student?.current_streak || 0;
    const quarterIndex = student?.current_quarter_index || 0;
    const activeWeeks = (weeklyData || []).length;

    return [
      {
        id: 'streak',
        titleAr: 'شعلة الحفظ',
        titleEn: 'Hifz Spark',
        descAr: 'استمرار لـ 3 أيام متتالية',
        descEn: '3 Days Streak',
        icon: <Flame size={18} className="text-orange-400" />,
        unlocked: streak >= 3,
        count: Math.floor(streak / 3)
      },
      {
        id: 'juz_master',
        titleAr: 'مُتقن الأجزاء',
        titleEn: 'Juz Mastery',
        descAr: 'إتمام حفظ جزء كامل بنجاح',
        descEn: 'Completed 1 Juz',
        icon: <Star size={18} className="text-amber-400" />,
        unlocked: quarterIndex >= 8,
        count: Math.floor(quarterIndex / 8)
      },
      {
        id: 'weekly_achiever',
        titleAr: 'المثابر الأسبوعي',
        titleEn: 'Weekly Achiever',
        descAr: 'التزام وحضور منتظم',
        descEn: 'Consistent Active Week',
        icon: <Crown size={18} className="text-sky-400" />,
        unlocked: activeWeeks >= 4,
        count: 1
      }
    ];
  }, [student?.current_streak, student?.current_quarter_index, weeklyData]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  return (
    <div 
      className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg mb-5"
    >
      {/* رأس الكارت الشخصي */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/15 p-1.5 rounded-lg flex items-center justify-center border border-amber-500/20">
            <Award size={18} className="text-amber-400" />
          </div>
          <span className="text-slate-100 text-sm font-bold">
            {t('gamification.masteryBadges', isRtl ? 'شارات التميز والإتقان' : 'Mastery Badges')}
          </span>
        </div>

        <span className="text-xs font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-full border border-amber-500/20 dir-ltr">
          {unlockedCount} / {badges.length}
        </span>
      </div>

      {/* شبكة الأوسمة */}
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative rounded-xl p-3 flex flex-col items-center text-center transition-all ${
              badge.unlocked 
                ? 'bg-slate-950 border border-amber-500/40 shadow-sm' 
                : 'bg-slate-950/40 border border-slate-800/60 opacity-50'
            }`}
          >
            {badge.unlocked ? (
              badge.count > 1 && (
                <span className="absolute -top-1.5 start-1.5 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                  x{badge.count}
                </span>
              )
            ) : (
              <span className="absolute top-2 start-2 text-slate-500">
                <Lock size={12} />
              </span>
            )}

            <div className={`mb-1.5 p-2 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-amber-500/10' : 'bg-slate-800/50'}`}>
              {badge.icon}
            </div>

            <div className={`text-xs font-bold mb-0.5 truncate w-full ${badge.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
              {isRtl ? badge.titleAr : badge.titleEn}
            </div>

            <div className={`text-[9.5px] leading-tight line-clamp-2 ${badge.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRtl ? badge.descAr : badge.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
