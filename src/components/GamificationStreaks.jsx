import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FaTrophy, FaFire, FaMedal, FaStar, FaCrown, 
  FaUserGraduate, FaSpinner, FaAward 
} from 'react-icons/fa';

export default function GamificationStreaks({ academyId, isRtl = true }) {
  const [loading, setLoading] = useState(true);
  const [topAchievers, setTopAchievers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'badges' | 'streaks'

  useEffect(() => {
    async function fetchGamificationData() {
      setLoading(true);
      try {
        // -------------------------------------------------------------
        // 1. جلب قائمة المتصدرين والأوائل (مع التصفية بالأكاديمية)
        // -------------------------------------------------------------
        let achieversQuery = supabase
          .from('vw_top_achievers')
          .select('*')
          .limit(10);

        if (academyId) {
          achieversQuery = achieversQuery.eq('academy_id', academyId);
        }

        const { data: achieversData, error: achieversErr } = await achieversQuery;

        if (!achieversErr && achieversData && achieversData.length > 0) {
          setTopAchievers(achieversData);
        } else {
          // جلب بديل من جدول الطلاب النشطين فقط
          let studentsQuery = supabase
            .from('students')
            .select('id, name, avatar_url, status')
            .eq('status', 'active')
            .limit(10);

          if (academyId) {
            studentsQuery = studentsQuery.eq('academy_id', academyId);
          }

          const { data: studentsData } = await studentsQuery;
          setTopAchievers(studentsData || []);
        }

        // -------------------------------------------------------------
        // 2. جلب الأوسمة النشطة التابعة للأكاديمية
        // -------------------------------------------------------------
        let badgesQuery = supabase
          .from('badges')
          .select('*')
          .eq('is_active', true);

        if (academyId) {
          badgesQuery = badgesQuery.eq('academy_id', academyId);
        }

        const { data: badgesData, error: badgesErr } = await badgesQuery;
        if (badgesErr) console.error("خطأ جلب الأوسمة:", badgesErr);
        setBadges(badgesData || []);

        // -------------------------------------------------------------
        // 3. جلب بيانات التتابع والالتزام اليومي
        // -------------------------------------------------------------
        let streaksQuery = supabase
          .from('student_streaks')
          .select('*, students(name)')
          .order('current_streak', { ascending: false })
          .limit(10);

        if (academyId) {
          streaksQuery = streaksQuery.eq('academy_id', academyId);
        }

        const { data: streaksData, error: streaksErr } = await streaksQuery;
        if (streaksErr) console.error("خطأ جلب السلاسل:", streaksErr);
        setStreaks(streaksData || []);

      } catch (err) {
        console.error("Error fetching gamification data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (academyId) {
      fetchGamificationData();
    } else {
      setLoading(false);
    }
  }, [academyId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#F59E0B' }}>
        <FaSpinner className="fa-spin" style={{ fontSize: '32px' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 👑 الهيدر والرأس الرئيسي */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '16px', 
            background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' 
          }}>
            <FaTrophy />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF', margin: '0 0 4px 0' }}>
              {isRtl ? 'لوحة الإنجازات والتحديات' : 'Gamification & Streaks'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
              {isRtl ? 'تحفيز الطلاب وتتبع السلسلة اليومية والأوسمة المكتسبة' : 'Track student streaks, leaderboards and achievements'}
            </p>
          </div>
        </div>

        {/* أزرار التنقل السريع */}
        <div style={{ display: 'flex', background: '#090F17', padding: '4px', borderRadius: '10px', border: '1px solid #1E293B' }}>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              background: activeTab === 'leaderboard' ? '#F59E0B' : 'transparent',
              color: activeTab === 'leaderboard' ? '#000' : '#94A3B8'
            }}
          >
            🏆 {isRtl ? 'المتصدرين' : 'Leaderboard'}
          </button>
          <button 
            onClick={() => setActiveTab('streaks')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              background: activeTab === 'streaks' ? '#F59E0B' : 'transparent',
              color: activeTab === 'streaks' ? '#000' : '#94A3B8'
            }}
          >
            🔥 {isRtl ? 'السلسلة اليومية' : 'Streaks'}
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              background: activeTab === 'badges' ? '#F59E0B' : 'transparent',
              color: activeTab === 'badges' ? '#000' : '#94A3B8'
            }}
          >
            🎖️ {isRtl ? 'الأوسمة' : 'Badges'}
          </button>
        </div>
      </div>

      {/* 🥇 لوحة الصدارة والأوائل */}
      {activeTab === 'leaderboard' && (
        <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCrown /> {isRtl ? 'قائمة أعلى الطلاب إنجازاً' : 'Top Achievers'}
          </h2>

          {topAchievers.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>{isRtl ? 'لا توجد بيانات متاحة حالياً' : 'No top achievers data found'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topAchievers.map((item, index) => (
                <div key={item.id || index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: index === 0 ? 'rgba(245, 158, 11, 0.1)' : '#1E293B',
                  border: index === 0 ? '1px solid #F59E0B' : '1px solid #334155',
                  padding: '12px 16px', borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold', fontSize: '1.1rem', width: '28px', height: '28px', 
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : '#334155',
                      color: index < 3 ? '#000' : '#FFF'
                    }}>
                      {index + 1}
                    </span>
                    <FaUserGraduate style={{ color: '#38BDF8', fontSize: '18px' }} />
                    <span style={{ color: '#FFF', fontWeight: '600' }}>{item.name || item.student_name || 'طالب'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 'bold' }}>
                    <FaStar />
                    <span>{item.points || item.total_points || 0} {isRtl ? 'نقطة' : 'Pts'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔥 السلسلة المتتالية - Streaks */}
      {activeTab === 'streaks' && (
        <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#EF4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFire /> {isRtl ? 'أبرز سلاسل المواظبة والالتزام' : 'Highest Daily Streaks'}
          </h2>

          {streaks.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>{isRtl ? 'لا توجد بيانات مواظبة حالية' : 'No streak records found'}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {streaks.map((st, i) => (
                <div key={st.id || i} style={{ background: '#1E293B', padding: '16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <FaFire style={{ color: '#EF4444', fontSize: '32px', marginBottom: '8px' }} />
                  <h3 style={{ color: '#FFF', fontSize: '1rem', margin: '0 0 6px 0' }}>{st.students?.name || 'طالب'}</h3>
                  <div style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {st.current_streak || 0} {isRtl ? 'يوم متتالي' : 'Days'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🎖️ قائمة الأوسمة - Badges */}
      {activeTab === 'badges' && (
        <div style={{ background: '#111827', borderRadius: '16px', border: '1px solid #1F2937', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMedal /> {isRtl ? 'دليل الأوسمة والتحفيز' : 'Available Badges'}
          </h2>

          {badges.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>{isRtl ? 'لا توجد أوسمة مضافة' : 'No badges configured'}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {badges.map((badge, i) => (
                <div key={badge.id || i} style={{ background: '#1E293B', padding: '16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                  <FaAward style={{ color: '#10B981', fontSize: '36px', marginBottom: '8px' }} />
                  <h3 style={{ color: '#FFF', fontSize: '1rem', margin: '0 0 4px 0' }}>{badge.title}</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>{badge.description || (isRtl ? 'وسام تفوق' : 'Achievement Badge')}</p>
                  {badge.points_rewarded && (
                    <span style={{ display: 'inline-block', marginTop: '8px', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      +{badge.points_rewarded} {isRtl ? 'نقطة' : 'Pts'}
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
