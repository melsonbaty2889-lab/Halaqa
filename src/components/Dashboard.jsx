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

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  
  // 👑 الحالات البرمجية الثابتة والمحمية
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

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
      setErrorState("فشل في مزامنة البيانات الحية مع السيرفر. يرجى التحقق من الاتصال.");
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin]);

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
      alert("عذراً، تعذر تفعيل الحساب حالياً. يرجى المحاولة مرة أخرى.");
    }
  };

  // ─── 🌟 تجربة مستخدم النخبة: شاشة التحميل الهيكلية (Skeleton Screen) ───
  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
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
      <div className={styles.errorWrapper}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h3>تنبيه النظام</h3>
        <p>{errorState}</p>
        <button onClick={fetchDashboardData} className={styles.retryBtn}>
          <FaSyncAlt /> إعادة المحاولة الآن
        </button>
      </div>
    );
  }

  // ─── الواجهة الأولى: لوحة تحكم السوبر أدمن والمسؤول العام ───
  if (isPlatformAdmin) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>إحصائيات المنصة العامة</h1>
          <p className={styles.dashboardSubtitle}>{academyName || "الإدارة المركزية"}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.blueIcon}`}>
              <FaBuilding size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>إجمالي الأكاديميات</span>
              <h3 className={styles.statValue}>{totalAcademiesCount}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${styles.redIcon}`}>
              <FaClock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>طلبات تفعيل معلقة</span>
              <h3 className={styles.statValue}>{pendingAcademies.length}</h3>
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>طلبات الانضمام والتفعيل المعلقة</h2>
          
          {pendingAcademies.length === 0 ? (
            <div className={styles.emptyState}>
              <FaCheckCircle size={48} className={styles.successCheckIcon} />
              <h4>كل شيء تحت السيطرة!</h4>
              <p>لا توجد طلبات تفعيل معلقة حالياً، النظام مستقر تماماً ✨</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>اسم الأكاديمية</th>
                    <th>الدولة</th>
                    <th>تاريخ ووقت الطلب (توقيت القاهرة)</th>
                    <th className={styles.textCenter}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAcademies.map((academy) => (
                    <tr key={academy.id}>
                      <td className={styles.fw500}>{academy.name}</td>
                      <td>{academy.country_code || 'غير محدد'}</td>
                      <td className={styles.timeCell}>
                        {academy.created_at ? (
                          new Date(academy.created_at).toLocaleDateString('ar-EG', {
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
                          تفعيل الحساب
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
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>مركز التحكم والتحليلات</h1>
        <p className={styles.dashboardSubtitle}>{academyName}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => setActiveTab('students')}>
          <div className={`${styles.statIconWrapper} ${styles.academyBlue}`}>
            <FaUsers size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>إجمالي الطلاب</span>
            <h3 className={styles.statValue}>{stats.students}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('payments')}>
          <div className={`${styles.statIconWrapper} ${styles.academyOrange}`}>
            <FaMoneyBillWave size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>المعلقات المالية</span>
            <h3 className={styles.statValue}>
              {stats.pending} <span className={styles.currencySpan}>{activeCurrency === 'EGP' ? 'ج.م' : activeCurrency}</span>
            </h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('attendance')}>
          <div className={`${styles.statIconWrapper} ${styles.academyGreen}`}>
            <FaGraduationCap size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>الحلقات النشطة</span>
            <h3 className={styles.statValue}>{stats.activeHalagas}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('exams')}>
          <div className={`${styles.statIconWrapper} ${styles.academyPurple}`}>
            <FaAward size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>الاختبارات المجتازة</span>
            <h3 className={styles.statValue}>{stats.completedExams}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
