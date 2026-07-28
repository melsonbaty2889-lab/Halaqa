import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaTrophy, FaFire, FaMedal, FaStar, FaCrown, 
  FaUserGraduate, FaSpinner, FaAward, FaExclamationTriangle 
} from 'react-icons/fa';

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
        // 1️⃣ البحث عن ID الأكاديمية
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

        // 2️⃣ جلب الأوسمة النشطة
        let badgesQuery = supabase.from('badges').select('*');
        if (targetAcademyId) badgesQuery = badgesQuery.eq('academy_id', targetAcademyId);

        const { data: badgesData, error: badgesErr } = await badgesQuery;
        if (badgesErr) errMsg += `خطأ الأوسمة: ${badgesErr.message} | `;
        setBadges(badgesData || []);

        // 3️⃣ جلب بيانات التتابع (Streaks)
        let streaksQuery = supabase.from('student_streaks').select('*, students(name)').limit(10);
        if (targetAcademyId) streaksQuery = streaksQuery.eq('academy_id', targetAcademyId);

        const { data: streaksData, error: streaksErr } = await streaksQuery;
        if (streaksErr) errMsg += `خطأ السلاسل: ${streaksErr.message} | `;
        setStreaks(streaksData || []);

        // 4️⃣ جلب المتصدرين (بدون طلب أعمدة غير موجودة)
