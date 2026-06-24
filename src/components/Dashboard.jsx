/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback } from 'react';
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
  FaSyncAlt
} from 'react-icons/fa';

// 🌍 دالة الدمج العالمية الفاخرة لتوحيد الوقت وعرض التاريخين الهجري والميلادي معاً بصيغة موحدة ومقيدة
const formatDualDateTime = (dateString) => {
  if (!dateString) return '─';

  const date = new Date(dateString);

  // 1️⃣ تنسيق التاريخ الهجري (تقويم أم القرى الاحترافي)
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    timeZone: 'Africa/Cairo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // 2️⃣ تنسيق التاريخ الميلادي باللغة العربية
  const gregorianDate = new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // 3️⃣ تنسيق الوقت (موحد للحسابين تماماً ومنع الفوارق الزمنية)
  const timeString = new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);

  // النتيجة النهائية الموحدة للحسابين: [ الهجري ] هـ • [ الميلادي ] م (الساعة [ الوقت ])
  return `${hijriDate} هـ  •  ${gregorianDate} م  (الساعة ${timeString})`;
};

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  
  // 👑 الحالات البرمجية الثابتة والمحمية
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  const [approvingId, setApprovingId] = useState(null);

  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";

  // 🌍 دالة جلب البيانات مع حماية المنصة وحد أعلى للأمان (Limit 50)
  const fetchDashboardData = useCallback(async () => {
    if (!isPlatformAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setErrorState(null);
    try {
      // 1. جلب الأكاديميات المعلقة
      const { data: pendingData, error: pendingError } = await supabase
        .from('academies')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (pendingError) throw pendingError;
      setPendingAcademies(pendingData || []);

      // 2. جلب إجمالي عدد الأكاديميات في المنصة لقسم الإحصائيات
      const { count, error: countError } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalAcademiesCount(count || 0);

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setErrorState(err.message || 'حدث خطأ أثناء جلب البيانات المالية والإدارية.');
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ⚡ دالة الموافقة وتفعيل الحسابات الفورية للأكاديميات
  const handleApprove = async (academyId) => {
    if (!academyId || approvingId) return;
    setApprovingId(academyId);
    try {
      const { error } = await supabase
        .from('academies')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', academyId);

      if (error) throw error;

      // تحديث مصفوفة العرض محلياً لمنع إعادة التحميل غير الضرورية
      setPendingAcademies(prev => prev.filter(item => item.id !== academyId));
      setTotalAcademiesCount(prev => prev + 1);
    } catch (err) {
      alert('خطأ أثناء تفعيل الأكاديمية: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  // 🛑 معالجة شاشات الخطأ المفاجئ وحماية الواجهة
  if (errorState) {
    return (
      <div className={styles.errorWrapper}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h3>فشل تحميل لوحة القيادة</h3>
        <p>{errorState}</p>
        <button onClick={fetchDashboardData} className={styles.retryBtn}>
          <FaSyncAlt /> إعادة المحاولة الآن
        </button>
      </div>
    );
  }

  // 👑 1. عرض واجهة السوبر أدمن (Super Admin View)
  if (isPlatformAdmin) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.superAdminView}>
          <div className={styles.adminHeader}>
            <h2 className={styles.adminTitle}>
              <FaBuilding size={22} /> لوحة التحكم العليا للمنصة
            </h2>
            <p className={styles.adminSubtitle}>إدارة طلبات الأكاديميات الجديدة ومتابعة الإحصائيات العامة للمنصة</p>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>إجمالي الأكاديميات النشطة</span>
            <div className={styles.summaryCardValue}>{totalAcademiesCount}</div>
          </div>

          <h3 className={styles.listTitle}>طلبات الانضمام المعلقة مراجعتها</h3>
          
          {loading ? (
            <p className={styles.loadingText}>جاري تحميل طلبات التسجيل الجديدة وتأمين الاتصال...</p>
          ) : pendingAcademies.length === 0 ? (
            <div className={styles.emptyState}>لا توجد أي طلبات أكاديميات معلقة في الوقت الحالي.</div>
          ) : (
            <div className={styles.requestsGrid}>
              {pendingAcademies.map((academy) => (
                <div key={academy.id} className={styles.requestCard}>
                  <div className={styles.requestInfo}>
                    <h4 className={styles.requestName}>{academy.name || academy.academy_name}</h4>
                    <p className={styles.requestEmail}>{academy.email}</p>
                    
                    {/* 💎 تطبيق توحيد الوقت الهجري والميلادي هنا بدقة متناهية للسوبر أدمن والمستخدم */}
                    <span style={{ color: '#657585', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                      تاريخ تقديم الطلب: {formatDualDateTime(academy.created_at)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleApprove(academy.id)}
                    disabled={approvingId === academy.id}
                    className={`${styles.approveBtn} ${styles.approveBtnActive} ${approvingId === academy.id ? styles.approveBtnLoading : ''}`}
                  >
                    {approvingId === academy.id ? 'جاري التفعيل...' : 'تفعيل والموافقة فوراً'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🏫 2. عرض واجهة الأكاديمية والعمليات (Academy View)
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.academyHeader}>
        <h2 className={styles.academyGreeting}>مرحباً بك مجدداً في لوحة القيادة 👋</h2>
        <p className={styles.academyNameText}>إدارة وحلقات: <span style={{ color: '#fff' }}>{academyName || 'أكاديمية القرآن الكريم'}</span></p>
      </div>

      {/* ⚡ قسم الإجراءات السريعة والعمودية لمنع التشتت */}
      <div className={styles.sectionQuickActions}>
        <h3 className={`${styles.sectionTitle} ${styles.ltrSpacing}`}>
          <FaClock size={14} /> الإجراءات والعمليات السريعة
        </h3>
        <div className={styles.actionsContainer}>
          <div className={`${styles.premiumLaunchpadCard} ${styles.longCard} ${styles.attendanceBtn}`} onClick={() => setActiveTab('attendance')}>
            <div className={styles.actionInner}>
              <div className={styles.launchpadIconWrapper}>
                <FaUsers />
              </div>
              <div className={styles.actionText}>
                <div className={styles.actionTitleText}>تسجيل الحضور والغياب اليومي</div>
                <div className={styles.actionSubtitleText}>متابعة حضور الطلاب في الحلقات وحفظ الأجزاء الحالية</div>
              </div>
            </div>
            <div className={styles.liveBadge}>
              <span className={styles.pulseDot}></span>
              <span className={styles.liveBadgeText}>تحديث مباشر</span>
            </div>
          </div>

          <div className={styles.actionsGrid}>
            <div className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.examsBtn}`} onClick={() => setActiveTab('exams')}>
              <div className={styles.launchpadIconWrapper}>
                <FaCheckCircle />
              </div>
              <div className={styles.launchpadGridTitle}>رصد درجات الاختبارات</div>
            </div>

            <div className={`${styles.premiumLaunchpadCard} ${styles.gridCard} ${styles.reportsBtn}`} onClick={() => setActiveTab('reports')}>
              <div className={styles.launchpadIconWrapper}>
                <FaBuilding />
              </div>
              <div className={styles.launchpadGridTitle}>إصدار تقارير أولياء الأمور</div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 قسم شبكة الإحصائيات الأفقية الشاملة */}
      <div className={styles.sectionOverview}>
        <h3 className={`${styles.sectionTitle} ${styles.ltrSpacing}`}>
          <FaUsers size={14} /> نظرة عامة على مؤشرات الأكاديمية
        </h3>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`} onClick={() => setActiveTab('students')}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>إجمالي الطلاب</p>
            <h3 className={styles.statNumber}>{stats.students}</h3>
          </div>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
        </div>

        <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`} onClick={() => setActiveTab('payments')}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>المعلقات المالية</p>
            <h3 className={styles.statNumber}>
              {stats.pending} <span style={{ fontSize: '14px', color: 'var(--gold)' }}>{activeCurrency === 'EGP' ? 'ج.م' : activeCurrency}</span>
            </h3>
          </div>
          <div className={styles.statIcon}>
            <FaMoneyBillWave />
          </div>
        </div>

        <div className={`${styles.premiumStatBox} ${styles.statBoxHalagas}`} onClick={() => setActiveTab('attendance')}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>الحلقات النشطة</p>
            <h3 className={styles.statNumber}>{stats.activeHalagas}</h3>
          </div>
          <div className={styles.statIcon}>
            <FaGraduationCap />
          </div>
        </div>

        <div className={`${styles.premiumStatBox} ${styles.statBoxExams}`} onClick={() => setActiveTab('exams')}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>الاختبارات المجتازة</p>
            <h3 className={styles.statNumber}>{stats.completedExams}</h3>
          </div>
          <div className={styles.statIcon}>
            <FaAward />
          </div>
        </div>
      </div>
    </div>
  );
}
