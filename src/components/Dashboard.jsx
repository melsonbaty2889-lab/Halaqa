/* src/components/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase'; 
import styles from './Dashboard.module.css'; // استيراد نظام التنسيق الحديث والمنفصل
import { 
  FaUserGraduate, FaUserClock, FaBookOpen, FaAward, 
  FaWhatsapp, FaReceipt, FaMosque, FaCheckCircle, FaShieldAlt 
} from "react-icons/fa";

export default function Dashboard({ session, setActiveTab, preloadedDashboardData }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // جلب البيانات الأساسية للوحة التحكم مع قيم افتراضية آمنة
  const academyData = preloadedDashboardData || { 
    academyName: '...', 
    role: 'teacher', 
    stats: { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 } 
  };

  // التأكد من صلاحية السوبر أدمن بشكل دقيق
  const isSuperAdmin = academyData.role === 'super_admin' || academyData.role === 'admin';

  // حساب الترحيب الذكي بناءً على التوقيت الحالي واسم المستخدم مسحوباً من الـ session
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

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoadingAdmin(false);
      return;
    }

    const fetchRequests = async () => {
      setLoadingAdmin(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['pending_manager', 'Pending manager', 'Pending Manager']) 
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPendingRequests(data || []);
      } catch (err) {
        console.error('Error fetching requests:', err.message);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchRequests();
  }, [isSuperAdmin]);

  const handleApprove = async (profileId) => {
    setActionLoading(profileId);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'manager', is_activated: true }) 
        .eq('id', profileId);

      if (profileError) throw profileError;

      const { error: subError } = await supabase
        .from('saas_subscriptions')
        .insert([{ 
            user_id: profileId, 
            status: 'active', 
            plan_duration: 'monthly',
            expires_at: expiresAt.toISOString(),
            payment_gateway: 'manual_admin_approval'
        }]);

      if (subError) throw subError;
      
      setPendingRequests(prev => prev.filter(req => req.id !== profileId));
      alert(isRtl ? '🎉 تم تفعيل الحساب بنجاح!' : '🎉 Account activated successfully!');
    } catch (err) {
      alert((isRtl ? '❌ حدث خطأ أثناء التفعيل: ' : '❌ Activation error: ') + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // رندر متجاوب وانسيابي مع الاحتفاظ بالاتجاه البرمجي السليم أثناء التنقل اللغوي
  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {isSuperAdmin ? (
        <SuperAdminView 
          isRtl={isRtl}
          loadingAdmin={loadingAdmin}
          pendingRequests={pendingRequests}
          actionLoading={actionLoading}
          handleApprove={handleApprove}
          t={t}
        />
      ) : (
        <AcademyView 
          isRtl={isRtl}
          greeting={getGreeting()}
          academyData={academyData}
          setActiveTab={setActiveTab}
          t={t}
        />
      )}
    </div>
  );
}

// 👑 مكوّن واجهة السوبر أدمن (Super Admin View Component)
function SuperAdminView({ isRtl, loadingAdmin, pendingRequests, actionLoading, handleApprove, t }) {
  return (
    <div className={styles.superAdminView}>
      {/* رأس صفحة السوبر أدمن */}
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>
          <FaShieldAlt />
          {isRtl ? 'لوحة تحكم إدارة المنصة' : 'Platform Control Panel'}
        </h1>
        <p className={styles.adminSubtitle}>
          {isRtl ? 'مراجعة وتفعيل طلبات الأكاديميات الجديدة فورياً' : 'Review and approve new academy setup requests'}
        </p>
      </header>

      {/* كرت إجمالي الطلبات المعلقة */}
      <div className={styles.summaryCard}>
        <span className={styles.summaryCardLabel}>
          {isRtl ? '📥 طلبات التسجيل المعلقة' : '📥 Pending Registrations'}
        </span>
        <div className={styles.summaryCardValue}>
          {loadingAdmin ? '...' : pendingRequests.length}
        </div>
      </div>

      {/* قائمة الطلبات */}
      <h2 className={styles.listTitle}>
        {isRtl ? '📋 قائمة الطلبات الحالية' : '📋 Current Requests List'}
      </h2>

      {loadingAdmin ? (
        <p className={styles.loadingText}>{isRtl ? 'جاري تحميل البيانات البرمجية...' : 'Loading system data...'}</p>
      ) : pendingRequests.length === 0 ? (
        <div className={styles.emptyState}>
          {isRtl ? 'لا توجد طلبات تفعيل معلقة حالياً.. النظام مستقر ✨' : 'No pending requests available.. System clear ✨'}
        </div>
      ) : (
        <div className={styles.requestsGrid}>
          {pendingRequests.map((req) => (
            <div key={req.id} className={styles.requestCard}>
              <div className={styles.requestInfo}>
                <h3 className={styles.requestName}>
                  {req.name || (isRtl ? 'مدير أكاديمية جديد' : 'New Academy Manager')}
                </h3>
                <p className={styles.requestEmail}>
                  {req.email}
                </p>
              </div>
              <button 
                disabled={actionLoading !== null} 
                onClick={() => handleApprove(req.id)} 
                className={`${styles.approveBtn} ${actionLoading === req.id ? styles.approveBtnLoading : styles.approveBtnActive}`}
              >
                {actionLoading === req.id ? (isRtl ? 'جاري التفعيل...' : 'Activating...') : (isRtl ? '✔ قبول وتفعيل الصلاحية' : '✔ Approve & Activate')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🏫 مكوّن واجهة الأكاديمية (Academy Dashboard View Component)
function AcademyView({ isRtl, greeting, academyData, setActiveTab, t }) {
  return (
    <>
      {/* رأس الصفحة */}
      <header className={styles.academyHeader}>
        <h1 className={styles.academyGreeting}>
          {greeting}
        </h1>
        <p className={styles.academyNameText}>
          {academyData.academyName}
        </p>
      </header>

      {/* ⚡ مركز العمليات الذكي */}
      <section className={styles.sectionQuickActions}>
        <h2 className={`${styles.sectionTitle} ${!isRtl ? styles.ltrSpacing : ''}`}>
          <span>⚡</span> {t('quick_actions')}
        </h2>

        <div className={styles.actionsContainer}>
          
          {/* حلقة التحضير اليومي */}
          <button onClick={() => setActiveTab('attendance')} className={`${styles.premiumLaunchpadCard} ${styles.longCard} ${styles.attendanceBtn}`}>
            <div className={styles.actionInner}>
              <div className={styles.launchpadIconWrapper}><FaBookOpen /></div>
              <div className={styles.actionText}>
                <div className={styles.actionTitleText}>{t('action_attendance')}</div>
                <div className={styles.actionSubtitleText}>{isRtl ? 'تسجيل الغياب والحفظ والمراجعة الفورية للحلقة الحالية' : 'Log attendance, memorization and reviews instantly'}</div>
              </div>
            </div>
            <div className={styles.liveBadge}>
              <span className={styles.pulseDot}></span>
              <span className={styles.liveBadgeText}>{isRtl ? 'جاهز' : 'Live'}</span>
            </div>
          </button>

          {/* كروت الاختبارات والتقارير */}
          <div className={styles.actionsGrid}>
            <button onClick={() => setActiveTab('exams')} className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.examsBtn}`}>
              <div className={styles.launchpadIconWrapper}><FaAward /></div>
              <span className={styles.launchpadGridTitle}>{t('action_exams')}</span>
            </button>

            <button onClick={() => setActiveTab('reports')} className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.reportsBtn}`}>
              <div className={styles.launchpadIconWrapper}><FaWhatsapp /></div>
              <span className={styles.launchpadGridTitle}>{t('action_reports')}</span>
            </button>
          </div>

          {/* العمليات المالية */}
          <button onClick={() => setActiveTab('payments')} className={`${styles.premiumLaunchpadCard} ${styles.longCard} ${styles.paymentsBtn}`}>
            <div className={styles.actionInner}>
              <div className={styles.launchpadIconWrapper}><FaReceipt /></div>
              <div className={styles.actionText}>
                <div className={styles.actionTitleText}>{t('action_payments')}</div>
                <div className={styles.actionSubtitleText} style={{ color: '#ddd6fe' }}>{isRtl ? 'متابعة الاشتراكات وحالات السداد الشهرية' : 'Manage subscriptions and monthly billing'}</div>
              </div>
            </div>
            {academyData.stats.pending > 0 && (
              <div className={styles.pendingBadge}>
                {academyData.stats.pending}
              </div>
            )}
          </button>

        </div>
      </section>

      {/* 📊 قسم التقرير العام */}
      <section className={styles.sectionOverview}>
        <h2 className={`${styles.sectionTitle} ${!isRtl ? styles.ltrSpacing : ''}`}>
          <span>📊</span> {t('academy_overview')}
        </h2>

        <div className={styles.statsGrid}>
          <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('total_students')}</p>
              <h2 className={styles.statNumber}>{academyData.stats.students}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: 'var(--gold)' }}><FaUserGraduate /></div>
          </div>

          <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('pending_payments')}</p>
              <h2 className={styles.statNumber}>{academyData.stats.pending}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: '#ef4444' }}><FaUserClock /></div>
          </div>

          <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('active_halagas')}</p>
              <h2 className={styles.statNumber}>{academyData.stats.activeHalagas || 0}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: '#38bdf8' }}><FaMosque /></div>
          </div>

          <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`}>
            <div className={styles.statBoxInfo}>
              <p className={styles.statLabel}>{t('completed_exams')}</p>
              <h2 className={styles.statNumber}>{academyData.stats.completedExams || 0}</h2>
            </div>
            <div className={styles.statIcon} style={{ color: '#34d399' }}><FaCheckCircle /></div>
          </div>
        </div>
      </section>
    </>
  );
}
