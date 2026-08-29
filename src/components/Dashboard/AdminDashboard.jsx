import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import EmptyState from '@/components/UI/EmptyState'; 

import { 
  Building2, 
  Clock, 
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
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Users,
  BookOpen,
  History,
  CheckSquare,
  Square,
  ExternalLink // 👈 1. تم إضافة الأيقونة هنا
} from 'lucide-react';

const PAGE_SIZE = 10;

// 🛡️ دالة آمنة لتحويل الكائنات والنصوص والترجمات إلى نصوص مقبولة لدى React لمنع الخطأ #31
const getSafeText = (val, defaultVal = '') => {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.ar) return String(val.ar);
    if (val.en) return String(val.en);
    if (val.name) return getSafeText(val.name, defaultVal);
    if (val.title) return getSafeText(val.title, defaultVal);
    const firstVal = Object.values(val)[0];
    if (firstVal && typeof firstVal !== 'object') return String(firstVal);
    return defaultVal;
  }
  return String(val);
};

// 👈 2. تم استقبال onSelectAcademy هنا
export default function AdminDashboard({ isRtl = true, onLogout, onSelectAcademy }) {
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
  const [toast, setToast] = useState(null);

  const [phoneModalData, setPhoneModalData] = useState(null);
  const [inputPhone, setInputPhone] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('created_at_desc'); 
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAcademyDetails, setSelectedAcademyDetails] = useState(null);
  const [academyStatsLoading, setAcademyStatsLoading] = useState(false);
  const [deepStats, setDeepStats] = useState({ studentsCount: 0, halaqatCount: 0, payments: [] });

  const [selectedAcademyIds, setSelectedAcademyIds] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleWhatsAppClick = (phone, academyName) => {
    if (!phone) return;
    const cleanPhone = String(phone).replace(/\D/g, '');
    const message = encodeURIComponent(`السلام عليكم، نأتيك من إدارة المنصة بشأن أكاديمية (${academyName})`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSavePhone = async () => {
    if (!inputPhone.trim() || !phoneModalData) return;
    
    let cleanPhone = inputPhone.replace(/\D/g, '');
    
    setProcessingId('save-phone');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: cleanPhone })
        .eq('id', phoneModalData.ownerId);

      if (error) throw new Error(error.message);

      showToast(isRtl ? "تم حفظ رقم الهاتف بنجاح" : "Phone saved successfully!");
      
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
      showToast(isRtl ? `فشل الحفظ: ${err.message}` : `Failed to save: ${err.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  };

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
      console.error("Admin Dashboard Fetch Error:", err.message);
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
        getSafeText(item.plan_duration) || 
        getSafeText(sub?.plan_duration) || 
        getSafeText(item.plan_tier) || 
        getSafeText(sub?.plan_tier) || 
        getSafeText(sub?.billing_period) || 
        ''
      ).toLowerCase();

      const trialEndsStr = getSafeText(item.trial_ends_at);
      const trialEndsDate = trialEndsStr ? new Date(trialEndsStr) : null;
      const isLongDuration = trialEndsDate && trialEndsDate.getFullYear() > 2090;
      const isLifetime = durationRaw.includes('lifetime') || durationRaw.includes('permanent') || isLongDuration || !trialEndsDate;

      const isTrial = !isLifetime && (durationRaw.includes('trial') || Boolean(trialEndsDate));
      const isMonthly = !isLifetime && (durationRaw.includes('month') || durationRaw.includes('شهري'));
      const isYearly = !isLifetime && (durationRaw.includes('year') || durationRaw.includes('annual') || durationRaw.includes('سنوي'));

      let matchesPlan = true;
      if (planFilter === 'lifetime') matchesPlan = isLifetime;
      else if (planFilter === 'trial') matchesPlan = isTrial;
      else if (planFilter === 'monthly') matchesPlan = isMonthly;
      else if (planFilter === 'yearly') matchesPlan = isYearly;
      else if (planFilter === 'expiring_soon') {
        if (!trialEndsDate || isLifetime) {
          matchesPlan = false;
        } else {
          const now = new Date();
          const diffDays = Math.ceil((trialEndsDate - now) / (1000 * 60 * 60 * 24));
          matchesPlan = diffDays > 0 && diffDays <= 7;
        }
      }

      if (activeTab === 'expired') {
        const isExpired = trialEndsDate && trialEndsDate <= new Date();
        return matchesSearch && matchesPlan && isExpired;
      }

      return matchesSearch && matchesPlan;
    });
  }, [academies, searchQuery, planFilter, activeTab]);

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

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAcademyIds.length === 0) return;
    const actionText = newStatus ? (isRtl ? 'تفعيل' : 'Activate') : (isRtl ? 'حظر' : 'Block');
    
    if (!window.confirm(isRtl ? `تأكيد ${actionText} عدد (${selectedAcademyIds.length}) أكاديمية؟` : `Confirm ${actionText} ${selectedAcademyIds.length} academies?`)) return;

    setProcessingId('bulk');
    try {
      const { error } = await supabase
        .from('academies')
        .update({ is_active: newStatus })
        .in('id', selectedAcademyIds);

      if (error) throw error;

      showToast(isRtl ? `تم ${actionText} الأكاديميات بنجاح` : `Bulk action completed!`);
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
    if (!window.confirm(isRtl ? `تأكيد تمديد +${days} يوم لعدد (${selectedAcademyIds.length}) أكاديمية؟` : `Extend +${days} days for ${selectedAcademyIds.length} academies?`)) return;

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

      showToast(isRtl ? `تم التمديد الجماعي بنجاح (+${days} يوم)` : `Bulk extension applied!`);
      setSelectedAcademyIds([]);
      fetchDashboardData(true);
    } catch (err) {
      showToast(isRtl ? "فشل التمديد الجماعي." : "Failed to extend.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const onDeactivateClick = async (id) => {
    if (processingId) return;
    const targetAcademy = academies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');
    
    if (!window.confirm(isRtl ? `تعليق/حظر (${targetName})؟` : 'Deactivate this academy?')) return;

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

  const onActivateClick = async (id) => {
    if (processingId) return;
    const targetAcademy = academies.find(a => a.id === id);
    const targetName = getSafeText(targetAcademy?.name, 'الأكاديمية');

    if (!window.confirm(isRtl ? `إلغاء حظر وتفعيل (${targetName})؟` : 'Activate this academy?')) return;

    setProcessingId(`activate-${id}`);

    try {
      const { error: acadErr } = await supabase.from('academies').update({ is_active: true }).eq('id', id);
      if (acadErr) throw acadErr;

      showToast(isRtl ? `تم تفعيل "${targetName}" بنجاح` : "Activated", "success");
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "فشل تفعيل الأكاديمية." : "Failed to activate.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const onExtendTrialClick = async (id, daysToAdd, isLifetime = false) => {
    if (processingId) return;
    setProcessingId(`extend-${id}`);

    let newDateIso = null;
    if (!isLifetime) {
      const target = academies.find(a => a.id === id);
      const now = new Date();
      const rawEnd = getSafeText(target?.trial_ends_at);
      const currentEnd = rawEnd ? new Date(rawEnd) : now;
      const baseDate = currentEnd > now ? currentEnd : now;
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      newDateIso = baseDate.toISOString();
    } else {
      const lifetimeDate = new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);
      newDateIso = lifetimeDate.toISOString();
    }

    try {
      const { error: acadErr } = await supabase
        .from('academies')
        .update({ trial_ends_at: newDateIso })
        .eq('id', id);
      if (acadErr) throw acadErr;

      showToast(isLifetime ? (isRtl ? "تم منح اشتراك دائم" : "Lifetime granted") : (isRtl ? `تم التمديد +${daysToAdd} يوم` : `+${daysToAdd} Days extended`));
      setExtendModalAcademy(null);
      fetchDashboardData(true);
    } catch (error) {
      showToast(isRtl ? "تعذر التمديد." : "Failed.", "error");
    } finally {
      setProcessingId(null);
    }
  };

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
      a.trial_ends_at ? new Date(getSafeText(a.trial_ends_at)).toLocaleDateString() : "Lifetime"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `academies_page_${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getTrialStatusBadge = (trialEndsAt) => {
    const safeDateStr = getSafeText(trialEndsAt);
    if (!safeDateStr) return { text: isRtl ? 'حساب دائم' : 'Lifetime', color: '#38BDF8' };
    
    const endDate = new Date(safeDateStr);
    if (isNaN(endDate.getTime()) || endDate.getFullYear() > 2090) {
      return { text: isRtl ? 'حساب دائم' : 'Lifetime', color: '#38BDF8' };
    }

    const diffDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: isRtl ? 'منتهية' : 'Expired', color: '#EF4444' };
    return { text: isRtl ? `متبقي ${diffDays} يوم` : `${diffDays}d left`, color: '#10B981' };
  };

  // 🟢 1. تقطيع العناصر المفلترة لعرض عناصر الصفحة الحالية فقط
  const paginatedAcademies = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAcademies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAcademies, currentPage]);

  // 🟢 2. حساب عدد الصفحات بناءً على العناصر المفلترة الفعلية
  const totalPages = Math.ceil(filteredAcademies.length / PAGE_SIZE) || 1;

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl max-w-[90%] text-center ${
          toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {getSafeText(toast.message)}
        </div>
      )}

      {/* الهيدر الرئيسي */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 m-0">
          <ShieldCheck size={24} className="text-amber-400 shrink-0" />
          <span>{isRtl ? 'المنصة العالمية لحلقات القرآن' : 'Global Quran Terminal'}</span>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">Super Admin</span>
        </h1>
        
        <div className="flex items-center gap-2">
          <button onClick={exportToCSV} className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold hover:bg-emerald-900/50 transition-colors">
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button onClick={() => fetchDashboardData(true)} disabled={refreshing} className="bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold hover:bg-slate-700 transition-colors">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {isRtl ? 'مزامنة' : 'Sync'}
          </button>
          {onLogout && <button onClick={onLogout} className="bg-rose-600 hover:bg-rose-700 text-white border-0 px-3.5 py-2 rounded-lg cursor-pointer font-bold text-xs transition-colors">{isRtl ? 'خروج' : 'Logout'}</button>}
        </div>
      </header>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">{isRtl ? 'الأكاديميات المشتركة' : 'Total Academies'}</p>
            <h2 className="text-2xl font-extrabold text-white m-0">{loading ? '...' : totalAcademiesCount}</h2>
          </div>
          <div className="text-slate-400 bg-slate-800 p-2.5 rounded-xl"><Building2 size={24} /></div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">{isRtl ? 'انتظار المراجعة' : 'Pending Verification'}</p>
            <h2 className={`text-2xl font-extrabold m-0 ${pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>{loading ? '...' : pendingCount}</h2>
          </div>
          <div className="text-slate-400 bg-slate-800 p-2.5 rounded-xl"><Clock size={24} /></div>
        </div>

        <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">{isRtl ? 'أكاديميات محظورة / معطلة' : 'Blocked Academies'}</p>
            <h2 className="text-2xl font-extrabold text-rose-500 m-0">{loading ? '...' : blockedCount}</h2>
          </div>
          <div className="bg-rose-950/50 p-2.5 rounded-xl"><AlertTriangle size={24} className="text-rose-500" /></div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">{isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <h2 className="text-2xl font-extrabold text-emerald-400 m-0">{loading ? '...' : `${totalRevenue} EGP`}</h2>
          </div>
          <div className="bg-emerald-950/50 p-2.5 rounded-xl"><FileSpreadsheet size={24} className="text-emerald-400" /></div>
        </div>
      </div>

      {/* قائمة الأكاديميات */}
      <section className="space-y-3">
        {paginatedAcademies.length === 0 ? (
          <EmptyState icon={<Building2 size={36} />} title={isRtl ? "لا توجد نتائج مطابقة" : "No Matching Academies"} description={isRtl ? "جرب تعديل عبارة البحث أو خيار التصفية." : "Try adjusting your filters or query."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedAcademies.map(academy => {
              const isBlocked = !academy.is_active;
              const isSelected = selectedAcademyIds.includes(academy.id);

              return (
                <div 
                  key={academy.id} 
                  className={`relative p-4 rounded-xl border transition-colors ${
                    isSelected ? 'bg-slate-800/90 border-sky-500' : isBlocked ? 'bg-slate-900 border-rose-500/40' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="space-y-1 mb-4">
                    <h3 onClick={() => openAcademyDrawer(academy)} className="text-sm font-bold text-white hover:underline cursor-pointer m-0">
                      {getSafeText(academy.name, 'أكاديمية بدون اسم')}
                    </h3>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/60">
                    
                    {/* 🟢 زر دخول للأكاديمية */}
                    {onSelectAcademy && (
                      <button 
                        onClick={() => onSelectAcademy(academy)} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        {isRtl ? 'دخول للأكاديمية' : 'Enter Academy'}
                      </button>
                    )}

                    <button 
                      onClick={() => openAcademyDrawer(academy)} 
                      className="bg-sky-950/30 border border-sky-500/30 text-sky-400 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye size={14} /> {isRtl ? 'تفاصيل' : 'Details'}
                    </button>

                    <button 
                      onClick={() => setExtendModalAcademy(academy)} 
                      disabled={processingId !== null} 
                      className="bg-slate-800 border border-amber-500/40 text-amber-400 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} /> {isRtl ? 'تمديد' : 'Extend'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
      

      {/* شريط البحث والفلترة والفرز */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
        <div className="relative w-full">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            type="text"
            placeholder={isRtl ? "ابحث باسم الأكاديمية، المالك..." : "Search academy, owner..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pr-10 pl-3 text-white text-xs outline-none focus:border-slate-700"
          />
          {searchQuery && <X size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 cursor-pointer" onClick={() => setSearchQuery('')} />}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 text-white text-xs outline-none cursor-pointer">
            <option value="all">{isRtl ? 'جميع الخطط' : 'All Plans'}</option>
            <option value="expiring_soon">{isRtl ? 'تنتهي خلال 7 أيام' : 'Expiring in 7 Days'}</option>
            <option value="trial">{isRtl ? 'مؤقتة / تجريبية' : 'Trial'}</option>
            <option value="monthly">{isRtl ? 'اشتراك شهري' : 'Monthly'}</option>
            <option value="yearly">{isRtl ? 'اشتراك سنوي' : 'Yearly'}</option>
            <option value="lifetime">{isRtl ? 'حسابات دائمة' : 'Lifetime'}</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 text-white text-xs outline-none cursor-pointer">
            <option value="created_at_desc">{isRtl ? 'الأحدث تسجيلاً' : 'Newest First'}</option>
            <option value="created_at_asc">{isRtl ? 'الأقدم تسجيلاً' : 'Oldest First'}</option>
            <option value="trial_ends_asc">{isRtl ? 'الأقرب انتهاءً' : 'Expiring Soon'}</option>
          </select>
        </div>
      </div>

      {/* شريط الإجراءات الجماعية */}
      {selectedAcademyIds.length > 0 && (
        <div className="bg-slate-900 border border-sky-500/50 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-lg shadow-sky-500/5">
          <div className="flex items-center gap-2.5">
            <span className="bg-sky-500 text-white px-2.5 py-1 rounded-full font-bold text-xs">
              {selectedAcademyIds.length} {isRtl ? 'محدد' : 'Selected'}
            </span>
            <span className="text-slate-300 text-xs">{isRtl ? 'اختر إجراءً لتطبيقه:' : 'Choose action:'}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => handleBulkExtend(30)} disabled={processingId === 'bulk'} className="bg-amber-950/40 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold">
              +30 {isRtl ? 'يوم' : 'Days'}
            </button>
            <button onClick={() => handleBulkStatusChange(true)} disabled={processingId === 'bulk'} className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold">
              {isRtl ? 'تفعيل الجماعي' : 'Bulk Activate'}
            </button>
            <button onClick={() => handleBulkStatusChange(false)} disabled={processingId === 'bulk'} className="bg-rose-600 hover:bg-rose-500 text-white border-0 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold">
              {isRtl ? 'حظر الجماعي' : 'Bulk Block'}
            </button>
            <button onClick={() => setSelectedAcademyIds([])} className="bg-transparent border-0 text-slate-400 cursor-pointer text-xs">
              {isRtl ? 'إلغاء التحديد' : 'Deselect'}
            </button>
          </div>
        </div>
      )}

      {/* شريط التبويبات Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: isRtl ? 'عرض الكل' : 'All', count: totalAcademiesCount },
          { id: 'pending', label: isRtl ? 'طلبات المعلقة' : 'Pending Subscriptions', count: pendingCount },
          { id: 'active', label: isRtl ? 'النشطة' : 'Active', count: activeCount },
          { id: 'blocked', label: isRtl ? 'المحظورة' : 'Blocked', count: blockedCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-0 px-3.5 py-2 rounded-lg cursor-pointer text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-sky-600 font-bold text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="bg-slate-950/40 px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* قائمة الأكاديميات الرئيسية */}
      <section className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-bold text-white m-0">
            {activeTab === 'active' ? (isRtl ? 'الأكاديميات النشطة' : 'Active Academies') :
             activeTab === 'blocked' ? (isRtl ? 'الأكاديميات المحظورة' : 'Blocked Academies') :
             (isRtl ? 'جميع الأكاديميات' : 'All Academies')}
          </h2>

          {filteredAcademies.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="bg-transparent border-0 text-sky-400 cursor-pointer text-xs flex items-center gap-1.5"
            >
              {selectedAcademyIds.length === filteredAcademies.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedAcademyIds.length === filteredAcademies.length ? (isRtl ? 'إلغاء تحديد الكل' : 'Deselect All') : (isRtl ? 'تحديد كل الصفحة' : 'Select All')}
            </button>
          )}
        </div>

        {filteredAcademies.length === 0 ? (
          <EmptyState icon={<Building2 size={36} />} title={isRtl ? "لا توجد نتائج مطابقة" : "No Matching Academies"} description={isRtl ? "جرب تعديل عبارة البحث أو خيار التصفية." : "Try adjusting your filters or query."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAcademies.map(academy => {
              const isBlocked = !academy.is_active;
              const isSelected = selectedAcademyIds.includes(academy.id);

              return (
                <div 
                  key={academy.id} 
                  className={`relative p-4 rounded-xl border transition-colors ${
                    isSelected ? 'bg-slate-800/90 border-sky-500' : isBlocked ? 'bg-slate-900 border-rose-500/40' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div 
                    onClick={() => toggleSelectAcademy(academy.id)}
                    className={`absolute top-4 cursor-pointer z-10 ${isRtl ? 'left-4' : 'right-4'} ${isSelected ? 'text-sky-400' : 'text-slate-500'}`}
                  >
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 
                      onClick={() => openAcademyDrawer(academy)}
                      className="text-sm font-bold text-white hover:underline cursor-pointer m-0"
                    >
                      {getSafeText(academy.name, 'أكاديمية بدون اسم')}
                    </h3>
                    {academy.ownerProfile && (
                      <div className="text-xs text-slate-300 flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        <span>{getSafeText(academy.ownerProfile.full_name)}</span>
                      </div>
                    )}
                    <div className="text-[11px] font-semibold">
                      {isBlocked ? (
                        <span className="text-rose-400">محظورة / معطلة</span>
                      ) : (
                        <span className="text-slate-400">{getTrialStatusBadge(academy.trial_ends_at).text}</span>
                      )}
                    </div>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/60">
                    
                    {/* 🟢 3. زر الدخول للأكاديمية الجديد */}
                    <button 
                      onClick={() => onSelectAcademy && onSelectAcademy(academy.id)} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={14} /> {isRtl ? 'دخول للأكاديمية' : 'Enter Academy'}
                    </button>

                    {academy.ownerProfile?.phone ? (
                      <button 
                        onClick={() => handleWhatsAppClick(academy.ownerProfile.phone, getSafeText(academy.name))}
                        className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-bold flex items-center gap-1"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setPhoneModalData({
                            ownerId: academy.owner_id,
                            academyName: getSafeText(academy.name),
                            currentPhone: getSafeText(academy.ownerProfile?.phone)
                          });
                          setInputPhone(getSafeText(academy.ownerProfile?.phone));
                        }}
                        className="bg-rose-950/30 border border-rose-500/40 text-rose-400 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle size={14} /> + هاتف
                      </button>
                    )}

                    <button 
                      onClick={() => openAcademyDrawer(academy)} 
                      className="bg-sky-950/30 border border-sky-500/30 text-sky-400 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye size={14} /> {isRtl ? 'تفاصيل' : 'Details'}
                    </button>

                    <button 
                      onClick={() => setExtendModalAcademy(academy)} 
                      disabled={processingId !== null} 
                      className="bg-slate-800 border border-amber-500/40 text-amber-400 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} /> {isRtl ? 'تمديد' : 'Extend'}
                    </button>

                    {isBlocked ? (
                      <button onClick={() => onActivateClick(academy.id)} disabled={processingId !== null} className="bg-emerald-600 text-white border-0 p-1.5 rounded-lg cursor-pointer"><Unlock size={14} /></button>
                    ) : (
                      <button onClick={() => onDeactivateClick(academy.id)} disabled={processingId !== null} className="bg-rose-600 text-white border-0 p-1.5 rounded-lg cursor-pointer"><Ban size={14} /></button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* الترقيم */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-sky-600 text-white disabled:bg-slate-950 border-0 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-xs disabled:opacity-50">
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {isRtl ? 'السابقة' : 'Previous'}
            </button>

            <span className="text-slate-300 text-xs font-bold">{isRtl ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>

            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} className="bg-sky-600 text-white disabled:bg-slate-950 border-0 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 text-xs disabled:opacity-50">
              {isRtl ? 'التالية' : 'Next'} {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </section>

      {/* Drawer التفاصيل العميقة */}
      {selectedAcademyDetails && (
        <div className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[3000] flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
          <div className="w-full max-w-md bg-slate-900 h-full border-x border-slate-800 p-6 overflow-y-auto flex flex-col">
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-white text-base font-bold flex items-center gap-2">
                <Building2 className="text-sky-400" size={20} />
                {getSafeText(selectedAcademyDetails.name)}
              </h3>
              <button onClick={() => setSelectedAcademyDetails(null)} className="bg-transparent border-0 text-slate-400 cursor-pointer"><X size={20} /></button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 mb-4 border border-slate-800">
              <p className="m-0 text-xs text-slate-400 mb-1">{isRtl ? 'مالك الأكاديمية:' : 'Academy Owner:'}</p>
              <h4 className="m-0 text-white text-sm font-bold mb-1">{getSafeText(selectedAcademyDetails.ownerProfile?.full_name, 'غير معروف')}</h4>
              <p className="m-0 text-xs text-slate-300 mb-3">{getSafeText(selectedAcademyDetails.ownerProfile?.email)}</p>

              {selectedAcademyDetails.ownerProfile?.phone ? (
                <button
                  onClick={() => handleWhatsAppClick(selectedAcademyDetails.ownerProfile.phone, getSafeText(selectedAcademyDetails.name))}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white border-0 py-2 rounded-lg font-bold text-xs cursor-pointer"
                >
                  <MessageCircle size={18} /> {isRtl ? 'تواصل عبر الواتساب' : 'WhatsApp Chat'}
                </button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 text-xs text-rose-400">لا يوجد رقم هاتف مسجل للمالك</p>
                  <button
                    onClick={() => {
                      setPhoneModalData({
                        ownerId: selectedAcademyDetails.owner_id,
                        academyName: getSafeText(selectedAcademyDetails.name),
                        currentPhone: getSafeText(selectedAcademyDetails.ownerProfile?.phone)
                      });
                      setInputPhone(getSafeText(selectedAcademyDetails.ownerProfile?.phone));
                    }}
                    className="bg-rose-950/40 border border-rose-500/40 text-rose-400 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    + إضافة رقم
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl text-center border border-slate-800">
                <Users size={20} className="text-emerald-400 mx-auto mb-1" />
                <p className="m-0 text-xs text-slate-400">{isRtl ? 'إجمالي الطلاب' : 'Total Students'}</p>
                <h3 className="m-0 mt-1 text-white text-lg font-bold">{academyStatsLoading ? '...' : deepStats.studentsCount}</h3>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl text-center border border-slate-800">
                <BookOpen size={20} className="text-sky-400 mx-auto mb-1" />
                <p className="m-0 text-xs text-slate-400">{isRtl ? 'الحلقات الدراسية' : 'Halaqat Classes'}</p>
                <h3 className="m-0 mt-1 text-white text-lg font-bold">{academyStatsLoading ? '...' : deepStats.halaqatCount}</h3>
              </div>
            </div>

            <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
              <History size={16} className="text-amber-400" /> {isRtl ? 'سجل المدفوعات والاشتراكات' : 'Payment History'}
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2">
              {deepStats.payments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center mt-5">{isRtl ? 'لا يوجد سجل مدفوعات سابق' : 'No prior payment history'}</p>
              ) : (
                deepStats.payments.map(p => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs">
                    <div className="flex justify-between text-white mb-1">
                      <strong>{getSafeText(p.plan_tier, 'خطة')} ({getSafeText(p.plan_duration, 'شهري')})</strong>
                      <span className={getSafeText(p.status) === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
                        {getSafeText(p.status, 'نشط')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{getSafeText(p.price, '0')} {getSafeText(p.currency, 'EGP')}</span>
                      <span>{p.created_at ? new Date(getSafeText(p.created_at)).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal تمديد الاشتراك */}
      {extendModalAcademy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full text-white text-center">
            <h3 className="mb-2 text-base font-bold">{isRtl ? 'تمديد اشتراك الأكاديمية' : 'Extend Subscription'}</h3>
            <p className="text-slate-400 text-xs mb-4">{getSafeText(extendModalAcademy.name)}</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 7)} className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl cursor-pointer font-bold text-xs">+7 {isRtl ? 'أيام' : 'Days'}</button>
              <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 30)} className="bg-slate-800 border border-amber-500/40 text-amber-400 p-2.5 rounded-xl cursor-pointer font-bold text-xs">+30 {isRtl ? 'يوم' : 'Days'}</button>
            </div>

            <button onClick={() => onExtendTrialClick(extendModalAcademy.id, 0, true)} className="w-full bg-sky-600 text-white border-0 p-2.5 rounded-xl cursor-pointer font-bold text-xs mb-3 flex items-center justify-center gap-2">
              <InfinityIcon size={18} /> {isRtl ? 'اشتراك دائم (Lifetime)' : 'Grant Lifetime'}
            </button>

            <button onClick={() => setExtendModalAcademy(null)} className="bg-transparent border-0 text-slate-400 cursor-pointer text-xs">
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Modal إضافة رقم الهاتف */}
      {phoneModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[4000] p-4">
          <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 max-w-sm w-full text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-base font-bold flex items-center gap-2">
                <MessageCircle size={20} className="text-emerald-400" />
                {isRtl ? 'إدخال رقم هاتف المالك' : 'Enter Owner Phone'}
              </h3>
              <button onClick={() => setPhoneModalData(null)} className="bg-transparent border-0 text-slate-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-4">
              {isRtl ? `أدخل رقم هاتف مالك أكاديمية (${getSafeText(phoneModalData.academyName)}) لتفعيل التواصل عبر الواتساب:` : `Enter phone for (${getSafeText(phoneModalData.academyName)}):`}
            </p>

            <div className="mb-5">
              <label className="block text-xs text-slate-300 mb-1.5">{isRtl ? 'رقم الهاتف:' : 'Phone number:'}</label>
              <input
                type="tel"
                placeholder="201000000000"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm outline-none ltr text-left"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSavePhone}
                disabled={processingId === 'save-phone'}
                className="flex-1 bg-emerald-600 text-white border-0 py-2.5 rounded-lg font-bold cursor-pointer text-xs"
              >
                {processingId === 'save-phone' ? '...' : (isRtl ? 'حفظ وتفعيل الواتساب' : 'Save & Enable WhatsApp')}
              </button>
              <button
                onClick={() => setPhoneModalData(null)}
                className="bg-transparent border border-slate-800 text-slate-400 px-3.5 py-2.5 rounded-lg cursor-pointer text-xs"
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

export default AdminDashboard;
