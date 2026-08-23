/* src/components/Gamification/StudentBadges.jsx */
import React, { useMemo } from 'react';
import { Award, Flame, Star, Crown, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

// 1. محرك تحديد المستويات والتصاميم (Tiered Badges Engine)
const getBadgeTier = (count = 1) => {
  if (count >= 5) {
    return {
      tierKey: 'gold',
      tierNameAr: 'ذهبي',
      tierNameEn: 'Gold',
      borderColor: 'border-amber-400/80 hover:border-amber-400',
      bgColor: 'bg-amber-400/10',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950',
      shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]'
    };
  }
  if (count >= 3) {
    return {
      tierKey: 'silver',
      tierNameAr: 'فضي',
      tierNameEn: 'Silver',
      borderColor: 'border-slate-300/60 hover:border-slate-300',
      bgColor: 'bg-slate-300/10',
      iconColor: 'text-slate-200',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-950',
      shadow: 'shadow-[0_0_10px_rgba(203,213,225,0.15)]'
    };
  }
  return {
    tierKey: 'bronze',
    tierNameAr: 'برونزي',
    tierNameEn: 'Bronze',
    borderColor: 'border-amber-700/60 hover:border-amber-700',
    bgColor: 'bg-amber-900/15',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white',
    shadow: 'shadow-none'
  };
};

export default function StudentBadges({ student = {}, weeklyData = [], isRtl: propIsRtl }) {
  const { t, i18n } = useTranslation();
  const isRtl = propIsRtl !== undefined ? propIsRtl : (i18n?.dir() === 'rtl');

  // 2. دالة التقاط موقع اللمس على الجوال وإطلاق الاحتفال
  const handleBadgeClick = (badge, event) => {
    if (!badge.unlocked) return;

    let x = 0.5;
    let y = 0.6;

    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = (rect.left + rect.width / 2) / window.innerWidth;
      y = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // إطلاق جزيئات Confetti من موقع الإصبع
    confetti({
      particleCount: window.innerWidth < 640 ? 35 : 65,
      spread: 50,
      origin: { x, y },
      colors: ['#FBBF24', '#38BDF8', '#34D399', '#F43F5E'],
      disableForReducedMotion: true
    });

    // اهتزاز طفيف في الهاتف عند اللمس
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }
  };

  const badges = useMemo(() => {
    const streak = student?.current_streak || 0;
    const quarterIndex = student?.current_quarter_index || 0;
    const activeWeeks = (weeklyData || []).length;

    const rawBadges = [
      {
        id: 'streak',
        titleAr: 'شعلة الحفظ',
        titleEn: 'Hifz Spark',
        descAr: 'استمرار الحفظ المتتالي',
        descEn: 'Consecutive Daily Streak',
        icon: Flame,
        unlocked: streak >= 3,
        count: Math.max(1, Math.floor(streak / 3))
      },
      {
        id: 'juz_master',
        titleAr: 'مُتقن الأجزاء',
        titleEn: 'Juz Mastery',
        descAr: 'إتمام حفظ الأجزاء بنجاح',
        descEn: 'Completed Quran Juz',
        icon: Star,
        unlocked: quarterIndex >= 8,
        count: Math.max(1, Math.floor(quarterIndex / 8))
      },
      {
        id: 'weekly_achiever',
        titleAr: 'المثابر الأسبوعي',
        titleEn: 'Weekly Achiever',
        descAr: 'التزام وحضور منتظم',
        descEn: 'Consistent Weekly Active',
        icon: Crown,
        unlocked: activeWeeks >= 4,
        count: Math.max(1, Math.floor(activeWeeks / 4))
      }
    ];

    return rawBadges.map(b => ({
      ...b,
      tier: getBadgeTier(b.count)
    }));
  }, [student?.current_streak, student?.current_quarter_index, weeklyData]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg mb-5 select-none">
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

      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((badge) => {
          const IconComponent = badge.icon;
          const { tier } = badge;

          return (
            <div 
              key={badge.id}
              onClick={(e) => handleBadgeClick(badge, e)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`relative rounded-xl p-3 flex flex-col items-center text-center transition-all cursor-pointer touch-manipulation active:scale-95 ${
                badge.unlocked 
                  ? `bg-slate-950 border ${tier.borderColor} ${tier.shadow}` 
                  : 'bg-slate-950/40 border border-slate-800/60 opacity-40 cursor-not-allowed'
              }`}
            >
              {badge.unlocked ? (
                <span className={`absolute -top-1.5 start-1.5 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-full shadow ${tier.badgeBg}`}>
                  {isRtl ? tier.tierNameAr : tier.tierNameEn} {badge.count > 1 ? `x${badge.count}` : ''}
                </span>
              ) : (
                <span className="absolute top-2 start-2 text-slate-500">
                  <Lock size={12} />
                </span>
              )}

              <div className={`mb-1.5 p-2 rounded-full flex items-center justify-center ${badge.unlocked ? tier.bgColor : 'bg-slate-800/50'}`}>
                <IconComponent size={18} className={badge.unlocked ? tier.iconColor : 'text-slate-500'} />
              </div>

              <div className={`text-xs font-bold mb-0.5 truncate w-full ${badge.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                {isRtl ? badge.titleAr : badge.titleEn}
              </div>

              <div className={`text-[9.5px] leading-tight line-clamp-2 ${badge.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                {isRtl ? badge.descAr : badge.descEn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
