import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FaPlus,
  FaTimes,
  FaInfinity,
  FaReceipt,
  FaEye,
  FaMoneyBillWave
} from 'react-icons/fa';

export default function AdminDashboard({ isRtl = true, onLogout }) {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  
  // 🔍 حالات البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);                               

  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState(null); // معاينة صورة الإشعار
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 📥 جلب كافة بيانات اللوحة
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      // 1️⃣ جلب الطلبات المعلقة من جدول saas_subscriptions
      const { data: subData, error: subErr } = await supabase
        .from('saas_subscriptions')
        .select(`
          *,
          academies (*),
          profiles (*)
        `)
        .eq('status', 'pending_verification')
        .order('created_at', { ascending: false });

      if (subErr) throw subErr;

      // 2️⃣ جلب الأكاديميات النشطة
      const { data: activeData, error: aErr } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (aErr) throw aErr;

      // 3️⃣ إجمالي عدد الأكاديميات
      const { count } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      // إثراء تفاصيل المالك للأكاديميات النشطة
      const ownerIds = [...new Set((activeData || []).map(a => a.owner_id).filter(Boolean))];
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

      const enrichedActiveData = (activeData || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      setPendingSubscriptions(subData || []);
      setActiveAcademies(enrichedActiveData);
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

    // الاستماع للتغيرات في جدول الاشتلاكات والأكاديميات فورياً
    const realTimeChannel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saas_subscriptions' }, () => {
        fetchDashboardData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
        fetchDashboardData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(realTimeChannel);
    };
  }, [fetchDashboardData]);

  // إغلاق المنسدلة عند النقر في الخارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ اعتماد طلب الاشتراك
  const onApproveSubscription = async (subscription) => {
    if (processingId) return;
    setProcessingId(`approve-${subscription.id}`);

    try {
      const now = new Date();
      let expiresAt = new Date();

      if (subscription.plan_duration === 'yearly') {
        expiresAt.setFullYear(now.getFullYear() + 1);
      } else if (subscription.plan_duration === 'lifetime') {
        expiresAt.setFullYear(now.getFullYear() + 100);
      } else {
        expiresAt.setMonth(now.getMonth() + 1);
      }

      // 1. تحديث حالة الاشتراك في saas_subscriptions
      const { error: subErr } = await supabase
        .from('saas_subscriptions')
        .update({
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', subscription.id);

      if (subErr) throw subErr;

      // 2. تفعيل الأكاديمية وتعديل تاريخ انتهاء التجربة/الاشتراك
      if (subscription.academy_id) {
        await supabase
          .from('academies')
          .update({ 
            is_active: true,
            trial_ends_at: expiresAt.toISOString()
          })
          .eq('id', subscription.academy_id);
      }

      // 3. تفعيل حساب المالك
      if (subscription.payer_id) {
        await supabase
          .from('profiles')
          .update({ is_activated: true })
          .eq('id', subscription.payer_id);
      }

      showToast(isRtl ? `تم تفعيل الاشتراك والأكاديمية بنجاح! 🎉` : "Subscription Approved 🎉");
      fetchDashboardData(true);
    } catch (error) {
      console.error("Approve Error:", error);
      showToast(isRtl ? "فشل اعتماد الطلب." : "Failed to approve.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 🚫 رفض طلب الاشتراك
  const onRejectSubscription = async (subscriptionId) => {
    if (processingId) return;
    if (!window.confirm(isRtl ? 'هل أنت تأكد من رفض هذا الطلب؟' : 'Reject this order?')) return;

    setProcessingId(`reject-${subscriptionId}`);
    try {
      const { error } = await supabase
        .from('saas_subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', subscriptionId);

      if (error) throw error;
      showToast(isRtl ? "تم رفض الطلب." : "Order Rejected.", "info");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "حدث خطأ أثناء الرفض." : "Error rejecting.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⛔ تعليق أكاديمية نشطة
  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = activeAcademies.find(a => a.id === id);
    if (!window.confirm(isRtl ? `تعليق/حظر (${targetAcademy?.name || ''})؟` : 'Deactivate this academy?')) return;

    setProcessingId(`deactivate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) await supabase.from('profiles').update({ is_activated: false }).eq('id', targetOwnerId);

      showToast(isRtl ? `تم تعليق "${targetAcademy?.name || ''}"` : "Deactivated", "info");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل الحظر." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⏱️ تمديد اشتراك أكاديمية نشطة
  const onExtendTrialClick = async (id, daysToAdd, isLifetime = false) => {
    if (processingId) return;
    setProcessingId(`extend-${id}`);

    let newDateIso = null;
    if (!isLifetime) {
      const target = activeAcademies.find(a => a.id === id);
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
    const allList = activeAcademies;
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

  const expiredAcademies = activeAcademies.filter(a => a.trial_ends_at && new Date(a.trial_ends_at) <= new Date());

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
            <FaFileCsv /> CSV
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
            <p className={styles.statLabel}>{isRtl ? 'انتظار المراجعة' : 'Pending Verification'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingSubscriptions.length > 0 ? '#F87171' : 'inherit' }}>{loading ? '...' : pendingSubscriptions.length}</h2>
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
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: pendingSubscriptions.length + activeAcademies.length },
          { id: 'pending', label: isRtl ? 'طلبات الاشتراكات المعلقة' : 'Pending Subscriptions', count: pendingSubscriptions.length },
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

      {/* 📋 Pending Subscriptions Section (الطلبات المعلقة للمراجعة) */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <section className={styles.sectionPending} style={{ marginBottom: '32px' }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaClock style={{ color: '#FBBF24' }} />
            <span>{isRtl ? 'طلبات الاشتراك بانتظار المراجعة' : 'Pending Subscriptions'}</span>
          </h2>

          {pendingSubscriptions.length === 0 ? (
            <EmptyState 
              icon={<FaCheckCircle style={{ color: '#10B981' }} />} 
              title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} 
              description={isRtl ? "جميع الطلبات تم البت فيها." : "All caught up."} 
            />
          ) : (
            <div className={styles.requestsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {pendingSubscriptions.map(sub => {
                const academyName = sub.academies?.name || 'أكاديمية غير معروفة';
                const payerName = sub.profiles?.full_name || 'غير معروف';
                const payerPhone = sub.profiles?.phone || '';
                const receiptUrl = sub.metadata?.receipt_url;

                return (
                  <div key={sub.id} className={styles.requestCard} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: '#FFF', margin: '0 0 4px 0' }}>{academyName}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUser style={{ fontSize: '0.7rem' }} /> {payerName} {payerPhone && `(${payerPhone})`}
                        </p>
                      </div>
                      <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: '1px solid #FBBF24', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {sub.plan_tier?.toUpperCase()} - {sub.plan_duration}
                      </span>
                    </div>

                    <div style={{ background: '#0F172A', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>المبلغ المفروض:</span>
                        <strong style={{ color: '#34D399' }}>{sub.price} {sub.currency}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>طريقة الدفع:</span>
                        <span>{sub.payment_gateway || 'تحويل يدوي'}</span>
                      </div>
                      {sub.metadata?.coupon_code && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>كوبون الخصم:</span>
                          <span style={{ color: '#FBBF24' }}>{sub.metadata.coupon_code}</span>
                        </div>
                      )}
                    </div>

                    {/* زر معاينة إشعار التحويل */}
                    {receiptUrl ? (
                      <button 
                        onClick={() => setReceiptModalUrl(receiptUrl)}
                        style={{ width: '100%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3B82F6', color: '#60A5FA', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}
                      >
                        <FaEye /> {isRtl ? 'معاينة إشعار التحويل 📄' : 'View Receipt'}
                      </button>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: '#EF4444', textAlign: 'center', marginBottom: '12px' }}>⚠️ لا يوجد إشعار مرفق</p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        onClick={() => onApproveSubscription(sub)} 
                        disabled={processingId !== null}
                        style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        {processingId === `approve-${sub.id}` ? 'جاري الاعتماد...' : 'تأكيد وقبول ✅'}
                      </button>
                      <button 
                        onClick={() => onRejectSubscription(sub.id)} 
                        disabled={processingId !== null}
                        style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        رفض الطلب ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ✅ Active Section */}
      {(activeTab === 'all' || activeTab === 'active') && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '14px' }}>✅ {isRtl ? 'الأكاديميات النشطة' : 'Active Academies'}</h2>
          {activeAcademies.length === 0 ? (
            <EmptyState icon={<FaBuilding />} title={isRtl ? "لا توجد أكاديميات نشطة" : "No Active Academies"} description={isRtl ? "لا توجد نتائج مطابقة." : "No active results."} />
          ) : (
            <div className={styles.requestsGrid}>
              {activeAcademies.map(academy => (
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

      {/* 🖼️ Modal معاينة إشعار التحويل */}
      {receiptModalUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '20px', maxWidth: '500px', width: '100%', color: '#FFF', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setReceiptModalUrl(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}>
              <FaTimes />
            </button>
            <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>📄 إشعار التحويل المرفق</h3>
            <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={receiptModalUrl} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
            </div>
            <button onClick={() => setReceiptModalUrl(null)} style={{ marginTop: '16px', background: '#3B82F6', color: '#FFF', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ⏱️ Modal التمديد */}
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
