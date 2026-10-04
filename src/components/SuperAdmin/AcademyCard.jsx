import React from 'react';
import { ExternalLink, MessageCircle, PlusCircle, Check } from 'lucide-react';

export default function AcademyCard({
  academy,
  selectedAcademyIds = [],
  onToggleSelect,
  onOpenDrawer,
  onStatusToggle,
  onExtendClick,
  onWhatsAppClick,
  onOpenPhoneModal,
  onSelectAcademy,
  processingId,
  getSafeText
}) {
  const isSelected = Array.isArray(selectedAcademyIds) && selectedAcademyIds.includes(academy.id);

  const resolveSafeText = (val, defaultVal = '') => {
    if (typeof getSafeText === 'function') {
      return getSafeText(val, defaultVal);
    }
    if (!val) return defaultVal;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.ar || val.en || defaultVal;
    return String(val);
  };

  const academyName = resolveSafeText(academy?.name, 'غير معروف');
  const ownerName = resolveSafeText(academy?.ownerProfile?.full_name, 'غير معروف');
  const complexName = resolveSafeText(academy?.complex_name || academy?.metadata?.complex_name, '');

  // 1. استخراج أحدث اشتراك من المصفوفة المرفقة
  const subs = Array.isArray(academy?.saas_subscriptions) ? academy.saas_subscriptions : (academy?.subscriptions || []);
  const activeSub = subs.length > 0 ? subs[0] : (typeof subs === 'object' ? subs : null);

  // 2. البحث عن تاريخ الانتهاء بجميع مسارات التجميع
  const expiryDate = 
    activeSub?.expires_at || 
    academy?.expires_at || 
    activeSub?.trial_ends_at || 
    academy?.trial_ends_at || 
    null;

  // 3. تحديد نوع الفعالية (هل هو اشتراك أم تجربة مجانية)
  const isTrial = !activeSub?.expires_at && !academy?.expires_at && Boolean(activeSub?.trial_ends_at || academy?.trial_ends_at);

  // 4. التسمية المناسبة
  const expiryLabel = isTrial ? 'انتهاء التجربة:' : 'انتهاء الاشتراك:';

  const handleEnterAcademy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof onSelectAcademy === 'function') {
      onSelectAcademy(academy);
    }
    window.dispatchEvent(new CustomEvent('select-admin-academy', { detail: academy }));
  };

  return (
    <div className={`card-surface p-3 sm:p-4 rounded-xl transition-all relative border font-cairo ${
      isSelected 
        ? 'border-sky-500 ring-1 ring-sky-500/50' 
        : academy?.is_active 
          ? 'border-semantic-borderCard' 
          : 'border-semantic-danger/40 bg-semantic-dangerBg/10'
    }`} dir="rtl">
      
      {/* رأس البطاقة */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 font-bold text-sm shrink-0 select-none">
            {academyName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="m-0 text-semantic-textPrimary font-bold text-sm truncate">
                {academyName}
              </h3>
              {academy?.is_active ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-normal shrink-0">
                  نشط
                </span>
              ) : (
                <span className="bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/20 text-[10px] px-2 py-0.5 rounded-full font-normal shrink-0">
                  محظور
                </span>
              )}
            </div>
            
            <p className="m-0 text-[11px] text-semantic-textSecondary mt-0.5 truncate">
              <span className="text-semantic-textMuted">المالك:</span> {ownerName}
            </p>
            {complexName && (
              <p className="m-0 text-[11px] text-semantic-textMuted mt-0.5 truncate">
                <span>المجمع:</span> {complexName}
              </p>
            )}
          </div>
        </div>

        {/* Checkbox */}
        <button
          type="button"
          onClick={() => typeof onToggleSelect === 'function' && onToggleSelect(academy.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
            isSelected 
              ? 'bg-sky-500 border-sky-500 text-white' 
              : 'border-semantic-borderInput bg-semantic-surfaceInput hover:border-semantic-borderHover'
          }`}
          aria-label="تحديد"
        >
          {isSelected && <Check size={12} strokeWidth={3} />}
        </button>
      </div>

      {/* تفاصيل التواريخ */}
      <div className="bg-semantic-surfaceInput/60 rounded-lg p-2.5 mb-3 text-[11px] sm:text-xs border border-semantic-borderInput space-y-1">
        <div className="flex justify-between items-center text-semantic-textSecondary">
          <span>تاريخ التسجيل:</span>
          <span className="text-semantic-textPrimary ltr font-medium">
            {academy?.created_at ? new Date(academy.created_at).toLocaleDateString('ar-EG') : '-'}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-semantic-textSecondary">
          <span>{expiryLabel}</span>
          <span className={`font-semibold ltr ${expiryDate && new Date(expiryDate) < new Date() ? 'text-semantic-danger' : 'text-semantic-success'}`}>
            {expiryDate ? new Date(expiryDate).toLocaleDateString('ar-EG') : '-'}
          </span>
        </div>
      </div>

      {/* شريط الأزرار والإجراءات */}
      <div className="space-y-2 pt-2 border-t border-semantic-borderCard">
        <button
          type="button"
          onClick={handleEnterAcademy}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-lg cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <ExternalLink size={14} /> دخول للأكاديمية
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => typeof onOpenDrawer === 'function' && onOpenDrawer(academy)}
            className="flex-1 bg-semantic-surfaceInput hover:bg-semantic-surfaceSecondary text-semantic-textPrimary py-1.5 px-1 text-[11px] font-medium border border-semantic-borderInput rounded-lg transition-colors text-center truncate"
          >
            التفاصيل
          </button>

          <button
            type="button"
            onClick={() => typeof onExtendClick === 'function' && onExtendClick(academy)}
            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 py-1.5 px-1 text-[11px] font-semibold flex items-center justify-center gap-1 rounded-lg transition-colors truncate"
          >
            <PlusCircle size={12} className="shrink-0" />
            <span className="truncate">تمديد</span>
          </button>

          {academy?.ownerProfile?.phone ? (
            <button
              type="button"
              onClick={() => typeof onWhatsAppClick === 'function' && onWhatsAppClick(academy.ownerProfile.phone, academyName)}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center shrink-0"
              title="تواصل واتساب"
            >
              <MessageCircle size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => typeof onOpenPhoneModal === 'function' && onOpenPhoneModal(academy)}
              className="bg-semantic-surfaceInput text-semantic-textMuted border border-semantic-borderInput p-1.5 rounded-lg cursor-pointer hover:text-semantic-textPrimary transition-colors flex items-center justify-center shrink-0"
              title="إضافة رقم هاتف"
            >
              <MessageCircle size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => typeof onStatusToggle === 'function' && onStatusToggle(academy.id, academy.is_active)}
            disabled={processingId === academy.id}
            className={`flex-1 py-1.5 px-1 text-[11px] font-bold border rounded-lg cursor-pointer transition-colors text-center truncate ${
              academy?.is_active 
                ? 'bg-semantic-dangerBg text-semantic-danger border-semantic-danger/30 hover:opacity-90' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {processingId === academy.id ? '...' : (academy?.is_active ? 'حظر' : 'تفعيل')}
          </button>
        </div>
      </div>

    </div>
  );
}
