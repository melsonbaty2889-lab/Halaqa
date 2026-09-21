import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { 
  Trash2, Archive, ArchiveRestore,
  HelpCircle, X, Loader2 
} from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning', // 'danger' | 'warning' | 'info' | 'alert' | 'prompt' | 'secure-delete'
  isLoading = false,
  promptPlaceholder = '',
  requiredConfirmWord = '',
  t = (key, fallback) => fallback,
  lang = 'ar',
  isArabic = true,
  children
}) => {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  const [inputValue, setInputValue] = useState('');

  // المتغيرات البرمجية للتنسيقات
  const cardBg = 'var(--color-surface-card)';
  const inputBg = 'var(--color-surface-input)';
  const borderCol = 'var(--color-border-input)';
  const titleColor = 'var(--color-text-primary)';
  const subColor = 'var(--color-text-secondary)';
  const primaryColor = 'var(--color-action-primary)';
  const dangerColor = 'var(--color-danger)';
  const successColor = 'var(--color-success)';

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || typeof window === 'undefined') return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
      case 'secure-delete':
        return {
          icon: <Trash2 size={22} style={{ color: dangerColor }} />,
          borderIconBg: 'color-mix(in srgb, var(--color-danger) 15%, transparent)',
          borderIconCol: 'color-mix(in srgb, var(--color-danger) 30%, transparent)',
          btnBg: dangerColor,
          btnColor: '#ffffff',
          defaultTitle: t('confirmModal.dangerTitle', 'تأكيد الحذف'),
          defaultConfirmText: t('common.delete', 'حذف')
        };
      case 'info':
        return {
          icon: <ArchiveRestore size={22} style={{ color: successColor }} />,
          borderIconBg: 'color-mix(in srgb, var(--color-success) 15%, transparent)',
          borderIconCol: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
          btnBg: successColor,
          btnColor: '#ffffff',
          defaultTitle: t('confirmModal.restoreTitle', 'تأكيد الاستعادة'),
          defaultConfirmText: t('common.restore', 'استعادة')
        };
      case 'alert':
        return {
          icon: <HelpCircle size={22} style={{ color: primaryColor }} />,
          borderIconBg: 'color-mix(in srgb, var(--color-action-primary) 15%, transparent)',
          borderIconCol: 'color-mix(in srgb, var(--color-action-primary) 30%, transparent)',
          btnBg: primaryColor,
          btnColor: '#ffffff',
          defaultTitle: t('confirmModal.alertTitle', 'تنبيه'),
          defaultConfirmText: t('common.ok', 'حسناً')
        };
      case 'prompt':
        return {
          icon: <HelpCircle size={22} style={{ color: primaryColor }} />,
          borderIconBg: 'color-mix(in srgb, var(--color-action-primary) 15%, transparent)',
          borderIconCol: 'color-mix(in srgb, var(--color-action-primary) 30%, transparent)',
          btnBg: primaryColor,
          btnColor: '#ffffff',
          defaultTitle: t('confirmModal.promptTitle', 'إدخال التفاصيل'),
          defaultConfirmText: t('common.send', 'إرسال')
        };
      case 'warning':
      default:
        return {
          icon: <Archive size={22} style={{ color: primaryColor }} />,
          borderIconBg: 'color-mix(in srgb, var(--color-action-primary) 15%, transparent)',
          borderIconCol: 'color-mix(in srgb, var(--color-action-primary) 30%, transparent)',
          btnBg: primaryColor,
          btnColor: '#ffffff',
          defaultTitle: t('confirmModal.warningTitle', 'تأكيد الإجراء'),
          defaultConfirmText: t('common.confirm', 'تأكيد')
        };
    }
  };

  const variantStyle = getVariantStyles();

  const isConfirmDisabled = isLoading || (
    variant === 'secure-delete' && 
    requiredConfirmWord && 
    inputValue.trim() !== requiredConfirmWord.trim()
  ) || (
    variant === 'prompt' && 
    !inputValue.trim()
  );

  const handleConfirmClick = () => {
    if (isConfirmDisabled) return;
    if (variant === 'prompt') {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  return ReactDom.createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(7, 11, 17, 0.8)',
        backdropFilter: 'blur(6px)'
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div 
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderCol}`,
          borderRadius: 20,
          maxWidth: 440,
          width: '100%',
          padding: 24,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          textAlign: 'start',
          color: titleColor
        }}
      >
        
        {/* زر الإغلاق العلوي */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label={t('common.close', 'إغلاق')}
          style={{
            position: 'absolute',
            top: 16,
            left: isRtl ? 16 : 'auto',
            right: isRtl ? 'auto' : 16,
            background: 'none',
            border: 'none',
            color: subColor,
            cursor: 'pointer',
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12
          }}
        >
          <X size={20} />
        </button>

        {/* رأس التنبيه والأيقونة */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div 
            style={{ 
              padding: 12, 
              borderRadius: 16, 
              border: `1px solid ${variantStyle.borderIconCol}`,
              backgroundColor: variantStyle.borderIconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {variantStyle.icon}
          </div>
          <div style={{ flex: 1, paddingRight: isRtl ? 0 : 32, paddingLeft: isRtl ? 32 : 0 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: titleColor }}>
              {title || variantStyle.defaultTitle}
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8125rem', color: subColor, lineHeight: 1.5 }}>
              {message || t('confirmModal.defaultMessage', 'هل أنت متأكد من الاستمرار في هذا الإجراء؟')}
            </p>
          </div>
        </div>

        {/* حقل مدخلات إضافي للنوافذ التي تطلب نصاً */}
        {variant === 'prompt' && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={promptPlaceholder || t('common.typeHere', 'اكتب هنا...')}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.8125rem',
                border: `1px solid ${borderCol}`,
                backgroundColor: inputBg,
                color: titleColor,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {variant === 'secure-delete' && requiredConfirmWord && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '0.75rem', color: subColor, marginBottom: 6 }}>
              {t('confirmModal.typeWordToConfirm', 'اكتب كلمة')} <strong style={{ color: dangerColor }}>"{requiredConfirmWord}"</strong> {t('confirmModal.toConfirm', 'لتأكيد الإجراء:')}
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.8125rem',
                border: `1px solid ${borderCol}`,
                backgroundColor: inputBg,
                color: titleColor,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* محتوى إضافي مخصص */}
        {children && <div style={{ marginBottom: 16 }}>{children}</div>}

        {/* الأزرار */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
          {variant !== 'alert' && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 12,
                fontSize: '0.8125rem',
                fontWeight: 700,
                border: `1px solid ${borderCol}`,
                backgroundColor: 'transparent',
                color: titleColor,
                cursor: 'pointer',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cancelText || t('common.cancel', 'إلغاء')}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isConfirmDisabled}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: 'none',
              backgroundColor: variantStyle.btnBg,
              color: variantStyle.btnColor,
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer',
              opacity: isConfirmDisabled ? 0.5 : 1,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'ui-spin 0.8s linear infinite' }} />
            ) : (
              confirmText || variantStyle.defaultConfirmText
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
