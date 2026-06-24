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
  FaSyncAlt
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

  // ─── الواجهة الثانية: لوحة تحكم الأكاديميات والمستخدمين العاديين ───
  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>{getGreeting()}</h1>
        <p className={styles.dashboardSubtitle}>{academyName}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => setActiveTab('students')}>
          <div className={`${styles.statIconWrapper} ${styles.academyBlue}`}>
            <FaUsers size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</span>
            <h3 className={styles.statValue}>{stats.students}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('payments')}>
          <div className={`${styles.statIconWrapper} ${styles.academyOrange}`}>
            <FaMoneyBillWave size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{isRtl ? 'المعلقات المالية' : 'Pending Payments'}</span>
            <h3 className={styles.statValue}>
              {stats.pending} <span className={styles.currencySpan}>{activeCurrency === 'EGP' ? (isRtl ? 'ج.م' : 'EGP') : activeCurrency}</span>
            </h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('attendance')}>
          <div className={`${styles.statIconWrapper} ${styles.academyGreen}`}>
            <FaGraduationCap size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{isRtl ? 'الحلقات النشطة' : 'Active Halagas'}</span>
            <h3 className={styles.statValue}>{stats.activeHalagas}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('exams')}>
          <div className={`${styles.statIconWrapper} ${styles.academyPurple}`}>
            <FaAward size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{isRtl ? 'الاختبارات المجتازة' : 'Completed Exams'}</span>
            <h3 className={styles.statValue}>{stats.completedExams}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
