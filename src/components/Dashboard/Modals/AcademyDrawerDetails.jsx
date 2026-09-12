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
import { C } from '@/theme/colors';

export default function AcademyDrawerDetails({
  selectedAcademyDetails,
  onClose,
  isRtl,
  deepStats,
  academyStatsLoading,
  handleWhatsAppClick,
  setPhoneModalData,
  setInputPhone,
  getSafeText
}) {
  const { t, i18n } = useTranslation();

  if (!selectedAcademyDetails) return null;

  // تنسيق التاريخ والبلد بناءً على اللغة الحالية
  const currentLang = i18n.language || 'ar';
  const countryName = getSafeText(
    selectedAcademyDetails.country, 
    t('academy.unspecified_country', 'غير محدد')
  );
  
  const createdDate = selectedAcademyDetails.created_at 
    ? new Date(selectedAcademyDetails.created_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')
    : '';

  return (
    <div 
      className={`fixed inset-0 z-[3000] flex ${isRtl ? 'justify-start' : 'justify-end'} backdrop-blur-md transition-all duration-300`}
      style={{ backgroundColor: 'rgba(7, 11, 17, 0.82)' }}
    >
      <div 
        className="w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl transition-transform duration-300"
        style={{ 
          backgroundColor: C?.dark?.bg || '#070B11',
          borderInlineStart: `1px solid ${C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'}`
        }}
      >
        {/* الهيدر العلوي */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#38BDF8' }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="m-0 text-white text-base font-bold leading-tight">
                {getSafeText(selectedAcademyDetails.name)}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Globe size={12} className="text-slate-500" />
                  {countryName}
                </span>
                {createdDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" />
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
            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* بطاقة المالك والتواصل */}
        <div 
          className="rounded-2xl p-4 mb-5 border backdrop-blur-sm transition-all"
          style={{ 
            backgroundColor: C?.dark?.surface || '#0A0F1C',
            borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <p className="m-0 text-[11px] font-semibold text-slate-400 mb-1">
            {t('academy.owner_label', 'مالك الأكاديمية / المجمع:')}
          </p>
          <h4 className="m-0 text-white text-sm font-bold mb-0.5">
            {getSafeText(
              selectedAcademyDetails.ownerProfile?.full_name, 
              t('common.unknown', 'غير معروف')
            )}
          </h4>
          <p className="m-0 text-xs text-slate-400 mb-3 break-all font-mono">
            {getSafeText(selectedAcademyDetails.ownerProfile?.email, '-')}
          </p>

          {selectedAcademyDetails.ownerProfile?.phone ? (
            <button
              onClick={() => handleWhatsAppClick(selectedAcademyDetails.ownerProfile.phone, getSafeText(selectedAcademyDetails.name))}
              className="w-full flex items-center justify-center gap-2 border-0 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-[0.98] shadow-md"
              style={{ 
                backgroundColor: C?.emerald?.DEFAULT || '#10B981',
                color: '#FFFFFF'
              }}
              aria-label={t('academy.whatsapp_chat', 'تواصل مباشر عبر الواتساب')}
            >
              <MessageCircle size={16} /> 
              <span>{t('academy.whatsapp_chat', 'تواصل مباشر عبر الواتساب')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20">
              <p className="m-0 text-[11px] text-rose-400 font-medium">
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
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#FB7185',
                  border: '1px solid rgba(244, 63, 94, 0.3)'
                }}
              >
                <PhonePlus size={13} />
                <span>{t('academy.add_phone', '+ إضافة رقم')}</span>
              </button>
            </div>
          )}
        </div>

        {/* المؤشرات (KPIs) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div 
            className="p-3.5 rounded-2xl text-center border backdrop-blur-sm"
            style={{ 
              backgroundColor: C?.dark?.surface || '#0A0F1C',
              borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="p-2 rounded-xl w-fit mx-auto mb-1.5 bg-emerald-500/10 text-emerald-400">
              <Users size={18} />
            </div>
            <p className="m-0 text-[11px] font-medium text-slate-400">
              {t('dashboard.total_students', 'إجمالي الطلاب')}
            </p>
            <h3 className="m-0 mt-1 text-white text-lg font-extrabold tracking-tight">
              {academyStatsLoading ? '...' : (deepStats?.studentsCount ?? 0)}
            </h3>
          </div>

          <div 
            className="p-3.5 rounded-2xl text-center border backdrop-blur-sm"
            style={{ 
              backgroundColor: C?.dark?.surface || '#0A0F1C',
              borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="p-2 rounded-xl w-fit mx-auto mb-1.5 bg-sky-500/10 text-sky-400">
              <BookOpen size={18} />
            </div>
            <p className="m-0 text-[11px] font-medium text-slate-400">
              {t('dashboard.halaqat_classes', 'الحلقات الدراسية')}
            </p>
            <h3 className="m-0 mt-1 text-white text-lg font-extrabold tracking-tight">
              {academyStatsLoading ? '...' : (deepStats?.halaqatCount ?? 0)}
            </h3>
          </div>
        </div>

        {/* سجل المدفوعات */}
        <h4 className="text-white text-xs font-bold mb-3 flex items-center gap-2 tracking-wide uppercase">
          <History size={15} className="text-amber-400" /> 
          <span>{t('academy.payment_history', 'سجل المدفوعات والاشتراكات')}</span>
        </h4>

        <div className="flex-1 overflow-y-auto space-y-2.5 pe-1">
          {!deepStats?.payments || deepStats.payments.length === 0 ? (
            <div 
              className="p-6 text-center rounded-2xl border border-dashed"
              style={{ 
                backgroundColor: 'rgba(10, 15, 28, 0.4)',
                borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <p className="m-0 text-xs text-slate-500">
                {t('academy.no_payment_history', 'لا يوجد سجل مدفوعات أو اشتراكات حتى الآن')}
              </p>
            </div>
          ) : (
            deepStats.payments.map((p) => {
              const isActive = getSafeText(p.status) === 'active';
              return (
                <div 
                  key={p.id} 
                  className="p-3 rounded-xl border text-xs transition-all hover:border-slate-700"
                  style={{ 
                    backgroundColor: C?.dark?.surface || '#0A0F1C',
                    borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="flex justify-between items-center text-white mb-1.5">
                    <span className="font-bold">
                      {getSafeText(p.plan_tier, t('academy.basic_plan', 'خطة أساسية'))} ({getSafeText(p.plan_duration, t('academy.monthly', 'شهري'))})
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {isActive ? t('common.active', 'نشط') : getSafeText(p.status, t('common.pending', 'معلق'))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono pt-1 border-t border-slate-800/50">
                    <span className="font-semibold text-slate-300">
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
