// src/components/Modals/InlineUpgradeModal.jsx
import React from 'react';
import { Sparkles, Check, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getText } from '@/utils/textUtils';

export default function InlineUpgradeModal({
  isOpen,
  onClose,
  academyName,
  tierConfig,
  onNavigateSubscription,
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language?.split('-')[0] || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  if (!isOpen) return null;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        {/* خلفية التوهج */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          aria-label={getText(t, 'common.close', 'إغلاق')}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* أيقونة الترقية */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-5 shadow-inner">
          <Sparkles size={28} />
        </div>

        {/* العناوين */}
        <h3 className="text-xl font-bold text-white mb-2">
          {getText(t, 'upgradeModal.title', 'ترقية خطة الاشتراكات')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          {getText(
            t,
            'upgradeModal.subtitle',
            'وصلت أكاديميتك إلى الحد الأقصى للميزات المتاحة في الخطة الحالية.'
          )}
        </p>

        {/* تفاصيل الخطة الحالية */}
        {tierConfig && (
          <div className="bg-[#0A0F1C] border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-400">
                {getText(t, 'upgradeModal.currentPlan', 'الخطة الحالية')}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {tierConfig.name || academyName}
              </span>
            </div>
            {tierConfig.features && Array.isArray(tierConfig.features) && (
              <ul className="space-y-2 text-xs text-slate-300">
                {tierConfig.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* أزرار التفاعل */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateSubscription}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <span>{getText(t, 'upgradeModal.upgradeBtn', 'ترقية الخطة الآن')}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            {getText(t, 'common.cancel', 'إلغاء')}
          </button>
        </div>
      </div>
    </div>
  );
}
