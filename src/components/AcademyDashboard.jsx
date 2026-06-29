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
  FaCheckCircle,
  FaCalendarAlt
} from 'react-icons/fa';

export default function AcademyDashboard({ 
  isRtl, 
  greeting, 
  academyName, 
  stats = {}, // تأمين المكون ضد قيم الـ undefined أثناء جلب البيانات من السيرفر
  setActiveTab, 
  t,
  getHijriDate,     // دالة التاريخ الهجري الذكية (مرّرة من الموجه الرئيسي)
  getGregorianDate  // دالة التاريخ الميلادي الذكية (مرّرة من الموجه الرئيسي)
}) {
  
  // تفكيك آمن للبيانات مع وضع قيم افتراضية لمنع انهيار الرندر (Defensive Coding)
  const {
    students = 0,
    pending = 0,
    activeHalagas = 0,
    completedExams = 0
  } = stats;

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* هيدر الأكاديمية: مدمج به التوقيت المزدوج الاحترافي */}
      <header className={styles.academyHeader} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 className={styles.academyGreeting}>{greeting || (isRtl ? 'مرحباً بك' : 'Welcome')}</h1>
          <p className={styles.academyNameText}>{academyName || (isRtl ? 'الأكاديمية القرآنيّة' : 'Quran Academy')}</p>
        </div>

        {/* وحدة التوقيت والمواقيت الإسلامية المزدوجة (تظهر تلقائياً عند تمرير الدالات) */}
        {(getHijriDate || getGregorianDate) && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: isRtl ? 'flex-start' : 'flex-end',
            backdropFilter: 'blur(8px)',
            minWidth: '160px'
          }}>
            {getHijriDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontSize: '0.85rem', fontWeight: '600' }}>
                <FaCalendarAlt size={12} style={{ color: '#3B82F6' }} />
                <span>{getHijriDate()}</span>
              </div>
            )}
            {getGregorianDate && (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px' }}>
                {getGregorianDate()}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ⚡ قسم الإجراءات السريعة بالنمط الزجاجي الفخم المحدث */}
      <section className={styles.sectionQuickActions}>
        <h2 className={styles.sectionTitle}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div className={styles.actionsContainer}>
          {/* زر رصد حضور وإنجاز الحلقات */}
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
            {/* زر بوابة الاختبارات المعتمدة */}
            <button 
              onClick={() => setActiveTab('exams')} 
              className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.examsBtn}`}
            >
              <div className={styles.launchpadIconWrapper}><FaAward /></div>
              <span className={styles.launchpadGridTitle}>{t('action_exams')}</span>
            </button>
            
            {/* زر تقارير الأداء الفورية عبر الواتساب */}
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
          
          {/* كرت القوة الاستيعابية للطلاب */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('total_students')}</p>
              <h2 className={styles.statNumber}>{students}</h2>
            </div>
            <div className={styles.statIcon}><FaUserGraduate /></div>
          </div>

          {/* كرت الحالات المالية والمستحقات المعلقة (يتحول للون التنبيه الأحمر تلقائياً عند وجود مبالغ مستحقة) */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('pending_payments')}</p>
              <h2 className={styles.statNumber} style={{ color: pending > 0 ? '#F87171' : 'inherit' }}>
                {pending}
              </h2>
            </div>
            <div className={styles.statIcon}><FaUserClock /></div>
          </div>

          {/* كرت الحلقات والمجموعات النشطة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('active_halagas')}</p>
              <h2 className={styles.statNumber}>{activeHalagas}</h2>
            </div>
            <div className={styles.statIcon}><FaMosque /></div>
          </div>

          {/* كرت التقييمات والاختبارات المكتملة */}
          <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('completed_exams')}</p>
              <h2 className={styles.statNumber}>{completedExams}</h2>
            </div>
            <div className={styles.statIcon}><FaCheckCircle /></div>
          </div>

        </div>
      </section>
    </div>
  );
}
