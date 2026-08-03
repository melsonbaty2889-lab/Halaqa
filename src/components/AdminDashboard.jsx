import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Dashboard.module.css';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState'; 

// ✨ استيراد الأيقونات
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
  Unlock,
  Search,       // 🔍 أيقونة البحث
  Filter        // 🌪️ أيقونة الفلترة
} from 'lucide-react';

// 🛡️ دالة أمان لمساعدات النصوص
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

  // 🔍 حالات البحث والفلترة (المرحلة الأولى)
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all'); // all, trial, lifetime, monthly, yearly

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 📥 جلب البيانات من Supabase
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      // 1️⃣ طلبات الاشتراكات المعلقة
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

      // 2️⃣ الأكاديميات النشطة مع اشتراكاتها
      const { data: activeData, error: aErr } = await supabase
        .from('academies')
        .select('*, saas_subscriptions(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (aErr) throw aErr;

      // 3️⃣ الأكاديميات المحظورة مع اشتراكاتها
      const { data: blockedData, error: bErr } = await supabase
        .from('academies')
        .select('*, saas_subscriptions(*)')
        .eq('is_active', false)
        .order('created_at', { ascending: false });
      if (bErr) throw bErr;

      // 4️⃣ إجمالي العدد
      const { count } = await supabase
        .from('academies')
        .select('*', { count: 'exact', head: true });

      // ربط بيانات المالكين
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

    // 🔍 دالة الفلترة الذكية المحدثة للدعم الكامل للشهري والسنوي والتجريبي
  const filterList = useCallback((list) => {
    return list.filter(item => {
      const acadName = getSafeText(item.name || item.academies?.name).toLowerCase();
      const ownerName = getSafeText(item.ownerProfile?.full_name || item.profiles?.full_name).toLowerCase();
      const ownerEmail = getSafeText(item.ownerProfile?.email || item.profiles?.email).toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      // 1️⃣ شرط البحث بالاسم أو البريد
      const matchesSearch = !q || acadName.includes(q) || ownerName.includes(q) || ownerEmail.includes(q);

      // 2️⃣ استخراج كائن الاشتراك النشط أو الأول
      const sub = Array.isArray(item.saas_subscriptions) 
        ? (item.saas_subscriptions.find(s => s.status === 'active') || item.saas_subscriptions[0])
        : item.saas_subscriptions;

      // 3️⃣ تجميع القيمة النصية لنوع الاشتراك من كافة الحقول الممكنة
      const durationRaw = (
        item.plan_duration || 
        sub?.plan_duration || 
        item.plan_tier || 
        sub?.plan_tier || 
        sub?.billing_period || 
        ''
      ).toLowerCase();

      // 4️⃣ الفحوصات الأمنية لأنواع الخطط
      const isLongDuration = item.trial_ends_at && (new Date(item.trial_ends_at).getFullYear() > 2090);
      const isLifetime = durationRaw.includes('lifetime') || durationRaw.includes('permanent') || isLongDuration;
      
      const isMonthly = durationRaw.includes('month') || durationRaw.includes('شهري');
      const isYearly = durationRaw.includes('year') || durationRaw.includes('annual') || durationRaw.includes('سنوي');

      // 5️⃣ تطبيق الفلترة حسب الاختيار
      let matchesPlan = true;

      if (planFilter === 'lifetime') {
        matchesPlan = isLifetime;
      } else if (planFilter === 'trial') {
        // أي حساب ليس دائمًا وليس شهرِيًا ولا سنويًا معتمدًا يُعتبر حسابًا تجريبيًا
        matchesPlan = !isLifetime && !isMonthly && !isYearly;
      } else if (planFilter === 'monthly') {
        matchesPlan = isMonthly;
      } else if (planFilter === 'yearly') {
        matchesPlan = isYearly;
      }

      return matchesSearch && matchesPlan;
    });
  }, [searchQuery, planFilter]);

  const filteredActiveAcademies = useMemo(() => filterList(activeAcademies), [activeAcademies, filterList]);
  const filteredBlockedAcademies = useMemo(() => filterList(blockedAcademies), [blockedAcademies, filterList]);
  const filteredPendingSubscriptions = useMemo(() => filterList(pendingSubscriptions), [pendingSubscriptions, filterList]);

  // ✅ القبول والاعتماد
  const onApproveSubscription = async (subscription) => {
    if (processingId) return;
    setProcessingId(`approve-${subscription.id}`);

    try {
      const duration = getSafeText(subscription.plan_duration, 'monthly');
      const academyId = subscription.academy_id || subscription.academies?.id;
      const payerId = subscription.payer_id || subscription.profiles?.id;

      const { error } = await supabase.rpc('approve_academy_subscription', {
        p_subscription_id: subscription.id,
        p_academy_id: academyId,
        p_payer_id: payerId,
        p_duration: duration
      });

      if (error) throw error;

      showToast(isRtl ? `تم تفعيل الاشتراك والأكاديمية بنجاح! 🎉` : "Subscription Approved 🎉");
      fetchDashboardData(true);
    } catch (error) {
      console.error("Approve Error:", error.message || error);
      showToast(isRtl ? "فشل اعتماد الطلب." : "Failed to approve.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 🚫 الرفض
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

  // ⛔ الحظر
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

  // 🔓 إلغاء الحظر
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

  // ⏱️ التمديد
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
    } else {
      const lifetimeDate = new Date();
      lifetimeDate.setDate(lifetimeDate.getDate() + 36500);
      newDateIso = lifetimeDate.toISOString();
    }

    try {
      const { error: acadErr } = await supabase
        .from('academies')
        .update({ trial_ends_at: isLifetime ? null : newDateIso })
        .eq('id', id);
      if (acadErr) throw acadErr;

      await supabase
        .from('saas_subscriptions')
        .update({ 
          expires_at: newDateIso,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('academy_id', id);

      showToast(isLifetime ? (isRtl ? "تم منح اشتراك دائم ♾️" : "Lifetime granted ♾️") : (isRtl ? `تم التمديد +${daysToAdd} يوم` : `+${daysToAdd} Days extended`));
      setExtendModalAcademy(null);
      fetchDashboardData(true);
    } catch (error) {
      console.error("Extension Error:", error);
      showToast(isRtl ? "تعذر التمديد." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 📊 CSV Export
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

  // 1️⃣ الملاحظة الأولى: فحص الحسابات الدائمة للسنوات البعيدة
  const getTrialStatusBadge = (trialEndsAt) => {
    if (!trialEndsAt) return { text: isRtl ? 'حساب دائم ♾️' : 'Lifetime ♾️', color: '#38BDF8' };
    
    const endDate = new Date(trialEndsAt);
    if (endDate.getFullYear() > 2090) {
      return { text: isRtl ? 'حساب دائم ♾️' : 'Lifetime ♾️', color: '#38BDF8' };
    }

    const diffDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: isRtl ? 'منتهية ⚠️' : 'Expired ⚠️', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} يوم` : `${diffDays}d left`, color: '#10B981' };
  };

  const expiredAcademies = activeAcademies.filter(a => a.trial_ends_at && new Date(a.trial_ends_at) <= new Date());

  return (
    <div className={styles.dashboardContainer} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* 🔔 Toast */}
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

      {/* 3️⃣ الملاحظة الثالثة: محاذاة وتناسق شريط البحث مع اختيار الخطة للهواتف */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px',
        background: '#1E293B',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #334155',
        alignItems: 'center'
      }}>
        {/* مربع البحث */}
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: isRtl ? '12px' : 'auto', left: !isRtl ? '12px' : 'auto' }} />
          <input
            type="text"
            placeholder={isRtl ? "ابحث باسم الأكاديمية، المالك..." : "Search academy, owner..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 38px 10px 12px',
              color: '#FFF',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <X 
              size={16} 
              color="#94A3B8" 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: isRtl ? '12px' : 'auto', right: !isRtl ? '12px' : 'auto', cursor: 'pointer' }} 
            />
          )}
        </div>

        {/* قائمة اختيار الخطة */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 140px' }}>
          <Filter size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '9px 8px',
              color: '#FFF',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">{isRtl ? 'جميع الخطط' : 'All Plans'}</option>
            <option value="trial">{isRtl ? 'مؤقتة / تجريبية' : 'Trial'}</option>
            <option value="lifetime">{isRtl ? 'حسابات دائمة ♾️' : 'Lifetime'}</option>
          </select>
        </div>
      </div>

      {/* 🗂️ شريط التبويبات Tabs */}
      <div className={styles.tabsBar}>
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: filteredPendingSubscriptions.length + filteredActiveAcademies.length + filteredBlockedAcademies.length },
          { id: 'pending', label: isRtl ? 'طلبات الاشتراكات المعلقة' : 'Pending Subscriptions', count: filteredPendingSubscriptions.length },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: filteredActiveAcademies.length },
          { id: 'blocked', label: isRtl ? 'المحظورة / المعطلة 🚫' : 'Blocked', count: filteredBlockedAcademies.length },
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

      {/* 2️⃣ الملاحظة الثانية: إخفاء كرت الطلبات الفارغ عند البحث أو عدم وجود طلبات معلقة */}
      {(activeTab === 'pending' || (activeTab === 'all' && filteredPendingSubscriptions.length > 0)) && (
        <section className={styles.sectionPending} style={{ marginBottom: '32px' }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#FBBF24" />
            <span>{isRtl ? 'طلبات الاشتراك بانتظار المراجعة' : 'Pending Subscriptions'}</span>
          </h2>

          {filteredPendingSubscriptions.length === 0 ? (
            <EmptyState 
              icon={<CheckCircle2 size={36} color="#10B981" />} 
              title={isRtl ? "لا توجد طلبات مطابقة" : "No Matching Requests"} 
              description={isRtl ? "لم يتم العثور على نتائج للبحث الحالي." : "No results found for current query."} 
            />
          ) : (
            <div className={styles.requestsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredPendingSubscriptions.map(sub => {
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

      {/* ✅ قسم الأكاديميات النشطة */}
      {(activeTab === 'all' || activeTab === 'active' || activeTab === 'expired') && (() => {
        const academiesToRender = filteredActiveAcademies.filter(academy => {
          if (activeTab === 'expired') {
            return academy.trial_ends_at && new Date(academy.trial_ends_at) <= new Date();
          }
          return true;
        });

        return (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#FFF', marginBottom: '14px' }}>
              {activeTab === 'expired' ? (isRtl ? 'الأكاديميات منتهية التجربة ⚠️' : 'Expired Trial Academies ⚠️') : (isRtl ? 'الأكاديميات النشطة ✅' : 'Active Academies ✅')}
            </h2>

            {academiesToRender.length === 0 ? (
              <EmptyState 
                icon={<Building2 size={36} />} 
                title={isRtl ? "لا توجد نتائج مطابقة" : "No Matching Academies"} 
                description={isRtl ? "جرب تعديل عبارة البحث." : "Try adjusting your search query."} 
              />
            ) : (
              <div className={styles.requestsGrid}>
                {academiesToRender.map(academy => {
                  const isExpired = academy.trial_ends_at && new Date(academy.trial_ends_at) <= new Date();

                  return (
                    <div 
                      key={academy.id} 
                      className={styles.requestCard} 
                      style={{ borderRight: isExpired ? '4px solid #EF4444' : '4px solid #10B981' }}
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
                          style={{ background: '#1E293B', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={14} /> {isRtl ? 'تمديد' : 'Extend'}
                        </button>
                        <button 
                          onClick={() => onDeactivateClick(academy.id, academy.owner_id)} 
                          disabled={processingId !== null} 
                          style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }} 
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
{(activeTab === 'blocked' || (activeTab === 'all' && filteredBlockedAcademies.length > 0)) && (
  <section style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '1.05rem', color: '#F87171', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Ban size={20} />
      <span>{isRtl ? 'الأكاديميات المحظورة / المعطلة' : 'Blocked Academies'}</span>
    </h2>
    {filteredBlockedAcademies.length === 0 ? (
      <EmptyState icon={<ShieldCheck size={36} color="#10B981" />} title={isRtl ? "لا توجد نتائج" : "No Results"} description={isRtl ? "لا توجد أكاديميات محظورة مطابقة للبحث." : "No matching blocked academies."} />
    ) : (
      <div className={styles.requestsGrid}>
        {filteredBlockedAcademies.map(academy => (
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

      {/* 🖼️ معاينة التحويل */}
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
