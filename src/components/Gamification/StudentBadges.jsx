import React, { useMemo } from 'react';
import { Award, Flame, Star, Crown, Lock } from 'lucide-react';

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
      style={{
        background: '#0F172A',
        borderRadius: '16px',
        border: '1px solid #1E293B',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box',
        marginBottom: '20px'
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid #1E293B'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <Award size={18} color="#F59E0B" />
          </div>
          <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 'bold' }}>
            {isRtl ? 'شارات التميز والإتقان' : 'Mastery Badges'}
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#F59E0B',
          background: '#090F16',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          {unlockedCount} / {badges.length}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '10px'
      }}>
        {badges.map((badge) => (
          <div 
            key={badge.id}
            style={{
              position: 'relative',
              background: badge.unlocked ? 'rgba(9, 15, 22, 0.9)' : 'rgba(15, 23, 42, 0.4)',
              border: badge.unlocked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #1E293B',
              borderRadius: '12px',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              opacity: badge.unlocked ? 1 : 0.45,
              transition: 'all 0.2s ease',
              boxShadow: badge.unlocked ? '0 4px 14px rgba(245, 158, 11, 0.08)' : 'none'
            }}
          >
            {badge.unlocked ? (
              badge.count > 1 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  [isRtl ? 'left' : 'right']: '-6px',
                  background: '#F59E0B',
                  color: '#0F172A',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
                }}>
                  x{badge.count}
                </span>
              )
            ) : (
              <span style={{
                position: 'absolute',
                top: '6px',
                [isRtl ? 'left' : 'right']: '-6px',
                color: '#64748B'
              }}>
                <Lock size={12} />
              </span>
            )}

            <div style={{
              marginBottom: '6px',
              background: badge.unlocked ? 'rgba(245, 158, 11, 0.12)' : '#090F16',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {badge.icon}
            </div>

            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: badge.unlocked ? '#F8FAFC' : '#64748B',
              marginBottom: '3px'
            }}>
              {isRtl ? badge.titleAr : badge.titleEn}
            </div>

            <div style={{
              fontSize: '9.5px',
              color: badge.unlocked ? '#94A3B8' : '#475569',
              lineHeight: '1.3'
            }}>
              {isRtl ? badge.descAr : badge.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
