import React, { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState'; 

// ✨ استيراد الأيقونات من Lucide React الحديثة
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Ban,
  RefreshCw,
  AlertTriangle,
  User,
  FileSpreadsheet,
  Plus,
  X,
  Infinity as InfinityIcon,
  Eye,
  Unlock
} from 'lucide-react';

// 🛡️ دالة أمان لمنع خطأ React #31 واستخراج النصوص أو الأسطر البرمجية بأمان
const getSafeText = (val, defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.ar || val.en || val.name || val.title || Object.values(val)[0] || defaultVal;
  }
  return String(val);
};

export default function AdminDashboard({ isRtl = true, onLogout }) {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [activeAcademies, setActiveAcademies] = useState([]); 
  const [blockedAcademies, setBlockedAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState(null); 
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 📥 جلب كافة البيانات من Supabase
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      // 1️⃣ جلب طلبات الاشتراكات المعلقة
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

      // 3️⃣ جلب الأكاديميات المحظورة / المعطلة
      const { data: blockedData, error: bErr } = await supabase
        .from('academies')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

      if (bErr) throw bErr;

      // 4️⃣ حساب إجمالي الأكاديميات
      const { count } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      // ربط بيانات المالكين (Profiles) بالأكاديميات
      const allAcademies = [...(activeData || []), ...(blockedData || [])];
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

      const enrichedActiveData = (activeData || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      const enrichedBlockedData = (blockedData || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      setPendingSubscriptions(subData || []);
      setActiveAcademies(enrichedActiveData);
      setBlockedAcademies(enrichedBlockedData);
      if (count !== null) setTotalAcademiesCount(count);

    } catch (err) {
      console.error("❌ Admin Dashboard Fetch Error:", err.message);
      showToast(isRtl ? "حدث خطأ أثناء تحميل البيانات." : "Error loading data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchDashboardData();

    // الاشتراك في التحديثات الفورية Realtime
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

  // ✅ تفعيل واعتراف طلب الاشتراك
  const onApproveSubscription = async (subscription) => {
    if (processingId) return;
    setProcessingId(`approve-${subscription.id}`);

    try {
      const now = new Date();
      let expiresAt = new Date();

      const duration = getSafeText(subscription.plan_duration);
      if (duration === 'yearly') {
        expiresAt.setFullYear(now.getFullYear() + 1);
      } else if (duration === 'lifetime') {
        expiresAt.setFullYear(now.getFullYear() + 100);
      } else {
        expiresAt.setMonth(now.getMonth() + 1);
      }

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

      if (subscription.academy_id) {
        await supabase
          .from('academies')
          .update({ 
            is_active: true,
            trial_ends_at: expiresAt.toISOString()
          })
          .eq('id', subscription.academy_id);
      }

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

  // ⛔ تعليق / حظر أكاديمية
  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = activeAcademies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');
    
    if (!window.confirm(isRtl ? `هل ترغب بتعليق/حظر (${targetName})؟` : 'Deactivate this academy?')) return;

    setProcessingId(`deactivate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) {
        await supabase.from('profiles').update({ is_activated: false }).eq('id', targetOwnerId);
      }

      showToast(isRtl ? `تم حظر "${targetName}"` : "Deactivated", "info");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل عملية الحظر." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 🔓 إلغاء الحظر وتفعيل الأكاديمية
  const onActivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = blockedAcademies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');

    if (!window.confirm(isRtl ? `إلغاء حظر وتفعيل (${targetName})؟` : 'Activate this academy?')) return;

    setProcessingId(`activate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: true }).eq('id', id);
      if (acadErr) throw acadErr;

      const targetOwnerId = ownerId || targetAcademy?.owner_id;
      if (targetOwnerId) {
        await supabase.from('profiles').update({ is_activated: true }).eq('id', targetOwnerId);
      }

      showToast(isRtl ? `تم إلغاء حظر "${targetName}" بنجاح! 🎉` : "Activated", "success");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل تفعيل الأكاديمية." : "Failed to activate.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⏱️ تمديد اشتراك الأكاديمية
  const onExtendTrialClick = async (id, daysToAdd, isLifetime = false) => {
    if (processingId) return;
    setProcessingId(`extend-${id}`);

    let newDateIso = null;
    if (!isLifetime) {
      const target = activeAcademies.find(a => a.id === id) || blockedAcademies.find(a => a.id === id);
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

  // 📊 تصدير البيانات إلى CSV
  const exportToCSV = () => {
    const allList = [...activeAcademies, ...blockedAcademies];
    if (allList.length === 0) return;

    const headers = ["ID", "Academy Name", "Owner", "Email", "Status", "Trial Ends At"];
    const rows = allList.map(a => [
      a.id, 
      `"${getSafeText(a.name)}"`, 
      `"${getSafeText(a.ownerProfile?.full_name)}"`, 
      `"${getSafeText(a.ownerProfile?.email)}"`,
      a.is_active ? "Active" : "Blocked", 
      a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString() : "Lifetime"
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
      
      {/* 🔔 التنبيهات المؤقتة Toast */}
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

      {/* 🔝 الهيدر الرئيسي */}
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>
          <ShieldCheck size={24} color="#FBBF24" style={{ flexShrink: 0 }} />
          <span>{isRtl ? 'المنصة العالمية لحلقات القرآن' : 'Global Quran Terminal'}</span>
          <span className={styles.adminBadge}>Super Admin</span>
        </h1>
        
        <div className={styles.headerActions}>
          <button onClick={exportToCSV} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button onClick={() => fetchDashboardData(true)} disabled={refreshing} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <RefreshCw size={16} className={refreshing ? styles.spinAnimation : ''} /> {isRtl ? 'مزامنة' : 'Sync'}
          </button>
          {onLogout && <button onClick={onLogout} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>{isRtl ? 'خروج' : 'Logout'}</button>}
        </div>
      </header>

      {/* 📊 بطاقات الإحصائيات */}
      <div className={styles.statsGrid}>
        <div className={styles.premiumStatBox}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'الأكاديميات المشتركة' : 'Total Academies'}</p>
            <h2 className={styles.statNumber}>{loading ? '...' : totalAcademiesCount}</h2>
          </div>
          <div className={styles.statIcon}><Building2 size={24} /></div>
        </div>

        <div className={styles.premiumStatBox}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'انتظار المراجعة' : 'Pending Verification'}</p>
            <h2 className={styles.statNumber} style={{ color: pendingSubscriptions.length > 0 ? '#FBBF24' : 'inherit' }}>{loading ? '...' : pendingSubscriptions.length}</h2>
          </div>
          <div className={styles.statIcon}><Clock size={24} /></div>
        </div>

        <div className={styles.premiumStatBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'أكاديميات محظورة / منتهية' : 'Blocked / Expired'}</p>
            <h2 className={styles.statNumber} style={{ color: '#EF4444' }}>{loading ? '...' : blockedAcademies.length + expiredAcademies.length}</h2>
          </div>
          <div className={styles.statIcon}><AlertTriangle size={24} color="#EF4444" /></div>
        </div>
      </div>

      {/* 🗂️ شريط التبويبات Tabs */}
      <div className={styles.tabsBar}>
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: pendingSubscriptions.length + activeAcademies.length + blockedAcademies.length },
          { id: 'pending', label: isRtl ? 'طلبات الاشتراكات المعلقة' : 'Pending Subscriptions', count: pendingSubscriptions.length },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: activeAcademies.length },
          { id: 'blocked', label: isRtl ? 'المحظورة / المعطلة 🚫' : 'Blocked', count: blockedAcademies.length },
          { id: 'expired', label: isRtl ? 'منتهية التجربة ⚠️' : 'Expired', count: expiredAcademies.length },
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

      {/* 📋 قسم طلبات الاشتراك المعلقة */}
      {(activeTab === 'all' || activeTab === 'pending') && (
        <section className={styles.sectionPending} style={{ marginBottom: '32px' }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#FBBF24" />
            <span>{isRtl ? 'طلبات الاشتراك بانتظار المراجعة' : 'Pending Subscriptions'}</span>
          </h2>

          {pendingSubscriptions.length === 0 ? (
            <EmptyState 
              icon={<CheckCircle2 size={36} color="#10B981" />} 
              title={isRtl ? "لا توجد طلبات معلقة" : "No Pending Requests"} 
              description={isRtl ? "جميع الطلبات تم البت فيها." : "All caught up."} 
            />
          ) : (
            <div className={styles.requestsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {pendingSubscriptions.map(sub => {
                const academyName = getSafeText(sub.academies?.name, 'أكاديمية غير معروفة');
                const payerName = getSafeText(sub.profiles?.full_name, 'غير معروف');
                const payerPhone = getSafeText(sub.profiles?.phone);
                const receiptUrl = sub.metadata?.receipt_url;
                const planTier = getSafeText(sub.plan_tier, 'مجاني').toUpperCase();
                const planDuration = getSafeText(sub.plan_duration);
                const paymentGateway = getSafeText(sub.payment_gateway, 'تحويل يدوي');
                const currency = getSafeText(sub.currency, 'EGP');

                return (
                  <div key={sub.id} className={styles.requestCard} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: '#FFF', margin: '0 0 4px 0' }}>{academyName}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> {payerName} {payerPhone && `(${payerPhone})`}
                        </p>
                      </div>
                      <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', border: '1px solid #FBBF24', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {planTier} - {planDuration}
                      </span>
                    </div>

                    <div style={{ background: '#0F172A', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>المبلغ المفروض:</span>
                        <strong style={{ color: '#34D399' }}>{sub.price} {currency}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>طريقة الدفع:</span>
                        <span>{paymentGateway}</span>
                      </div>
                      {sub.metadata?.coupon_code && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>كوبون الخصم:</span>
                          <span style={{ color: '#FBBF24' }}>{getSafeText(sub.metadata.coupon_code)}</span>
                        </div>
                      )}
                    </div>

                    {receiptUrl ? (
                      <button 
                        onClick={() => setReceiptModalUrl(receiptUrl)}
                        style={{ width: '100%', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3B82F6', color: '#60A5FA', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}
                      >
                        <Eye size={16} /> {isRtl ? 'معاينة إشعار التحويل 📄' : 'View Receipt'}
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

      {/* ✅ قسم الأكاديميات النشطة والمنتهية */}
      {(activeTab === 'all' || activeTab === 'active' || activeTab === 'expired') && (() => {
        const filteredAcademies = activeAcademies.filter(academy => {
          if (activeTab === 'expired') {
            return academy.trial_ends_at && new Date(academy.trial_ends_at) <= new Date();
          }
          return true;
        });

        const sectionTitle = activeTab === 'expired' 
          ? (isRtl ? 'الأكاديميات منتهية التجربة ⚠️' : 'Expired Trial Academies ⚠️')
          : (isRtl ? 'الأكاديميات النشطة ✅' : 'Active Academies ✅');

        return (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '14px' }}>
              {sectionTitle}
            </h2>

            {filteredAcademies.length === 0 ? (
              <EmptyState 
                icon={<Building2 size={36} />} 
                title={
                  activeTab === 'expired' 
                    ? (isRtl ? "لا توجد أكاديميات منتهية" : "No Expired Academies")
                    : (isRtl ? "لا توجد أكاديميات نشطة" : "No Active Academies")
                } 
                description={isRtl ? "لا توجد نتائج مطابقة." : "No matching results."} 
              />
            ) : (
              <div className={styles.requestsGrid}>
                {filteredAcademies.map(academy => {
                  const isExpired = academy.trial_ends_at && new Date(academy.trial_ends_at) <= new Date();

                  return (
                    <div 
                      key={academy.id} 
                      className={styles.requestCard} 
                      style={{ 
                        borderRight: isExpired ? '4px solid #EF4444' : '4px solid #10B981' 
                      }}
                    >
                      <div className={styles.requestInfo}>
                        <h3 className={styles.requestName}>
                          {getSafeText(academy.name, 'أكاديمية بدون اسم')}
                        </h3>
                        {academy.ownerProfile && (
                          <div style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} /> {getSafeText(academy.ownerProfile.full_name)}
                            </span>
                          </div>
                        )}
                        <span style={{ fontSize: '0.72rem', color: isExpired ? '#F87171' : '#94A3B8' }}>
                          ⏱️ {getTrialStatusBadge(academy.trial_ends_at).text}
                        </span>
                      </div>

                      <div className={styles.cardActions}>
                        <button 
                          onClick={() => setExtendModalAcademy(academy)} 
                          disabled={processingId !== null} 
                          style={{ 
                            background: '#1E293B', 
                            border: '1px solid #FBBF24', 
                            color: '#FFF', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '0.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                          }}
                        >
                          <Plus size={14} /> {isRtl ? 'تمديد' : 'Extend'}
                        </button>
                        <button 
                          onClick={() => onDeactivateClick(academy.id, academy.owner_id)} 
                          disabled={processingId !== null} 
                          style={{ 
                            background: '#EF4444', 
                            border: 'none', 
                            color: '#FFF', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '0.75rem' 
                          }} 
                          title={isRtl ? "حظر الأكاديمية" : "Block Academy"}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {/* 🚫 قسم الأكاديميات المحظورة */}
      {(activeTab === 'all' || activeTab === 'blocked') && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#F87171', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ban size={20} />
            <span>{isRtl ? 'الأكاديميات المحظورة / المعطلة' : 'Blocked Academies'}</span>
          </h2>
          {blockedAcademies.length === 0 ? (
            <EmptyState icon={<ShieldCheck size={36} color="#10B981" />} title={isRtl ? "لا توجد أكاديميات محظورة" : "No Blocked Academies"} description={isRtl ? "جميع الأكاديميات تعمل بشكل ممتاز." : "All academies active."} />
          ) : (
            <div className={styles.requestsGrid}>
              {blockedAcademies.map(academy => (
                <div key={academy.id} className={styles.requestCard} style={{ borderRight: '4px solid #EF4444', background: '#1E1B2E', opacity: 0.9 }}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestName} style={{ color: '#FCA5A5' }}>{getSafeText(academy.name, 'أكاديمية بدون اسم')}</h3>
                    {academy.ownerProfile && (
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {getSafeText(academy.ownerProfile.full_name)}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 'bold' }}>🚫 {isRtl ? 'محظورة / معطلة' : 'Blocked'}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => onActivateClick(academy.id, academy.owner_id)} 
                      disabled={processingId !== null} 
                      style={{ background: '#10B981', border: 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Unlock size={14} /> {isRtl ? 'إلغاء الحظر وتفعيل' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 🖼️ نافذة معاينة إشعار التحويل */}
      {receiptModalUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '16px', padding: '20px', maxWidth: '500px', width: '100%', color: '#FFF', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setReceiptModalUrl(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={20} />
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

      {/* ⏱️ نافذة التمديد */}
      {extendModalAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#0F172A', border: '1px solid #FBBF24', borderRadius: '16px', padding: '20px', maxWidth: '400px', width: '100%', color: '#FFF', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.05rem' }}>⏱️ {isRtl ? 'تمديد اشتراك الأكاديمية' : 'Extend Subscription'}</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>{getSafeText(extendModalAcademy.name)}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 7)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#FFF', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+7 {isRtl ? 'أيام' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 30)} style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FBBF24', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+30 {isRtl ? 'يوم' : 'Days'}</button>
            </div>

            <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 0, true)} style={{ width: '100%', background: '#3B82F6', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <InfinityIcon size={18} /> {isRtl ? 'اشتراك دائم (Lifetime)' : 'Grant Lifetime'}
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
