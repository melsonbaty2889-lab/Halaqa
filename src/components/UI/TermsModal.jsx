/* src/components/UI/TermsModal.jsx */
import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TermsModal({ 
  isOpen, 
  onClose, 
  contentType = 'terms', 
  isRtl: isRtlProp 
}) {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (i18n?.dir ? i18n.dir() === 'rtl' : true);

  const isTerms = contentType === 'terms';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary max-h-[80vh] flex flex-col transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-semantic-borderCard pb-3 mb-4">
          <h3 
            id="terms-modal-title"
            className="text-lg font-bold text-semantic-actionPrimary"
          >
            {isTerms 
              ? t('termsModal.termsTitle', 'الشروط والأحكام')
              : t('termsModal.privacyTitle', 'سياسة الخصوصية')
            }
          </h3>
          <button 
            type="button"
            onClick={onClose}
            aria-label={t('termsModal.close', 'إغلاق')}
            className="rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer active:scale-95 text-semantic-textSecondary hover:text-semantic-textPrimary hover:bg-semantic-surfaceInput"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-3 text-sm leading-relaxed pe-2 text-start text-semantic-textSecondary">
          {isTerms ? (
            <>
              <p>{t('termsModal.termsWelcome', 'مرحباً بك في منصة الحلقة الذكية. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط التالية:')}</p>
              <p>{t('termsModal.termsRule1', '1. التعهد بصحة البيانات المدخلة عند إنشاء الحساب.')}</p>
              <p>{t('termsModal.termsRule2', '2. الحفاظ على سرية معلومات الحساب وكلمة المرور.')}</p>
              <p>{t('termsModal.termsRule3', '3. احترام حقوق الملكية الفكرية للمحتوى التعليمي والمناهج المرفوعة.')}</p>
            </>
          ) : (
            <>
              <p>{t('termsModal.privacyWelcome', 'نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لأعلى معايير الأمان:')}</p>
              <p>{t('termsModal.privacyRule1', '1. يتم تشفير جميع البيانات باستخدام معايير SSL لحمايتها.')}</p>
              <p>{t('termsModal.privacyRule2', '2. لا نقوم بمشاركة أو بيع بياناتك الشخصية لأي طرف ثالث لأغراض إعلانية.')}</p>
              <p>{t('termsModal.privacyRule3', '3. نستخدم بريدك الإلكتروني للتواصل والتنبيهات المتعلقة بحسابك فقط.')}</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-semantic-borderCard pt-4 mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-semantic-actionPrimary text-white transition-all active:scale-95 min-h-[44px] cursor-pointer flex items-center justify-center hover:opacity-95 shadow-md"
          >
            {t('termsModal.close', 'إغلاق')}
          </button>
        </div>

      </div>
    </div>
  );
}

export default TermsModal;
