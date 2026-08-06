import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '@/components/Dashboard/Dashboard.module.css';
import { supabase } from '@/lib/supabase';
import EmptyState from '@/UI/EmptyState'; 

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
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Users,
  BookOpen,
  History,
  CheckSquare,
  Square
} from 'lucide-react';

const PAGE_SIZE = 10;

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
  const [academies, setAcademies] = useState([]); 
  const [totalAcademiesCount, setTotalAcademiesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState(null); 
  const [toast, setToast] = useState(null);

  // 📱 حالة نافذة إدخال رقم الهاتف
  const [phoneModalData, setPhoneModalData] = useState(null); // { ownerId, academyName, currentPhone }
  const [inputPhone, setInputPhone] = useState('');

  // 🔍 حالات البحث والفلترة والفرز والصفحات
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('created_at_desc'); 
  const [currentPage, setCurrentPage] = useState(1);

  // 📥 حالة Drawer التفاصيل العميقة
  const [selectedAcademyDetails, setSelectedAcademyDetails] = useState(null);
  const [academyStatsLoading, setAcademyStatsLoading] = useState(false);
  const [deepStats, setDeepStats] = useState({ studentsCount: 0, halaqatCount: 0, payments: [] });

  // 🔲 حالة التحديد الجماعي
  const [selectedAcademyIds, setSelectedAcademyIds] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 📲 دالة فتح الواتساب مباشرة مع رسالة مجهزة
  const handleWhatsAppClick = (phone, academyName) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`السلام عليكم، تواصل معك من إدارة منصة حلقات بشأن أكاديمية (${academyName})`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // 💾 دالة حفظ رقم الهاتف من الـ Modal مع رصد الأخطاء بدقة
  const handleSavePhone = async () => {
    if (!inputPhone.trim() || !phoneModalData) return;
    
    let cleanPhone = inputPhone.replace(/\D/g, '');
    
    setProcessingId('save-phone');
    try {
      console.log("Updating phone for user:", phoneModalData.ownerId, "with phone:", cleanPhone);

      // محاولة التحديث في جدول profiles
      const { data, error } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone })
        .eq('id', phoneModalData.ownerId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }

      console.log("Update success response:", data);
      showToast(isRtl ? "تم حفظ رقم الهاتف بنجاح! 🎉" : "Phone saved successfully!");
      
      if (selectedAcademyDetails && selectedAcademyDetails.owner_id === phoneModalData.ownerId) {
        setSelectedAcademyDetails(prev => ({
          ...prev,
          ownerProfile: { ...prev.ownerProfile, phone: cleanPhone }
        }));
      }

      setPhoneModalData(null);
      setInputPhone('');
      fetchDashboardData(true);
    } catch (err) {
      console.error("Catch error saving phone:", err);
      showToast(isRtl ? `فشل الحفظ: ${err.message}` : `Failed to save: ${err.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 📥 جلب البيانات المرقّمة من Supabase
  const fetchDashboardData = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const [
        { count: totalCount },
        { count: pCount },
        { count: aCount },
        { count: bCount },
        { data: allSubsForRevenue }
      ] = await Promise.all([
        supabase.from('academies').select('*', { count: 'exact', head: true }),
        supabase.from('saas_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        supabase.from('academies').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('academies').select('*', { count: 'exact', head: true }).eq('is_active', false),
        supabase.from('saas_subscriptions').select('price, status')
      ]);

      setTotalAcademiesCount(totalCount || 0);
      setPendingCount(pCount || 0);
      setActiveCount(aCount || 0);
      setBlockedCount(bCount || 0);

      const revenue = (allSubsForRevenue || [])
        .filter(sub => sub.status === 'active' || sub.status === 'approved' || sub.status === 'completed')
        .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);
      setTotalRevenue(revenue);

      const { data: subData, error: subErr } = await supabase
        .from('saas_subscriptions')
        .select(`*, academies (*), profiles (*)`)
        .eq('status', 'pending_verification')
        .order('created_at', { ascending: false });

      if (subErr) throw subErr;
      setPendingSubscriptions(subData || []);

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let acadQuery = supabase
        .from('academies')
        .select('*, saas_subscriptions(*)', { count: 'exact' });

      if (activeTab === 'active') {
        acadQuery = acadQuery.eq('is_active', true);
      } else if (activeTab === 'blocked') {
        acadQuery = acadQuery.eq('is_active', false);
      }

      if (sortBy === 'created_at_desc') {
        acadQuery = acadQuery.order('created_at', { ascending: false });
      } else if (sortBy === 'created_at_asc') {
        acadQuery = acadQuery.order('created_at', { ascending: true });
      } else if (sortBy === 'trial_ends_asc') {
        acadQuery = acadQuery.order('trial_ends_at', { ascending: true, nullsFirst: false });
      }

      const { data: acadData, error: acadErr } = await acadQuery.range(from, to);
      if (acadErr) throw acadErr;

      const ownerIds = [...new Set((acadData || []).map(a => a.owner_id).filter(Boolean))];
      let profilesMap = {};

      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', ownerIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      const enrichedAcademies = (acadData || []).map(acad => ({
        ...acad,
        ownerProfile: profilesMap[acad.owner_id] || null
      }));

      setAcademies(enrichedAcademies);

    } catch (err) {
      console.error("❌ Admin Dashboard Fetch Error:", err.message);
      showToast(isRtl ? "حدث خطأ أثناء تحميل البيانات." : "Error loading data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isRtl, currentPage, activeTab, sortBy]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedAcademyIds([]); 
  }, [activeTab, searchQuery, planFilter, sortBy]);

  // 🔍 فلترة الصفحة الحالية
  const filteredAcademies = useMemo(() => {
    return academies.filter(item => {
      const acadName = getSafeText(item.name).toLowerCase();
      const ownerName = getSafeText(item.ownerProfile?.full_name).toLowerCase();
      const ownerEmail = getSafeText(item.ownerProfile?.email).toLowerCase();
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch = !q || acadName.includes(q) || ownerName.includes(q) || ownerEmail.includes(q);

      const sub = Array.isArray(item.saas_subscriptions) 
        ? (item.saas_subscriptions.find(s => s.status === 'active') || item.saas_subscriptions[0])
        : item.saas_subscriptions;

      const durationRaw = (
        item.plan_duration || 
        sub?.plan_duration || 
        item.plan_tier || 
        sub?.plan_tier || 
        sub?.billing_period || 
        ''
      ).toLowerCase();

      const isLongDuration = item.trial_ends_at && (new Date(item.trial_ends_at).getFullYear() > 2090);
      const isLifetime = durationRaw.includes('lifetime') || durationRaw.includes('permanent') || isLongDuration || !item.trial_ends_at;

      const isTrial = !isLifetime && (durationRaw.includes('trial') || Boolean(item.trial_ends_at));
      const isMonthly = !isLifetime && (durationRaw.includes('month') || durationRaw.includes('شهري'));
      const isYearly = !isLifetime && (durationRaw.includes('year') || durationRaw.includes('annual') || durationRaw.includes('سنوي'));

      let matchesPlan = true;
      if (planFilter === 'lifetime') matchesPlan = isLifetime;
      else if (planFilter === 'trial') matchesPlan = isTrial;
      else if (planFilter === 'monthly') matchesPlan = isMonthly;
      else if (planFilter === 'yearly') matchesPlan = isYearly;
      else if (planFilter === 'expiring_soon') {
        if (!item.trial_ends_at || isLifetime) {
          matchesPlan = false;
        } else {
          const endDate = new Date(item.trial_ends_at);
          const now = new Date();
          const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          matchesPlan = diffDays > 0 && diffDays <= 7;
        }
      }

      if (activeTab === 'expired') {
        const isExpired = item.trial_ends_at && new Date(item.trial_ends_at) <= new Date();
        return matchesSearch && matchesPlan && isExpired;
      }

      return matchesSearch && matchesPlan;
    });
  }, [academies, searchQuery, planFilter, activeTab]);

  // 📥 فتح Drawer وجلب الإحصائيات العميقة
  const openAcademyDrawer = async (academy) => {
    setSelectedAcademyDetails(academy);
    setAcademyStatsLoading(true);

    try {
      const [
        { count: stCount },
        { count: hCount },
        { data: paymentsData }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academy.id),
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academy.id),
        supabase.from('saas_subscriptions').select('*').eq('academy_id', academy.id).order('created_at', { ascending: false })
      ]);

      setDeepStats({
        studentsCount: stCount || 0,
        halaqatCount: hCount || 0,
        payments: paymentsData || []
      });
    } catch (err) {
      console.error("Failed to load deep stats:", err);
    } finally {
      setAcademyStatsLoading(false);
    }
  };

  // 🔲 إدارات التحديد الجماعي
  const toggleSelectAll = () => {
    if (selectedAcademyIds.length === filteredAcademies.length) {
      setSelectedAcademyIds([]);
    } else {
      setSelectedAcademyIds(filteredAcademies.map(a => a.id));
    }
  };

  const toggleSelectAcademy = (id) => {
    setSelectedAcademyIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 🔲 الإجراءات الجماعية
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAcademyIds.length === 0) return;
    const actionText = newStatus ? (isRtl ? 'تفعيل' : 'Activate') : (isRtl ? 'حظر' : 'Block');
    
    if (!window.confirm(isRtl ? `هل تأكد من ${actionText} عدد (${selectedAcademyIds.length}) أكاديمية؟` : `Confirm ${actionText} ${selectedAcademyIds.length} academies?`)) return;

    setProcessingId('bulk');
    try {
      const { error } = await supabase
        .from('academies')
        .update({ is_active: newStatus })
        .in('id', selectedAcademyIds);

      if (error) throw error;

      showToast(isRtl ? `تم ${actionText} الأكاديميات بنجاح!` : `Bulk action completed!`);
      setSelectedAcademyIds([]);
      fetchDashboardData(true);
    } catch (err) {
      showToast(isRtl ? "حدث خطأ أثناء تنفيذ الإجراء الجماعي." : "Bulk action failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkExtend = async (days) => {
    if (selectedAcademyIds.length === 0) return;
    if (!window.confirm(isRtl ? `هل تأكد من تمديد +${days} يوم لعدد (${selectedAcademyIds.length}) أكاديمية؟` : `Extend +${days} days for ${selectedAcademyIds.length} academies?`)) return;

    setProcessingId('bulk');
    try {
      const now = new Date();
      now.setDate(now.getDate() + days);
      const newEndIso = now.toISOString();

      const { error } = await supabase
        .from('academies')
        .update({ trial_ends_at: newEndIso })
        .in('id', selectedAcademyIds);

      if (error) throw error;

      showToast(isRtl ? `تم التمديد الجماعي بنجاح (+${days} يوم)!` : `Bulk extension applied!`);
      setSelectedAcademyIds([]);
      fetchDashboardData(true);
    } catch (err) {
      showToast(isRtl ? "فشل التمديد الجماعي." : "Failed to extend.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⛔ الحظر الفردي
  const onDeactivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = academies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');
    
    if (!window.confirm(isRtl ? `هل ترغب بتعليق/حظر (${targetName})؟` : 'Deactivate this academy?')) return;

    setProcessingId(`deactivate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: false }).eq('id', id);
      if (acadErr) throw acadErr;

      showToast(isRtl ? `تم حظر "${targetName}"` : "Deactivated", "info");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل عملية الحظر." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 🔓 إلغاء الحظر الفردي
  const onActivateClick = async (id, ownerId) => {
    if (processingId) return;
    const targetAcademy = academies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');

    if (!window.confirm(isRtl ? `إلغاء حظر وتفعيل (${targetName})؟` : 'Activate this academy?')) return;

    setProcessingId(`activate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: true }).eq('id', id);
      if (acadErr) throw acadErr;

      showToast(isRtl ? `تم إلغاء حظر "${targetName}" بنجاح! 🎉` : "Activated", "success");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل تفعيل الأكاديمية." : "Failed to activate.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ⏱️ التمديد الفردي
  const onExtendTrialClick = async (id, daysToAdd, isLifetime = false) => {
    if (processingId) return;
    setProcessingId(`extend-${id}`);

    let newDateIso = null;
    if (!isLifetime) {
      const target = academies.find(a => a.id === id);
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

      showToast(isLifetime ? (isRtl ? "تم منح اشتراك دائم ♾️" : "Lifetime granted ♾️") : (isRtl ? `تم التمديد +${daysToAdd} يوم` : `+${daysToAdd} Days extended`));
      setExtendModalAcademy(null);
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "تعذر التمديد." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // 📊 CSV Export
  const exportToCSV = () => {
    if (academies.length === 0) return;

    const headers = ["ID", "Academy Name", "Owner", "Email", "Phone", "Status", "Trial Ends At"];
    const rows = academies.map(a => [
      a.id, 
      `"${getSafeText(a.name)}"`, 
      `"${getSafeText(a.ownerProfile?.full_name)}"`, 
      `"${getSafeText(a.ownerProfile?.email)}"`,
      `"${getSafeText(a.ownerProfile?.phone)}"`,
      a.is_active ? "Active" : "Blocked", 
      a.trial_ends_at ? new Date(a.trial_ends_at).toLocaleDateString() : "Lifetime"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `academies_page_${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

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

  const totalPages = Math.ceil(totalAcademiesCount / PAGE_SIZE) || 1;

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
            <h2 className={styles.statNumber} style={{ color: pendingCount > 0 ? '#FBBF24' : 'inherit' }}>{loading ? '...' : pendingCount}</h2>
          </div>
          <div className={styles.statIcon}><Clock size={24} /></div>
        </div>

        <div className={styles.premiumStatBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'أكاديميات محظورة / معطلة' : 'Blocked Academies'}</p>
            <h2 className={styles.statNumber} style={{ color: '#EF4444' }}>{loading ? '...' : blockedCount}</h2>
          </div>
          <div className={styles.statIcon}><AlertTriangle size={24} color="#EF4444" /></div>
        </div>

        <div className={styles.premiumStatBox} style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <div>
            <p className={styles.statLabel}>{isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <h2 className={styles.statNumber} style={{ color: '#34D399' }}>{loading ? '...' : `${totalRevenue} EGP`}</h2>
          </div>
          <div className={styles.statIcon}><FileSpreadsheet size={24} color="#34D399" /></div>
        </div>
      </div>

      {/* 🔍 شريط البحث والفلترة والفرز */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px', background: '#1E293B', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '12px' }} />
          <input
            type="text"
            placeholder={isRtl ? "ابحث باسم الأكاديمية، المالك..." : "Search academy, owner..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 40px 10px 12px', color: '#FFF', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
          {searchQuery && <X size={16} color="#94A3B8" onClick={() => setSearchQuery('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', cursor: 'pointer' }} />}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 8px', color: '#FFF', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', textAlign: 'center' }}>
            <option value="all">🔍 {isRtl ? 'جميع الخطط' : 'All Plans'}</option>
            <option value="expiring_soon">⏳ {isRtl ? 'تنتهي خلال 7 أيام' : 'Expiring in 7 Days'}</option>
            <option value="trial">⏱️ {isRtl ? 'مؤقتة / تجريبية' : 'Trial'}</option>
            <option value="monthly">📅 {isRtl ? 'اشتراك شهري' : 'Monthly'}</option>
            <option value="yearly">🗓️ {isRtl ? 'اشتراك سنوي' : 'Yearly'}</option>
            <option value="lifetime">♾️ {isRtl ? 'حسابات دائمة' : 'Lifetime'}</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 8px', color: '#FFF', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', textAlign: 'center' }}>
            <option value="created_at_desc">⬇️ {isRtl ? 'الأحدث تسجيلاً' : 'Newest First'}</option>
            <option value="created_at_asc">⬆️ {isRtl ? 'الأقدم تسجيلاً' : 'Oldest First'}</option>
            <option value="trial_ends_asc">⚠️ {isRtl ? 'الأقرب انتهاءً' : 'Expiring Soon'}</option>
          </select>
        </div>
      </div>

      {/* ⚡ شريط الإجراءات الجماعية (Bulk Actions Bar) */}
      {selectedAcademyIds.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #1E293B 0%, #0F172A 100%)',
          border: '1px solid #3B82F6',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#3B82F6', color: '#FFF', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {selectedAcademyIds.length} {isRtl ? 'محدد' : 'Selected'}
            </span>
            <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>{isRtl ? 'اختر إجراءً لتطبيقه دفعة واحدة:' : 'Choose a bulk action:'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => handleBulkExtend(30)} disabled={processingId === 'bulk'} style={{ background: 'rgba(251, 191, 36, 0.15)', border: '1px solid #FBBF24', color: '#FBBF24', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
              +30 {isRtl ? 'يوم' : 'Days'}
            </button>
            <button onClick={() => handleBulkStatusChange(true)} disabled={processingId === 'bulk'} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {isRtl ? 'تفعيل الجماعي' : 'Bulk Activate'}
            </button>
            <button onClick={() => handleBulkStatusChange(false)} disabled={processingId === 'bulk'} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {isRtl ? 'حظر الجماعي' : 'Bulk Block'}
            </button>
            <button onClick={() => setSelectedAcademyIds([])} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8rem' }}>
              {isRtl ? 'إلغاء التحديد' : 'Deselect'}
            </button>
          </div>
        </div>
      )}

      {/* 🗂️ شريط التبويبات Tabs */}
      <div className={styles.tabsBar}>
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: totalAcademiesCount },
          { id: 'pending', label: isRtl ? 'طلبات الاشتراكات المعلقة' : 'Pending Subscriptions', count: pendingCount },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: activeCount },
          { id: 'blocked', label: isRtl ? 'المحظورة / المعطلة 🚫' : 'Blocked', count: blockedCount },
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

      {/* 🏢 قائمة الأكاديميات الرئيسية */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.05rem', color: '#FFF', margin: 0 }}>
            {activeTab === 'active' ? (isRtl ? 'الأكاديميات النشطة ✅' : 'Active Academies') :
             activeTab === 'blocked' ? (isRtl ? 'الأكاديميات المحظورة 🚫' : 'Blocked Academies') :
             (isRtl ? 'جميع الأكاديميات 🏢' : 'All Academies')}
          </h2>

          {/* زر تحديد الكل */}
          {filteredAcademies.length > 0 && (
            <button
              onClick={toggleSelectAll}
              style={{ background: 'transparent', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {selectedAcademyIds.length === filteredAcademies.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedAcademyIds.length === filteredAcademies.length ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All') : (isRtl ? 'تحديد كل الصفحة' : 'Select All')}
            </button>
          )}
        </div>

        {filteredAcademies.length === 0 ? (
          <EmptyState icon={<Building2 size={36} />} title={isRtl ? "لا توجد نتائج مطابقة" : "No Matching Academies"} description={isRtl ? "جرب تعديل عبارة البحث أو خيار التصفية." : "Try adjusting your filters or query."} />
        ) : (
          <div className={styles.requestsGrid}>
            {filteredAcademies.map(academy => {
              const isExpired = academy.trial_ends_at && new Date(academy.trial_ends_at) <= new Date();
              const isBlocked = !academy.is_active;
              const isSelected = selectedAcademyIds.includes(academy.id);

              return (
                <div 
                  key={academy.id} 
                  className={styles.requestCard} 
                  style={{ 
                    borderRight: isBlocked ? '4px solid #EF4444' : isExpired ? '4px solid #F59E0B' : '4px solid #10B981',
                    background: isSelected ? '#1E293B' : isBlocked ? '#1E1B2E' : '#1E293B',
                    borderColor: isSelected ? '#3B82F6' : undefined,
                    position: 'relative'
                  }}
                >
                  {/* Checkbox التحديد الجماعي */}
                  <div 
                    onClick={() => toggleSelectAcademy(academy.id)}
                    style={{ position: 'absolute', top: '14px', left: isRtl ? 'unset' : '14px', right: isRtl ? '14px' : 'unset', cursor: 'pointer', zIndex: 5, color: isSelected ? '#3B82F6' : '#64748B' }}
                  >
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>

                  <div className={styles.requestInfo} style={{ paddingRight: isRtl ? '28px' : '0', paddingLeft: !isRtl ? '28px' : '0' }}>
                    <h3 
                      className={styles.requestName} 
                      onClick={() => openAcademyDrawer(academy)}
                      style={{ color: isBlocked ? '#FCA5A5' : '#FFF', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {getSafeText(academy.name, 'أكاديمية بدون اسم')}
                    </h3>
                    {academy.ownerProfile && (
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '4px 0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> {getSafeText(academy.ownerProfile.full_name)}
                        </span>
                      </div>
                    )}
                    <span style={{ fontSize: '0.72rem', color: isBlocked ? '#EF4444' : isExpired ? '#F87171' : '#94A3B8' }}>
                      {isBlocked ? '🚫 محظورة / معطلة' : `⏱️ ${getTrialStatusBadge(academy.trial_ends_at).text}`}
                    </span>
                  </div>

                  {/* 🕹️ أزرار التحكم بالكارت الرئيسي */}
                  <div className={styles.cardActions}>
                    {academy.ownerProfile?.phone ? (
                      <button 
                        onClick={() => handleWhatsAppClick(academy.ownerProfile.phone, getSafeText(academy.name))}
                        title="تواصل عبر واتساب"
                        style={{ 
                          background: '#25D366', border: 'none', color: '#FFF', padding: '6px 10px', 
                          borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', 
                          alignItems: 'center', gap: '4px', fontWeight: 'bold'
                        }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setPhoneModalData({
                            ownerId: academy.owner_id,
                            academyName: getSafeText(academy.name),
                            currentPhone: academy.ownerProfile?.phone || ''
                          });
                          setInputPhone(academy.ownerProfile?.phone || '');
                        }}
                        title="إضافة رقم هاتف"
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', 
                          padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', 
                          display: 'flex', alignItems: 'center', gap: '4px' 
                        }}
                      >
                        <MessageCircle size={14} /> + هاتف
                      </button>
                    )}

                    <button 
                      onClick={() => openAcademyDrawer(academy)} 
                      style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3B82F6', color: '#60A5FA', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> {isRtl ? 'تفاصيل' : 'Details'}
                    </button>

                    <button 
                      onClick={() => setExtendModalAcademy(academy)} 
                      disabled={processingId !== null} 
                      style={{ background: '#0F172A', border: '1px solid #FBBF24', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> {isRtl ? 'تمديد' : 'Extend'}
                    </button>

                    {isBlocked ? (
                      <button onClick={() => onActivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#10B981', border: 'none', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><Unlock size={14} /></button>
                    ) : (
                      <button onClick={() => onDeactivateClick(academy.id, academy.owner_id)} disabled={processingId !== null} style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><Ban size={14} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📄 الترقيم */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '24px', background: '#1E293B', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ background: currentPage === 1 ? '#0F172A' : '#3B82F6', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', opacity: currentPage === 1 ? 0.5 : 1 }}>
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {isRtl ? 'السابقة' : 'Previous'}
            </button>

            <span style={{ color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 'bold' }}>{isRtl ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>

            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} style={{ background: currentPage >= totalPages ? '#0F172A' : '#3B82F6', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', opacity: currentPage >= totalPages ? 0.5 : 1 }}>
              {isRtl ? 'التالية' : 'Next'} {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </section>

      {/* 📥 Drawer التفاصيل العميقة للأكاديمية */}
      {selectedAcademyDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#0F172A', height: '100%', borderLeft: isRtl ? 'none' : '1px solid #334155', borderRight: isRtl ? '1px solid #334155' : 'none', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* هيدر النافذة */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#FFF', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 color="#3B82F6" size={20} />
                {getSafeText(selectedAcademyDetails.name)}
              </h3>
              <button onClick={() => setSelectedAcademyDetails(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* بيانات المالك والتواصل السريع */}
            <div style={{ background: '#1E293B', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid #334155' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#94A3B8' }}>{isRtl ? 'مالك الأكاديمية:' : 'Academy Owner:'}</p>
              <h4 style={{ margin: '0 0 4px 0', color: '#FFF', fontSize: '1rem' }}>{getSafeText(selectedAcademyDetails.ownerProfile?.full_name, 'غير معروف')}</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#CBD5E1' }}>{getSafeText(selectedAcademyDetails.ownerProfile?.email)}</p>

              {/* 📲 زر التواصل عبر WhatsApp داخل Drawer */}
              {selectedAcademyDetails.ownerProfile?.phone ? (
                <button
                  onClick={() => handleWhatsAppClick(selectedAcademyDetails.ownerProfile.phone, getSafeText(selectedAcademyDetails.name))}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <MessageCircle size={18} /> {isRtl ? 'تواصل عبر واتساب مباشر' : 'Direct WhatsApp Chat'}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#EF4444' }}>⚠️ لا يوجد رقم هاتف مسجل للمالك</p>
                  <button
                    onClick={() => {
                      setPhoneModalData({
                        ownerId: selectedAcademyDetails.owner_id,
                        academyName: getSafeText(selectedAcademyDetails.name),
                        currentPhone: selectedAcademyDetails.ownerProfile?.phone || ''
                      });
                      setInputPhone(selectedAcademyDetails.ownerProfile?.phone || '');
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#F87171', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    + إضافة رقم
                  </button>
                </div>
              )}
            </div>

            {/* 📊 بطاقات الإحصائيات الحية */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155' }}>
                <Users size={20} color="#34D399" style={{ marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</p>
                <h3 style={{ margin: '4px 0 0 0', color: '#FFF' }}>{academyStatsLoading ? '...' : deepStats.studentsCount}</h3>
              </div>
              <div style={{ background: '#1E293B', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid #334155' }}>
                <BookOpen size={20} color="#60A5FA" style={{ marginBottom: '4px' }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{isRtl ? 'الحلقات الدراسية' : 'Halaqat Classes'}</p>
                <h3 style={{ margin: '4px 0 0 0', color: '#FFF' }}>{academyStatsLoading ? '...' : deepStats.halaqatCount}</h3>
              </div>
            </div>

            {/* 📜 سجل المدفوعات والاشتراكات */}
            <h4 style={{ color: '#FFF', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} color="#FBBF24" /> {isRtl ? 'سجل المدفوعات والاشتراكات' : 'Payment History'}
            </h4>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {deepStats.payments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center', marginTop: '20px' }}>{isRtl ? 'لا يوجد سجل مدفوعات سابق' : 'No prior payment history'}</p>
              ) : (
                deepStats.payments.map(p => (
                  <div key={p.id} style={{ background: '#1E293B', border: '1px solid #334155', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFF', marginBottom: '4px' }}>
                      <strong>{p.plan_tier} ({p.plan_duration})</strong>
                      <span style={{ color: p.status === 'active' ? '#34D399' : '#FBBF24' }}>{p.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem' }}>
                      <span>{p.price} {p.currency || 'EGP'}</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ⏱️ نافذة التمديد الفردي */}
      {extendModalAcademy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
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

      {/* 📱 Modal إضافة / تعديل رقم الهاتف */}
      {phoneModalData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 4000, padding: '16px'
        }}>
          <div style={{
            background: '#0F172A', border: '1px solid #3B82F6', borderRadius: '16px',
            padding: '24px', maxWidth: '400px', width: '100%', color: '#FFF'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle color="#25D366" size={20} />
                {isRtl ? 'إدخال رقم هاتف المالك' : 'Enter Owner Phone'}
              </h3>
              <button onClick={() => setPhoneModalData(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '16px' }}>
              {isRtl ? `أدخل رقم هاتف مالك أكاديمية (${phoneModalData.academyName}) لتفعيل التواصل عبر الواتساب:` : `Enter phone for (${phoneModalData.academyName}):`}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px' }}>
                {isRtl ? 'رقم الهاتف (مع رمز الدولة مثل 2010...):' : 'Phone number (with country code):'}
              </label>
              <input
                type="tel"
                placeholder="201000000000"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                style={{
                  width: '100%', background: '#1E293B', border: '1px solid #334155',
                  borderRadius: '8px', padding: '10px 12px', color: '#FFF', fontSize: '0.9rem',
                  outline: 'none', direction: 'ltr', textAlign: 'left', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSavePhone}
                disabled={processingId === 'save-phone'}
                style={{
                  flex: 1, background: '#25D366', color: '#FFF', border: 'none',
                  padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {processingId === 'save-phone' ? '...' : (isRtl ? 'حفظ وتفعيل الواتساب' : 'Save & Enable WhatsApp')}
              </button>
              <button
                onClick={() => setPhoneModalData(null)}
                style={{
                  background: 'transparent', border: '1px solid #334155', color: '#94A3B8',
                  padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
