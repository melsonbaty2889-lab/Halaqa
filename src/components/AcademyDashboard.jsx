/* src/components/AcademyDashboard.jsx */
import React from 'react';
import styles from './Dashboard.module.css';
import { FaBookOpen, FaAward, FaWhatsapp, FaUserGraduate, FaUserClock, FaMosque, FaCheckCircle } from 'react-icons/fa';

export default function AcademyDashboard({ isRtl, greeting, academyName, stats, setActiveTab, t }) {
  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      <header className={styles.academyHeader}>
        <h1 className={styles.academyGreeting}>{greeting}</h1>
        <p className={styles.academyNameText}>{academyName}</p>
      </header>

      {/* ⚡ قسم الإجراءات السريعة بالنمط الزجاجي الفخم المحدث */}
      <section className={styles.sectionQuickActions}>
        <h2 className={styles.sectionTitle}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div className={styles.actionsContainer}>
          <button 
            onClick={() => setActiveTab('attendance')} 
            className={`${styles.premiumLaunchpadCard} ${styles.longCard} ${styles.attendanceBtn}`}
          >
            <div className={styles.actionInner}>
              <div className={styles.launchpadIconWrapper}><FaBookOpen /></div>
              <div className={styles.actionText}>
                <div className={styles.actionTitleText}>{t('action_attendance')}</div>
              </div>
            </div>
          </button>

          <div className={styles.actionsGrid}>
            <button 
              onClick={() => setActiveTab('exams')} 
              className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.examsBtn}`}
            >
              <div className={styles.launchpadIconWrapper}><FaAward /></div>
              <span className={styles.launchpadGridTitle}>{t('action_exams')}</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.reportsBtn}`}
            >
              <div className={styles.launchpadIconWrapper}><FaWhatsapp /></div>
              <span className={styles.launchpadGridTitle}>{t('action_reports')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 📊 قسم التقرير العام المطور والمربوط بتأثيرات التوهج الملون لكل حالة */}
      <section className={styles.sectionOverview}>
        <h2 className={styles.sectionTitle}>
          <span>📊</span> {t('academy_overview')}
        </h2>
        
        <div className={styles.statsGrid}>
          
          {/* كرت الطلاب */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('total_students')}</p>
              <h2 className={styles.statNumber}>{stats.students}</h2>
            </div>
            <div className={styles.statIcon}><FaUserGraduate /></div>
          </div>

          {/* كرت المدفوعات المعلقة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('pending_payments')}</p>
              <h2 className={styles.statNumber}>{stats.pending}</h2>
            </div>
            <div className={styles.statIcon}><FaUserClock /></div>
          </div>

          {/* كرت الحلقات النشطة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('active_halagas')}</p>
              <h2 className={styles.statNumber}>{stats.activeHalagas || 0}</h2>
            </div>
            <div className={styles.statIcon}><FaMosque /></div>
          </div>

          {/* كرت الاختبارات المكتملة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('completed_exams')}</p>
              <h2 className={styles.statNumber}>{stats.completedExams || 0}</h2>
            </div>
            <div className={styles.statIcon}><FaCheckCircle /></div>
          </div>

        </div>
      </section>
    </div>
  );
}
