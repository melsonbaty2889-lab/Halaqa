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

  // المتغيرات البرمجية لتنسيقات الألوان الآمنة
  const cardBg = 'var(--color-surface-card)';
  const inputBg = 'var(--color-surface-input)';
  const borderCol = 'var(--color-border-input)';
  const titleColor = 'var(--color-text-primary)';
  const subColor = 'var(--color-text-secondary)';
  const primaryColor = 'var(--color-action-primary)';
  const successColor = 'var(--color-success)';

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
      style={{ padding: 0, maxWidth: 580 }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', height: '100%', color: titleColor }}>
        {/* الهيدر */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${borderCol}`, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 12, backgroundColor: 'color-mix(in srgb, var(--color-action-primary) 12%, transparent)', color: primaryColor }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 
                id="terms-modal-title"
                style={{ fontSize: '1rem', fontWeight: 700, color: titleColor, margin: 0 }}
              >
                {t('termsModal.headerTitle', 'اتفاقية الاستخدام والخصوصية')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: subColor, margin: 0 }}>
                {t('termsModal.headerSubtitle', 'يرجى قراءة الشروط والسياسات بعناية')}
              </p>
            </div>
          </div>
        </div>

        {/* محول التبويبات (Tab Switcher) */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${borderCol}`, backgroundColor: inputBg, padding: 6, gap: 6, margin: '16px 20px 0 20px', borderRadius: 12 }}>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              border: activeTab === 'terms' ? `1px solid ${borderCol}` : '1px solid transparent',
              backgroundColor: activeTab === 'terms' ? cardBg : 'transparent',
              color: activeTab === 'terms' ? primaryColor : subColor,
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={15} />
            <span>{t('termsModal.termsTitle', 'الشروط والأحكام')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              border: activeTab === 'privacy' ? `1px solid ${borderCol}` : '1px solid transparent',
              backgroundColor: activeTab === 'privacy' ? cardBg : 'transparent',
              color: activeTab === 'privacy' ? primaryColor : subColor,
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={15} />
            <span>{t('termsModal.privacyTitle', 'سياسة الخصوصية')}</span>
          </button>
        </div>

        {/* المحتوى القابل للتمرير */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.8125rem', lineHeight: 1.6, color: subColor, textAlign: 'start', maxHeight: '50vh' }}>
          {activeTab === 'terms' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontWeight: 600, color: titleColor, margin: 0 }}>
                {t('termsModal.termsWelcome', 'مرحباً بك في منصة الحلقة الذكية. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط التالية:')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <UserCheck size={18} style={{ color: primaryColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>1. صحة البيانات</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.termsRule1', 'التعهد بصحة ودقة البيانات المدخلة عند إنشاء الحساب وتحديثها دورياً.')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <Key size={18} style={{ color: primaryColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>2. أمان الحساب</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.termsRule2', 'الحفاظ على سرية معلومات الحساب وكلمة المرور وعدم مشاركتها مع أطراف أخرى.')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <Shield size={18} style={{ color: primaryColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>3. الملكية الفكرية</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.termsRule3', 'احترام حقوق الملكية الفكرية للمحتوى التعليمي والمناهج والبيانات المرفوعة على المنصة.')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontWeight: 600, color: titleColor, margin: 0 }}>
                {t('termsModal.privacyWelcome', 'نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لأعلى معايير الأمان العالمية:')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <Lock size={18} style={{ color: successColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>1. التشفير والحماية</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.privacyRule1', 'يتم تشفير جميع البيانات الحساسة باستخدام معايير SSL/TLS لحمايتها من أي وصول غير مصرح به.')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <ShieldCheck size={18} style={{ color: successColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>2. عدم مشاركة البيانات</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.privacyRule2', 'لا نقوم بمشاركة أو بيع بياناتك الشخصية لأي طرف ثالث لأغراض إعلانية أو تجارية.')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, backgroundColor: inputBg, border: `1px solid ${borderCol}` }}>
                  <Bell size={18} style={{ color: successColor, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontWeight: 700, color: titleColor, fontSize: '0.75rem', margin: '0 0 2px 0' }}>3. الاستخدام المصرّح</h4>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>{t('termsModal.privacyRule3', 'نستخدم بيانات التواصل للتنبيهات والإشعارات التشغيلية المتعلقة بحسابك وحلقاتك فقط.')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* الفوتر وأزرار التحكم */}
        <div style={{ borderTop: `1px solid ${borderCol}`, padding: 16, backgroundColor: inputBg, display: 'flex', flexDirection: 'column', gap: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
          {requireAcceptance && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                style={{ width: 16, height: 16, borderRadius: 4, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: titleColor }}>
                {t('termsModal.agreeCheckbox', 'قرأت جميع الشروط وأوافق على الالتزام بها')}
              </span>
            </label>
          )}

          <div style={{ display: 'flex', itemsAlign: 'center', justifyContent: 'flex-end', gap: 10 }}>
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
