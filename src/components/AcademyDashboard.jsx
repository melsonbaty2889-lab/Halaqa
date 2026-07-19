/* src/components/AcademyDashboard.jsx */
import React from 'react';
import styles from './Dashboard.module.css';
import { 
  FaBookOpen, 
  FaAward, 
  FaWhatsapp, 
  FaUserGraduate, 
  FaUserClock, 
  FaMosque, 
  FaCheckCircle
} from 'react-icons/fa';
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
  const studentsCount = stats.studentsCount !== undefined ? stats.studentsCount : (stats.students || 0);
  const pendingCount = stats.overdueCount !== undefined ? stats.overdueCount : (stats.pending || 0);
  const activeHalagas = stats.activeHalagas || 0;
  const completedExams = stats.completedExams || 0;
  const attendanceRate = stats.attendanceRate || null;
  const totalPagesMuted = stats.totalPagesMuted || null;

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '10px 0' }}>
      
      <header className={styles.academyHeader} style={{ marginBottom: '32px' }}>
        <div>
          <h1 className={styles.academyGreeting} style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF', margin: '0 0 6px 0' }}>{greeting}</h1>
          <p className={styles.academyNameText} style={{ color: '#FBBF24', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{academyName || (isRtl ? 'الأكاديمية القرآنيّة الرقمية' : 'Digital Quran Academy')}</p>
        </div>
      </header>

      <section className={styles.sectionQuickActions} style={{ marginBottom: '35px' }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
          <span>⚡</span> {t('quick_actions') || (isRtl ? 'الإجراءات السريعة والمباشرة' : 'Quick Actions')}
        </h2>
        <div className={styles.actionsContainer} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
          <button onClick={() => setActiveTab('attendance')} className={`${styles.premiumLaunchpadCard} ${styles.longCard}`}>
            <div className={styles.actionInner} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={styles.launchpadIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.1)', p: '10px', borderRadius: '10px', color: '#3B82F6' }}><FaBookOpen /></div>
              <div className={styles.actionTitleText} style={{ fontWeight: '700', fontSize: '0.9rem' }}>{t('action_attendance') || (isRtl ? 'رصد التحضير، وتسميع الحلقات اليومية فورا' : 'Take Attendance & Daily Recitation')}</div>
            </div>
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button onClick={() => setActiveTab('exams')} className={styles.premiumLaunchpadCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
              <FaAward style={{ color: '#FBBF24', fontSize: '1.2rem' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{t('action_exams') || (isRtl ? 'الاختبارات والترقيات' : 'Exams & Levels')}</span>
            </button>
            <button onClick={() => setActiveTab('reports')} className={styles.premiumLaunchpadCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
              <FaWhatsapp style={{ color: '#10B981', fontSize: '1.2rem' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{t('action_reports') || (isRtl ? 'تقارير أولياء الأمور' : 'Parent Reports')}</span>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.sectionOverview}>
        <h2 className={styles.sectionTitle} style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', marginBottom: '16px' }}>
          <span>📊</span> {t('academy_overview') || (isRtl ? 'مؤشرات الأداء العام للأكاديمية' : 'Academy Overview')}
        </h2>
        <div className={styles.statsGrid}>
          <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
            <div className={styles.statBoxInfo}><p className={styles.statLabel}>{t('total_students')}</p><h2 className={styles.statNumber}>{studentsCount}</h2></div>
            <div className={styles.statIcon}><FaUserGraduate /></div>
          </div>
          {attendanceRate !== null && (
            <div className={styles.premiumStatBox} style={{ borderBottom: '3px solid #3B82F6' }}>
              <div className={styles.statBoxInfo}><p className={styles.statLabel}>{isRtl ? 'نسبة الحضور اليومي' : 'Attendance Rate'}</p><h2 className={styles.statNumber} style={{ color: '#3B82F6' }}>{attendanceRate}</h2></div>
              <div className={styles.statIcon}><FaCheckCircle style={{ color: '#3B82F6' }} /></div>
            </div>
          )}
          {totalPagesMuted !== null && (
            <div className={styles.premiumStatBox} style={{ borderBottom: '3px solid #10B981' }}>
              <div className={styles.statBoxInfo}><p className={styles.statLabel}>{isRtl ? 'صفحات القرآن المسمّعة اليوم' : 'Pages Recited Today'}</p><h2 className={styles.statNumber} style={{ color: '#10B981' }}>{totalPagesMuted}</h2></div>
              <div className={styles.statIcon}><FaBookOpen style={{ color: '#10B981' }} /></div>
            </div>
          )}
          <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
            <div className={styles.statBoxInfo}><p className={styles.statLabel}>{t('pending_payments')}</p><h2 className={styles.statNumber} style={{ color: pendingCount > 0 ? '#F87171' : 'inherit' }}>{pendingCount}</h2></div>
            <div className={styles.statIcon}><FaUserClock /></div>
          </div>
          <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`}>
            <div className={styles.statBoxInfo}><p className={styles.statLabel}>{t('active_halagas')}</p><h2 className={styles.statNumber}>{activeHalagas}</h2></div>
            <div className={styles.statIcon}><FaMosque /></div>
          </div>
          <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`}>
            <div className={styles.statBoxInfo}><p className={styles.statLabel}>{t('completed_exams')}</p><h2 className={styles.statNumber}>{completedExams}</h2></div>
            <div className={styles.statIcon}><FaCheckCircle /></div>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '30px' }}>
        <ActiveHalaqas isRtl={isRtl} t={t} halaqas={stats.activeHalaqasData} />
        <AchievementChart isRtl={isRtl} />
      </section>
    </div>
  );
}
