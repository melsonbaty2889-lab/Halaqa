/* src/components/UI/EmptyState.jsx */
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionText, 
  onAction,
  actionIcon: ActionIcon,
  isRtl: isRtlProp,
  variant = 'default' // 'default' أو 'dashed'
}) {
  const { t, i18n } = useTranslation();

  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : (i18n?.dir ? i18n.dir() === 'rtl' : (typeof document !== 'undefined' && document.dir === 'rtl') || i18n?.language?.startsWith('ar'));

  const isDashed = variant === 'dashed';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl text-center w-full my-3 transition-all bg-semantic-surfaceCard border border-semantic-borderCard ${
        isDashed ? 'border-dashed max-w-md mx-auto' : ''
      }`}
    >
      {/* الأيقونة */}
      <div className="mb-3.5 flex items-center justify-center rounded-full p-3 bg-semantic-actionPrimary/10 text-semantic-actionPrimary">
        {Icon ? (
          React.isValidElement(Icon) ? Icon : <Icon size={36} className="text-semantic-actionPrimary" />
        ) : (
          <span className="text-3xl select-none">📂</span>
        )}
      </div>

      {/* العنوان */}
      <h3 className="text-sm sm:text-base font-bold mb-1 text-semantic-textPrimary">
        {title || t('common.noData', 'لا توجد بيانات متاحة')}
      </h3>

      {/* الوصف */}
      {description && (
        <p className="text-xs leading-relaxed mb-4 max-w-xs sm:max-w-sm text-semantic-textSecondary">
          {description}
        </p>
      )}

      {/* زر الإجراء */}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionText}
          className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md bg-semantic-actionPrimary text-white hover:bg-semantic-actionPrimary/90 active:scale-95 min-h-[40px] mt-1"
        >
          {ActionIcon && <ActionIcon size={16} />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
