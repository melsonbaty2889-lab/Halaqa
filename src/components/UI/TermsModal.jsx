import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Check, Lock, UserCheck, Key, Shield, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Btn from './Btn';

export function TermsModal({ 
  isOpen, 
  onClose, 
  initialTab = 'terms', // 'terms' | 'privacy'
  onAccept, // دالة استدعاء اختيارية عند الضغط على "موافقة وقبول"
  requireAcceptance = false, // هل يتطلب الموافقة الصريحة قبل الإغلاق؟
  isRtl: isRtlProp 
}) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasAgreed, setHasAgreed] = useState(false);

  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (i18n?.dir ? i18n.dir() === 'rtl' : true);

  // تحديث حالة التبويب والموافقة عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setHasAgreed(false);
    }
  }, [isOpen, initialTab]);

  const handleConfirmAction = () => {
    if (onAccept) onAccept(activeTab);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={requireAcceptance ? () => {} : onClose}
      maxWidth={580}
      style={{ padding: 0 }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col h-full text-semantic-textPrimary">
        {/* الهيدر */}
        <div className="flex items-center justify-between border-b border-semantic-borderCard p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-semantic-actionPrimary/10 text-semantic-actionPrimary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 
                id="terms-modal-title"
                className="text-base sm:text-lg font-bold text-semantic-textPrimary m-0"
              >
                {t('termsModal.headerTitle', 'اتفاقية الاستخدام والخصوصية')}
              </h3>
              <p className="text-[11px] text-semantic-textSecondary m-0">
                {t('termsModal.headerSubtitle', 'يرجى قراءة الشروط والسياسات بعناية')}
              </p>
            </div>
          </div>
        </div>

        {/* محول التبويبات (Tab Switcher) */}
        <div className="flex border-b border-semantic-borderCard bg-semantic-surfaceInput/40 p-1.5 gap-1.5 mx-5 mt-4 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              activeTab === 'terms'
                ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border-semantic-borderCard'
                : 'border-transparent text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <FileText size={15} />
            <span>{t('termsModal.termsTitle', 'الشروط والأحكام')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              activeTab === 'privacy'
                ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border-semantic-borderCard'
                : 'border-transparent text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <Lock size={15} />
            <span>{t('termsModal.privacyTitle', 'سياسة الخصوصية')}</span>
          </button>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm leading-relaxed text-semantic-textSecondary text-start custom-scrollbar max-h-[50vh]">
          {activeTab === 'terms' ? (
            <div className="space-y-3.5">
              <p className="font-medium text-semantic-textPrimary leading-normal">
                {t('termsModal.termsWelcome', 'مرحباً بك في منصة الحلقة الذكية. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط التالية:')}
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <UserCheck size={18} className="text-semantic-actionPrimary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">1. صحة البيانات</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.termsRule1', 'التعهد بصحة ودقة البيانات المدخلة عند إنشاء الحساب وتحديثها دورياً.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <Key size={18} className="text-semantic-actionPrimary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">2. أمان الحساب</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.termsRule2', 'الحفاظ على سرية معلومات الحساب وكلمة المرور وعدم مشاركتها مع أطراف أخرى.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <Shield size={18} className="text-semantic-actionPrimary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">3. الملكية الفكرية</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.termsRule3', 'احترام حقوق الملكية الفكرية للمحتوى التعليمي والمناهج والبيانات المرفوعة على المنصة.')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="font-medium text-semantic-textPrimary leading-normal">
                {t('termsModal.privacyWelcome', 'نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لأعلى معايير الأمان العالمية:')}
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <Lock size={18} className="text-semantic-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">1. التشفير والحماية</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.privacyRule1', 'يتم تشفير جميع البيانات الحساسة باستخدام معايير SSL/TLS لحمايتها من أي وصول غير مصرح به.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <ShieldCheck size={18} className="text-semantic-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">2. عدم مشاركة البيانات</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.privacyRule2', 'لا نقوم بمشاركة أو بيع بياناتك الشخصية لأي طرف ثالث لأغراض إعلانية أو تجارية.')}</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-semantic-surfaceInput/30 border border-semantic-borderCard/50">
                  <Bell size={18} className="text-semantic-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-semantic-textPrimary text-xs mb-0.5">3. الاستخدام المصرّح</h4>
                    <p className="text-[11px] leading-relaxed">{t('termsModal.privacyRule3', 'نستخدم بيانات التواصل للتنبيهات والإشعارات التشغيلية المتعلقة بحسابك وحلقاتك فقط.')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* الفوتر وأزرار التحكم */}
        <div className="border-t border-semantic-borderCard p-4 bg-semantic-surfaceInput/20 space-y-3 rounded-b-2xl">
          {requireAcceptance && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-semantic-borderInput text-semantic-actionPrimary focus:ring-semantic-actionPrimary/30 bg-semantic-surfaceInput cursor-pointer"
              />
              <span className="text-xs font-medium text-semantic-textPrimary">
                {t('termsModal.agreeCheckbox', 'قرأت جميع الشروط وأوافق على الالتزام بها')}
              </span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2.5">
            {!requireAcceptance && (
              <Btn variant="ghost" onClick={onClose}>
                {t('termsModal.close', 'إغلاق')}
              </Btn>
            )}

            <Btn
              variant="primary"
              disabled={requireAcceptance && !hasAgreed}
              onClick={handleConfirmAction}
            >
              <Check size={16} />
              <span>{t('termsModal.acceptBtn', 'موافقة ومتابعة')}</span>
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TermsModal;
