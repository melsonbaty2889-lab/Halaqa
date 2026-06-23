/* src/components/Dashboard.jsx */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';
import { 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaBuilding, 
  FaGraduationCap, 
  FaAward, 
  FaMoneyBillWave 
} from 'react-icons/fa';

export default function Dashboard({ session, userRole, setActiveTab, preloadedDashboardData, currency }) {
  
  // 👑 [أمان ريأكت المطلق] تعريف جميع الـ Hooks في القمة المطلقة وبترتيب ثابت لحل خطأ 310 نهائياً
  const [loading, setLoading] = useState(true);
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);

  // استخلاص البيانات المشتقة من الـ props
  const isPlatformAdmin = userRole === 'super_admin' || userRole === 'admin';
  const stats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const academyName = preloadedDashboardData?.academyName || "";
  const activeCurrency = currency || "USD";

  // 👑 الـ useEffect يعمل دائماً في القمة، والتحقق من الصلاحية يتم بداخله بأمان
  useEffect(() => {
    // إذا لم يكن مستخدم صلاحية أدمن، نوقف التحميل فوراً لينتقل للوحة الأكاديمية
    if (!isPlatformAdmin) {
      setLoading(false);
      return;
    }

    async function fetchAdminPlatformData() {
      try {
        // 1. جلب طلبات التفعيل المعلقة للسوبر أدمن
        const { data: pendingData, error: pendingError } = await supabase
          .from('academies')
          .select('*')
          .eq('status', 'pending');
        
        if (!pendingError && pendingData) {
          setPendingAcademies(pendingData);
        }

        // 2. جلب إجمالي عدد الأكاديميات المسجلة بالمنصة
        const { count, error: countError } = await supabase
          .from('academies')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && count !== null) {
          setTotalAcademiesCount(count);
        }
      } catch (err) {
        console.error("🚨 Error fetching admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminPlatformData();
  }, [isPlatformAdmin]);

  // دالة تفعيل الحسابات الخاصة بالسوبر أدمن
  const handleActivateAcademy = async (academyId) => {
    try {
      const { error } = await supabase
        .from('academies')
        .update({ status: 'active', is_activated: true })
        .eq('id', academyId);
      
      if (!error) {
        setPendingAcademies(prev => prev.filter(ac => ac.id !== academyId));
        setTotalAcademiesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("🚨 Academy Activation Error:", err);
    }
  };

  // شاشة التحميل الآمنة والموحدة
  if (loading) {
    return (
      <div className={styles.loadingWrapper} style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
        <p>جاري تحميل البيانات الإحصائية وتطابق النظام...</p>
      </div>
    );
  }

  // ─── الواجهة الأولى: لوحة تحكم السوبر أدمن والمسؤول العام ───
  if (isPlatformAdmin) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>إحصائيات المنصة العامة</h1>
          <p className={styles.dashboardSubtitle}>{academyName || "الإدارة العامة"}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(49, 130, 206, 0.1)', color: '#3182ce' }}>
              <FaBuilding size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>إجمالي الأكاديميات</span>
              <h3 className={styles.statValue}>{totalAcademiesCount}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(221, 107, 107, 0.1)', color: '#dd6b6b' }}>
              <FaClock size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>طلبات تفعيل معلقة</span>
              <h3 className={styles.statValue}>{pendingAcademies.length}</h3>
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer} style={{ marginTop: '32px' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            طلبات الانضمام والتفعيل المعلقة
          </h2>
          
          {pendingAcademies.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card, #1a202c)', borderRadius: '12px', border: '1px dashed #4a5568' }}>
              <FaCheckCircle size={48} color="#48bb78" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>كل شيء تحت السيطرة!</h4>
              <p style={{ color: '#a0aec0', fontSize: '14px' }}>لا توجد طلبات تفعيل معلقة حالياً ✨</p>
            </div>
          ) : (
            <div className={styles.tableResponsive} style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card, #1a202c)', borderRadius: '12px' }}>
              <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d3748', color: '#a0aec0' }}>
                    <th style={{ padding: '16px' }}>اسم الأكاديمية</th>
                    <th style={{ padding: '16px' }}>الدولة</th>
                    <th style={{ padding: '16px' }}>تاريخ ووقت الطلب (توقيت القاهرة)</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAcademies.map((academy) => (
                    <tr key={academy.id} style={{ borderBottom: '1px solid #2d3748' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{academy.name}</td>
                      <td style={{ padding: '16px' }}>{academy.country_code || 'غير محدد'}</td>
                      <td style={{ padding: '16px', color: '#a0aec0', fontSize: '13px' }}>
                        {academy.created_at ? (
                          // 🌍 إجبار النظام على عرض وقت الطلب بتوقيت القاهرة ليتطابق مع السوبر أدمن
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
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleActivateAcademy(academy.id)}
                          className={styles.activateBtn}
                          style={{ backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
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
        <div className={styles.statCard} onClick={() => setActiveTab('students')} style={{ cursor: 'pointer' }}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(66, 153, 225, 0.1)', color: '#4299e1' }}>
            <FaUsers size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>إجمالي الطلاب</span>
            <h3 className={styles.statValue}>{stats.students}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('payments')} style={{ cursor: 'pointer' }}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(236, 148, 44, 0.1)', color: '#ec942c' }}>
            <FaMoneyBillWave size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>المعلقات المالية</span>
            <h3 className={styles.statValue}>
              {stats.pending} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{activeCurrency === 'EGP' ? 'ج.م' : activeCurrency}</span>
            </h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('attendance')} style={{ cursor: 'pointer' }}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(72, 187, 120, 0.1)', color: '#48bb78' }}>
            <FaGraduationCap size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>الحلقات النشطة</span>
            <h3 className={styles.statValue}>{stats.activeHalagas}</h3>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setActiveTab('exams')} style={{ cursor: 'pointer' }}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(159, 122, 234, 0.1)', color: '#9f7aea' }}>
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
