import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatName } from '@/utils/formatters';
import { 
  Trophy, Flame, Medal, Star, Crown, 
  GraduationCap, Loader2, AlertTriangle 
} from 'lucide-react';

export default function GamificationStreaks({ academyId: propAcademyId, isRtl = true }) {
  const [loading, setLoading] = useState(true);
  const [topAchievers, setTopAchievers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard'); 
  const [debugInfo, setDebugInfo] = useState({ currentAcademyId: null, error: null });

  useEffect(() => {
    async function fetchGamificationData() {
      setLoading(true);
      let errMsg = '';
      try {
        let targetAcademyId = propAcademyId;

        if (!targetAcademyId) {
          const { data: academyData, error: acadErr } = await supabase
            .from('academies')
            .select('id')
            .limit(1)
            .maybeSingle();

          if (acadErr) errMsg += `خطأ الأكاديمية: ${acadErr.message} | `;
          if (academyData?.id) {
            targetAcademyId = academyData.id;
          }
        }

        setDebugInfo({ currentAcademyId: targetAcademyId || 'غير محدد', error: null });

        // 1️⃣ جلب الأوسمة النشطة
        let badgesQuery = supabase.from('badges').select('*');
        if (targetAcademyId) badgesQuery = badgesQuery.eq('academy_id', targetAcademyId);

        const { data: badgesData, error: badgesErr } = await badgesQuery;
        if (badgesErr) errMsg += `خطأ الأوسمة: ${badgesErr.message} | `;
        setBadges(badgesData || []);

        // 2️⃣ جلب بيانات السلاسل (Streaks)
        let streaksQuery = supabase
          .from('students')
          .select('id, name, current_streak, longest_streak')
          .order('current_streak', { ascending: false })
          .limit(10);

        if (targetAcademyId) streaksQuery = streaksQuery.eq('academy_id', targetAcademyId);

        const { data: streaksData, error: streaksErr } = await streaksQuery;
        if (streaksErr) errMsg += `خطأ السلاسل: ${streaksErr.message} | `;
        setStreaks(streaksData || []);

        // 3️⃣ جلب المتصدرين
        let studentsQuery = supabase
          .from('students')
          .select('id, name, avatar_url, points')
          .order('points', { ascending: false })
          .limit(10);

        if (targetAcademyId) studentsQuery = studentsQuery.eq('academy_id', targetAcademyId);

        const { data: studentsData, error: studErr } = await studentsQuery;
        if (studErr) errMsg += `خطأ الطلاب: ${studErr.message} | `;
        setTopAchievers(studentsData || []);

        if (errMsg) {
          setDebugInfo(prev => ({ ...prev, error: errMsg }));
        }

      } catch (err) {
        setDebugInfo(prev => ({ ...prev, error: err.message || 'حدث خطأ غير متوقع' }));
      } finally {
        setLoading(false);
      }
    }

    fetchGamificationData();
  }, [propAcademyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[220px] text-amber-500 gap-2">
        <Loader2 className="animate-spin" size={28} />
        <span className="text-slate-400 text-sm">
          {isRtl ? 'جاري جلب البيانات...' : 'Loading data...'}
        </span>
      </div>
    );
  }

  const lang = isRtl ? 'ar' : 'en';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="flex flex-col gap-4 p-3 pb-10 box-border text-start"
    >
      {/* ⚠️ شريط التشخيص */}
      {debugInfo.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span><strong>تنبيه التشخيص:</strong> {debugInfo.error}</span>
        </div>
      )}

      {/* 👑 الهيدر والتنقل الرئيسي - الهوية القرآنية الحديثة */}
      <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Trophy size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 m-0">
              {isRtl ? 'لوحة الإنجازات والتحديات' : 'Gamification & Streaks'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 mb-0">
              {isRtl ? 'تحفيز الطلاب وتتبع الأوسمة والسلسلة اليومية' : 'Track student streaks & achievements'}
            </p>
          </div>
        </div>

        {/* أزرار التبويبات المتناسقة (زجاجية ومطفأة بذكاء) */}
        <div className="flex bg-[#090F16] p-1 rounded-xl border border-slate-800/80 w-full gap-1">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-1 rounded-lg cursor-pointer font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Crown size={14} />
            <span>{isRtl ? 'المتصدرين' : 'Leaderboard'}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-2 px-1 rounded-lg cursor-pointer font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'streaks' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Flame size={14} />
            <span>{isRtl ? 'السلسلة' : 'Streaks'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-1 rounded-lg cursor-pointer font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'badges' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Medal size={14} />
            <span>{isRtl ? 'الأوسمة' : 'Badges'} ({badges.length})</span>
          </button>
        </div>
      </div>

      {/* 🏆 قائمة المتصدرين */}
      {activeTab === 'leaderboard' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
          <h2 className="text-sm text-amber-400 mb-3.5 flex items-center gap-2 m-0 font-bold">
            <Crown size={16} />
            <span>{isRtl ? 'قائمة أعلى الطلاب إنجازاً' : 'Top Achievers'}</span>
          </h2>

          {topAchievers.length === 0 ? (
            <p className="text-slate-500 text-center py-5 text-xs m-0">
              {isRtl ? 'لا توجد بيانات طلاب حالياً' : 'No top achievers data found'}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {topAchievers.map((item, index) => {
                const pts = item.points || item.total_points || 0;
                const level = Math.floor(pts / 100) + 1;
                const progressInLevel = pts % 100;

                return (
                  <div 
                    key={item.id || index} 
                    className={`flex flex-col gap-2.5 p-3 rounded-xl transition-all border ${
                      index === 0 
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-sm' 
                        : 'bg-[#090F16] border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {index + 1}
                        </span>

                        <GraduationCap size={20} className={index === 0 ? 'text-amber-400' : 'text-slate-400'} />

                        <div>
                          <span className="text-slate-100 font-bold text-xs block">
                            {formatName(item.name, lang, isRtl ? 'طالب' : 'Student')}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {isRtl ? `المستوى ${level}` : `Level ${level}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg text-amber-400 font-bold text-xs border border-amber-500/20">
                        <Star size={12} className="fill-amber-400" />
                        <span>{pts}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progressInLevel, 100)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 🔥 السلسلة المتتالية - Streaks */}
      {activeTab === 'streaks' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
          <h2 className="text-sm text-emerald-400 mb-3.5 flex items-center gap-2 m-0 font-bold">
            <Flame size={16} className="text-emerald-400" />
            <span>{isRtl ? 'سلاسل المواظبة والالتزام' : 'Highest Daily Streaks'}</span>
          </h2>

          {streaks.length === 0 ? (
            <p className="text-slate-500 text-center py-5 text-xs m-0">
              {isRtl ? 'لا توجد سجلات مواظبة حتى الآن' : 'No streak records found'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {streaks.map((st, i) => {
                const currentStreak = st.current_streak || 0;
                const longestStreak = st.longest_streak || currentStreak;

                return (
                  <div key={st.id || i} className="bg-[#090F16] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-500/10 w-9 h-9 rounded-lg flex items-center justify-center border border-amber-500/20">
                        <Flame size={20} className="text-amber-400" />
                      </div>

                      <div>
                        <h3 className="text-slate-100 text-xs font-bold m-0 mb-0.5">
                          {formatName(st.name, lang, isRtl ? 'طالب' : 'Student')}
                        </h3>
                        <div className="text-slate-400 text-[11px]">
                          {isRtl ? `أفضل رقم: ${longestStreak} يوم` : `Best: ${longestStreak} days`}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0F172A] px-2.5 py-1.5 rounded-lg border border-slate-800 text-center">
                      <div className="text-amber-400 font-bold text-xs">
                        {currentStreak} {isRtl ? 'يوم' : 'Days'}
                      </div>
                      <div className="text-emerald-400 text-[10px] font-bold">
                        ⚡ {isRtl ? 'مستمر' : 'Active'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 🎖️ الأوسمة والإنجازات - Badges */}
      {activeTab === 'badges' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
          <h2 className="text-sm text-sky-400 mb-3.5 flex items-center gap-2 m-0 font-bold">
            <Medal size={16} />
            <span>{isRtl ? 'الأوسمة والإنجازات المتاحة' : 'Academy Badges'}</span>
          </h2>

          {badges.length === 0 ? (
            <p className="text-slate-500 text-center py-5 text-xs m-0">
              {isRtl ? 'لا توجد أوسمة مضافة لهذه الأكاديمية حالياً' : 'No badges available for this academy'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {badges.map((badge, index) => (
                <div key={badge.id || index} className="bg-[#090F16] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Medal size={20} />
                    </div>

                    <div>
                      <h3 className="text-slate-100 text-xs font-bold m-0 mb-0.5">
                        {badge.title || (isRtl ? 'وسام تفوق' : 'Achievement Badge')}
                      </h3>
                      <p className="text-slate-400 text-[11px] m-0 leading-tight">
                        {badge.description || (isRtl ? 'وسام تقديري للمواظبة والتفوق' : 'Reward for diligence and progress')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] px-2 py-1.5 rounded-lg border border-slate-800 text-center whitespace-nowrap">
                    <div className="text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Star size={12} className="fill-amber-400" />
                      <span>+{badge.points_rewarded || 50}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {isRtl ? 'جائزة' : 'Reward'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
            }
