import React from 'react';
import { Building2, X, MessageCircle, Users, BookOpen, History } from 'lucide-react';

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
  if (!selectedAcademyDetails) return null;

  return (
    <div className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[3000] flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
      <div className="w-full max-w-md bg-slate-900 h-full border-x border-slate-800 p-6 overflow-y-auto flex flex-col">
        
        <div className="flex justify-between items-center mb-5">
          <h3 className="m-0 text-white text-base font-bold flex items-center gap-2">
            <Building2 className="text-sky-400" size={20} />
            {getSafeText(selectedAcademyDetails.name)}
          </h3>
          <button onClick={onClose} className="bg-transparent border-0 text-slate-400 cursor-pointer"><X size={20} /></button>
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
  );
}
