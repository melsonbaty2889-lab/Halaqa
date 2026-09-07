import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import C from '@/theme/colors';

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

  // استخراج ألوان الثيم الديناميكية من C
  const surfaceBg = C.dark?.card || C.dark?.surface || '#0F172A';
  const borderCol = C.dark?.borderInput || C.dark?.border || '#1E293B';
  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#F59E0B';
  const titleColor = C.text?.title || '#FFFFFF';
  const subColor = C.text?.sub || C.text?.muted || '#94A3B8';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-xl p-6 shadow-2xl border max-h-[80vh] flex flex-col transition-all"
        style={{
          backgroundColor: surfaceBg,
          borderColor: borderCol,
          color: titleColor
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b pb-3 mb-4"
          style={{ borderColor: borderCol }}
        >
          <h3 
            id="terms-modal-title"
            className="text-lg font-semibold"
            style={{ color: primaryColor }}
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
            className="rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer active:scale-95"
            style={{ color: subColor }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto space-y-3 text-sm leading-relaxed pe-2 text-start"
          style={{ color: subColor }}
        >
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
        <div 
          className="border-t pt-3 mt-4 flex justify-end"
          style={{ borderColor: borderCol }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 min-h-[44px] cursor-pointer flex items-center justify-center"
            style={{
              backgroundColor: primaryColor,
              color: '#FFFFFF'
            }}
          >
            {t('termsModal.close', 'إغلاق')}
          </button>
        </div>

      </div>
    </div>
  );
}

export default TermsModal;
