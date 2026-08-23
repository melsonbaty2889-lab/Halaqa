import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Award, Flame, Star, BookOpen, TrendingUp } from 'lucide-react';

export default function GamificationStreaks({ badges = [], streaks = [], leaderboard = [], chartData = [] }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('leaderboard');

  // كود اللغة الحالي (ar, en, fr, ur...)
  const currentLang = i18n?.language?.split('-')[0]?.toLowerCase() || 'ar';
  const isRtl = i18n?.dir() === 'rtl';

  // دالة جلب محتوى الوسام من JSONB مع الحماية
  const getBadgeContent = (badge, isTitle = true) => {
    const field = isTitle ? badge.titles : badge.descriptions;
    
    if (field && typeof field === 'object') {
      if (field[currentLang]) return field[currentLang];
      if (field['ar']) return field['ar'];
      if (field['en']) return field['en'];
    }

    // Fallback للحقول القديمة
    if (isTitle) return badge.title || t('gamification.defaultBadgeTitle', 'وسام إنجاز');
    return badge.description || t('gamification.defaultBadgeDesc', 'وسام تشجيعي للتفوق والمواظبة');
  };

  // اختصار أيام الأسبوع للرسم البياني لتفادي التداخل
  const formatDayName = (day) => {
    const daysMap = {
      Sat: { ar: 'سبت', en: 'Sat' },
      Sun: { ar: 'أحد', en: 'Sun' },
      Mon: { ar: 'إثنين', en: 'Mon' },
      Tue: { ar: 'ثلاثاء', en: 'Tue' },
      Wed: { ar: 'أربعاء', en: 'Wed' },
      Thu: { ar: 'خميس', en: 'Thu' },
      Fri: { ar: 'جمعة', en: 'Fri' },
    };
    return daysMap[day]?.[currentLang] || day;
  };

  return (
    <div className="space-y-6 text-slate-100 dir-auto">
      {/* الهيدر الرئيسي والتبويب */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">
              {t('gamification.title', 'لوحة الإنجازات والتحديات')}
            </h2>
            <p className="text-sm text-slate-400">
              {t('gamification.subtitle', 'تحفيز الطلاب وتتبع الأوسمة والسلسلة اليومية')}
            </p>
          </div>
        </div>

        {/* أزرار التبويب */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{t('gamification.tabs.leaderboard', 'المتصدرين')}</span>
          </button>

          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'streaks'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{t('gamification.tabs.streaks', 'السلسلة')}</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'badges'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>
              {t('gamification.tabs.badges', 'الأوسمة')} ({badges.length})
            </span>
          </button>
        </div>
      </div>

      {/* قسم عرض الأوسمة عند اختيار تبويب Badges */}
      {activeTab === 'badges' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sky-400">
            <Award className="w-5 h-5" />
            <h3 className="font-bold">{t('gamification.badgesHeader', 'الأوسمة والإنجازات المتاحة')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{getBadgeContent(badge, true)}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {getBadgeContent(badge, false)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-400 text-xs font-bold whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>+{badge.points_rewarded || 10}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
