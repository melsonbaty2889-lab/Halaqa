import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X } from 'lucide-react';
import { UI } from '@/theme/styles';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[4000] p-4 transition-all duration-300 font-cairo">
      <div className="card-surface border border-semantic-borderCard rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-all space-y-4">
        
        {/* الترويسة */}
        <div className="flex justify-between items-center pb-3 border-b border-semantic-borderCard">
          <h3 className="m-0 text-base font-bold flex items-center gap-2 text-semantic-textPrimary">
            <MessageCircle size={20} className="text-emerald-400" />
            <span>{t('academy.enter_owner_phone', 'إدخال رقم هاتف المالك')}</span>
          </h3>
          <button 
            onClick={onClose} 
            aria-label={t('common.close', 'إغلاق')}
            className="text-semantic-textMuted hover:text-semantic-textPrimary transition-colors cursor-pointer p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* النص التوضيحي */}
        <p className="text-semantic-textSecondary text-xs leading-relaxed">
          {t('academy.enter_phone_description', 'أدخل رقم هاتف مالك أكاديمية ({{academyName}}) لتفعيل التواصل عبر الواتساب:', {
            academyName: getSafeText(phoneModalData.academyName)
          })}
        </p>

        {/* حقل الإدخال */}
        <div>
          <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
            {t('common.phone_number', 'رقم الهاتف:')}
          </label>
          <input
            type="tel"
            placeholder="201000000000"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            dir="ltr"
            className={`${UI.input} font-mono text-left`}
          />
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSave}
            disabled={processingId === 'save-phone'}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold cursor-pointer text-xs transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
          >
            {processingId === 'save-phone' 
              ? '...' 
              : t('academy.save_enable_whatsapp', 'حفظ وتفعيل الواتساب')
            }
          </button>
          
          <button
            onClick={onClose}
            className="bg-transparent border border-semantic-borderInput hover:bg-semantic-surfaceSecondary text-semantic-textSecondary hover:text-semantic-textPrimary px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-colors"
          >
            {t('common.cancel', 'إلغاء')}
          </button>
        </div>

      </div>
    </div>
  );
}