let studentsQuery = supabase
  .from('students')
  .select('id, name, avatar_url')
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: '#F59E0B' }}>
        <FaSpinner className="fa-spin" style={{ fontSize: '28px' }} />
        <span style={{ marginRight: '10px', color: '#94A3B8' }}>جاري جلب البيانات...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', direction: isRtl ? 'rtl' : 'ltr', padding: '8px' }}>
      
      {/* ⚠️ شريط التشخيص لمعرفة السبب فوراً على الموبايل */}
      {debugInfo.error && (
        <div style={{ background: '#451A1A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '12px', borderRadius: '10px', fontSize: '0.85rem' }}>
          <FaExclamationTriangle style={{ marginLeft: '6px', color: '#EF4444' }} />
          <strong>تنبيه التشخيص:</strong> {debugInfo.error}
        </div>
      )}

      {/* 👑 الهيدر والرأس الرئيسي */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
        padding: '16px', 
        borderRadius: '16px', 
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '44px', height: '44px', borderRadius: '12px', 
            background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', shrink: 0
          }}>
            <FaTrophy />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFF', margin: 0 }}>
              {isRtl ? 'لوحة الإنجازات والتحديات' : 'Gamification & Streaks'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>
              {isRtl ? 'تحفيز الطلاب وتتبع الأوسمة والسلسلة اليومية' : 'Track student streaks & achievements'}
            </p>
          </div>
        </div>

        {/* أزرار التنقل السريع */}
        <div style={{ display: 'flex', background: '#090F17', padding: '4px', borderRadius: '10px', border: '1px solid #1E293B', width: '100%' }}>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
              background: activeTab === 'leaderboard' ? '#F59E0B' : 'transparent',
              color: activeTab === 'leaderboard' ? '#000' : '#94A3B8'
            }}
          >
            🏆 {isRtl ? 'المتصدرين' : 'Leaderboard'}
          </button>
          <button 
            onClick={() => setActiveTab('streaks')}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
              background: activeTab === 'streaks' ? '#F59E0B' : 'transparent',
              color: activeTab === 'streaks' ? '#000' : '#94A3B8'
            }}
          >
            🔥 {isRtl ? 'السلسلة' : 'Streaks'}
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
              background: activeTab === 'badges' ? '#F59E0B' : 'transparent',
              color: activeTab === 'badges' ? '#000' : '#94A3B8'
            }}
          >
            🎖️ {isRtl ? 'الأوسمة' : 'Badges'} ({badges.length})
          </button>
        </div>
      </div>

      {/* 🥇 المتصدرين (تصميم بطل المراكز وشريط التقدم) */}
{activeTab === 'leaderboard' && (
  <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '16px' }}>
    <h2 style={{ fontSize: '1rem', color: '#F59E0B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FaCrown /> {isRtl ? 'قائمة أعلى الطلاب إنجازاً' : 'Top Achievers'}
    </h2>

    {topAchievers.length === 0 ? (
      <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '16px', fontSize: '0.85rem' }}>
        {isRtl ? 'لا توجد بيانات طلاب حالياً' : 'No top achievers data found'}
      </p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {topAchievers.map((item, index) => {
          // نقاط الطالب وحساب المستوى
          const pts = item.points || item.total_points || 0;
          const level = Math.floor(pts / 100) + 1;
          const progressInLevel = pts % 100; // نسبة التقدم للمستوى التالي

          // أوسمة المراكز الثلاثة الأولى
          const rankBadges = ['🥇', '🥈', '🥉'];

          return (
            <div key={item.id || index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: index === 0 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 1) 100%)' 
                : '#1E293B',
              border: index === 0 ? '1px solid #F59E0B' : '1px solid #334155',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: index === 0 ? '0 4px 12px rgba(245, 158, 11, 0.12)' : 'none'
            }}>
              {/* الصف العلوي: المركز والاسم والنقاط */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* شارة المركز */}
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: index < 3 ? '1.2rem' : '0.8rem', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: index < 3 ? 'transparent' : '#334155',
                    color: index < 3 ? 'inherit' : '#94A3B8'
                  }}>
                    {index < 3 ? rankBadges[index] : index + 1}
                  </span>

                  <FaUserGraduate style={{ color: index === 0 ? '#F59E0B' : '#38BDF8', fontSize: '18px' }} />

                  <div>
                    <span style={{ color: '#FFF', fontWeight: '700', fontSize: '0.92rem', display: 'block' }}>
                      {item.name || 'طالب'}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                      {isRtl ? `المستوى ${level}` : `Level ${level}`}
                    </span>
                  </div>
                </div>

                {/* شارة النقاط */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  background: 'rgba(245, 158, 11, 0.12)', padding: '4px 8px', borderRadius: '8px',
                  color: '#F59E0B', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid rgba(245, 158, 11, 0.25)'
                }}>
                  <FaStar />
                  <span>{pts}</span>
                </div>
              </div>

              {/* شريط التقدم الدقيق نحو المستوى التالي */}
              <div style={{ width: '100%', background: '#0F172A', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(progressInLevel, 100)}%`, 
                  background: 'linear-gradient(90deg, #F59E0B, #10B981)', 
                  height: '100%',
                  transition: 'width 0.4s ease'
                }} />
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
  <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '16px' }}>
    <h2 style={{ fontSize: '1rem', color: '#EF4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <FaFire style={{ filter: 'drop-shadow(0 0 4px #EF4444)' }} /> {isRtl ? 'سلاسل المواظبة والالتزام' : 'Highest Daily Streaks'}
    </h2>

    {streaks.length === 0 ? (
      <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '16px', fontSize: '0.85rem' }}>
        {isRtl ? 'لا توجد سجلات مواظبة حتى الآن' : 'No streak records found'}
      </p>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {streaks.map((st, i) => {
          const currentStreak = st.current_streak || 0;
          const longestStreak = st.longest_streak || currentStreak;

          return (
            <div key={st.id || i} style={{ 
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
              padding: '12px 14px', 
              borderRadius: '12px', 
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* القسم الأيمن: أيقونة الشعلة واسم الطالب */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <FaFire style={{ color: '#EF4444', fontSize: '22px', filter: 'drop-shadow(0 0 6px #EF4444)' }} />
                </div>

                <div>
                  <h3 style={{ color: '#FFF', fontSize: '0.9rem', fontWeight: '700', margin: '0 0 2px 0' }}>
                    {st.students?.name || st.student_name || 'طالب'}
                  </h3>
                  <div style={{ color: '#64748B', fontSize: '0.72rem' }}>
                    {isRtl ? `أفضل رقم: ${longestStreak} يوم` : `Best: ${longestStreak} days`}
                  </div>
                </div>
              </div>

              {/* القسم الأيسر: عدد الأيام الحالية */}
              <div style={{ 
                background: '#090D16', 
                padding: '6px 12px', 
                borderRadius: '8px', 
                border: '1px solid #1E293B',
                textAlign: 'center'
              }}>
                <div style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {currentStreak} {isRtl ? 'يوم' : 'Days'}
                </div>
                <div style={{ color: '#10B981', fontSize: '0.65rem', fontWeight: '600' }}>
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

      {/* 🎖️ الأوسمة - Badges */}
      {activeTab === 'badges' && (
        <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '16px' }}>
          <h2 style={{ fontSize: '1rem', color: '#10B981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMedal /> {isRtl ? 'دليل الأوسمة' : 'Available Badges'}
          </h2>

          {badges.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '16px', fontSize: '0.85rem' }}>
              {isRtl ? 'لا توجد أوسمة مضافة' : 'No badges configured'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {badges.map((badge, i) => (
                <div key={badge.id || i} style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                  <FaAward style={{ color: '#10B981', fontSize: '28px', marginBottom: '4px' }} />
                  <h3 style={{ color: '#FFF', fontSize: '0.85rem', margin: '0 0 4px 0' }}>{badge.title}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0 }}>{badge.description || 'وسام تفوق'}</p>
                  {badge.points_rewarded && (
                    <span style={{ display: 'block', marginTop: '6px', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      +{badge.points_rewarded} نقطة
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
        }
