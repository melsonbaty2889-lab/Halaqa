import React, { useState, useEffect } from 'react';
import { 
  Building2, LogOut, Search, Filter, RefreshCw, 
  CheckCircle, ShieldAlert, AlertTriangle, Layers, Calendar
} from 'lucide-react';

// 1. استدعي الخدمات من src/lib/
import { 
  fetchAdminDashboardData, 
  fetchAcademyDeepDetails, 
  saveOwnerPhone, 
  updateAcademyStatus, 
  extendAcademySubscription, 
  getSafeText 
} from '../../lib/adminDashboardService';

// 2. استدعي المكونات الفرعية والمودالات
import AdminStatsCards from './AdminStatsCards';
import AcademyCard from './AcademyCard';
import AcademyDrawerDetails from './Modals/AcademyDrawerDetails';
import ExtendTrialModal from './Modals/ExtendTrialModal';
import AddPhoneModal from './Modals/AddPhoneModal';

export default function AdminDashboard({ onLogout, isRtl = true, onSelectAcademy }) {
  // البيانات الأساسية
  const [stats, setStats] = useState({
    totalAcademiesCount: 0,
    pendingCount: 0,
    activeCount: 0,
    blockedCount: 0,
    totalRevenue: 0
  });
  const [academies, setAcademies] = useState([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // التحكم والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, active, blocked
  const [sortBy, setSortBy] = useState('created_at_desc'); // created_at_desc, created_at_asc, trial_ends_asc
  const [selectedAcademyIds, setSelectedAcademyIds] = useState([]);

  // الحالات الفرعية للمودالات والدرج
  const [selectedAcademyDetails, setSelectedAcademyDetails] = useState(null);
  const [deepStats, setDeepStats] = useState({ studentsCount: 0, halaqatCount: 0, payments: [] });
  const [academyStatsLoading, setAcademyStatsLoading] = useState(false);
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [phoneModalData, setPhoneModalData] = useState(null);
  const [inputPhone, setInputPhone] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // جلب البيانات الأساسية
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDashboardData({ activeTab, sortBy });
      setStats({
        totalAcademiesCount: data.totalAcademiesCount,
        pendingCount: data.pendingCount,
        activeCount: data.activeCount,
        blockedCount: data.blockedCount,
        totalRevenue: data.totalRevenue
      });
      setPendingSubscriptions(data.pendingSubscriptions);
      setAcademies(data.academies);
    } catch (err) {
      showToast(err.message || 'خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, sortBy]);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // فتح الدرج وجلب التفاصيل العميقة
  const handleOpenDrawer = async (academy) => {
    setSelectedAcademyDetails(academy);
    setAcademyStatsLoading(true);
    try {
      const details = await fetchAcademyDeepDetails(academy.id);
      setDeepStats(details);
    } catch (err) {
      showToast('تعذر جلب تفاصيل الأكاديمية', 'error');
    } finally {
      setAcademyStatsLoading(false);
    }
  };

  // الإجراءات الفردية والجماعية
  const handleStatusToggle = async (academyId, currentStatus) => {
    setProcessingId(academyId);
    try {
      await updateAcademyStatus(academyId, !currentStatus);
      showToast(!currentStatus ? 'تم تفعيل الأكاديمية' : 'تم حظر الأكاديمية', 'success');
      loadData();
    } catch (err) {
      showToast('حدث خطأ أثناء تعديل الحالة', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkStatus = async (isActivate) => {
    if (!selectedAcademyIds.length) return;
    setProcessingId('bulk');
    try {
      await updateAcademyStatus(selectedAcademyIds, isActivate);
      showToast(isActivate ? 'تم تفعيل الأكاديميات المحددة' : 'تم حظر الأكاديميات المحددة', 'success');
      setSelectedAcademyIds([]);
      loadData();
    } catch (err) {
      showToast('خطأ في التنفيذ الجماعي', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExtendSubscription = async (academyId, days, isLifetime = false) => {
    setProcessingId(academyId);
    try {
      await extendAcademySubscription(academyId, days, isLifetime);
      showToast('تم تمديد الاشتراك بنجاح', 'success');
      setExtendModalAcademy(null);
      loadData();
    } catch (err) {
      showToast('فشل تمديد الاشتراك', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSavePhone = async () => {
    if (!phoneModalData || !inputPhone.trim()) return;
    setProcessingId('save-phone');
    try {
      const cleanPhone = await saveOwnerPhone(phoneModalData.ownerId, inputPhone);
      showToast('تم حفظ رقم الهاتف بنجاح', 'success');
      
      // تحديث الهاتف محلياً لتفادي إعادة الجلب
      setAcademies(prev => prev.map(a => 
        a.owner_id === phoneModalData.ownerId 
          ? { ...a, ownerProfile: { ...a.ownerProfile, phone: cleanPhone } } 
          : a
      ));
      if (selectedAcademyDetails && selectedAcademyDetails.owner_id === phoneModalData.ownerId) {
        setSelectedAcademyDetails(prev => ({
          ...prev,
          ownerProfile: { ...prev.ownerProfile, phone: cleanPhone }
        }));
      }
      setPhoneModalData(null);
      setInputPhone('');
    } catch (err) {
      showToast('حدث خطأ في حفظ الرقم', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleWhatsAppClick = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`مرحباً أستاذ/ة، بخصوص أكاديمية (${name}) في منصة مقرأة...`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  // الفلترة بالبحث النصي
  const filteredAcademies = academies.filter(a => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const nameStr = getSafeText(a.name).toLowerCase();
    const ownerNameStr = getSafeText(a.ownerProfile?.full_name).toLowerCase();
    const ownerEmailStr = getSafeText(a.ownerProfile?.email).toLowerCase();
    return nameStr.includes(q) || ownerNameStr.includes(q) || ownerEmailStr.includes(q);
  });

  const toggleSelectAll = () => {
    if (selectedAcademyIds.length === filteredAcademies.length) {
      setSelectedAcademyIds([]);
    } else {
      setSelectedAcademyIds(filteredAcademies.map(a => a.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans dir-rtl">
      
      {/* Toast الإشعارات */}
      {toastMessage && (
        <div className={`fixed bottom-5 left-5 z-[5000] px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all ${
          toastMessage.type === 'error' ? 'bg-rose-900 border-rose-700 text-white' : 'bg-emerald-900 border-emerald-700 text-white'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* الهيدر الرئيسي */}
      <div className="flex justify-between items-center mb-6 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white m-0">{isRtl ? 'لوحة تحكم المدير العام' : 'Super Admin Dashboard'}</h1>
            <p className="text-xs text-slate-400 m-0">{isRtl ? 'إدارة أكاديميات منصة مقراة والاشتراكات' : 'Manage all academies and subscriptions'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700" title={isRtl ? 'تحديث البيانات' : 'Refresh'}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
              <LogOut size={15} /> {isRtl ? 'خروج' : 'Logout'}
            </button>
          )}
        </div>
      </div>

      {/* بطاقات الإحصائيات الأربع */}
      <AdminStatsCards stats={stats} isRtl={isRtl} />

      {/* شريط البحث والفلترة والفرز */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-stretch md:items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        
        {/* حقل البحث */}
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={isRtl ? 'بحث باسم الأكاديمية أو المالك أو البريد...' : 'Search academy, owner, or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* تبويبات التصفية */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button onClick={() => setActiveTab('active')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'active' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              {isRtl ? 'النشطة' : 'Active'}
            </button>
            <button onClick={() => setActiveTab('blocked')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'blocked' ? 'bg-rose-950 text-rose-400' : 'text-slate-400 hover:text-white'}`}>
              {isRtl ? 'المحظورة' : 'Blocked'}
            </button>
          </div>

          {/* قائمة الترتيب والفرز */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="created_at_desc">{isRtl ? 'الأحدث تسجيلاً' : 'Newest First'}</option>
            <option value="created_at_asc">{isRtl ? 'الأقدم تسجيلاً' : 'Oldest First'}</option>
            <option value="trial_ends_asc">{isRtl ? 'الأقرب انتهاءً للتجربة' : 'Trial Ending Soon'}</option>
          </select>
        </div>
      </div>

      {/* شريط الإجراءات الجماعية (Bulk Actions Bar) */}
      {selectedAcademyIds.length > 0 && (
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3 mb-4 flex items-center justify-between gap-2 animate-fadeIn">
          <span className="text-xs text-sky-300 font-bold">
            {isRtl ? `تم تحديد ${selectedAcademyIds.length} أكاديمية` : `Selected ${selectedAcademyIds.length} academies`}
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatus(true)} disabled={processingId === 'bulk'} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
              {isRtl ? 'تفعيل الكل' : 'Activate All'}
            </button>
            <button onClick={() => handleBulkStatus(false)} disabled={processingId === 'bulk'} className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
              {isRtl ? 'حظر الكل' : 'Block All'}
            </button>
          </div>
        </div>
      )}

      {/* عرض الأكاديميات في شبكة Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-sky-500" />
          {isRtl ? 'جاري جلب الأكاديميات...' : 'Loading Academies...'}
        </div>
      ) : filteredAcademies.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          <Building2 size={36} className="mx-auto mb-2 opacity-30" />
          {isRtl ? 'لا يوجد أكاديميات تقتفي هذا البحث أو التصفية.' : 'No academies match your filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAcademies.map((academy) => (
            <AcademyCard
              key={academy.id}
              academy={academy}
              isRtl={isRtl}
              selectedAcademyIds={selectedAcademyIds}
              onToggleSelect={(id) => {
                setSelectedAcademyIds(prev => 
                  prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
                );
              }}
              onOpenDrawer={handleOpenDrawer}
              onStatusToggle={handleStatusToggle}
              onExtendClick={(acad) => setExtendModalAcademy(acad)}
              onWhatsAppClick={handleWhatsAppClick}
              onOpenPhoneModal={(acad) => {
                setPhoneModalData({
                  ownerId: acad.owner_id,
                  academyName: getSafeText(acad.name),
                  currentPhone: getSafeText(acad.ownerProfile?.phone)
                });
                setInputPhone(getSafeText(acad.ownerProfile?.phone));
              }}
              onSelectAcademy={onSelectAcademy}
              processingId={processingId}
              getSafeText={getSafeText}
            />
          ))}
        </div>
      )}

      {/* المودالات والدرج المنبثق */}
      <AcademyDrawerDetails
        selectedAcademyDetails={selectedAcademyDetails}
        onClose={() => setSelectedAcademyDetails(null)}
        isRtl={isRtl}
        deepStats={deepStats}
        academyStatsLoading={academyStatsLoading}
        handleWhatsAppClick={handleWhatsAppClick}
        setPhoneModalData={setPhoneModalData}
        setInputPhone={setInputPhone}
        getSafeText={getSafeText}
      />

      <ExtendTrialModal
        extendModalAcademy={extendModalAcademy}
        onClose={() => setExtendModalAcademy(null)}
        onExtend={handleExtendSubscription}
        isRtl={isRtl}
        getSafeText={getSafeText}
      />

      <AddPhoneModal
        phoneModalData={phoneModalData}
        onClose={() => setPhoneModalData(null)}
        onSave={handleSavePhone}
        inputPhone={inputPhone}
        setInputPhone={setInputPhone}
        processingId={processingId}
        isRtl={isRtl}
        getSafeText={getSafeText}
      />

    </div>
  );
}
