import React, { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState'; 
import { 
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
  FaInfoCircle,
  FaFileCsv,
  FaCopy,
  FaPlus,
  FaTimes,
  FaInfinity
} from 'react-icons/fa';

export default function AdminDashboard({ isRtl = true, onLogout }) {
  const [pendingAcademies, setPendingAcademies] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
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

      const { count } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

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

      const enrichData = (list) => (list || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      setPendingAcademies(enrichData(pendingData));
      setActiveAcademies(enrichData(activeData));
      if (count !== null) setTotalAcademiesCount(count);

    } catch (err) {
      console.error("❌ Admin Dashboard Error:", err.message);
      showToast(isRtl ? "حدث خطأ أثناء تحميل البيانات." : "Error loading data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchDashboardData();
    const academiesChannel = supabase
      .channel('admin-academies-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
        fetchDashboardData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(academiesChannel);
    };
  }, [fetchDashboardData]);

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
      const { error: acadErr } = await supabase.from('academies').update({ is_active: true }).eq('id', id);
      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) {
        await supabase.from('profiles').update({ is_activated: true }).eq('id', targetOwnerId);
      }
      showToast(isRtl ? `تم تفعيل "${targetAcademy?.name || ''}" 🎉` : "Academy activated 🎉");
    } catch (error) {
      setPendingAcademies(previousPending);
      setActiveAcademies(previousActive);
      showToast(isRtl ? "فشل تفعيل الحساب." : "Failed to activate.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = activeAcademies.find(a => a.id === id);
    if (!window.confirm(isRtl ? `تعليق/حظر (${targetAcademy?.name || ''})؟` : 'Deactivate this academy?')) return;

    setProcessingId(`deactivate-${id}`);
    const previousPending = [...pendingAcademies];
    const previousActive = [...activeAcademies];

    setActiveAcademies(prev => prev.filter(a => a.id !== id));
    if (targetAcademy) setPendingAcademies(prev => [{ ...targetAcademy, is_active: false }, ...prev]);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) await supabase.from('profiles').update({ is_activated: false }).eq('id', targetOwnerId);

      showToast(isRtl ? `تم تعليق "${targetAcademy?.name || ''}"` : "Deactivated", "info");
    } catch (error) {
      setActiveAcademies(previousActive);
      setPendingAcademies(previousPending);
      showToast(isRtl ? "فشل الحظر." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const onExtendTrialClick = async (id, daysToAdd, isLifetime = false) => {
    if (processingId) return;
    setProcessingId(`extend-${id}`);

    let newDateIso = null;
    if (!isLifetime) {
      const target = [...pendingAcademies, ...activeAcademies].find(a => a.id === id);
      const now = new Date();
      const currentEnd = target?.trial_ends_at ? new Date(target.trial_ends_at) : now;
      const baseDate = currentEnd > now ? currentEnd : now;
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      newDateIso = baseDate.toISOString();
    }

    try {
      const { error } = await supabase.from('academies').update({ trial_ends_at: newDateIso }).eq('id', id);
      if (error) throw error;

      showToast(isLifetime ? (isRtl ? "اشتراك دائم ♾️" : "Lifetime ♾️") : (isRtl ? `+${daysToAdd} يوم` : `+${daysToAdd} Days`));
      setExtendModalAcademy(null);
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "تعذر التمديد." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const exportToCSV = () => {
    const allList = [...pendingAcademies, ...activeAcademies];
    if (allList.length === 0) return;

    const headers = ["ID", "Academy Name", "Owner", "Email", "Status", "Trial Ends At"];
    const rows = allList.map(a => [
      a.id, `"${a.name || ''}"`, `"${a.ownerProfile?.full_name || ''}"`, `"${a.ownerProfile?.email || ''}"`,
      a.is_active ? "Active" : "Pending", a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString() : "Lifetime"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `academies_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم ♾️' : 'Lifetime ♾️', color: '#38BDF8' };
    const diffDays = Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: isRtl ? 'منتهية ⚠️' : 'Expired ⚠️', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} يوم` : `${diffDays}d left`, color: '#10B981' };
  };

  const filterList = (list) => list.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = filterList(pendingAcademies);
  const filteredActive = filterList(activeAcademies);
  const expiredAcademies = [...pendingAcademies, ...activeAcademies].filter(a => a.trial_ends_at && new Date(a.trial_ends_at) <= new Date());
  const filteredExpired = filterList(expiredAcademies);

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 🔔 Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#3B82F6' : '#10B981',
          color: '#FFF', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)', maxWidth: '90%', textAlign: 'center'
        }}>
          {toast.message}
        </div>
      )}

      {/* 🔝 Responsive Header */}
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>
          <FaShieldAlt style={{ color: '#FBBF24', flexShrink: 0 }} />
          <span>{isRtl ? 'المنصة العالمية لحلقات القرآن' : 'Global Quran Terminal'}</span>
          <span className={styles.adminBadge}>Super Admin</span>
        </h1>
        
        <div className={styles.headerActions}>
          <button onClick={exportToCSV} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <FaFileCsv /> {isRtl ? 'CSV' : 'CSV'}
          </button>
          <button onClick={() => fetchDashboardData(true)} disabled={refreshing} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <FaSync style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> {isRtl ? 'مزامنة' : 'Sync'}
          </button>
          {onLogout && <button onClick={onLogout} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>{isRtl ? 'خروج' : 'Logout'}</button>}
        </div>
      </header>

      {/* 📊 Responsive Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.premiumStatBox}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'الأكاديميات المشتركة' : 'Total Academies'}</p>
            <h2 className={styles.statNumber}>{loading ? '...' : totalAcademiesCount}</h2>
          </div>
          <div className={styles.statIcon}><FaBuilding /></div>
        </div>

        <div className={styles.premiumStatBox}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'انتظار المراجعة' : 'Pending'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingAcademies.length > 0 ? '#F87171' : 'inherit' }}>{loading ? '...' : pendingAcademies.length}</h2>
          </div>
          <div className={styles.statIcon}><FaClock /></div>
        </div>

        <div className={styles.premiumStatBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'اشتراكات منتهية' : 'Expired'}</p>
            <h2 className={styles.statNumber} style={{ color: '#EF4444' }}>{loading ? '...' : expiredAcademies.length}</h2>
          </div>
          <div className={styles.statIcon}><FaExclamationTriangle style={{ color: '#EF4444' }} /></div>
        </div>
      </div>

      {/* 🗂️ Scrollable Tabs Bar */}
      <div className={styles.tabsBar}>
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: pendingAcademies.length + activeAcademies.length },
          { id: 'pending', label: isRtl ? 'الطلبات المعلقة' : 'Pending', count: pendingAcademies.length },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: activeAcademies.length },
          { id: 'expired', label: isRtl ? 'منتهية التجربة' : 'Expired', count: expiredAcademies.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#3B82F6' : 'rgba(30, 41, 59, 0.6)',
              color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 🔍 Search Input */}
      <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaSearch style={{ color: '#94A3B8', flexShrink: 0 }} />
        <input 
          type="text" 
          placeholder={isRtl ? "ابحث بالاسم أو البريد..." : "Search by name or email..."} 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', width: '100%', fontSize: '0.85rem' }} 
        />
        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><FaTimes /></button>}
      </div>

      {/* 📋 Pending Section */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '14px' }}>📋 {isRtl ? 'طلبات التسجيل المعلقة' : 'Pending Registrations'}</h2>
          {filteredPending.length === 0 ? (
            <EmptyState icon={<FaClock />} title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} description={isRtl ? "جميع الطلبات تم البت فيها." : "All caught up."} />
          ) : (
            <div className={styles.requestsGrid}>
              {filteredPending.map(academy => (
                <div key={academy.id} className={styles.requestCard}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName} onClick={() => setSelectedAcademy(academy)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{academy.name}</h3>
                    {academy.ownerProfile && (
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>
                        <span><FaUser style={{ fontSize: '0.65rem' }} /> {academy.ownerProfile.full_name}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: getTrialStatusBadge(academy.trial_ends_at).color }}>{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => onActivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.78rem' }}>{isRtl ? 'اعتماد' : 'Approve'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ✅ Active Section */}
      {(activeTab === 'all' || activeTab === 'active') && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '14px' }}>✅ {isRtl ? 'الأكاديميات النشطة' : 'Active Academies'}</h2>
          {filteredActive.length === 0 ? (
            <EmptyState icon={<FaBuilding />} title={isRtl ? "لا توجد أكاديميات نشطة" : "No Active Academies"} description={isRtl ? "لا توجد نتائج مطابقة." : "No active results."} />
          ) : (
            <div className={styles.requestsGrid}>
              {filteredActive.map(academy => (
                <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #10B981' }}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName} onClick={() => setSelectedAcademy(academy)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{academy.name}</h3>
                    {academy.ownerProfile && (
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>
                        <span><FaUser style={{ fontSize: '0.65rem' }} /> {academy.ownerProfile.full_name}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>⏱️ {getTrialStatusBadge(academy.trial_ends_at).text}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => setExtendModalAcademy(academy)} disabled={processingId !== null} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaPlus style={{ fontSize: '0.65rem' }} /> {isRtl ? 'تمديد' : 'Extend'}
                    </button>
                    <button onClick={() => onDeactivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><FaBan /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 🔍 Details Modal */}
      {selectedAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '20px', maxWidth: '450px', width: '100%', color: '#FFF', position: 'relative' }}>
            <button onClick={() => setSelectedAcademy(null)} style={{ position: 'absolute', top: '14px', left: isRtl ? '14px' : 'auto', right: isRtl ? 'auto' : '14px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem' }}><FaTimes /></button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.1rem' }}><FaInfoCircle style={{ color: '#FBBF24' }} /> {selectedAcademy.name}</h3>
            
            <p style={{ fontSize: '0.85rem' }}><strong>المالك:</strong> {selectedAcademy.ownerProfile?.full_name || 'غير محدد'}</p>
            <p style={{ fontSize: '0.85rem' }}><strong>البريد:</strong> {selectedAcademy.ownerProfile?.email || 'غير محدد'}</p>
            <p style={{ fontSize: '0.85rem' }}><strong>حالة الحساب:</strong> {selectedAcademy.is_active ? '✅ نشط' : '⏳ معلق'}</p>
            <p style={{ fontSize: '0.85rem' }}><strong>تاريخ التسجيل:</strong> {new Date(selectedAcademy.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</p>

            <button onClick={() => setSelectedAcademy(null)} style={{ marginTop: '16px', width: '100%', background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* ⏱️ Extend Modal */}
      {extendModalAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #FBBF24', borderRadius: '16px', padding: '20px', maxWidth: '400px', width: '100%', color: '#FFF', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>⏱️ {isRtl ? 'تمديد اشتراك الأكاديمية' : 'Extend Subscription'}</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>{extendModalAcademy.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 7)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#FFF', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+7 {isRtl ? 'أيام' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 30)} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FBBF24', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+30 {isRtl ? 'يوم' : 'Days'}</button>
            </div>

            <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 0, true)} style={{ width: '100%', background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              <FaInfinity /> {isRtl ? 'اشتراك دائم (Lifetime)' : 'Grant Lifetime'}
            </button>

            <button onClick={() => setExtendModalAcademy(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8rem' }}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
