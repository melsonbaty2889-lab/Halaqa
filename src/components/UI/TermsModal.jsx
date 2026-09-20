/* src/components/UI/TermsModal.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck, FileText, Check, Lock, UserCheck, Key, Shield, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

  // تحديث التبويب النشط عند تغير الـ Props
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setHasAgreed(false);
    }
  }, [isOpen, initialTab]);

  // إغلاق النافذة بزر Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !requireAcceptance) {
      onClose();
    }
  }, [onClose, requireAcceptance]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleConfirmAction = () => {
    if (onAccept) onAccept(activeTab);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-xl rounded-2xl border border-semantic-borderCard bg-semantic-surfaceCard text-semantic-textPrimary shadow-2xl max-h-[85vh] flex flex-col overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-semantic-borderCard p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-semantic-actionPrimaryGlow/10 text-semantic-actionPrimary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 
                id="terms-modal-title"
                className="text-base sm:text-lg font-bold text-semantic-textPrimary"
              >
                {t('termsModal.headerTitle', 'اتفاقية الاستخدام والخصوصية')}
              </h3>
              <p className="text-[11px] text-semantic-textSecondary">
                {t('termsModal.headerSubtitle', 'يرجى قراءة الشروط والسياسات بعناية')}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label={t('termsModal.close', 'إغلاق')}
            className="rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer text-semantic-textSecondary hover:text-semantic-textPrimary hover:bg-semantic-surfaceInput active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-semantic-borderCard bg-semantic-surfaceInput/40 p-1.5 gap-1.5 mx-5 mt-4 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border border-semantic-borderCard'
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <FileText size={15} />
            <span>{t('termsModal.termsTitle', 'الشروط والأحكام')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-semantic-surfaceCard text-semantic-actionPrimary shadow-sm border border-semantic-borderCard'
                : 'text-semantic-textSecondary hover:text-semantic-textPrimary'
            }`}
          >
            <Lock size={15} />
            <span>{t('termsModal.privacyTitle', 'سياسة الخصوصية')}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm leading-relaxed text-semantic-textSecondary text-start custom-scrollbar">
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

        {/* Footer */}
        <div className="border-t border-semantic-borderCard p-4 bg-semantic-surfaceInput/20 space-y-3">
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
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textSecondary transition-all active:scale-95 min-h-[40px] cursor-pointer hover:text-semantic-textPrimary hover:border-semantic-borderHover"
            >
              {t('termsModal.close', 'إغلاق')}
            </button>

            <button
              type="button"
              disabled={requireAcceptance && !hasAgreed}
              onClick={handleConfirmAction}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-semantic-actionPrimary text-white transition-all active:scale-95 min-h-[40px] cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Check size={16} />
              <span>{t('termsModal.acceptBtn', 'موافقة ومتابعة')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TermsModal;
