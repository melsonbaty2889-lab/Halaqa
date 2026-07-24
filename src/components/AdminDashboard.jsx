/* src/components/AdminDashboard.jsx - Production-Ready SaaS Version */
import React, { useState, useEffect, useCallback } from 'react';
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
  FaSearch,
  FaSync,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaInfoCircle
} from 'react-icons/fa';

export default function AdminDashboard({ isRtl = true, academyName, onLogout }) {
  // 📋 الحالات الأساسية (States)
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  
  // ⚙️ حالات التحكم والأداء
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAcademy, setSelectedAcademy] = useState(null);

  // 🔄 دالة جلب البيانات مع دمج بروفايل المالك بطريقة آمنة 100%
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      // 1️⃣ جلب الأكاديميات المعلقة والنشطة
      const { data: pendingData, error: pErr } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      const { data: activeData, error: aErr } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (aErr) throw aErr;

      const { count, error: countErr } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      if (countErr) throw countErr;

      // 2️⃣ جلب بيانات المالكين (Profiles) لتغطية أسماء وأسرار الحسابات
      const allAcademies = [...(pendingData || []), ...(activeData || [])];
      const ownerIds = [...new Set(allAcademies.map(a => a.owner_id).filter(Boolean))];

      let profilesMap = {};
      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      // 3️⃣ ربط بيانات المالك بكل أكاديمية
      const enrichData = (list) => (list || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      setPendingAcademies(enrichData(pendingData));
      setActiveAcademies(enrichData(activeData));
      if (count !== null) setTotalAcademiesCount(count);

    } catch (err) {
      console.error("❌ Admin Dashboard Error:", err.message);
      setErrorMessage(isRtl ? "حدث خطأ أثناء تحميل البيانات." : "Error loading data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ⚡ 1. دالة اعتماد الحساب
  const onActivateClick = async (id, ownerId) => {
    if (processingId) return;
    setProcessingId(`activate-${id}`);

    const previousPending = [...pendingAcademies];
    const previousActive = [...activeAcademies];
    const targetAcademy = pendingAcademies.find(a => a.id === id);

    setPendingAcademies(prev => prev.filter(a => a.id !== id));
    if (targetAcademy) {
      setActiveAcademies(prev => [{ ...targetAcademy, is_active: true }, ...prev]);
    }

    try {
      const { error: acadErr } = await supabase
        .from('academies')
        .update({ is_active: true })
        .eq('id', id);

      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) {
        await supabase
          .from('profiles')
          .update({ is_activated: true })
          .eq('id', targetOwnerId);
      }
    } catch (error) {
      console.error("❌ Activate Error:", error.message);
      setPendingAcademies(previousPending);
      setActiveAcademies(previousActive);
      setErrorMessage(isRtl ? "فشل تفعيل الحساب." : "Failed to activate account.");
    } finally {
      setProcessingId(null);
    }
  };

  // 🚫 2. دالة تعليق/حظر الأكاديمية
  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;

    const confirmed = window.confirm(
      isRtl ? 'هل أنت متأكد من تعليق/حظر هذه الأكاديمية؟' : 'Deactivate this academy?'
    );
    if (!confirmed) return;

    setProcessingId(`deactivate-${id}`);

    const previousPending = [...pendingAcademies];
    const previousActive = [...activeAcademies];
    const targetAcademy = activeAcademies.find(a => a.id === id);

    setActiveAcademies(prev => prev.filter(a => a.id !== id));
    if (targetAcademy) {
      setPendingAcademies(prev => [{ ...targetAcademy, is_active: false }, ...prev]);
    }

    try {
      const { error: acadErr } = await supabase
        .from('academies')
        .update({ is_active: false })
        .eq('id', id);

      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) {
        await supabase
          .from('profiles')
          .update({ is_activated: false })
          .eq('id', targetOwnerId);
      }
    } catch (error) {
      console.error("❌ Deactivate Error:", error.message);
      setActiveAcademies(previousActive);
      setPendingAcademies(previousPending);
      setErrorMessage(isRtl ? "فشل حظر الأكاديمية." : "Failed to deactivate academy.");
    } finally {
      setProcessingId(null);
    }
  };

  // ⏱️ 3. دالة تمديد الاشتراك
  const onExtendTrialClick = async (id, currentTrialEnds, daysToAdd) => {
    if (processingId) return;
    setProcessingId(`extend-${daysToAdd}-${id}`);

    const now = new Date();
    const currentEnd = currentTrialEnds ? new Date(currentTrialEnds) : now;
    const baseDate = currentEnd > now ? currentEnd : now;
    
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    const newDateIso = baseDate.toISOString();

    const previousActive = [...activeAcademies];

    setActiveAcademies(prev =>
      prev.map(a => (a.id === id ? { ...a, trial_ends_at: newDateIso } : a))
    );

    try {
      const { error } = await supabase
        .from('academies')
        .update({ trial_ends_at: newDateIso })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("❌ Extend Trial Error:", error.message);
      setActiveAcademies(previousActive);
      setErrorMessage(isRtl ? "تعذر تمديد الفترة التجريبية." : "Failed to extend trial.");
    } finally {
      setProcessingId(null);
    }
  };

  // 📐 دالة حساب حالة الاشتراك
  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم' : 'Lifetime Account', color: '#94a3b8' };
    const diffDays = Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: isRtl ? 'منتهية التجربة ⚠️' : 'Trial Expired ⚠️', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} أيام تجريبية` : `${diffDays} days left`, color: '#10B981' };
  };

  // 🔍 التصفية والفيض الذكي
  const filterList = (list) => list.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = filterList(pendingAcademies);
  const filteredActive = filterList(activeAcademies);

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '20px' }}>
      {/* 🔴 الهيدر الرئيسي وزر التحديث الفوري */}
      <header className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className={styles.adminTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#FFF' }}>
            <FaShieldAlt style={{ color: '#FBBF24' }} />
            <span>{isRtl ? 'المنصة العالمية لحلقات القرآن (Super Admin)' : 'Global Super-Admin Terminal'}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => fetchDashboardData(true)} 
            disabled={refreshing}
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRtl ? 'مزامنة' : 'Sync'}
          </button>
          {onLogout && <button onClick={onLogout} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>{isRtl ? 'خروج آمن' : 'Logout'}</button>}
        </div>
      </header>

      {/* 📊 بطاقات الإحصائيات الفورية */}
      <div className={styles.statsGrid} style={{ marginBottom: '25px', marginTop: '25px' }}>
        <div className={`${styles.premiumStatBox} ${styles.statBoxStudents}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'الأكاديميات المشتركة عالمياً' : 'Total Global Academies'}</p>
            <h2 className={styles.statNumber}>{loading ? '...' : totalAcademiesCount}</h2>
          </div>
          <div className={styles.statIcon}><FaBuilding /></div>
        </div>
        <div className={`${styles.premiumStatBox} ${styles.statBoxPayments}`}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'طلبات انتظار المراجعة' : 'Pending Approvals'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingAcademies.length > 0 ? '#F87171' : 'inherit' }}>{loading ? '...' : pendingAcademies.length}</h2>
          </div>
          <div className={styles.statIcon}><FaClock /></div>
        </div>
      </div>

      {/* 🔍 شريط البحث الذكي */}
      <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FaSearch style={{ color: '#94A3B8' }} />
        <input 
          type="text" 
          placeholder={isRtl ? "ابحث عن أي أكاديمية باسم الأكاديمية أو البريد أو المالك..." : "Search academies by name, owner, or email..."} 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', width: '100%', fontSize: '0.9rem' }} 
        />
      </div>

      {/* 📋 القسم الأول: الطلبات المعلقة */}
      <section style={{ marginBottom: '40px' }}>
        <h2 className={styles.listTitle}>📋 {isRtl ? 'طلبات التسجيل الجديدة المعلقة' : 'Pending Registrations'}</h2>
        {filteredPending.length === 0 ? (
          <EmptyState icon={<FaClock />} title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} description={isRtl ? " جميع طلبات الانضمام لـ SaaS تمت مراجعتها واعتمادها بالكامل بنجاح." : "All onboarding requests reviewed."} />
        ) : (
          <div className={styles.requestsGrid}>
            {filteredPending.map(academy => (
              <div key={academy.id} className={styles.requestCard}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestName} onClick={() => setSelectedAcademy(academy)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{academy.name}</h3>
                  {academy.ownerProfile && (
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '4px 0' }}>
                      <span><FaUser style={{ fontSize: '0.7rem' }} /> {academy.ownerProfile.full_name}</span>
                      {academy.ownerProfile.email && <span style={{ marginRight: '8px', opacity: 0.8 }}><FaEnvelope style={{ fontSize: '0.7rem' }} /> {academy.ownerProfile.email}</span>}
                    </div>
                  )}
                  <span style={{ fontSize: '0.75rem', color: getTrialStatusBadge(academy.trial_ends_at).color }}>{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                </div>
                <button onClick={() => onActivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} className={styles.approveBtnActive}>{isRtl ? 'اعتماد الحساب' : 'Approve'}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ✅ القسم الثاني: الأكاديميات النشطة */}
      <section>
        <h2 className={styles.listTitle}>✅ {isRtl ? 'قاعدة بيانات الأكاديميات النشطة' : 'Active Subscriptions'}</h2>
        {filteredActive.length === 0 ? (
          <EmptyState icon={<FaBuilding />} title={isRtl ? "لا توجد أكاديميات نشطة" : "No Active Academies"} description={isRtl ? "لا توجد نتائج تطابق معايير البحث الحالية." : "No active academies matching query."} />
        ) : (
          <div className={styles.requestsGrid}>
            {filteredActive.map(academy => (
              <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #10B981', borderLeft: '4px solid #10B981' }}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestName} onClick={() => setSelectedAcademy(academy)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{academy.name}</h3>
                  {academy.ownerProfile && (
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '4px 0' }}>
                      <span><FaUser style={{ fontSize: '0.7rem' }} /> {academy.ownerProfile.full_name}</span>
                    </div>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>⏱️ {isRtl ? 'فترة الاشتراك: ' : 'Status: '}{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => onExtendTrialClick(academy.id, academy.trial_ends_at, 30)} disabled={processingId !== null} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>{isRtl ? '+30 يوم' : '+30 Days'}</button>
                  <button onClick={() => onDeactivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><FaBan /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔍 Modal تفاصيل الأكاديمية عند الضغط عليها */}
      {selectedAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', color: '#FFF' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><FaInfoCircle style={{ color: '#FBBF24' }} /> {selectedAcademy.name}</h3>
            <p><strong>ID:</strong> <code style={{ fontSize: '0.8rem', background: '#1E293B', padding: '2px 6px', borderRadius: '4px' }}>{selectedAcademy.id}</code></p>
            <p><strong>المالك:</strong> {selectedAcademy.ownerProfile?.full_name || 'غير محدد'}</p>
            <p><strong>البريد:</strong> {selectedAcademy.ownerProfile?.email || 'غير محدد'}</p>
            <p><strong>تاريخ التسجيل:</strong> {new Date(selectedAcademy.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</p>
            <button onClick={() => setSelectedAcademy(null)} style={{ marginTop: '20px', width: '100%', background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
