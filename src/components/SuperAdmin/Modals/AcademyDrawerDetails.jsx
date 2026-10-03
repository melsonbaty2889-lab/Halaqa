import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  X, 
  MessageCircle, 
  Users, 
  BookOpen, 
  History, 
  Globe, 
  Calendar,
  PhoneCall
} from 'lucide-react';

export default function AcademyDrawerDetails({
  selectedAcademyDetails,
  onClose,
  deepStats,
  academyStatsLoading,
  handleWhatsAppClick,
  setPhoneModalData,
  setInputPhone,
  getSafeText
}) {
  const { t, i18n } = useTranslation();

  if (!selectedAcademyDetails) return null;

  const currentLang = i18n.language || 'ar';
  const isRtl = i18n.dir() === 'rtl';

  const countryName = getSafeText(
    selectedAcademyDetails.country, 
    t('academy.unspecified_country', 'غير محدد')
  );
  
  const createdDate = selectedAcademyDetails.created_at 
    ? new Date(selectedAcademyDetails.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')
    : '';

  return (
    <div className={`fixed inset-0 z-[3000] flex ${isRtl ? 'justify-start' : 'justify-end'} bg-black/80 backdrop-blur-md transition-all duration-300 font-cairo`}>
      <div className="w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300 card-surface border-s border-semantic-borderCard">
        
        {/* الهيدر العلوي */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-semantic-borderCard">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl flex items-center justify-center bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="m-0 text-semantic-textPrimary text-base font-bold leading-tight">
                {getSafeText(selectedAcademyDetails.name)}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-semantic-textSecondary">
                <span className="flex items-center gap-1">
                  <Globe size={12} className="text-semantic-textMuted" />
                  {countryName}
                </span>
                {createdDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-semantic-textMuted" />
                      {createdDate}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            aria-label={t('common.close', 'إغلاق')}
            className="p-2 rounded-lg text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer bg-semantic-surfaceInput"
          >
            <X size={18} />
          </button>
        </div>

        {/* بطاقة المالك والتواصل */}
        <div className="rounded-2xl p-4 mb-5 border border-semantic-borderCard bg-semantic-surfaceInput/40 backdrop-blur-sm transition-all">
          <p className="m-0 text-[11px] font-semibold text-semantic-textSecondary mb-1">
            {t('academy.owner_label', 'مالك الأكاديمية / المجمع:')}
          </p>
          <h4 className="m-0 text-semantic-textPrimary text-sm font-bold mb-0.5">
            {getSafeText(
              selectedAcademyDetails.ownerProfile?.full_name, 
              t('common.unknown', 'غير معروف')
            )}
          </h4>
          <p className="m-0 text-xs text-semantic-textMuted mb-3 break-all font-mono">
            {getSafeText(selectedAcademyDetails.ownerProfile?.email, '-')}
          </p>

          {selectedAcademyDetails.ownerProfile?.phone ? (
            <button
              onClick={() => handleWhatsAppClick(selectedAcademyDetails.ownerProfile.phone, getSafeText(selectedAcademyDetails.name))}
              className="w-full flex items-center justify-center gap-2 border-0 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-[0.98] shadow-md bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <MessageCircle size={16} /> 
              <span>{t('academy.whatsapp_chat', 'تواصل مباشر عبر الواتساب')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-semantic-dangerBg/30 border border-semantic-danger/20">
              <p className="m-0 text-[11px] text-semantic-danger font-medium">
                {t('academy.no_owner_phone', 'لا يوجد رقم هاتف مسجل للمالك')}
              </p>
              <button
                onClick={() => {
                  setPhoneModalData({
                    ownerId: selectedAcademyDetails.owner_id,
                    academyName: getSafeText(selectedAcademyDetails.name),
                    currentPhone: getSafeText(selectedAcademyDetails.ownerProfile?.phone)
                  });
                  setInputPhone(getSafeText(selectedAcademyDetails.ownerProfile?.phone));
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors bg-semantic-dangerBg text-semantic-danger border border-semantic-danger/30 hover:opacity-90"
              >
                <PhoneCall size={13} />
                <span>{t('academy.add_phone', '+ إضافة رقم')}</span>
              </button>
            </div>
          )}
        </div>

        {/* المؤشرات (KPIs) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl text-center border border-semantic-borderCard bg-semantic-surfaceInput/40">
            <div className="p-2 rounded-xl w-fit mx-auto mb-1.5 bg-emerald-500/10 text-emerald-400">
              <Users size={18} />
            </div>
            <p className="m-0 text-[11px] font-medium text-semantic-textSecondary">
              {t('dashboard.total_students', 'إجمالي الطلاب')}
            </p>
            <h3 className="m-0 mt-1 text-semantic-textPrimary text-lg font-extrabold tracking-tight">
              {academyStatsLoading ? '...' : (deepStats?.studentsCount ?? 0)}
            </h3>
          </div>

          <div className="p-3.5 rounded-2xl text-center border border-semantic-borderCard bg-semantic-surfaceInput/40">
            <div className="p-2 rounded-xl w-fit mx-auto mb-1.5 bg-sky-500/10 text-sky-400">
              <BookOpen size={18} />
            </div>
            <p className="m-0 text-[11px] font-medium text-semantic-textSecondary">
              {t('dashboard.halaqat_classes', 'الحلقات الدراسية')}
            </p>
            <h3 className="m-0 mt-1 text-semantic-textPrimary text-lg font-extrabold tracking-tight">
              {academyStatsLoading ? '...' : (deepStats?.halaqatCount ?? 0)}
            </h3>
          </div>
        </div>

        {/* سجل المدفوعات */}
        <h4 className="text-semantic-textPrimary text-xs font-bold mb-3 flex items-center gap-2 tracking-wide uppercase">
          <History size={15} className="text-amber-400" /> 
          <span>{t('academy.payment_history', 'سجل المدفوعات والاشتراكات')}</span>
        </h4>

        <div className="flex-1 overflow-y-auto space-y-2.5 pe-1">
          {!deepStats?.payments || deepStats.payments.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-semantic-borderCard bg-semantic-surfaceInput/20">
              <p className="m-0 text-xs text-semantic-textMuted">
                {t('academy.no_payment_history', 'لا يوجد سجل مدفوعات أو اشتراكات حتى الآن')}
              </p>
            </div>
          ) : (
            deepStats.payments.map((p) => {
              const isActive = getSafeText(p.status) === 'active';
              return (
                <div 
                  key={p.id} 
                  className="p-3 rounded-xl border border-semantic-borderCard bg-semantic-surfaceInput/40 text-xs transition-all hover:border-semantic-borderHover"
                >
                  <div className="flex justify-between items-center text-semantic-textPrimary mb-1.5">
                    <span className="font-bold">
                      {getSafeText(p.plan_tier, t('academy.basic_plan', 'خطة أساسية'))} ({getSafeText(p.plan_duration, t('academy.monthly', 'شهري'))})
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {isActive ? t('common.active', 'نشط') : getSafeText(p.status, t('common.pending', 'معلق'))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-semantic-textSecondary text-[11px] font-mono pt-1 border-t border-semantic-borderCard">
                    <span className="font-semibold text-semantic-textPrimary">
                      {getSafeText(p.price, '0')} {getSafeText(p.currency, 'EGP')}
                    </span>
                    <span>
                      {p.created_at ? new Date(getSafeText(p.created_at)).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US') : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
