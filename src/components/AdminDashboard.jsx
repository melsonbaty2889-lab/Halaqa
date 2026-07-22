/* src/components/AdminDashboard.jsx */
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState'; 
import { 
  FaCalendarAlt, 
  FaBuilding, 
  FaClock, 
  FaCheckCircle, 
  FaShieldAlt,
  FaBan,
  FaHourglassHalf,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

export default function AdminDashboard({ isRtl = true, academyName, onLogout }) {
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: pendingData } = await supabase.from('academies').select('*').eq('is_active', false).order('created_at', { ascending: false });
      setPendingAcademies(pendingData || []);

      const { data: activeData } = await supabase.from('academies').select('*').eq('is_active', true).order('created_at', { ascending: false });
      setActiveAcademies(activeData || []);

      const { count } = await supabase.from('academies').select('*', { count: 'exact', head: true });
      if (count !== null) setTotalAcademiesCount(count);
    } catch (error) {
      console.error("Error fetching admin data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const onActivateClick = async (id) => {
    if (processingId) return;
    setProcessingId(`activate-${id}`);
    try {
      // 1. تحديث حالة الأكاديمية
      const { error } = await supabase.from('academies').update({ is_active: true }).eq('id', id);
      if (error) throw error;

      const activated = pendingAcademies.find(a => a.id === id);

      // ✨ 2. تحديث بروفايل المالك (is_activated = true) ليتجاوز شاشة المراجعة تلقائياً
      if (activated?.owner_id) {
        await supabase.from('profiles').update({ is_activated: true }).eq('id', activated.owner_id);
      }

      setPendingAcademies(prev => prev.filter(a => a.id !== id));
      if (activated) setActiveAcademies(prev => [{ ...activated, is_active: true }, ...prev]);
    } catch (e) { alert(e.message); }
    setProcessingId(null);
  };

  const onDeactivateClick = async (id) => {
    if (processingId || !window.confirm(isRtl ? 'هل أنت متأكد من إيقاف تفعيل وحظر هذه الأكاديمية؟' : 'Deactivate academy?')) return;
    setProcessingId(`deactivate-${id}`);
    try {
      // 1. إيقاف الأكاديمية
      const { error } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
      if (error) throw error;

      const deactivated = activeAcademies.find(a => a.id === id);

      // ✨ 2. إيقاف بروفايل المالك أيضاً تزامنياً
      if (deactivated?.owner_id) {
        await supabase.from('profiles').update({ is_activated: false }).eq('id', deactivated.owner_id);
      }

      setActiveAcademies(prev => prev.filter(a => a.id !== id));
      if (deactivated) setPendingAcademies(prev => [{ ...deactivated, is_active: false }, ...prev]);
    } catch (e) { alert(e.message); }
    setProcessingId(null);
  };

  const onExtendTrialClick = async (id, currentTrialEnds, daysToAdd) => {
    if (processingId) return;
    setProcessingId(`extend-${daysToAdd}-${id}`);
    try {
      const current = currentTrialEnds ? new Date(currentTrialEnds) : new Date();
      const baseDate = current > new Date() ? current : new Date();
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      const newDate = baseDate.toISOString();

      const { error } = await supabase.from('academies').update({ trial_ends_at: newDate }).eq('id', id);
      if (error) throw error;
      setActiveAcademies(prev => prev.map(a => a.id === id ? { ...a, trial_ends_at: newDate } : a));
    } catch (e) { alert(e.message); }
    setProcessingId(null);
  };

  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم' : 'Lifetime Account', color: '#94a3b8' };
    const diffDays = Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: isRtl ? 'منتهية التجربة ⚠️' : 'Trial Expired ⚠️', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} أيام تجريبية` : `${diffDays} days left`, color: '#10B981' };
  };

  const filteredPending = pendingAcademies.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredActive = activeAcademies.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '20px' }}>
      <header className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className={styles.adminTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#FFF' }}>
            <FaShieldAlt style={{ color: '#FBBF24' }} />
            <span>{isRtl ? 'المنصة العالمية لحلقات القرآن (Super Admin)' : 'Global Super-Admin Terminal'}</span>
          </h1>
        </div>
        {onLogout && <button onClick={onLogout} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>{isRtl ? 'خروج آمن' : 'Logout'}</button>}
      </header>

      <div className={styles.statsGrid} style={{ marginBottom: '25px', marginTop: '25px' }}>
        <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
          <div className={styles.statBoxInfo}><p className={styles.statLabel}>{isRtl ? 'الأكاديميات المشتركة عالمياً' : 'Total Global Academies'}</p><h2 className={styles.statNumber}>{loading ? '...' : totalAcademiesCount}</h2></div>
          <div className={styles.statIcon}><FaBuilding /></div>
        </div>
        <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
          <div className={styles.statBoxInfo}><p className={styles.statLabel}>{isRtl ? 'طلبات انتظار المراجعة' : 'Pending Approvals'}</p><h2 className={styles.statNumber} style={{ color: pendingAcademies.length > 0 ? '#F87171' : 'inherit' }}>{loading ? '...' : pendingAcademies.length}</h2></div>
          <div className={styles.statIcon}><FaClock /></div>
        </div>
      </div>

      <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaSearch style={{ color: '#94A3B8' }} />
        <input type="text" placeholder={isRtl ? "ابحث عن أي أكاديمية حول العالم بالاسم..." : "Search academies..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', width: '100%', fontSize: '0.9rem' }} />
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 className={styles.listTitle}>📋 {isRtl ? 'طلبات التسجيل الجديدة المعلقة' : 'Pending Registrations'}</h2>
        {filteredPending.length === 0 ? (
          <EmptyState icon={<FaClock />} title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} description={isRtl ? "جميع طلبات الانضمام لـ SaaS تمت مراجعتها واعتمادها بالكامل بنجاح." : "All systems stable."} />
        ) : (
          <div className={styles.requestsGrid}>
            {filteredPending.map(academy => (
              <div key={academy.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestName}>{academy.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: getTrialStatusBadge(academy.trial_ends_at).color }}>{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                </div>
                <button onClick={() => onActivateClick(academy.id)} disabled={processingId !== null} className={styles.approveBtnActive}>{isRtl ? 'اعتماد الحساب' : 'Approve'}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className={styles.listTitle}>✅ {isRtl ? 'قاعدة بيانات الأكاديميات النشطة' : 'Active Subscriptions'}</h2>
        {filteredActive.length === 0 ? (
          <EmptyState icon={<FaBuilding />} title={isRtl ? "لا توجد أكاديميات نشطة" : "No Active Academies"} description={isRtl ? "لا توجد نتائج تطابق معايير البحث الحالية." : "Try adjusting your search criteria."} />
        ) : (
          <div className={styles.requestsGrid}>
            {filteredActive.map(academy => (
              <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #10B981', borderLeft: '4px solid #10B981' }}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestName}>{academy.name}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>⏱️ {isRtl ? 'فترة الاشتراك المحسوبة: ' : 'Trial Status: '}{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onExtendTrialClick(academy.id, academy.trial_ends_at, 30)} disabled={processingId !== null} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>{isRtl ? '+30 يوم' : '+30 Days'}</button>
                  <button onClick={() => onDeactivateClick(academy.id)} disabled={processingId !== null} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><FaBan /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
