/* src/components/AdminDashboard.jsx */
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { 
  FaCalendarAlt, 
  FaBuilding, 
  FaClock, 
  FaCheckCircle, 
  FaShieldAlt 
} from 'react-icons/fa';

export default function AdminDashboard({ 
  isRtl, 
  academyName, 
  getGregorianDate, 
  getHijriDate, 
  totalAcademiesCount = 0, 
  pendingAcademies = [], 
  handleActivateAcademy 
}) {
  
  // 🛡️ حالة تتبع محلي لمنع إرسال طلبات مكررة للسيرفر أثناء التفعيل
  const [processingId, setProcessingId] = useState(null);

  const onActivateClick = async (id) => {
    if (processingId) return; // حظر النقرات العشوائية المتتالية
    setProcessingId(id);
    try {
      await handleActivateAcademy(id);
    } catch (error) {
      console.error("Activation failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // 📅 تنسيق آمن لتاريخ طلب الانضمام يمنع انهيار الواجهة
  const formatRequestDate = (dateString) => {
    try {
      if (!dateString) return '---';
      return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '---';
    }
  };

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 👑 هيدر الإدارة المركزية المتوافق مع الهوية البصرية الجديدة */}
      <header className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminTitle}>
            <FaShieldAlt size={22} />
            <span>{isRtl ? 'مركز التحكم والرقابة العام' : 'Platform Operations Control'}</span>
          </h1>
          <p className={styles.adminSubtitle}>
            {academyName || (isRtl ? "الإدارة المركزية للمنصة" : "Central Super-Admin Node")}
          </p>
        </div>

        {/* 📅 لوحة التوقيت الإسلامي المزدوج الموحدة */}
        {(getHijriDate || getGregorianDate) && (
          <div className={styles.dateTimeBadge}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontSize: '0.85rem', fontWeight: '600' }}>
              <FaCalendarAlt size={12} style={{ color: '#3B82F6' }} />
              <span>{getHijriDate?.() || '---'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', paddingRight: isRtl ? '20px' : '0', paddingLeft: isRtl ? '0' : '20px' }}>
              {getGregorianDate?.() || '---'}
            </div>
          </div>
        )}
      </header>

      {/* 📊 شبكة المؤشرات والتحليلات ثنائية القطب للإشراف العام */}
      <div className={styles.statsGrid} style={{ marginBottom: '40px' }}>
        
        {/* كرت إجمالي الأكاديميات المقيدة */}
        <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'إجمالي الأكاديميات المسجلة' : 'Total Platform Academies'}</p>
            <h2 className={styles.statNumber}>{totalAcademiesCount}</h2>
          </div>
          <div className={styles.statIcon}><FaBuilding /></div>
        </div>

        {/* كرت طلبات التفعيل المعلقة (يتحول للتنبيه التلقائي الملون) */}
        <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'طلبات التفعيل المعلقة' : 'Pending Gateways'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingAcademies.length > 0 ? '#F87171' : 'inherit' }}>
              {pendingAcademies.length}
            </h2>
          </div>
          <div className={styles.statIcon}><FaClock /></div>
        </div>

      </div>

      {/* ⚡ قسم إدارة ومعالجة طلبات الانضمام بالنمط الشبكي الحديث */}
      <section className={styles.superAdminView}>
        <h2 className={styles.listTitle}>
          <span>📋</span> {isRtl ? 'طابور مراجعة الأكاديميات المعلقة' : 'Academy Activation Queue'}
        </h2>

        {pendingAcademies.length === 0 ? (
          /* حالة الفراغ المؤمّنة في ملف الـ CSS */
          <div className={styles.emptyState}>
            <FaCheckCircle size={32} style={{ color: '#10B981', marginBottom: '12px', display: 'block', margin: '0 auto 12px auto' }} />
            <p style={{ margin: 0 }}>
              {isRtl ? 'المنظومة مستقرة تماماً. لا توجد طلبات تفعيل معلقة حالياً.' : 'Platform infrastructure cleared. No pending requests.'}
            </p>
          </div>
        ) : (
          /* قائمة الطلبات الحديثة بنظام الكروت المرنة والمقاومة للموبايل */
          <div className={styles.requestsGrid}>
            {pendingAcademies.map((academy) => {
              const isCurrentLoading = processingId === academy.id;
              return (
                <div key={academy.id} className={styles.requestCard}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName}>{academy.name}</h3>
                    <p className={styles.requestEmail}>
                      {isRtl ? 'تاريخ تقديم الطلب:' : 'Submitted:'} {formatRequestDate(academy.created_at)}
                    </p>
                  </div>
                  
                  {/* زر التفعيل الذكي المزود بحالة شحن صامتة ومنع نقر متكرر */}
                  <button 
                    onClick={() => onActivateClick(academy.id)}
                    disabled={processingId !== null}
                    className={`${styles.approveBtn} ${isCurrentLoading ? styles.approveBtnLoading : styles.approveBtnActive}`}
                    style={{ minWidth: '110px', opacity: (processingId !== null && !isCurrentLoading) ? 0.6 : 1 }}
                  >
                    {isCurrentLoading ? (isRtl ? 'جاري التفعيل...' : 'Activating...') : (isRtl ? 'تفعيل الأكاديمية' : 'Grant Access')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
