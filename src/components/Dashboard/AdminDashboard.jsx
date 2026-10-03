import React, { useState, useEffect } from 'react';
import { 
  Building2, LogOut, Search, RefreshCw, 
  CheckCircle, CreditCard, FileText, ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';

import { 
  fetchAdminDashboardData, 
  fetchAcademyDeepDetails, 
  saveOwnerPhone, 
  updateAcademyStatus, 
  extendAcademySubscription, 
  getSafeText 
} from '@/lib/adminDashboardService';

import { supabase } from '@/lib/supabase';
import { UI } from '@/theme/styles';

import AdminStatsCards from './AdminStatsCards';
import AcademyCard from './AcademyCard';
import AcademyDrawerDetails from './Modals/AcademyDrawerDetails';
import ExtendTrialModal from './Modals/ExtendTrialModal';
import AddPhoneModal from './Modals/AddPhoneModal';

export default function AdminDashboard({ onLogout, isRtl = true, onSelectAcademy }) {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'blocked' | 'pending_subscriptions'
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [selectedAcademyIds, setSelectedAcademyIds] = useState([]);

  const [selectedAcademyDetails, setSelectedAcademyDetails] = useState(null);
  const [deepStats, setDeepStats] = useState({ studentsCount: 0, halaqatCount: 0, payments: [] });
  const [academyStatsLoading, setAcademyStatsLoading] = useState(false);
  const [extendModalAcademy, setExtendModalAcademy] = useState(null);
  const [phoneModalData, setPhoneModalData] = useState(null);
  const [inputPhone, setInputPhone] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDashboardData({ activeTab, sortBy });
      setStats({
        totalAcademiesCount: data.totalAcademiesCount || 0,
        pendingCount: data.pendingCount || 0,
        activeCount: data.activeCount || 0,
        blockedCount: data.blockedCount || 0,
        totalRevenue: data.totalRevenue || 0
      });
      setPendingSubscriptions(data.pendingSubscriptions || []);
      setAcademies(data.academies || []);
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
    setToastMessage({ text: getSafeText(text), type });
    setTimeout(() => setToastMessage(null), 3500);
  };

    // 🎯 تفعيل طلب الاشتراك المعلق
  const handleApproveSubscription = async (sub) => {
    setProcessingId(sub.id);
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      
      // تحديد مدة الاشتراك والقيمة الموحدة للـ tier
      const isYearly = sub.plan_duration === 'yearly' || sub.plan_tier === 'yearly';
      const safeDuration = isYearly ? 'yearly' : 'monthly';

      if (isYearly) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const { error } = await supabase
        .from('saas_subscriptions')
        .update({
          status: 'active',
          plan_tier: safeDuration,       // توحيد القيم لمنع مخالفة constraint
          plan_duration: safeDuration,   // توحيد القيم لمنع مخالفة constraint
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      showToast('تم تفعيل اشتراك الأكاديمية بنجاح!', 'success');
      loadData();
    } catch (err) {
      showToast('خطأ أثناء التفعيل: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // 🎯 رفض طلب الاشتراك
  const handleRejectSubscription = async (sub) => {
    const reason = prompt('يرجى كتابة سبب رفض الطلب:');
    if (!reason) return;

    setProcessingId(sub.id);
    try {
      const { error } = await supabase
        .from('saas_subscriptions')
        .update({
          status: 'canceled',
          metadata: { ...(sub.metadata || {}), rejection_reason: reason },
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      showToast('تم رفض طلب الاشتراك', 'info');
      loadData();
    } catch (err) {
      showToast('خطأ أثناء الرفض: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

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
    const cleanPhone = String(phone).replace(/\D/g, '');
    const msg = encodeURIComponent(`مرحباً أستاذ/ة، بخصوص أكاديمية (${getSafeText(name)}) في منصة مقرأة...`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const filteredAcademies = academies.filter(a => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const nameStr = getSafeText(a.name).toLowerCase();
    const ownerNameStr = getSafeText(a.ownerProfile?.full_name).toLowerCase();
    const ownerEmailStr = getSafeText(a.ownerProfile?.email).toLowerCase();
    return nameStr.includes(q) || ownerNameStr.includes(q) || ownerEmailStr.includes(q);
  });

  return (
    <div className="min-h-screen bg-semantic-bgPage text-semantic-textPrimary p-4 md:p-6 font-cairo">
      
      {/* Toast Message */}
      {toastMessage && (
        <div className={`fixed bottom-5 left-5 z-[5000] px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all ${
          toastMessage.type === 'error' ? 'bg-semantic-dangerBg border-semantic-danger text-semantic-danger' : 'bg-semantic-successBg border-semantic-successBorder text-semantic-success'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6 card-surface p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-semantic-textPrimary m-0">{isRtl ? 'لوحة تحكم المدير العام' : 'Super Admin Dashboard'}</h1>
            <p className="text-xs text-semantic-textSecondary m-0">{isRtl ? 'إدارة أكاديميات منصة مقراة والاشتراكات' : 'Manage all academies and subscriptions'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 card-surface hover:border-semantic-borderHover rounded-lg text-semantic-textSecondary transition-colors" title={isRtl ? 'تحديث البيانات' : 'Refresh'}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-1.5 bg-semantic-dangerBg hover:opacity-90 text-semantic-danger border border-semantic-danger/30 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer">
              <LogOut size={15} /> {isRtl ? 'خروج' : 'Logout'}
            </button>
          )}
        </div>
      </div>

      <AdminStatsCards stats={stats} isRtl={isRtl} />

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-stretch md:items-center card-surface p-3 rounded-xl">
        
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-3 text-semantic-textMuted" />
          <input
            type="text"
            placeholder={isRtl ? 'بحث باسم الأكاديمية أو المالك أو البريد...' : 'Search academy, owner, or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${UI.input} pr-9`}
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex bg-semantic-surfaceInput p-1 rounded-lg border border-semantic-borderInput text-xs">
            <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'all' ? 'bg-semantic-surfaceCard text-semantic-textPrimary' : 'text-semantic-textSecondary hover:text-semantic-textPrimary'}`}>
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button onClick={() => setActiveTab('active')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'active' ? 'bg-semantic-successBg text-semantic-success' : 'text-semantic-textSecondary hover:text-semantic-textPrimary'}`}>
              {isRtl ? 'النشطة' : 'Active'}
            </button>
            <button onClick={() => setActiveTab('blocked')} className={`px-3 py-1 rounded-md font-medium transition-colors ${activeTab === 'blocked' ? 'bg-semantic-dangerBg text-semantic-danger' : 'text-semantic-textSecondary hover:text-semantic-textPrimary'}`}>
              {isRtl ? 'المحظورة' : 'Blocked'}
            </button>
            <button onClick={() => setActiveTab('pending_subscriptions')} className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'pending_subscriptions' ? 'bg-amber-950/60 text-amber-400' : 'text-semantic-textSecondary hover:text-semantic-textPrimary'}`}>
              <CreditCard size={14} />
              {isRtl ? 'طلبات معلقة' : 'Pending Subscriptions'}
              {pendingSubscriptions.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {pendingSubscriptions.length}
                </span>
              )}
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-semantic-surfaceInput border border-semantic-borderInput rounded-lg px-2.5 py-2 text-xs text-semantic-textSecondary outline-none cursor-pointer focus:border-semantic-actionPrimary"
          >
            <option value="created_at_desc">{isRtl ? 'الأحدث تسجيلاً' : 'Newest First'}</option>
            <option value="created_at_asc">{isRtl ? 'الأقدم تسجيلاً' : 'Oldest First'}</option>
            <option value="trial_ends_asc">{isRtl ? 'الأقرب انتهاءً للتجربة' : 'Trial Ending Soon'}</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedAcademyIds.length > 0 && activeTab !== 'pending_subscriptions' && (
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3 mb-4 flex items-center justify-between gap-2 animate-fade-in">
          <span className="text-xs text-sky-300 font-bold">
            {isRtl ? `تم تحديد ${selectedAcademyIds.length} أكاديمية` : `Selected ${selectedAcademyIds.length} academies`}
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatus(true)} disabled={processingId === 'bulk'} className="bg-semantic-success hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all">
              {isRtl ? 'تفعيل الكل' : 'Activate All'}
            </button>
            <button onClick={() => handleBulkStatus(false)} disabled={processingId === 'bulk'} className="bg-semantic-danger hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all">
              {isRtl ? 'حظر الكل' : 'Block All'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-20 text-semantic-textMuted text-xs">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-semantic-actionPrimary" />
          {isRtl ? 'جاري جلب البيانات...' : 'Loading Data...'}
        </div>
      ) : activeTab === 'pending_subscriptions' ? (
        pendingSubscriptions.length === 0 ? (
          <div className="card-surface p-12 text-center text-semantic-textMuted text-xs space-y-2">
            <CheckCircle size={36} className="mx-auto text-semantic-success/40" />
            <div className="text-sm font-bold text-semantic-textPrimary">لا توجد طلبات اشتراك معلقة حالياً</div>
            <p>تم تفعيل أو مراجعة كافة الطلبات بنجاح.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingSubscriptions.map((sub) => {
              const receiptUrl = sub.metadata?.receipt_url;
              const academyName = getSafeText(sub.academies?.name) || 'أكاديمية غير محددة';
              const planDuration = getSafeText(sub.plan_duration) === 'yearly' ? 'سنوي' : 'شهري';
              const priceText = getSafeText(sub.price);
              const currencyText = getSafeText(sub.currency);
              const gatewayText = getSafeText(sub.payment_gateway);
              const refText = getSafeText(sub.metadata?.transaction_ref);

              return (
                <div key={sub.id} className="card-surface p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-semantic-borderHover transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-sky-400">
                        {academyName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        قيد المراجعة
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-semantic-textSecondary">
                      <div>الخطة: <strong className="text-semantic-textPrimary">{planDuration}</strong></div>
                      <div>المبلغ: <strong className="text-semantic-textPrimary">{priceText} {currencyText}</strong></div>
                      <div>بوابة الدفع: <strong className="text-semantic-textPrimary">{gatewayText}</strong></div>
                      {refText && (
                        <div>المرجع: <strong className="text-semantic-textPrimary font-mono">{refText}</strong></div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-semantic-borderCard">
                    {receiptUrl ? (
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-semantic-surfaceInput hover:bg-semantic-surfaceSecondary text-sky-400 border border-semantic-borderInput transition-all"
                      >
                        <FileText size={15} />
                        معاينة الإشعار
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-semantic-textMuted italic">بدون إشعار</span>
                    )}

                    <button
                      onClick={() => handleRejectSubscription(sub)}
                      disabled={processingId === sub.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-semantic-danger bg-semantic-dangerBg border border-semantic-danger/30 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <XCircle size={15} />
                      رفض
                    </button>

                    <button
                  onClick={() => handleApproveSubscription(sub)}
                 disabled={processingId === sub.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md"
             >
             {processingId === sub.id ? <RefreshCw className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
              تفعيل الرخصة
               </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredAcademies.length === 0 ? (
        <div className="card-surface p-12 text-center text-semantic-textMuted text-xs">
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

      {/* Modals & Drawers */}
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
