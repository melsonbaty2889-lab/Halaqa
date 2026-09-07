import React from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Trash2, X, Loader2 } from 'lucide-react';
import C from '@/theme/colors';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning', // 'warning' | 'danger' | 'info'
  isLoading = false
}) => {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const currentLang = i18n.language || 'ar';
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : ['ar', 'ur'].includes(cleanLang);

  // استخراج الألوان القياسية من كائن C
  const mainBg = C.dark?.bg || '#0F172A';
  const surfaceBg = C.dark?.surface || '#1E293B';
  const borderCol = C.dark?.borderInput || C.inputs?.border || '#334155';
  const titleColor = C.text?.title || '#F8FAFC';
  const subColor = C.text?.sub || C.text?.muted || '#94A3B8';

  const errorColor = C.error?.DEFAULT || '#EF4444';
  const successColor = C.emerald?.DEFAULT || C.success?.DEFAULT || '#10B981';
  const primaryColor = C.amber?.DEFAULT || C.primary?.DEFAULT || '#38BDF8';

  // تحديد الأيقونة والألوان حسب نوع الإجراء
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 size={24} style={{ color: errorColor }} />,
          bgIcon: `${errorColor}1A`,
          borderIcon: `${errorColor}33`,
          btnBg: errorColor,
          btnText: titleColor
        };
      case 'info':
        return {
          icon: <ArchiveRestore size={24} style={{ color: successColor }} />,
          bgIcon: `${successColor}1A`,
          borderIcon: `${successColor}33`,
          btnBg: successColor,
          btnText: mainBg
        };
      case 'warning':
      default:
        return {
          icon: <Archive size={24} style={{ color: primaryColor }} />,
          bgIcon: `${primaryColor}1A`,
          borderIcon: `${primaryColor}33`,
          btnBg: primaryColor,
          btnText: mainBg
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className="border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative transition-all"
        style={{
          backgroundColor: surfaceBg,
          borderColor: borderCol
        }}
      >
        {/* زر الإغلاق العلوي */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label={t('common.close', 'إغلاق')}
          className="absolute top-4 p-2 rounded-xl cursor-pointer border-0 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{
            [isRtl ? 'left' : 'right']: '1rem',
            backgroundColor: 'transparent',
            color: subColor
          }}
        >
          <X size={20} />
        </button>

        {/* رأس التنبيه والأيقونة */}
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-2xl border shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: styles.bgIcon,
              borderColor: styles.borderIcon
            }}
          >
            {styles.icon}
          </div>
          <div className="flex-1 pe-6">
            <h3 className="text-base font-bold" style={{ color: titleColor }}>
              {title || t('common.confirm_action', 'تأكيد الإجراء')}
            </h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: subColor }}>
              {message || t('common.confirm_message', 'هل أنت تأكد من الاستمرار في هذا الإجراء؟')}
            </p>
          </div>
        </div>

        {/* أزرار اتخاذ القرار */}
        <div className="flex items-center gap-3 pt-2">
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

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-0 shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
            style={{
              backgroundColor: styles.btnBg,
              color: styles.btnText,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
            ) : (
              confirmText || t('common.confirm', 'تأكيد')
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
