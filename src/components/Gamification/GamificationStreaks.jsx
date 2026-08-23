/* src/components/Gamification/GamificationStreaks.jsx */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { formatName } from '@/utils/formatters';
import { 
  Trophy, Flame, Medal, Star, Crown, 
  GraduationCap, Loader2, AlertTriangle 
} from 'lucide-react';
import AchievementChart from './AchievementChart';

export default function GamificationStreaks({ 
  academyId: propAcademyId, 
  isRtl = true, 
  initialTab = 'leaderboard' 
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || (isRtl ? 'ar' : 'en');
  const isEnglish = currentLang.startsWith('en');

  const [loading, setLoading] = useState(true);
  const [topAchievers, setTopAchievers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); 
  const [debugInfo, setDebugInfo] = useState({ currentAcademyId: null, error: null });

  // 1️⃣ مزامنة التبويب فور الضغط عليه من القائمة الجانبية
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

          if (acadErr) errMsg += `Academy Error: ${acadErr.message} | `;
          if (academyData?.id) targetAcademyId = academyData.id;
        }

        setDebugInfo({ currentAcademyId: targetAcademyId || 'N/A', error: null });

        // 2️⃣ جلب الأوسمة وإزالة التكرار بدقة
        let badgesQuery = supabase.from('badges').select('*');
        if (targetAcademyId) badgesQuery = badgesQuery.eq('academy_id', targetAcademyId);

        const { data: badgesData, error: badgesErr } = await badgesQuery;
        if (badgesErr) errMsg += `Badges Error: ${badgesErr.message} | `;
        
        const uniqueBadgesMap = new Map();
        (badgesData || []).forEach(item => {
          const key = (item.title || item.title_ar || item.id || '').trim().toLowerCase();
          if (key && !uniqueBadgesMap.has(key)) {
            uniqueBadgesMap.set(key, item);
          }
        });
        
        setBadges(Array.from(uniqueBadgesMap.values()));

        // 3️⃣ جلب الطلاب والمتصدرين
        let studentsQuery = supabase
          .from('students')
          .select('id, name, current_streak, longest_streak, points')
          .order('points', { ascending: false })
          .limit(10);

        if (targetAcademyId) studentsQuery = studentsQuery.eq('academy_id', targetAcademyId);

        const { data: studentsData, error: studErr } = await studentsQuery;
        if (studErr) errMsg += `Students Error: ${studErr.message} | `;
        
        const processedStudents = (studentsData || []).map(student => ({
          ...student,
          current_streak: student.current_streak || 0,
          points: student.points || 0
        }));

        setTopAchievers(processedStudents);
        setStreaks([...processedStudents].sort((a, b) => b.current_streak - a.current_streak));

        if (errMsg) setDebugInfo(prev => ({ ...prev, error: errMsg }));

      } catch (err) {
        setDebugInfo(prev => ({ ...prev, error: err.message || 'Unexpected Error' }));
      } finally {
        setLoading(false);
      }
    }

    fetchGamificationData();
  }, [propAcademyId]);

  // دالة ذكية لاستخراج النص الصحيح بدون حوادث كسور اللغات
  const getBadgeContent = (badge, isTitle = true) => {
    if (isEnglish) {
      if (isTitle) return badge.title_en || badge.title || 'Achievement Badge';
      return badge.description_en || badge.description || 'Reward for student performance';
    }
    
    if (isTitle) return badge.title_ar || badge.title || 'وسام إنجاز';
    
    // حل مشكلة التكرار (العنوان مساوي للوصف)
    const desc = badge.description_ar || badge.description;
    const title = badge.title_ar || badge.title;
    if (!desc || desc === title) {
      return 'وسام تشجيعي للتفوق والمواظبة';
    }
    return desc;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[220px] text-amber-500 gap-2">
        <Loader2 className="animate-spin" size={28} />
        <span className="text-slate-400 text-sm">
          {isEnglish ? 'Loading data...' : 'جاري جلب البيانات...'}
        </span>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col gap-4 p-3 pb-10 box-border text-start">
      
      {debugInfo.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span><strong>{isEnglish ? 'Diagnostic Alert' : 'تنبيه التشخيص'}:</strong> {debugInfo.error}</span>
        </div>
      )}

      {/* الهيدر الرئيسي والتنقل */}
      <div className="bg-[#0F172A] p-4 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Trophy size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 m-0">
              {isEnglish ? 'Gamification & Streaks' : 'لوحة الإنجازات والتحديات'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 mb-0">
              {isEnglish ? 'Track student streaks & achievements' : 'تحفيز الطلاب وتتبع الأوسمة والسلسلة اليومية'}
            </p>
          </div>
        </div>

        <div className="flex bg-[#090F16] p-1 rounded-xl border border-slate-800/80 w-full gap-1">
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown size={14} />
            <span>{isEnglish ? 'Leaderboard' : 'المتصدرين'}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'streaks' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={14} />
            <span>{isEnglish ? 'Streaks' : 'السلسلة'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-1 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'badges' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Medal size={14} />
            <span>{isEnglish ? 'Badges' : 'الأوسمة'} ({badges.length})</span>
          </button>
        </div>
      </div>

      {/* 1️⃣ تبويب المتصدرين */}
      {activeTab === 'leaderboard' && (
        <>
          <AchievementChart isRtl={isRtl} />

          <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
            <h2 className="text-sm text-amber-400 mb-3.5 flex items-center gap-2 font-bold">
              <Crown size={16} />
              <span>{isEnglish ? 'Top Achievers' : 'قائمة أعلى الطلاب إنجازاً'}</span>
            </h2>

            <div className="flex flex-col gap-2.5">
              {topAchievers.map((item, index) => {
                const pts = item.points || 0;
                const level = Math.floor(pts / 50) + 1;
                const progressInLevel = ((pts % 50) / 50) * 100;

                return (
                  <div key={item.id || index} className="flex flex-col gap-2 p-3 bg-[#090F16] rounded-xl border border-slate-800/80">
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
                            {formatName(item.name, currentLang, isEnglish ? 'Student' : 'طالب')}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {isEnglish ? `Level ${level}` : `المستوى ${level}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-400 font-bold text-xs border border-amber-500/20" dir="ltr">
                        <Star size={12} className="fill-amber-400" />
                        <span>+{pts}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${progressInLevel}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 2️⃣ تبويب السلسلة */}
      {activeTab === 'streaks' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
          <h2 className="text-sm text-emerald-400 mb-3.5 flex items-center gap-2 font-bold">
            <Flame size={16} />
            <span>{isEnglish ? 'Daily Streaks' : 'سلاسل المواظبة والالتزام'}</span>
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {streaks.map((st, i) => (
              <div key={st.id || i} className="bg-[#090F16] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500/10 w-9 h-9 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <Flame size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 text-xs font-bold m-0">
                      {formatName(st.name, currentLang, isEnglish ? 'Student' : 'طالب')}
                    </h3>
                    <div className="text-slate-400 text-[11px]">
                      {isEnglish ? `Best: ${st.longest_streak || st.current_streak} days` : `أفضل رقم: ${st.longest_streak || st.current_streak} يوم`}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-amber-400 font-bold text-xs">
                    {st.current_streak} {isEnglish ? 'Days' : 'يوم'}
                  </div>
                  <div className="text-emerald-400 text-[10px] font-bold">
                    ⚡ {st.current_streak > 0 ? (isEnglish ? 'Active' : 'مستمر') : (isEnglish ? 'Inactive' : 'غير نشط')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3️⃣ تبويب الأوسمة */}
      {activeTab === 'badges' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800/80 p-4">
          <h2 className="text-sm text-sky-400 mb-3.5 flex items-center gap-2 font-bold">
            <Medal size={16} />
            <span>{isEnglish ? 'Academy Badges' : 'الأوسمة والإنجازات المتاحة'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {badges.map((badge, index) => (
              <div key={badge.id || index} className="bg-[#090F16] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Medal size={20} />
                  </div>
                  <div>
                    <h3 className="text-slate-100 text-xs font-bold m-0">
                      {getBadgeContent(badge, true)}
                    </h3>
                    <p className="text-slate-400 text-[11px] m-0 leading-tight mt-0.5">
                      {getBadgeContent(badge, false)}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0F172A] px-2.5 py-1.5 rounded-lg border border-slate-800 text-center shrink-0" dir="ltr">
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star size={12} className="fill-amber-400" />
                    <span>+{badge.points_rewarded || 50}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
