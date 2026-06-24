/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';
import { 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaBuilding, 
  FaGraduationCap, 
  FaAward, 
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSyncAlt,
  FaBookOpen,     
  FaWhatsapp,     
  FaReceipt,      
  FaUserGraduate, 
  FaUserClock,    
  FaMosque,
  FaCalendarAlt 
} from 'react-icons/fa';

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";

  // 1. دالة الترحيب
  const getGreeting = () => {
    const hour = new Date().getHours();
    const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
    const nameSuffix = userFullName ? `، ${userFullName}` : '';
    return hour < 12 
      ? (isRtl ? `صباح الخير والبركة 👋${nameSuffix}` : `Good morning 👋${nameSuffix}`)
      : (isRtl ? `مساء الخير والأنوار 👋${nameSuffix}` : `Good evening 👋${nameSuffix}`);
  };

  // 2. دالة التاريخ الميلادي (توقيت القاهرة)
  const getGregorianDate = () => {
    return new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    });
  };

  // 3. دالة التاريخ الهجري (توقيت القاهرة)
  const getHijriDate = () => {
    try {
      return new Date().toLocaleDateString(isRtl ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Africa/Cairo'
      });
    } catch (e) {
      return new Date().toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // 4. جلب البيانات
  const fetchDashboardData = useCallback(async () => {
    if (!isPlatformAdmin) { setLoading(false); return; }
    setLoading(true);
    setErrorState(null);
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('id, name, country_code, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50); 
      if (pendingError) throw pendingError;
      setPendingAcademies(pendingData || []);

      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;
      setTotalAcademiesCount(count || 0);
    } catch (err) {
      setErrorState(isRtl ? "فشل في مزامنة البيانات الحية مع السيرفر." : "Failed to sync live data.");
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, isRtl]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleActivateAcademy = async (academyId) => {
    try {
      const { error } = await supabase.from('academies').update({ status: 'active', is_activated: true }).eq('id', academyId);
      if (error) throw error;
      setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      alert(isRtl ? "عذراً، تعذر التفعيل." : "Activation failed.");
    }
  };

  if (loading) return <div className={styles.dashboardContainer}><div className={styles.skeletonHeader}></div></div>;

  // واجهة السوبر أدمن
  if (isPlatformAdmin) {
    return (
      <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>{isRtl ? 'إحصائيات المنصة العامة' : 'General Platform Statistics'}</h1>
          <p className={styles.dashboardSubtitle}>{academyName || (isRtl ? "الإدارة المركزية" : "Central Administration")}</p>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8', display: 'flex', gap: '10px', alignItems: 'center' }}>
             <FaCalendarAlt style={{ color: 'var(--gold)' }} /> <span>{getGregorianDate()}</span> • <span style={{ color: 'var(--gold)' }}>{getHijriDate()}</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.blueIcon}`}><FaBuilding size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{isRtl ? 'إجمالي الأكاديميات' : 'Total Academies'}</span>
              <h3 className={styles.statValue}>{totalAcademiesCount}</h3>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.redIcon}`}><FaClock size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{isRtl ? 'طلبات تفعيل معلقة' : 'Pending Activations'}</span>
              <h3 className={styles.statValue}>{pendingAcademies.length}</h3>
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>{isRtl ? 'طلبات الانضمام والتفعيل المعلقة' : 'Pending Requests'}</h2>
          <div className={styles.tableResponsive}>
            <table className={styles.table} style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr>
                  <th>{isRtl ? 'اسم الأكاديمية' : 'Academy Name'}</th>
                  <th>{isRtl ? 'تاريخ الطلب' : 'Date'}</th>
                  <th className={styles.textCenter}>{isRtl ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {pendingAcademies.map((academy) => (
                  <tr key={academy.id}>
                    <td>{academy.name}</td>
                    <td className={styles.timeCell}>{new Date(academy.created_at).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className={styles.textCenter}><button onClick={() => handleActivateAcademy(academy.id)} className={styles.activateBtn}>{isRtl ? 'تفعيل' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // واجهة الأكاديمية
  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <AcademyView 
        isRtl={isRtl} 
        greeting={getGreeting()} 
        academyData={{ academyName, stats }} 
        setActiveTab={setActiveTab} 
        t={t} 
      />
    </div>
  );
}

// 🏫 مكوّن واجهة الأكاديمية
function AcademyView({ isRtl, greeting, academyData, setActiveTab, t }) {
  return (
    <>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '22px', textAlign: 'start' }}>
        <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: '700', margin: 0 }}>{greeting}</h1>
        <p style={{ color: 'var(--gold)', fontSize: '1.05rem', margin: '6px 0' }}>{academyData.academyName}</p>
      </header>

      <section style={{ marginBottom: '40px', textAlign: 'start' }}>
        <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px' }}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => setActiveTab('attendance')} className="premium-launchpad-card long-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="launchpad-icon-wrapper"><FaBookOpen /></div>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{t('action_attendance')}</div>
              </div>
            </div>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button onClick={() => setActiveTab('exams')} className="premium-launchpad-card grid-card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', border: 'none' }}>
              <div className="launchpad-icon-wrapper"><FaAward /></div>
              <span className="launchpad-grid-title">{t('action_exams')}</span>
            </button>
            <button onClick={() => setActiveTab('reports')} className="premium-launchpad-card grid-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', border: 'none' }}>
              <div className="launchpad-icon-wrapper"><FaWhatsapp /></div>
              <span className="launchpad-grid-title">{t('action_reports')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 📊 قسم التقرير العام */}
<section style={{ textAlign: 'start', marginTop: '40px' }}>
  <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px' }}>
    <span>📊</span> {t('academy_overview')}
  </h2>
  
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
    
    {/* كرت الطلاب */}
    <div className="premium-stat-box" style={{ borderTop: '4px solid var(--gold)' }}>
      <div style={{ textAlign: 'start' }}>
        <p className="stat-label">{t('total_students')}</p>
        <h2 className="stat-number">{academyData.stats.students}</h2>
      </div>
      <div className="stat-icon" style={{ color: 'var(--gold)' }}><FaUserGraduate /></div>
    </div>

    {/* كرت المدفوعات المعلقة */}
    <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
      <div style={{ textAlign: 'start' }}>
        <p className="stat-label">{t('pending_payments')}</p>
        <h2 className="stat-number">{academyData.stats.pending}</h2>
      </div>
      <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
    </div>

    {/* كرت الحلقات النشطة */}
    <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
      <div style={{ textAlign: 'start' }}>
        <p className="stat-label">{t('active_halagas')}</p>
        <h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2>
      </div>
      <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
    </div>

    {/* كرت الاختبارات المكتملة */}
    <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
      <div style={{ textAlign: 'start' }}>
        <p className="stat-label">{t('completed_exams')}</p>
        <h2 className="stat-number">{academyData.stats.completedExams || 0}</h2>
      </div>
      <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
    </div>

  </div>
</section>
      <style>{`
        .premium-launchpad-card { 
          border-radius: 14px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; transition: transform 0.2s;
        }
        .premium-launchpad-card:hover { transform: translateY(-3px); }
        .long-card { width: 100%; }
        .grid-card { flex-direction: column; justify-content: center; gap: 10px; padding: 20px 10px; }
        .launchpad-icon-wrapper { font-size: 24px; }
        .premium-stat-box { background: var(--surface); padding: 20px; border-radius: 14px; }
        .stat-label { color: #94a3b8; font-size: 13px; }
        .stat-number { font-size: 1.8rem; font-weight: 800; }
        .stat-icon { font-size: 24px; color: #94a3b8; }
      `}</style>
    </>
  );
}
