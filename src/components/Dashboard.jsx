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
  FaBookOpen,     // 🌟 تم إضافتها لمنع خطأ البناء
  FaWhatsapp,     // 🌟 تم إضافتها لمنع خطأ البناء
  FaReceipt,      // 🌟 تم إضافتها لمنع خطأ البناء
  FaUserGraduate, // 🌟 تم إضافتها لمنع خطأ البناء
  FaUserClock,    // 🌟 تم إضافتها لمنع خطأ البناء
  FaMosque        // 🌟 تم إضافتها لمنع خطأ البناء
} from 'react-icons/fa';

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  // 👑 الحالات البرمجية الثابتة والمحمية
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";

  // 🌍 دالة حساب الترحيب الذكي بناءً على التوقيت الحالي واسم المستخدم مسحوباً من الـ session
  const getGreeting = () => {
    const hour = new Date().getHours();
    const userFullName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || '';
    const nameSuffix = userFullName ? `، ${userFullName}` : '';
    
    if (hour < 12) {
      return isRtl ? `صباح الخير والبركة 👋${nameSuffix}` : `Good morning 👋${nameSuffix}`;
    } else {
      return isRtl ? `مساء الخير والأنوار 👋${nameSuffix}` : `Good evening 👋${nameSuffix}`;
    }
  };

  // 🌍 دالة جلب البيانات مع حماية المنصة وحد أعلى للأمان (Limit 50)
  const fetchDashboardData = useCallback(async () => {
    if (!isPlatformAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setErrorState(null);

    try {
      // 1. جلب طلبات التفعيل مع تحديد حد أقصى للحماية وسرعة الاستجابة
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('id, name, country_code, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50); 
        
      if (pendingError) throw pendingError;
      setPendingAcademies(pendingData || []);

      // 2. جلب إجمالي العدد بدقة عالية دون تحميل بيانات الصفوف
      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      setTotalAcademiesCount(count || 0);

    } catch (err) {
      console.error("🚨 Global Fetch Error:", err);
      setErrorState(isRtl ? "فشل في مزامنة البيانات الحية مع السيرفر. يرجى التحقق من الاتصال." : "Failed to sync live data with server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, isRtl]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // دالة تفعيل الأكاديمية بنظام التحديث الفوري المتفائل (Optimistic UI)
  const handleActivateAcademy = async (academyId) => {
    try {
      const { error } = await supabase
        .from('academies')
        .update({ status: 'active', is_activated: true })
        .eq('id', academyId);
      
      if (error) throw error;

      // تحديث الحالة فوراً لمنح المستخدم شعوراً بالسرعة الخارقة
      setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      console.error("🚨 Activation Failed:", err);
      alert(isRtl ? "عذراً، تعذر تفعيل الحساب حالياً. يرجى المحاولة مرة أخرى." : "Sorry, account activation failed. Please try again.");
    }
  };

  // ─── 🌟 شاشة التحميل الهيكلية المتجاوبة (Skeleton Screen) ───
  if (loading) {
    return (
      <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={styles.skeletonHeader}></div>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
        <div className={styles.skeletonSection}></div>
      </div>
    );
  }

  // ─── 🛡️ واجهة معالجة الأخطاء الذكية (Fallback Screen) ───
  if (errorState) {
    return (
      <div className={styles.errorWrapper} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h3>{isRtl ? 'تنبيه النظام' : 'System Alert'}</h3>
        <p>{errorState}</p>
        <button onClick={fetchDashboardData} className={styles.retryBtn}>
          <FaSyncAlt /> {isRtl ? 'إعادة المحاولة الآن' : 'Retry Now'}
        </button>
      </div>
    );
  }

  // ─── الواجهة الأولى: لوحة تحكم السوبر أدمن والمسؤول العام ───
  if (isPlatformAdmin) {
    return (
      <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>{isRtl ? 'إحصائيات المنصة العامة' : 'General Platform Statistics'}</h1>
          <p className={styles.dashboardSubtitle}>{academyName || (isRtl ? "الإدارة المركزية" : "Central Administration")}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.blueIcon}`}>
              <FaBuilding size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{isRtl ? 'إجمالي الأكاديميات' : 'Total Academies'}</span>
              <h3 className={styles.statValue}>{totalAcademiesCount}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.redIcon}`}>
              <FaClock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{isRtl ? 'طلبات تفعيل معلقة' : 'Pending Activations'}</span>
              <h3 className={styles.statValue}>{pendingAcademies.length}</h3>
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>{isRtl ? 'طلبات الانضمام والتفعيل المعلقة' : 'Pending Requests'}</h2>
          
          {pendingAcademies.length === 0 ? (
            <div className={styles.emptyState}>
              <FaCheckCircle size={48} className={styles.successCheckIcon} />
              <h4>{isRtl ? 'كل شيء تحت السيطرة!' : 'All clear!'}</h4>
              <p>{isRtl ? 'لا توجد طلبات تفعيل معلقة حالياً، النظام مستقر تماماً ✨' : 'No pending requests available.. System clear ✨'}</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table} style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr>
                    <th>{isRtl ? 'اسم الأكاديمية' : 'Academy Name'}</th>
                    <th>{isRtl ? 'الدولة' : 'Country'}</th>
                    <th>{isRtl ? 'تاريخ ووقت الطلب (توقيت القاهرة)' : 'Request Date (Cairo Time)'}</th>
                    <th className={styles.textCenter}>{isRtl ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAcademies.map((academy) => (
                    <tr key={academy.id}>
                      <td className={styles.fw500}>{academy.name}</td>
                      <td>{academy.country_code || (isRtl ? 'غير محدد' : 'Not Specified')}</td>
                      <td className={styles.timeCell}>
                        {academy.created_at ? (
                          new Date(academy.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                            timeZone: 'Africa/Cairo',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        ) : '---'}
                      </td>
                      <td className={styles.textCenter}>
                        <button 
                          onClick={() => handleActivateAcademy(academy.id)}
                          className={styles.activateBtn}
                        >
                          {isRtl ? 'تفعيل الحساب' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── الواجهة الثانية: رندرة لوحة تحكم الأكاديميات الاحترافية (المستخدمين العاديين) ───
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

// 🏫 مكوّن واجهة الأكاديمية الفرعي (Academy Dashboard View Component)
function AcademyView({ isRtl, greeting, academyData, setActiveTab, t }) {
  return (
    <>
      {/* رأس الصفحة */}
      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '22px', textAlign: 'start' }}>
        <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: '700', margin: 0, whiteSpace: 'nowrap' }}>
          {greeting}
        </h1>
        <p style={{ color: 'var(--gold)', fontSize: '1.05rem', margin: '6px 0 0 0', fontWeight: '600' }}>
          {academyData.academyName}
        </p>
      </header>

      {/* ⚡ مركز العمليات الذكي */}
      <section style={{ marginBottom: '40px', textAlign: 'start' }}>
        <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: isRtl ? '0' : '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* حلقة التحضير اليومي */}
          <button onClick={() => setActiveTab('attendance')} className="premium-launchpad-card long-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="launchpad-icon-wrapper"><FaBookOpen /></div>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{t('action_attendance')}</div>
                <div style={{ fontSize: '12px', color: '#93c5fd', marginTop: '2px' }}>{isRtl ? 'تسجيل الغياب والحفظ والمراجعة الفورية للحلقة الحالية' : 'Log attendance, memorization and reviews instantly'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>{isRtl ? 'جاهز' : 'Live'}</span>
            </div>
          </button>

          {/* كروت الاختبارات والتقارير */}
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

          {/* العمليات المالية */}
          <button onClick={() => setActiveTab('payments')} className="premium-launchpad-card long-card" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="launchpad-icon-wrapper"><FaReceipt /></div>
              <div style={{ textAlign: 'start' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{t('action_payments')}</div>
                <div style={{ fontSize: '12px', color: '#ddd6fe', marginTop: '2px' }}>{isRtl ? 'متابعة الاشتراكات وحالات السداد الشهرية' : 'Manage subscriptions and monthly billing'}</div>
              </div>
            </div>
            {academyData.stats.pending > 0 && (
              <div style={{ background: '#ef4444', color: '#fff', minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', border: '2px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
                {academyData.stats.pending}
              </div>
            )}
          </button>

        </div>
      </section>

      {/* 📊 قسم التقرير العام */}
      <section style={{ textAlign: 'start' }}>
        <h2 style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: isRtl ? '0' : '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> {t('academy_overview')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <div className="premium-stat-box" style={{ borderTop: `4px solid var(--gold)` }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('total_students')}</p>
              <h2 className="stat-number">{academyData.stats.students}</h2>
            </div>
            <div className="stat-icon" style={{ color: 'var(--gold)' }}><FaUserGraduate /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #ef4444' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('pending_payments')}</p>
              <h2 className="stat-number">{academyData.stats.pending}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#ef4444' }}><FaUserClock /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #38bdf8' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('active_halagas')}</p>
              <h2 className="stat-number">{academyData.stats.activeHalagas || 0}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><FaMosque /></div>
          </div>

          <div className="premium-stat-box" style={{ borderTop: '4px solid #34d399' }}>
            <div style={{ textAlign: 'start' }}>
              <p className="stat-label">{t('completed_exams')}</p>
              <h2 className="stat-number">{academyData.stats.completedExams || 0}</h2>
            </div>
            <div className="stat-icon" style={{ color: '#34d399' }}><FaCheckCircle /></div>
          </div>
        </div>
      </section>

      {/* الأنماط الحركية المتقدمة */}
      <style>{`
        .premium-launchpad-card { 
          border-radius: 14px; 
          color: #fff; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          padding: 16px 20px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-launchpad-card:hover { 
          transform: translateY(-3px); 
          filter: brightness(1.12); 
          box-shadow: 0 6px 15px rgba(0,0,0,0.25); 
        }
        .long-card { width: 100%; box-sizing: border-box; }
        .grid-card { 
          flex-direction: column; 
          justify-content: center; 
          gap: 10px; 
          padding: 20px 10px;
        }
        .launchpad-icon-wrapper { font-size: 24px; display: flex; align-items: center; justify-content: center; }
        .launchpad-grid-title { font-size: 13px; font-weight: 700; text-align: center; white-space: nowrap; }
        
        .premium-stat-box { 
          background: var(--surface); 
          padding: 22px 20px; 
          border-radius: 14px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border: 1px solid rgba(255, 255, 255, 0.02); 
          box-shadow: var(--shadow);
        }
        .stat-label { color: #94a3b8; margin: 0 0 6px 0; font-size: 13px; font-weight: 600; }
        .stat-number { color: #fff; margin: 0; font-size: 2.1rem; font-weight: 800; font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.5px; }
        .stat-icon { font-size: 26px; opacity: 0.85; display: flex; align-items: center; }

        .pulse-dot {
          width: 7px;
          height: 7px;
          background-color: #34d399;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
      `}</style>
    </>
  );
}
