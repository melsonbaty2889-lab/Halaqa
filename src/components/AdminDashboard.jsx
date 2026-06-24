/* src/components/AdminDashboard.jsx */
import React from 'react';
import styles from './Dashboard.module.css';
import { FaCalendarAlt, FaBuilding, FaClock } from 'react-icons/fa';

export default function AdminDashboard({ 
  isRtl, 
  academyName, 
  getGregorianDate, 
  getHijriDate, 
  totalAcademiesCount, 
  pendingAcademies, 
  handleActivateAcademy 
}) {
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
              {pendingAcademies.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    {isRtl ? 'لا توجد طلبات معلقة حالياً' : 'No pending requests'}
                  </td>
                </tr>
              ) : (
                pendingAcademies.map((academy) => (
                  <tr key={academy.id}>
                    <td>{academy.name}</td>
                    <td className={styles.timeCell}>{new Date(academy.created_at).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className={styles.textCenter}>
                      <button onClick={() => handleActivateAcademy(academy.id)} className={styles.activateBtn}>
                        {isRtl ? 'تفعيل' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
