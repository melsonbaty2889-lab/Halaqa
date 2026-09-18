import React, { useEffect, useState } from 'react';
import { 
  Trash2, Archive, ArchiveRestore,
  HelpCircle, X, Loader2 
} from 'lucide-react';
import C from '@/theme/colors';

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

  // إعادة ضبط المدخلات عند فتح أو إغلاق النافذة
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // إغلاق النافذة عند الضغط على زر Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // استخراج الألوان القياسية المعتمدة من ملف C
  const bgMain = C?.dark?.bg || '#0F172A';
  const bgSurface = C?.dark?.surface || '#1E293B';
  const bgCard = C?.dark?.card || '#334155';
  const borderCol = C?.dark?.borderInput || C?.inputs?.border || '#334155';
  const titleColor = C?.text?.title || '#F8FAFC';
  const subColor = C?.text?.sub || C?.text?.muted || '#94A3B8';

  const errorColor = C?.error?.DEFAULT || '#EF4444';
  const successColor = C?.emerald?.DEFAULT || C?.success?.DEFAULT || '#10B981';
  const primaryColor = C?.amber?.DEFAULT || C?.primary?.DEFAULT || '#F59E0B';

  // تحديد أنماط الأيقونات والأزرار والنصوص الافتراضية
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
      case 'secure-delete':
        return {
          icon: <Trash2 size={22} style={{ color: errorColor }} />,
          bgIcon: C?.dark?.card,
          borderIcon: errorColor,
          btnBg: errorColor,
          btnText: titleColor,
          defaultTitle: t('confirmModal.dangerTitle', 'تأكيد الحذف'),
          defaultConfirmText: t('common.delete', 'حذف')
        };
      case 'info':
        return {
          icon: <ArchiveRestore size={22} style={{ color: successColor }} />,
          bgIcon: C?.dark?.card,
          borderIcon: successColor,
          btnBg: successColor,
          btnText: bgMain,
          defaultTitle: t('confirmModal.restoreTitle', 'تأكيد الاستعادة'),
          defaultConfirmText: t('common.restore', 'استعادة')
        };
      case 'alert':
        return {
          icon: <HelpCircle size={22} style={{ color: primaryColor }} />,
          bgIcon: C?.dark?.card,
          borderIcon: primaryColor,
          btnBg: primaryColor,
          btnText: bgMain,
          defaultTitle: t('confirmModal.alertTitle', 'تنبيه'),
          defaultConfirmText: t('common.ok', 'حسناً')
        };
      case 'prompt':
        return {
          icon: <HelpCircle size={22} style={{ color: primaryColor }} />,
          bgIcon: C?.dark?.card,
          borderIcon: primaryColor,
          btnBg: primaryColor,
          btnText: bgMain,
          defaultTitle: t('confirmModal.promptTitle', 'إدخال التفاصيل'),
          defaultConfirmText: t('common.send', 'إرسال')
        };
      case 'warning':
      default:
        return {
          icon: <Archive size={22} style={{ color: primaryColor }} />,
          bgIcon: C?.dark?.card,
          borderIcon: primaryColor,
          btnBg: primaryColor,
          btnText: bgMain,
          defaultTitle: t('confirmModal.warningTitle', 'تأكيد الإجراء'),
          defaultConfirmText: t('common.confirm', 'تأكيد')
        };
    }
  };

  const styles = getVariantStyles();

  // التحقق من تفعيل زر التأكيد
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all"
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative transition-all text-start"
        style={{
          backgroundColor: bgSurface,
          borderColor: borderCol
        }}
      >
        {/* زر الإغلاق العلوي */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label={t('common.close', 'إغلاق')}
          className={`absolute top-4 p-2 rounded-xl cursor-pointer border-0 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
            isRtl ? 'left-4' : 'right-4'
          }`}
          style={{
            backgroundColor: 'transparent',
            color: subColor
          }}
        >
          <X size={20} />
        </button>

        {/* رأس التنبيه والأيقونة */}
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-2xl border shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: styles.bgIcon,
              borderColor: styles.borderIcon
            }}
          >
            {styles.icon}
          </div>
          <div className={`flex-1 ${isRtl ? 'pe-6' : 'ps-6'}`}>
            <h3 className="text-base font-bold" style={{ color: titleColor }}>
              {title || styles.defaultTitle}
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: subColor }}>
              {message || t('confirmModal.defaultMessage', 'هل أنت متأكد من الاستمرار في هذا الإجراء؟')}
            </p>
          </div>
        </div>

        {/* حقل مدخلات إضافي للنوافذ التي تطلب نصاً */}
        {variant === 'prompt' && (
          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={promptPlaceholder || t('common.typeHere', 'اكتب هنا...')}
              className="w-full p-3 rounded-xl text-xs border outline-none transition-all"
              style={{
                backgroundColor: bgCard,
                borderColor: borderCol,
                color: titleColor
              }}
            />
          </div>
        )}

        {variant === 'secure-delete' && requiredConfirmWord && (
          <div className="space-y-2">
            <p className="text-[11px]" style={{ color: subColor }}>
              {t('confirmModal.typeWordToConfirm', 'اكتب كلمة')} <strong style={{ color: errorColor }}>"{requiredConfirmWord}"</strong> {t('confirmModal.toConfirm', 'لتأكيد الإجراء:')}
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 rounded-xl text-xs border outline-none transition-all"
              style={{
                backgroundColor: bgCard,
                borderColor: borderCol,
                color: titleColor
              }}
            />
          </div>
        )}

        {/* محتوى إضافي مخصص */}
        {children && <div className="pt-1">{children}</div>}

        {/* الأزرار */}
        <div className="flex items-center gap-3 pt-2">
          {variant !== 'alert' && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: borderCol,
                color: titleColor
              }}
            >
              {cancelText || t('common.cancel', 'إلغاء')}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isConfirmDisabled}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-0 shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
            style={{
              backgroundColor: styles.btnBg,
              color: styles.btnText,
              opacity: isConfirmDisabled ? 0.5 : 1,
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
            ) : (
              confirmText || styles.defaultConfirmText
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
