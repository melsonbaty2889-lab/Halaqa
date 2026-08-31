// src/components/UI/ConfirmModal.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Archive, ArchiveRestore, Trash2, X } from 'lucide-react';

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

  // تحديد الأيقونة والألوان حسب نوع الإجراء
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-400" />,
          bgIcon: 'bg-rose-500/10 border-rose-500/20',
          btnConfirm: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
        };
      case 'info':
        return {
          icon: <ArchiveRestore className="w-6 h-6 text-emerald-400" />,
          bgIcon: 'bg-emerald-500/10 border-emerald-500/20',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
        };
      case 'warning':
      default:
        return {
          icon: <Archive className="w-6 h-6 text-sky-400" />,
          bgIcon: 'bg-sky-500/10 border-sky-500/20',
          btnConfirm: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" dir={i18n.dir()}>
      <div className="bg-dark-card border border-appBorder-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* زر الإغلاق العلوي */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 left-4 sm:left-auto sm:right-4 p-1.5 text-appText-sub hover:text-appText-main rounded-xl hover:bg-dark-input transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس التنبيه والأيقونة */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl border ${styles.bgIcon} flex-shrink-0`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-appText-main">
              {title || t('common.confirm_action', 'تأكيد الإجراء')}
            </h3>
            <p className="text-xs text-appText-sub mt-1">
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
            className="flex-1 py-2.5 px-4 bg-dark-input hover:bg-appBorder-input/50 text-appText-sub hover:text-appText-main rounded-xl text-xs font-bold transition-colors"
          >
            {cancelText || t('common.cancel', 'إلغاء')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${styles.btnConfirm}`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
