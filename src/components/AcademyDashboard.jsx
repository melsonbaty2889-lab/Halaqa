/* src/components/AcademyDashboard.jsx */
import React from 'react';
import styles from './Dashboard.module.css';
import { 
  BookOpen, 
  Award, 
  MessageCircle, 
  GraduationCap, 
  Clock, 
  Landmark, 
  CheckCircle2 
} from 'lucide-react';
import ActiveHalaqas from './ActiveHalaqas';
import AchievementChart from './AchievementChart';

export default function AcademyDashboard({ 
  isRtl, 
  greeting, 
  academyName, 
  stats = {}, 
  setActiveTab, 
  t 
}) {
  // 🛡️ دالة مساعدة لمنع React Error #31 وتأمين استخراج النص
  const getText = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return isRtl ? (val.ar || val.en || fallback) : (val.en || val.ar || fallback);
    }
    return fallback;
  };

  // 🛡️ دالة آمنة للاستدعاء للترجمة t
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
          <h1 className={styles.academyGreeting} style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF', margin: '0 0 6px 0' }}>
            {getText(greeting, isRtl ? 'مرحباً بك' : 'Welcome')}
          </h1>
          <p className={styles.academyNameText} style={{ color: '#FBBF24', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
            {getText(academyName, isRtl ? 'الأكاديمية القرآنيّة الرقمية' : 'Digital Quran Academy')}
          </p>
        </div>
      </header>

      {/* ⚡ الإجراءات السريعة */}
      <section className={styles.sectionQuickActions} style={{ marginBottom: '35px' }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
          <span>⚡</span> {translate('quick_actions', isRtl ? 'الإجراءات السريعة والمباشرة' : 'Quick Actions')}
        </h2>
        
        <div className={styles.actionsContainer} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
          <button onClick={() => setActiveTab('attendance')} className={`${styles.premiumLaunchpadCard} ${styles.longCard}`}>
            <div className={styles.actionInner} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={styles.launchpadIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '10px', color: '#3B82F6' }}>
                <BookOpen size={20} />
              </div>
              <div className={styles.actionTitleText} style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                {translate('action_attendance', isRtl ? 'رصد التحضير، وتسميع الحلقات اليومية فورا' : 'Take Attendance & Daily Recitation')}
              </div>
            </div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button onClick={() => setActiveTab('exams')} className={styles.premiumLaunchpadCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
              <Award style={{ color: '#FBBF24' }} size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>
                {translate('action_exams', isRtl ? 'الاختبارات والترقيات' : 'Exams & Levels')}
              </span>
            </button>

            <button onClick={() => setActiveTab('reports')} className={styles.premiumLaunchpadCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
              <MessageCircle style={{ color: '#10B981' }} size={22} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>
                {translate('action_reports', isRtl ? 'تقارير أولياء الأمور' : 'Parent Reports')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 📊 مؤشرات الأداء */}
      <section className={styles.sectionOverview}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
          <span>📊</span> {translate('academy_overview', isRtl ? 'مؤشرات الأداء العام للأكاديمية' : 'Academy Overview')}
        </h2>

        <div className={styles.statsGrid}>
          {/* الطلاب */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{translate('total_students', isRtl ? 'إجمالي الطلاب' : 'Total Students')}</p>
              <h2 className={styles.statNumber}>{studentsCount}</h2>
            </div>
            <div className={styles.statIcon}><GraduationCap size={24} /></div>
          </div>

          {/* نسبة الحضور */}
          {attendanceRate !== null && (
            <div className={styles.premiumStatBox} style={{ borderBottom: '3px solid #3B82F6' }}>
              <div className={styles.statBoxInfo}>
                <p className={styles.statLabel}>{isRtl ? 'نسبة الحضور اليومي' : 'Attendance Rate'}</p>
                <h2 className={styles.statNumber} style={{ color: '#3B82F6' }}>{attendanceRate}</h2>
              </div>
              <div className={styles.statIcon}><CheckCircle2 style={{ color: '#3B82F6' }} size={24} /></div>
            </div>
          )}

          {/* الصفحات المسمعة */}
          {totalPagesMuted !== null && (
            <div className={styles.premiumStatBox} style={{ borderBottom: '3px solid #10B981' }}>
              <div className={styles.statBoxInfo}>
                <p className={styles.statLabel}>{isRtl ? 'صفحات القرآن المسمّعة اليوم' : 'Pages Recited Today'}</p>
                <h2 className={styles.statNumber} style={{ color: '#10B981' }}>{totalPagesMuted}</h2>
              </div>
              <div className={styles.statIcon}><BookOpen style={{ color: '#10B981' }} size={24} /></div>
            </div>
          )}

          {/* الرسوم المعلقة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{translate('pending_payments', isRtl ? 'المدفوعات المعلقة' : 'Pending Payments')}</p>
              <h2 className={styles.statNumber} style={{ color: pendingCount > 0 ? '#F87171' : 'inherit' }}>{pendingCount}</h2>
            </div>
            <div className={styles.statIcon}><Clock size={24} /></div>
          </div>

          {/* الحلقات النشطة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{translate('active_halagas', isRtl ? 'الحلقات النشطة' : 'Active Halaqas')}</p>
              <h2 className={styles.statNumber}>{activeHalagas}</h2>
            </div>
            <div className={styles.statIcon}><Landmark size={24} /></div>
          </div>

          {/* الاختبارات المكتملة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{translate('completed_exams', isRtl ? 'الاختبارات المكتملة' : 'Completed Exams')}</p>
              <h2 className={styles.statNumber}>{completedExams}</h2>
            </div>
            <div className={styles.statIcon}><CheckCircle2 size={24} /></div>
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
