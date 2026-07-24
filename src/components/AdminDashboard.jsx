/* src/components/AdminDashboard.jsx - World-Class SaaS Enterprise Edition */
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
  FaInfoCircle,
  FaFileCsv,
  FaCopy,
  FaPlus,
  FaTimes,
  FaInfinity
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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'active' | 'expired'
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);

  // 🔔 نظام الإشعارات الداخلي (Toast System)
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 🔄 دالة جلب البيانات الآمنة
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

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

      // 2️⃣ جلب بيانات المالكين (Profiles)
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
      showToast(isRtl ? "حدث خطأ أثناء تحميل البيانات." : "Error loading data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRtl]);

  // 🚀 التحديث التلقائي + الاشتراك اللحظي
  useEffect(() => {
    fetchDashboardData();

    const academiesChannel = supabase
      .channel('admin-academies-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'academies' },
        (payload) => {
          fetchDashboardData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(academiesChannel);
    };
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

      showToast(isRtl ? `تم اعتماد أكاديمية "${targetAcademy?.name || ''}" بنجاح 🎉` : "Academy activated successfully 🎉");
    } catch (error) {
      console.error("❌ Activate Error:", error.message);
      setPendingAcademies(previousPending);
      setActiveAcademies(previousActive);
      showToast(isRtl ? "فشل تفعيل الحساب." : "Failed to activate account.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 🚫 2. دالة تعليق/حظر الأكاديمية
  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;

    const targetAcademy = activeAcademies.find(a => a.id === id);
    const confirmed = window.confirm(
      isRtl 
        ? `هل أنت متأكد من تعليق/حظر أكاديمية (${targetAcademy?.name || ''})؟` 
        : 'Deactivate this academy?'
    );
    if (!confirmed) return;

    setProcessingId(`deactivate-${id}`);

    const previousPending = [...pendingAcademies];
    const previousActive = [...activeAcademies];

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

      showToast(isRtl ? `تم تعليق أكاديمية "${targetAcademy?.name || ''}"` : "Academy deactivated", "info");
    } catch (error) {
      console.error("❌ Deactivate Error:", error.message);
      setActiveAcademies(previousActive);
      setPendingAcademies(previousPending);
      showToast(isRtl ? "فشل حظر الأكاديمية." : "Failed to deactivate academy.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⏱️ 3. دالة تمديد الاشتراك بأيام مخصصة أو جعل الحساب دائماً
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

      showToast(
        isLifetime 
          ? (isRtl ? "تم تحويل الحساب إلى اشتراك دائم ♾️" : "Account upgraded to Lifetime ♾️")
          : (isRtl ? `تم تمديد الفترة التجريبية +${daysToAdd} يوماً` : `Trial extended by +${daysToAdd} days`)
      );
      setExtendModalAcademy(null);
    } catch (error) {
      console.error("❌ Extend Trial Error:", error.message);
      setActiveAcademies(previousActive);
      showToast(isRtl ? "تعذر تمديد الفترة التجريبية." : "Failed to extend trial.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 📊 4. تصدير البيانات إلى CSV
  const exportToCSV = () => {
    const allList = [...pendingAcademies, ...activeAcademies];
    if (allList.length === 0) {
      showToast(isRtl ? "لا توجد بيانات للتصدير" : "No data to export", "info");
      return;
    }

    const headers = ["ID", "Academy Name", "Owner Name", "Owner Email", "Status", "Trial Ends At", "Created At"];
    const rows = allList.map(a => [
      a.id,
      `"${a.name || ''}"`,
      `"${a.ownerProfile?.full_name || ''}"`,
      `"${a.ownerProfile?.email || ''}"`,
      a.is_active ? "Active" : "Pending",
      a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString() : "Lifetime",
      new Date(a.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academies_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(isRtl ? "تم تصدير ملف CSV بنجاح 📁" : "CSV exported successfully 📁");
  };

  // 📐 دالة حساب حالة الاشتراك
  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم ♾️' : 'Lifetime Account ♾️', color: '#38BDF8' };
    const diffDays = Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: isRtl ? 'منتهية التجربة ⚠️' : 'Trial Expired ⚠️', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} أيام تجريبية` : `${diffDays} days left`, color: '#10B981' };
  };

  // 🔍 التصفية والفيض الذكي بحسب التبويب المختار
  const filterList = (list) => list.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ownerProfile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = filterList(pendingAcademies);
  const filteredActive = filterList(activeAcademies);

  // الفلترة للتجربة المنتهية
  const expiredAcademies = [...pendingAcademies, ...activeAcademies].filter(a => {
    if (!a.trial_ends_at) return false;
    return new Date(a.trial_ends_at) <= new Date();
  });
  const filteredExpired = filterList(expiredAcademies);

  // نسخ إلى الحافظة
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(isRtl ? `تم نسخ ${label} إلى الحافظة` : `${label} copied to clipboard`);
  };

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr', padding: '20px' }}>
      
      {/* 🔔 الإشعارات المنبثقة (Toast Notification) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#3B82F6' : '#10B981',
          color: '#FFF',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.message}
        </div>
      )}

      {/* 🔴 الهيدر الرئيسي */}
      <header className={styles.adminHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className={styles.adminTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#FFF' }}>
            <FaShieldAlt style={{ color: '#FBBF24' }} />
            <span>{isRtl ? 'المنصة العالمية لحلقات القرآن (Super Admin)' : 'Global Super-Admin Terminal'}</span>
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={exportToCSV}
            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}
          >
            <FaFileCsv />
            {isRtl ? 'تصدير CSV' : 'Export CSV'}
          </button>

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

        <div className={`${styles.premiumStatBox}`} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className={styles.statBoxInfo}>
            <p className={styles.statLabel}>{isRtl ? 'اشتراكات منتهية التجربة' : 'Expired Trials'}</p>
            <h2 className={styles.statNumber} style={{ color: '#EF4444' }}>{loading ? '...' : expiredAcademies.length}</h2>
          </div>
          <div className={styles.statIcon}><FaExclamationTriangle style={{ color: '#EF4444' }} /></div>
        </div>
      </div>

      {/* 🗂️ أزرار التبويب الذكي (Smart Tabs) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: pendingAcademies.length + activeAcademies.length },
          { id: 'pending', label: isRtl ? 'الطلبات المعلقة' : 'Pending', count: pendingAcademies.length, color: '#FBBF24' },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: activeAcademies.length, color: '#10B981' },
          { id: 'expired', label: isRtl ? 'منتهية التجربة' : 'Expired', count: expiredAcademies.length, color: '#EF4444' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#3B82F6' : 'rgba(30, 41, 59, 0.6)',
              color: '#FFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>{tab.count}</span>
          </button>
        ))}
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
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><FaTimes /></button>
        )}
      </div>

      {/* 📋 قائمة الطلبات المعلقة (تظهر إذا كان التبويب 'all' أو 'pending') */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className={styles.listTitle}>📋 {isRtl ? 'طلبات التسجيل الجديدة المعلقة' : 'Pending Registrations'}</h2>
          {filteredPending.length === 0 ? (
            <EmptyState icon={<FaClock />} title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} description={isRtl ? "جميع طلبات الانضمام لـ SaaS تمت مراجعتها واعتمادها بالكامل بنجاح." : "All onboarding requests reviewed."} />
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
      )}

      {/* ✅ قائمة الأكاديميات النشطة (تظهر إذا كان التبويب 'all' أو 'active') */}
      {(activeTab === 'all' || activeTab === 'active') && (
        <section style={{ marginBottom: '40px' }}>
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
                    <button onClick={() => setExtendModalAcademy(academy)} disabled={processingId !== null} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaPlus style={{ fontSize: '0.65rem' }} /> {isRtl ? 'تمديد' : 'Extend'}
                    </button>
                    <button onClick={() => onDeactivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><FaBan /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ⚠️ قائمة المنتهية تجريبتهم (تظهر إذا كان التبويب 'expired') */}
      {activeTab === 'expired' && (
        <section style={{ marginBottom: '40px' }}>
          <h2 className={styles.listTitle} style={{ color: '#F87171' }}>⚠️ {isRtl ? 'الأكاديميات المنتهية الفترة التجريبية' : 'Expired Trial Academies'}</h2>
          {filteredExpired.length === 0 ? (
            <EmptyState icon={<FaCheckCircle />} title={isRtl ? "لا توجد اشتراكات منتهية" : "No Expired Subscriptions"} description={isRtl ? "جميع الأكاديميات تمتلك فترات تجريبية أو اشتراكات سارية." : "All subscriptions are healthy."} />
          ) : (
            <div className={styles.requestsGrid}>
              {filteredExpired.map(academy => (
                <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #EF4444', borderLeft: '4px solid #EF4444' }}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName} onClick={() => setSelectedAcademy(academy)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{academy.name}</h3>
                    {academy.ownerProfile && (
                      <div style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: '4px 0' }}>
                        <span><FaUser style={{ fontSize: '0.7rem' }} /> {academy.ownerProfile.full_name}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 'bold' }}>⚠️ {isRtl ? 'منتهية التجربة' : 'Expired'}</span>
                  </div>
                  <button onClick={() => setExtendModalAcademy(academy)} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {isRtl ? 'تجديد الاشتراك' : 'Renew'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 🔍 Modal تفاصيل الأكاديمية السريعة */}
      {selectedAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', color: '#FFF', position: 'relative' }}>
            <button onClick={() => setSelectedAcademy(null)} style={{ position: 'absolute', top: '16px', left: isRtl ? '16px' : 'auto', right: isRtl ? 'auto' : '16px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem' }}><FaTimes /></button>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><FaInfoCircle style={{ color: '#FBBF24' }} /> {selectedAcademy.name}</h3>
            
            <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <small style={{ color: '#94A3B8' }}>Academy ID</small>
                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>{selectedAcademy.id}</p>
              </div>
              <button onClick={() => copyToClipboard(selectedAcademy.id, "ID الأكاديمية")} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer' }}><FaCopy /></button>
            </div>

            <p><strong>المالك:</strong> {selectedAcademy.ownerProfile?.full_name || 'غير محدد'}</p>
            <p>
              <strong>البريد:</strong> {selectedAcademy.ownerProfile?.email || 'غير محدد'}
              {selectedAcademy.ownerProfile?.email && (
                <button onClick={() => copyToClipboard(selectedAcademy.ownerProfile.email, "البريد الإلكتروني")} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', marginRight: '8px' }}><FaCopy /></button>
              )}
            </p>
            <p><strong>حالة الحساب:</strong> {selectedAcademy.is_active ? '✅ نشط' : '⏳ معلق'}</p>
            <p><strong>تاريخ التسجيل:</strong> {new Date(selectedAcademy.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</p>

            <button onClick={() => setSelectedAcademy(null)} style={{ marginTop: '20px', width: '100%', background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* ⏱️ Modal تمديد الاشتراك المخصص */}
      {extendModalAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #FBBF24', borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '100%', color: '#FFF', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '10px' }}>⏱️ {isRtl ? 'تمديد اشتراك الأكاديمية' : 'Extend Subscription'}</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '20px' }}>{extendModalAcademy.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 7)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#FFF', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+7 {isRtl ? 'أيام' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 15)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#FFF', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+15 {isRtl ? 'يوم' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 30)} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FBBF24', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+30 {isRtl ? 'يوم' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 90)} style={{ background: '#1E293B', border: '1px solid #10B981', color: '#34D399', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+90 {isRtl ? 'يوم' : 'Days'}</button>
            </div>

            <button 
              onClick={() => onExtendTrialClick(extendModalAcademy.id, 0, true)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFF', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}
            >
              <FaInfinity /> {isRtl ? 'منح اشتراك دائم (Lifetime)' : 'Grant Lifetime Access'}
            </button>

            <button onClick={() => setExtendModalAcademy(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem' }}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
