/* src/components/Gamification/StudentBadges.jsx */
import React, { useMemo } from 'react';
import { Award, Flame, Star, Crown, Lock } from 'lucide-react';
import colors from '@/theme/colors';

export default function StudentBadges({ student = {}, weeklyData = [], isRtl = true }) {
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
        icon: <Flame size={20} className="text-amber-400" />,
        unlocked: streak >= 3,
        count: Math.floor(streak / 3)
      },
      {
        id: 'juz_master',
        titleAr: 'مُتقن الأجزاء',
        titleEn: 'Juz Mastery',
        descAr: 'إتمام حفظ جزء كامل بنجاح',
        descEn: 'Completed 1 Juz',
        icon: <Star size={20} className="text-amber-400" />,
        unlocked: quarterIndex >= 8,
        count: Math.floor(quarterIndex / 8)
      },
      {
        id: 'weekly_achiever',
        titleAr: 'المثابر الأسبوعي',
        titleEn: 'Weekly Achiever',
        descAr: 'التزام وحضور منتظم',
        descEn: 'Consistent Active Week',
        icon: <Crown size={20} className="text-amber-400" />,
        unlocked: activeWeeks >= 4,
        count: 1
      }
    ];
  }, [student?.current_streak, student?.current_quarter_index, weeklyData]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.3)] box-border mb-5"
    >
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/15 p-1.5 rounded-lg flex items-center justify-center border border-amber-500/20">
            <Award size={18} className="text-amber-500" />
          </div>
          <span className="text-slate-100 text-sm font-bold">
            {isRtl ? 'شارات التميز والإتقان' : 'Mastery Badges'}
          </span>
        </div>

        <span className="text-xs font-bold text-amber-500 bg-[#090F16] px-2.5 py-1 rounded-full border border-amber-500/20">
          {unlockedCount} / {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative rounded-xl p-3 flex flex-col items-center text-center transition-all duration-200 ${
              badge.unlocked 
                ? 'bg-[#090F16]/90 border border-amber-500/40 opacity-100 shadow-[0_4px_14px_rgba(245,158,11,0.08)]' 
                : 'bg-[#0F172A]/40 border border-[#1E293B] opacity-45'
            }`}
          >
            {badge.unlocked ? (
              badge.count > 1 && (
                <span className={`absolute -top-1.5 ${isRtl ? '-left-1.5' : '-right-1.5'} bg-amber-500 text-[#0F172A] text-[9px] font-bold px-1.5 py-0.5 rounded-[10px] shadow-md`}>
                  x{badge.count}
                </span>
              )
            ) : (
              <span className={`absolute top-1.5 ${isRtl ? '-left-1.5' : '-right-1.5'} text-slate-500`}>
                <Lock size={12} />
              </span>
            )}

            <div className={`mb-1.5 p-2 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-amber-500/15' : 'bg-[#090F16]'}`}>
              {badge.icon}
            </div>

            <div className={`text-xs font-bold mb-0.5 ${badge.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
              {isRtl ? badge.titleAr : badge.titleEn}
            </div>

            <div className={`text-[9.5px] leading-tight ${badge.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
              {isRtl ? badge.descAr : badge.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
