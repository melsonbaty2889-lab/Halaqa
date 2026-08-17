/* src/components/Dashboard/AcademyDashboard.jsx */
import React from 'react';
import { 
  BookOpen, 
  Award, 
  MessageCircle, 
  GraduationCap, 
  Clock, 
  Landmark, 
  CheckCircle2 
} from 'lucide-react';

import styles from '@/components/Dashboard/Dashboard.module.css';
import ActiveHalaqas from '@/components/Dashboard/ActiveHalaqas';
import AchievementChart from '@/components/Gamification/AchievementChart';
import { colors as C } from '@/theme/colors';

export default function AcademyDashboard({ 
  isRtl, 
  greeting, 
  academyName, 
  stats = {}, 
  setActiveTab, 
  t 
}) {
  const getText = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return isRtl ? (val.ar || val.en || fallback) : (val.en || val.ar || fallback);
    }
    return fallback;
  };

  const translate = (key, fallback) => {
    if (typeof t === 'function') {
      const res = t(key);
      if (res && typeof res !== 'object') return res;
      if (res && typeof res === 'object') return getText(res, fallback);
    }
    return fallback;
  };

  const studentsCount = stats.studentsCount !== undefined ? stats.studentsCount : (stats.students || 0);
  const pendingCount = stats.overdueCount !== undefined ? stats.overdueCount : (stats.pending || 0);
  const activeHalagas = stats.activeHalagas || 0;
  const completedExams = stats.completedExams || 0;
  const attendanceRate = stats.attendanceRate || null;
  const totalPagesMuted = stats.totalPagesMuted || null;

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '10px 0' }}>
      
      {/* 🟢 الهيدر والترحيب */}
      <header className={styles.academyHeader} style={{ marginBottom: '32px' }}>
        <div>
          <h1 className={styles.academyGreeting} style={{ fontSize: '1.4rem', fontWeight: '800', color: C.text.title, margin: '0 0 6px 0' }}>
            {getText(greeting, isRtl ? 'مرحباً بك' : 'Welcome')}
          </h1>
          <p className={styles.academyNameText} style={{ color: C.primary.DEFAULT, fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>
            {getText(academyName, isRtl ? 'الأكاديمية القرآنيّة الرقمية' : 'Digital Quran Academy')}
          </p>
        </div>
      </header>

      {/* ⚡ الإجراءات السريعة */}
      <section className={styles.sectionQuickActions} style={{ marginBottom: '35px' }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: C.text.title, marginBottom: '16px' }}>
          <span>⚡</span> {translate('quick_actions', isRtl ? 'الإجراءات السريعة والمباشرة' : 'Quick Actions')}
        </h2>
        
        <div className={styles.actionsContainer} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
          <button 
            onClick={() => setActiveTab('attendance')} 
            className="btn-primary"
            style={{ padding: '14px 18px', borderRadius: '14px', justifyContent: 'flex-start' }}
          >
            <div className={styles.actionInner} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '10px', color: '#FFF' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                {translate('action_attendance', isRtl ? 'رصد التحضير، وتسميع الحلقات اليومية فورا' : 'Take Attendance & Daily Recitation')}
              </div>
            </div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button 
              onClick={() => setActiveTab('exams')} 
              className="btn-secondary" 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
            >
              <Award style={{ color: C.primary.DEFAULT }} size={22} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: C.text.title }}>
                {translate('action_exams', isRtl ? 'الاختبارات والترقيات' : 'Exams & Levels')}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')} 
              className="btn-secondary" 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
            >
              <MessageCircle style={{ color: C.brandEmerald.DEFAULT }} size={22} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: C.text.title }}>
                {translate('action_reports', isRtl ? 'تقارير أولياء الأمور' : 'Parent Reports')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 📊 مؤشرات الأداء */}
      <section className={styles.sectionOverview}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: C.text.title, marginBottom: '16px' }}>
          <span>📊</span> {translate('academy_overview', isRtl ? 'مؤشرات الأداء العام للأكاديمية' : 'Academy Overview')}
        </h2>

        <div className={styles.statsGrid}>
          {/* الطلاب */}
          <div className="card-surface" style={{ padding: '16px', borderRadius: '16px' }}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel} style={{ color: C.text.muted }}>{translate('total_students', isRtl ? 'إجمالي الطلاب' : 'Total Students')}</p>
              <h2 className={styles.statNumber} style={{ color: C.text.title }}>{studentsCount}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: C.primary.DEFAULT }}><GraduationCap size={24} /></div>
          </div>

          {/* نسبة الحضور */}
          {attendanceRate !== null && (
            <div className="card-surface" style={{ padding: '16px', borderRadius: '16px', borderBottom: `3px solid ${C.brandEmerald.DEFAULT}` }}>
              <div className={styles.statBoxInfo}>
                <p className={styles.statLabel} style={{ color: C.text.muted }}>{isRtl ? 'نسبة الحضور اليومي' : 'Attendance Rate'}</p>
                <h2 className={styles.statNumber} style={{ color: C.brandEmerald.DEFAULT }}>{attendanceRate}</h2>
              </div>
              <div className={styles.statIcon} style={{ color: C.brandEmerald.DEFAULT }}><CheckCircle2 size={24} /></div>
            </div>
          )}

          {/* الصفحات المسمعة */}
          {totalPagesMuted !== null && (
            <div className="card-surface" style={{ padding: '16px', borderRadius: '16px', borderBottom: `3px solid ${C.brandEmerald.DEFAULT}` }}>
              <div className={styles.statBoxInfo}>
                <p className={styles.statLabel} style={{ color: C.text.muted }}>{isRtl ? 'صفحات القرآن المسمّعة اليوم' : 'Pages Recited Today'}</p>
                <h2 className={styles.statNumber} style={{ color: C.brandEmerald.DEFAULT }}>{totalPagesMuted}</h2>
              </div>
              <div className={styles.statIcon} style={{ color: C.brandEmerald.DEFAULT }}><BookOpen size={24} /></div>
            </div>
          )}

          {/* الرسوم المعلقة */}
          <div className="card-surface" style={{ padding: '16px', borderRadius: '16px' }}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel} style={{ color: C.text.muted }}>{translate('pending_payments', isRtl ? 'المدفوعات المعلقة' : 'Pending Payments')}</p>
              <h2 className={styles.statNumber} style={{ color: pendingCount > 0 ? C.error.DEFAULT : C.text.title }}>{pendingCount}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: pendingCount > 0 ? C.error.DEFAULT : C.text.muted }}><Clock size={24} /></div>
          </div>

          {/* الحلقات النشطة */}
          <div className="card-surface" style={{ padding: '16px', borderRadius: '16px' }}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel} style={{ color: C.text.muted }}>{translate('active_halagas', isRtl ? 'الحلقات النشطة' : 'Active Halaqas')}</p>
              <h2 className={styles.statNumber} style={{ color: C.text.title }}>{activeHalagas}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: C.primary.DEFAULT }}><Landmark size={24} /></div>
          </div>

          {/* الاختبارات المكتملة */}
          <div className="card-surface" style={{ padding: '16px', borderRadius: '16px' }}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel} style={{ color: C.text.muted }}>{translate('completed_exams', isRtl ? 'الاختبارات المكتملة' : 'Completed Exams')}</p>
              <h2 className={styles.statNumber} style={{ color: C.brandEmerald.DEFAULT }}>{completedExams}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: C.brandEmerald.DEFAULT }}><CheckCircle2 size={24} /></div>
          </div>
        </div>
      </section>

      {/* 📈 المكونات الفرعية */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '30px' }}>
        <ActiveHalaqas isRtl={isRtl} t={t} halaqas={stats.activeHalaqasData} />
        <AchievementChart isRtl={isRtl} />
      </section>
    </div>
  );
}
