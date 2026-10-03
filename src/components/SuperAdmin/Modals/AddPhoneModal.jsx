import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X } from 'lucide-react';
import { C } from '@/theme/colors';

export default function AddPhoneModal({
  phoneModalData,
  onClose,
  onSave,
  inputPhone,
  setInputPhone,
  processingId,
  getSafeText
}) {
  const { t } = useTranslation();

  if (!phoneModalData) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-[4000] p-4 transition-all duration-300"
      style={{ backgroundColor: 'rgba(7, 11, 17, 0.82)' }}
    >
      <div 
        className="rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl border transition-all"
        style={{ 
          backgroundColor: C?.dark?.surface || '#0A0F1C',
          borderColor: C?.dark?.cardBorder || 'rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* الترويسة */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/60">
          <h3 className="m-0 text-base font-bold flex items-center gap-2">
            <MessageCircle size={20} className="text-emerald-400" />
            <span>{t('academy.enter_owner_phone', 'إدخال رقم هاتف المالك')}</span>
          </h3>
          <button 
            onClick={onClose} 
            aria-label={t('common.close', 'إغلاق')}
            className="bg-transparent border-0 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* النص التوضيحي */}
        <p className="text-slate-400 text-xs mb-4 leading-relaxed">
          {t('academy.enter_phone_description', 'أدخل رقم هاتف مالك أكاديمية ({{academyName}}) لتفعيل التواصل عبر الواتساب:', {
            academyName: getSafeText(phoneModalData.academyName)
          })}
        </p>

        {/* حقل الإدخال */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t('common.phone_number', 'رقم الهاتف:')}
          </label>
          <input
            type="tel"
            placeholder="201000000000"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            dir="ltr"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-white text-sm outline-none transition-all focus:border-emerald-500/50 text-left font-mono"
          />
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={processingId === 'save-phone'}
            className="flex-1 border-0 py-2.5 px-4 rounded-xl font-bold cursor-pointer text-xs transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
            style={{ 
              backgroundColor: C?.emerald?.DEFAULT || '#10B981',
              color: '#FFFFFF'
            }}
          >
            {processingId === 'save-phone' 
              ? '...' 
              : t('academy.save_enable_whatsapp', 'حفظ وتفعيل الواتساب')
            }
          </button>
          
          <button
            onClick={onClose}
            className="bg-transparent border border-slate-800 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors"
          >
            {t('common.cancel', 'إلغاء')}
          </button>
        </div>
      </div>
    </div>
  );
}
